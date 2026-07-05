"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Moon, Stars } from "lucide-react";
import Image from "next/image";

export default function Navbar() {
  const pathname = usePathname();

  const linkClass = (href: string) =>
    `relative font-elegant text-sm transition-all duration-300 hover:text-mystique-rose ${
      pathname === href ? "text-mystique-rose" : "text-mystique-rose/70"
    }`;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0515]/90 backdrop-blur-lg border-b border-mystique-rose/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo ----------------------------------------------------------- */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-full flex items-center justify-center group-hover:animate-glow transition-all duration-300">
              <Image
                 src="/logo.png"
                 alt="mystic Logo"
                 width={40}
                 height={40}
                 className="rounded-full shadow-[0_0_40px_rgba(183,110,121,0.5)]"
              />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold font-mystique bg-rose-gradient bg-clip-text text-transparent group-hover:text-shadow-glow transition-all duration-300">
                MYSTHIC
              </span>
              <span className="text-xs text-mystique-rose/70 font-elegant tracking-wide">
                Prédiction &amp; Intuition
              </span>
            </div>
          </Link>

          {/* Liens desktop -------------------------------------------------- */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className={linkClass("/")}>
              Accueil
              {pathname === "/" && (
                <span className="absolute -bottom-2 inset-x-0 h-0.5 bg-rose-gradient rounded-full" />
              )}
            </Link>

            <Link href="/selection" className={linkClass("/selection")}>
              Tirage
              {pathname === "/selection" && (
                <span className="absolute -bottom-2 inset-x-0 h-0.5 bg-rose-gradient rounded-full" />
              )}
            </Link>

            <div className="flex items-center space-x-2 text-mystique-rose/50">
              <Moon className="w-4 h-4 animate-pulse" />
              <Stars className="w-4 h-4 animate-sparkle" />
            </div>
          </div>

          {/* Bouton menu mobile --------------------------------------------- */}
          <button className="md:hidden text-mystique-rose hover:text-mystique-rose/80 transition-colors">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}
