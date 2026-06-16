import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        pitch: "#0A1410", // fondo: noche en el estadio
        field: "#102A1E", // superficie / tarjetas
        line: "#3A5C4A", // líneas de cal
        chalk: "#EAF2EC", // texto
        amber: "#FFB020", // acento: reflector del marcador
        led: "#36D399", // verde LED para "finalizado / acierto"
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
