import { describe, it, expect } from "vitest";
import { openCase, receiveMessage, openBlockers, isBlocked, classifyHeuristic } from "./index";
import { FALLBACKS } from "../ingest/fallbacks";
import { DEMO_CASES } from "../examples/cases";
import { lookupCase } from "./caseDb";

const newCase = () => openCase(FALLBACKS.complete("raw"));
const messyCase = () => openCase(FALLBACKS.chaotic("raw"));

describe("process — Vorgangs-Timeline", () => {
  it("legt einen Vorgang mit Start-Event an", () => {
    const k = newCase();
    expect(k.requestId).toBe("REQ-COMPLETE-001");
    expect(k.events).toHaveLength(1);
    expect(isBlocked(k)).toBe(false);
  });

  it("spielt alle Nachrichten des chaotischen Falls durch und findet Blocker", () => {
    let k = messyCase();
    const messyDemo = DEMO_CASES.find((c) => c.id === "messy")!;
    for (const msg of messyDemo.messages) {
      k = receiveMessage(k, { ...msg, requestId: k.requestId });
    }
    expect(k.events.length).toBe(1 + messyDemo.messages.length);
    const blockers = openBlockers(k);
    expect(blockers.length).toBeGreaterThanOrEqual(1);
    expect(blockers[0].senderRole).toBe("technician");
  });

  it("klassifiziert Investor-Telefonat als Beschwerde", () => {
    let k = messyCase();
    const messyDemo = DEMO_CASES.find((c) => c.id === "messy")!;
    const investorMsg = messyDemo.messages.find((m) => m.senderRole === "investor")!;
    k = receiveMessage(k, { ...investorMsg, requestId: k.requestId });
    const complaint = k.events.find((e) => e.type === "complaint");
    expect(complaint).toBeDefined();
    expect(complaint!.channel).toBe("phone");
    expect(complaint!.severity).toBe("warning");
  });

  it("hält Events chronologisch sortiert", () => {
    let k = messyCase();
    const messyDemo = DEMO_CASES.find((c) => c.id === "messy")!;
    for (const msg of messyDemo.messages) {
      k = receiveMessage(k, { ...msg, requestId: k.requestId });
    }
    const times = k.events.map((e) => e.at);
    expect([...times].sort()).toEqual(times);
  });

  it("sauberer Fall hat keine Blocker", () => {
    let k = newCase();
    const cleanDemo = DEMO_CASES.find((c) => c.id === "clean")!;
    for (const msg of cleanDemo.messages) {
      k = receiveMessage(k, { ...msg, requestId: k.requestId });
    }
    expect(isBlocked(k)).toBe(false);
  });
});

describe("process — Heuristik-Klassifikation", () => {
  it("erkennt Blocker, Status, Frage und Beschwerde", () => {
    expect(classifyHeuristic("Zählerschrank passt nicht").severity).toBe("blocker");
    expect(classifyHeuristic("Montage abgeschlossen").type).toBe("status_update");
    expect(classifyHeuristic("Welches Messkonzept?").type).toBe("question");
    expect(classifyHeuristic("Warum dauert das schon wieder Wochen?").type).toBe("complaint");
    expect(classifyHeuristic("Das ist unakzeptabel, ich rufe meinen Anwalt an").type).toBe("complaint");
  });
});

describe("process — Fake Case Database", () => {
  it("findet Auftragsdaten für bekannte Request-IDs", () => {
    const rec = lookupCase("REQ-CHAOTIC-001");
    expect(rec).not.toBeNull();
    expect(rec!.applicantName).toBe("Hausverwaltung Kröllwitz GmbH");
    expect(rec!.pending.length).toBeGreaterThan(0);
    expect(rec!.daysOpen).toBe(42);
  });

  it("gibt null für unbekannte IDs", () => {
    expect(lookupCase("UNKNOWN")).toBeNull();
  });
});
