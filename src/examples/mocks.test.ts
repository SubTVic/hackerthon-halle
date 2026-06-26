import { describe, it, expect } from "vitest";
import { ALL_MOCKS, MOCK_EMAILS, MOCK_CALLS } from "./mocks";

// Diese Mocks (E-Mails + Telefon-Transkripte) sind Fixtures für den echten
// LLM-Parser. Solange ingest fake-first läuft (USE_LLM=false), prüfen wir hier
// nur die Wohlgeformtheit der Fixtures.
describe("mock-Eingänge (Fixtures)", () => {
  it("hat E-Mail- und Telefon-Mocks", () => {
    expect(MOCK_EMAILS.length).toBeGreaterThan(0);
    expect(MOCK_CALLS.length).toBeGreaterThan(0);
    expect(MOCK_CALLS.every((m) => m.channel === "phone")).toBe(true);
  });

  it("jeder Mock trägt Rohtext und eine Vollständigkeits-Erwartung", () => {
    for (const m of ALL_MOCKS) {
      expect(m.raw.trim().length).toBeGreaterThan(20);
      expect(typeof m.expectComplete).toBe("boolean");
    }
  });

  // TODO(sonnet): sobald llmParser implementiert ist, hier den echten
  //   ingest -> validate Pfad gegen `expectComplete` prüfen:
  //
  //   it.each(ALL_MOCKS)("%s validiert wie erwartet", async (mock) => {
  //     const req = await parseWithLlm(mock.raw);
  //     expect(validate(req!).ok).toBe(mock.expectComplete);
  //   });
});
