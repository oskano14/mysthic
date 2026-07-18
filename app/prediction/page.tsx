"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Music,
  Sparkles,
  Volume2,
  VolumeX,
  Loader2,
  Star,
} from "lucide-react";
import Image from "next/image";
import { createMysticAmbience } from "@/lib/ambience";
import { GLSLHills } from "@/components/ui/glsl-hills";
import { InteractiveEye } from "@/components/ui/interactive-eye";

const SILENT_AUDIO =
  "data:audio/wav;base64,UklGRrQBAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YZABAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA";

const AMBIENCE_VOLUME = 0.18;
const AMBIENCE_FILE_VOLUME = 0.4;
const AMBIENCE_FILE = "/ambiance.mp3";

export default function Prediction() {
  const router = useRouter();
  const [selectedCards, setSelectedCards] = useState<any[]>([]);
  const [theme, setTheme] = useState("général");
  const [prediction, setPrediction] = useState("");
  const [mood, setMood] = useState("mystique");
  const [isLoadingPrediction, setIsLoadingPrediction] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState("");
  const [ambienceEnabled, setAmbienceEnabled] = useState(true);
  const [hasAmbienceFile, setHasAmbienceFile] = useState(false);
  const [timings, setTimings] = useState<any>(null);
  const [activeWordRange, setActiveWordRange] = useState({ start: -1, end: -1 });
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const voiceAudioRef = useRef<HTMLAudioElement | null>(null);
  const voiceUrlRef = useRef<string | null>(null);
  const ambienceRef = useRef<any>(null);
  const ambienceFileRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetch(AMBIENCE_FILE, { method: "HEAD" })
      .then((r) => setHasAmbienceFile(r.ok))
      .catch(() => setHasAmbienceFile(false));
  }, []);

  const goBack = () => {
    if (isSpeaking) {
      setShowExitConfirm(true);
    } else {
      router.push("/selection");
    }
  };

  useEffect(() => {
    const stored = sessionStorage.getItem("selectedCards");
    if (stored) setSelectedCards(JSON.parse(stored));
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (selectedCards.length === 3) generatePrediction();
  }, [selectedCards]);

  const generatePrediction = async () => {
    setIsLoadingPrediction(true);
    let interpretationText = "";

    try {
      const res = await fetch("/api/prediction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cards: selectedCards.map((c) => ({
            name: c.name,
            meaning: c.meaning,
          })),
          theme,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `Erreur ${res.status}`);

      setPrediction(data.prediction);
      setMood(data.mood || "mystique");
    } catch (err) {
      console.error("Erreur Mistral:", err);
      setPrediction("Une erreur ésotérique a bloqué la prophétie.");
    }
    setIsLoadingPrediction(false);
  };

  const startSynthAmbience = () => {
    if (!ambienceRef.current) {
      ambienceRef.current = createMysticAmbience(selectedCards, theme, mood);
    }
    ambienceRef.current.prime();
    ambienceRef.current.setVolume(AMBIENCE_VOLUME);
  };

  const startAmbience = () => {
    if (hasAmbienceFile && ambienceFileRef.current) {
      const a = ambienceFileRef.current;
      a.loop = true;
      a.volume = AMBIENCE_FILE_VOLUME;
      if (a.paused) a.play().catch(() => startSynthAmbience());
      return;
    }
    startSynthAmbience();
  };

  const stopAmbience = () => {
    if (ambienceFileRef.current) ambienceFileRef.current.pause();
    ambienceRef.current?.setVolume(0);
  };

  const toggleSpeech = async () => {
    const audio = voiceAudioRef.current;
    if (!audio) return;

    if (isSpeaking) {
      audio.pause();
      audio.pause();
      audio.currentTime = 0;
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      return;
    }
    if (isGeneratingVoice || !prediction) return;
    
    // Prime speech synthesis SYNCHRONOUSLY on mobile before any await
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const primeUtterance = new SpeechSynthesisUtterance("");
      primeUtterance.volume = 0;
      window.speechSynthesis.speak(primeUtterance);
    }

    if (ambienceEnabled) startAmbience();

    try {
      audio.src = SILENT_AUDIO;
      await audio.play();
      audio.pause();
      audio.currentTime = 0;
    } catch {
      // Ignore
    }

    const cleanText = prediction
      .replace(/<[^>]*>?/gm, "")
      .replace(/[*#_]/g, "");

    const playBlob = async (blob: Blob, alignment: any) => {
      if (alignment) setTimings(alignment);
      if (voiceUrlRef.current) URL.revokeObjectURL(voiceUrlRef.current);
      const url = URL.createObjectURL(blob);
      voiceUrlRef.current = url;
      audio.src = url;
      await audio.play();
      setIsSpeaking(true);
    };

    setIsGeneratingVoice(true);
    try {
      // 1) Moteur principal : Kokoro (le moteur de voicebox) 100 % dans le
      //    navigateur, sur l'appareil du visiteur — aucune dépendance externe.
      try {
        const { synthesizeFR } = await import("@/lib/tts-browser");
        const { blob, alignment } = await synthesizeFR(cleanText, {
          onProgress: (p: any) => {
            if (p?.status === "progress" && p?.total) {
              const pct = Math.min(
                100,
                Math.round((p.loaded / p.total) * 100)
              );
              setVoiceStatus(`Préparation de la voix… ${pct}%`);
            }
          },
        });
        setVoiceStatus("");
        await playBlob(blob, alignment);
        return;
      } catch (kokoroErr) {
        console.warn("Kokoro (navigateur) indisponible, secours :", kokoroErr);
        setVoiceStatus("");
      }

      // 2) Secours cloud OPTIONNEL (ElevenLabs/Google) si des clés existent.
      const res = await fetch("/api/speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: cleanText }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `Erreur ${res.status}`);

      const binaryString = atob(data.audio_base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
      await playBlob(
        new Blob([bytes], { type: data.mime || "audio/mpeg" }),
        data.alignment
      );
    } catch (err) {
      console.error("Voix indisponible, bascule sur la voix système :", err);
      // 3) Dernier recours : voix système du navigateur (Web Speech API).
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = "fr-FR";
        utterance.pitch = 0.8;
        utterance.rate = 0.9;

        const voices = window.speechSynthesis.getVoices();
        const frenchVoice = voices.find(
          (v) =>
            v.lang.startsWith("fr") &&
            (v.name.includes("Female") || v.name.includes("Google"))
        );
        if (frenchVoice) utterance.voice = frenchVoice;

        utterance.onboundary = (event) => {
          if (event.name === "word") {
            setActiveCharIndex(event.charIndex, cleanText);
          }
        };

        utterance.onend = () => {
          setIsSpeaking(false);
          setActiveWordRange({ start: -1, end: -1 });
        };
        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
      }
    } finally {
      setVoiceStatus("");
      setIsGeneratingVoice(false);
    }
  };

  const setActiveCharIndex = (charIndex: number, text: string) => {
    let start = charIndex;
    let end = charIndex;
    while (start > 0 && text[start - 1] !== ' ' && text[start - 1] !== '\n') start--;
    while (end < text.length - 1 && text[end + 1] !== ' ' && text[end + 1] !== '\n') end++;
    setActiveWordRange({ start, end });
  };

  useEffect(() => {
    let animationFrameId: number;
    const checkAudioTime = () => {
      if (voiceAudioRef.current && isSpeaking && timings) {
        const currentTime = voiceAudioRef.current.currentTime;
        const startTimes = timings.character_start_times_seconds;
        
        let foundIndex = -1;
        for (let i = 0; i < startTimes.length; i++) {
          if (currentTime >= startTimes[i]) foundIndex = i;
          else break;
        }
        
        if (foundIndex !== -1) {
          const chars = timings.characters;
          let start = foundIndex;
          let end = foundIndex;
          while (start > 0 && chars[start - 1] !== ' ' && chars[start - 1] !== '\n') start--;
          while (end < chars.length - 1 && chars[end + 1] !== ' ' && chars[end + 1] !== '\n') end++;
          setActiveWordRange({ start, end });
        }
      }
      if (isSpeaking) animationFrameId = requestAnimationFrame(checkAudioTime);
    };
    
    if (isSpeaking && timings) {
      animationFrameId = requestAnimationFrame(checkAudioTime);
    } else if (!isSpeaking) {
      setActiveWordRange({ start: -1, end: -1 });
    }
    
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isSpeaking, timings]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (ambienceEnabled && prediction) {
      startAmbience();
    } else {
      stopAmbience();
    }
  }, [ambienceEnabled, prediction]);

  useEffect(() => {
    const audioNode = voiceAudioRef.current;
    return () => {
      if (audioNode) audioNode.pause();
      if (voiceUrlRef.current) URL.revokeObjectURL(voiceUrlRef.current);
      ambienceRef.current?.dispose();
    };
  }, []);

  if (selectedCards.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0515] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-mystique-rose mb-4">
            Aucune carte sélectionnée
          </h1>
          <Link href="/selection" className="mystique-button">
            Commencer un tirage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0515] relative overflow-hidden">
      {/* 3D Background */}
      <GLSLHills />

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-mystique-rose/30 rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 min-h-screen pt-20 px-4 md:px-8">
        {/* Header */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10 md:mb-16"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.button
            onClick={goBack}
            className="flex items-center space-x-3 text-mystique-rose/70 hover:text-mystique-rose transition-all duration-300 group"
            whileHover={{ x: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-5 h-5 group-hover:animate-pulse" />
            <span className="font-elegant tracking-wider">NOUVEAU TIRAGE</span>
          </motion.button>

          <motion.h1
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-center bg-rose-gradient bg-clip-text text-transparent uppercase font-mystique drop-shadow-lg"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
            }}
          >
            VOTRE PRÉDICTION
          </motion.h1>

          <div className="hidden sm:block w-32"></div>
        </motion.div>

        {/* Selected Cards */}
        <motion.div
          className="flex flex-wrap justify-center gap-4 sm:gap-8 md:gap-16 mb-12 md:mb-20"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2 }}
        >
          {selectedCards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, rotateY: 180, y: 100 }}
              animate={{ opacity: 1, rotateY: 0, y: 0 }}
              transition={{
                duration: 1.2,
                delay: index * 0.4,
                type: "spring",
                stiffness: 80,
              }}
              className="text-center group"
            >
              <div className="relative mb-6">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-mystique-rose/20 rounded-3xl blur-2xl group-hover:bg-mystique-rose/30 transition-all duration-700"></div>

                {/* Card */}
                <div className="relative w-24 h-36 sm:w-36 sm:h-56 md:w-48 md:h-72 rounded-2xl md:rounded-3xl overflow-hidden border-2 border-mystique-rose/50 shadow-2xl group-hover:border-mystique-rose/70 transition-all duration-500">
                  <Image
                    src={card.image}
                    alt={card.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0515]/80 via-transparent to-transparent"></div>
                </div>

                {/* Floating Elements */}
                <motion.div
                  className="absolute -top-4 -right-4 w-4 h-4 bg-mystique-rose rounded-full"
                  animate={{
                    y: [-10, 10, -10],
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: index * 0.7,
                  }}
                />
              </div>

              <div className="space-y-2 mt-6">
                <h3 className="text-lg sm:text-xl md:text-2xl font-mystique font-bold text-mystique-gold drop-shadow-glow tracking-wide">
                  {card.name}
                </h3>
                <span className="text-mystique-rose/60 font-elegant text-xs sm:text-sm tracking-widest uppercase block">
                  {index === 0 ? "Passé" : index === 1 ? "Présent" : "Futur"}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Prediction Section */}
        <motion.div
          className="max-w-5xl mx-auto bg-[#120a22]/60 backdrop-blur-md rounded-2xl md:rounded-3xl p-6 sm:p-8 md:p-12 mb-16 border border-mystique-rose/20 relative overflow-hidden"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 left-4">
              <Star className="w-8 h-8 text-mystique-rose" />
            </div>
            <div className="absolute top-4 right-4">
              <Star className="w-6 h-6 text-mystique-rose" />
            </div>
            <div className="absolute bottom-4 left-4">
              <Star className="w-6 h-6 text-mystique-rose" />
            </div>
            <div className="absolute bottom-4 right-4">
              <Star className="w-8 h-8 text-mystique-rose" />
            </div>
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-center sm:justify-start space-x-2 md:space-x-4 mb-8">
              <Sparkles className="w-5 h-5 md:w-8 md:h-8 shrink-0 text-mystique-rose animate-pulse" />
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-mystique-rose tracking-wide text-center font-mystique">
                INTERPRÉTATION MYSTIQUE
              </h2>
              <Sparkles className="w-5 h-5 md:w-8 md:h-8 shrink-0 text-mystique-rose animate-pulse" />
            </div>

            {isLoadingPrediction ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="mb-6 scale-[0.6]">
                    <InteractiveEye />
                  </div>
                  <p className="text-mystique-rose/90 font-elegant text-xl text-shadow-glow">
                    Taroh analyse vos cartes sacrées...
                  </p>
                  <p className="text-mystique-rose/70 font-elegant text-sm mt-2">
                    Connexion aux énergies universelles en cours...
                  </p>
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5 }}
                className="prose prose-lg max-w-none"
              >
                <div className="text-mystique-rose/90 font-elegant leading-relaxed text-lg whitespace-pre-wrap">
                  {activeWordRange.start !== -1 ? (
                    <>
                      {prediction.replace(/<[^>]*>?/gm, '').replace(/[*#_]/g, "").substring(0, activeWordRange.start)}
                      <span className="bg-mystique-rose/30 text-white rounded px-1 drop-shadow-glow transition-colors duration-200">
                        {prediction.replace(/<[^>]*>?/gm, '').replace(/[*#_]/g, "").substring(activeWordRange.start, activeWordRange.end + 1)}
                      </span>
                      {prediction.replace(/<[^>]*>?/gm, '').replace(/[*#_]/g, "").substring(activeWordRange.end + 1)}
                    </>
                  ) : (
                    prediction.replace(/<[^>]*>?/gm, '').replace(/[*#_]/g, "")
                  )}
                </div>

                {/* Lecture vocale */}
                <motion.button
                  onClick={toggleSpeech}
                  disabled={isGeneratingVoice}
                  className="mt-8 flex items-center space-x-3 px-6 py-3 rounded-full border border-mystique-rose/40 text-mystique-rose hover:bg-mystique-rose/10 transition-all duration-300 disabled:opacity-60 disabled:cursor-wait"
                  whileHover={isGeneratingVoice ? {} : { scale: 1.05 }}
                  whileTap={isGeneratingVoice ? {} : { scale: 0.95 }}
                >
                  {isGeneratingVoice ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="font-elegant tracking-wide">
                        {voiceStatus || "Invocation de la voix mystique..."}
                      </span>
                    </>
                  ) : isSpeaking ? (
                    <>
                      <VolumeX className="w-5 h-5" />
                      <span className="font-elegant tracking-wide">
                        Arrêter la lecture
                      </span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-5 h-5" />
                      <span className="font-elegant tracking-wide">
                        Écouter la prédiction
                      </span>
                    </>
                  )}
                </motion.button>

                {/* Bascule de l'ambiance mystique de fond */}
                <button
                  onClick={() => setAmbienceEnabled((v) => !v)}
                  className="mt-4 flex items-center space-x-2 text-sm font-elegant text-mystique-rose/90 hover:text-mystique-rose transition-colors"
                >
                  <Music
                    className={`w-4 h-4 ${
                      ambienceEnabled ? "" : "opacity-40"
                    }`}
                  />
                  <span>
                    {ambienceEnabled
                      ? "Ambiance mystique de fond : activée"
                      : "Ambiance mystique de fond : coupée"}
                  </span>
                </button>

                {/* Voix de la prédiction */}
                <audio
                  ref={voiceAudioRef}
                  playsInline
                  onEnded={() => {
                    setIsSpeaking(false);
                    stopAmbience();
                  }}
                  onError={() => {
                    setIsSpeaking(false);
                    stopAmbience();
                  }}
                />

                {hasAmbienceFile && (
                  <audio
                    ref={ambienceFileRef}
                    src={AMBIENCE_FILE}
                    loop
                    playsInline
                    preload="auto"
                  />
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Modal de confirmation d'arrêt de lecture */}
      <AnimatePresence>
        {showExitConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowExitConfirm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-black/90 border border-mystique-rose/30 p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                <GLSLHills />
              </div>
              <div className="relative z-10">
                <h3 className="text-xl md:text-2xl font-bold text-mystique-rose font-mystique mb-4 text-center">
                  L&apos;Oracle parle
                </h3>
                <p className="text-white/80 font-elegant text-center mb-8">
                  Une lecture est en cours. Souhaitez-vous l&apos;interrompre avant de revenir à la sélection ?
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => {
                      if (voiceAudioRef.current) voiceAudioRef.current.pause();
                      if (typeof window !== "undefined" && "speechSynthesis" in window) {
                        window.speechSynthesis.cancel();
                      }
                      setIsSpeaking(false);
                      router.push("/selection");
                    }}
                    className="px-6 py-3 bg-mystique-rose text-black font-bold font-elegant rounded-xl hover:bg-mystique-gold hover:scale-105 transition-all duration-300"
                  >
                    Arrêter la voix et quitter
                  </button>
                  <button
                    onClick={() => {
                      router.push("/selection");
                    }}
                    className="px-6 py-3 bg-white/10 text-white font-elegant rounded-xl hover:bg-white/20 transition-colors"
                  >
                    Laisser parler et quitter
                  </button>
                  <button
                    onClick={() => setShowExitConfirm(false)}
                    className="px-6 py-3 text-white/60 font-elegant hover:text-white transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
