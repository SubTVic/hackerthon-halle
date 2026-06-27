// ============================================================================
// KLASSIFIKATION + THREADING + DUBLETTEN-ZUSAMMENFASSUNG (fake-first)
// ============================================================================
// 1. Jede Nachricht wird einem Projekt zugeordnet (Referenznummer oder Inhalt).
// 2. Sie bekommt einen Kategorie-Code (T/A/N/D/B/S).
// 3. Ein Thread bündelt alle Nachrichten einer Kategorie je Projekt:
//      Thread-ID = {ref}.{category}, Nachrichten = {ref}.{category}.{NN}.
// 4. Mehrfach-Nachfragen derselben Person zum selben Thema werden erkannt und
//    zusammengefasst (compiledCount), statt als getrennte Vorgänge zu landen.
// ============================================================================

import type {
  CategoryCode,
  ClassifiedMessage,
  IncomingMessage,
  Thread,
} from "./types";
import { messageMentionsRef, projectByRef } from "./data";

interface CategoryRule {
  code: CategoryCode;
  hints: string[];
}

// Reihenfolge = Priorität (erste Übereinstimmung gewinnt).
// Technik vor Dokument: eine Fachfrage, die nebenbei "Anlagenzertifikat" nennt,
// ist eine technische Anfrage (T), keine Dokument-Einreichung (D).
const CATEGORY_RULES: CategoryRule[] = [
  { code: "B", hints: ["beschwer", "rechtliche schritte", "entgehen", "behalten uns", "verzögert sich", "unakzeptabel"] },
  { code: "A", hints: ["anmeldung", "wir melden", "anmelde", "antrag", "anmelden"] },
  { code: "T", hints: ["kurzschlussleistung", "oberschwingung", "blindleistung", "frt", "q(u)", "§14a", "14a", "steuerbar", "kennlinie", "netzverträglich", "schallschutz", "trafostation", "parametrier", "fault-ride"] },
  { code: "D", hints: ["reichen", "konformität", "einheitenzertifikat", "unterlagen", "nachweis", "zertifikat"] },
  { code: "S", hints: ["zeitplan", "neuigkeiten", "aktueller stand", "wann kann", "wann ", "stand geben", "termin"] },
];

export function classifyCategory(m: IncomingMessage): CategoryCode {
  const hay = (m.subject + " " + m.body).toLowerCase();
  for (const rule of CATEGORY_RULES) {
    if (rule.hints.some((h) => hay.includes(h))) return rule.code;
  }
  return "N"; // Fallback: Nachforderung/Sonstiges
}

interface TopicRule {
  key: string;
  label: string;
  hints: string[];
}

// Themen dienen der Dubletten-Erkennung (gleicher Absender + gleiches Thema).
// Spezifische Themen zuerst, damit z.B. "Kurzschlussleistung" nicht über das
// generische "leistung" beim Zeitplan-Thema landet.
const TOPIC_RULES: TopicRule[] = [
  { key: "wallbox-14a", label: "§14a-Steuerbarkeit Wallbox", hints: ["§14a", "14a", "wallbox", "steuerbar"] },
  { key: "kurzschluss", label: "Kurzschlussleistung / Netzrückwirkungen", hints: ["kurzschlussleistung", "oberschwingung", "netzrückwirk"] },
  { key: "blindleistung", label: "Blindleistung / FRT-Nachweis", hints: ["blindleistung", "frt", "q(u)", "kennlinie", "fault-ride"] },
  { key: "trafostation", label: "Standort Trafostation / Schallschutz", hints: ["trafostation", "schallschutz", "standort"] },
  { key: "ibn-unterlagen", label: "Inbetriebnahme-Unterlagen", hints: ["inbetriebnahme", "anlagenzertifikat", "konformität", "einheitenzertifikat"] },
  { key: "anmeldung", label: "Anmeldung Anlage", hints: ["anmeldung", "wir melden", "datenblatt"] },
  { key: "verzoegerung", label: "Verzögerung Inbetriebnahme", hints: ["verzögert", "beschwer", "rechtliche"] },
  { key: "zeitplan", label: "Zeitplan / Leistungsbestätigung", hints: ["zeitplan", "neuigkeiten", "aktueller stand", "anschlussleistung", "leistungsbestätigung", "wann"] },
  { key: "einspeisung", label: "Start der Einspeisung", hints: ["einspeisen", "ans netz"] },
];

export function classifyTopic(m: IncomingMessage): { key: string; label: string } {
  const hay = (m.subject + " " + m.body).toLowerCase();
  for (const rule of TOPIC_RULES) {
    if (rule.hints.some((h) => hay.includes(h))) return { key: rule.key, label: rule.label };
  }
  return { key: "sonstiges", label: "Sonstiges" };
}

/** Ordnet eine Nachricht einem Projekt zu (Referenz oder Inhalt). */
export function resolveProjectRef(m: IncomingMessage, candidateRefs: string[]): string | null {
  if (m.refHint && projectByRef(m.refHint)) return m.refHint;
  for (const ref of candidateRefs) {
    if (messageMentionsRef(m, ref)) return ref;
  }
  return null;
}

/**
 * Baut aus rohen Nachrichten die Threads eines Projekts auf.
 * Thread = (Projekt, Kategorie). Innerhalb: laufende Nummerierung + Dubletten.
 */
export function buildThreads(messages: IncomingMessage[], projectRef: string): Thread[] {
  // chronologisch
  const sorted = [...messages].sort((a, b) => a.receivedAt.localeCompare(b.receivedAt));

  const byCategory = new Map<CategoryCode, ClassifiedMessage[]>();

  for (const m of sorted) {
    const category = classifyCategory(m);
    const topic = classifyTopic(m);
    const bucket = byCategory.get(category) ?? [];
    const seq = bucket.length + 1;
    const threadId = `${projectRef}.${category}`;

    // Dublette? gleicher Absender + gleiches Thema bereits im Thread.
    const dup = bucket.find(
      (c) =>
        c.message.senderName === m.senderName &&
        c.classification.topic === topic.label,
    );

    const classified: ClassifiedMessage = {
      message: m,
      classification: {
        projectRef,
        category,
        threadId: `${threadId}.${String(seq).padStart(2, "0")}`,
        topic: topic.label,
        confidence: m.refHint ? 0.96 : 0.78,
        duplicateOf: dup ? dup.message.id : null,
      },
    };
    bucket.push(classified);
    byCategory.set(category, bucket);
  }

  const threads: Thread[] = [];
  for (const [category, msgs] of byCategory) {
    // Wie viele Nachrichten sind Dubletten (zusammengefasst)?
    const duplicates = msgs.filter((m) => m.classification.duplicateOf).length;
    threads.push({
      id: `${projectRef}.${category}`,
      projectRef,
      category,
      topic: msgs[0]?.classification.topic ?? "",
      messages: msgs,
      compiledCount: duplicates,
    });
  }
  // Threads nach erster Nachricht sortieren.
  threads.sort((a, b) =>
    (a.messages[0]?.message.receivedAt ?? "").localeCompare(b.messages[0]?.message.receivedAt ?? ""),
  );
  return threads;
}
