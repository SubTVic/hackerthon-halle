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

  it("serialisiert in einen String (Format vorläufig)", () => {
    const out = serializeTina(toTina(FALLBACKS.gappy("raw")));
    expect(typeof out).toBe("string");
    expect(out).toContain("GRID_CONNECTION_REQUEST");
  });
});
