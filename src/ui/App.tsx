import { useState } from "react";
import { DEMO_CASES, type DemoCase } from "../examples/cases";
import { FALLBACKS } from "../ingest/fallbacks";
import { validate, type ValidationResult } from "../validate";
import { toTina, type TinaRecord } from "../adapters/tina";
import { buildResponse, type DraftMessage } from "../respond";
import { openCase, receiveMessage, type ProcessCase } from "../process";
import { lookupCase, type CaseRecord } from "../process/caseDb";
import type { CanonicalRequest } from "../canonical";

import { CasePicker } from "./components/CasePicker";
import { ParsedDataView } from "./components/ParsedDataView";
import { TinaExportView } from "./components/TinaExportView";
import { ValidationView } from "./components/ValidationView";
import { ResponseView } from "./components/ResponseView";
import { ProcessTimelineView } from "./components/ProcessTimelineView";
import { RaciView } from "./components/RaciView";

const FALLBACK_MAP: Record<DemoCase["id"], "complete" | "chaotic"> = {
  clean: "complete",
  messy: "chaotic",
};

interface CaseState {
  demo: DemoCase;
  request: CanonicalRequest;
  validation: ValidationResult;
  tina: TinaRecord;
  draft: DraftMessage;
  kase: ProcessCase;
  dbRecord: CaseRecord | null;
  nextMsgIdx: number;
}

export function App() {
  const [state, setState] = useState<CaseState | null>(null);

  function pickCase(demo: DemoCase) {
    const request = FALLBACKS[FALLBACK_MAP[demo.id]](demo.raw);
    const validation = validate(request);
    const tina = toTina(request);
    const draft = buildResponse(request, validation);
    const kase = openCase(request);
    const dbRecord = lookupCase(request.requestId);
    setState({ demo, request, validation, tina, draft, kase, dbRecord, nextMsgIdx: 0 });
  }

  function playNextMessage() {
    setState((prev) => {
      if (!prev || prev.nextMsgIdx >= prev.demo.messages.length) return prev;
      const msg = prev.demo.messages[prev.nextMsgIdx];
      const kase = receiveMessage(prev.kase, { ...msg, requestId: prev.kase.requestId });
      return { ...prev, kase, nextMsgIdx: prev.nextMsgIdx + 1 };
    });
  }

  const nextMsg = state && state.nextMsgIdx < state.demo.messages.length
    ? state.demo.messages[state.nextMsgIdx]
    : null;

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__logo">Netzanschluss-Assistent</div>
        <h1>Eingehende Anfragen verarbeiten</h1>
        <p className="app__subtitle">
          Zwei Praxisfälle: vom Erstantrag über Vollständigkeitsprüfung
          und Nachforderung bis zur Kommunikation während Installation und Bau.
        </p>
      </header>

      <CasePicker cases={DEMO_CASES} active={state?.demo.id} onPick={pickCase} />

      {state && (
        <main>
          <div className="step-arrow">&#x25BC;</div>

          <ParsedDataView
            raw={state.demo.raw}
            request={state.request}
            channel={state.demo.channel}
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

          <ProcessTimelineView
            kase={state.kase}
            dbRecord={state.dbRecord}
            nextMsg={nextMsg}
            onPlayNext={playNextMessage}
            allDone={state.nextMsgIdx >= state.demo.messages.length}
          />

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
