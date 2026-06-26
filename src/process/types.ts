// ============================================================================
// PROCESS — Kommunikation WÄHREND des Vorgangs (nach dem Erstantrag)
// ============================================================================
// Der Funnel endet nicht beim Erstantrag. Über den gesamten Lebenszyklus
// (Antrag -> Prüfung -> Bau/Installation -> Inbetriebnahme) kommen weitere
// Nachrichten rein: Statusmeldungen, Rückfragen, und vor allem PROBLEMMELDUNGEN
// (z.B. der Techniker meldet per SMS ein Problem auf der Baustelle).
//
// Jede dieser Nachrichten wird als ProcessEvent erfasst, klassifiziert und an
// den Vorgang (requestId) gehängt — so entsteht eine durchgehende Akte/Timeline.
// ============================================================================

import type { Channel } from "../canonical";

/** Phasen angelehnt an das VDE-Datenset (Antragphase 1/2, Inbetriebnahme). */
export type ProcessPhase =
  | "application_phase_1" // Mindestangaben
  | "application_phase_2" // Vervollständigung
  | "construction" // Bau / Installation vor Ort
  | "commissioning" // Inbetriebnahme
  | "completed";

/** Wer hat die Nachricht geschickt? */
export type SenderRole =
  | "applicant" // Antragsteller / Anlagenbetreiber
  | "installer" // Elektrofachbetrieb
  | "technician" // Monteur/Techniker auf der Baustelle
  | "grid_operator" // Sachbearbeiter Netzbetreiber
  | "system"; // automatisch erzeugt

/** Art der Nachricht — bestimmt, was im Prozess passieren muss. */
export type EventType =
  | "status_update" // "Montage abgeschlossen"
  | "problem_report" // "Zählerschrank passt nicht" -> Handlung nötig
  | "question" // Rückfrage
  | "info_request" // Nachforderung (vom Netzbetreiber raus)
  | "document_submitted" // Nachweis/Plan nachgereicht
  | "appointment"; // Terminabstimmung

export type Severity = "info" | "warning" | "blocker";

/** Ein einzelnes Kommunikations-Ereignis im Vorgang. */
export interface ProcessEvent {
  id: string;
  /** Verknüpfung zur kanonischen Anfrage. */
  requestId: string;
  at: string; // ISO-8601
  channel: Channel; // z.B. "sms"
  direction: "inbound" | "outbound";
  senderRole: SenderRole;
  type: EventType;
  severity: Severity;
  subject: string | null;
  body: string;
  /** Optional betroffenes kanonisches Feld / Komponente (z.B. Messkonzept). */
  relatedPath?: string | null;
  /** Offene Problemmeldung erledigt? */
  resolved?: boolean;
  /** Roh-Eingang + Parser-Konfidenz, analog zu canonical._meta. */
  _meta?: { sourceRaw: string; confidence?: number };
}

/** Der laufende Vorgang: Anfrage + Phase + Kommunikations-Timeline. */
export interface ProcessCase {
  requestId: string;
  phase: ProcessPhase;
  events: ProcessEvent[];
}
