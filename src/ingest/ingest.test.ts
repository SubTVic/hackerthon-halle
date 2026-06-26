import { describe, it, expect } from "vitest";
import { ingest } from "./index";
import { EXAMPLES, exampleById } from "../examples";

describe("ingest — Eingangs-Parser (fake-first)", () => {
  it("liefert für jedes Beispiel ein kanonisches JSON aus dem Fallback", async () => {
    for (const ex of EXAMPLES) {
      const { request, source } = await ingest(ex);
      expect(source).toBe("fallback"); // USE_LLM=false
      expect(request.installation.type).toBe("pv");
      expect(request._meta.sourceRaw).toBe(ex.raw);
    }
  });

  it("setzt die erwartete requestId pro Beispiel", async () => {
    const { request } = await ingest(exampleById("complete"));
    expect(request.requestId).toBe("REQ-COMPLETE-001");
  });

  it("darf nie werfen (Demo-Stabilität)", async () => {
    await expect(ingest(exampleById("chaotic"))).resolves.toBeDefined();
  });
});
