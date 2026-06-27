import { describe, it, expect } from "vitest";
import {
  PROJECTS,
  inboxForProject,
  buildThreads,
  classifyCategory,
  classifyTopic,
  defaultProfile,
  evaluateProfile,
  buildDraft,
  compileCrm,
  projectByRef,
} from "./index";

describe("projects — Klassifikation", () => {
  it("erkennt Kategorien aus dem Inhalt", () => {
    const inbox = inboxForProject("3320");
    const beschwerde = inbox.find((m) => m.subject.toLowerCase().includes("beschwerde"))!;
    expect(classifyCategory(beschwerde)).toBe("B");
  });

  it("erkennt Themen für Dubletten-Gruppierung", () => {
    const inbox = inboxForProject("2089");
    const wallbox = inbox.find((m) => m.subject.includes("Netzverträglichkeit Wallbox"))!;
    expect(classifyTopic(wallbox).key).toBe("wallbox-14a");
  });
});

describe("projects — Threading & Dubletten", () => {
  it("vergibt Vorgangsnummern im Format ref.kategorie.NN", () => {
    const threads = buildThreads(inboxForProject("1654"), "1654");
    const allMsgs = threads.flatMap((t) => t.messages);
    for (const cm of allMsgs) {
      expect(cm.classification.threadId).toMatch(/^1654\.[TANDBS]\.\d{2}$/);
    }
  });

  it("fasst Mehrfach-Nachfragen derselben Person zusammen", () => {
    // Installateur fragt zweimal zur §14a-Wallbox bei Becker (2089).
    const threads = buildThreads(inboxForProject("2089"), "2089");
    const tThread = threads.find((t) => t.category === "T")!;
    expect(tThread.messages.length).toBeGreaterThanOrEqual(2);
    expect(tThread.compiledCount).toBeGreaterThanOrEqual(1);
    const dup = tThread.messages.find((m) => m.classification.duplicateOf);
    expect(dup).toBeDefined();
  });

  it("ordnet Nachrichten ohne Referenznummer über den Inhalt zu", () => {
    // Brief vom Bauordnungsamt ohne refHint -> Projekt 1654 (Halle-Süd).
    const threads = buildThreads(inboxForProject("1654"), "1654");
    const fromAuthority = threads
      .flatMap((t) => t.messages)
      .find((m) => m.message.senderName.includes("Bauordnungsamt"));
    expect(fromAuthority).toBeDefined();
    expect(fromAuthority!.classification.projectRef).toBe("1654");
  });
});

describe("projects — Anforderungsprofil (änderbar)", () => {
  it("bewertet aktive vs. erfüllte Anforderungen", () => {
    const profile = defaultProfile("household");
    const status = evaluateProfile(profile);
    expect(status.open.length + status.done.length).toBe(
      profile.requirements.filter((r) => r.active).length,
    );
  });

  it("deaktivierte Anforderung zählt nicht mehr in die Vollständigkeit", () => {
    const profile = defaultProfile("household");
    const before = evaluateProfile(profile).open.length;
    const open14a = profile.requirements.find((r) => r.id === "hh-14a")!;
    open14a.active = false;
    const after = evaluateProfile(profile).open.length;
    expect(after).toBe(before - 1);
  });
});

describe("projects — Antwort-Entwurf (Sprache + Freigabe)", () => {
  it("schreibt für Techniker fachlich, für Investor verständlich", () => {
    const threads = buildThreads(inboxForProject("3320"), "3320");
    const profile = defaultProfile("windturbine");
    const open = evaluateProfile(profile).open;

    const techThread = threads.find((t) => t.category === "T")!;
    const techDraft = buildDraft(techThread, open);
    expect(techDraft.toRole).toBe("technician");

    const beschwerde = threads.find((t) => t.category === "B")!;
    const investorDraft = buildDraft(beschwerde, open);
    expect(investorDraft.toRole).toBe("investor");
    expect(investorDraft.status).toBe("draft"); // kein Versand ohne Freigabe
    // unterschiedliche Texte je Empfänger
    expect(techDraft.body).not.toEqual(investorDraft.body);
  });
});

describe("projects — CRM-Verdichtung", () => {
  it("verdichtet alle Threads in einen Projekt-Datensatz", () => {
    const project = projectByRef("1654")!;
    const threads = buildThreads(inboxForProject("1654"), "1654");
    const status = evaluateProfile(defaultProfile(project.type));
    const crm = compileCrm(project, threads, status);
    expect(crm.ref).toBe("1654");
    expect(crm.totalThreads).toBe(threads.length);
    expect(crm.totalMessages).toBeGreaterThan(0);
  });

  it("hat genau 3 Beispielprojekte", () => {
    expect(PROJECTS).toHaveLength(3);
    expect(PROJECTS.map((p) => p.type).sort()).toEqual(["datacenter", "household", "windturbine"]);
  });
});
