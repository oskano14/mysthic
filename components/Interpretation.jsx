"use client";
import { useState } from "react";

const Interpretation = ({ card }) => {
  const [interpretation, setInterpretation] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchInterpretation = async () => {
    setLoading(true);
    const res = await fetch("/api/mistral", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ card }),
    });
    const data = await res.json();
    setInterpretation(data.interpretation);
    setLoading(false);
  };

  return (
    <div>
      <button onClick={fetchInterpretation}>
        {loading ? "Chargement..." : "Interpréter"}
      </button>
      <p>{interpretation}</p>
    </div>
  );
};

export default Interpretation;
