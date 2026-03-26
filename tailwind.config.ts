import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Stitch "Monolithic Intelligence" Design Tokens ──
        surface: {
          DEFAULT: "#131313",
          dim: "#131313",
          bright: "#3a3939",
          container: {
            DEFAULT: "#201f1f",
            low: "#1c1b1b",
            lowest: "#0e0e0e",
            high: "#2a2a2a",
            highest: "#353534",
          },
          variant: "#353534",
          tint: "#adc6ff",
        },
        primary: {
          DEFAULT: "#adc6ff",
          container: "#4d8eff",
          fixed: "#d8e2ff",
          "fixed-dim": "#adc6ff",
          "on-primary": "#002e6a",
          "on-container": "#00285d",
        },
        secondary: {
          DEFAULT: "#ddb7ff",
          container: "#6f00be",
          fixed: "#f0dbff",
          "fixed-dim": "#ddb7ff",
          "on-secondary": "#490080",
          "on-container": "#d6a9ff",
        },
        tertiary: {
          DEFAULT: "#ffb786",
          container: "#df7412",
        },
        "on-surface": "#e5e2e1",
        "on-surface-variant": "#c2c6d6",
        outline: "#8c909f",
        "outline-variant": "#424754",
        // Legacy aliases for backward compat
        navy: "#131313",
        "navy-light": "#1c1b1b",
        green: "#4d8eff",
        "green-light": "#d8e2ff",
        orange: "#ffb786",
        "orange-light": "#ffdcc6",
        muted: "#8c909f",
        "bug-red": "#ffb4ab",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        "primary-gradient":
          "linear-gradient(135deg, #adc6ff 0%, #4d8eff 100%)",
        "secondary-gradient":
          "linear-gradient(135deg, #ddb7ff 0%, #6f00be 100%)",
        "surface-gradient":
          "linear-gradient(180deg, #131313 0%, #0e0e0e 100%)",
        "hero-glow":
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(173,198,255,0.10) 0%, transparent 100%)",
        "card-glow":
          "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(77,142,255,0.08) 0%, transparent 70%)",
      },
      boxShadow: {
        glow: "0 0 24px rgba(173,198,255,0.12)",
        "glow-sm": "0 0 12px rgba(173,198,255,0.08)",
        ambient: "0px 20px 40px rgba(0,0,0,0.4)",
        float: "0px 12px 32px rgba(0,0,0,0.5)",
        primary:
          "0 0 0 2px rgba(173,198,255,0.2), 0px 20px 40px rgba(0,0,0,0.4)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "terminal-blink": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 12px rgba(173,198,255,0.08)" },
          "50%": { boxShadow: "0 0 32px rgba(173,198,255,0.22)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        shimmer: "shimmer 2.4s linear infinite",
        "fade-in-up": "fade-in-up 0.5s ease-out forwards",
        "terminal-blink": "terminal-blink 1.1s step-end infinite",
        float: "float 3s ease-in-out infinite",
        "glow-pulse": "glow-pulse 2.5s ease-in-out infinite",
        "pulse-slow": "pulse 3s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
