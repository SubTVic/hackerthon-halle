// ============================================================================
// FAKE CASE DATABASE — Auftragsdaten, wie sie im internen System stehen
// ============================================================================
// Simuliert die Datenbank des Netzbetreibers. Wenn eine Nachricht reinkommt
// (z.B. Investor ruft an), wird der Auftragsstatus automatisch abgerufen und
// dem Sachbearbeiter als Kontext angezeigt. Alle Daten hier sind hartkodiert.
// ============================================================================

export interface Milestone {
  label: string;
  date: string | null;
  done: boolean;
}

export interface PendingItem {
  label: string;
  responsible: string;
  since: string;
  overdue: boolean;
}

export interface CaseRecord {
  requestId: string;
  applicantName: string;
  siteAddress: string;
  powerKw: number;
  phase: string;
  phaseLabel: string;
  assignedTo: string;
  createdAt: string;
  lastActivity: string;
  daysOpen: number;
  milestones: Milestone[];
  pending: PendingItem[];
  notes: string[];
}

const FAKE_DB: Record<string, CaseRecord> = {
  "REQ-COMPLETE-001": {
    requestId: "REQ-COMPLETE-001",
    applicantName: "Maria Schmidt",
    siteAddress: "Bahnhofstraße 12, 06108 Halle (Saale)",
    powerKw: 9.8,
    phase: "application_phase_2",
    phaseLabel: "Antragsprüfung (Phase 2)",
    assignedTo: "Herr Weber (Sachbearbeitung)",
    createdAt: "2026-06-20",
    lastActivity: "2026-06-25",
    daysOpen: 6,
    milestones: [
      { label: "Antrag eingegangen", date: "2026-06-20", done: true },
      { label: "Vollständigkeitsprüfung", date: "2026-06-20", done: true },
      { label: "Technische Netzprüfung", date: "2026-06-23", done: true },
      { label: "Anschlusszusage", date: "2026-06-25", done: true },
      { label: "Installation / Bau", date: null, done: false },
      { label: "Inbetriebnahme", date: null, done: false },
    ],
    pending: [
      { label: "Terminabstimmung Zählersetzung", responsible: "Messstellenbetreiber", since: "2026-06-25", overdue: false },
    ],
    notes: [
      "Anschlusszusage am 25.06. erteilt, Netzverträglichkeit bestätigt.",
      "Elektrofachbetrieb SolarTech GmbH, Eintragungsnr. EFB-2024-445.",
    ],
  },

  "REQ-GAPPY-001": {
    requestId: "REQ-GAPPY-001",
    applicantName: "T. Müller",
    siteAddress: "Halle (unvollständig)",
    powerKw: 8.0,
    phase: "application_phase_1",
    phaseLabel: "Antrag unvollständig (Phase 1)",
    assignedTo: "Frau Klein (Sachbearbeitung)",
    createdAt: "2026-06-10",
    lastActivity: "2026-06-15",
    daysOpen: 16,
    milestones: [
      { label: "Antrag eingegangen", date: "2026-06-10", done: true },
      { label: "Vollständigkeitsprüfung", date: "2026-06-10", done: true },
      { label: "Nachforderung versendet", date: "2026-06-11", done: true },
      { label: "Nachforderung beantwortet", date: null, done: false },
      { label: "Technische Netzprüfung", date: null, done: false },
      { label: "Anschlusszusage", date: null, done: false },
    ],
    pending: [
      { label: "Antwort auf Nachforderung (Straße, PLZ, E-Mail)", responsible: "Antragsteller", since: "2026-06-11", overdue: true },
      { label: "Scheinleistung Wechselrichter fehlt", responsible: "Antragsteller", since: "2026-06-11", overdue: true },
    ],
    notes: [
      "Nachforderung am 11.06. per E-Mail versendet, keine Antwort seit 15 Tagen.",
      "Keine Kontakt-E-Mail vorhanden — Nachforderung ging an Postadresse.",
    ],
  },

  "REQ-CHAOTIC-001": {
    requestId: "REQ-CHAOTIC-001",
    applicantName: "Hausverwaltung Kröllwitz GmbH",
    siteAddress: "Gemarkung Trotha, Flurstück 215/3",
    powerKw: 11.0,
    phase: "construction",
    phaseLabel: "Installation / Bau",
    assignedTo: "Herr Weber (Sachbearbeitung)",
    createdAt: "2026-05-15",
    lastActivity: "2026-06-28",
    daysOpen: 42,
    milestones: [
      { label: "Antrag eingegangen", date: "2026-05-15", done: true },
      { label: "Vollständigkeitsprüfung", date: "2026-05-16", done: true },
      { label: "Nachforderung E-Mail + Scheinleistung", date: "2026-05-17", done: true },
      { label: "Nachforderung beantwortet", date: "2026-05-28", done: true },
      { label: "Technische Netzprüfung", date: "2026-06-05", done: true },
      { label: "Anschlusszusage", date: "2026-06-10", done: true },
      { label: "Installation / Bau", date: "2026-06-20", done: false },
      { label: "Inbetriebnahme", date: null, done: false },
    ],
    pending: [
      { label: "Zählerschrank: Platz für NA-Schutz klären", responsible: "Elektrofachbetrieb / Techniker", since: "2026-06-28", overdue: true },
      { label: "Zählersetzung (wartet auf Klärung Schrank)", responsible: "Messstellenbetreiber", since: "2026-06-28", overdue: false },
    ],
    notes: [
      "Verzögerung: Nachforderung brauchte 11 Tage (Fax-Rückantwort).",
      "Techniker meldet am 28.06. Problem mit Zählerschrank vor Ort.",
      "Investor (Hr. Kröllwitz) hat am 01.07. telefonisch Beschwerde eingelegt.",
    ],
  },
};

/**
 * Holt den Auftragsstatus aus der "Datenbank".
 * Gibt null zurück wenn nicht gefunden (sollte in der Demo nicht vorkommen).
 */
export function lookupCase(requestId: string): CaseRecord | null {
  return FAKE_DB[requestId] ?? null;
}
