import type { RequirementProfile, RequirementStatus } from "../../../projects";
import { RULESET_VERSIONS } from "../../../projects";

interface Props {
  profile: RequirementProfile;
  status: RequirementStatus;
  onToggle: (id: string) => void;
  onRuleset: (version: string) => void;
}

export function RequirementsPanel({ profile, status, onToggle, onRuleset }: Props) {
  const pct = Math.round(status.completeness * 100);

  return (
    <section className="card">
      <div className="card__title">
        <span className="card__title-icon">{"⚖️"}</span>
        Anforderungsprofil — was ist jetzt wichtig?
        <span className="badge badge--info">änderbar</span>
      </div>

      <p className="req__hint">
        Datenanforderungen ändern sich mit der Gesetzeslage. Anforderungen lassen
        sich hier aktiv/inaktiv schalten — ohne Code-Änderung. Maßgebliches
        Regelwerk:
      </p>

      <div className="req__ruleset">
        <span className="req__ruleset-label">Regelwerk-Stand:</span>
        <select
          className="req__select"
          value={profile.rulesetVersion}
          onChange={(e) => onRuleset(e.target.value)}
        >
          <option value={profile.rulesetVersion}>{profile.rulesetVersion}</option>
          {RULESET_VERSIONS.filter((v) => v !== profile.rulesetVersion).map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
      </div>

      <div className="progress" style={{ marginTop: 14 }}>
        <div className="progress__bar" style={{ width: `${pct}%` }} />
        <div className="progress__label">{pct}% der aktiven Anforderungen erfüllt</div>
      </div>

      <ul className="req__list">
        {profile.requirements.map((r) => (
          <li key={r.id} className={"req__item" + (r.active ? "" : " req__item--off")}>
            <label className="req__toggle">
              <input
                type="checkbox"
                checked={r.active}
                onChange={() => onToggle(r.id)}
              />
              <span className="req__toggle-track" />
            </label>
            <div className="req__info">
              <div className="req__label">
                {r.label}
                {r.active && (
                  <span className={"req__status " + (r.fulfilled ? "req__status--ok" : "req__status--open")}>
                    {r.fulfilled ? "liegt vor" : "offen"}
                  </span>
                )}
              </div>
              <div className="req__legal">{r.legalBasis}</div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
