import { describe, it, expect } from "vitest";
import { buildResponse } from "./index";
import { validate } from "../validate";
import { FALLBACKS } from "../ingest/fallbacks";

describe("respond — Nachforderungs-Nachricht", () => {
  it("listet die fehlenden Pflichtfelder im Body auf", () => {
    const req = FALLBACKS.gappy("raw");
    const result = validate(req);
    const draft = buildResponse(req, result);
    expect(draft.subject).toContain(req.requestId);
    for (const m of result.missing) {
      expect(draft.body).toContain(m.label);
    }
  });

  it("nutzt den Originalkanal des Absenders", () => {
    const req = FALLBACKS.chaotic("raw"); // channel = fax
    const draft = buildResponse(req, validate(req));
    expect(draft.channel).toBe("fax");
  });

  it("meldet keine Lücken bei vollständiger Anfrage", () => {
    const req = FALLBACKS.complete("raw");
    const draft = buildResponse(req, validate(req));
    expect(draft.body).toMatch(/vollständig/);
  });
});
