import { useState } from "react";
import { EXAMPLES, type ExampleInput } from "../examples";
import { ingest, type IngestResult } from "../ingest";
import { validate, type ValidationResult } from "../validate";
import { toVdeMapped, type VdeRow } from "../adapters/vde";
import { toTina, type TinaRecord } from "../adapters/tina";
import { buildResponse, type DraftMessage } from "../respond";
import { openCase, receiveMessage, type ProcessCase } from "../process";
import type { MockMessage } from "../examples/messages";

import { InputPicker } from "./components/InputPicker";
import { ParsedDataView } from "./components/ParsedDataView";
import { TinaExportView } from "./components/TinaExportView";
import { ValidationView } from "./components/ValidationView";
import { ResponseView } from "./components/ResponseView";
import { ProcessTimelineView } from "./components/ProcessTimelineView";
import { RaciView } from "./components/RaciView";

interface PipelineState {
  example: ExampleInput;
  ingestResult: IngestResult;
  validation: ValidationResult;
  vdeRows: VdeRow[];
  tina: TinaRecord;
  draft: DraftMessage;
  kase: ProcessCase;
}

export function App() {
  const [state, setState] = useState<PipelineState | null>(null);
  const [busy, setBusy] = useState(false);

  async function run(example: ExampleInput) {
    setBusy(true);
    const ingestResult = await ingest(example);
    const req = ingestResult.request;
    const validation = validate(req);
    const vdeRows = toVdeMapped(req);
    const tina = toTina(req);
    const draft = buildResponse(req, validation);
    const kase = openCase(req);
    setState({ example, ingestResult, validation, vdeRows, tina, draft, kase });
    setBusy(false);
  }

  function onMessage(msg: MockMessage) {
    setState((prev) =>
      prev
        ? { ...prev, kase: receiveMessage(prev.kase, { ...msg, requestId: prev.kase.requestId }) }
        : prev,
    );
  }

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__logo">Netzanschluss-Assistent</div>
        <h1>Eingehende Anfragen verarbeiten</h1>
        <p className="app__subtitle">
          Anfragen aus allen Kanälen erfassen, auf Vollständigkeit prüfen,
          fehlende Angaben nachfordern — und die gesamte Kommunikation
          über den Lebenszyklus des Vorgangs nachvollziehbar dokumentieren.
        </p>
      </header>

      <InputPicker examples={EXAMPLES} busy={busy} onPick={run} active={state?.example.id} />

      {state && (
        <main>
          <div className="step-arrow">&#x25BC;</div>

          <ParsedDataView
            raw={state.example.raw}
            request={state.ingestResult.request}
            channel={state.example.channel}
          />

          <div className="step-arrow">&#x25BC;</div>

          <ValidationView result={state.validation} />

          {!state.validation.ok && (
            <>
              <div className="step-arrow">&#x25BC;</div>
              <ResponseView draft={state.draft} />
            </>
          )}

          <div className="step-arrow">&#x25BC;</div>

          <ProcessTimelineView kase={state.kase} onMessage={onMessage} />

          <div className="step-arrow">&#x25BC;</div>

          <TinaExportView record={state.tina} missing={state.validation.missing} />

          <div className="step-arrow">&#x25BC;</div>

          <RaciView />
        </main>
      )}

      <footer className="app__footer">
        Netzanschluss-Assistent &middot; Prototyp &middot; PV-Anlagen bis 30 kW
      </footer>
    </div>
  );
}
