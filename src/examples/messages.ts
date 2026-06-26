// ============================================================================
// MOCK-PROZESSNACHRICHTEN (während des Vorgangs, FAKE Kanäle)
// ============================================================================
// Nachrichten, die NACH dem Erstantrag im Laufe des Vorgangs reinkommen —
// vor allem die Techniker-SMS mit einer Problemmeldung von der Baustelle.
// Dienen als Demo-Material (Buttons) und Test-Fixtures.
// ============================================================================

import type { RawMessage } from "../process";

/** Erwartung pro Nachricht für die Tests. */
export interface MockMessage extends RawMessage {
  label: string;
  expectBlocker: boolean;
}

/** requestId wird beim Einspielen überschrieben (an den aktuellen Vorgang). */
export const MOCK_MESSAGES: MockMessage[] = [
  {
    label: "Techniker meldet Problem (SMS, Baustelle)",
    expectBlocker: true,
    requestId: "REQ",
    at: "2026-07-02T08:40:00Z",
    channel: "sms",
    senderRole: "technician",
    subject: null,
    body: "Bin vor Ort. Zählerschrank passt nicht, kein Platz für den NA-Schutz. Geht so nicht. Bitte Rückmeldung.",
  },
  {
    label: "Techniker: Montage abgeschlossen (SMS)",
    expectBlocker: false,
    requestId: "REQ",
    at: "2026-07-05T15:10:00Z",
    channel: "sms",
    senderRole: "technician",
    subject: null,
    body: "PV fertig montiert und angeschlossen. Alles erledigt.",
  },
  {
    label: "Elektrofachbetrieb: Rückfrage (E-Mail)",
    expectBlocker: false,
    requestId: "REQ",
    at: "2026-07-03T11:00:00Z",
    channel: "email",
    senderRole: "installer",
    subject: "Frage zum Messkonzept",
    body: "Welches Messkonzept sollen wir umsetzen? Bitte um kurze Info.",
  },
];
