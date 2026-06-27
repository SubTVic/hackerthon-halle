import { useMemo, useState } from "react";
import {
  PROJECTS,
  inboxForProject,
  buildThreads,
  defaultProfile,
  evaluateProfile,
  compileCrm,
  serializeTinaCsv,
  type ApprovalStatus,
  type ClassifiedMessage,
  type Project,
  type RequirementProfile,
  type Thread,
} from "../../../projects";
import { RequirementsPanel } from "./RequirementsPanel";
import { InboxQueue } from "./InboxQueue";
import { MessageDetail } from "./MessageDetail";

const TYPE_ICON: Record<Project["type"], string> = {
  datacenter: "🖥️",
  household: "🏠",
  windturbine: "🌀",
};

const CHANNEL_ICON: Record<string, string> = { email: "✉️", letter: "🖨️", call: "📞" };

export function ProjectsView() {
  const [ref, setRef] = useState<string>(PROJECTS[0].ref);
  const [profiles, setProfiles] = useState<Record<string, RequirementProfile>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [analyzedIds, setAnalyzedIds] = useState<Set<string>>(new Set());
  const [approvals, setApprovals] = useState<Record<string, ApprovalStatus>>({});
  const [showPersp, setShowPersp] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  const project = PROJECTS.find((p) => p.ref === ref)!;

  const threads = useMemo<Thread[]>(
    () => buildThreads(inboxForProject(ref), ref),
    [ref],
  );

  const messages = useMemo<ClassifiedMessage[]>(
    () =>
      threads
        .flatMap((t) => t.messages)
        .sort((a, b) => a.message.receivedAt.localeCompare(b.message.receivedAt)),
    [threads],
  );

  const profile = profiles[ref] ?? defaultProfile(project.type);
  const status = evaluateProfile(profile);
  const crm = compileCrm(project, threads, status);

  const selected = messages.find((c) => c.message.id === selectedId) ?? null;
  const selectedThread = selected
    ? threads.find((t) => t.messages.some((c) => c.message.id === selected.message.id)) ?? null
    : null;

  function pickProject(r: string) {
    setRef(r);
    setSelectedId(null);
    setShowPersp(false);
    setShowAnswer(false);
  }
  function selectMsg(id: string) {
    setSelectedId(id);
    setShowPersp(false);
    setShowAnswer(false);
  }
  function analyze() {
    if (selectedId) setAnalyzedIds((prev) => new Set(prev).add(selectedId));
  }

  function updateProfile(next: RequirementProfile) {
    setProfiles((prev) => ({ ...prev, [ref]: next }));
  }

  const analyzedCount = messages.filter((m) => analyzedIds.has(m.message.id)).length;

  return (
    <div>
      {/* Project selector */}
      <div className="proj-tabs">
        {PROJECTS.map((p) => (
          <button
            key={p.ref}
            className={"proj-tab" + (p.ref === ref ? " proj-tab--active" : "")}
            onClick={() => pickProject(p.ref)}
          >
            <span className="proj-tab__icon">{TYPE_ICON[p.type]}</span>
            <span className="proj-tab__body">
              <span className="proj-tab__title">
                <span className="proj-tab__ref">#{p.ref}</span> {p.title}
              </span>
              <span className="proj-tab__meta">{p.powerLabel}</span>
            </span>
          </button>
        ))}
      </div>

      {/* Workspace: inbox queue + detail */}
      <div className="workspace">
        <InboxQueue
          messages={messages}
          selectedId={selectedId}
          analyzedIds={analyzedIds}
          onSelect={selectMsg}
        />

        <main className="detail-col">
          {!selected ? (
            <div className="detail-empty">
              <div className="detail-empty__icon">📨</div>
              <div className="detail-empty__title">Nachricht aus dem Posteingang wählen</div>
              <p className="detail-empty__text">
                Links eine eingehende Nachricht anklicken, um die Originalnachricht
                (vor der Analyse) zu sehen und sie dann zu analysieren.
              </p>
            </div>
          ) : (
            <MessageDetail
              cm={selected}
              thread={selectedThread}
              project={project}
              openReqs={status.open}
              analyzed={analyzedIds.has(selected.message.id)}
              onAnalyze={analyze}
              approval={selectedThread ? approvals[selectedThread.id] : undefined}
              onApproval={(tid, s) => setApprovals((prev) => ({ ...prev, [tid]: s }))}
              showPersp={showPersp}
              onTogglePersp={() => setShowPersp((v) => !v)}
              showAnswer={showAnswer}
              onToggleAnswer={() => setShowAnswer((v) => !v)}
            />
          )}
        </main>
      </div>

      {/* Requirements */}
      <RequirementsPanel
        profile={profile}
        status={status}
        onToggle={(id) =>
          updateProfile({
            ...profile,
            requirements: profile.requirements.map((r) =>
              r.id === id ? { ...r, active: !r.active } : r,
            ),
          })
        }
        onRuleset={(v) => updateProfile({ ...profile, rulesetVersion: v })}
      />

      {/* CRM */}
      <section className="card">
        <div className="card__title">
          <span className="card__title-icon">{"🗄️"}</span>
          CRM-Verdichtung (Projekt #{crm.ref})
          <span className="badge badge--info">{analyzedCount}/{messages.length} analysiert</span>
        </div>
        <div className="crm2">
          <div className="crm2__stats">
            <div className="crm2__stat"><b>{crm.totalMessages}</b> Nachrichten</div>
            <div className="crm2__stat"><b>{crm.totalThreads}</b> Vorgänge</div>
            <div className="crm2__stat"><b>{crm.totalCompiled}</b> zusammengefasst</div>
            <div className="crm2__stat"><b>{Math.round(crm.completeness * 100)}%</b> vollständig</div>
          </div>

          <table className="tina">
            <thead>
              <tr><th>Vorgang</th><th>Kategorie</th><th>Thema</th><th>Kanäle</th><th>Nachr.</th></tr>
            </thead>
            <tbody>
              {crm.threads.map((t) => (
                <tr key={t.threadId}>
                  <td>{t.threadId}</td>
                  <td>{t.category}</td>
                  <td>{t.topic}</td>
                  <td>{t.channels.map((c) => CHANNEL_ICON[c] ?? c).join(" ")}</td>
                  <td>{t.messageCount}{t.compiledCount > 0 ? ` (+${t.compiledCount})` : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {crm.openRequirements.length > 0 && (
            <div className="crm2__open">
              <div className="crm2__open-title">Offene Anforderungen (aktuelles Regelwerk):</div>
              <ul>
                {crm.openRequirements.map((r) => <li key={r}>{r}</li>)}
              </ul>
            </div>
          )}

          <details className="export-detail">
            <summary>TINA-Export anzeigen (CSV für CURSOR/TINA-Import)</summary>
            <pre className="export-csv">{serializeTinaCsv(crm)}</pre>
          </details>
        </div>
      </section>
    </div>
  );
}
