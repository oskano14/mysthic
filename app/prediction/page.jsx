"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Music,
  Sparkles,
  Volume2,
  VolumeX,
  Loader2,
  Star,
} from "lucide-react";
import { createMysticAmbience } from "@/lib/ambience";

// Court silence servant à "débloquer" la lecture audio pendant le clic
// (contournement de la politique d'autoplay de Safari sur lecture différée).
const SILENT_AUDIO =
  "data:audio/wav;base64,UklGRrQBAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YZABAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA";

// Volume de la nappe synthétisée de fond (la voix reste au premier plan).
const AMBIENCE_VOLUME = 0.18;
// Volume du fichier d'ambiance libre de droits (public/ambiance.mp3) s'il existe.
const AMBIENCE_FILE_VOLUME = 0.4;
// Fichier d'ambiance optionnel : déposez un .mp3 libre de droits à cet emplacement.
const AMBIENCE_FILE = "/ambiance.mp3";

export default function Prediction() {
  const router = useRouter();
  const [selectedCards, setSelectedCards] = useState([]);
  const [theme, setTheme] = useState("général");
  const [prediction, setPrediction] = useState("");
  const [isLoadingPrediction, setIsLoadingPrediction] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);
  const [ambienceEnabled, setAmbienceEnabled] = useState(true);
  const [hasAmbienceFile, setHasAmbienceFile] = useState(false);
  const voiceAudioRef = useRef(null);
  const voiceUrlRef = useRef(null);
  const ambienceRef = useRef(null);
  const ambienceFileRef = useRef(null);

  // Détecte la présence d'un fichier d'ambiance libre de droits.
  useEffect(() => {
    fetch(AMBIENCE_FILE, { method: "HEAD" })
      .then((r) => setHasAmbienceFile(r.ok))
      .catch(() => setHasAmbienceFile(false));
  }, []);

  const goBack = () => {
    router.push("/selection");
  };

  /* ------------------------------------------------------ */
  /* 1. récupérer les cartes stockées par CardSelection      */
  /* ------------------------------------------------------ */
  useEffect(() => {
    const stored = sessionStorage.getItem("selectedCards");
    if (stored) setSelectedCards(JSON.parse(stored));
  }, []);

  /* ------------------------------------------------------ */
  /* 2. lancer l’appel Mistral quand on a les 3 cartes       */
  /* ------------------------------------------------------ */
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

      interpretationText = data.prediction;
      setPrediction(interpretationText);
    } catch (err) {
      console.error("Erreur Mistral:", err);
      setPrediction("❌ Une erreur ésotérique a bloqué la prophétie.");
    }
    setIsLoadingPrediction(false);
  };

  /* ------------------------------------------------------ */
  /* Ambiance de fond : fichier libre de droits si présent,  */
  /* sinon nappe mystique synthétisée. À appeler dans un     */
  /* geste utilisateur (Safari).                             */
  /* ------------------------------------------------------ */
  const startSynthAmbience = () => {
    if (!ambienceRef.current) ambienceRef.current = createMysticAmbience();
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

  /* ------------------------------------------------------ */
  /* Lecture vocale (voix ElevenLabs) + ambiance mystique    */
  /* ------------------------------------------------------ */
  const toggleSpeech = async () => {
    const audio = voiceAudioRef.current;
    if (!audio) return;

    // En cours de lecture -> on arrête tout
    if (isSpeaking) {
      audio.pause();
      audio.currentTime = 0;
      stopAmbience();
      setIsSpeaking(false);
      return;
    }
    if (isGeneratingVoice || !prediction) return;

    // Ambiance : démarrée DANS le geste utilisateur (Safari), elle habille
    // l'attente pendant que la voix se génère.
    if (ambienceEnabled) startAmbience();

    // Amorce l'élément audio de la voix DANS le geste (sinon Safari bloque le
    // play() qui suit le fetch, jugé automatique).
    try {
      audio.src = SILENT_AUDIO;
      await audio.play();
      audio.pause();
      audio.currentTime = 0;
    } catch {
      /* certains navigateurs n'ont pas besoin de l'amorce */
    }

    setIsGeneratingVoice(true);
    try {
      const res = await fetch("/api/speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: prediction.replace(/[*#_]/g, "") }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || `Erreur ${res.status}`);
      }

      const blob = await res.blob();
      if (voiceUrlRef.current) URL.revokeObjectURL(voiceUrlRef.current);
      const url = URL.createObjectURL(blob);
      voiceUrlRef.current = url;

      audio.src = url;
      await audio.play();
      setIsSpeaking(true);
    } catch (err) {
      console.error("Erreur voix ElevenLabs:", err);
      stopAmbience();
    } finally {
      setIsGeneratingVoice(false);
    }
  };

  // Coupe/rallume l'ambiance en direct pendant la lecture.
  useEffect(() => {
    if (!isSpeaking) return;
    if (ambienceEnabled) startAmbience();
    else stopAmbience();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ambienceEnabled, isSpeaking]);

  useEffect(() => {
    return () => {
      if (voiceAudioRef.current) voiceAudioRef.current.pause();
      if (voiceUrlRef.current) URL.revokeObjectURL(voiceUrlRef.current);
      ambienceRef.current?.dispose();
    };
  }, []);

  if (selectedCards.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-mystique-gold mb-4">
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
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-mystique-gold/5 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-20 right-20 w-96 h-96 bg-mystique-gold/3 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-mystique-gold/2 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "4s" }}
        ></div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-mystique-gold/30 rounded-full"
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
            className="flex items-center space-x-3 text-mystique-gold/70 hover:text-mystique-gold transition-all duration-300 group"
            whileHover={{ x: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-5 h-5 group-hover:animate-pulse" />
            <span className="font-elegant tracking-wider">NOUVEAU TIRAGE</span>
          </motion.button>

          <motion.h1
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-center bg-gradient-to-r from-mystique-gold via-mystique-bronze to-mystique-gold bg-clip-text text-transparent"
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
                <div className="absolute inset-0 bg-mystique-gold/20 rounded-3xl blur-2xl group-hover:bg-mystique-gold/30 transition-all duration-700"></div>

                {/* Card */}
                <div className="relative w-24 h-36 sm:w-36 sm:h-56 md:w-48 md:h-72 rounded-2xl md:rounded-3xl overflow-hidden border-2 border-mystique-gold/50 shadow-2xl group-hover:border-mystique-gold/70 transition-all duration-500">
                  <img
                    src={card.image}
                    alt={card.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                  <div className="absolute bottom-2 left-2 right-2 sm:bottom-6 sm:left-6 sm:right-6">
                    <h3 className="text-xs sm:text-base md:text-lg font-bold text-mystique-gold text-center">
                      {card.name}
                    </h3>
                  </div>
                </div>

                {/* Floating Elements */}
                <motion.div
                  className="absolute -top-4 -right-4 w-4 h-4 bg-mystique-gold rounded-full"
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

              <div className="space-y-2">
                <span className="text-mystique-gold/60 font-elegant text-sm tracking-widest">
                  {index === 0 ? "PASSÉ" : index === 1 ? "PRÉSENT" : "FUTUR"}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Prediction Section */}
        <motion.div
          className="max-w-5xl mx-auto bg-black/40 backdrop-blur-sm rounded-2xl md:rounded-3xl p-6 sm:p-8 md:p-12 mb-16 border border-mystique-gold/20 relative overflow-hidden"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-4 left-4">
              <Star className="w-8 h-8 text-mystique-gold" />
            </div>
            <div className="absolute top-4 right-4">
              <Star className="w-6 h-6 text-mystique-gold" />
            </div>
            <div className="absolute bottom-4 left-4">
              <Star className="w-6 h-6 text-mystique-gold" />
            </div>
            <div className="absolute bottom-4 right-4">
              <Star className="w-8 h-8 text-mystique-gold" />
            </div>
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-center sm:justify-start space-x-2 md:space-x-4 mb-8">
              <Sparkles className="w-5 h-5 md:w-8 md:h-8 shrink-0 text-mystique-gold animate-pulse" />
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-mystique-gold tracking-wide text-center">
                INTERPRÉTATION MYSTIQUE
              </h2>
              <Sparkles className="w-5 h-5 md:w-8 md:h-8 shrink-0 text-mystique-gold animate-pulse" />
            </div>

            {isLoadingPrediction ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-16 h-16 border-4 border-mystique-gold/20 border-t-mystique-gold rounded-full mx-auto mb-6"
                  />
                  <p className="text-mystique-gold/70 font-elegant text-xl">
                    L'IA mystique analyse vos cartes sacrées...
                  </p>
                  <p className="text-mystique-gold/50 font-elegant text-sm mt-2">
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
                <div className="text-mystique-gold/90 font-elegant leading-relaxed text-lg whitespace-pre-line">
                  {prediction}
                </div>

                {/* Lecture vocale */}
                <motion.button
                  onClick={toggleSpeech}
                  disabled={isGeneratingVoice}
                  className="mt-8 flex items-center space-x-3 px-6 py-3 rounded-full border border-mystique-gold/40 text-mystique-gold hover:bg-mystique-gold/10 transition-all duration-300 disabled:opacity-60 disabled:cursor-wait"
                  whileHover={isGeneratingVoice ? {} : { scale: 1.05 }}
                  whileTap={isGeneratingVoice ? {} : { scale: 0.95 }}
                >
                  {isGeneratingVoice ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="font-elegant tracking-wide">
                        Invocation de la voix mystique...
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
                  className="mt-4 flex items-center space-x-2 text-sm font-elegant text-mystique-gold/60 hover:text-mystique-gold transition-colors"
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

                {/* Voix de la prédiction (ElevenLabs), piloté par toggleSpeech */}
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

                {/* Fichier d'ambiance libre de droits (public/ambiance.mp3),
                    joué en boucle sous la voix s'il est présent */}
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
    </div>
  );

  /* le reste de ton composant est inchangé,               */
  /* seulement le bouton retour devient :                  */
  /* ------------------------------------------------------ */

  /* ------------------------------------------------------ */

  /* … le JSX complet : copie-colle celui que tu avais,     */
  /*     juste remplace <Link>/useLocation par router       */
  /*     et supprime tout import react-router-dom           */
  /* ------------------------------------------------------ */
}
