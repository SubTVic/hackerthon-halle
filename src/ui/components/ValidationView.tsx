import type { ValidationResult } from "../../validate";

interface Props {
  result: ValidationResult;
}

export function ValidationView({ result }: Props) {
  const pct = Math.round(result.completeness * 100);
  return (
    <section className="card">
      <div className="card__title">
        <span className="card__title-icon">{"✅"}</span>
        Vollständigkeitsprüfung
        {result.ok ? (
          <span className="badge badge--ok">Vollständig</span>
        ) : (
          <span className="badge badge--bad">{result.missing.length} Angaben fehlen</span>
        )}
      </div>

      <div className="progress">
        <div className="progress__bar" style={{ width: `${pct}%` }} />
        <span className="progress__label">{pct} % der Pflichtangaben vorhanden</span>
      </div>

      {result.missing.length > 0 && (
        <ul className="checklist">
          {result.missing.map((m) => (
            <li key={m.path} className="is-missing">
              <span className="check-icon">&#x2717;</span>
              <span>{m.label}</span>
            </li>
          ))}
        </ul>
      )}

      {result.ok && (
        <ul className="checklist">
          <li className="is-ok">
            <span className="check-icon">&#x2713;</span>
            <span>Alle Pflichtangaben für PV-Anlagen bis 30 kW sind vorhanden.</span>
          </li>
        </ul>
      )}
    </section>
  );
}
