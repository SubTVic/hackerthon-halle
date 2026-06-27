import type { ClassifiedMessage } from "../../../projects";

interface Props {
  messages: ClassifiedMessage[];
  selectedId: string | null;
  analyzedIds: Set<string>;
  onSelect: (id: string) => void;
}

const CHANNEL_ICON: Record<string, string> = {
  email: "✉️", letter: "🖨️", call: "📞",
};

export function InboxQueue({ messages, selectedId, analyzedIds, onSelect }: Props) {
  return (
    <aside className="queue">
      <div className="queue__head">
        <span className="queue__title">Posteingang</span>
        <span className="queue__count">{messages.length}</span>
      </div>
      <ul className="queue__list">
        {messages.map((cm) => {
          const m = cm.message;
          const analyzed = analyzedIds.has(m.id);
          const dup = !!cm.classification.duplicateOf;
          const sel = m.id === selectedId;
          return (
            <li key={m.id}>
              <button
                className={"queue__item" + (sel ? " queue__item--sel" : "")}
                onClick={() => onSelect(m.id)}
              >
                <span
                  className={
                    "queue__dot " +
                    (analyzed ? "queue__dot--done" : "queue__dot--pending")
                  }
                  title={analyzed ? "analysiert" : "offen"}
                />
                <span className="queue__chan">{CHANNEL_ICON[m.channel] ?? "📨"}</span>
                <span className="queue__body">
                  <span className="queue__line1">
                    <span className="queue__sender">{m.senderName}</span>
                    <span className="queue__log">{cm.classification.threadId}</span>
                  </span>
                  <span className="queue__subject">{m.subject}</span>
                  <span className="queue__foot">
                    {new Date(m.receivedAt).toLocaleDateString("de-DE")}
                    {dup && <span className="queue__dup"> · Dublette</span>}
                    {m.attachments.length > 0 && <span className="queue__att"> · {m.attachments.length} 📎</span>}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
