import type { ProcessCase, ProcessEvent } from "../../process";
import { openBlockers } from "../../process";
import { MOCK_MESSAGES, type MockMessage } from "../../examples/messages";

interface Props {
  kase: ProcessCase;
  onMessage: (msg: MockMessage) => void;
}

const ROLE_LABEL: Record<ProcessEvent["senderRole"], string> = {
  applicant: "Antragsteller",
  installer: "Elektrofachbetrieb",
  technician: "Techniker",
  grid_operator: "Netzbetreiber",
  system: "System",
};

const SEV_CLASS: Record<ProcessEvent["severity"], string> = {
  info: "ev--info",
  warning: "ev--warn",
  blocker: "ev--blocker",
};

// Vorgangs-Timeline: nimmt Kommunikation WÄHREND des Prozesses auf.
// Buttons spielen Mock-Nachrichten ein (z.B. Techniker-Problem-SMS).
export function ProcessTimelineView({ kase, onMessage }: Props) {
  const blockers = openBlockers(kase);
  return (
    <section className="card">
      <h2>
        7 · Prozess-Kommunikation
        {blockers.length > 0 && (
          <span className="badge badge--warn">{blockers.length} offenes Problem</span>
        )}
      </h2>

      <div className="picker">
        {MOCK_MESSAGES.map((m) => (
          <button key={m.label} className="picker__btn" onClick={() => onMessage(m)}>
            <span className="picker__title">{m.label}</span>
            <span className="picker__channel">{m.channel}</span>
          </button>
        ))}
      </div>

      <ol className="timeline">
        {kase.events.map((e) => (
          <li key={e.id} className={`ev ${SEV_CLASS[e.severity]}`}>
            <div className="ev__head">
              <span className="ev__role">{ROLE_LABEL[e.senderRole]}</span>
              <span className="ev__chan">{e.channel}</span>
              <span className="ev__type">{e.type}</span>
              {e.severity === "blocker" && <span className="missing-tag">BLOCKER</span>}
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
