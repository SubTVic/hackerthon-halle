import { describe, it, expect } from "vitest";
import { validate } from "./index";
import { FALLBACKS } from "../ingest/fallbacks";

const complete = () => FALLBACKS.complete("raw");
const gappy = () => FALLBACKS.gappy("raw");
const chaotic = () => FALLBACKS.chaotic("raw");

describe("validate — Vollständigkeitsprüfung (ECHT)", () => {
  it("akzeptiert eine vollständige Anfrage", () => {
    const res = validate(complete());
    expect(res.ok).toBe(true);
    expect(res.missing).toHaveLength(0);
    expect(res.completeness).toBe(1);
  });

  it("erkennt fehlende Pflichtfelder in einer lückenhaften Anfrage", () => {
    const res = validate(gappy());
    expect(res.ok).toBe(false);
    const labels = res.missing.map((m) => m.label);
    // Straße, Hausnummer, PLZ, E-Mail, Scheinleistung fehlen
    expect(labels).toEqual(expect.arrayContaining([expect.stringMatching(/E-Mail/)]));
    expect(res.completeness).toBeGreaterThan(0);
    expect(res.completeness).toBeLessThan(1);
  });

  it("liefert jedem Issue einen Pfad und Grund", () => {
    for (const m of validate(gappy()).missing) {
      expect(m.path).toBeTruthy();
      expect(m.reason).toBe("missing");
    }
  });
});

describe("validate — Vorbedingungslogik (postal vs. Flurdaten)", () => {
  it("fordert bei Flurdaten KEINE Straße, aber Gemarkung + Flurstück", () => {
    const res = validate(chaotic());
    const missingPaths = res.missing.map((m) => m.path);
    // Standort ist cadastral -> Straße/Hausnummer dürfen NICHT als fehlend gelten
    expect(missingPaths).not.toContain("installation.siteAddress.street");
    expect(missingPaths).not.toContain("installation.siteAddress.no");
    // Gemarkung + Flurstück sind im chaotic-Fallback befüllt -> nicht fehlend
    expect(missingPaths).not.toContain("installation.cadastral.parcel");
  });

  it("fordert bei postalischer Adresse die Straße", () => {
    const req = gappy(); // locationKind = "postal", Straße fehlt
    const missingPaths = validate(req).missing.map((m) => m.path);
    expect(missingPaths).toContain("installation.siteAddress.street");
  });
});
