// ============================================================================
// INGEST — Eingangs-Parser (Rohinput -> kanonisches JSON)
// ============================================================================
// fake-first: nutzt standardmäßig das hartkodierte Fallback-JSON pro Beispiel.
// Optional kann ein echter LLM-Call zugeschaltet werden (llmParser.ts), der bei
// jedem Fehler transparent auf das Fallback zurückfällt.
// ============================================================================

import type { CanonicalRequest } from "../canonical";
import type { ExampleInput } from "../examples";
import { FALLBACKS } from "./fallbacks";
import { parseWithLlm } from "./llmParser";

export interface IngestResult {
  request: CanonicalRequest;
  /** Woher kam das Ergebnis? Für ehrliche Anzeige im Pitch. */
  source: "llm" | "fallback";
}

/**
 * Übersetzt einen Beispiel-Eingang ins kanonische JSON.
 * Versucht (optional) LLM, fällt sonst auf das vorbereitete Fallback zurück.
 */
export async function ingest(example: ExampleInput): Promise<IngestResult> {
  try {
    const viaLlm = await parseWithLlm(example.raw);
    if (viaLlm) return { request: viaLlm, source: "llm" };
  } catch {
    // bewusst geschluckt — Demo darf nie brechen
  }
  return { request: FALLBACKS[example.id](example.raw), source: "fallback" };
}
