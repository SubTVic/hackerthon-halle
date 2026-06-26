import type { ExampleInput } from "../../examples";

interface Props {
  examples: ExampleInput[];
  busy: boolean;
  active?: ExampleInput["id"];
  onPick: (e: ExampleInput) => void;
}

const CHANNEL_ICON: Record<string, string> = {
  email: "✉️",
  fax: "📠",
  phone: "📞",
  letter: "✉️",
  portal: "🌐",
  sms: "📱",
};

const LABELS: Record<ExampleInput["id"], { title: string; desc: string }> = {
  complete: {
    title: "Saubere E-Mail",
    desc: "Alle Angaben vorhanden, klar strukturiert",
  },
  gappy: {
    title: "Unvollständige Anfrage",
    desc: "Wichtige Pflichtangaben fehlen",
  },
  chaotic: {
    title: "Unleserliches Fax",
    desc: "Unstrukturiert, Flurdaten statt Adresse",
  },
};

export function InputPicker({ examples, busy, active, onPick }: Props) {
  return (
    <section className="card">
      <div className="card__title">
        <span className="card__title-icon">{"📨"}</span>
        Eingehende Anfrage ausw&auml;hlen
      </div>
      <div className="picker">
        {examples.map((e) => (
          <button
            key={e.id}
            className={`picker__btn ${active === e.id ? "is-active" : ""}`}
            disabled={busy}
            onClick={() => onPick(e)}
          >
            <span className="picker__icon">{CHANNEL_ICON[e.channel] ?? "📨"}</span>
            <span className="picker__title">{LABELS[e.id].title}</span>
            <span className="picker__desc">{LABELS[e.id].desc}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
