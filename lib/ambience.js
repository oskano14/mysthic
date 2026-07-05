// Nappe d'ambiance mystique synthétisée (Web Audio API), jouée en fond sous la
// voix de la prédiction. Aucun fichier ni dépendance : un accord grave
// "respirant" (nappe + LFO sur le filtre) et un souffle doux en bruit de fond.

export function createMysticAmbience() {
  let ctx = null;
  let master = null;
  let started = false;

  const build = () => {
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    // --- Nappe harmonique : accord de La mineur grave ---
    const freqs = [110, 130.81, 164.81, 220]; // La2, Do3, Mi3, La3
    const padFilter = ctx.createBiquadFilter();
    padFilter.type = "lowpass";
    padFilter.frequency.value = 650;
    padFilter.Q.value = 0.6;
    padFilter.connect(master);

    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = i % 2 === 0 ? "sine" : "triangle";
      osc.frequency.value = f;
      osc.detune.value = (Math.random() - 0.5) * 10; // léger désaccord = chaleur
      const g = ctx.createGain();
      g.gain.value = 0.22;
      osc.connect(g).connect(padFilter);
      osc.start();
    });

    // --- LFO "respiration" : ouvre/ferme lentement le filtre ---
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.06;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 220;
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
    noiseFilter.frequency.value = 480;
    noiseFilter.Q.value = 0.4;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.5;
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
