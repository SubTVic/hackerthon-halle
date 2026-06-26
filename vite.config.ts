import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Single-page demo. No real backend — optional LLM call happens client-side
// in ingest/llmParser.ts and ALWAYS has a hardcoded fallback so the live demo
// never breaks. Deploy target: Vercel (static build).
export default defineConfig({
  plugins: [react()],
});
