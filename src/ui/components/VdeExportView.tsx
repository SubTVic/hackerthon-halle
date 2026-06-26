import type { VdeRow } from "../../adapters/vde";
import type { ValidationIssue } from "../../validate";

interface Props {
  rows: VdeRow[];
  missing: ValidationIssue[];
}

// Schritt 3+4: interner VDE-Export, fehlende Pflichtfelder rot markiert.
export function VdeExportView({ rows, missing }: Props) {
  const missingVde = new Set(missing.map((m) => m.vdeNr).filter(Boolean));
  return (
    <section className="card">
      <h2>3 · Interner Export — VDE-Datenset</h2>
      <table className="vde">
        <thead>
          <tr>
            <th>Nr.</th>
            <th>Feld</th>
            <th>Wert</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const isMissing = r.value === null && missingVde.has(r.nr);
            return (
              <tr key={r.nr} className={isMissing ? "row--missing" : ""}>
                <td>{r.nr}</td>
                <td>{r.label}</td>
                <td>{r.value ?? <span className="missing-tag">fehlt</span>}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
