// ============================================================================
// HARTKODIERTE FALLBACK-JSONs (fake-first)
// ============================================================================
// Pro Beispiel-Eingang ein fertiges kanonisches JSON. Damit läuft die komplette
// Demo OHNE LLM-Call. Der echte LLM-Parser (ingest/llmParser.ts) ist optional
// und fällt bei Fehler/ohne API-Key auf genau diese Objekte zurück.
//
// Bewusst so gewählt, dass die Lückenprüfung unterschiedlich ausfällt:
//   complete -> validiert sauber durch
//   gappy    -> mehrere Pflichtfelder fehlen
//   chaotic  -> Flurdaten statt Adresse, E-Mail + PLZ fehlen
// ============================================================================

import type { CanonicalRequest } from "../../canonical";
import type { ExampleInput } from "../../examples";

const base = (raw: string): Pick<CanonicalRequest, "channel" | "receivedAt" | "_meta"> => ({
  channel: "email",
  receivedAt: "2026-06-26T09:00:00Z",
  _meta: { sourceRaw: raw, confidence: {} },
});

export const FALLBACKS: Record<ExampleInput["id"], (raw: string) => CanonicalRequest> = {
  complete: (raw) => ({
    requestId: "REQ-COMPLETE-001",
    ...base(raw),
    parties: [
      {
        role: "operator",
        name: "Schmidt",
        firstName: "Maria",
        company: null,
        address: { street: null, no: null, zip: null, city: null },
        contact: { email: "maria.schmidt@example.de", phone: "0345 1234567" },
      },
    ],
    installation: {
      type: "pv",
      locationKind: "postal",
      siteAddress: { street: "Bahnhofstraße", no: "12", zip: "06108", city: "Halle (Saale)", district: null },
      cadastral: { district: null, parcel: null },
      powerKw: 9.8,
      apparentPowerKva: 10.0,
      components: [
        { kind: "inverter", manufacturer: "SMA", model: "Sunny Tripower 10.0", certId: "EZ-2024-0099" },
      ],
    },
    commercial: { marketingForm: null, iban: null },
    attachments: [
      { kind: "site_plan", present: true },
      { kind: "metering_concept", present: true },
    ],
  }),

  gappy: (raw) => ({
    requestId: "REQ-GAPPY-001",
    ...base(raw),
    parties: [
      {
        role: "operator",
        name: "Müller",
        firstName: "T.",
        company: null,
        address: { street: null, no: null, zip: null, city: null },
        contact: { email: null, phone: null }, // E-Mail fehlt (Pflicht)
      },
    ],
    installation: {
      type: "pv",
      locationKind: "postal",
      siteAddress: { street: null, no: null, zip: null, city: "Halle", district: null }, // Straße/Nr/PLZ fehlen
      cadastral: { district: null, parcel: null },
      powerKw: 8.0,
      apparentPowerKva: null, // fehlt (Pflicht)
      components: [],
    },
    commercial: { marketingForm: null, iban: null },
    attachments: [],
  }),

  chaotic: (raw) => ({
    requestId: "REQ-CHAOTIC-001",
    ...base(raw),
    channel: "fax",
    parties: [
      {
        role: "operator",
        name: "Hausverwaltung Kröllwitz GmbH",
        firstName: null,
        company: "Hausverwaltung Kröllwitz GmbH",
        address: { street: null, no: null, zip: null, city: null },
        contact: { email: null, phone: "0345 99887" }, // E-Mail fehlt
      },
    ],
    installation: {
      type: "pv",
      locationKind: "cadastral", // Flurdaten statt Adresse
      siteAddress: { street: null, no: null, zip: null, city: null },
      cadastral: { district: "Trotha", parcel: "215/3" },
      powerKw: 11.0,
      apparentPowerKva: null, // fehlt
      components: [{ kind: "inverter", manufacturer: "Fronius", model: null, certId: null }],
    },
    commercial: { marketingForm: null, iban: null },
    attachments: [],
  }),
};
