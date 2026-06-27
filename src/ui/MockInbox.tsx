import { useState } from "react";

const SENDERS = [
  "mueller.s@stadtwerke-halle.de",
  "k.schmidt@elektro-schmidt.de",
  "info@planungsbuero-weber.de",
  "technik@netzgesellschaft-halle.de",
  "j.braun@solartechnik-braun.de",
  "vertrieb@pvanlage-ost.de",
  "buchhaltung@stadtwerke-halle.de",
  "l.hoffmann@bauamt-halle.de",
  "m.becker@energieberatung-becker.de",
  "support@tina-software.de",
  "noreply@evu-portal.de",
  "p.wagner@installateur-wagner.de",
  "a.fischer@stadtwerke-halle.de",
  "genehmigung@netzbetreiber-ost.de",
  "kontakt@dachdeckerei-lang.de",
];

const SUBJECTS_CHAOTIC = [
  { subject: "AW: AW: AW: AW: Netzanschlussanfrage Müller - DRINGEND!!!", from: 0, cc: 8, unread: true, flag: "urgent", age: "vor 2 Min." },
  { subject: "Fwd: Unterlagen PV-Anlage Schulstraße 14 - bitte prüfen", from: 2, cc: 6, unread: true, age: "vor 5 Min." },
  { subject: "AW: AW: Einspeisezusage noch offen???", from: 4, cc: 4, unread: true, flag: "urgent", age: "vor 12 Min." },
  { subject: "Re: Re: Re: Zählerplatz - Fotos anbei", from: 11, cc: 3, unread: true, age: "vor 18 Min." },
  { subject: "EILT: Netzverträglichkeitsprüfung Projekt Rosenweg", from: 3, cc: 7, unread: true, flag: "urgent", age: "vor 23 Min." },
  { subject: "AW: AW: AW: Rückfrage Lageplan - welches Format???", from: 7, cc: 5, unread: false, age: "vor 31 Min." },
  { subject: "Fwd: Fwd: Angebot Hausanschluss - zur Kenntnisnahme", from: 12, cc: 9, unread: false, age: "vor 45 Min." },
  { subject: "AW: Re: Netzanschluss Gartenweg 7 - Terminabstimmung", from: 8, cc: 6, unread: false, age: "vor 52 Min." },
  { subject: "Re: AW: AW: Wer ist zuständig für Projekt 2024-0847?", from: 1, cc: 11, unread: true, flag: "urgent", age: "vor 1 Std." },
  { subject: "AW: AW: AW: AW: AW: Netzanschluss Industriegebiet", from: 13, cc: 8, unread: false, age: "vor 1 Std." },
  { subject: "Fwd: Beschwerde Kunde Meier - sofort weiterleiten!!!", from: 6, cc: 7, unread: true, flag: "urgent", age: "vor 1 Std." },
  { subject: "AW: Nachreichung Unterlagen - BITTE BESTÄTIGEN", from: 5, cc: 4, unread: true, age: "vor 2 Std." },
  { subject: "Re: Re: Wann kommt die Einspeisezusage endlich?", from: 4, cc: 3, unread: false, age: "vor 2 Std." },
  { subject: "AW: AW: Abstimmung Tiefbau Kreuzung Leipziger Str.", from: 14, cc: 6, unread: false, age: "vor 2 Std." },
  { subject: "Fwd: AW: VDE-Konformität Wechselrichter - Frage", from: 3, cc: 5, unread: true, age: "vor 3 Std." },
  { subject: "AW: AW: AW: AW: NAV-Prüfung fehlt noch!!!", from: 7, cc: 9, unread: true, flag: "urgent", age: "vor 3 Std." },
  { subject: "Re: Anschlusskosten - wer zahlt was?", from: 8, cc: 4, unread: false, age: "vor 3 Std." },
  { subject: "AW: AW: Inbetriebnahmeprotokoll fehlt", from: 11, cc: 6, unread: true, age: "vor 4 Std." },
  { subject: "Fwd: Fwd: Fwd: Genehmigung Denkmalschutz???", from: 7, cc: 10, unread: false, age: "vor 4 Std." },
  { subject: "AW: Re: AW: Messkonzept bitte nochmal schicken", from: 1, cc: 5, unread: false, age: "vor 5 Std." },
  { subject: "DRINGEND: Kunde droht mit Anwalt - Projekt Bergstr.", from: 5, cc: 12, unread: true, flag: "urgent", age: "vor 5 Std." },
  { subject: "AW: AW: Abnahme verschoben - neuer Termin?", from: 12, cc: 4, unread: false, age: "vor 6 Std." },
  { subject: "Re: Re: Re: Re: Trafostationsplanung Phase 2", from: 3, cc: 8, unread: false, age: "vor 6 Std." },
  { subject: "AW: AW: AW: Wer hat die aktuelle Version vom Lageplan?", from: 2, cc: 7, unread: true, age: "vor 7 Std." },
  { subject: "Fwd: Newsletter EVU-Verband Juni 2024", from: 10, cc: 0, unread: false, age: "vor 7 Std." },
  { subject: "AW: AW: Zählerantrag Formular veraltet?", from: 6, cc: 3, unread: false, age: "vor 8 Std." },
  { subject: "Re: AW: Netzbetreiberwechsel - was bedeutet das für uns", from: 13, cc: 9, unread: false, age: "vor 9 Std." },
  { subject: "AW: AW: AW: AW: Baustromanschluss Projekt Ost", from: 14, cc: 6, unread: true, age: "vor 9 Std." },
  { subject: "Fwd: Rechnung Tiefbau - falsche Kostenstelle??", from: 6, cc: 5, unread: false, age: "gestern" },
  { subject: "AW: AW: AW: Netzanschluss Schulze - Eskalation!", from: 0, cc: 11, unread: false, flag: "urgent", age: "gestern" },
];

interface SortedProject {
  name: string;
  icon: string;
  status: "green" | "yellow" | "red";
  statusLabel: string;
  threads: { subject: string; participants: string[]; lastUpdate: string; tag: string; tagColor: string }[];
}

const SORTED_PROJECTS: SortedProject[] = [
  {
    name: "PV-Anlage Schulstraße 14 — Fam. Müller",
    icon: "☀️",
    status: "red",
    statusLabel: "Einspeisezusage ausstehend · 3 offene Punkte",
    threads: [
      { subject: "Netzanschlussanfrage", participants: ["S. Müller", "Planungsbüro Weber"], lastUpdate: "vor 2 Min.", tag: "Anfrage", tagColor: "blue" },
      { subject: "Einspeisezusage", participants: ["Solartechnik Braun"], lastUpdate: "vor 12 Min.", tag: "Blockiert", tagColor: "red" },
      { subject: "Zählerplatz Fotos & Prüfung", participants: ["Installateur Wagner"], lastUpdate: "vor 18 Min.", tag: "Rückfrage", tagColor: "yellow" },
      { subject: "VDE-Konformität Wechselrichter", participants: ["Netzgesellschaft"], lastUpdate: "vor 3 Std.", tag: "Klärung", tagColor: "yellow" },
    ],
  },
  {
    name: "Netzanschluss Rosenweg 5 — Gewerbe",
    icon: "🏭",
    status: "yellow",
    statusLabel: "Netzverträglichkeitsprüfung läuft",
    threads: [
      { subject: "Netzverträglichkeitsprüfung", participants: ["Netzgesellschaft"], lastUpdate: "vor 23 Min.", tag: "In Prüfung", tagColor: "blue" },
      { subject: "Lageplan & Unterlagen", participants: ["Bauamt Halle"], lastUpdate: "vor 31 Min.", tag: "Nachreichung", tagColor: "yellow" },
      { subject: "Angebot Hausanschluss", participants: ["A. Fischer"], lastUpdate: "vor 45 Min.", tag: "Info", tagColor: "gray" },
    ],
  },
  {
    name: "PV-Anlage Gartenweg 7 — Hr. Klein",
    icon: "🏠",
    status: "green",
    statusLabel: "Alle Unterlagen vollständig",
    threads: [
      { subject: "Terminabstimmung Anschluss", participants: ["Energieberatung Becker"], lastUpdate: "vor 52 Min.", tag: "Termin", tagColor: "green" },
      { subject: "Messkonzept", participants: ["Elektro Schmidt"], lastUpdate: "vor 5 Std.", tag: "Erledigt", tagColor: "green" },
    ],
  },
  {
    name: "Industriegebiet Ost — Trafostation Phase 2",
    icon: "⚡",
    status: "yellow",
    statusLabel: "Abstimmung Tiefbau offen",
    threads: [
      { subject: "Trafostationsplanung", participants: ["Netzgesellschaft", "Netzbetreiber Ost"], lastUpdate: "vor 6 Std.", tag: "Planung", tagColor: "blue" },
      { subject: "Tiefbau Kreuzung Leipziger Str.", participants: ["Dachdeckerei Lang"], lastUpdate: "vor 2 Std.", tag: "Koordination", tagColor: "yellow" },
      { subject: "Baustromanschluss", participants: ["Dachdeckerei Lang"], lastUpdate: "vor 9 Std.", tag: "Offen", tagColor: "yellow" },
    ],
  },
  {
    name: "Netzanschluss Bergstraße — Hr. Meier",
    icon: "⚠️",
    status: "red",
    statusLabel: "Eskalation — Kunde unzufrieden",
    threads: [
      { subject: "Kundenbeschwerde", participants: ["PV-Anlage Ost"], lastUpdate: "vor 5 Std.", tag: "Eskalation", tagColor: "red" },
      { subject: "NAV-Prüfung", participants: ["Bauamt Halle"], lastUpdate: "vor 3 Std.", tag: "Fehlend", tagColor: "red" },
      { subject: "Inbetriebnahmeprotokoll", participants: ["Installateur Wagner"], lastUpdate: "vor 4 Std.", tag: "Nachreichung", tagColor: "yellow" },
    ],
  },
];

function ChaoticInbox() {
  return (
    <div className="inbox">
      <div className="inbox__toolbar">
        <div className="inbox__toolbar-left">
          <input type="checkbox" style={{ marginRight: 8 }} />
          <span className="inbox__count">
            <strong>1.247</strong> ungelesene Nachrichten
          </span>
        </div>
        <div className="inbox__toolbar-right">
          <span className="inbox__sort">Sortiert nach: <strong>Datum</strong></span>
        </div>
      </div>
      <div className="inbox__list">
        {SUBJECTS_CHAOTIC.map((mail, i) => (
          <div key={i} className={`inbox__row ${mail.unread ? "inbox__row--unread" : ""} ${mail.flag === "urgent" ? "inbox__row--urgent" : ""}`}>
            <input type="checkbox" className="inbox__check" />
            <div className="inbox__star">
              {mail.flag === "urgent" ? "🔴" : "☆"}
            </div>
            <div className="inbox__from" title={SENDERS[mail.from]}>
              {SENDERS[mail.from].split("@")[0].replace(/\./g, " ")}
            </div>
            <div className="inbox__subject">
              <span className="inbox__subject-text">{mail.subject}</span>
              {mail.cc > 0 && (
                <span className="inbox__cc">+{mail.cc} CC</span>
              )}
            </div>
            <div className="inbox__age">{mail.age}</div>
          </div>
        ))}
        <div className="inbox__more">
          ... und 1.217 weitere ungelesene E-Mails
        </div>
      </div>
    </div>
  );
}

function tagStyle(color: string) {
  const map: Record<string, { bg: string; fg: string }> = {
    red: { bg: "#fef2f2", fg: "#dc2626" },
    yellow: { bg: "#fffbeb", fg: "#d97706" },
    green: { bg: "#f0fdf4", fg: "#16a34a" },
    blue: { bg: "#eff4ff", fg: "#2563eb" },
    gray: { bg: "#f3f4f6", fg: "#6b7280" },
  };
  const c = map[color] ?? map.gray;
  return { background: c.bg, color: c.fg, padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 600 };
}

function statusDot(s: "green" | "yellow" | "red") {
  const colors = { green: "#16a34a", yellow: "#d97706", red: "#dc2626" };
  return <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: colors[s], marginRight: 6 }} />;
}

function SortedInbox() {
  const [expanded, setExpanded] = useState<number | null>(0);

  return (
    <div className="inbox inbox--sorted">
      <div className="inbox__toolbar">
        <div className="inbox__toolbar-left">
          <span className="inbox__count">
            <strong>5</strong> aktive Vorgänge · <strong>14</strong> Threads
          </span>
        </div>
        <div className="inbox__toolbar-right">
          <span className="inbox__sort">Gruppiert nach: <strong>Vorgang</strong></span>
        </div>
      </div>
      <div className="inbox__projects">
        {SORTED_PROJECTS.map((proj, pi) => (
          <div key={pi} className="project-group">
            <div
              className={`project-group__header ${expanded === pi ? "project-group__header--open" : ""}`}
              onClick={() => setExpanded(expanded === pi ? null : pi)}
            >
              <span className="project-group__toggle">{expanded === pi ? "▼" : "▶"}</span>
              <span className="project-group__icon">{proj.icon}</span>
              <span className="project-group__name">{proj.name}</span>
              <span className="project-group__badge">{proj.threads.length}</span>
              <span className="project-group__status">
                {statusDot(proj.status)}
                {proj.statusLabel}
              </span>
            </div>
            {expanded === pi && (
              <div className="project-group__threads">
                {proj.threads.map((t, ti) => (
                  <div key={ti} className="thread-row">
                    <span className="thread-row__subject">{t.subject}</span>
                    <span className="thread-row__participants">{t.participants.join(", ")}</span>
                    <span style={tagStyle(t.tagColor)}>{t.tag}</span>
                    <span className="thread-row__time">{t.lastUpdate}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function MockInbox() {
  const [view, setView] = useState<"before" | "after">("before");

  return (
    <div className="mock-inbox-demo">
      <header className="demo-header">
        <div className="demo-header__logo">Netzanschluss-Assistent</div>
        <h1>E-Mail-Posteingang</h1>
        <p className="demo-header__sub">
          So verändert unser Tool Ihren Arbeitsalltag
        </p>
      </header>

      <div className="demo-toggle">
        <button
          className={`demo-toggle__btn ${view === "before" ? "demo-toggle__btn--active demo-toggle__btn--before" : ""}`}
          onClick={() => setView("before")}
        >
          <span className="demo-toggle__icon">😰</span>
          <span>Ohne unser Tool</span>
        </button>
        <button
          className={`demo-toggle__btn ${view === "after" ? "demo-toggle__btn--active demo-toggle__btn--after" : ""}`}
          onClick={() => setView("after")}
        >
          <span className="demo-toggle__icon">✨</span>
          <span>Mit unserem Tool</span>
        </button>
      </div>

      {view === "before" && (
        <div className="demo-section">
          <div className="demo-section__label demo-section__label--bad">
            <span>😰</span> Ihr Posteingang heute — Chaos pur
          </div>
          <ChaoticInbox />
          <div className="demo-pain-points">
            <div className="pain-point">
              <span className="pain-point__icon">🔴</span>
              <div>
                <strong>1.247 ungelesene Mails</strong>
                <p>Wichtige Anfragen gehen in der Flut unter</p>
              </div>
            </div>
            <div className="pain-point">
              <span className="pain-point__icon">🔴</span>
              <div>
                <strong>Endlose CC-Ketten</strong>
                <p>Bis zu 12 Personen in CC — wer ist zuständig?</p>
              </div>
            </div>
            <div className="pain-point">
              <span className="pain-point__icon">🔴</span>
              <div>
                <strong>Kein Überblick</strong>
                <p>Welche Projekte sind blockiert? Wo fehlen Unterlagen?</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {view === "after" && (
        <div className="demo-section">
          <div className="demo-section__label demo-section__label--good">
            <span>✨</span> Ihr Posteingang mit unserem Tool — Alles im Griff
          </div>
          <SortedInbox />
          <div className="demo-benefits">
            <div className="benefit">
              <span className="benefit__icon">✅</span>
              <div>
                <strong>Automatisch nach Vorgang sortiert</strong>
                <p>Jede Mail wird dem richtigen Projekt zugeordnet</p>
              </div>
            </div>
            <div className="benefit">
              <span className="benefit__icon">✅</span>
              <div>
                <strong>Status auf einen Blick</strong>
                <p>Sofort sehen, wo es hakt und was erledigt ist</p>
              </div>
            </div>
            <div className="benefit">
              <span className="benefit__icon">✅</span>
              <div>
                <strong>Thematische Threads</strong>
                <p>Keine CC-Ketten mehr — klare Zuordnung pro Aufgabe</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="demo-footer">
        Netzanschluss-Assistent · Prototyp · E-Mail-Demo
      </footer>
    </div>
  );
}
