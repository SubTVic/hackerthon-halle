import type { CaseRecord } from "../../process/caseDb";

interface Props {
  record: CaseRecord;
}

export function CaseContextView({ record: r }: Props) {
  const overdueCount = r.pending.filter((p) => p.overdue).length;

  return (
    <div className="case-ctx">
      <div className="case-ctx__header">
        <span className="case-ctx__db-tag">Datenbank</span>
        <span className="case-ctx__title">Auftrag {r.requestId}</span>
        <span className={`badge ${overdueCount > 0 ? "badge--bad" : "badge--ok"}`}>
          {r.daysOpen} Tage offen
        </span>
      </div>

      <div className="case-ctx__grid">
        <div className="case-ctx__col">
          <div className="case-ctx__label">Antragsteller</div>
          <div className="case-ctx__val">{r.applicantName}</div>

          <div className="case-ctx__label">Standort</div>
          <div className="case-ctx__val">{r.siteAddress}</div>

          <div className="case-ctx__label">Leistung</div>
          <div className="case-ctx__val">{r.powerKw} kW</div>

          <div className="case-ctx__label">Sachbearbeiter</div>
          <div className="case-ctx__val">{r.assignedTo}</div>

          <div className="case-ctx__label">Aktueller Status</div>
          <div className="case-ctx__val case-ctx__val--bold">{r.phaseLabel}</div>
        </div>

        <div className="case-ctx__col">
          <div className="case-ctx__label">Meilensteine</div>
          <ol className="case-ctx__milestones">
            {r.milestones.map((m) => (
              <li key={m.label} className={m.done ? "ms--done" : "ms--open"}>
                <span className="ms__icon">{m.done ? "✓" : "•"}</span>
                <span>{m.label}</span>
                {m.date && <span className="ms__date">{m.date}</span>}
              </li>
            ))}
          </ol>
        </div>
      </div>

      {r.pending.length > 0 && (
        <div className="case-ctx__pending">
          <div className="case-ctx__label">Offene Punkte</div>
          {r.pending.map((p) => (
            <div key={p.label} className={`pending-item ${p.overdue ? "pending--overdue" : ""}`}>
              <span className="pending__label">{p.label}</span>
              <span className="pending__resp">{p.responsible}</span>
              <span className="pending__since">seit {p.since}</span>
              {p.overdue && <span className="badge badge--bad">überfällig</span>}
            </div>
          ))}
        </div>
      )}

      {r.notes.length > 0 && (
        <div className="case-ctx__notes">
          <div className="case-ctx__label">Vermerke</div>
          {r.notes.map((n, i) => (
            <div key={i} className="case-ctx__note">{n}</div>
          ))}
        </div>
      )}
    </div>
  );
}
