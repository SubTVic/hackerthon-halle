import type {
  ApprovalStatus, ClassifiedMessage, Project, Requirement, Thread,
} from "../../../projects";
import { CATEGORY_LABEL } from "../../../projects";
import { ResponseDraftView } from "./ResponseDraftView";
import { ThreadPerspectives } from "./ThreadPerspectives";

interface Props {
  cm: ClassifiedMessage;
  thread: Thread | null;
  project: Project;
  openReqs: Requirement[];
  analyzed: boolean;
  onAnalyze: () => void;
  approval?: ApprovalStatus;
  onApproval: (threadId: string, s: ApprovalStatus) => void;
  showPersp: boolean;
  onTogglePersp: () => void;
  showAnswer: boolean;
  onToggleAnswer: () => void;
}

const CHANNEL: Record<string, { icon: string; label: string }> = {
  email: { icon: "✉️", label: "E-Mail" },
  letter: { icon: "🖨️", label: "Brief (gescannt)" },
  call: { icon: "📞", label: "Anruf / Telefonnotiz" },
};

const ROLE_LABEL: Record<string, string> = {
  project_manager: "Projektleitung",
  technician: "Techniker",
  investor: "Investor / Bauherr",
  authority: "Behörde",
  installer: "Elektrofachbetrieb",
};

export function MessageDetail(props: Props) {
  const { cm, thread, project, openReqs, analyzed, onAnalyze } = props;
  const m = cm.message;
  const ch = CHANNEL[m.channel] ?? { icon: "📨", label: m.channel };

  return (
    <div className="detail">
      {/* ORIGINAL MESSAGE — so wie sie eingegangen ist, VOR der Analyse */}
      <div className="orig">
        <div className="orig__bar">
          <span className="orig__tag">Originalnachricht — Eingang</span>
          <span className="orig__chan">{ch.icon} {ch.label}</span>
          {m.scanned && <span className="orig__scan">OCR-gescannt</span>}
        </div>
        <div className="orig__meta">
          <div><span className="orig__k">Von</span> {m.senderName} <span className="orig__role">({ROLE_LABEL[m.senderRole] ?? m.senderRole})</span></div>
          <div><span className="orig__k">Eingang</span> {new Date(m.receivedAt).toLocaleString("de-DE")}</div>
          <div><span className="orig__k">Referenz lt. Absender</span> {m.refHint ? `#${m.refHint}` : "— keine angegeben —"}</div>
        </div>
        <div className="orig__subject">{m.subject}</div>
        <pre className="orig__body">{m.body}</pre>
        {m.attachments.length > 0 && (
          <div className="orig__atts">
            {m.attachments.map((a) => (
              <span key={a.name} className="att">📎 {a.name}</span>
            ))}
          </div>
        )}
      </div>

      {!analyzed ? (
        <div className="analyze-cta">
          <button className="btn btn--primary btn--lg" onClick={onAnalyze}>
            Analysieren →
          </button>
          <span className="analyze-cta__hint">
            Klassifizieren, einem Projekt + Vorgang zuordnen und gegen das Regelwerk prüfen.
          </span>
        </div>
      ) : (
        <>
          {/* ANALYSE-ERGEBNIS */}
          <div className="analysis">
            <div className="analysis__title">Analyse-Ergebnis</div>
            <div className="analysis__grid">
              <Field k="Projekt" v={`#${cm.classification.projectRef} · ${project.title}`} />
              <Field k="Vorgangsnummer" v={cm.classification.threadId} mono />
              <Field k="Kategorie" v={`${cm.classification.category} — ${CATEGORY_LABEL[cm.classification.category]}`} />
              <Field k="Thema" v={cm.classification.topic} />
              <Field
                k="Zuordnung"
                v={m.refHint
                  ? `über Referenznummer (${Math.round(cm.classification.confidence * 100)}%)`
                  : `inhaltlich erkannt (${Math.round(cm.classification.confidence * 100)}%)`}
              />
              {cm.classification.duplicateOf && (
                <Field k="Dublette" v="gleiche Frage wie eine frühere Nachricht — zusammengeführt" warn />
              )}
            </div>
          </div>

          {/* THREAD-KONTEXT */}
          {thread && (
            <div className="dthread">
              <div className="dthread__title">
                Vorgang {thread.id}
                <span className="dthread__count">
                  {thread.messages.length} Nachricht(en)
                  {thread.compiledCount > 0 ? ` · ${thread.compiledCount} zusammengefasst` : ""}
                </span>
              </div>
              <ol className="dthread__msgs">
                {thread.messages.map((t) => (
                  <li
                    key={t.message.id}
                    className={
                      "dthread__msg" +
                      (t.message.id === m.id ? " dthread__msg--current" : "") +
                      (t.classification.duplicateOf ? " dthread__msg--dup" : "")
                    }
                  >
                    <span className="dthread__msg-id">{t.classification.threadId}</span>
                    <span className="dthread__msg-sender">{t.message.senderName}</span>
                    <span className="dthread__msg-date">{new Date(t.message.receivedAt).toLocaleDateString("de-DE")}</span>
                    {t.message.id === m.id && <span className="dthread__here">diese Nachricht</span>}
                  </li>
                ))}
              </ol>

              <div className="dthread__btns">
                <button className="btn btn--primary" onClick={props.onToggleAnswer}>
                  {props.showAnswer ? "Antwort schließen" : "Antwort entwerfen →"}
                </button>
                <button className="btn btn--ghost" onClick={props.onTogglePersp}>
                  {props.showPersp ? "Stakeholder-Sicht schließen" : "Stakeholder-Sicht 👁"}
                </button>
              </div>

              {props.showPersp && <ThreadPerspectives thread={thread} project={project} />}
              {props.showAnswer && (
                <ResponseDraftView
                  thread={thread}
                  openReqs={openReqs}
                  onStatusChange={props.onApproval}
                />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Field({ k, v, mono, warn }: { k: string; v: string; mono?: boolean; warn?: boolean }) {
  return (
    <div className="afield">
      <span className="afield__k">{k}</span>
      <span className={"afield__v" + (mono ? " afield__v--mono" : "") + (warn ? " afield__v--warn" : "")}>{v}</span>
    </div>
  );
}
