// Nappe d'ambiance mystique synthétisée (Web Audio API), jouée en fond sous la
// voix de la prédiction. Aucun fichier ni dépendance : un accord grave
// "respirant" (nappe + LFO sur le filtre) et un souffle doux en bruit de fond.

export function createMysticAmbience(cards = [], theme = "général", mood = "mystique") {
  let ctx = null;
  let master = null;
  let started = false;

  const build = () => {
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    // Détermination de l'accord de base selon le thème et le mood
    let baseFreqs;
    const t = theme.toLowerCase();
    const m = mood.toLowerCase();
    
    if (m === "sombre" || m === "tension") {
      // Accord mineur sombre et très grave (Mi mineur bas)
      baseFreqs = [41.20, 61.74, 77.78, 98.00]; // E1, B1, Eb2, G2
    } else if (m === "calme" || m === "espoir") {
      // Accord majeur céleste et apaisant (Do majeur)
      baseFreqs = [130.81, 164.81, 196.00, 261.63, 329.63]; // C3, E3, G3, C4, E4
    } else if (t.includes("amour")) {
      baseFreqs = [130.81, 164.81, 196.00, 246.94]; // C3, E3, G3, B3
    } else if (t.includes("travail") || t.includes("carrière")) {
      baseFreqs = [73.42, 146.83, 174.61, 220.00]; // D2, D3, F3, A3
    } else if (t.includes("spiritualité") || t.includes("spirituel")) {
      baseFreqs = [110.00, 164.81, 220.00, 246.94]; // A2, E3, A3, B3
    } else {
      baseFreqs = [110, 130.81, 164.81, 220]; // A2, C3, E3, A3
    }

    const cardModulation = cards.reduce((sum, card) => sum + (card.id || 0), 0);
    let filterFreq = 400 + (cardModulation * 5); 
    if (m === "sombre" || m === "tension") filterFreq = 250; // Plus étouffé
    if (m === "calme" || m === "espoir") filterFreq = 800; // Plus aérien

    const padFilter = ctx.createBiquadFilter();
    padFilter.type = "lowpass";
    padFilter.frequency.value = filterFreq;
    padFilter.Q.value = m === "sombre" || m === "tension" ? 2.0 : 0.6;
    padFilter.connect(master);

    baseFreqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = i % 2 === 0 ? "sine" : "triangle";
      
      let detuneAmount = (cardModulation % 10) + 5;
      if (m === "sombre" || m === "tension") detuneAmount += 15; // Dissonance
      
      osc.frequency.value = f;
      osc.detune.value = (Math.random() - 0.5) * detuneAmount; 
      
      const g = ctx.createGain();
      g.gain.value = m === "calme" || m === "espoir" ? 0.15 : 0.22;
      osc.connect(g).connect(padFilter);
      osc.start();
    });

    // --- LFO "respiration" : ouvre/ferme lentement le filtre ---
    const lfo = ctx.createOscillator();
    let lfoRate = 0.05 + (cardModulation % 5) * 0.01;
    if (m === "tension") lfoRate = 0.15; // Rythme cardiaque rapide
    if (m === "calme") lfoRate = 0.02; // Très lent et paisible
    
    lfo.frequency.value = lfoRate;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 250;
    lfo.connect(lfoGain).connect(padFilter.frequency);
    lfo.start();

    // --- Souffle / bruits de fond : bruit brownien filtré (passe-bande) ---
    const size = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, size, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < size; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    const noiseFilter = ctx.createBiquadFilter();
    
    // Modification du type de bruit de fond
    if (m === "calme" || m === "espoir") {
      noiseFilter.type = "lowpass"; // Ressemble à l'océan
      noiseFilter.frequency.value = 800;
    } else if (m === "sombre" || m === "tension") {
      noiseFilter.type = "lowpass"; // Ressemble à un grondement
      noiseFilter.frequency.value = 150;
    } else {
      noiseFilter.type = "bandpass";
      noiseFilter.frequency.value = 300 + (cardModulation * 2);
    }
    
    noiseFilter.Q.value = 0.4;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = m === "calme" ? 0.6 : 0.4;
    noise.connect(noiseFilter).connect(noiseGain).connect(master);
    noise.start();
  };

  // Crée / réveille le contexte audio.
  // DOIT être appelé dans un geste utilisateur la première fois (Safari).
  const prime = async () => {
    if (!started) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      ctx = new AudioCtx();
      build();
      started = true;
    }
    if (ctx && ctx.state === "suspended") {
      try {
        await ctx.resume();
      } catch {
        /* ignore */
      }
    }
  };

  // Monte/descend le volume global en douceur (0 = silence).
  const setVolume = (v, ramp = 2) => {
    if (!ctx || !master) return;
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(v, now + ramp);
  };

  const dispose = () => {
    if (!ctx) return;
    try {
      ctx.close();
    } catch {
      /* ignore */
    }
    ctx = null;
    master = null;
    started = false;
  };

  return { prime, setVolume, dispose };
}
