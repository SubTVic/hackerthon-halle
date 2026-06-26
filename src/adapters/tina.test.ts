import { describe, it, expect } from "vitest";
import { toTina, serializeTina } from "./tina";
import { FALLBACKS } from "../ingest/fallbacks";

describe("adapters/tina — Export ins TINA-Zielformat", () => {
  it("baut Kopfdaten aus der kanonischen Anfrage", () => {
    const rec = toTina(FALLBACKS.complete("raw"));
    expect(rec.header.requestId).toBe("REQ-COMPLETE-001");
    expect(rec.header.recordType).toBe("GRID_CONNECTION_REQUEST");
    expect(rec.header.installationType).toBe("pv");
  });

  it("überträgt Werte und behält die VDE-Herkunft", () => {
    const rec = toTina(FALLBACKS.complete("raw"));
    const byNr = Object.fromEntries(rec.fields.map((f) => [f.sourceVdeNr, f]));
    expect(byNr["1110"].value).toBe("maria.schmidt@example.de");
    expect(byNr["1110"].key).toBe("OPERATOR_EMAIL");
    expect(byNr["3010"].value).toBe("9.8");
  });

  it("serialisiert als CSV mit Kopfzeile + Datenzeile", () => {
    const out = serializeTina(toTina(FALLBACKS.complete("raw")));
    const lines = out.split("\n");
    expect(lines).toHaveLength(2);
    const cols = lines[0].split(";");
    const vals = lines[1].split(";");
    expect(cols).toContain("REQUEST_ID");
    expect(cols).toContain("OPERATOR_EMAIL");
    expect(vals[cols.indexOf("REQUEST_ID")]).toBe("REQ-COMPLETE-001");
    expect(vals[cols.indexOf("OPERATOR_EMAIL")]).toBe("maria.schmidt@example.de");
  });

  it("escaped CSV-Sonderzeichen (Semikolon/Anführungszeichen)", () => {
    const req = FALLBACKS.complete("raw");
    req.parties[0].name = 'Müller; "Solar" GmbH';
    const out = serializeTina(toTina(req));
    expect(out).toContain('"Müller; ""Solar"" GmbH"');
  });
});
