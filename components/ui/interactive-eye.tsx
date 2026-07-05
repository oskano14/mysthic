"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export function InteractiveEye() {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth springs for fluid motion
  const mouseXSpring = useSpring(x, { stiffness: 70, damping: 25 });
  const mouseYSpring = useSpring(y, { stiffness: 70, damping: 25 });

  // 3D Rotations (Tilt)
  const rotateX = useTransform(mouseYSpring, [-1, 1], ["25deg", "-25deg"]);
  const rotateY = useTransform(mouseXSpring, [-1, 1], ["-25deg", "25deg"]);
  
  // Subtle translation for parallax effect
  const translateX = useTransform(mouseXSpring, [-1, 1], [-15, 15]);
  const translateY = useTransform(mouseYSpring, [-1, 1], [-15, 15]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return;
      
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Calculate normalized distance from center (-1 to 1)
      const mouseXPct = (e.clientX - centerX) / (window.innerWidth / 2);
      const mouseYPct = (e.clientY - centerY) / (window.innerHeight / 2);
      
      // Cap at -1 and 1
      x.set(Math.max(-1, Math.min(1, mouseXPct)));
      y.set(Math.max(-1, Math.min(1, mouseYPct)));
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [x, y]);

  return (
    <motion.div
      ref={ref}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className="relative w-40 h-40 md:w-56 md:h-56 z-20 group mx-auto perspective-1000"
    >
      {/* Lueur de fond réactive */}
      <motion.div
        className="absolute inset-0 rounded-full blur-3xl opacity-60 transition-opacity duration-700 group-hover:opacity-100"
        style={{
          background: "radial-gradient(circle, rgba(183,110,121,0.6) 0%, rgba(138,43,226,0) 70%)",
          x: translateX,
          y: translateY,
          transform: "translateZ(-20px)",
        }}
      />
      
      {/* L'Oeil 3D */}
      <motion.div
        className="relative w-full h-full rounded-full shadow-[0_0_50px_rgba(183,110,121,0.3)] border-2 border-mystique-rose/20 overflow-hidden bg-[#0a0515]/50 backdrop-blur-sm transition-all duration-500 group-hover:shadow-[0_0_80px_rgba(183,110,121,0.6)] group-hover:border-mystique-rose/50"
        style={{
          transform: "translateZ(30px)",
        }}
      >
        <motion.div 
          className="absolute inset-0"
          style={{ 
            x: useTransform(mouseXSpring, [-1, 1], [-20, 20]), 
            y: useTransform(mouseYSpring, [-1, 1], [-20, 20]) 
          }}
        >
          <Image
            src="/logo.png"
            alt="L'Oeil Mystique"
            fill
            sizes="(max-width: 768px) 160px, 224px"
            className="object-cover scale-[1.3]"
          />
        </motion.div>
        
        {/* Reflet dynamique superposé */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent rounded-full mix-blend-overlay"
          style={{
            x: useTransform(mouseXSpring, [-1, 1], [30, -30]),
            y: useTransform(mouseYSpring, [-1, 1], [30, -30]),
            transform: "translateZ(50px)"
          }}
        />
      </motion.div>
    </motion.div>
  );
}
