// ============================================================================
// UI — Demo-Frontend (zeigt den End-to-End-Pfad für den Pitch)
// ============================================================================
// Demo-Pfad (was die Jury sieht):
//   1. Eingang wählen (3 Beispiele)
//   2. -> kanonisches JSON erscheint
//   3. -> interner Export (VDE) wird gezeigt
//   4. -> Lückenprüfung markiert fehlende Pflichtfelder rot
//   5. -> Nachforderungs-Mail wird automatisch erzeugt
//   6. RACI-Stakeholder-Ansicht als Ausblick (statisch)
//
// Läuft komplett mit Fakes (kein API-Key nötig). Die Verdrahtung ist fertig;
// die einzelnen Panels sind als Komponenten in ./components ausgelagert.
// ============================================================================

import { useState } from "react";
import { EXAMPLES, type ExampleInput } from "../examples";
import { ingest, type IngestResult } from "../ingest";
import { validate, type ValidationResult } from "../validate";
import { toVdeMapped, type VdeRow } from "../adapters/vde";
import { toTina, type TinaRecord } from "../adapters/tina";
import { buildResponse, type DraftMessage } from "../respond";

import { InputPicker } from "./components/InputPicker";
import { CanonicalView } from "./components/CanonicalView";
import { TinaExportView } from "./components/TinaExportView";
import { ValidationView } from "./components/ValidationView";
import { ResponseView } from "./components/ResponseView";
import { RaciView } from "./components/RaciView";

interface PipelineState {
  example: ExampleInput;
  ingestResult: IngestResult;
  validation: ValidationResult;
  vdeRows: VdeRow[];
  tina: TinaRecord;
  draft: DraftMessage;
}

export function App() {
  const [state, setState] = useState<PipelineState | null>(null);
  const [busy, setBusy] = useState(false);

  async function run(example: ExampleInput) {
    setBusy(true);
    // Pipeline: ingest -> validate -> adapter -> respond
    const ingestResult = await ingest(example);
    const req = ingestResult.request;
    const validation = validate(req);
    const vdeRows = toVdeMapped(req);
    const tina = toTina(req);
    const draft = buildResponse(req, validation);
    setState({ example, ingestResult, validation, vdeRows, tina, draft });
    setBusy(false);
  }

  return (
    <div className="app">
      <header className="app__header">
        <h1>Grid Connection Funnel</h1>
        <p className="app__subtitle">
          Beliebige Eingänge → kanonisches JSON → internes Zielformat (VDE).
          Lückenprüfung &amp; automatische Nachforderung.
        </p>
      </header>

      <InputPicker examples={EXAMPLES} busy={busy} onPick={run} active={state?.example.id} />

      {state && (
        <main className="pipeline">
          <CanonicalView
            raw={state.example.raw}
            request={state.ingestResult.request}
            source={state.ingestResult.source}
          />
          <TinaExportView record={state.tina} missing={state.validation.missing} />
          <ValidationView result={state.validation} />
          <ResponseView draft={state.draft} />
          <RaciView />
        </main>
      )}

      <footer className="app__footer">
        <strong>Ehrlichkeit im Pitch:</strong> Schema &amp; Vollständigkeitsprüfung
        laufen echt gegen das dokumentierte VDE-Datenset. Kanäle, LLM-Parsing und
        Versand sind für die Demo simuliert.
      </footer>
    </div>
  );
}
