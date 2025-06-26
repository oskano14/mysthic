import React, { useState, useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Play, Pause, Music, Sparkles, Loader2, Volume2, Star } from 'lucide-react'

const Prediction = () => {
  const location = useLocation()
  const { selectedCards } = location.state || { selectedCards: [] }
  const [prediction, setPrediction] = useState('')
  const [musicRecommendation, setMusicRecommendation] = useState(null)
  const [isLoadingPrediction, setIsLoadingPrediction] = useState(true)
  const [isLoadingMusic, setIsLoadingMusic] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(180) // 3 minutes par défaut

  useEffect(() => {
    if (selectedCards.length > 0) {
      generatePrediction()
    }
  }, [selectedCards])

  const generatePrediction = async () => {
    setIsLoadingPrediction(true)
    
    // Simulation d'un appel à l'API Mistral
    await new Promise(resolve => setTimeout(resolve, 4000))
    
    const mockPrediction = `🌟 **VOTRE DESTINÉE RÉVÉLÉE** 🌟

**PASSÉ • ${selectedCards[0]?.name}**
Les énergies du passé révèlent une période de transformation profonde. ${selectedCards[0]?.meaning} Cette carte indique que vous avez traversé des épreuves qui ont forgé votre sagesse actuelle. Les leçons apprises durant cette période continuent d'influencer votre parcours spirituel.

**PRÉSENT • ${selectedCards[1]?.name}**
Actuellement, vous vous trouvez à un carrefour spirituel décisif. ${selectedCards[1]?.meaning} C'est le moment de faire confiance à votre intuition profonde et d'embrasser les changements qui s'offrent à vous. L'univers vous guide vers une nouvelle compréhension de votre véritable nature.

**FUTUR • ${selectedCards[2]?.name}**
L'avenir vous réserve des révélations surprenantes et transformatrices. ${selectedCards[2]?.meaning} Une nouvelle phase de votre existence s'ouvre, remplie de promesses et d'opportunités inattendues. Votre âme s'apprête à franchir un seuil important vers l'épanouissement.

**CONSEIL MYSTIQUE**
Les cartes vous invitent à maintenir l'équilibre sacré entre votre monde intérieur et extérieur. Méditez sur ces messages divins et laissez votre âme vous guider vers votre véritable destinée. L'univers conspire en votre faveur - restez ouvert aux signes et synchronicités qui se manifesteront dans les jours à venir.

*Que la lumière des étoiles illumine votre chemin...*`
    
    setPrediction(mockPrediction)
    setIsLoadingPrediction(false)
    
    // Générer la recommandation musicale après la prédiction
    setTimeout(() => {
      generateMusicRecommendation()
    }, 1500)
  }

  const generateMusicRecommendation = async () => {
    setIsLoadingMusic(true)
    
    // Simulation d'un appel à l'API Spotify
    await new Promise(resolve => setTimeout(resolve, 2500))
    
    const mockMusic = {
      title: "Mystical Awakening",
      artist: "Cosmic Meditation Ensemble",
      album: "Sacred Journeys",
      genre: "Ambient Mystique",
      description: "Cette mélodie éthérée aux sonorités cristallines accompagnera parfaitement votre réflexion sur cette lecture de tarot. Laissez-vous porter par ces harmonies célestes qui résonnent avec l'énergie de vos cartes.",
      spotifyUrl: "#",
      coverUrl: "https://images.pexels.com/photos/1540406/pexels-photo-1540406.jpeg?auto=compress&cs=tinysrgb&w=400",
      duration: "3:24"
    }
    
    setMusicRecommendation(mockMusic)
    setIsLoadingMusic(false)
  }

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
    // Ici vous intégreriez la vraie logique de lecture Spotify
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (selectedCards.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-mystique-gold mb-4">
            Aucune carte sélectionnée
          </h1>
          <Link to="/selection" className="mystique-button">
            Commencer un tirage
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-mystique-gold/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-mystique-gold/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-mystique-gold/2 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
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
              scale: [0, 1, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: Math.random() * 3
            }}
          />
        ))}
      </div>

      <div className="relative z-10 min-h-screen pt-20 px-8">
        {/* Header */}
        <motion.div 
          className="flex items-center justify-between mb-16"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Link 
            to="/selection" 
            className="flex items-center space-x-3 text-mystique-gold/70 hover:text-mystique-gold transition-all duration-300 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:animate-pulse" />
            <span className="font-elegant tracking-wider">NOUVEAU TIRAGE</span>
          </Link>
          
          <motion.h1 
            className="text-5xl font-bold bg-gradient-to-r from-mystique-gold via-mystique-bronze to-mystique-gold bg-clip-text text-transparent"
            animate={{ 
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity 
            }}
          >
            VOTRE PRÉDICTION
          </motion.h1>
          
          <div className="w-32"></div>
        </motion.div>

        {/* Selected Cards */}
        <motion.div 
          className="flex justify-center space-x-16 mb-20"
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
                stiffness: 80
              }}
              className="text-center group"
            >
              <div className="relative mb-6">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-mystique-gold/20 rounded-3xl blur-2xl group-hover:bg-mystique-gold/30 transition-all duration-700"></div>
                
                {/* Card */}
                <div className="relative w-48 h-72 rounded-3xl overflow-hidden border-2 border-mystique-gold/50 shadow-2xl group-hover:border-mystique-gold/70 transition-all duration-500">
                  <img
                    src={card.image}
                    alt={card.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="text-lg font-bold text-mystique-gold text-center">
                      {card.name}
                    </h3>
                  </div>
                </div>

                {/* Floating Elements */}
                <motion.div
                  className="absolute -top-4 -right-4 w-4 h-4 bg-mystique-gold rounded-full"
                  animate={{
                    y: [-10, 10, -10],
                    opacity: [0.3, 1, 0.3]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: index * 0.7
                  }}
                />
              </div>
              
              <div className="space-y-2">
                <span className="text-mystique-gold/60 font-elegant text-sm tracking-widest">
                  {index === 0 ? 'PASSÉ' : index === 1 ? 'PRÉSENT' : 'FUTUR'}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Prediction Section */}
        <motion.div 
          className="max-w-5xl mx-auto bg-black/40 backdrop-blur-sm rounded-3xl p-12 mb-16 border border-mystique-gold/20 relative overflow-hidden"
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
            <div className="flex items-center space-x-4 mb-8">
              <Sparkles className="w-8 h-8 text-mystique-gold animate-pulse" />
              <h2 className="text-3xl font-bold text-mystique-gold tracking-wide">
                INTERPRÉTATION MYSTIQUE
              </h2>
              <Sparkles className="w-8 h-8 text-mystique-gold animate-pulse" />
            </div>
            
            {isLoadingPrediction ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
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
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Music Recommendation */}
        {!isLoadingPrediction && (
          <motion.div 
            className="max-w-5xl mx-auto bg-black/40 backdrop-blur-sm rounded-3xl p-12 border border-mystique-gold/20 mb-16 relative overflow-hidden"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.5 }}
          >
            <div className="flex items-center space-x-4 mb-8">
              <Music className="w-8 h-8 text-mystique-gold animate-pulse" />
              <h2 className="text-3xl font-bold text-mystique-gold tracking-wide">
                AMBIANCE SONORE PERSONNALISÉE
              </h2>
              <Volume2 className="w-8 h-8 text-mystique-gold animate-pulse" />
            </div>
            
            {isLoadingMusic ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-4 border-mystique-gold/20 border-t-mystique-gold rounded-full mx-auto mb-4"
                  />
                  <p className="text-mystique-gold/70 font-elegant text-lg">
                    Sélection de la mélodie parfaite...
                  </p>
                  <p className="text-mystique-gold/50 font-elegant text-sm mt-2">
                    Harmonisation avec vos énergies...
                  </p>
                </div>
              </div>
            ) : musicRecommendation ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1 }}
                className="bg-black/30 rounded-2xl p-8 border border-mystique-gold/10"
              >
                <div className="flex items-center space-x-8">
                  {/* Album Cover */}
                  <div className="relative">
                    <motion.img
                      src={musicRecommendation.coverUrl}
                      alt="Album cover"
                      className="w-32 h-32 rounded-2xl shadow-2xl"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                    />
                    <div className="absolute inset-0 bg-mystique-gold/10 rounded-2xl"></div>
                  </div>

                  {/* Music Info */}
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-mystique-gold mb-2">
                      {musicRecommendation.title}
                    </h3>
                    <p className="text-mystique-gold/80 font-elegant text-lg mb-1">
                      {musicRecommendation.artist}
                    </p>
                    <p className="text-mystique-gold/60 text-sm mb-4">
                      {musicRecommendation.album} • {musicRecommendation.duration}
                    </p>
                    <p className="text-mystique-gold/70 font-elegant mb-6 leading-relaxed">
                      {musicRecommendation.description}
                    </p>

                    {/* Music Player */}
                    <div className="space-y-4">
                      {/* Play Button */}
                      <div className="flex items-center space-x-4">
                        <motion.button
                          onClick={togglePlay}
                          className="w-16 h-16 bg-gradient-to-r from-mystique-gold to-mystique-bronze rounded-full flex items-center justify-center text-black shadow-lg hover:shadow-2xl transition-all duration-300"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {isPlaying ? (
                            <Pause className="w-8 h-8" />
                          ) : (
                            <Play className="w-8 h-8 ml-1" />
                          )}
                        </motion.button>

                        <div className="flex-1">
                          <div className="flex items-center justify-between text-sm text-mystique-gold/60 mb-2">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="w-full bg-mystique-gold/20 rounded-full h-2 relative overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-mystique-gold to-mystique-bronze rounded-full"
                              style={{ width: `${(currentTime / duration) * 100}%` }}
                              animate={isPlaying ? {
                                width: ['0%', '100%']
                              } : {}}
                              transition={isPlaying ? {
                                duration: duration - currentTime,
                                ease: "linear"
                              } : {}}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Spotify Link */}
                      <motion.button
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full font-bold transition-all duration-300 flex items-center space-x-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <span>Écouter sur Spotify</span>
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                        </svg>
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default Prediction