import { NextResponse } from "next/server";

export async function POST(request) {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    // Return a mocked prediction to allow testing without an API key
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return NextResponse.json({
      prediction:
        "Je suis Taroh. Ton passé montre un ancrage fort, mais des doutes persistent. Le présent exige de toi une grande clarté mentale et de laisser derrière toi ce qui ne te sert plus. Le futur promet des révélations inattendues et une renaissance spirituelle si tu suis ton intuition profonde.",
    });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
  }

  const { cards, theme } = body;
  if (!Array.isArray(cards) || cards.length !== 3) {
    return NextResponse.json(
      { error: "Trois cartes (passé, présent, futur) sont requises." },
      { status: 400 }
    );
  }

  const prompt = `Tu es une oracle ancienne, mystique et bienveillante.
Voici trois cartes de tarot tirées par une âme en quête de réponses :
- Passé : ${cards[0]?.name} (${cards[0]?.meaning})
- Présent : ${cards[1]?.name} (${cards[1]?.meaning})
- Futur : ${cards[2]?.name} (${cards[2]?.meaning})

Fais une interprétation sacrée et profonde, **centrée sur le thème : ${theme || "général"}**.
Utilise un style poétique, ésotérique et intuitif. Réponds uniquement en **français**.`;

  try {
    const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mistral-small-latest",
        temperature: 0.85,
        messages: [
          {
            role: "system",
            content:
              "Tu es une oracle mystique qui parle exclusivement en français, avec un ton sacré et intuitif. Tu fais des interprétations de cartes de tarot sur différents thèmes.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error("Erreur Mistral:", res.status, detail);
      return NextResponse.json(
        { error: "L'oracle Mistral n'a pas répondu." },
        { status: 502 }
      );
    }

    const data = await res.json();
    const prediction = data?.choices?.[0]?.message?.content;
    if (!prediction) {
      return NextResponse.json(
        { error: "Réponse mystique vide." },
        { status: 502 }
      );
    }

    return NextResponse.json({ prediction });
  } catch (err) {
    console.error("Erreur Mistral:", err);
    return NextResponse.json(
      { error: "Impossible de contacter l'oracle." },
      { status: 502 }
    );
  }
}
