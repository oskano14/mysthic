import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import CardSelection from './pages/CardSelection'
import Prediction from './pages/Prediction'

function App() {
  return (
    <div className="min-h-screen bg-mystique-gradient relative">
      <Navbar />
      <main className="relative z-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/selection" element={<CardSelection />} />
          <Route path="/prediction" element={<Prediction />} />
        </Routes>
      </main>
    </div>
  )
}

export default App