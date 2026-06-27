// ============================================================================
// PROJEKT-MODELL — projektzentrierte Vorgangsbearbeitung
// ============================================================================
// Ein Netzbetreiber bearbeitet pro Projekt (z.B. Rechenzentrum, EFH, Windpark)
// viele eingehende Nachrichten über verschiedene Kanäle. Jede Nachricht wird
// klassifiziert, einem Projekt + Thread zugeordnet, gegen das aktuelle
// Anforderungsprofil geprüft und beantwortet (nach menschlicher Freigabe).
// ============================================================================

export type ProjectType = "datacenter" | "household" | "windturbine";

/** Kanäle. Brief = gescannt, danach wie E-Mail behandelt. */
export type MessageChannel = "email" | "letter" | "call";

/** Wer schreibt? Bestimmt u.a. die Sprache der Antwort. */
export type SenderRole =
  | "project_manager" // Projektleiter / kaufmännisch
  | "technician" // Techniker / Elektrofachkraft
  | "investor" // Investor / Bauherr
  | "authority" // Behörde / Kommune
  | "installer"; // Errichter / Fachbetrieb

/**
 * Kategorie-Code für die Thread-Nummer (1654.T.01).
 * Buchstabe steht für die Art der Anfrage.
 */
export type CategoryCode =
  | "T" // Technische Anfrage
  | "A" // Antrag / Anmeldung
  | "N" // Nachforderung / Rückfrage
  | "D" // Dokument / Nachweis
  | "B" // Beschwerde / Eskalation
  | "S"; // Statusanfrage

export const CATEGORY_LABEL: Record<CategoryCode, string> = {
  T: "Technische Anfrage",
  A: "Antrag / Anmeldung",
  N: "Nachforderung",
  D: "Dokument / Nachweis",
  B: "Beschwerde / Eskalation",
  S: "Statusanfrage",
};

export interface Attachment {
  name: string;
  kind: "pdf" | "image" | "cad" | "spreadsheet";
}

/** Eine rohe eingehende Nachricht, wie sie im Posteingang landet. */
export interface IncomingMessage {
  id: string;
  /** Projekt, auf das sich die Nachricht bezieht (vom Absender genannt). */
  refHint: string | null; // z.B. "1654" — kann fehlen/falsch sein
  channel: MessageChannel;
  senderName: string;
  senderRole: SenderRole;
  subject: string;
  body: string;
  receivedAt: string; // ISO-8601
  attachments: Attachment[];
  /** Bei Brief: war Scan/OCR nötig? */
  scanned?: boolean;
}

/** Ergebnis der Klassifikation einer Nachricht. */
export interface Classification {
  projectRef: string; // z.B. "1654"
  category: CategoryCode;
  threadId: string; // z.B. "1654.T.01"
  topic: string; // Kurzthema für Thread-Gruppierung
  confidence: number; // 0..1
  /** Auf welches Anforderungsfeld zahlt die Nachricht ein? */
  relatedRequirement?: string | null;
  /** Doppelte Anfrage zum gleichen Thema vom gleichen Absender? */
  duplicateOf?: string | null; // messageId
}

/** Eine klassifizierte Nachricht = Roh-Nachricht + Klassifikation. */
export interface ClassifiedMessage {
  message: IncomingMessage;
  classification: Classification;
}

/** Ein Thread bündelt alle Nachrichten eines Themas/Vorgangs. */
export interface Thread {
  id: string; // 1654.T.01
  projectRef: string;
  category: CategoryCode;
  topic: string;
  messages: ClassifiedMessage[];
  /** Mehrere Nachrichten desselben Absenders zum selben Thema. */
  compiledCount: number; // wie viele Nachrichten zusammengefasst wurden
}

export interface Project {
  ref: string; // zentrale Referenznummer, z.B. "1654"
  type: ProjectType;
  title: string;
  applicant: string;
  location: string;
  powerLabel: string; // z.B. "12 MW Anschlussleistung"
  phaseLabel: string;
}
