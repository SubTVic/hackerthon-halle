// ============================================================================
// CLASSIFY — eingehende Prozess-Nachricht -> ProcessEvent (fake-first)
// ============================================================================
// Klassifiziert eine rohe Nachricht (z.B. SMS vom Techniker) nach Typ +
// Schweregrad. Standard: leichtgewichtige Keyword-Heuristik (läuft ohne LLM,
// gut genug für die Demo). Optionaler echter LLM-Call kann ergänzt werden und
// fällt bei Fehler immer auf die Heuristik zurück.
// ============================================================================

import type { Channel } from "../canonical";
import type { EventType, Severity, SenderRole, ProcessEvent } from "./types";

const BLOCKER_HINTS = [
  "geht nicht", "passt nicht", "kein platz", "fehlt", "kaputt", "defekt",
  "beschädigt", "gesperrt", "kein zugang", "stopp", "abbruch", "gefahr",
];
const WARNING_HINTS = ["verzöger", "verspät", "wartet", "unklar", "rückfrage", "problem"];
const STATUS_HINTS = ["fertig", "abgeschlossen", "montiert", "installiert", "erledigt", "angeschlossen"];

/** Heuristische Klassifikation (real, deterministisch). */
export function classifyHeuristic(raw: string): { type: EventType; severity: Severity } {
  const t = raw.toLowerCase();
  if (BLOCKER_HINTS.some((h) => t.includes(h))) {
    return { type: "problem_report", severity: "blocker" };
  }
  if (WARNING_HINTS.some((h) => t.includes(h))) {
    return { type: "problem_report", severity: "warning" };
  }
  if (STATUS_HINTS.some((h) => t.includes(h))) {
    return { type: "status_update", severity: "info" };
  }
  if (t.includes("?")) return { type: "question", severity: "info" };
  return { type: "status_update", severity: "info" };
}

export interface RawMessage {
  requestId: string;
  at: string;
  channel: Channel;
  senderRole: SenderRole;
  body: string;
  subject?: string | null;
}

let seq = 0;
const nextId = (requestId: string) => `${requestId}-EVT-${String(++seq).padStart(3, "0")}`;

/**
 * Wandelt eine rohe eingehende Nachricht in ein klassifiziertes ProcessEvent.
 * fake-first: nutzt die Heuristik.
 *
 * TODO(sonnet, optional): echten LLM-Call davor schalten (Typ/Severity/
 *   relatedPath bestimmen), bei Fehler auf classifyHeuristic zurückfallen.
 */
export function classifyMessage(msg: RawMessage): ProcessEvent {
  const { type, severity } = classifyHeuristic(msg.body);
  return {
    id: nextId(msg.requestId),
    requestId: msg.requestId,
    at: msg.at,
    channel: msg.channel,
    direction: "inbound",
    senderRole: msg.senderRole,
    type,
    severity,
    subject: msg.subject ?? null,
    body: msg.body,
    resolved: severity === "blocker" ? false : undefined,
    _meta: { sourceRaw: msg.body },
  };
}
