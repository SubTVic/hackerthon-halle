import type { ProcessCase, ProcessEvent, ExtractionResult } from "../../process";
import { openBlockers } from "../../process";
import type { CrmRecord } from "../../process";
import { MOCK_MESSAGES, type MockMessage } from "../../examples/messages";

interface Props {
  kase: ProcessCase;
  crmRecord: CrmRecord;
  extractions: Map<string, ExtractionResult>;
  onMessage: (msg: MockMessage) => void;
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

export function ProcessTimelineView({ kase, crmRecord, extractions, onMessage }: Props) {
  const blockers = openBlockers(kase);
  const complaints = kase.events.filter((e) => e.type === "complaint");
  const usedLabels = new Set(
    kase.events
      .filter((e) => e.id !== `${kase.requestId}-EVT-000`)
      .map((e) => e.body),
  );

  return (
    <section className="card">
      <div className="card__title">
        <span className="card__title-icon">{"💬"}</span>
        Kommunikation im Vorgang
        {blockers.length > 0 && (
          <span className="badge badge--bad">{blockers.length} Blocker</span>
        )}
        {complaints.length > 0 && (
          <span className="badge badge--warn">{complaints.length} Beschwerde</span>
        )}
      </div>

      {/* CRM Record Card */}
      <div className="crm-card">
        <div className="crm-card__header">
          <span className="crm-card__title">CRM-Datensatz (TINA)</span>
          <span className="crm-card__meta">{crmRecord.assignedTo} · {crmRecord.daysOpen} Tage offen</span>
        </div>

        <div className="crm-card__grid">
          <div className="crm-card__section">
            <div className="crm-card__section-title">Meilensteine</div>
            <ul className="crm-milestones">
              {crmRecord.milestones.map((ms) => (
                <li key={ms.label} className={ms.done ? "ms--done" : "ms--open"}>
                  <span className="ms__icon">{ms.done ? "✅" : "⬜"}</span>
                  <span className="ms__label">{ms.label}</span>
                  {ms.date && <span className="ms__date">{ms.date}</span>}
                </li>
              ))}
            </ul>
          </div>

          <div className="crm-card__section">
            <div className="crm-card__section-title">
              Offene Punkte
              {crmRecord.pendingItems.length > 0 && (
                <span className="badge badge--bad" style={{ marginLeft: 8 }}>{crmRecord.pendingItems.length}</span>
              )}
            </div>
            {crmRecord.pendingItems.length === 0 ? (
              <p className="crm-card__empty">Keine offenen Punkte</p>
            ) : (
              <ul className="crm-pending">
                {crmRecord.pendingItems.map((p, i) => (
                  <li key={i} className={p.overdue ? "pending--overdue" : ""}>
                    <span>{p.label}</span>
                    {p.overdue && <span className="badge badge--bad">überfällig</span>}
                    {p.since && <span className="pending__since">seit {p.since}</span>}
                  </li>
                ))}
              </ul>
            )}

            {crmRecord.flags.length > 0 && (
              <>
                <div className="crm-card__section-title" style={{ marginTop: 12 }}>Flags</div>
                <div className="crm-flags">
                  {crmRecord.flags.map((f) => (
                    <span key={f} className="badge badge--warn">{f}</span>
                  ))}
                </div>
              </>
            )}

            <div className="crm-card__section-title" style={{ marginTop: 12 }}>
              Notizen ({crmRecord.notes.length})
            </div>
            <ul className="crm-notes">
              {crmRecord.notes.slice(-4).map((n, i) => (
                <li key={i}>
                  <span className="note__date">{n.date}</span>
                  <span className="note__source">{n.source}</span>
                  <span className="note__text">{n.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <p style={{ color: "#6b7280", fontSize: 13, marginBottom: 14, marginTop: 20 }}>
        Nachricht simulieren — Informationen werden automatisch extrahiert und ins CRM übernommen:
      </p>

      <div className="msg-buttons">
        {MOCK_MESSAGES.map((m) => {
          const alreadySent = usedLabels.has(m.body);
          return (
            <button
              key={m.label}
              className={"msg-btn" + (alreadySent ? " msg-btn--used" : "")}
              onClick={() => onMessage(m)}
              disabled={alreadySent}
            >
              <span className="msg-btn__icon">{CHANNEL_ICON[m.channel] ?? "📨"}</span>
              <span className="msg-btn__text">{m.label}</span>
              {alreadySent && <span className="msg-btn__check">✓</span>}
            </button>
          );
        })}
      </div>

      <ol className="timeline">
        {kase.events.map((e) => {
          const extraction = extractions.get(e.id);
          return (
            <li key={e.id} className={`ev ${SEV_CLASS[e.severity]}`}>
              <div className="ev__head">
                <span className="ev__role">{ROLE_LABEL[e.senderRole]}</span>
                <span className="ev__chan">{CHANNEL_ICON[e.channel] ?? ""} {e.channel.toUpperCase()}</span>
                <span className="ev__chan">{TYPE_LABEL[e.type]}</span>
                {e.severity === "blocker" && <span className="ev__sev ev__sev--blocker">Blocker</span>}
                {e.severity === "warning" && e.type === "complaint" && <span className="ev__sev ev__sev--warning">Eskalation</span>}
                {e.severity === "warning" && e.type !== "complaint" && <span className="ev__sev ev__sev--warning">Hinweis</span>}
                <span className="ev__time">{new Date(e.at).toLocaleString("de-DE")}</span>
              </div>
              {e.subject && <div className="ev__subject">{e.subject}</div>}
              <div className="ev__body">{e.body}</div>

              {extraction && (
                <div className="extraction">
                  <div className="extraction__header">
                    <span className="extraction__icon">⚡</span>
                    Automatisch extrahiert → CRM-Update
                  </div>
                  <div className="extraction__content">
                    <div className="extraction__fields">
                      <div className="extraction__label">Erkannte Daten</div>
                      {extraction.fields.map((f, i) => (
                        <div key={i} className="extraction__field">
                          <span className="extraction__field-key">{f.label}</span>
                          <span className="extraction__field-val">{f.value}</span>
                        </div>
                      ))}
                    </div>
                    <div className="extraction__updates">
                      <div className="extraction__label">CRM-Aktionen</div>
                      {extraction.crmUpdates.map((u, i) => (
                        <div key={i} className="extraction__update">
                          <span className="extraction__update-icon">{actionIcon(u.action)}</span>
                          <span>{u.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function actionIcon(action: string): string {
  switch (action) {
    case "add_blocker": return "⛔";
    case "resolve_blocker": return "✅";
    case "add_pending": return "📋";
    case "resolve_pending": return "✅";
    case "complete_milestone": return "🏁";
    case "add_note": return "📝";
    case "set_flag": return "🚩";
    default: return "•";
  }
}
