import type { CrmUpdate } from "./extract";

export interface Milestone {
  label: string;
  done: boolean;
  date?: string;
}

export interface PendingItem {
  label: string;
  overdue: boolean;
  since?: string;
}

export interface CaseNote {
  date: string;
  text: string;
  source: string;
}

export interface CrmRecord {
  applicant: string;
  siteAddress: string;
  powerKw: number;
  phase: string;
  phaseLabel: string;
  assignedTo: string;
  daysOpen: number;
  flags: string[];
  milestones: Milestone[];
  pendingItems: PendingItem[];
  notes: CaseNote[];
}

export function initialCrmRecord(applicant: string, siteAddress: string, powerKw: number): CrmRecord {
  return {
    applicant,
    siteAddress,
    powerKw,
    phase: "construction",
    phaseLabel: "Bau / Installation",
    assignedTo: "Frau Weber (Sachbearbeiterin)",
    daysOpen: 18,
    flags: [],
    milestones: [
      { label: "Antrag eingegangen", done: true, date: "10.06.2026" },
      { label: "Vollständigkeitsprüfung", done: true, date: "12.06.2026" },
      { label: "Netzverträglichkeit bestätigt", done: true, date: "15.06.2026" },
      { label: "Montage PV-Anlage", done: false },
      { label: "Zählersetzung", done: false },
      { label: "Inbetriebnahme", done: false },
    ],
    pendingItems: [
      { label: "Lageplan nachreichen", overdue: true, since: "14.06.2026" },
    ],
    notes: [
      { date: "15.06.2026", text: "Netzverträglichkeit geprüft — Anschluss genehmigt", source: "System" },
    ],
  };
}

function today(): string {
  return new Date().toLocaleDateString("de-DE");
}

export function applyCrmUpdate(record: CrmRecord, update: CrmUpdate, source: string): CrmRecord {
  const r = {
    ...record,
    milestones: record.milestones.map((m) => ({ ...m })),
    pendingItems: [...record.pendingItems.map((p) => ({ ...p }))],
    notes: [...record.notes],
    flags: [...record.flags],
  };

  switch (update.action) {
    case "add_blocker":
      r.pendingItems.push({ label: "⛔ " + update.description, overdue: false, since: today() });
      break;
    case "resolve_blocker":
      r.pendingItems = r.pendingItems.filter(
        (p) => !p.label.includes("⛔") || !p.label.toLowerCase().includes(update.description.substring(0, 20).toLowerCase()),
      );
      break;
    case "add_pending":
      r.pendingItems.push({ label: update.description, overdue: false, since: today() });
      break;
    case "resolve_pending": {
      const idx = r.pendingItems.findIndex((p) =>
        p.label.toLowerCase().includes((update.target ?? update.description).toLowerCase().substring(0, 15)),
      );
      if (idx >= 0) r.pendingItems.splice(idx, 1);
      break;
    }
    case "complete_milestone": {
      const ms = r.milestones.find((m) =>
        m.label.toLowerCase().includes((update.target ?? update.description).toLowerCase().substring(0, 12)),
      );
      if (ms) {
        ms.done = true;
        ms.date = today();
      }
      break;
    }
    case "add_note":
      r.notes.push({ date: today(), text: update.description, source });
      break;
    case "set_flag":
      if (!r.flags.includes(update.description)) {
        r.flags.push(update.description);
      }
      break;
  }

  return r;
}

export function applyCrmUpdates(record: CrmRecord, updates: CrmUpdate[], source: string): CrmRecord {
  return updates.reduce((r, u) => applyCrmUpdate(r, u, source), record);
}
