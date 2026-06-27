import { describe, it, expect } from "vitest";
import { openCase, receiveMessage, openBlockers, isBlocked, classifyHeuristic } from "./index";
import { FALLBACKS } from "../ingest/fallbacks";
import { DEMO_CASES } from "../examples/cases";
import { initialCrmRecord, applyCrmUpdates } from "./caseDb";
import { extractFromEvent } from "./extract";

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

describe("process — CRM Record + Extraction", () => {
  it("erstellt CRM-Record und wendet Extraktionen an", () => {
    const crm = initialCrmRecord("Maria Schmidt", "Bahnhofstraße 12, 06108 Halle", 9.8);
    expect(crm.applicant).toBe("Maria Schmidt");
    expect(crm.milestones.length).toBeGreaterThan(0);
    expect(crm.pendingItems.length).toBe(1);
  });

  it("extrahiert Daten aus Techniker-Blocker und aktualisiert CRM", () => {
    let k = messyCase();
    const messyDemo = DEMO_CASES.find((c) => c.id === "messy")!;
    const techMsg = messyDemo.messages.find((m) => m.senderRole === "technician" && m.expectBlocker)!;
    k = receiveMessage(k, { ...techMsg, requestId: k.requestId });
    const techEvent = k.events.find((e) => e.type === "problem_report" && e.severity === "blocker")!;
    const extraction = extractFromEvent(techEvent);
    expect(extraction.fields.length).toBeGreaterThan(0);
    expect(extraction.crmUpdates.some((u) => u.action === "add_blocker")).toBe(true);

    let crm = initialCrmRecord("Test", "Test", 11);
    crm = applyCrmUpdates(crm, extraction.crmUpdates, "Techniker");
    expect(crm.pendingItems.some((p) => p.label.includes("⛔"))).toBe(true);
    expect(crm.notes.length).toBeGreaterThan(1);
  });
});
