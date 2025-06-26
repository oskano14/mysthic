"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import TarotCard from "@/components/TarotCard";
import { tarotCards } from "@/data/tarotCards";
import { ArrowLeft, Sparkles, Star } from "lucide-react";

export default function CardSelection() {
  const router = useRouter();
  const [selectedCards, setSelectedCards] = useState([]);
  const [currentPhase, setCurrentPhase] = useState("past");
  const [hoveredCard, setHoveredCard] = useState(null);

  const phases = {
    past: { title: "PASSÉ", subtitle: "Ce qui vous a mené ici", index: 0 },
    present: {
      title: "PRÉSENT",
      subtitle: "Votre situation actuelle",
      index: 1,
    },
    future: { title: "FUTUR", subtitle: "Ce qui vous attend", index: 2 },
  };

  // sélection d’une carte ----------------------------------------------------
  const handleCardSelect = (card) => {
    const newSelected = [...selectedCards, { ...card, phase: currentPhase }];
    setSelectedCards(newSelected);

    if (currentPhase === "past") setCurrentPhase("present");
    else if (currentPhase === "present") setCurrentPhase("future");
  };

  // quand les 3 cartes sont choisies, on stocke => redirection --------------
  useEffect(() => {
    if (selectedCards.length === 3) {
      sessionStorage.setItem("selectedCards", JSON.stringify(selectedCards));
      // petite pause pour laisser finir les animations
      setTimeout(() => router.push("/prediction"), 1500);
    }
  }, [selectedCards, router]);

  // -------------------------------------------------------------------------
  const getCurrentPhaseText = () =>
    selectedCards.length === 3 ? "DESTINÉE" : phases[currentPhase].title;

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: "",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* Giant Background Text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <motion.div
          key={getCurrentPhaseText()}
          initial={{ opacity: 0, scale: 0.8, rotateX: 45 }}
          animate={{ opacity: 0.1, scale: 1, rotateX: 0 }}
          exit={{ opacity: 0, scale: 1.2, rotateX: -45 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="text-[20rem] md:text-[25rem] lg:text-[30rem] font-black text-mystique-gold leading-none select-none"
          style={{
            fontFamily: "Impact, Arial Black, sans-serif",
            textShadow: "0 0 100px rgba(212, 175, 55, 0.3)",
            transform: "perspective(1000px)",
          }}
        >
          {getCurrentPhaseText()}
        </motion.div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-8 left-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-2 border-mystique-gold/30 rounded-full flex items-center justify-center"
        >
          <Star className="w-8 h-8 text-mystique-gold/50" />
        </motion.div>
      </div>

      <div className="absolute top-8 right-8">
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border border-mystique-gold/20 rounded-full flex items-center justify-center"
        >
          <Sparkles className="w-6 h-6 text-mystique-gold/40" />
        </motion.div>
      </div>

      {/* Corner Decorations */}
      <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-mystique-gold/20"></div>
      <div className="absolute top-0 right-0 w-32 h-32 border-r-2 border-t-2 border-mystique-gold/20"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 border-l-2 border-b-2 border-mystique-gold/20"></div>
      <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-mystique-gold/20"></div>

      {/* Content */}
      <div className="relative z-10 min-h-screen pt-20 px-8">
        {/* Back Button */}
        <motion.button
          onClick={() => navigate("/")}
          className="fixed top-8 left-8 z-50 flex items-center space-x-2 text-mystique-gold/70 hover:text-mystique-gold transition-all duration-300 group"
          whileHover={{ x: -5 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft className="w-5 h-5 group-hover:animate-pulse" />
          <span className="font-elegant text-sm tracking-wider">
            RETOUR AU MENU PRINCIPAL
          </span>
        </motion.button>

        {/* Phase Indicator */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-8">
            {Object.entries(phases).map(([key, phase]) => (
              <motion.div
                key={key}
                className="relative"
                animate={{
                  scale: currentPhase === key ? 1.2 : 1,
                  opacity: selectedCards.find((card) => card.phase === key)
                    ? 1
                    : currentPhase === key
                    ? 0.8
                    : 0.4,
                }}
                transition={{ duration: 0.5 }}
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 ${
                    selectedCards.find((card) => card.phase === key)
                      ? "bg-mystique-gold border-mystique-gold"
                      : currentPhase === key
                      ? "border-mystique-gold animate-pulse"
                      : "border-mystique-gold/30"
                  }`}
                >
                  {selectedCards.find((card) => card.phase === key) && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-full h-full bg-mystique-gold rounded-full"
                    />
                  )}
                </div>
                {phase.index < 2 && (
                  <div className="absolute top-1/2 left-6 w-16 h-px bg-mystique-gold/20"></div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Selected Cards Display */}
        <AnimatePresence>
          {selectedCards.length > 0 && (
            <motion.div
              className="flex justify-center space-x-12 mb-16"
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {selectedCards.map((card, index) => (
                <motion.div
                  key={`selected-${index}`}
                  initial={{
                    scale: 0,
                    rotateY: 180,
                    y: 100,
                  }}
                  animate={{
                    scale: 1,
                    rotateY: 0,
                    y: 0,
                  }}
                  transition={{
                    duration: 1.2,
                    delay: index * 0.3,
                    type: "spring",
                    stiffness: 100,
                  }}
                  className="relative group"
                >
                  <div className="w-40 h-64 relative">
                    {/* Glow Effect */}
                    <div className="absolute inset-0 bg-mystique-gold/20 rounded-2xl blur-xl group-hover:bg-mystique-gold/30 transition-all duration-500"></div>

                    {/* Card */}
                    <div className="relative w-full h-full rounded-2xl overflow-hidden border-2 border-mystique-gold/50 shadow-2xl">
                      <img
                        src={card.image}
                        alt={card.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-sm font-bold text-mystique-gold text-center">
                          {card.name}
                        </h3>
                      </div>
                    </div>

                    {/* Phase Label */}
                    <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-center">
                      <span className="text-xs text-mystique-gold/60 font-elegant tracking-widest">
                        {phases[card.phase].title}
                      </span>
                    </div>

                    {/* Floating Particles */}
                    <motion.div
                      className="absolute -top-2 -right-2 w-3 h-3 bg-mystique-gold rounded-full"
                      animate={{
                        y: [-10, 10, -10],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: index * 0.5,
                      }}
                    />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Current Phase Title */}
        <AnimatePresence mode="wait">
          {selectedCards.length < 3 && (
            <motion.div
              key={currentPhase}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold text-mystique-gold mb-2 tracking-wider">
                {phases[currentPhase].title}
              </h2>
              <p className="text-mystique-gold/60 font-elegant text-lg">
                {phases[currentPhase].subtitle}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cards Grid */}
        <motion.div
          className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-11 gap-4 max-w-7xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          {tarotCards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 100, rotateX: 45 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{
                duration: 0.8,
                delay: index * 0.05,
                type: "spring",
                stiffness: 100,
              }}
              onMouseEnter={() => setHoveredCard(card.id)}
              onMouseLeave={() => setHoveredCard(null)}
              className="relative"
            >
              <TarotCard
                card={card}
                onSelect={handleCardSelect}
                disabled={selectedCards.some(
                  (selected) => selected.id === card.id
                )}
                isCompleted={selectedCards.length >= 3}
                isHovered={hoveredCard === card.id}
              />

              {/* Hover Info */}
              <AnimatePresence>
                {hoveredCard === card.id &&
                  !selectedCards.some(
                    (selected) => selected.id === card.id
                  ) && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.9 }}
                      className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-black/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-mystique-gold/30 z-20"
                    >
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-mystique-gold/30"></div>
                    </motion.div>
                  )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>

        {/* Instructions */}
        <motion.div
          className="text-center mt-16 pb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.5 }}
        >
          <p className="text-mystique-gold/40 font-elegant text-lg tracking-wide">
            Laissez votre intuition vous guider vers la carte qui vous
            appelle...
          </p>

          {/* Progress Indicator */}
          <div className="mt-8 flex justify-center">
            <div className="flex space-x-2">
              {[0, 1, 2].map((index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-500 ${
                    index < selectedCards.length
                      ? "bg-mystique-gold"
                      : "bg-mystique-gold/20"
                  }`}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Completion Animation */}
      <AnimatePresence>
        {selectedCards.length === 3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 1, type: "spring", stiffness: 100 }}
              className="text-center"
            >
              <div className="text-6xl font-bold text-mystique-gold mb-4">
                ✨
              </div>
              <h2 className="text-3xl font-bold text-mystique-gold mb-2">
                Destinée Révélée
              </h2>
              <p className="text-mystique-gold/70 font-elegant">
                Préparation de votre prédiction...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
