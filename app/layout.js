import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

// ─── Polices personnalisées ────────────────────────────────────────────────
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ─── Métadonnées de l'app ──────────────────────────────────────────────────
export const metadata = {
  title: "Mysthic Tarot",
  description: "Découvrez votre destinée par les cartes sacrées !",
};

// ─── Layout racine ─────────────────────────────────────────────────────────
export default function RootLayout({ children }) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-mystique-gold`}
      >
        {/* Barre de navigation globale */}
        <Navbar />

        {/* Contenu des pages  (décalé de 64 px = h-16) */}
        <main className="pt-16">{children}</main>
      </body>
    </html>
  );
}
