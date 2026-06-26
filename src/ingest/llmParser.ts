// ============================================================================
// LLM-PARSER (HALB-FAKE / OPTIONAL)
// ============================================================================
// Wandelt Rohtext -> kanonisches JSON via LLM. Für "so schnell wie möglich
// testen" ist das standardmäßig AUS (USE_LLM=false) — dann liefert ingest/
// direkt das Fallback-JSON und die Demo läuft ohne API-Key.
//
// TODO(sonnet, optional, NUR wenn Zeit übrig):
//   - echten Claude-Call einbauen (claude-opus-4-8 oder sonnet),
//     System-Prompt = canonical/types.ts als Zielschema beschreiben,
//     response als JSON parsen.
//   - Bei jedem Fehler (kein Key, Timeout, ungültiges JSON) MUSS auf das
//     Fallback zurückgefallen werden -> die Live-Demo darf NIE brechen.
// ============================================================================

import type { CanonicalRequest } from "../canonical";

/** Schalter: solange false, wird gar nicht erst ein LLM kontaktiert. */
export const USE_LLM = false;

export async function parseWithLlm(_raw: string): Promise<CanonicalRequest | null> {
  if (!USE_LLM) return null;

  // TODO(sonnet): echten Call implementieren. Skizze:
  //   const res = await fetch("https://api.anthropic.com/v1/messages", { ... });
  //   const json = JSON.parse(extractJson(res));
  //   return coerceToCanonical(json);
  // Bei Fehler: return null (-> ingest nutzt Fallback).
  return null;
}
