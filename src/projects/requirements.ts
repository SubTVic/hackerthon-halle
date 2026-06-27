// ============================================================================
// ANFORDERUNGSPROFIL — was ist GERADE JETZT für das Projekt wichtig?
// ============================================================================
// Bewusst datengetrieben und zur Laufzeit änderbar: Gesetzeslage und
// Datenanforderungen ändern sich häufig (EnWG §14a, VDE-AR-N 4105/4110, …).
// Der Netzbetreiber kann Anforderungen aktivieren/deaktivieren, ohne dass
// Code angefasst werden muss. Jede Anforderung trägt ihre Rechtsgrundlage.
// ============================================================================

import type { ProjectType } from "./types";

export interface Requirement {
  id: string;
  label: string;
  legalBasis: string; // Rechtsgrundlage / Regelwerk
  /** Aktiv = wird aktuell geprüft. Umschaltbar (Gesetzesänderung). */
  active: boolean;
  /** Liegt die Angabe/das Dokument bereits vor? (aus Projektkontext) */
  fulfilled: boolean;
}

export interface RequirementProfile {
  projectType: ProjectType;
  /** Stand des zugrunde liegenden Regelwerks — wählbar. */
  rulesetVersion: string;
  requirements: Requirement[];
}

// Verfügbare Regelwerk-Stände (Demo: Umschalten ändert Pflichtfelder).
export const RULESET_VERSIONS = [
  "VDE-AR-N 4105:2018-11",
  "VDE-AR-N 4105:2024-11",
  "EnWG §14a (ab 2024)",
];

const PROFILES: Record<ProjectType, RequirementProfile> = {
  datacenter: {
    projectType: "datacenter",
    rulesetVersion: "VDE-AR-N 4110:2023-09",
    requirements: [
      { id: "dc-load", label: "Lastprofil / Anschlussleistung", legalBasis: "VDE-AR-N 4110 §5", active: true, fulfilled: true },
      { id: "dc-sc", label: "Netzkurzschlussleistung am Übergabepunkt", legalBasis: "VDE-AR-N 4110 §10", active: true, fulfilled: false },
      { id: "dc-harm", label: "Oberschwingungs-/Netzrückwirkungsnachweis", legalBasis: "VDE-AR-N 4110 §5.4", active: true, fulfilled: false },
      { id: "dc-trafo", label: "Standortabstimmung Trafostation + Schallschutz", legalBasis: "BImSchG / Bauordnung LSA", active: true, fulfilled: false },
      { id: "dc-redundancy", label: "Redundanzkonzept (n-1)", legalBasis: "Anschlussrichtlinie MS", active: false, fulfilled: false },
    ],
  },
  household: {
    projectType: "household",
    rulesetVersion: "VDE-AR-N 4105:2024-11",
    requirements: [
      { id: "hh-form", label: "Anmeldeformular E.8 vollständig", legalBasis: "VDE-AR-N 4105 §5.1", active: true, fulfilled: true },
      { id: "hh-wr", label: "Einheitenzertifikat Wechselrichter", legalBasis: "VDE-AR-N 4105 §5.7", active: true, fulfilled: true },
      { id: "hh-14a", label: "§14a-Steuerbarkeit (Wallbox/WP) nachgewiesen", legalBasis: "EnWG §14a (ab 2024)", active: true, fulfilled: false },
      { id: "hh-meter", label: "Messkonzept (Voll-/Überschuss)", legalBasis: "MsbG", active: true, fulfilled: false },
      { id: "hh-site", label: "Lageplan mit Aufstellungsort", legalBasis: "VDE-AR-N 4105 §5.1", active: false, fulfilled: false },
    ],
  },
  windturbine: {
    projectType: "windturbine",
    rulesetVersion: "VDE-AR-N 4110:2023-09",
    requirements: [
      { id: "wt-cert", label: "Anlagenzertifikat + Konformitätserklärung", legalBasis: "VDE-AR-N 4110 §11", active: true, fulfilled: true },
      { id: "wt-unit", label: "Einheitenzertifikat Umrichter", legalBasis: "VDE-AR-N 4110 §11.2", active: true, fulfilled: true },
      { id: "wt-frt", label: "FRT-Nachweis (Fault-Ride-Through)", legalBasis: "VDE-AR-N 4110 §10.2", active: true, fulfilled: false },
      { id: "wt-q", label: "Blindleistungs-Kennlinie Q(U) parametriert", legalBasis: "VDE-AR-N 4110 §10.2", active: true, fulfilled: false },
      { id: "wt-ibn", label: "Inbetriebnahme-Termin abgestimmt", legalBasis: "NAV §13", active: true, fulfilled: false },
    ],
  },
};

/** Liefert eine frische, unabhängige Kopie des Profils (zum Bearbeiten in der UI). */
export function defaultProfile(type: ProjectType): RequirementProfile {
  const base = PROFILES[type];
  return {
    ...base,
    requirements: base.requirements.map((r) => ({ ...r })),
  };
}

export interface RequirementStatus {
  open: Requirement[]; // aktiv & nicht erfüllt
  done: Requirement[]; // aktiv & erfüllt
  inactive: Requirement[]; // deaktiviert
  completeness: number; // 0..1 über aktive Anforderungen
}

export function evaluateProfile(profile: RequirementProfile): RequirementStatus {
  const active = profile.requirements.filter((r) => r.active);
  const done = active.filter((r) => r.fulfilled);
  const open = active.filter((r) => !r.fulfilled);
  const inactive = profile.requirements.filter((r) => !r.active);
  return {
    open,
    done,
    inactive,
    completeness: active.length === 0 ? 1 : done.length / active.length,
  };
}
