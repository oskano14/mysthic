import { NextResponse } from "next/server";

/* Jeton Spotify (client credentials) mis en cache tant qu'il est valide */
let spotifyToken = { value: null, expiresAt: 0 };

async function getSpotifyToken() {
  if (spotifyToken.value && Date.now() < spotifyToken.expiresAt) {
    return spotifyToken.value;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error(
      "SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET ne sont pas configurés."
    );
  }

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) {
    throw new Error(`Authentification Spotify refusée (${res.status}).`);
  }

  const data = await res.json();
  spotifyToken = {
    value: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };
  return spotifyToken.value;
}

/* Demande à Mistral une chanson réelle correspondant à l'ambiance du texte */
async function suggestTrack(prediction) {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    return { query: "musique mystique ambient", description: "" };
  }

  const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "mistral-small-latest",
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Tu es un expert musical. Tu réponds uniquement en JSON valide.",
        },
        {
          role: "user",
          content: `Voici l'interprétation d'un tirage de tarot :
"""${prediction.slice(0, 1500)}"""

Propose une chanson réelle et trouvable sur Spotify qui correspond à l'ambiance émotionnelle de ce texte (mystique, apaisante, mélancolique, lumineuse…).
Réponds en JSON avec exactement ces clés :
{"query": "<titre de la chanson> <artiste>", "description": "<une phrase en français expliquant pourquoi cette musique accompagne bien la prédiction>"}`,
        },
      ],
    }),
  });
  if (!res.ok) {
    throw new Error(`Mistral n'a pas pu suggérer de musique (${res.status}).`);
  }

  const data = await res.json();
  const parsed = JSON.parse(data?.choices?.[0]?.message?.content || "{}");
  if (!parsed.query) {
    throw new Error("Suggestion musicale vide.");
  }
  return parsed;
}

const msToMinSec = (ms) => {
  const totalSec = Math.round(ms / 1000);
  return `${Math.floor(totalSec / 60)}:${String(totalSec % 60).padStart(2, "0")}`;
};

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
  }

  const { prediction } = body;
  if (!prediction || typeof prediction !== "string") {
    return NextResponse.json(
      { error: "Le texte de la prédiction est requis." },
      { status: 400 }
    );
  }

  try {
    const suggestion = await suggestTrack(prediction);
    const token = await getSpotifyToken();

    const searchRes = await fetch(
      `https://api.spotify.com/v1/search?type=track&limit=1&market=FR&q=${encodeURIComponent(
        suggestion.query
      )}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!searchRes.ok) {
      throw new Error(`Recherche Spotify échouée (${searchRes.status}).`);
    }

    const searchData = await searchRes.json();
    const track = searchData?.tracks?.items?.[0];
    if (!track) {
      return NextResponse.json(
        { error: `Aucun morceau trouvé pour « ${suggestion.query} ».` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      track: {
        id: track.id,
        title: track.name,
        artist: track.artists.map((a) => a.name).join(", "),
        album: track.album?.name || "",
        duration: msToMinSec(track.duration_ms),
        coverUrl: track.album?.images?.[0]?.url || "",
        spotifyUrl: track.external_urls?.spotify || "",
        previewUrl: track.preview_url || null,
        embedUrl: `https://open.spotify.com/embed/track/${track.id}`,
        description: suggestion.description || "",
      },
    });
  } catch (err) {
    console.error("Erreur recommandation musicale:", err);
    return NextResponse.json({ error: String(err.message) }, { status: 502 });
  }
}
