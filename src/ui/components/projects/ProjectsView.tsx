import { useMemo, useState } from "react";
import {
  PROJECTS,
  inboxForProject,
  buildThreads,
  defaultProfile,
  evaluateProfile,
  compileCrm,
  CATEGORY_LABEL,
  type ApprovalStatus,
  type CategoryCode,
  type Project,
  type RequirementProfile,
  type Thread,
} from "../../../projects";
import { RequirementsPanel } from "./RequirementsPanel";
import { ResponseDraftView } from "./ResponseDraftView";

const TYPE_ICON: Record<Project["type"], string> = {
  datacenter: "🖥️",
  household: "🏠",
  windturbine: "🌀",
};

const CHANNEL: Record<string, { icon: string; label: string }> = {
  email: { icon: "✉️", label: "E-Mail" },
  letter: { icon: "🖨️", label: "Brief (gescannt)" },
  call: { icon: "📞", label: "Anruf" },
};

const CAT_CLASS: Record<CategoryCode, string> = {
  T: "cat--t", A: "cat--a", N: "cat--n", D: "cat--d", B: "cat--b", S: "cat--s",
};

export function ProjectsView() {
  const [ref, setRef] = useState<string>(PROJECTS[0].ref);
  const [profiles, setProfiles] = useState<Record<string, RequirementProfile>>({});
  const [openThreadId, setOpenThreadId] = useState<string | null>(null);
  const [approvals, setApprovals] = useState<Record<string, ApprovalStatus>>({});

  const project = PROJECTS.find((p) => p.ref === ref)!;

  const threads = useMemo<Thread[]>(() => {
    const msgs = inboxForProject(ref);
    return buildThreads(msgs, ref);
  }, [ref]);

  const profile = profiles[ref] ?? defaultProfile(project.type);
  const status = evaluateProfile(profile);
  const crm = compileCrm(project, threads, status);

  function updateProfile(next: RequirementProfile) {
    setProfiles((prev) => ({ ...prev, [ref]: next }));
  }
  function toggleReq(id: string) {
    updateProfile({
      ...profile,
      requirements: profile.requirements.map((r) =>
        r.id === id ? { ...r, active: !r.active } : r,
      ),
    });
  }
  function setRuleset(version: string) {
    updateProfile({ ...profile, rulesetVersion: version });
  }

  const openThread = threads.find((t) => t.id === openThreadId) ?? null;

  return (
    <div>
      {/* Project picker */}
      <section className="card">
        <div className="card__title">
          <span className="card__title-icon">{"📁"}</span>
          Projekt auswählen — zentrale Referenznummer
        </div>
        <div className="proj-picker">
          {PROJECTS.map((p) => (
            <button
              key={p.ref}
              className={"proj-card" + (p.ref === ref ? " is-active" : "")}
              onClick={() => { setRef(p.ref); setOpenThreadId(null); }}
            >
              <div className="proj-card__top">
                <span className="proj-card__icon">{TYPE_ICON[p.type]}</span>
                <span className="proj-card__ref">#{p.ref}</span>
              </div>
              <div className="proj-card__title">{p.title}</div>
              <div className="proj-card__meta">{p.powerLabel}</div>
              <div className="proj-card__meta proj-card__meta--dim">{p.phaseLabel}</div>
            </button>
          ))}
        </div>
      </section>

      <div className="step-arrow">&#x25BC;</div>

      {/* Inbox */}
      <section className="card">
        <div className="card__title">
          <span className="card__title-icon">{"📨"}</span>
          Posteingang — automatisch klassifiziert
          <span className="badge badge--info">{crm.totalMessages} Nachrichten</span>
        </div>
        <p className="proj__hint">
          Alle Kanäle laufen hier zusammen. E-Mail ist der Hauptkanal; ein Brief
          wird gescannt und danach wie eine E-Mail behandelt. Jede Nachricht
          erhält automatisch Projekt + Vorgangsnummer.
        </p>

        <ul className="inbox">
          {threads.flatMap((t) => t.messages).sort((a, b) =>
            a.message.receivedAt.localeCompare(b.message.receivedAt),
          ).map((cm) => {
            const m = cm.message;
            const ch = CHANNEL[m.channel];
            const isDup = !!cm.classification.duplicateOf;
            return (
              <li key={m.id} className={"inbox__row" + (isDup ? " inbox__row--dup" : "")}>
                <div className="inbox__chan" title={ch.label}>{ch.icon}</div>
                <div className="inbox__main">
                  <div className="inbox__line1">
                    <span className="inbox__sender">{m.senderName}</span>
                    <span className={"cat " + CAT_CLASS[cm.classification.category]}>
                      {cm.classification.category}
                    </span>
                    <span className="inbox__thread">{cm.classification.threadId}</span>
                    {isDup && <span className="badge badge--warn">Dublette → zusammengefasst</span>}
                  </div>
                  <div className="inbox__subject">{m.subject}</div>
                  <div className="inbox__topic">
                    {CATEGORY_LABEL[cm.classification.category]} · Thema: {cm.classification.topic}
                    {m.scanned && <span className="inbox__scan"> · OCR-gescannt</span>}
                    {cm.classification.confidence < 0.9 && (
                      <span className="inbox__lowconf"> · inhaltlich zugeordnet ({Math.round(cm.classification.confidence * 100)}%)</span>
                    )}
                  </div>
                  {m.attachments.length > 0 && (
                    <div className="inbox__atts">
                      {m.attachments.map((a) => (
                        <span key={a.name} className="att">📎 {a.name}</span>
                      ))}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="step-arrow">&#x25BC;</div>

      {/* Threads */}
      <section className="card">
        <div className="card__title">
          <span className="card__title-icon">{"🧵"}</span>
          Vorgänge / Threads
          <span className="badge badge--info">{threads.length} Threads</span>
          {crm.totalCompiled > 0 && (
            <span className="badge badge--warn">{crm.totalCompiled} Mehrfach-Nachfragen zusammengefasst</span>
          )}
        </div>
        <p className="proj__hint">
          Alle Nachrichten eines Themas landen in einem Thread. Fragt dieselbe
          Person mehrfach zum selben Thema, wird das zusammengeführt — nicht als
          neuer Vorgang.
        </p>

        <div className="threads">
          {threads.map((t) => {
            const approval = approvals[t.id];
            return (
              <div key={t.id} className="thread">
                <div className="thread__head">
                  <span className={"cat " + CAT_CLASS[t.category]}>{t.category}</span>
                  <span className="thread__id">{t.id}</span>
                  <span className="thread__topic">{t.topic}</span>
                  <span className="thread__count">
                    {t.messages.length} Nachricht{t.messages.length !== 1 ? "en" : ""}
                    {t.compiledCount > 0 && ` · ${t.compiledCount} Dublette(n)`}
                  </span>
                  {approval && (
                    <span className={"badge " + (approval === "sent" ? "badge--ok" : "badge--info")}>
                      {approval === "sent" ? "beantwortet" : approval === "approved" ? "freigegeben" : "Entwurf"}
                    </span>
                  )}
                </div>

                <ol className="thread__msgs">
                  {t.messages.map((cm) => (
                    <li key={cm.message.id} className={cm.classification.duplicateOf ? "thread__msg thread__msg--dup" : "thread__msg"}>
                      <span className="thread__msg-id">{cm.classification.threadId}</span>
                      <span className="thread__msg-sender">{cm.message.senderName}</span>
                      <span className="thread__msg-date">
                        {new Date(cm.message.receivedAt).toLocaleDateString("de-DE")}
                      </span>
                      {cm.classification.duplicateOf && (
                        <span className="thread__msg-dupnote">gleiche Frage erneut</span>
                      )}
                    </li>
                  ))}
                </ol>

                <button
                  className="btn btn--ghost thread__answer"
                  onClick={() => setOpenThreadId(openThreadId === t.id ? null : t.id)}
                >
                  {openThreadId === t.id ? "Antwort schließen" : "Antwort entwerfen →"}
                </button>

                {openThread?.id === t.id && (
                  <ResponseDraftView
                    thread={t}
                    openReqs={status.open}
                    onStatusChange={(tid, s) => setApprovals((prev) => ({ ...prev, [tid]: s }))}
                  />
                )}
              </div>
            );
          })}
        </div>
      </section>

      <div className="step-arrow">&#x25BC;</div>

      {/* Requirements */}
      <RequirementsPanel
        profile={profile}
        status={status}
        onToggle={toggleReq}
        onRuleset={setRuleset}
      />

      <div className="step-arrow">&#x25BC;</div>

      {/* CRM */}
      <section className="card">
        <div className="card__title">
          <span className="card__title-icon">{"🗄️"}</span>
          CRM-Verdichtung (Projekt #{crm.ref})
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
                  <td>{t.channels.map((c) => CHANNEL[c]?.icon ?? c).join(" ")}</td>
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
        </div>
      </section>
    </div>
  );
}
