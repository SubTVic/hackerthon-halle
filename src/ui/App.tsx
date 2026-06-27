import { useState } from "react";
import { EXAMPLES, type ExampleInput } from "../examples";
import { ingest, type IngestResult } from "../ingest";
import { validate, type ValidationResult } from "../validate";
import { toVdeMapped, type VdeRow } from "../adapters/vde";
import { toTina, type TinaRecord } from "../adapters/tina";
import { buildResponse, type DraftMessage } from "../respond";
import {
  openCase, receiveMessage, extractFromEvent, applyCrmUpdates, initialCrmRecord,
  type ProcessCase, type ExtractionResult, type CrmRecord,
} from "../process";
import type { MockMessage } from "../examples/messages";

import { InputPicker } from "./components/InputPicker";
import { ParsedDataView } from "./components/ParsedDataView";
import { TinaExportView } from "./components/TinaExportView";
import { ValidationView } from "./components/ValidationView";
import { ResponseView } from "./components/ResponseView";
import { ProcessTimelineView } from "./components/ProcessTimelineView";
import { RaciView } from "./components/RaciView";
import { TransparencyView } from "./components/TransparencyView";
import { ProjectsView } from "./components/projects/ProjectsView";

type Tab = "triage" | "solution1" | "solution2";

interface PipelineState {
  example: ExampleInput;
  ingestResult: IngestResult;
  validation: ValidationResult;
  vdeRows: VdeRow[];
  tina: TinaRecord;
  draft: DraftMessage;
  kase: ProcessCase;
  crmRecord: CrmRecord;
  extractions: Map<string, ExtractionResult>;
}

export function App() {
  const [state, setState] = useState<PipelineState | null>(null);
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<Tab>("triage");

  async function run(example: ExampleInput) {
    setBusy(true);
    const ingestResult = await ingest(example);
    const req = ingestResult.request;
    const validation = validate(req);
    const vdeRows = toVdeMapped(req);
    const tina = toTina(req);
    const draft = buildResponse(req, validation);
    const kase = openCase(req);
    const applicant = req.parties.find((p) => p.role === "operator")?.name ?? "Unbekannt";
    const site = [req.installation.siteAddress.street, req.installation.siteAddress.no, req.installation.siteAddress.zip, req.installation.siteAddress.city]
      .filter(Boolean).join(" ") || "Keine Adresse";
    const crmRecord = initialCrmRecord(applicant, site, req.installation.powerKw ?? 0);
    setState({ example, ingestResult, validation, vdeRows, tina, draft, kase, crmRecord, extractions: new Map() });
    setBusy(false);
  }

  function onMessage(msg: MockMessage) {
    setState((prev) => {
      if (!prev) return prev;
      const newKase = receiveMessage(prev.kase, { ...msg, requestId: prev.kase.requestId });
      const newEvent = newKase.events.find((e) => !prev.kase.events.some((pe) => pe.id === e.id));
      if (!newEvent) return { ...prev, kase: newKase };

      const extraction = extractFromEvent(newEvent);
      const newExtractions = new Map(prev.extractions);
      newExtractions.set(newEvent.id, extraction);

      const roleLabel = newEvent.senderRole === "technician" ? "Techniker"
        : newEvent.senderRole === "installer" ? "Elektrofachbetrieb"
        : newEvent.senderRole === "investor" ? "Investor"
        : newEvent.senderRole === "applicant" ? "Antragsteller"
        : "System";
      const newCrm = applyCrmUpdates(prev.crmRecord, extraction.crmUpdates, roleLabel);

      return { ...prev, kase: newKase, crmRecord: newCrm, extractions: newExtractions };
    });
  }

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__logo">Netzanschluss-Assistent</div>
        <h1>Eingehende Kommunikation in Vorgänge verwandeln</h1>
        <p className="app__subtitle">
          Nachrichten aus allen Kanälen (E-Mail, Brief, Anruf) werden
          klassifiziert, je Projekt zu Threads gebündelt, gegen das aktuelle
          Regelwerk geprüft und — nach menschlicher Freigabe — in der Sprache
          des Empfängers beantwortet.
        </p>
      </header>

      <div className="tabs">
        <button className={"tab" + (tab === "triage" ? " tab--active" : "")} onClick={() => setTab("triage")}>
          <span className="tab__label">Vorgangs-Triage</span>
          <span className="tab__desc">Posteingang → Threads → CRM</span>
        </button>
        <button className={"tab" + (tab === "solution1" ? " tab--active" : "")} onClick={() => setTab("solution1")}>
          <span className="tab__label">Konzept: CRM-Pipeline</span>
          <span className="tab__desc">Einzelanfrage end-to-end</span>
        </button>
        <button className={"tab" + (tab === "solution2" ? " tab--active" : "")} onClick={() => setTab("solution2")}>
          <span className="tab__label">Konzept: Transparenz</span>
          <span className="tab__desc">Stakeholder-Übersetzung</span>
        </button>
      </div>

      {tab === "triage" && (
        <main>
          <ProjectsView />
        </main>
      )}

      {(tab === "solution1" || tab === "solution2") && (
        <main>
          <InputPicker examples={EXAMPLES} busy={busy} onPick={run} active={state?.example.id} />

          {!state && (
            <p className="proj__hint" style={{ textAlign: "center", marginTop: 16 }}>
              Bitte oben ein Beispiel auswählen, um den Ablauf zu starten.
            </p>
          )}

          {state && tab === "solution1" && (
            <>
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

              <ProcessTimelineView
                kase={state.kase}
                crmRecord={state.crmRecord}
                extractions={state.extractions}
                onMessage={onMessage}
              />

              <div className="step-arrow">&#x25BC;</div>

              <TinaExportView record={state.tina} missing={state.validation.missing} />

              <div className="step-arrow">&#x25BC;</div>

              <RaciView />
            </>
          )}

          {state && tab === "solution2" && (
            <>
              <div className="step-arrow">&#x25BC;</div>
              <TransparencyView kase={state.kase} onMessage={onMessage} />
            </>
          )}
        </main>
      )}

      <footer className="app__footer">
        Netzanschluss-Assistent &middot; Prototyp &middot; Hackathon-Demo
      </footer>
    </div>
  );
}
