import { motion } from "framer-motion";

export const AnimatedSparkle = ({ className = "w-12 h-12" }: { className?: string }) => {
  return (
    <motion.div
      className={`relative inline-flex items-center justify-center ${className}`}
      animate={{
        scale: [1, 1.2, 1],
        rotate: [0, 180, 360],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      {/* Lueur de fond pulsante */}
      <motion.div 
        className="absolute inset-0 bg-mystique-rose/40 rounded-full blur-2xl"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.3, 0.7, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Étoile mystique SVG */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full text-mystique-rose drop-shadow-[0_0_15px_rgba(183,110,121,0.8)] z-10"
      >
        <path
          d="M12 1L14 9L22 11L14 13L12 21L10 13L2 11L10 9L12 1Z"
          fill="url(#gold-gradient)"
        />
        <path
          d="M12 4L13 10L19 11L13 12L12 18L11 12L5 11L11 10L12 4Z"
          fill="rgba(255,255,255,0.7)"
        />
        
        <defs>
          <linearGradient id="gold-gradient" x1="2" y1="1" x2="22" y2="21" gradientUnits="userSpaceOnUse">
            <stop stopColor="#b76e79" />
            <stop offset="0.5" stopColor="#8e44ad" />
            <stop offset="1" stopColor="#1a0f2e" />
          </linearGradient>
        </defs>
      </svg>
    </motion.div>
  );
};
