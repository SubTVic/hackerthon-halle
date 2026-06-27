// ============================================================================
// CRM-VERDICHTUNG — am Ende landet alles strukturiert im CRM
// ============================================================================
// Trotz vieler Kanäle und Threads entsteht pro Projekt EIN verdichteter
// CRM-Datensatz: zentrale Referenz, alle Threads, offene Anforderungen,
// Dubletten-Hinweis und eine kompakte Aktivitätshistorie (Transparenz).
// ============================================================================

import type { Project, Thread } from "./types";
import type { RequirementStatus } from "./requirements";
import { CATEGORY_LABEL } from "./types";

export interface CrmThreadSummary {
  threadId: string;
  category: string;
  topic: string;
  messageCount: number;
  compiledCount: number;
  channels: string[];
}

export interface CrmProjectRecord {
  ref: string;
  title: string;
  applicant: string;
  totalMessages: number;
  totalThreads: number;
  totalCompiled: number;
  openRequirements: string[];
  completeness: number;
  threads: CrmThreadSummary[];
}

export function compileCrm(
  project: Project,
  threads: Thread[],
  status: RequirementStatus,
): CrmProjectRecord {
  const totalMessages = threads.reduce((n, t) => n + t.messages.length, 0);
  const totalCompiled = threads.reduce((n, t) => n + t.compiledCount, 0);

  const threadSummaries: CrmThreadSummary[] = threads.map((t) => ({
    threadId: t.id,
    category: CATEGORY_LABEL[t.category],
    topic: t.topic,
    messageCount: t.messages.length,
    compiledCount: t.compiledCount,
    channels: [...new Set(t.messages.map((m) => m.message.channel))],
  }));

  return {
    ref: project.ref,
    title: project.title,
    applicant: project.applicant,
    totalMessages,
    totalThreads: threads.length,
    totalCompiled,
    openRequirements: status.open.map((r) => r.label),
    completeness: status.completeness,
    threads: threadSummaries,
  };
}

// ----------------------------------------------------------------------------
// TINA-Export — der verdichtete Datensatz als CSV für das CRM (CURSOR/TINA).
// Semikolon-getrennt (deutsche Locale), RFC-4180-Escaping.
// ----------------------------------------------------------------------------

function csvCell(value: string): string {
  if (/[";\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export function serializeTinaCsv(crm: CrmProjectRecord): string {
  const rows: string[][] = [
    ["Projekt-Ref", "Vorgang", "Kategorie", "Thema", "Kanäle", "Nachrichten", "Dubletten"],
    ...crm.threads.map((t) => [
      crm.ref,
      t.threadId,
      t.category,
      t.topic,
      t.channels.join("+"),
      String(t.messageCount),
      String(t.compiledCount),
    ]),
  ];
  // Offene Anforderungen als zusätzliche Zeilen (für die CRM-Aufgabenliste).
  for (const req of crm.openRequirements) {
    rows.push([crm.ref, "—", "OFFEN", req, "", "", ""]);
  }
  return rows.map((r) => r.map(csvCell).join(";")).join("\r\n");
}
