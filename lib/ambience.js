// Nappe d'ambiance mystique synthétisée (Web Audio API), jouée en fond sous la
// voix de la prédiction. Aucun fichier ni dépendance : un accord grave
// "respirant" (nappe + LFO sur le filtre) et un souffle doux en bruit de fond.

export function createMysticAmbience(cards = [], theme = "général") {
  let ctx = null;
  let master = null;
  let started = false;

  const build = () => {
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    // Détermination de l'accord de base selon le thème
    let baseFreqs;
    const t = theme.toLowerCase();
    if (t.includes("amour")) {
      // Accords plus chauds / ouverts (Do majeur 7 ou Mi mineur 7)
      baseFreqs = [130.81, 164.81, 196.00, 246.94]; // C3, E3, G3, B3
    } else if (t.includes("travail") || t.includes("carrière")) {
      // Accord ancré, structuré (Ré mineur)
      baseFreqs = [73.42, 146.83, 174.61, 220.00]; // D2, D3, F3, A3
    } else if (t.includes("spiritualité") || t.includes("spirituel")) {
      // Accord éthéré (La mineur add 9)
      baseFreqs = [110.00, 164.81, 220.00, 246.94]; // A2, E3, A3, B3
    } else {
      // Général / Mystique par défaut (La mineur grave)
      baseFreqs = [110, 130.81, 164.81, 220]; // A2, C3, E3, A3
    }

    // Modulation selon les cartes tirées (ajout d'harmoniques uniques)
    const cardModulation = cards.reduce((sum, card) => sum + (card.id || 0), 0);
    const filterFreq = 400 + (cardModulation * 5); // Le filtre s'ouvre plus si les ID sont élevés

    const padFilter = ctx.createBiquadFilter();
    padFilter.type = "lowpass";
    padFilter.frequency.value = filterFreq;
    padFilter.Q.value = 0.6;
    padFilter.connect(master);

    baseFreqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = i % 2 === 0 ? "sine" : "triangle";
      
      // Les cartes influencent un très léger vibrato/detune
      const detuneAmount = (cardModulation % 10) + 5;
      osc.frequency.value = f;
      osc.detune.value = (Math.random() - 0.5) * detuneAmount; 
      
      const g = ctx.createGain();
      g.gain.value = 0.22;
      osc.connect(g).connect(padFilter);
      osc.start();
    });

    // --- LFO "respiration" : ouvre/ferme lentement le filtre ---
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.05 + (cardModulation % 5) * 0.01; // Respiration unique
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
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.value = 300 + (cardModulation * 2);
    noiseFilter.Q.value = 0.4;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.4;
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
