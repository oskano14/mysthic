/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        mystique: ["Cormorant Garamond", "serif"],
        elegant: ["Montserrat", "sans-serif"],
      },
      colors: {
        background: "#0a0515", // Deep dark purple/black
        foreground: "#b76e79", // Rose Gold
        mystique: {
          rose: "#b76e79", // Rose Gold
          gold: "#d4af37", // Classic gold fallback
          amethyst: "#8e44ad",
          dark: "#1a0f2e",
          darker: "#120a22",
          deepest: "#0a0515",
        },
        cosmic: {
          purple: "#4a154b",
          blue: "#16213e",
          pink: "#b76e79",
          orange: "#FF8500",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      backgroundImage: {
        "mystique-gradient":
          "linear-gradient(135deg, #1a0f2e 0%, #120a22 50%, #0a0515 100%)",
        "rose-gradient":
          "linear-gradient(135deg, #b76e79 0%, #8e44ad 50%, #4a154b 100%)",
        "cosmic-gradient":
          "linear-gradient(135deg, #8e44ad 0%, #b76e79 50%, #d4af37 100%)",
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        glow: "glow 2s ease-in-out infinite alternate",
        sparkle: "sparkle 3s linear infinite",
        flip: "flip 0.8s ease-in-out",
        "slide-up": "slideUp 0.6s ease-out",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 20px rgba(183, 110, 121, 0.5)" }, // Rose gold glow
          "100%": { boxShadow: "0 0 40px rgba(183, 110, 121, 0.8)" },
        },
        sparkle: {
          "0%, 100%": { opacity: "0" },
          "50%": { opacity: "1" },
        },
        flip: {
          "0%": { transform: "rotateY(0deg)" },
          "50%": { transform: "rotateY(90deg)" },
          "100%": { transform: "rotateY(0deg)" },
        },
        slideUp: {
          "0%": { transform: "translateY(100px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
