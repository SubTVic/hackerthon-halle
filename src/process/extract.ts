import type { ProcessEvent } from "./types";

export interface ExtractedField {
  label: string;
  value: string;
  path?: string;
}

export interface CrmUpdate {
  action: "add_blocker" | "resolve_blocker" | "add_pending" | "resolve_pending" | "complete_milestone" | "add_note" | "set_flag";
  description: string;
  target?: string;
}

export interface ExtractionResult {
  fields: ExtractedField[];
  crmUpdates: CrmUpdate[];
}

const EXTRACT_RULES: Array<{
  match: (e: ProcessEvent) => boolean;
  extract: (e: ProcessEvent) => ExtractionResult;
}> = [
  {
    match: (e) => e.type === "complaint" && e.senderRole === "investor",
    extract: (e) => ({
      fields: [
        { label: "Beschwerdegrund", value: "Verzögerung Netzanschluss" },
        { label: "Absender", value: "Hausverwaltung / Investor" },
        { label: "Eskalationsstufe", value: "Erstbeschwerde" },
        { label: "Kanal", value: e.channel.toUpperCase() },
      ],
      crmUpdates: [
        { action: "set_flag", description: "Eskalation: Investor-Beschwerde", target: "eskalation" },
        { action: "add_note", description: "Investor beschwert sich über Verzögerung — Rückruf erforderlich" },
        { action: "add_pending", description: "Rückruf an Investor (Frist: 24h)" },
      ],
    }),
  },
  {
    match: (e) => e.type === "problem_report" && e.severity === "blocker" && e.senderRole === "technician",
    extract: (e) => ({
      fields: [
        { label: "Problem", value: "Zählerschrank zu klein für NA-Schutz", path: "installation.components" },
        { label: "Betroffene Komponente", value: "NA-Schutz (Netz- und Anlagenschutz)" },
        { label: "Standort-Status", value: "Techniker vor Ort" },
        { label: "Handlungsbedarf", value: "Ja — Montage blockiert" },
      ],
      crmUpdates: [
        { action: "add_blocker", description: "Zählerschrank-Umbau erforderlich (kein Platz für NA-Schutz)" },
        { action: "add_pending", description: "Angebot Zählerschrank-Umbau einholen" },
        { action: "add_note", description: "Techniker meldet: Zählerschrank passt nicht, NA-Schutz kann nicht verbaut werden" },
      ],
    }),
  },
  {
    match: (e) => e.type === "question" && e.senderRole === "installer",
    extract: (e) => ({
      fields: [
        { label: "Thema", value: "Messkonzept" },
        { label: "Widerspruch", value: "Antrag: Volleinspeisung ↔ Betreiber: Überschuss" },
        { label: "Betroffenes Feld", value: "VDE 3.1.9 — Veräußerungsform", path: "commercial.marketingForm" },
      ],
      crmUpdates: [
        { action: "add_pending", description: "Messkonzept klären (Voll- vs. Überschusseinspeisung)" },
        { action: "add_note", description: "Widerspruch Messkonzept: Antrag sagt Volleinspeisung, Betreiber will Überschuss" },
      ],
    }),
  },
  {
    match: (e) => e.type === "status_update" && e.senderRole === "applicant" && e.body.toLowerCase().includes("lageplan"),
    extract: (e) => ({
      fields: [
        { label: "Dokument", value: "Lageplan (mit Aufstellungsort)" },
        { label: "Status", value: "Eingereicht per E-Mail" },
        { label: "Betroffenes Feld", value: "VDE 8.1 — Lageplan", path: "attachments.site_plan" },
      ],
      crmUpdates: [
        { action: "resolve_pending", description: "Lageplan nachreichen", target: "lageplan" },
        { action: "add_note", description: "Lageplan per E-Mail eingegangen — Prüfung ausstehend" },
      ],
    }),
  },
  {
    match: (e) => e.type === "status_update" && e.senderRole === "technician" && e.body.toLowerCase().includes("erledigt"),
    extract: (e) => ({
      fields: [
        { label: "Status", value: "Montage abgeschlossen" },
        { label: "PV-Module", value: "Montiert und angeschlossen" },
        { label: "Nächster Schritt", value: "Zähler setzen" },
      ],
      crmUpdates: [
        { action: "complete_milestone", description: "Montage PV-Anlage", target: "montage" },
        { action: "resolve_blocker", description: "Zählerschrank-Umbau erforderlich (kein Platz für NA-Schutz)" },
        { action: "add_pending", description: "Zählersetzung beauftragen" },
        { action: "add_note", description: "Techniker: PV montiert und angeschlossen, bereit für Zähler" },
      ],
    }),
  },
];

export function extractFromEvent(event: ProcessEvent): ExtractionResult {
  for (const rule of EXTRACT_RULES) {
    if (rule.match(event)) return rule.extract(event);
  }
  return {
    fields: [
      { label: "Typ", value: event.type },
      { label: "Inhalt", value: event.body.substring(0, 80) + (event.body.length > 80 ? "…" : "") },
    ],
    crmUpdates: [
      { action: "add_note", description: event.subject ?? event.body.substring(0, 60) },
    ],
  };
}
