import { describe, it, expect } from "vitest";
import { openCase, receiveMessage, openBlockers, isBlocked, classifyHeuristic } from "./index";
import { FALLBACKS } from "../ingest/fallbacks";
import { MOCK_MESSAGES } from "../examples/messages";

const newCase = () => openCase(FALLBACKS.complete("raw"));
const msgByLabel = (label: string) => {
  const m = MOCK_MESSAGES.find((x) => x.label.startsWith(label));
  if (!m) throw new Error("missing fixture: " + label);
  return m;
};

describe("process — Vorgangs-Timeline", () => {
  it("legt einen Vorgang mit Start-Event an", () => {
    const k = newCase();
    expect(k.requestId).toBe("REQ-COMPLETE-001");
    expect(k.events).toHaveLength(1);
    expect(isBlocked(k)).toBe(false);
  });

  it("nimmt eine Techniker-SMS als Problemmeldung auf und blockiert den Vorgang", () => {
    let k = newCase();
    k = receiveMessage(k, { ...msgByLabel("Techniker meldet Problem"), requestId: k.requestId });
    expect(k.events).toHaveLength(2);
    const blockers = openBlockers(k);
    expect(blockers).toHaveLength(1);
    expect(blockers[0].senderRole).toBe("technician");
    expect(blockers[0].channel).toBe("sms");
    expect(blockers[0].type).toBe("problem_report");
    expect(isBlocked(k)).toBe(true);
  });

  it("hält Events chronologisch sortiert", () => {
    let k = newCase();
    for (const m of MOCK_MESSAGES) k = receiveMessage(k, { ...m, requestId: k.requestId });
    const times = k.events.map((e) => e.at);
    expect([...times].sort()).toEqual(times);
  });

  it("Status-Meldung 'fertig' blockiert nicht", () => {
    let k = newCase();
    k = receiveMessage(k, { ...msgByLabel("Techniker: Montage"), requestId: k.requestId });
    expect(isBlocked(k)).toBe(false);
  });
});

describe("process — Heuristik-Klassifikation", () => {
  it("erkennt Blocker, Status und Frage", () => {
    expect(classifyHeuristic("Zählerschrank passt nicht").severity).toBe("blocker");
    expect(classifyHeuristic("Montage abgeschlossen").type).toBe("status_update");
    expect(classifyHeuristic("Welches Messkonzept?").type).toBe("question");
  });
});
