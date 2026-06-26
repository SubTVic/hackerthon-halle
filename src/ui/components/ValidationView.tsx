import type { ValidationResult } from "../../validate";

interface Props {
  result: ValidationResult;
}

// Schritt 4: Lückenprüfung (ECHT) — Fortschritt + Liste fehlender Pflichtfelder.
export function ValidationView({ result }: Props) {
  const pct = Math.round(result.completeness * 100);
  return (
    <section className="card">
      <h2>
        4 · Vollständigkeitsprüfung
        <span className={`badge ${result.ok ? "badge--ok" : "badge--warn"}`}>
          {result.ok ? "vollständig" : `${result.missing.length} fehlend`}
        </span>
      </h2>
      <div className="progress">
        <div className="progress__bar" style={{ width: `${pct}%` }} />
        <span className="progress__label">{pct}% Pflichtfelder erfüllt</span>
      </div>
      {result.missing.length > 0 && (
        <ul className="missing-list">
          {result.missing.map((m) => (
            <li key={m.path}>
              <span className="missing-tag">fehlt</span> {m.label}
              {m.vdeNr && <code> · VDE {m.vdeNr}</code>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
