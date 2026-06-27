// ============================================================================
// ANTWORT-ENTWURF — in der Sprache des Empfängers, mit Freigabe-Schritt
// ============================================================================
// Aus Thread + offenen Anforderungen wird ein Antwortentwurf erzeugt. Der
// Tonfall richtet sich nach der Rolle des Absenders (Techniker bekommt
// Fachsprache, Projektleiter/Investor eine andere Ansprache). KEIN Versand
// ohne menschliche Freigabe — der Entwurf hat einen Status (Workflow).
// ============================================================================

import type { Requirement } from "./requirements";
import type { SenderRole, Thread } from "./types";
import { projectByRef } from "./data";

export type ApprovalStatus = "draft" | "approved" | "sent";

export interface ResponseDraft {
  threadId: string;
  to: string;
  toRole: SenderRole;
  tone: string; // kurze Beschreibung des Registers
  subject: string;
  body: string;
  status: ApprovalStatus;
}

const TONE: Record<SenderRole, string> = {
  technician: "Fachsprache, präzise, normbezogen",
  installer: "fachlich, knapp, handlungsorientiert",
  project_manager: "sachlich, terminorientiert, kaufmännisch",
  investor: "verständlich, beruhigend, ohne Fachjargon",
  authority: "formell, behördlich, mit Aktenzeichen",
};

const GREETING: Record<SenderRole, string> = {
  technician: "Hallo,",
  installer: "Guten Tag,",
  project_manager: "Sehr geehrter Herr / sehr geehrte Frau,",
  investor: "Sehr geehrte Damen und Herren,",
  authority: "Sehr geehrte Damen und Herren,",
};

/** Formuliert offene Anforderungen je nach Empfänger unterschiedlich. */
function describeOpen(reqs: Requirement[], role: SenderRole): string[] {
  if (reqs.length === 0) {
    return role === "investor"
      ? ["Aktuell liegen uns alle nötigen Unterlagen vor — wir treiben Ihren Vorgang aktiv voran."]
      : ["Es sind aktuell keine offenen Pflichtangaben zu Ihrem Vorgang vermerkt."];
  }
  return reqs.map((r) => {
    switch (role) {
      case "technician":
      case "installer":
        return `${r.label} (${r.legalBasis})`;
      case "investor":
        return plainLanguage(r);
      default:
        return `${r.label} — Grundlage: ${r.legalBasis}`;
    }
  });
}

/** Übersetzt eine Anforderung in Alltagssprache (für Investor/Bauherr). */
function plainLanguage(r: Requirement): string {
  const map: Record<string, string> = {
    "hh-14a": "Nachweis, dass sich Wallbox/Wärmepumpe bei Bedarf netzdienlich steuern lassen",
    "hh-meter": "Festlegung, wie Ihr Strom gemessen wird (Eigenverbrauch oder Volleinspeisung)",
    "dc-sc": "eine technische Kennzahl zum Netzanschlusspunkt, die Ihr Planer liefert",
    "wt-frt": "ein technischer Nachweis zum Verhalten der Anlage bei Netzfehlern",
    "wt-ibn": "Abstimmung eines Termins für die Inbetriebnahme",
  };
  return map[r.id] ?? r.label;
}

export function buildDraft(thread: Thread, openReqs: Requirement[]): ResponseDraft {
  const last = thread.messages[thread.messages.length - 1];
  const role = last.message.senderRole;
  const project = projectByRef(thread.projectRef);
  const relevant = openReqs; // bereits auf das Projekt gefiltert

  const bullets = describeOpen(relevant, role).map((s) => `  • ${s}`).join("\n");

  const intro =
    role === "investor"
      ? `vielen Dank für Ihre Nachricht zu Projekt ${thread.projectRef} (${project?.title ?? ""}). Wir verstehen, dass der Zeitpunkt für Sie wichtig ist.`
      : `vielen Dank für Ihre Nachricht (Vorgang ${last.classification.threadId}).`;

  const closing =
    role === "investor"
      ? `Sobald die Punkte vorliegen, können wir Ihren Anschluss zügig abschließen. Bei Fragen sind wir gerne für Sie da.`
      : role === "authority"
        ? `Wir bitten um Berücksichtigung und stehen für Rückfragen zur Verfügung.`
        : `Bitte senden Sie uns die fehlenden Angaben unter Angabe der Vorgangsnummer ${last.classification.threadId} zurück.`;

  const body = `${GREETING[role]}

${intro}

${relevant.length > 0 ? "Für den nächsten Schritt benötigen wir noch:" : "Aktueller Stand:"}
${bullets}

${closing}

Mit freundlichen Grüßen
Netzbetreiber — Team Netzanschluss
Ihre zentrale Vorgangsnummer: ${thread.projectRef}`;

  return {
    threadId: thread.id,
    to: last.message.senderName,
    toRole: role,
    tone: TONE[role],
    subject: `AW: ${last.message.subject} [${last.classification.threadId}]`,
    body,
    status: "draft",
  };
}
