// ============================================================================
// 2 DEMO-CASES — zwei Vorgänge, gleiche Anlage, kompletter Lebenszyklus
// ============================================================================
// Case 1: "Sauberer Antrag" — läuft glatt durch, Technik-Rückfrage vom
//         Installateur, dann Fertigmeldung. Happy Path.
// Case 2: "Chaotischer Antrag" — Fax-Eingang unvollständig, Nachforderung,
//         Investor beschwert sich telefonisch, Techniker meldet Problem
//         per SMS. Alles was schieflaufen kann.
//
// Jeder Case hat: Erstantrag (raw), vorbereitete kanonische Daten (fallback),
// DB-Eintrag, und eine vorgeskriptete Chronologie von Prozess-Nachrichten
// die der Nutzer Schritt für Schritt einspielen kann.
// ============================================================================

import type { Channel } from "../canonical";
import type { MockMessage } from "./messages";

export interface DemoCase {
  id: "clean" | "messy";
  title: string;
  subtitle: string;
  /** Rohtext des Erstantrags */
  raw: string;
  channel: Channel;
  /** Chronologische Prozess-Nachrichten, die nacheinander eingespielt werden */
  messages: MockMessage[];
}

export const DEMO_CASES: DemoCase[] = [
  {
    id: "clean",
    title: "Fall 1: Sauberer Antrag",
    subtitle: "PV 9,8 kW · Bahnhofstraße 12, Halle · vollständig per E-Mail",
    channel: "email",
    raw: `Sehr geehrte Damen und Herren,

hiermit beantrage ich den Netzanschluss meiner neuen PV-Anlage.

Standort: Bahnhofstraße 12, 06108 Halle (Saale)
Anlagenbetreiber: Maria Schmidt, maria.schmidt@example.de, 0345 1234567
Anlage: PV-Aufdach, Summe Wirkleistung 9,8 kW, Scheinleistung 10,0 kVA
Wechselrichter: SMA Sunny Tripower 10.0, Einheitenzertifikat EZ-2024-0099

Mit freundlichen Grüßen
Maria Schmidt`,
    messages: [
      {
        label: "Elektrofachbetrieb fragt nach Messkonzept",
        expectBlocker: false,
        requestId: "REQ",
        at: "2026-06-25T11:00:00Z",
        channel: "email",
        senderRole: "installer",
        subject: "Rückfrage Messkonzept",
        body: "Guten Tag, für die Installation brauche ich eine Klärung: Überschusseinspeisung oder Volleinspeisung? Die Kundin war sich nicht sicher. Bitte kurze Info. Gruß, SolarTech GmbH",
      },
      {
        label: "Antragstellerin reicht Lageplan nach",
        expectBlocker: false,
        requestId: "REQ",
        at: "2026-06-27T09:15:00Z",
        channel: "email",
        senderRole: "applicant",
        subject: "Lageplan im Anhang",
        body: "Sehr geehrte Damen und Herren, anbei der Lageplan mit eingezeichnetem Aufstellungsort der PV-Module. Mit freundlichen Grüßen, M. Schmidt",
      },
      {
        label: "Techniker: Montage abgeschlossen",
        expectBlocker: false,
        requestId: "REQ",
        at: "2026-07-05T15:10:00Z",
        channel: "sms",
        senderRole: "technician",
        subject: null,
        body: "PV fertig montiert und angeschlossen. Alles erledigt, Zähler kann gesetzt werden.",
      },
    ],
  },

  {
    id: "messy",
    title: "Fall 2: Chaotischer Antrag",
    subtitle: "PV 11 kW · Gemarkung Trotha · Fax, unvollständig, Probleme",
    channel: "fax",
    raw: `FAX -- schwer lesbar --
betreff pv anschluss !! flurstück 215/3 gemarkung Trotha
betreiber: Hausverwaltung Kröllwitz GmbH  tel 0345/99887
module aufs garagendach ca 11kw wechselrichter fronius
mail folgt per post. zähler noch nicht da.`,
    messages: [
      {
        label: "Investor ruft an: Warum dauert das so lange?",
        expectBlocker: false,
        requestId: "REQ",
        at: "2026-07-01T14:22:00Z",
        channel: "phone",
        senderRole: "investor",
        subject: "Beschwerde: Verzögerung Netzanschluss",
        body: `[Transkript Telefonat 01.07.2026 14:22]
Anrufer: Kröllwitz hier. Ich wollte mal fragen, warum das jetzt schon wieder Wochen dauert mit dem Netzanschluss. Wir haben die PV-Anlage schon bestellt, der Installateur steht bereit, aber von Ihnen kommt nichts. Das kostet uns bares Geld! Was ist der aktuelle Stand?
Sachbearbeiter: Herr Kröllwitz, ich schaue sofort in den Vorgang. Einen Moment bitte...`,
      },
      {
        label: "Techniker meldet Problem per SMS",
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
        subject: "Frage zum Zählerschrank",
        body: "Nach Rücksprache mit dem Techniker: Der vorhandene Zählerschrank hat keinen freien Platz für den NA-Schutz. Sollen wir einen neuen Schrank setzen oder gibt es eine andere Lösung? Bitte um schnelle Klärung, der Investor macht Druck.",
      },
      {
        label: "Techniker: Neuer Schrank gesetzt, Montage fertig",
        expectBlocker: false,
        requestId: "REQ",
        at: "2026-07-08T16:00:00Z",
        channel: "sms",
        senderRole: "technician",
        subject: null,
        body: "Neuen Zählerschrank installiert, NA-Schutz eingebaut. PV montiert und angeschlossen. Alles erledigt.",
      },
    ],
  },
];
