import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Sparkles, Moon, Stars } from 'lucide-react'

const Navbar = () => {
  const location = useLocation()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-mystique-deepest/90 backdrop-blur-lg border-b border-mystique-gold/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-10 h-10 bg-gold-gradient rounded-full flex items-center justify-center group-hover:animate-glow transition-all duration-300">
                <Sparkles className="w-6 h-6 text-mystique-deepest" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-cosmic-purple rounded-full animate-pulse"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold font-mystique bg-gold-gradient bg-clip-text text-transparent group-hover:text-shadow-glow transition-all duration-300">
                MYSTIC
              </span>
              <span className="text-xs text-mystique-gold/70 font-elegant tracking-wide">
                Prédictions & Intuition
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`relative font-elegant text-sm transition-all duration-300 hover:text-mystique-gold ${
                location.pathname === '/' ? 'text-mystique-gold' : 'text-mystique-gold/70'
              }`}
            >
              Accueil
              {location.pathname === '/' && (
                <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gold-gradient rounded-full"></div>
              )}
            </Link>
            <Link
              to="/selection"
              className={`relative font-elegant text-sm transition-all duration-300 hover:text-mystique-gold ${
                location.pathname === '/selection' ? 'text-mystique-gold' : 'text-mystique-gold/70'
              }`}
            >
              Tirage
              {location.pathname === '/selection' && (
                <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gold-gradient rounded-full"></div>
              )}
            </Link>
            <div className="flex items-center space-x-2 text-mystique-gold/50">
              <Moon className="w-4 h-4 animate-pulse" />
              <Stars className="w-4 h-4 animate-sparkle" />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button className="text-mystique-gold hover:text-mystique-gold/80 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar