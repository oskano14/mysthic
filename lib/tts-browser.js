// TTS 100 % navigateur : le moteur Kokoro (le moteur local de voicebox),
// reconstruit côté client. La synthèse se fait sur l'appareil du visiteur —
// aucune dépendance à Google / ElevenLabs / à un serveur.
//
// Chaîne : texte FR -> phonèmes IPA (espeak-ng WASM) -> tokenizer Kokoro ->
// modèle Kokoro ONNX (ff_siwis) -> WAV. Modèle et voix téléchargés une seule
// fois puis mis en cache par le navigateur (Cache API).
//
// La synthèse est STREAMÉE phrase par phrase : la lecture commence dès la
// première phrase prête pendant que les suivantes se génèrent en arrière-plan.
//
// ⚠️ Module à n'utiliser que côté client (imports dynamiques dans le navigateur).

const KOKORO_MODEL = "onnx-community/Kokoro-82M-v1.0-ONNX";
const KOKORO_VOICE = "ff_siwis"; // voix française
const KOKORO_DTYPE = "q8"; // ~86 Mo ; "q4" (~40 Mo) plus léger, "fp32" meilleure qualité
const SAMPLE_RATE = 24000;
const MAX_PHONEME_CHARS = 400; // marge sous la limite ~510 tokens de Kokoro
const MAX_SENTENCE_CHARS = 200; // coupe les phrases trop longues pour démarrer vite

let _ttsPromise = null;
let _espeakFactoryPromise = null;

// Les builds Kokoro (auto-suffisant) et espeak-ng (emscripten) sont des modules
// WASM chargés HORS du bundler, directement depuis /public/vendor : webpack ne
// sait pas résoudre leurs `new URL(..., import.meta.url)`, et natifs ils
// résolvent leur .wasm relativement à leur URL. D'où les imports webpackIgnore.

// Charge (une fois) le modèle Kokoro via le build navigateur de kokoro-js.
// onProgress reçoit les événements de téléchargement de transformers.js.
export function loadEngine(onProgress) {
  if (!_ttsPromise) {
    _ttsPromise = import(/* webpackIgnore: true */ "/vendor/kokoro.web.js")
      .then(({ KokoroTTS }) =>
        KokoroTTS.from_pretrained(KOKORO_MODEL, {
          dtype: KOKORO_DTYPE,
          device: "wasm", // universel ; WebGPU possible plus tard
          progress_callback: onProgress,
        })
      )
      .catch((err) => {
        _ttsPromise = null; // permet de réessayer après un échec
        throw err;
      });
  }
  return _ttsPromise;
}

function getEspeakFactory() {
  if (!_espeakFactoryPromise) {
    _espeakFactoryPromise = import(
      /* webpackIgnore: true */ "/vendor/espeak-ng.js"
    ).then((m) => m.default || m);
  }
  return _espeakFactoryPromise;
}

// Texte français -> chaîne de phonèmes IPA (le wasm est servi depuis /public).
async function phonemizeFR(text) {
  const ESpeakNg = await getEspeakFactory();
  const espeak = await ESpeakNg({
    locateFile: (file) =>
      file.endsWith(".wasm") ? "/vendor/espeak-ng.wasm" : file,
    arguments: [
      "--phonout",
      "out",
      "--sep= ",
      "-q",
      "--ipa=3",
      "-v",
      "fr",
      text,
    ],
  });
  return espeak.FS.readFile("out", { encoding: "utf8" })
    .replace(/\s+/g, " ")
    .trim();
}

// Découpe les phonèmes sous la limite de tokens, sans jamais couper un mot.
function chunkPhonemes(phon, maxChars = MAX_PHONEME_CHARS) {
  const words = phon.split(" ");
  const chunks = [];
  let cur = "";
  for (const w of words) {
    if (cur && cur.length + 1 + w.length > maxChars) {
      chunks.push(cur);
      cur = w;
    } else {
      cur = cur ? `${cur} ${w}` : w;
    }
  }
  if (cur) chunks.push(cur);
  return chunks;
}

// Découpe le texte en phrases en conservant les positions dans le texte
// d'origine (pour le surlignage karaoké). Les phrases trop longues sont
// recoupées sur un espace afin de démarrer la lecture plus vite.
function splitSentences(text) {
  const sentences = [];
  let start = 0;
  const isEnd = (ch) => ".!?…".includes(ch);
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const atNewline = ch === "\n";
    const atTerminator =
      isEnd(ch) && (i + 1 >= text.length || /\s/.test(text[i + 1]));
    const tooLong = i - start >= MAX_SENTENCE_CHARS && ch === " ";
    if (atNewline || atTerminator || tooLong) {
      let end = i + 1;
      const seg = text.slice(start, end);
      if (seg.trim().length > 0) sentences.push({ text: seg, start, end });
      while (end < text.length && /\s/.test(text[end])) end++;
      start = end;
      i = end - 1;
    }
  }
  if (start < text.length) {
    const seg = text.slice(start);
    if (seg.trim().length > 0)
      sentences.push({ text: seg, start, end: text.length });
  }
  return sentences;
}

// Float32 [-1,1] -> Blob WAV PCM 16 bits.
function encodeWav(samples, sampleRate) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const writeStr = (offset, str) => {
    for (let i = 0; i < str.length; i++)
      view.setUint8(offset + i, str.charCodeAt(i));
  };
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, samples.length * 2, true);
  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }
  return new Blob([view], { type: "audio/wav" });
}

// Synthétise une phrase -> Float32Array (recoupée si besoin sous la limite).
async function synthSentence(tts, sentence) {
  const phonemes = await phonemizeFR(sentence);
  if (!phonemes) return new Float32Array(0);

  const pchunks = chunkPhonemes(phonemes);
  const parts = [];
  const silence = new Float32Array(Math.round(SAMPLE_RATE * 0.06));
  for (let i = 0; i < pchunks.length; i++) {
    const { input_ids } = tts.tokenizer(pchunks[i], { truncation: true });
    const audio = await tts.generate_from_ids(input_ids, {
      voice: KOKORO_VOICE,
    });
    parts.push(audio.audio);
    if (i < pchunks.length - 1) parts.push(silence);
  }
  const total = parts.reduce((n, a) => n + a.length, 0);
  const combined = new Float32Array(total);
  let off = 0;
  for (const a of parts) {
    combined.set(a, off);
    off += a.length;
  }
  return combined;
}

// Alignement karaoké local à une phrase (estimation linéaire sur sa durée).
function localAlignment(sentence, durationSec) {
  const characters = sentence.split("");
  const denom = Math.max(1, characters.length);
  const character_start_times_seconds = characters.map(
    (_, i) => (i / denom) * durationSec
  );
  return { characters, character_start_times_seconds };
}

// Générateur : produit une phrase audio à la fois, prête à être jouée.
// Chaque item : { blob, start, end, duration, alignment }.
export async function* streamSentencesFR(text, { onProgress } = {}) {
  const tts = await loadEngine(onProgress);
  const sentences = splitSentences(text);
  for (const s of sentences) {
    const f32 = await synthSentence(tts, s.text);
    if (f32.length === 0) continue;
    const duration = f32.length / SAMPLE_RATE;
    yield {
      blob: encodeWav(f32, SAMPLE_RATE),
      start: s.start,
      end: s.end,
      duration,
      alignment: localAlignment(s.text, duration),
    };
  }
}
