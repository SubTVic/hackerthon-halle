import type { RawMessage } from "../process";

export interface MockMessage extends RawMessage {
  label: string;
  expectBlocker: boolean;
}

export const MOCK_MESSAGES: MockMessage[] = [
  {
    label: "Investor ruft an: Warum dauert das so lange?",
    expectBlocker: false,
    requestId: "REQ",
    at: "2026-07-01T14:22:00Z",
    channel: "phone",
    senderRole: "investor",
    subject: "Beschwerde: Verzögerung Netzanschluss",
    body: `[Transkript Telefonat 01.07.2026 14:22]
Anrufer: Schmidt hier, Hausverwaltung. Ich wollte mal fragen, warum das jetzt schon wieder Wochen dauert mit dem Netzanschluss. Wir haben die PV-Anlage schon bestellt, der Installateur steht bereit, aber von Ihnen kommt nichts. Das kostet uns bares Geld! Was ist der aktuelle Stand?
Sachbearbeiter: Herr Schmidt, ich schaue sofort in den Vorgang. Einen Moment bitte...`,
  },
  {
    label: "Techniker: Problem auf der Baustelle (SMS)",
    expectBlocker: true,
    requestId: "REQ",
    at: "2026-07-02T08:40:00Z",
    channel: "sms",
    senderRole: "technician",
    subject: null,
    body: "Bin vor Ort. Zählerschrank passt nicht, kein Platz für den NA-Schutz. Geht so nicht. Bitte Rückmeldung.",
  },
  {
    label: "Elektrofachbetrieb: Rückfrage per Mail",
    expectBlocker: false,
    requestId: "REQ",
    at: "2026-07-03T11:00:00Z",
    channel: "email",
    senderRole: "installer",
    subject: "Frage zum Messkonzept",
    body: "Welches Messkonzept sollen wir umsetzen? Der Anlagenbetreiber hat sich für Überschusseinspeisung entschieden, aber im Antrag steht Volleinspeisung. Bitte um kurze Klärung.",
  },
  {
    label: "Antragsteller reicht Lageplan nach (E-Mail)",
    expectBlocker: false,
    requestId: "REQ",
    at: "2026-07-04T09:15:00Z",
    channel: "email",
    senderRole: "applicant",
    subject: "Lageplan im Anhang",
    body: "Sehr geehrte Damen und Herren, anbei der gewünschte Lageplan mit eingezeichnetem Aufstellungsort der PV-Module. Mit freundlichen Grüßen, M. Schmidt",
  },
  {
    label: "Techniker: Montage abgeschlossen (SMS)",
    expectBlocker: false,
    requestId: "REQ",
    at: "2026-07-05T15:10:00Z",
    channel: "sms",
    senderRole: "technician",
    subject: null,
    body: "PV fertig montiert und angeschlossen. Alles erledigt, Zähler kann gesetzt werden.",
  },
];
