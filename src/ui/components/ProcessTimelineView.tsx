import type { ProcessCase, ProcessEvent } from "../../process";
import { openBlockers } from "../../process";
import type { CaseRecord } from "../../process/caseDb";
import type { MockMessage } from "../../examples/messages";
import { CaseContextView } from "./CaseContextView";

interface Props {
  kase: ProcessCase;
  dbRecord: CaseRecord | null;
  nextMsg: MockMessage | null;
  onPlayNext: () => void;
  allDone: boolean;
}

const ROLE_LABEL: Record<ProcessEvent["senderRole"], string> = {
  applicant: "Antragsteller",
  investor: "Investor / Bauherr",
  installer: "Elektrofachbetrieb",
  technician: "Techniker (Baustelle)",
  grid_operator: "Sachbearbeiter",
  system: "System",
};

const CHANNEL_ICON: Record<string, string> = {
  email: "✉️",
  sms: "📱",
  phone: "📞",
  fax: "📠",
  letter: "✉️",
  portal: "🌐",
};

const TYPE_LABEL: Record<ProcessEvent["type"], string> = {
  status_update: "Status",
  problem_report: "Problem",
  question: "Rückfrage",
  complaint: "Beschwerde",
  info_request: "Nachforderung",
  document_submitted: "Dokument",
  appointment: "Termin",
};

const SEV_CLASS: Record<ProcessEvent["severity"], string> = {
  info: "ev--info",
  warning: "ev--warn",
  blocker: "ev--blocker",
};

export function ProcessTimelineView({ kase, dbRecord, nextMsg, onPlayNext, allDone }: Props) {
  const blockers = openBlockers(kase);
  const complaints = kase.events.filter((e) => e.type === "complaint");

  return (
    <section className="card">
      <div className="card__title">
        <span className="card__title-icon">{"💬"}</span>
        Kommunikation im Vorgang
        {blockers.length > 0 && (
          <span className="badge badge--bad">{blockers.length} offenes Problem</span>
        )}
        {complaints.length > 0 && (
          <span className="badge badge--warn">{complaints.length} Beschwerde</span>
        )}
      </div>

      {dbRecord && <CaseContextView record={dbRecord} />}

      <div className="next-msg-area">
        {nextMsg ? (
          <button className="next-msg-btn" onClick={onPlayNext}>
            <span className="next-msg-btn__icon">{CHANNEL_ICON[nextMsg.channel] ?? "📨"}</span>
            <div className="next-msg-btn__content">
              <span className="next-msg-btn__label">Nächste Nachricht einspielen:</span>
              <span className="next-msg-btn__title">{nextMsg.label}</span>
            </div>
            <span className="next-msg-btn__arrow">→</span>
          </button>
        ) : allDone ? (
          <div className="next-msg-done">Alle Nachrichten für diesen Fall eingespielt.</div>
        ) : null}
      </div>

      <ol className="timeline">
        {kase.events.map((e) => (
          <li key={e.id} className={`ev ${SEV_CLASS[e.severity]}`}>
            <div className="ev__head">
              <span className="ev__role">{ROLE_LABEL[e.senderRole]}</span>
              <span className="ev__chan">{CHANNEL_ICON[e.channel] ?? ""} {e.channel.toUpperCase()}</span>
              <span className="ev__chan">{TYPE_LABEL[e.type]}</span>
              {e.severity === "blocker" && <span className="ev__sev ev__sev--blocker">Problem</span>}
              {e.severity === "warning" && e.type === "complaint" && <span className="ev__sev ev__sev--warning">Eskalation</span>}
              {e.severity === "warning" && e.type !== "complaint" && <span className="ev__sev ev__sev--warning">Hinweis</span>}
              <span className="ev__time">{new Date(e.at).toLocaleString("de-DE")}</span>
            </div>
            {e.subject && <div className="ev__subject">{e.subject}</div>}
            <div className="ev__body">{e.body}</div>
          </li>
        ))}
      </ol>
    </section>
  );
}
