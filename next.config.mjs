/** @type {import('next').NextConfig} */
const nextConfig = {
  // Le moteur TTS (Kokoro + espeak-ng) tourne 100 % dans le navigateur et est
  // chargé hors-webpack depuis /public/vendor (voir lib/tts-browser.js), donc
  // aucune configuration de bundling particulière n'est nécessaire ici.
};

export default nextConfig;
