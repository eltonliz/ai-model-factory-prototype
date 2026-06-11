import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const isProduction = process.env.NODE_ENV === "production";

export default defineConfig({
  base: isProduction ? "/ai-model-factory-prototype/" : "/",
  optimizeDeps: {
    include: ["react", "react-dom/client"],
  },
  server: {
    warmup: {
      clientFiles: ["./src/main.tsx"],
    },
  },
  plugins: [react()],
});
