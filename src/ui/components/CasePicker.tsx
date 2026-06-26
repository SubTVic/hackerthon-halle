import type { DemoCase } from "../../examples/cases";

interface Props {
  cases: DemoCase[];
  active?: DemoCase["id"];
  onPick: (c: DemoCase) => void;
}

const CASE_ICON: Record<DemoCase["id"], string> = {
  clean: "✅",
  messy: "⚠️",
};

export function CasePicker({ cases, active, onPick }: Props) {
  return (
    <section className="card">
      <div className="card__title">
        <span className="card__title-icon">{"📂"}</span>
        Vorgang auswählen
      </div>
      <div className="picker" style={{ gridTemplateColumns: "1fr 1fr" }}>
        {cases.map((c) => (
          <button
            key={c.id}
            className={`picker__btn ${active === c.id ? "is-active" : ""}`}
            onClick={() => onPick(c)}
          >
            <span className="picker__icon">{CASE_ICON[c.id]}</span>
            <span className="picker__title">{c.title}</span>
            <span className="picker__desc">{c.subtitle}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
