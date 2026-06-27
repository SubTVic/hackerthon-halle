import { useState } from "react";
import type { ProcessCase, ProcessEvent } from "../../process";
import { openBlockers } from "../../process";
import {
  translateForStakeholders,
  type Stakeholder,
  type TranslatedProblem,
} from "../../process/translate";
import { MOCK_MESSAGES, type MockMessage } from "../../examples/messages";

interface Props {
  kase: ProcessCase;
  onMessage: (msg: MockMessage) => void;
}

const CHANNEL_ICON: Record<string, string> = {
  email: "✉️", sms: "📱", phone: "📞", fax: "📠", letter: "✉️", portal: "🌐",
};

const ROLE_LABEL: Record<ProcessEvent["senderRole"], string> = {
  applicant: "Antragsteller", investor: "Investor / Bauherr",
  installer: "Elektrofachbetrieb", technician: "Techniker (Baustelle)",
  grid_operator: "Sachbearbeiter", system: "System",
};

const FILTER_OPTIONS: { key: Stakeholder | "all"; label: string; icon: string }[] = [
  { key: "all", label: "Alle", icon: "👁" },
  { key: "techniker", label: "Techniker", icon: "🔧" },
  { key: "sachbearbeiter", label: "Sachbearbeiter", icon: "📋" },
  { key: "investor", label: "Investor", icon: "💼" },
  { key: "strategie", label: "Strategie", icon: "📊" },
];

const RELEVANCE_STYLE: Record<string, string> = {
  high: "rel--high",
  medium: "rel--medium",
  low: "rel--low",
};

export function TransparencyView({ kase, onMessage }: Props) {
  const [filter, setFilter] = useState<Stakeholder | "all">("all");
  const blockers = openBlockers(kase);

  const processEvents = kase.events.filter((e) => e.id !== `${kase.requestId}-EVT-000`);
  const translations: TranslatedProblem[] = processEvents.map(translateForStakeholders);

  const usedBodies = new Set(processEvents.map((e) => e.body));

  return (
    <section className="card">
      <div className="card__title">
        <span className="card__title-icon">{"🔍"}</span>
        Probleme transparent machen
        {blockers.length > 0 && (
          <span className="badge badge--bad">{blockers.length} Blocker</span>
        )}
      </div>

      <p className="tp__intro">
        Jede eingehende Nachricht wird automatisch in die Sprache der jeweiligen
        Stakeholder übersetzt. Techniker brauchen andere Informationen als
        Investoren — irrelevante Details werden ausgeblendet.
      </p>

      {/* Stakeholder filter */}
      <div className="tp__filter">
        <span className="tp__filter-label">Perspektive:</span>
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            className={"tp__filter-btn" + (filter === opt.key ? " tp__filter-btn--active" : "")}
            onClick={() => setFilter(opt.key)}
          >
            <span>{opt.icon}</span> {opt.label}
          </button>
        ))}
      </div>

      {/* Message buttons */}
      <p style={{ color: "#6b7280", fontSize: 13, marginBottom: 10, marginTop: 16 }}>
        Nachricht simulieren:
      </p>
      <div className="msg-buttons">
        {MOCK_MESSAGES.map((m) => {
          const used = usedBodies.has(m.body);
          return (
            <button
              key={m.label}
              className={"msg-btn" + (used ? " msg-btn--used" : "")}
              onClick={() => onMessage(m)}
              disabled={used}
            >
              <span className="msg-btn__icon">{CHANNEL_ICON[m.channel] ?? "📨"}</span>
              <span className="msg-btn__text">{m.label}</span>
              {used && <span className="msg-btn__check">✓</span>}
            </button>
          );
        })}
      </div>

      {/* Translated events */}
      {translations.length === 0 && (
        <p className="tp__empty">
          Noch keine Nachrichten eingegangen. Klicke oben auf einen Button, um eine
          Nachricht zu simulieren.
        </p>
      )}

      <div className="tp__events">
        {translations.map((tp) => (
          <TranslatedEvent key={tp.originalEvent.id} tp={tp} filter={filter} />
        ))}
      </div>
    </section>
  );
}

function TranslatedEvent({ tp, filter }: { tp: TranslatedProblem; filter: Stakeholder | "all" }) {
  const e = tp.originalEvent;
  const perspectives = filter === "all"
    ? tp.perspectives
    : tp.perspectives.filter((p) => p.role === filter);

  return (
    <div className="tp__event">
      <div className="tp__event-source">
        <span className="tp__event-role">{ROLE_LABEL[e.senderRole]}</span>
        <span className="ev__chan">{CHANNEL_ICON[e.channel] ?? ""} {e.channel.toUpperCase()}</span>
        <span className="ev__time">{new Date(e.at).toLocaleString("de-DE")}</span>
      </div>

      <div className="tp__event-raw">
        <div className="tp__event-raw-label">Eingang</div>
        <div className="tp__event-raw-body">{e.body}</div>
      </div>

      <div className="tp__arrow">⬇ automatisch übersetzt</div>

      <div className="tp__headline">{tp.headline}</div>

      <div className="tp__perspectives">
        {perspectives.map((p) => (
          <div key={p.role} className={`tp__perspective ${RELEVANCE_STYLE[p.relevance]}`}>
            <div className="tp__perspective-header">
              <span className="tp__perspective-icon">{p.roleIcon}</span>
              <span className="tp__perspective-role">{p.roleLabel}</span>
              <span className={`tp__relevance tp__relevance--${p.relevance}`}>
                {p.relevance === "high" ? "Hohe Relevanz" : p.relevance === "medium" ? "Relevant" : "Gering"}
              </span>
            </div>
            <div className="tp__perspective-summary">{p.summary}</div>
            {p.details.length > 0 && (
              <ul className="tp__perspective-details">
                {p.details.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            )}
            {p.actionRequired && (
              <div className="tp__action">
                <span className="tp__action-icon">⚡</span>
                <span className="tp__action-label">Handlungsbedarf:</span>
                {p.actionRequired}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
