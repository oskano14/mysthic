"use client";

import { motion } from "framer-motion";
import { InteractiveEye } from "@/components/ui/interactive-eye";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0515]/90 backdrop-blur-md">
      <div className="mb-8 scale-[0.7]">
        <InteractiveEye />
      </div>
      <motion.p
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="text-mystique-rose/90 font-mystique text-2xl md:text-3xl tracking-widest uppercase drop-shadow-glow"
      >
        Chargement en cours...
      </motion.p>
    </div>
  );
}
