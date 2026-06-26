import { serializeTina, type TinaRecord } from "../../adapters/tina";
import type { ValidationIssue } from "../../validate";

interface Props {
  record: TinaRecord;
  missing: ValidationIssue[];
}

export function TinaExportView({ record, missing }: Props) {
  const missingVde = new Set(missing.map((m) => m.vdeNr).filter(Boolean));
  const mapped = record.fields.filter((f) => !f.key.startsWith("VDE_"));

  return (
    <section className="card">
      <div className="card__title">
        <span className="card__title-icon">{"🔄"}</span>
        TINA-Export (VDE-Datenset)
      </div>

      <table className="tina">
        <thead>
          <tr>
            <th>VDE-Nr.</th>
            <th>Bezeichnung</th>
            <th>Wert</th>
          </tr>
        </thead>
        <tbody>
          {mapped.map((f) => {
            const isMissing = f.value === null && missingVde.has(f.sourceVdeNr);
            return (
              <tr key={f.key} className={isMissing ? "row--missing" : "row--filled"}>
                <td>{f.sourceVdeNr}</td>
                <td>{f.label}</td>
                <td>{f.value ?? <span className="missing-val">fehlt</span>}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <details className="export-detail">
        <summary>CSV-Exportdatei anzeigen</summary>
        <pre className="export-csv">{serializeTina(record)}</pre>
      </details>
    </section>
  );
}
