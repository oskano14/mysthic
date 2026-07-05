import { NextResponse } from "next/server";

export async function POST(request) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ELEVENLABS_API_KEY n'est pas configurée côté serveur." },
      { status: 500 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
  }

  const { text } = body;
  if (!text || typeof text !== "string") {
    return NextResponse.json(
      { error: "Le texte à lire est requis." },
      { status: 400 }
    );
  }

  // Voix "Charlotte" par défaut (mystique, mature, parfaite en français).
  // Modifiable via la variable ELEVENLABS_VOICE_ID.
  const voiceId = process.env.ELEVENLABS_VOICE_ID || "XB0fDUnXU5pow0Jex86P";

  try {
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
          // Garde-fou : limite la consommation du quota gratuit.
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
      const detail = await res.text();
      console.error("Erreur ElevenLabs:", res.status, detail);
      const status = res.status === 401 ? 401 : 502;
      return NextResponse.json(
        { error: "La voix mystique n'a pas pu être invoquée." },
        { status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("Erreur ElevenLabs:", err);
    return NextResponse.json(
      { error: "Impossible de contacter la voix mystique." },
      { status: 502 }
    );
  }
}
