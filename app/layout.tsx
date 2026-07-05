// @ts-ignore
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "MYSTHIC Tarot",
  description: "Découvrez votre destinée par les cartes sacrées !",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body
        className={`antialiased bg-[#0a0515] text-mystique-rose`}
      >
        {/* Barre de navigation globale */}
        <Navbar />

        {/* Contenu des pages  (décalé de 64 px = h-16) */}
        <main className="pt-16">{children}</main>
      </body>
    </html>
  );
}
