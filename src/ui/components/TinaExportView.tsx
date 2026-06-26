import { serializeTina, type TinaRecord } from "../../adapters/tina";
import type { ValidationIssue } from "../../validate";

interface Props {
  record: TinaRecord;
  missing: ValidationIssue[];
}

// Interner Export ins TINA-Zielformat. Fehlende Pflichtfelder rot markiert.
export function TinaExportView({ record, missing }: Props) {
  const missingVde = new Set(missing.map((m) => m.vdeNr).filter(Boolean));
  const mapped = record.fields.filter((f) => !f.key.startsWith("VDE_"));
  return (
    <section className="card">
      <h2>
        3 · Interner Export — TINA
        <span className="badge badge--fallback">Format vorläufig</span>
      </h2>
      <table className="vde">
        <thead>
          <tr><th>TINA-Key</th><th>Feld</th><th>Wert</th><th>VDE-Nr.</th></tr>
        </thead>
        <tbody>
          {mapped.map((f) => {
            const isMissing = f.value === null && missingVde.has(f.sourceVdeNr);
            return (
              <tr key={f.key} className={isMissing ? "row--missing" : ""}>
                <td><code>{f.key}</code></td>
                <td>{f.label}</td>
                <td>{f.value ?? <span className="missing-tag">fehlt</span>}</td>
                <td>{f.sourceVdeNr}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <details className="raw-details">
        <summary>TINA-CSV (Import-Datei, Format vorläufig)</summary>
        <pre className="json">{serializeTina(record)}</pre>
      </details>
    </section>
  );
}
