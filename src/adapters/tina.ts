// ============================================================================
// TINA ADAPTER — kanonisches JSON / VDE -> TINA-Zielformat
// ============================================================================
// TINA = CRM für Netzbetreiber von CURSOR (cursor.de), eingesetzt u.a. bei
// TransnetBW. Integration/Datenaustausch läuft laut Hersteller über CSV-Im-/
// Export und Systemschnittstellen. Es gibt KEIN öffentliches Feldschema — die
// exakten Spaltennamen kommen aus dem CURSOR-Import-Template des Kunden.
//
// Dieser Adapter transformiert die kanonische Anfrage (über den VDE-Export) in
// einen TINA-Datensatz und serialisiert ihn als CSV (dokumentierter TINA-Weg).
//
// TODO(sonnet): echte TINA-Spaltennamen aus dem CURSOR-Import-Template in
//   TINA_KEYS eintragen. Struktur + Serialisierung bleiben sonst unverändert.
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

/** CSV-escaping nach RFC 4180 (Anführungszeichen verdoppeln, bei ;/"/\n quoten). */
function csvCell(value: string): string {
  return /[";\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/**
 * Serialisiert einen TINA-Datensatz als CSV (eine Zeile pro Anfrage) —
 * der von CURSOR/TINA dokumentierte Im-/Export-Weg. Semikolon-getrennt
 * (deutsche Locale). Kopfdaten + Felder in einer flachen Spaltenliste.
 *
 * TODO(sonnet): Trennzeichen/Encoding (UTF-8 BOM?) an das konkrete
 *   CURSOR-Import-Template anpassen.
 */
export function serializeTina(record: TinaRecord): string {
  const cols: Array<[string, string | null]> = [
    ["REQUEST_ID", record.header.requestId],
    ["CHANNEL", record.header.channel],
    ["RECEIVED_AT", record.header.receivedAt],
    ["INSTALLATION_TYPE", record.header.installationType],
    ...record.fields.map((f) => [f.key, f.value] as [string, string | null]),
  ];
  const header = cols.map(([k]) => csvCell(k)).join(";");
  const row = cols.map(([, v]) => csvCell(v ?? "")).join(";");
  return `${header}\n${row}`;
}

/** Alternative JSON-Repräsentation (für Debug/Anzeige). */
export function serializeTinaJson(record: TinaRecord): string {
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
