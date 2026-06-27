// ============================================================================
// PROCESS — Vorgangs-Timeline & offene Punkte
// ============================================================================
// Hält den laufenden Vorgang (ProcessCase) und nimmt Kommunikation über den
// gesamten Lebenszyklus auf. Eine eingehende Problemmeldung (z.B. Techniker-SMS)
// wird klassifiziert, an die Timeline gehängt und als offener Blocker geführt,
// bis sie aufgelöst ist.
// ============================================================================

import type { CanonicalRequest } from "../canonical";
import type { ProcessCase, ProcessEvent, ProcessPhase } from "./types";
import { classifyMessage, type RawMessage } from "./classify";

export * from "./types";
export { classifyMessage, classifyHeuristic } from "./classify";
export type { RawMessage } from "./classify";
export { extractFromEvent } from "./extract";
export type { ExtractedField, CrmUpdate, ExtractionResult } from "./extract";
export { initialCrmRecord, applyCrmUpdates } from "./caseDb";
export type { CrmRecord, Milestone, PendingItem, CaseNote } from "./caseDb";
export { translateForStakeholders } from "./translate";
export type { Stakeholder, StakeholderPerspective, TranslatedProblem } from "./translate";

/** Legt einen Vorgang aus einer kanonischen Anfrage an (mit Start-Event). */
export function openCase(req: CanonicalRequest, phase: ProcessPhase = "application_phase_1"): ProcessCase {
  return {
    requestId: req.requestId,
    phase,
    events: [
      {
        id: `${req.requestId}-EVT-000`,
        requestId: req.requestId,
        at: req.receivedAt,
        channel: req.channel,
        direction: "inbound",
        senderRole: "applicant",
        type: "status_update",
        severity: "info",
        subject: "Anfrage eingegangen",
        body: "Netzanschluss-Anfrage über " + req.channel + " erfasst.",
      },
    ],
  };
}

/**
 * Nimmt eine eingehende Nachricht auf: klassifiziert sie und hängt das Event
 * (chronologisch) an die Timeline. Reiner, testbarer Funktionsstil.
 */
export function receiveMessage(kase: ProcessCase, msg: RawMessage): ProcessCase {
  const event = classifyMessage(msg);
  const events = [...kase.events, event].sort((a, b) => a.at.localeCompare(b.at));
  // TODO(sonnet): Phase ggf. anhand des Event-Typs fortschreiben
  //   (z.B. status_update "angeschlossen" -> phase "commissioning").
  return { ...kase, events };
}

/** Hängt ein bereits gebautes Event an (z.B. ausgehende Antwort). */
export function appendEvent(kase: ProcessCase, event: ProcessEvent): ProcessCase {
  const events = [...kase.events, event].sort((a, b) => a.at.localeCompare(b.at));
  return { ...kase, events };
}

/** Offene Blocker = unaufgelöste Problemmeldungen mit severity "blocker". */
export function openBlockers(kase: ProcessCase): ProcessEvent[] {
  return kase.events.filter(
    (e) => e.type === "problem_report" && e.severity === "blocker" && e.resolved === false,
  );
}

/** True, wenn der Vorgang aktuell durch ein offenes Problem blockiert ist. */
export function isBlocked(kase: ProcessCase): boolean {
  return openBlockers(kase).length > 0;
}
