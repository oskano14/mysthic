"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const TarotCard = ({ card, onSelect, disabled, isCompleted, isHovered }: any) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleClick = () => {
    if (disabled || isCompleted) return;

    setIsFlipped(true);
    setTimeout(() => {
      onSelect(card);
    }, 600);
  };

  return (
    <motion.div
      className={`relative cursor-pointer m-1 sm:m-3 ${
        disabled ? "opacity-30 cursor-not-allowed" : ""
      }`}
      onClick={handleClick}
      whileHover={
        !disabled && !isCompleted
          ? {
              scale: 1.1,
              y: -15,
              rotateY: 5,
              rotateX: 5,
            }
          : {}
      }
      whileTap={!disabled && !isCompleted ? { scale: 0.95 } : {}}
      transition={{
        duration: 0.4,
        type: "spring",
        stiffness: 200,
      }}
      style={{
        perspective: "1000px",
      }}
    >
      <div
        className={`card-flip ${
          isFlipped ? "flipped" : ""
        } w-full h-24 sm:h-32 relative`}
      >
        {/* Carte retourne */}
        <div className="card-face absolute inset-0 bg-gradient-to-br from-mystique-rose/20 via-mystique-rose/10 to-[#0a0515] border border-mystique-rose/30 rounded-xl flex items-center justify-center shadow-lg">
          <div className="relative w-full h-full rounded-xl overflow-hidden">
            <Image
              src="/card_back.png"
              alt="Card Back"
              fill
              sizes="(max-width: 768px) 100px, 150px"
              className="object-cover"
            />
          </div>

          {/* Hover Glow */}
          {isHovered && !disabled && (
            <motion.div
              className="absolute inset-0 rounded-xl border-2 border-mystique-rose/70 pointer-events-none"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              style={{
                boxShadow:
                  "0 0 30px rgba(183, 110, 121, 0.6), inset 0 0 30px rgba(183, 110, 121, 0.1)",
              }}
            />
          )}
        </div>

        {/* Carte front */}
        <div className="card-face card-back absolute inset-0">
          <div className="relative w-full h-full rounded-xl overflow-hidden border border-mystique-rose shadow-xl">
            <Image
              src={card.image}
              alt={card.name}
              fill
              sizes="(max-width: 768px) 100px, 150px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0515]/90 via-transparent to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-2">
              <h3 className="text-xs font-bold text-mystique-rose text-center leading-tight">
                {card.name}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* effet de la selection */}
      {disabled && (
        <motion.div
          className="absolute inset-0 rounded-xl bg-mystique-rose/20 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-mystique-rose text-lg">✓</div>
        </motion.div>
      )}

      {/* particule flottant en Hover */}
      {isHovered && !disabled && (
        <>
          <motion.div
            className="absolute -top-1 -left-1 w-1 h-1 bg-mystique-rose rounded-full"
            animate={{
              y: [-5, -15, -5],
              x: [-2, 2, -2],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          />
          <motion.div
            className="absolute -top-1 -right-1 w-1 h-1 bg-mystique-amethyst rounded-full"
            animate={{
              y: [-5, -15, -5],
              x: [2, -2, 2],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 0.5,
            }}
          />
        </>
      )}
    </motion.div>
  );
};

export default TarotCard;
