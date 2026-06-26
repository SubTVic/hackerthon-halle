// ============================================================================
// MOCK-EINGÄNGE für Tests & Demo (FAKE Kanäle)
// ============================================================================
// Roh-Eingänge, wie sie über verschiedene Kanäle reinkämen. Dienen als
// Test-Fixtures und als zusätzliches Demo-Material. Jeder Mock trägt eine
// Erwartung (`expectComplete`), gegen die die Tests prüfen.
// ============================================================================

import type { Channel } from "../canonical";

export interface MockInput {
  id: string;
  channel: Channel;
  /** Rohtext (E-Mail-Body bzw. Telefon-Transkript). */
  raw: string;
  /** Erwartung für die Tests: sollte die Anfrage vollständig sein? */
  expectComplete: boolean;
  note: string;
}

// --- Mock-E-Mails ----------------------------------------------------------
export const MOCK_EMAILS: MockInput[] = [
  {
    id: "email-clean",
    channel: "email",
    expectComplete: true,
    note: "Saubere Anfrage mit allen Phase-1-Pflichtfeldern.",
    raw: `Betreff: Netzanschluss PV-Anlage

Guten Tag,
ich melde meine PV-Anlage zum Netzanschluss an.
Standort: Lessingstraße 4, 06114 Halle (Saale)
Betreiber: Jonas Becker, jonas.becker@example.de, 0345 7654321
Leistung: 9,5 kW Wirkleistung, 9,9 kVA Scheinleistung
Wechselrichter: Fronius Symo 10.0-3-M, Einheitenzertifikat EZ-2025-1234

Beste Grüße
Jonas Becker`,
  },
  {
    id: "email-missing-email",
    channel: "email",
    expectComplete: false,
    note: "Brief ohne Rück-E-Mail-Adresse und ohne Scheinleistung.",
    raw: `An den Netzbetreiber,
bitte schließen Sie meine Solaranlage an.
Adresse: Goethestraße 9, 06110 Halle
Betreiber: Petra Lang, Tel. 0345 111222
Etwa 7 kW.
Petra Lang`,
  },
];

// --- Mock-Telefon-Transkripte ---------------------------------------------
export const MOCK_CALLS: MockInput[] = [
  {
    id: "call-vague",
    channel: "phone",
    expectComplete: false,
    note: "Telefon-Transkript, sehr vage — viele Pflichtfelder offen.",
    raw: `[Transkript Telefonat 26.06.2026 10:14]
Anrufer: Ja hallo, ich wollte mal fragen wegen so ner Solaranlage aufm Dach.
Sachbearbeiter: Gerne, wo soll die denn hin?
Anrufer: In Halle, irgendwo in der Südstadt. So 10 Kilowatt vielleicht.
Sachbearbeiter: Und Ihr Name?
Anrufer: Krause. Die genaue Adresse schick ich noch.`,
  },
  {
    id: "call-cadastral",
    channel: "phone",
    expectComplete: false,
    note: "Standort nur über Flurdaten, E-Mail fehlt.",
    raw: `[Transkript Telefonat 26.06.2026 11:02]
Anrufer: Hausverwaltung Kröllwitz. Wir haben kein Straßenschild, das ist Gemarkung
Trotha, Flurstück 215 Schrägstrich 3.
Sachbearbeiter: Leistung?
Anrufer: Elf Kilowatt aufs Garagendach, Wechselrichter Fronius. Mail kommt per Post.`,
  },
];

export const ALL_MOCKS: MockInput[] = [...MOCK_EMAILS, ...MOCK_CALLS];
