// ============================================================================
// FELD-REGISTRY — Pflicht- und Vorbedingungslogik (generisch, pro Anlagentyp)
// ============================================================================
// Die required/precondition-Logik kommt 1:1 aus dem VDE-Datenset
// (Spalte "Pflicht, Optional" und Spalte "interne Vorbedingung"), wird hier
// aber GENERISCH auf kanonische Feldpfade abgebildet. Das VDE-Feld-Mapping
// selbst (Nummern) liegt in adapters/vde.ts — hier steht nur die fachliche
// Pflicht-/Vorbedingungslogik, an die validate/ koppelt.
//
// Quelle: src/data/vde-pv-fields.json (104 PV-relevante Felder, extrahiert).
//
// SCOPE (Hackathon): nur Anlagentyp "pv" bis 30 kW, Antragphase 1
// (Mindestangaben). Andere Typen später ergänzen.
// ============================================================================

import type { CanonicalRequest, InstallationType } from "./types";

/** Liefert den Wert an einem Punkt-getrennten Pfad, z.B. "installation.powerKw". */
export type FieldPath = string;

export interface FieldDef {
  /** Kanonischer Pfad in CanonicalRequest. */
  path: FieldPath;
  /** Menschlich lesbares Label (für UI + Nachforderungs-Mail). */
  label: string;
  /** Anlagentypen, für die dieses Feld grundsätzlich relevant ist. */
  appliesTo: InstallationType[];
  /** Ist das Feld in Antragphase 1 Pflicht (sofern Vorbedingung erfüllt)? */
  required: boolean;
  /**
   * Optionale Vorbedingung. Nur wenn diese true liefert, gilt `required`.
   * Bildet die VDE-Spalte "interne Vorbedingung" generisch ab
   * (z.B. Straße ist nur Pflicht, wenn Standort als postalische Adresse
   * angegeben wurde — nicht bei Flurdaten).
   */
  precondition?: (req: CanonicalRequest) => boolean;
  /** Korrespondierende VDE-Feldnummer(n) — nur als Beleg/Doku, optional. */
  vdeNr?: string;
}

/**
 * Liest einen Punkt-Pfad aus dem kanonischen Objekt.
 * TODO(sonnet): Array-Pfade unterstützen (z.B. "parties[role=operator].name").
 *   Für den Hackathon reichen einfache Punkt-Pfade.
 */
export function getByPath(obj: unknown, path: FieldPath): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[key];
    return undefined;
  }, obj);
}

// Vorbedingungs-Helfer ------------------------------------------------------
const isPostal = (r: CanonicalRequest) => r.installation.locationKind === "postal";
const isCadastral = (r: CanonicalRequest) => r.installation.locationKind === "cadastral";

/**
 * REGISTRY (PV, Antragphase 1).
 *
 * TODO(sonnet): aus src/data/vde-pv-fields.json vervollständigen.
 *   - Jede Pflicht-Zeile (required===true, phase1===true) auf einen
 *     kanonischen Pfad mappen.
 *   - precondition aus dem "precondition"-Feld der JSON ableiten
 *     (z.B. "1001 = postalische Adresse" -> isPostal).
 *   - vdeNr setzen, damit adapters/vde.ts darauf zurückgreifen kann.
 * Unten ist eine repräsentative, lauffähige Teilmenge als Vorlage.
 */
export const PV_FIELDS: FieldDef[] = [
  // --- Anlagenstandort (1000er) — Standortangabe mit Vorbedingung ----------
  {
    path: "installation.locationKind",
    label: "Art der Standortangabe (postalisch / Flurdaten)",
    appliesTo: ["pv"],
    required: true,
    vdeNr: "1001",
  },
  {
    path: "installation.siteAddress.street",
    label: "Standort: Straße",
    appliesTo: ["pv"],
    required: true,
    precondition: isPostal,
    vdeNr: "1002",
  },
  {
    path: "installation.siteAddress.no",
    label: "Standort: Hausnummer",
    appliesTo: ["pv"],
    required: true,
    precondition: isPostal,
    vdeNr: "1003",
  },
  {
    path: "installation.cadastral.district",
    label: "Standort: Gemarkung",
    appliesTo: ["pv"],
    required: true,
    precondition: isCadastral,
    vdeNr: "1005",
  },
  {
    path: "installation.cadastral.parcel",
    label: "Standort: Flurstück (Zähler/Nenner)",
    appliesTo: ["pv"],
    required: true,
    precondition: isCadastral,
    vdeNr: "1006",
  },
  {
    path: "installation.siteAddress.zip",
    label: "Standort: PLZ",
    appliesTo: ["pv"],
    required: true,
    vdeNr: "1007",
  },
  {
    path: "installation.siteAddress.city",
    label: "Standort: Ort",
    appliesTo: ["pv"],
    required: true,
    vdeNr: "1008",
  },

  // --- Anschlussnutzer/Anlagenbetreiber (1100er) ---------------------------
  // TODO(sonnet): operator-Partei prüfen. Aktuell vereinfachte Pfade.
  {
    path: "parties.0.name",
    label: "Anlagenbetreiber: Name oder Firmenname",
    appliesTo: ["pv"],
    required: true,
    vdeNr: "1101",
  },
  {
    path: "parties.0.contact.email",
    label: "Anlagenbetreiber: E-Mail",
    appliesTo: ["pv"],
    required: true,
    vdeNr: "1110",
  },

  // --- Erzeugungsanlage Wechselrichter (3000er) ----------------------------
  {
    path: "installation.apparentPowerKva",
    label: "Summe der maximalen Scheinleistung (kVA)",
    appliesTo: ["pv"],
    required: true,
    vdeNr: "3009",
  },
  {
    path: "installation.powerKw",
    label: "Summe der maximalen Wirkleistung (kW)",
    appliesTo: ["pv"],
    required: true,
    vdeNr: "3010",
  },
  // TODO(sonnet): Hersteller/Typ/Einheitenzertifikat des Wechselrichters
  //   (3003/3004/3005) als components[kind=inverter].* mappen.
];

/** Alle für einen Anlagentyp relevanten Felddefinitionen. */
export function fieldsFor(type: InstallationType): FieldDef[] {
  return PV_FIELDS.filter((f) => f.appliesTo.includes(type));
}
