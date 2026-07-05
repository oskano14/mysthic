"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Italic as Crystal, Zap, Music } from "lucide-react";
import { GLSLHills } from "@/components/ui/glsl-hills";
import { InteractiveEye } from "@/components/ui/interactive-eye";

export default function Home() {
  const features = [
    {
      icon: <Crystal className="w-8 h-8" />,
      title: "Cartes Sacrées",
      description: "22 arcanes majeurs pour révéler votre destinée",
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "Taroh",
      description:
        "Interprétations personnalisées par Taroh pour vous guider vers des réponses claires.",
    },
    {
      icon: <Music className="w-8 h-8" />,
      title: "Ambiance Sonore",
      description: "Musiques adaptées à vos prédictions",
    },
  ];

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-[#0a0515]">
      {/* 3D Background */}
      <GLSLHills />

      <main className="relative z-10 flex-grow flex flex-col pt-16">
        {/* Hero Section */}
        <motion.div
          className="relative px-4 py-20 text-center flex-grow flex flex-col justify-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <div className="max-w-4xl mx-auto flex flex-col items-center">

            <motion.div
              className="mb-8 relative perspective-1000"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <InteractiveEye />
            </motion.div>

            <motion.h1
              className="text-5xl md:text-8xl font-mystique font-bold text-mystique-rose mb-6 drop-shadow-2xl tracking-wider uppercase"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              MYSTHIC
            </motion.h1>

            <motion.p
              className="text-lg md:text-2xl text-mystique-rose/80 font-elegant mb-12 leading-relaxed max-w-2xl text-shadow-glow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              Éveillez votre intuition. Découvrez les secrets de votre destinée guidés par Taroh et l&apos;énergie des cartes.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <Link href="/selection">
                <button className="group relative overflow-hidden rounded-full px-10 py-5 text-xl font-mystique uppercase tracking-widest text-mystique-rose transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_0_60px_rgba(183,110,121,0.6)] border border-mystique-rose/40 hover:border-mystique-rose/80">
                  {/* Glass background */}
                  <div className="absolute inset-0 bg-[#0a0515]/60 backdrop-blur-md transition-all duration-500 group-hover:bg-[#0a0515]/40" />
                  
                  {/* Subtle sweep gradient */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-[length:200%_100%] bg-gradient-to-r from-transparent via-mystique-rose/20 to-transparent animate-[shimmer_2s_infinite]" />

                  {/* Button Content */}
                  <span className="relative z-10 flex items-center justify-center space-x-4 text-shadow-glow">
                    <Sparkles className="w-6 h-6 text-mystique-rose group-hover:animate-pulse" />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-mystique-rose via-white to-mystique-rose bg-[length:200%_auto] group-hover:animate-[shimmer_2s_infinite]">
                      Commencer mon tirage
                    </span>
                    <Sparkles className="w-6 h-6 text-mystique-rose group-hover:animate-pulse" />
                  </span>
                </button>
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Features Section */}
        <motion.div
          className="px-4 py-20 bg-gradient-to-t from-[#0a0515] via-[#0a0515]/80 to-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
        >
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-mystique font-bold text-center mb-16 text-mystique-rose text-shadow-glow">
              Une Expérience Intuitive
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="text-center p-8 bg-[#120a22]/60 rounded-2xl border border-mystique-rose/20 hover:border-mystique-rose/50 transition-all duration-300 backdrop-blur-md"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.2 + index * 0.2 }}
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-mystique-rose/10 rounded-full mb-6 text-mystique-rose border border-mystique-rose/30">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-mystique font-bold mb-4 text-mystique-rose">
                    {feature.title}
                  </h3>
                  <p className="text-mystique-rose/60 font-elegant leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
