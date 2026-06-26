// ============================================================================
// BEISPIEL-EINGÄNGE (3 Szenarien für die Demo)
// ============================================================================
// FAKE: stehen stellvertretend für "beliebige Kanäle". In der UI als 3 Buttons.
// Scope: PV bis 30 kW. Je Beispiel gibt es in ingest/fallbacks ein passendes,
// hartkodiertes kanonisches JSON, damit die Demo ohne LLM-Call läuft.
// ============================================================================

import type { Channel } from "../canonical";

export interface ExampleInput {
  id: "complete" | "gappy" | "chaotic";
  title: string;
  channel: Channel;
  /** Rohtext, wie er per Mail/Fax/Brief reinkäme. */
  raw: string;
}

export const EXAMPLES: ExampleInput[] = [
  {
    id: "complete",
    title: "Vollständig (saubere E-Mail)",
    channel: "email",
    raw: `Sehr geehrte Damen und Herren,

hiermit beantrage ich den Netzanschluss meiner neuen PV-Anlage.

Standort: Bahnhofstraße 12, 06108 Halle (Saale)
Anlagenbetreiber: Maria Schmidt, maria.schmidt@example.de, 0345 1234567
Anlage: PV-Aufdach, Summe Wirkleistung 9,8 kW, Scheinleistung 10,0 kVA
Wechselrichter: SMA Sunny Tripower 10.0, Einheitenzertifikat EZ-2024-0099

Mit freundlichen Grüßen
Maria Schmidt`,
  },
  {
    id: "gappy",
    title: "Lückenhaft (Pflichtfelder fehlen)",
    channel: "email",
    raw: `Hallo,

ich möchte eine Solaranlage anmelden. Sie soll aufs Dach von unserem Haus
in Halle. Ungefähr 8 kW. Meldet euch bitte.

Grüße
T. Müller`,
  },
  {
    id: "chaotic",
    title: "Chaotisch (Fax-Transkript, unstrukturiert)",
    channel: "fax",
    raw: `FAX -- schwer lesbar --
betreff pv anschluss !! flurstück 215/3 gemarkung Trotha
betreiber: Hausverwaltung Kröllwitz GmbH  tel 0345/99887
module aufs garagendach ca 11kw wechselrichter fronius
mail folgt per post. zähler noch nicht da.`,
  },
];

export function exampleById(id: ExampleInput["id"]): ExampleInput {
  const found = EXAMPLES.find((e) => e.id === id);
  if (!found) throw new Error(`Unknown example: ${id}`);
  return found;
}
