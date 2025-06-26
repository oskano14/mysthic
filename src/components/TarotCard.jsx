import React, { useState } from 'react'
import { motion } from 'framer-motion'

const TarotCard = ({ card, onSelect, disabled, isCompleted, isHovered }) => {
  const [isFlipped, setIsFlipped] = useState(false)

  const handleClick = () => {
    if (disabled || isCompleted) return
    
    setIsFlipped(true)
    setTimeout(() => {
      onSelect(card)
    }, 600)
  }

  return (
    <motion.div
      className={`relative cursor-pointer ${disabled ? 'opacity-30 cursor-not-allowed' : ''}`}
      onClick={handleClick}
      whileHover={!disabled && !isCompleted ? { 
        scale: 1.1, 
        y: -15,
        rotateY: 5,
        rotateX: 5
      } : {}}
      whileTap={!disabled && !isCompleted ? { scale: 0.95 } : {}}
      transition={{ 
        duration: 0.4,
        type: "spring",
        stiffness: 200
      }}
      style={{
        perspective: '1000px'
      }}
    >
      <div className={`card-flip ${isFlipped ? 'flipped' : ''} w-full h-32 relative`}>
        {/* Card Back */}
        <div className="card-face absolute inset-0 bg-gradient-to-br from-mystique-gold/20 via-mystique-gold/10 to-black border border-mystique-gold/30 rounded-xl flex items-center justify-center shadow-lg">
          <div className="text-center">
            <motion.div 
              className="w-8 h-8 bg-mystique-gold/30 rounded-full flex items-center justify-center mx-auto mb-2"
              animate={isHovered ? { rotate: 360 } : {}}
              transition={{ duration: 1 }}
            >
              <div className="w-4 h-4 bg-mystique-gold rounded-full"></div>
            </motion.div>
            <div className="text-mystique-gold/50 text-xs font-elegant">
              Mystique
            </div>
          </div>
          
          {/* Hover Glow */}
          {isHovered && !disabled && (
            <motion.div
              className="absolute inset-0 rounded-xl border-2 border-mystique-gold/70 pointer-events-none"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              style={{
                boxShadow: '0 0 30px rgba(212, 175, 55, 0.6), inset 0 0 30px rgba(212, 175, 55, 0.1)',
              }}
            />
          )}
        </div>

        {/* Card Front */}
        <div className="card-face card-back absolute inset-0">
          <div className="relative w-full h-full rounded-xl overflow-hidden border border-mystique-gold shadow-xl">
            <img
              src={card.image}
              alt={card.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-2">
              <h3 className="text-xs font-bold text-mystique-gold text-center leading-tight">
                {card.name}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Selection Effect */}
      {disabled && (
        <motion.div
          className="absolute inset-0 rounded-xl bg-mystique-gold/20 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-mystique-gold text-lg">✓</div>
        </motion.div>
      )}

      {/* Floating Particles for Hover */}
      {isHovered && !disabled && (
        <>
          <motion.div
            className="absolute -top-1 -left-1 w-1 h-1 bg-mystique-gold rounded-full"
            animate={{
              y: [-5, -15, -5],
              x: [-2, 2, -2],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity
            }}
          />
          <motion.div
            className="absolute -top-1 -right-1 w-1 h-1 bg-mystique-gold rounded-full"
            animate={{
              y: [-5, -15, -5],
              x: [2, -2, 2],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 0.5
            }}
          />
        </>
      )}
    </motion.div>
  )
}

export default TarotCard