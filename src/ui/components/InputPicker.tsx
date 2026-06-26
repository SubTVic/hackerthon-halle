import type { ExampleInput } from "../../examples";

interface Props {
  examples: ExampleInput[];
  busy: boolean;
  active?: ExampleInput["id"];
  onPick: (e: ExampleInput) => void;
}

// Schritt 1: Eingang wählen. FAKE-Kanäle = 3 Buttons mit Beispiel-Eingängen.
export function InputPicker({ examples, busy, active, onPick }: Props) {
  return (
    <section className="card">
      <h2>1 · Eingang wählen</h2>
      <div className="picker">
        {examples.map((e) => (
          <button
            key={e.id}
            className={`picker__btn ${active === e.id ? "is-active" : ""}`}
            disabled={busy}
            onClick={() => onPick(e)}
          >
            <span className="picker__title">{e.title}</span>
            <span className="picker__channel">{e.channel}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
