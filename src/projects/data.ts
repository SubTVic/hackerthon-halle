// ============================================================================
// MOCK-DATEN — 3 Projekte + realistischer Posteingang (fake-first)
// ============================================================================
// E-Mail ist der Hauptkanal, danach Brief (gescannt) und Anruf. E-Mails und
// Briefe haben fast immer Dokumente im Anhang. Bewusst enthalten: mehrfache
// Nachfragen derselben Person zum selben Thema (-> werden zusammengefasst).
// ============================================================================

import type { IncomingMessage, Project } from "./types";

export const PROJECTS: Project[] = [
  {
    ref: "1654",
    type: "datacenter",
    title: "Rechenzentrum Halle-Süd",
    applicant: "NorthCloud Data GmbH",
    location: "Gewerbepark Halle-Süd, Flst. 412/7",
    powerLabel: "12 MW Anschlussleistung (Mittelspannung)",
    phaseLabel: "Anschlussprüfung / Netzverträglichkeit",
  },
  {
    ref: "2089",
    type: "household",
    title: "Einfamilienhaus Familie Becker",
    applicant: "Thomas & Anja Becker",
    location: "Lindenweg 8, 06120 Halle",
    powerLabel: "11 kWp PV + 5 kW Wärmepumpe + 11 kW Wallbox",
    phaseLabel: "Anmeldung / Vervollständigung",
  },
  {
    ref: "3320",
    type: "windturbine",
    title: "Windpark Saaletal — WEA-3",
    applicant: "Saaletal Energie eG",
    location: "Gemarkung Wettin, Flst. 88/2",
    powerLabel: "4,2 MW Einspeiseleistung",
    phaseLabel: "Inbetriebnahme-Vorbereitung",
  },
];

export function projectByRef(ref: string): Project | undefined {
  return PROJECTS.find((p) => p.ref === ref);
}

// ----------------------------------------------------------------------------
// Posteingang je Projekt
// ----------------------------------------------------------------------------

export const INBOX: IncomingMessage[] = [
  // ===== Projekt 1654 — Rechenzentrum =====
  {
    id: "M-1001",
    refHint: "1654",
    channel: "email",
    senderName: "Dr. Kram (NorthCloud, Projektleitung)",
    senderRole: "project_manager",
    subject: "RZ Halle-Süd — Anschlussleistung & Zeitplan",
    body: `Sehr geehrte Damen und Herren,
für unser Rechenzentrum (Projekt 1654) benötigen wir verbindlich die Bestätigung der 12 MW Anschlussleistung sowie einen Zeitplan bis zur Inbetriebnahme. Anbei das aktuelle Lastprofil und der Lageplan.
Mit freundlichen Grüßen, Dr. Kram`,
    receivedAt: "2026-06-02T08:15:00Z",
    attachments: [
      { name: "Lastprofil_RZ_HalleSued.xlsx", kind: "spreadsheet" },
      { name: "Lageplan_Gewerbepark.pdf", kind: "pdf" },
    ],
  },
  {
    id: "M-1002",
    refHint: "1654",
    channel: "email",
    senderName: "M. Vogt (Elektroplanung Vogt)",
    senderRole: "technician",
    subject: "Kurzschlussleistung / Netzrückwirkungen RZ 1654",
    body: `Hallo,
für die Auslegung der USV und der Mittelspannungsschaltanlage brauche ich die Netzkurzschlussleistung am geplanten Übergabepunkt sowie die zulässige Oberschwingungsbelastung nach VDE-AR-N 4110. Anbei unsere einpolige Übersichtsschaltung.
Gruß, Vogt`,
    receivedAt: "2026-06-03T10:40:00Z",
    attachments: [{ name: "Einpolig_Uebergabe_RZ.pdf", kind: "cad" }],
  },
  {
    id: "M-1003",
    refHint: null, // Absender nennt keine Nummer -> muss zugeordnet werden
    channel: "letter",
    scanned: true,
    senderName: "Stadt Halle, Bauordnungsamt",
    senderRole: "authority",
    subject: "Stellungnahme Trafostation Gewerbepark Halle-Süd",
    body: `Betr.: geplante Trafostation im Gewerbepark Halle-Süd. Wir bitten um Abstimmung der Standortwahl und um Vorlage der Schallschutzberechnung. Eine Kopie des Lageplans liegt bei.`,
    receivedAt: "2026-06-04T00:00:00Z",
    attachments: [{ name: "Lageplan_Trafostation_Stempel.pdf", kind: "pdf" }],
  },
  {
    id: "M-1004",
    refHint: "1654",
    channel: "email",
    senderName: "Dr. Kram (NorthCloud, Projektleitung)",
    senderRole: "project_manager",
    subject: "AW: RZ Halle-Süd — gibt es schon Neuigkeiten zum Zeitplan?",
    body: `Hallo, ich hatte vor zwei Wochen nach dem Zeitplan und der Leistungsbestätigung gefragt. Können Sie mir bitte einen Stand geben? Der Investor fragt täglich. Danke!`,
    receivedAt: "2026-06-16T07:30:00Z",
    attachments: [],
  },

  // ===== Projekt 2089 — Einfamilienhaus =====
  {
    id: "M-2001",
    refHint: "2089",
    channel: "email",
    senderName: "Elektro Sonnenschein GmbH (Installateur)",
    senderRole: "installer",
    subject: "Anmeldung PV + WP + Wallbox Becker, Lindenweg 8",
    body: `Guten Tag,
wir melden für Familie Becker (Projekt 2089) die PV-Anlage 11 kWp, eine 5 kW Wärmepumpe sowie eine 11 kW Wallbox an. Anbei das ausgefüllte Anmeldeformular und die Datenblätter der Komponenten.
Freundliche Grüße`,
    receivedAt: "2026-06-05T09:00:00Z",
    attachments: [
      { name: "Anmeldung_E.8_Becker.pdf", kind: "pdf" },
      { name: "Datenblatt_WR_Fronius.pdf", kind: "pdf" },
      { name: "Datenblatt_Waermepumpe.pdf", kind: "pdf" },
    ],
  },
  {
    id: "M-2002",
    refHint: "2089",
    channel: "email",
    senderName: "Elektro Sonnenschein GmbH (Installateur)",
    senderRole: "installer",
    subject: "Nachfrage: Netzverträglichkeit Wallbox Becker 2089",
    body: `Hallo, kurze Frage zur Wallbox bei Becker: Ist die 11 kW Wallbox ohne Steuerbarkeit nach §14a EnWG genehmigungsfähig oder brauchen wir ein Steuergerät? Bitte um kurze Rückmeldung.`,
    receivedAt: "2026-06-09T13:20:00Z",
    attachments: [],
  },
  {
    id: "M-2003",
    refHint: "2089",
    channel: "email",
    senderName: "Elektro Sonnenschein GmbH (Installateur)",
    senderRole: "installer",
    subject: "Nochmal: §14a Wallbox Becker — Termin steht an",
    body: `Guten Tag, ich hatte schon gefragt wegen der §14a-Steuerbarkeit der Wallbox bei Becker (2089). Wir müssen nächste Woche installieren. Können Sie mir bitte heute noch sagen, ob ein Steuergerät nötig ist? Danke!`,
    receivedAt: "2026-06-12T08:05:00Z",
    attachments: [],
  },
  {
    id: "M-2004",
    refHint: null,
    channel: "call",
    senderName: "Thomas Becker (Bauherr)",
    senderRole: "investor",
    subject: "Anruf: Wann kann ich einspeisen?",
    body: `[Telefonnotiz] Herr Becker fragt, wann seine Anlage ans Netz kann. Er habe gehört es dauere und sei verunsichert. Bittet um Rückruf mit konkretem Termin.`,
    receivedAt: "2026-06-15T11:10:00Z",
    attachments: [],
  },

  // ===== Projekt 3320 — Windturbine =====
  {
    id: "M-3001",
    refHint: "3320",
    channel: "email",
    senderName: "S. Berger (Saaletal Energie eG)",
    senderRole: "project_manager",
    subject: "WEA-3 Saaletal — Inbetriebnahme-Unterlagen",
    body: `Sehr geehrte Damen und Herren,
für die WEA-3 (Projekt 3320) reichen wir die Unterlagen zur Inbetriebnahme ein: Anlagenzertifikat, Konformitätserklärung und das Einheitenzertifikat des Umrichters. Wir bitten um Terminabstimmung für die Inbetriebnahme.`,
    receivedAt: "2026-06-06T09:45:00Z",
    attachments: [
      { name: "Anlagenzertifikat_WEA3.pdf", kind: "pdf" },
      { name: "Konformitaetserklaerung.pdf", kind: "pdf" },
      { name: "Einheitenzertifikat_Umrichter.pdf", kind: "pdf" },
    ],
  },
  {
    id: "M-3002",
    refHint: "3320",
    channel: "email",
    senderName: "J. Adler (WEA-Service, Techniker)",
    senderRole: "technician",
    subject: "FRT-Verhalten / Blindleistungsregelung WEA-3",
    body: `Moin,
für die IBN-Prüfung der WEA-3: Welche Q(U)-Kennlinie und welchen Sollwert für die Blindleistung sollen wir parametrieren? Und ist der FRT-Nachweis (Fault-Ride-Through) aus dem Anlagenzertifikat ausreichend oder braucht ihr eine Vor-Ort-Messung? Anbei das Parametrierprotokoll.`,
    receivedAt: "2026-06-10T07:25:00Z",
    attachments: [{ name: "Parametrierprotokoll_WEA3.pdf", kind: "pdf" }],
  },
  {
    id: "M-3003",
    refHint: "3320",
    channel: "letter",
    scanned: true,
    senderName: "Saaletal Energie eG (per Einschreiben)",
    senderRole: "investor",
    subject: "Beschwerde: Verzögerung Inbetriebnahme WEA-3",
    body: `Sehr geehrte Damen und Herren, die Inbetriebnahme der WEA-3 verzögert sich seit über sechs Wochen. Uns entgehen erhebliche Einspeiseerlöse. Wir bitten um umgehende Terminierung und behalten uns rechtliche Schritte vor.`,
    receivedAt: "2026-06-14T00:00:00Z",
    attachments: [{ name: "Anschreiben_Beschwerde_unterschrieben.pdf", kind: "pdf" }],
  },
];

export function inboxForProject(ref: string): IncomingMessage[] {
  // Nachrichten, die diesem Projekt zuzuordnen sind (per Hinweis ODER Inhalt).
  return INBOX.filter((m) => m.refHint === ref || messageMentionsRef(m, ref));
}

/** Sehr einfache Inhalts-Zuordnung für Nachrichten ohne Referenznummer. */
export function messageMentionsRef(m: IncomingMessage, ref: string): boolean {
  if (m.refHint === ref) return true;
  const proj = projectByRef(ref);
  if (!proj) return false;
  const hay = (m.subject + " " + m.body).toLowerCase();
  // Ordne über markante Standort-/Projektbegriffe zu.
  const needles: Record<string, string[]> = {
    "1654": ["halle-süd", "halle-sued", "gewerbepark", "trafostation", "rechenzentrum"],
    "2089": ["lindenweg", "becker"],
    "3320": ["wea-3", "wea 3", "saaletal", "wettin", "windpark"],
  };
  return (needles[ref] ?? []).some((n) => hay.includes(n));
}
