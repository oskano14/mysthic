import { NextResponse } from "next/server";

// NOTE : le moteur TTS principal (Kokoro/voicebox) tourne désormais dans le
// navigateur, côté client (voir lib/tts-browser.js). Cette route ne sert plus
// que de secours cloud OPTIONNEL, uniquement si des clés API sont configurées.
// Elle reste volontairement légère (aucun modèle, aucune dépendance lourde)
// pour rester compatible avec les fonctions serverless de Vercel.

async function generateElevenLabs(text, apiKey) {
  const voiceId = process.env.ELEVENLABS_VOICE_ID || "XB0fDUnXU5pow0Jex86P";
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        text: text.slice(0, 2500),
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.6,
          similarity_boost: 0.9,
          style: 0.0,
          use_speaker_boost: true,
        },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`ElevenLabs HTTP ${res.status}: ${err}`);
  }
  return await res.json();
}

async function generateGoogleTTS(text, apiKey) {
  // Construire le SSML avec des marqueurs pour extraire le minutage
  const words = text.split(/(\s+)/);
  let ssml = "<speak>";
  let currentPos = 0;
  for (let i = 0; i < words.length; i++) {
    const token = words[i];
    if (token.trim().length > 0) {
      ssml += `<mark name="${currentPos}"/>${token}`;
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
        voice: { languageCode: "fr-FR", name: "fr-FR-Neural2-A" },
        audioConfig: { audioEncoding: "MP3", pitch: -2, speakingRate: 0.9 },
        enableTimePointing: ["SSML_MARK"],
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Google TTS HTTP ${res.status}: ${err}`);
  }
  const data = await res.json();

  // Convertir les timepoints (mots) en un tableau d'alignement au format ElevenLabs (caractères)
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

  // Secours 1 : ElevenLabs (seulement si une clé est fournie)
  if (process.env.ELEVENLABS_API_KEY) {
    try {
      const data = await generateElevenLabs(text, process.env.ELEVENLABS_API_KEY);
      return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
    } catch (err) {
      console.error("ElevenLabs a échoué, tentative de secours vers Google TTS:", err);
    }
  }

  // Secours 2 : Google Cloud TTS (seulement si une clé est fournie)
  if (process.env.GOOGLE_TTS_API_KEY) {
    try {
      const data = await generateGoogleTTS(text, process.env.GOOGLE_TTS_API_KEY);
      return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
    } catch (err) {
      console.error("Google TTS a échoué, tentative de secours vers Web Speech API:", err);
    }
  }

  // Secours 3 : basculement sur la voix système du navigateur (via un 502)
  return NextResponse.json(
    { error: "Aucun secours cloud configuré. Basculement sur la voix système." },
    { status: 502 }
  );
}
