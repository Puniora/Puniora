import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        heading: ['"Playfair Display"', 'serif'],
        body: ['"Lato"', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
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
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        gold: {
          DEFAULT: "#D4AF37", // Classic Metallic Gold
          light: "#F3E5AB",   // Champagne/Vanilla
          dark: "#AA8C2C",    // Antique Gold
          50: "#FCFBF4",
          100: "#F9F6E8",
          200: "#F3EACE",
          300: "#ECDDB4",
          400: "#E6D19B",
          500: "#D4AF37",
          600: "#AA8C2C",
          700: "#806921",
          800: "#554616",
          900: "#2B230B",
        },
        cream: {
          DEFAULT: "#FDFCF8", // Rich Ivory
          50: "#FFFFFF",
          100: "#FEFEFD",
          200: "#FDFCF8",
          300: "#FBF9F0",
          400: "#F9F5E6",
          500: "#F6F1DB",
        },
        bronze: {
          DEFAULT: "#5E4B35", // Deep warm brown for text
          dark: "#2A2118",     // Nearly black brown
        },
        charcoal: {
          DEFAULT: "#1A1A1A", // Softer black
          light: "#333333",
        },
        // Old Void colors removed/remapped
        void: {
          DEFAULT: "#020202",
          light: "#0A0A0A",
        },
        alabaster: "hsl(var(--alabaster))",
        cream: "hsl(var(--cream))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        'gradient-gold': 'linear-gradient(135deg, hsl(var(--gold-light)) 0%, hsl(var(--gold)) 100%)',
        'gradient-dark': 'linear-gradient(to bottom, hsl(var(--charcoal)) 0%, #000000 100%)',
        'gradient-card': 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%)',
        'shimmer-overlay': 'linear-gradient(to right, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
        'gradient-cosmic': 'radial-gradient(circle at center, rgba(212, 175, 55, 0.08) 0%, rgba(2, 2, 2, 0) 70%)',
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        shimmer: "shimmer 2s infinite",
        float: "float 6s ease-in-out infinite",
        "fade-in-up": "fade-in-up 0.8s ease-out forwards",
        "fade-in": "fade-in 1s ease-out forwards",
        "zoom-in": "zoom-in 0.6s ease-out forwards",
        "slide-in-right": "slide-in-right 0.8s ease-out forwards",
        "pulse-glow": "pulse-glow 4s infinite",
        "reveal": "reveal 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards",
        "spin-slow": "spin 12s linear infinite",
        "liquid": "liquid 15s ease infinite",
        "mesh": "mesh 20s ease-in-out infinite",
        "float-slow": "float 8s ease-in-out infinite",
      },
      keyframes: {
        mesh: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        liquid: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "zoom-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 0 0px rgba(212, 175, 55, 0)" },
          "50%": { boxShadow: "0 0 25px 5px rgba(212, 175, 55, 0.15)" },
        },
        reveal: {
          "0%": { opacity: "0", transform: "translateY(40px) scale(0.95)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        }
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
