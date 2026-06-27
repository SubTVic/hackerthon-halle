// ============================================================================
// NetzFunnelPanel — Drop-in für das netz-halle Frontend (React 19 + Tailwind 4)
// ============================================================================
// Rendert den kompletten Vorgangs-Funnel (Posteingang -> Threads -> Anforderungen
// -> Antwort+Freigabe -> CRM/TINA) auf Basis der portablen Engine in src/projects/.
//
// Installation (siehe integration/README.md):
//   1) Ordner  src/projects/  aus hackerthon-halle nach  netz-halle/src/projects/
//   2) Diese Datei nach  netz-halle/src/components/NetzFunnelPanel.tsx
//   3) In App.tsx:  <NetzFunnelPanel />
//
// Abhängigkeiten: react, lucide-react, tailwindcss (alle bereits in netz-halle).
// Die Engine selbst ist dependency-frei (reines TypeScript).
// ============================================================================

import { useMemo, useState, type ReactNode } from "react";
import {
  Mail, Printer, Phone, Inbox, FolderOpen, MessageSquare,
  CheckCircle2, Send, Scale, Database, Eye, Paperclip,
} from "lucide-react";
import {
  PROJECTS, inboxForProject, buildThreads, defaultProfile, evaluateProfile,
  compileCrm, serializeTinaCsv, buildDraft, perspectivesForThread, STAKEHOLDERS,
  CATEGORY_LABEL, RULESET_VERSIONS,
  type ApprovalStatus, type CategoryCode, type Project, type Requirement,
  type RequirementProfile, type Stakeholder, type Thread,
} from "../projects";

const TYPE_ICON: Record<Project["type"], string> = {
  datacenter: "🖥️", household: "🏠", windturbine: "🌀",
};
const CHANNEL_ICON: Record<string, ReactNode> = {
  email: <Mail className="w-4 h-4" />,
  letter: <Printer className="w-4 h-4" />,
  call: <Phone className="w-4 h-4" />,
};
const CAT_COLOR: Record<CategoryCode, string> = {
  T: "bg-blue-600", A: "bg-green-600", N: "bg-gray-500",
  D: "bg-violet-600", B: "bg-red-600", S: "bg-amber-600",
};

function Badge({ children, tone = "info" }: { children: ReactNode; tone?: "info" | "warn" | "bad" | "ok" }) {
  const map = {
    info: "bg-blue-50 text-blue-700",
    warn: "bg-amber-50 text-amber-700",
    bad: "bg-red-50 text-red-700",
    ok: "bg-green-50 text-green-700",
  };
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${map[tone]}`}>{children}</span>;
}

function Card({ title, icon, badge, children }: { title: string; icon: ReactNode; badge?: ReactNode; children: ReactNode }) {
  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6 mb-5 shadow-sm">
      <div className="flex items-center gap-2.5 mb-4 text-xs font-bold uppercase tracking-wider text-slate-500">
        {icon}<span>{title}</span>{badge}
      </div>
      {children}
    </section>
  );
}

export default function NetzFunnelPanel() {
  const [ref, setRef] = useState(PROJECTS[0].ref);
  const [profiles, setProfiles] = useState<Record<string, RequirementProfile>>({});
  const [openThread, setOpenThread] = useState<string | null>(null);
  const [perspThread, setPerspThread] = useState<string | null>(null);
  const [approvals, setApprovals] = useState<Record<string, ApprovalStatus>>({});

  const project = PROJECTS.find((p) => p.ref === ref)!;
  const threads = useMemo<Thread[]>(() => buildThreads(inboxForProject(ref), ref), [ref]);
  const profile = profiles[ref] ?? defaultProfile(project.type);
  const status = evaluateProfile(profile);
  const crm = compileCrm(project, threads, status);

  const setProfile = (next: RequirementProfile) => setProfiles((p) => ({ ...p, [ref]: next }));
  const toggleReq = (id: string) => setProfile({
    ...profile,
    requirements: profile.requirements.map((r) => r.id === id ? { ...r, active: !r.active } : r),
  });

  const allMsgs = threads.flatMap((t) => t.messages)
    .sort((a, b) => a.message.receivedAt.localeCompare(b.message.receivedAt));

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 text-slate-800">
      <header className="text-center mb-8">
        <div className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-1">Netzanschluss-Assistent</div>
        <h1 className="text-3xl font-bold mb-2">Eingehende Kommunikation → CRM</h1>
        <p className="text-slate-500 max-w-2xl mx-auto">
          Nachrichten aus allen Kanälen werden klassifiziert, je Projekt zu Threads gebündelt,
          gegen das aktuelle Regelwerk geprüft, in der Sprache des Empfängers beantwortet
          (nach Freigabe) — und verdichtet im CRM/TINA abgelegt.
        </p>
      </header>

      {/* Project picker */}
      <Card title="Projekt auswählen — zentrale Referenznummer" icon={<FolderOpen className="w-4 h-4" />}>
        <div className="grid md:grid-cols-3 gap-3">
          {PROJECTS.map((p) => (
            <button key={p.ref} onClick={() => { setRef(p.ref); setOpenThread(null); setPerspThread(null); }}
              className={`text-left rounded-xl border-2 p-4 transition ${p.ref === ref ? "border-blue-600 bg-blue-50" : "border-slate-200 hover:border-blue-400 hover:bg-blue-50/50"}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{TYPE_ICON[p.type]}</span>
                <span className="font-mono font-bold text-sm text-blue-600 bg-blue-50 px-2 py-0.5 rounded">#{p.ref}</span>
              </div>
              <div className="font-bold text-sm">{p.title}</div>
              <div className="text-xs mt-1">{p.powerLabel}</div>
              <div className="text-xs text-slate-500 mt-0.5">{p.phaseLabel}</div>
            </button>
          ))}
        </div>
      </Card>

      {/* Inbox */}
      <Card title="Posteingang — automatisch klassifiziert" icon={<Inbox className="w-4 h-4" />}
        badge={<Badge>{crm.totalMessages} Nachrichten</Badge>}>
        <p className="text-sm text-slate-500 mb-4">
          Alle Kanäle laufen zusammen. E-Mail ist Hauptkanal; ein Brief wird gescannt und danach
          wie eine E-Mail behandelt. Jede Nachricht erhält automatisch Projekt + Vorgangsnummer.
        </p>
        <ul className="divide-y divide-slate-100">
          {allMsgs.map((cm) => {
            const m = cm.message;
            const dup = !!cm.classification.duplicateOf;
            return (
              <li key={m.id} className={`flex gap-3 py-3 ${dup ? "opacity-70" : ""}`}>
                <div className="text-slate-400 mt-0.5">{CHANNEL_ICON[m.channel]}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm">{m.senderName}</span>
                    <span className={`text-white text-xs font-bold w-5 h-5 inline-flex items-center justify-center rounded ${CAT_COLOR[cm.classification.category]}`}>
                      {cm.classification.category}
                    </span>
                    <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                      {cm.classification.threadId}
                    </span>
                    {dup && <Badge tone="warn">Dublette → zusammengefasst</Badge>}
                  </div>
                  <div className="text-sm">{m.subject}</div>
                  <div className="text-xs text-slate-500">
                    {CATEGORY_LABEL[cm.classification.category]} · Thema: {cm.classification.topic}
                    {m.scanned && <span className="text-violet-600 font-semibold"> · OCR-gescannt</span>}
                    {cm.classification.confidence < 0.9 &&
                      <span className="text-amber-600 font-semibold"> · inhaltlich zugeordnet ({Math.round(cm.classification.confidence * 100)}%)</span>}
                  </div>
                  {m.attachments.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap mt-1.5">
                      {m.attachments.map((a) => (
                        <span key={a.name} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded inline-flex items-center gap-1">
                          <Paperclip className="w-3 h-3" />{a.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </Card>

      {/* Threads */}
      <Card title="Vorgänge / Threads" icon={<MessageSquare className="w-4 h-4" />}
        badge={<><Badge>{threads.length} Threads</Badge>{crm.totalCompiled > 0 && <Badge tone="warn">{crm.totalCompiled} zusammengefasst</Badge>}</>}>
        <p className="text-sm text-slate-500 mb-4">
          Alle Nachrichten eines Themas landen in einem Thread. Fragt dieselbe Person mehrfach zum
          selben Thema, wird das zusammengeführt — nicht als neuer Vorgang.
        </p>
        <div className="space-y-3">
          {threads.map((t) => (
            <ThreadRow key={t.id} thread={t} project={project} openReqs={status.open}
              answerOpen={openThread === t.id} perspOpen={perspThread === t.id}
              approval={approvals[t.id]}
              onToggleAnswer={() => setOpenThread(openThread === t.id ? null : t.id)}
              onTogglePersp={() => setPerspThread(perspThread === t.id ? null : t.id)}
              onApproval={(s) => setApprovals((p) => ({ ...p, [t.id]: s }))} />
          ))}
        </div>
      </Card>

      {/* Requirements */}
      <Card title="Anforderungsprofil — was ist jetzt wichtig?" icon={<Scale className="w-4 h-4" />}
        badge={<Badge>änderbar</Badge>}>
        <p className="text-sm text-slate-500 mb-3">
          Datenanforderungen ändern sich mit der Gesetzeslage. Hier aktiv/inaktiv schaltbar — ohne Code-Änderung.
        </p>
        <div className="flex items-center gap-2.5 mb-3">
          <span className="text-sm font-semibold">Regelwerk-Stand:</span>
          <select value={profile.rulesetVersion}
            onChange={(e) => setProfile({ ...profile, rulesetVersion: e.target.value })}
            className="text-sm border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white">
            {[profile.rulesetVersion, ...RULESET_VERSIONS.filter((v) => v !== profile.rulesetVersion)]
              .map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div className="relative h-7 bg-slate-100 rounded-full overflow-hidden mb-4">
          <div className="h-full bg-gradient-to-r from-blue-600 to-green-500 transition-all"
            style={{ width: `${Math.round(status.completeness * 100)}%` }} />
          <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">
            {Math.round(status.completeness * 100)}% der aktiven Anforderungen erfüllt
          </div>
        </div>
        <ul className="divide-y divide-slate-100">
          {profile.requirements.map((r) => (
            <li key={r.id} className={`flex items-start gap-3 py-2.5 ${r.active ? "" : "opacity-50"}`}>
              <button onClick={() => toggleReq(r.id)}
                className={`mt-0.5 w-9 h-5 rounded-full relative transition shrink-0 ${r.active ? "bg-blue-600" : "bg-slate-300"}`}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${r.active ? "left-[18px]" : "left-0.5"}`} />
              </button>
              <div className="flex-1">
                <div className="text-sm font-medium flex items-center gap-2">
                  {r.label}
                  {r.active && (r.fulfilled ? <Badge tone="ok">liegt vor</Badge> : <Badge tone="bad">offen</Badge>)}
                </div>
                <div className="text-xs text-slate-500">{r.legalBasis}</div>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      {/* CRM */}
      <Card title={`CRM-Verdichtung (Projekt #${crm.ref})`} icon={<Database className="w-4 h-4" />}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-4">
          {[["Nachrichten", crm.totalMessages], ["Vorgänge", crm.totalThreads],
            ["zusammengefasst", crm.totalCompiled], ["vollständig", `${Math.round(crm.completeness * 100)}%`]]
            .map(([label, val]) => (
            <div key={label} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold">{val}</div>
              <div className="text-xs text-slate-500">{label}</div>
            </div>
          ))}
        </div>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs uppercase text-slate-500 border-b-2 border-slate-200">
            <th className="py-2">Vorgang</th><th>Kategorie</th><th>Thema</th><th>Nachr.</th>
          </tr></thead>
          <tbody>
            {crm.threads.map((t) => (
              <tr key={t.threadId} className="border-b border-slate-100">
                <td className="py-2 font-mono">{t.threadId}</td>
                <td>{t.category}</td><td>{t.topic}</td>
                <td>{t.messageCount}{t.compiledCount > 0 ? ` (+${t.compiledCount})` : ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {crm.openRequirements.length > 0 && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3">
            <div className="font-bold text-sm text-red-700 mb-1.5">Offene Anforderungen (aktuelles Regelwerk):</div>
            <ul className="list-disc pl-5 text-sm">{crm.openRequirements.map((r) => <li key={r}>{r}</li>)}</ul>
          </div>
        )}
        <details className="mt-3">
          <summary className="cursor-pointer text-blue-600 text-sm font-medium">TINA-Export anzeigen (CSV für CURSOR/TINA-Import)</summary>
          <pre className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs overflow-auto max-h-52">{serializeTinaCsv(crm)}</pre>
        </details>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------

function ThreadRow({ thread, project, openReqs, answerOpen, perspOpen, approval, onToggleAnswer, onTogglePersp, onApproval }: {
  thread: Thread; project: Project; openReqs: Requirement[];
  answerOpen: boolean; perspOpen: boolean; approval?: ApprovalStatus;
  onToggleAnswer: () => void; onTogglePersp: () => void; onApproval: (s: ApprovalStatus) => void;
}) {
  return (
    <div className="border border-slate-200 rounded-xl p-4">
      <div className="flex items-center gap-2 flex-wrap mb-2.5">
        <span className={`text-white text-xs font-bold w-5 h-5 inline-flex items-center justify-center rounded ${CAT_COLOR[thread.category]}`}>{thread.category}</span>
        <span className="font-mono font-bold text-sm">{thread.id}</span>
        <span className="font-semibold text-sm">{thread.topic}</span>
        <span className="text-xs text-slate-500 ml-auto">
          {thread.messages.length} Nachricht(en){thread.compiledCount > 0 ? ` · ${thread.compiledCount} Dublette(n)` : ""}
        </span>
        {approval && <Badge tone={approval === "sent" ? "ok" : "info"}>{approval === "sent" ? "beantwortet" : approval === "approved" ? "freigegeben" : "Entwurf"}</Badge>}
      </div>
      <ol className="space-y-1 mb-2.5">
        {thread.messages.map((cm) => (
          <li key={cm.message.id} className={`flex items-center gap-2.5 text-sm px-2.5 py-1 rounded ${cm.classification.duplicateOf ? "bg-amber-50" : ""}`}>
            <span className="font-mono text-xs text-blue-600 font-bold">{cm.classification.threadId}</span>
            <span className="flex-1">{cm.message.senderName}</span>
            <span className="text-xs text-slate-500">{new Date(cm.message.receivedAt).toLocaleDateString("de-DE")}</span>
            {cm.classification.duplicateOf && <span className="text-xs text-amber-600 font-semibold">gleiche Frage erneut</span>}
          </li>
        ))}
      </ol>
      <div className="flex gap-2 flex-wrap">
        <button onClick={onToggleAnswer} className="text-sm font-semibold text-blue-600 border border-slate-200 rounded-lg px-4 py-2 hover:bg-blue-50">
          {answerOpen ? "Antwort schließen" : "Antwort entwerfen →"}
        </button>
        <button onClick={onTogglePersp} className="text-sm font-semibold text-blue-600 border border-slate-200 rounded-lg px-4 py-2 hover:bg-blue-50 inline-flex items-center gap-1.5">
          <Eye className="w-4 h-4" />{perspOpen ? "Stakeholder-Sicht schließen" : "Stakeholder-Sicht"}
        </button>
      </div>
      {perspOpen && <Perspectives thread={thread} project={project} />}
      {answerOpen && <DraftBox thread={thread} openReqs={openReqs} onApproval={onApproval} />}
    </div>
  );
}

function Perspectives({ thread, project }: { thread: Thread; project: Project }) {
  const [filter, setFilter] = useState<Stakeholder | "all">("all");
  const all = perspectivesForThread(thread, project);
  const shown = filter === "all" ? all : all.filter((p) => p.role === filter);
  const rel = { high: "bg-amber-50 text-amber-700", medium: "bg-blue-50 text-blue-700", low: "bg-slate-100 text-slate-500" };
  return (
    <div className="mt-3 border border-slate-200 rounded-xl bg-slate-50/50 p-3">
      <div className="flex items-center gap-1.5 flex-wrap mb-3">
        <span className="text-xs font-bold uppercase text-slate-500">Sicht:</span>
        <Chip on={filter === "all"} onClick={() => setFilter("all")}>👁 Alle</Chip>
        {STAKEHOLDERS.map((s) => <Chip key={s.role} on={filter === s.role} onClick={() => setFilter(s.role)}>{s.icon} {s.label}</Chip>)}
      </div>
      <div className="grid md:grid-cols-2 gap-2.5">
        {shown.map((p) => (
          <div key={p.role} className={`border rounded-lg p-3 bg-white ${p.relevance === "high" ? "border-amber-200 bg-amber-50/40" : "border-slate-200"}`}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <span>{p.icon}</span><span className="font-bold text-sm">{p.label}</span>
              <span className={`ml-auto text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${rel[p.relevance]}`}>
                {p.relevance === "high" ? "hohe Relevanz" : p.relevance === "medium" ? "relevant" : "gering"}
              </span>
            </div>
            <div className="text-sm">{p.summary}</div>
            {p.action && (
              <div className="mt-2 px-2.5 py-1.5 bg-orange-50 border border-orange-200 rounded-lg text-xs">
                <span className="font-bold text-amber-700">⚡ Handlungsbedarf: </span>{p.action}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button onClick={onClick}
      className={`text-xs px-3 py-1.5 rounded-full border transition ${on ? "bg-blue-600 text-white border-blue-600" : "bg-white border-slate-200 hover:border-blue-400"}`}>
      {children}
    </button>
  );
}

function DraftBox({ thread, openReqs, onApproval }: { thread: Thread; openReqs: Requirement[]; onApproval: (s: ApprovalStatus) => void }) {
  const initial = useMemo(() => buildDraft(thread, openReqs), [thread.id]);
  const [body, setBody] = useState(initial.body);
  const [s, setS] = useState<ApprovalStatus>("draft");
  const set = (next: ApprovalStatus) => { setS(next); onApproval(next); };
  const statusTone = s === "sent" ? "bg-green-50 text-green-700" : s === "approved" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700";
  return (
    <div className="mt-3 border border-blue-200 rounded-xl bg-blue-50/40 p-3.5">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
        <div>
          <span className="font-bold text-sm mr-3">An: {initial.to}</span>
          <span className="text-xs text-slate-500 italic">Tonfall: {initial.tone}</span>
        </div>
        <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${statusTone}`}>
          {s === "draft" ? "Entwurf — Freigabe nötig" : s === "approved" ? "Freigegeben" : "Versendet ✓"}
        </span>
      </div>
      <div className="font-mono text-xs font-semibold mb-2">{initial.subject}</div>
      <textarea value={body} onChange={(e) => setBody(e.target.value)} disabled={s === "sent"} rows={12}
        className="w-full border border-slate-200 rounded-lg p-3 text-sm leading-relaxed bg-white disabled:bg-slate-50 disabled:text-slate-500 resize-y" />
      <div className="flex items-center gap-2.5 mt-2.5 flex-wrap">
        {s === "draft" && <>
          <button onClick={() => set("approved")} className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-blue-600 rounded-lg px-4 py-2 hover:bg-blue-700">
            <CheckCircle2 className="w-4 h-4" />Freigeben
          </button>
          <span className="text-xs text-slate-500">Kein Versand ohne menschliche Freigabe.</span>
        </>}
        {s === "approved" && <>
          <button onClick={() => set("sent")} className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-green-600 rounded-lg px-4 py-2 hover:bg-green-700">
            <Send className="w-4 h-4" />Senden
          </button>
          <button onClick={() => set("draft")} className="text-sm font-semibold text-blue-600 border border-slate-200 rounded-lg px-4 py-2 hover:bg-blue-50">Zurück zu Entwurf</button>
        </>}
        {s === "sent" && <span className="text-sm text-green-600 font-semibold">Antwort versendet · im Thread dokumentiert</span>}
      </div>
    </div>
  );
}
