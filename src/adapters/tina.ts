// ============================================================================
// TINA ADAPTER — kanonisches JSON / VDE -> TINA-Zielformat
// ============================================================================
// TINA ist das interne Zielsystem, in das exportiert werden soll. Dieser
// Adapter transformiert die kanonische Anfrage (bzw. den VDE-Export) in einen
// TINA-Datensatz.
//
// ⚠️ FORMAT-ANNAHME: Die genaue TINA-Feldstruktur ist noch zu bestätigen
//   (siehe Frage an den Nutzer). Unten eine plausible, klar gekapselte
//   Struktur — sobald die echte TINA-Spezifikation vorliegt, nur `toTina`
//   und `serializeTina` anpassen, der Rest des Systems bleibt unberührt.
//
// TODO(sonnet): echte TINA-Felder/Serialisierung (XML? CSV? JSON?) einsetzen,
//   sobald das Format feststeht.
// ============================================================================

import type { CanonicalRequest } from "../canonical";
import { toVde, type VdeRow } from "./vde";

/** Ein Eintrag im TINA-Datensatz. */
export interface TinaField {
  /** TINA-Feldschlüssel. TODO: an echte TINA-Keys anpassen. */
  key: string;
  label: string;
  value: string | null;
  /** Herkunfts-VDE-Nummer (Nachvollziehbarkeit). */
  sourceVdeNr: string;
}

export interface TinaRecord {
  /** TINA-Kopfdaten. */
  header: {
    recordType: "GRID_CONNECTION_REQUEST";
    requestId: string;
    channel: string;
    receivedAt: string;
    installationType: string;
  };
  fields: TinaField[];
}

/**
 * Transformiert die kanonische Anfrage in einen TINA-Datensatz.
 * Geht über den VDE-Export, weil TINA dieselben fachlichen Felder konsumiert.
 *
 * TODO(sonnet): Mapping VDE-Nr -> TINA-Key vervollständigen (TINA_KEYS) und
 *   ggf. TINA-spezifische Pflicht-/Formatregeln ergänzen.
 */
export function toTina(req: CanonicalRequest): TinaRecord {
  const vdeRows: VdeRow[] = toVde(req);
  return {
    header: {
      recordType: "GRID_CONNECTION_REQUEST",
      requestId: req.requestId,
      channel: req.channel,
      receivedAt: req.receivedAt,
      installationType: req.installation.type,
    },
    fields: vdeRows.map((r) => ({
      key: TINA_KEYS[r.nr] ?? `VDE_${r.nr}`, // Fallback: VDE-Nummer als Key
      label: r.label,
      value: r.value,
      sourceVdeNr: r.nr,
    })),
  };
}

/**
 * Serialisiert einen TINA-Datensatz in das Austauschformat.
 * TODO(sonnet): echtes TINA-Format (XML/CSV/…) statt JSON, sobald bekannt.
 */
export function serializeTina(record: TinaRecord): string {
  return JSON.stringify(record, null, 2);
}

/**
 * Mapping VDE-Feldnummer -> TINA-Feldschlüssel.
 * TODO(sonnet): mit echten TINA-Keys füllen. Platzhalter unten.
 */
const TINA_KEYS: Record<string, string> = {
  "1007": "SITE_ZIP",
  "1008": "SITE_CITY",
  "1101": "OPERATOR_NAME",
  "1110": "OPERATOR_EMAIL",
  "3009": "INV_APPARENT_POWER_KVA",
  "3010": "INV_ACTIVE_POWER_KW",
};
