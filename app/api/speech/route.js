import { NextResponse } from "next/server";

// Voix UNIQUE : Google Cloud TTS, voix française féminine.
// (Aucun secours ElevenLabs — c'était la voix masculine d'origine.)
// Si Google n'est pas configuré / échoue -> 502 -> le front bascule sur la voix
// système du navigateur.

// Voix féminines FR : fr-FR-Neural2-A / -C / -E, fr-FR-Wavenet-A / -C.
const GOOGLE_VOICE = process.env.GOOGLE_TTS_VOICE || "fr-FR-Neural2-A";
const GOOGLE_PITCH = parseFloat(process.env.GOOGLE_TTS_PITCH ?? "0");
const GOOGLE_RATE = parseFloat(process.env.GOOGLE_TTS_RATE ?? "0.9");

function escapeXml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function generateGoogleTTS(text, apiKey) {
  // SSML avec marqueurs pour le minutage mot-à-mot (surlignage karaoké).
  const words = text.split(/(\s+)/);
  let ssml = "<speak>";
  let currentPos = 0;
  for (let i = 0; i < words.length; i++) {
    const token = words[i];
    if (token.trim().length > 0) {
      ssml += `<mark name="${currentPos}"/>${escapeXml(token)}`;
    } else {
      ssml += token;
    }
    currentPos += token.length;
  }
  ssml += "</speak>";

  const res = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: { ssml },
        voice: { languageCode: "fr-FR", name: GOOGLE_VOICE, ssmlGender: "FEMALE" },
        audioConfig: {
          audioEncoding: "MP3",
          pitch: GOOGLE_PITCH,
          speakingRate: GOOGLE_RATE,
        },
        enableTimePointing: ["SSML_MARK"],
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Google TTS HTTP ${res.status}: ${err}`);
  }
  const data = await res.json();

  // Timepoints (mots) -> alignement par caractère (format attendu par le front).
  const character_start_times_seconds = new Array(text.length).fill(-1);
  let lastTime = 0;
  if (data.timepoints) {
    for (const pt of data.timepoints) {
      const idx = parseInt(pt.markName, 10);
      if (!isNaN(idx) && idx >= 0 && idx < text.length) {
        character_start_times_seconds[idx] = pt.timeSeconds;
      }
    }
  }
  for (let i = 0; i < text.length; i++) {
    if (character_start_times_seconds[i] !== -1) {
      lastTime = character_start_times_seconds[i];
    } else {
      character_start_times_seconds[i] = lastTime;
    }
  }

  return {
    audio_base64: data.audioContent,
    mime: "audio/mpeg",
    alignment: {
      characters: text.split(""),
      character_start_times_seconds,
    },
  };
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
  }

  const { text } = body;
  if (!text || typeof text !== "string") {
    return NextResponse.json({ error: "Le texte à lire est requis." }, { status: 400 });
  }

  if (process.env.GOOGLE_TTS_API_KEY) {
    try {
      const data = await generateGoogleTTS(text, process.env.GOOGLE_TTS_API_KEY);
      return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
    } catch (err) {
      console.error("Google TTS a échoué:", err);
    }
  }

  return NextResponse.json(
    { error: "Voix Google non configurée. Basculement sur la voix système." },
    { status: 502 }
  );
}
