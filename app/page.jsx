"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Italic as Crystal, Zap, Music } from "lucide-react";

export default function Home() {
  const features = [
    {
      icon: <Crystal className="w-8 h-8" />,
      title: "Cartes Sacrées",
      description: "22 arcanes majeurs pour révéler votre destinée",
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "IA Mystique",
      description:
        "Interprétations personnalisées par intelligence artificielle",
    },
    {
      icon: <Music className="w-8 h-8" />,
      title: "Ambiance Sonore",
      description: "Musiques adaptées à vos prédictions",
    },
  ];

  return (
    <div className="min-h-screen pt-16 relative overflow-hidden">
      {/* Hero Section */}
      <motion.div
        className="relative px-4 py-20 text-center"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <div className="max-w-4xl mx-auto">
          <motion.h1
            className="text-6xl md:text-8xl font-mystique font-bold bg-gold-gradient bg-clip-text text-transparent mb-6"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            MYSTIC
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-mystique-gold/80 font-elegant mb-12 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            Découvrez les secrets de votre destinée à travers les cartes sacrées
            du tarot, guidé par l'intelligence artificielle et bercé par des
            mélodies mystiques
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Link href="/selection">
              <button className="mystique-button text-xl group relative overflow-hidden">
                <span className="relative z-10 flex items-center space-x-3">
                  <Sparkles className="w-6 h-6 group-hover:animate-spin transition-transform duration-300" />
                  <span>Commencer mon tirage</span>
                </span>
                <div className="absolute inset-0 bg-cosmic-gradient opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
              </button>
            </Link>
          </motion.div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 animate-float">
          <div className="w-16 h-16 bg-mystique-gold/20 rounded-full blur-xl"></div>
        </div>
        <div className="absolute top-40 right-20 animate-float animation-delay-400">
          <div className="w-12 h-12 bg-cosmic-purple/30 rounded-full blur-lg"></div>
        </div>
        <div className="absolute bottom-20 left-1/4 animate-float animation-delay-600">
          <div className="w-8 h-8 bg-cosmic-pink/40 rounded-full blur-md"></div>
        </div>
      </motion.div>

      {/* Features Section */}
      <motion.div
        className="px-4 py-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-mystique font-bold text-center mb-16 mystique-text">
            Une Expérience Unique
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="text-center p-8 bg-mystique-darker/40 rounded-2xl border border-mystique-gold/20 hover:border-mystique-gold/40 transition-all duration-300 card-hover backdrop-blur-sm"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 + index * 0.2 }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gold-gradient rounded-full mb-6 text-mystique-deepest">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-mystique font-bold mb-4 text-mystique-gold">
                  {feature.title}
                </h3>
                <p className="text-mystique-gold/70 font-elegant leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Mystical Decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-0 w-px h-32 bg-gradient-to-b from-transparent via-mystique-gold/30 to-transparent"></div>
        <div className="absolute top-1/2 right-0 w-px h-40 bg-gradient-to-b from-transparent via-mystique-gold/30 to-transparent"></div>
        <div className="absolute bottom-1/4 left-1/2 w-40 h-px bg-gradient-to-r from-transparent via-mystique-gold/30 to-transparent"></div>
      </div>
    </div>
  );
}
