// Schritt 6: RACI-Stakeholder-Ansicht als Ausblick (STATISCHES Mockup, FAKE).
// Zeigt, wie der Funnel später Verantwortlichkeiten je Prozessschritt abbildet.
// TODO(sonnet, optional): mit echten Rollen/Schritten füllen, falls Zeit.

const RACI = [
  { step: "Eingang erfassen", r: "Netzbetreiber", a: "Netzbetreiber", c: "—", i: "Antragsteller" },
  { step: "Vollständigkeit prüfen", r: "System", a: "Sachbearbeiter", c: "Elektrofachbetrieb", i: "Antragsteller" },
  { step: "Nachforderung", r: "System", a: "Sachbearbeiter", c: "—", i: "Antragsteller" },
  { step: "Technische Prüfung", r: "Netzplanung", a: "Netzplanung", c: "Messstellenbetreiber", i: "Antragsteller" },
  { step: "Anschlusszusage", r: "Netzbetreiber", a: "Netzbetreiber", c: "—", i: "Antragsteller" },
];

export function RaciView() {
  return (
    <section className="card card--muted">
      <h2>6 · Ausblick — RACI-Stakeholder-Ansicht <span className="badge badge--fallback">Mockup</span></h2>
      <table className="vde">
        <thead>
          <tr><th>Prozessschritt</th><th>R</th><th>A</th><th>C</th><th>I</th></tr>
        </thead>
        <tbody>
          {RACI.map((row) => (
            <tr key={row.step}>
              <td>{row.step}</td><td>{row.r}</td><td>{row.a}</td><td>{row.c}</td><td>{row.i}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
