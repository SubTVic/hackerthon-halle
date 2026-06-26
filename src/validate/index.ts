// ============================================================================
// VALIDATE — Vollständigkeits- und Vorbedingungsprüfung (ECHT)
// ============================================================================
// Prüft eine kanonische Anfrage gegen die Pflichtfelder + Vorbedingungen aus
// canonical/fields.ts. Gibt eine Liste fehlender / verletzter Felder zurück.
// Dies ist (neben dem Schema) das einzige Modul, das wirklich robust sein muss.
// ============================================================================

import {
  type CanonicalRequest,
  type FieldDef,
  fieldsFor,
  getByPath,
} from "../canonical";

export interface ValidationIssue {
  path: string;
  label: string;
  vdeNr?: string;
  reason: "missing" | "precondition_violated";
}

export interface ValidationResult {
  ok: boolean;
  missing: ValidationIssue[];
  /** Anteil erfüllter Pflichtfelder (0..1) — für die UI-Fortschrittsanzeige. */
  completeness: number;
}

function isEmpty(value: unknown): boolean {
  return (
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim() === "") ||
    (Array.isArray(value) && value.length === 0)
  );
}

/**
 * Prüft, ob ein Feld unter Berücksichtigung seiner Vorbedingung aktuell
 * Pflicht ist.
 */
function isActiveRequirement(field: FieldDef, req: CanonicalRequest): boolean {
  if (!field.required) return false;
  if (field.precondition) return field.precondition(req);
  return true;
}

/**
 * Hauptfunktion: validiert eine kanonische Anfrage.
 * ECHT implementiert — bitte nicht faken, das ist der Kern des Pitches.
 */
export function validate(req: CanonicalRequest): ValidationResult {
  const fields = fieldsFor(req.installation.type);
  const active = fields.filter((f) => isActiveRequirement(f, req));

  const missing: ValidationIssue[] = [];
  for (const field of active) {
    const value = getByPath(req, field.path);
    if (isEmpty(value)) {
      missing.push({
        path: field.path,
        label: field.label,
        vdeNr: field.vdeNr,
        reason: "missing",
      });
    }
  }

  // TODO(sonnet): zusätzliche Konsistenzprüfungen ergänzen, z.B.
  //   - powerKw <= 30 (Scope PV bis 30 kW)
  //   - Wenn locationKind="postal", dürfen cadastral-Felder leer sein (und umgekehrt)
  //   - IBAN nur Pflicht bei bestimmter Veräußerungsform (VDE 1111 Vorbedingung)

  const fulfilled = active.length - missing.length;
  const completeness = active.length === 0 ? 1 : fulfilled / active.length;

  return { ok: missing.length === 0, missing, completeness };
}
