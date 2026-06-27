// ============================================================================
// STAKEHOLDER-SICHT — ein Vorgang, mehrere Sprachen (in den Funnel integriert)
// ============================================================================
// Derselbe Sachverhalt muss je nach Empfänger anders erklärt werden: ein
// Techniker braucht Fachdetails, ein Investor eine verständliche Einordnung,
// die Strategie die Portfolio-Wirkung. Generisch über die Kategorie des
// Threads — funktioniert für alle Projekte (RZ, EFH, Windpark).
// ============================================================================

import type { CategoryCode, Project, Thread } from "./types";

export type Stakeholder = "technician" | "operator" | "investor" | "strategy";

export interface Perspective {
  role: Stakeholder;
  label: string;
  icon: string;
  summary: string;
  relevance: "high" | "medium" | "low";
  action: string | null;
}

export const STAKEHOLDERS: { role: Stakeholder; label: string; icon: string }[] = [
  { role: "technician", label: "Techniker", icon: "🔧" },
  { role: "operator", label: "Sachbearbeiter", icon: "📋" },
  { role: "investor", label: "Investor", icon: "💼" },
  { role: "strategy", label: "Strategie", icon: "📊" },
];

type Builder = (project: Project, topic: string) => Record<Stakeholder, Perspective>;

const p = (
  role: Stakeholder,
  label: string,
  icon: string,
  summary: string,
  relevance: Perspective["relevance"],
  action: string | null,
): Perspective => ({ role, label, icon, summary, relevance, action });

const BY_CATEGORY: Record<CategoryCode, Builder> = {
  B: (_proj, _topic) => ({
    technician: p("technician", "Techniker", "🔧", "Kein technischer Handlungsbedarf — die Beschwerde betrifft die Prozessdauer, nicht die Anlage.", "low", null),
    operator: p("operator", "Sachbearbeiter", "📋", "Eskalation. Rückruf innerhalb 24h mit konkretem Zeitplan; Vorgang priorisieren.", "high", "Rückruf mit verbindlichem Zeitplan (Frist 24h)"),
    investor: p("investor", "Investor", "💼", "Ihre Beschwerde ist erfasst und wird priorisiert bearbeitet. Sie erhalten zeitnah einen verbindlichen Zeitplan.", "high", null),
    strategy: p("strategy", "Strategie", "📊", "Eskalation = Reputations-/Erlösrisiko. Ein Großteil der Beschwerden entsteht durch fehlende proaktive Kommunikation.", "high", null),
  }),
  T: (_proj, topic) => ({
    technician: p("technician", "Techniker", "🔧", `Fachliche Klärung erforderlich: ${topic}. Norm- und projektbezogene Angaben bereitstellen.`, "high", `Technische Angaben zu „${topic}" liefern`),
    operator: p("operator", "Sachbearbeiter", "📋", `Technische Rückfrage zu „${topic}". Ggf. Netzberechnung/Prüfung anstoßen, dann fachlich antworten.`, "high", "Prüfung anstoßen, Fachantwort einholen"),
    investor: p("investor", "Investor", "💼", "Es geht um eine technische Detailfrage. Ihr Planer und der Netzbetreiber klären das — für Sie entsteht kein Aufwand.", "low", null),
    strategy: p("strategy", "Strategie", "📊", `Wiederkehrende technische Rückfrage (${topic}). Standardisierung/Vorabprüfung würde Rückfragen reduzieren.`, "medium", null),
  }),
  S: (_proj, _topic) => ({
    technician: p("technician", "Techniker", "🔧", "Kein technischer Handlungsbedarf — reine Statusanfrage.", "low", null),
    operator: p("operator", "Sachbearbeiter", "📋", "Statusauskunft geben: aktuellen Stand und nächste Schritte mit Termin kommunizieren.", "high", "Status + nächste Schritte mitteilen"),
    investor: p("investor", "Investor", "💼", "Sie erhalten zeitnah einen konkreten Stand zu Ihrem Vorgang.", "high", null),
    strategy: p("strategy", "Strategie", "📊", "Statusanfragen lassen sich durch automatische Fortschritts-Updates deutlich reduzieren.", "medium", null),
  }),
  D: (_proj, _topic) => ({
    technician: p("technician", "Techniker", "🔧", "Eingereichte Nachweise/Zertifikate technisch prüfen (Vollständigkeit, Gültigkeit).", "high", "Dokumente technisch prüfen"),
    operator: p("operator", "Sachbearbeiter", "📋", "Dokumente archivieren und die zugehörige Anforderung als erfüllt markieren.", "high", "Dokument archivieren, Anforderung abhaken"),
    investor: p("investor", "Investor", "💼", "Ihre Unterlagen sind eingegangen und werden geprüft. Vielen Dank.", "low", null),
    strategy: p("strategy", "Strategie", "📊", "Dokumenteneingang — der Vorgang rückt Richtung Abschluss.", "low", null),
  }),
  A: (_proj, _topic) => ({
    technician: p("technician", "Techniker", "🔧", "Anmeldedaten und Komponenten-Datenblätter auf Plausibilität prüfen.", "medium", "Komponenten prüfen"),
    operator: p("operator", "Sachbearbeiter", "📋", "Neuer Antrag: Vollständigkeit gegen das aktuelle Anforderungsprofil prüfen, Eingang bestätigen.", "high", "Vollständigkeit prüfen, Eingangsbestätigung"),
    investor: p("investor", "Investor", "💼", "Ihre Anmeldung ist eingegangen. Wir prüfen die Unterlagen und melden uns bei Rückfragen.", "medium", null),
    strategy: p("strategy", "Strategie", "📊", "Neuer Vorgang im Portfolio. Vollständige Erstanträge verkürzen die Durchlaufzeit deutlich.", "low", null),
  }),
  N: (_proj, _topic) => ({
    technician: p("technician", "Techniker", "🔧", "Offener Punkt — fehlende Angabe technisch nachfordern.", "medium", null),
    operator: p("operator", "Sachbearbeiter", "📋", "Nachforderung an den Absender formulieren, Vorgangsnummer angeben.", "high", "Nachforderung versenden"),
    investor: p("investor", "Investor", "💼", "Für den nächsten Schritt fehlt uns noch eine Angabe — wir kommen auf Sie zu.", "low", null),
    strategy: p("strategy", "Strategie", "📊", "Nachforderungen sind der häufigste Verzögerungsgrund — frühe Vollständigkeitsprüfung hilft.", "low", null),
  }),
};

export function perspectivesForThread(thread: Thread, project: Project): Perspective[] {
  const builder = BY_CATEGORY[thread.category] ?? BY_CATEGORY.N;
  const map = builder(project, thread.topic);
  return STAKEHOLDERS.map((s) => map[s.role]);
}
