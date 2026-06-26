const RACI = [
  { step: "Eingang erfassen", r: "Netzbetreiber", a: "Netzbetreiber", c: "—", i: "Antragsteller" },
  { step: "Vollständigkeit prüfen", r: "System (automatisch)", a: "Sachbearbeiter", c: "Elektrofachbetrieb", i: "Antragsteller" },
  { step: "Fehlende Daten nachfordern", r: "System (automatisch)", a: "Sachbearbeiter", c: "—", i: "Antragsteller" },
  { step: "Technische Netzprüfung", r: "Netzplanung", a: "Netzplanung", c: "Messstellenbetreiber", i: "Antragsteller" },
  { step: "Anschlusszusage erteilen", r: "Netzbetreiber", a: "Netzbetreiber", c: "—", i: "Antragsteller" },
];

export function RaciView() {
  return (
    <section className="card card--muted">
      <div className="card__title">
        <span className="card__title-icon">{"👥"}</span>
        Verantwortlichkeiten im Prozess
        <span className="badge badge--info">Ausblick</span>
      </div>
      <table className="raci">
        <thead>
          <tr>
            <th>Prozessschritt</th>
            <th>Verantwortlich</th>
            <th>Genehmigung</th>
            <th>Beratung</th>
            <th>Information</th>
          </tr>
        </thead>
        <tbody>
          {RACI.map((row) => (
            <tr key={row.step}>
              <td>{row.step}</td>
              <td className="raci-r">{row.r}</td>
              <td className="raci-a">{row.a}</td>
              <td>{row.c}</td>
              <td>{row.i}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
