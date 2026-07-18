import { NextResponse } from "next/server";

// NOTE : le moteur TTS (Kokoro/voicebox) tourne dans le navigateur, côté client
// (voir lib/tts-browser.js). Cette route ne sert plus que de secours cloud
// OPTIONNEL via ElevenLabs, uniquement si une clé est configurée. Google Cloud
// TTS a été retiré. Route volontairement légère (Vercel-safe).

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

  // Secours ElevenLabs (uniquement si une clé est fournie)
  if (process.env.ELEVENLABS_API_KEY) {
    try {
      const data = await generateElevenLabs(text, process.env.ELEVENLABS_API_KEY);
      return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
    } catch (err) {
      console.error("ElevenLabs a échoué:", err);
    }
  }

  return NextResponse.json(
    { error: "Aucun secours cloud configuré." },
    { status: 502 }
  );
}
