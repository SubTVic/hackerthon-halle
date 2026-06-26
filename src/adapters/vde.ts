// ============================================================================
// VDE-DATENSET ADAPTER — kanonisches JSON -> internes Zielformat (ECHT-genug)
// ============================================================================
// Erster Ausgangs-Adapter. Mappt kanonische Felder auf VDE-Datenset-Feldnummern
// (Datenset 3.0, Erzeugungsanlage PV, Antragphase 1). Belegt durch
// src/data/vde-pv-fields.json.
//
// Ein neues Zielsystem (SAP, CSV, proprietär) = nur ein neuer Adapter hier,
// der Kern (canonical/) bleibt unberührt.
// ============================================================================

import { type CanonicalRequest, getByPath } from "../canonical";
import vdeFields from "../data/vde-pv-fields.json";

export interface VdeRow {
  nr: string;
  label: string;
  category: string | null;
  value: string | null;
}

/**
 * Mapping VDE-Feldnummer -> kanonischer Pfad.
 * TODO(sonnet): aus canonical/fields.ts (vdeNr) + vde-pv-fields.json
 *   vervollständigen. Unten eine repräsentative Teilmenge.
 */
const VDE_TO_CANONICAL: Record<string, string> = {
  "1001": "installation.locationKind",
  "1002": "installation.siteAddress.street",
  "1003": "installation.siteAddress.no",
  "1005": "installation.cadastral.district",
  "1006": "installation.cadastral.parcel",
  "1007": "installation.siteAddress.zip",
  "1008": "installation.siteAddress.city",
  "1101": "parties.0.name",
  "1110": "parties.0.contact.email",
  "1109": "parties.0.contact.phone",
  "3003": "installation.components.0.manufacturer",
  "3004": "installation.components.0.model",
  "3005": "installation.components.0.certId",
  "3009": "installation.apparentPowerKva",
  "3010": "installation.powerKw",
};

function stringify(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  return String(value);
}

/**
 * Exportiert eine kanonische Anfrage ins VDE-Format (Liste von Feld-Zeilen).
 * Leere Felder bleiben sichtbar (value=null) — so zeigt die UI Lücken im Export.
 */
export function toVde(req: CanonicalRequest): VdeRow[] {
  return (vdeFields as Array<{ nr: string; label: string; category: string | null }>).map(
    (f) => {
      const path = VDE_TO_CANONICAL[f.nr];
      const value = path ? stringify(getByPath(req, path)) : null;
      return { nr: f.nr, label: f.label, category: f.category, value };
    },
  );
}

/** Nur die gemappten (befüllbaren) Zeilen — kompaktere Demo-Ansicht. */
export function toVdeMapped(req: CanonicalRequest): VdeRow[] {
  return toVde(req).filter((r) => r.nr in VDE_TO_CANONICAL);
}
