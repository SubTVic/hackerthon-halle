import { describe, it, expect } from "vitest";
import { toVde, toVdeMapped } from "./vde";
import { FALLBACKS } from "../ingest/fallbacks";

describe("adapters/vde — Export ins VDE-Datenset", () => {
  it("exportiert alle PV-Felder mit korrekten Nummern", () => {
    const rows = toVde(FALLBACKS.complete("raw"));
    expect(rows.length).toBeGreaterThan(50); // 104 PV-Felder
    expect(rows.every((r) => /^\d{4}$/.test(r.nr))).toBe(true);
  });

  it("befüllt gemappte Felder aus dem kanonischen JSON", () => {
    const mapped = toVdeMapped(FALLBACKS.complete("raw"));
    const byNr = Object.fromEntries(mapped.map((r) => [r.nr, r.value]));
    expect(byNr["1008"]).toBe("Halle (Saale)"); // Ort
    expect(byNr["1110"]).toBe("maria.schmidt@example.de"); // E-Mail
    expect(byNr["3010"]).toBe("9.8"); // Wirkleistung
    expect(byNr["3003"]).toBe("SMA"); // Wechselrichter-Hersteller
  });

  it("lässt fehlende Felder als null sichtbar (für rote Markierung)", () => {
    const mapped = toVdeMapped(FALLBACKS.gappy("raw"));
    const byNr = Object.fromEntries(mapped.map((r) => [r.nr, r.value]));
    expect(byNr["1110"]).toBeNull(); // E-Mail fehlt
    expect(byNr["3009"]).toBeNull(); // Scheinleistung fehlt
  });
});
