import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: "index.html",
        background: "src/background.ts",
        content: "src/content.ts"
      },
      output: {
        entryFileNames: "[name].js"
      }
    }
  },
  css: {
    modules: {
      localsConvention: "camelCase"
    }
  }
});
