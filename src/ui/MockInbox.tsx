import { useState } from "react";

const SENDERS = [
  { name: "Stefan Müller", email: "mueller.s@stadtwerke-halle.de", initials: "SM", color: "#0078d4" },
  { name: "Klaus Schmidt", email: "k.schmidt@elektro-schmidt.de", initials: "KS", color: "#8764b8" },
  { name: "Planungsbüro Weber", email: "info@planungsbuero-weber.de", initials: "PW", color: "#ca5010" },
  { name: "Netzgesellschaft Halle", email: "technik@netzgesellschaft-halle.de", initials: "NH", color: "#498205" },
  { name: "Jens Braun", email: "j.braun@solartechnik-braun.de", initials: "JB", color: "#da3b01" },
  { name: "PV-Anlage Ost Vertrieb", email: "vertrieb@pvanlage-ost.de", initials: "PO", color: "#005b70" },
  { name: "Buchhaltung SWH", email: "buchhaltung@stadtwerke-halle.de", initials: "BU", color: "#7a7574" },
  { name: "Lisa Hoffmann", email: "l.hoffmann@bauamt-halle.de", initials: "LH", color: "#0078d4" },
  { name: "Martin Becker", email: "m.becker@energieberatung-becker.de", initials: "MB", color: "#8764b8" },
  { name: "TINA Support", email: "support@tina-software.de", initials: "TS", color: "#ca5010" },
  { name: "EVU-Portal", email: "noreply@evu-portal.de", initials: "EP", color: "#498205" },
  { name: "Peter Wagner", email: "p.wagner@installateur-wagner.de", initials: "PW", color: "#da3b01" },
  { name: "Andrea Fischer", email: "a.fischer@stadtwerke-halle.de", initials: "AF", color: "#005b70" },
  { name: "Netzbetreiber Ost", email: "genehmigung@netzbetreiber-ost.de", initials: "NO", color: "#7a7574" },
  { name: "Dachdeckerei Lang", email: "kontakt@dachdeckerei-lang.de", initials: "DL", color: "#0078d4" },
];

const CHAOTIC_MAILS = [
  { subject: "AW: AW: AW: AW: Netzanschlussanfrage Müller - DRINGEND!!!", from: 0, cc: 8, unread: true, flagged: true, hasAttach: false, preview: "Hallo zusammen, ich warte jetzt seit 3 Wochen auf eine Rückmeldung zu meinem Netzanschlussantrag. Bitte um dringende Bearbeitung...", age: "vor 2 Min.", importance: true },
  { subject: "Fwd: Unterlagen PV-Anlage Schulstraße 14 - bitte prüfen", from: 2, cc: 6, unread: true, flagged: false, hasAttach: true, preview: "Anbei die nachgereichten Unterlagen für die PV-Anlage. Bitte um Prüfung und Weiterleitung an die zuständige Stelle...", age: "vor 5 Min.", importance: false },
  { subject: "AW: AW: Einspeisezusage noch offen???", from: 4, cc: 4, unread: true, flagged: true, hasAttach: false, preview: "Sehr geehrte Damen und Herren, die Einspeisezusage ist seit dem 15.03. ausstehend. Mein Kunde fragt täglich nach...", age: "vor 12 Min.", importance: true },
  { subject: "Re: Re: Re: Zählerplatz - Fotos anbei", from: 11, cc: 3, unread: true, flagged: false, hasAttach: true, preview: "Hier die angeforderten Fotos vom Zählerplatz. Die Maße stimmen leider nicht mit den Angaben überein...", age: "vor 18 Min.", importance: false },
  { subject: "EILT: Netzverträglichkeitsprüfung Projekt Rosenweg", from: 3, cc: 7, unread: true, flagged: true, hasAttach: true, preview: "Die Netzverträglichkeitsprüfung für das Projekt Rosenweg muss bis Freitag abgeschlossen sein. Bitte um sofortige Bearbeitung...", age: "vor 23 Min.", importance: true },
  { subject: "AW: AW: AW: Rückfrage Lageplan - welches Format???", from: 7, cc: 5, unread: false, flagged: false, hasAttach: false, preview: "Können Sie mir bitte nochmal sagen in welchem Format der Lageplan eingereicht werden muss? PDF oder DWG?", age: "vor 31 Min.", importance: false },
  { subject: "Fwd: Fwd: Angebot Hausanschluss - zur Kenntnisnahme", from: 12, cc: 9, unread: false, flagged: false, hasAttach: true, preview: "Zur Kenntnisnahme weitergeleitetes Angebot. Bitte prüfen Sie die Kostenkalkulation und geben Sie Feedback...", age: "vor 45 Min.", importance: false },
  { subject: "AW: Re: Netzanschluss Gartenweg 7 - Terminabstimmung", from: 8, cc: 6, unread: false, flagged: false, hasAttach: false, preview: "Der Termin am Mittwoch passt leider nicht. Können wir auf Donnerstag verschieben? Herr Klein ist flexibel...", age: "vor 52 Min.", importance: false },
  { subject: "Re: AW: AW: Wer ist zuständig für Projekt 2024-0847?", from: 1, cc: 11, unread: true, flagged: true, hasAttach: false, preview: "Ich bin definitiv nicht zuständig für dieses Projekt. Bitte klären Sie intern wer den Vorgang bearbeitet...", age: "vor 1 Std.", importance: true },
  { subject: "AW: AW: AW: AW: AW: Netzanschluss Industriegebiet", from: 13, cc: 8, unread: false, flagged: false, hasAttach: true, preview: "In der Anlage finden Sie die aktualisierte Planung. Die Änderungen betreffen hauptsächlich den Trafostationsstandort...", age: "vor 1 Std.", importance: false },
  { subject: "Fwd: Beschwerde Kunde Meier - sofort weiterleiten!!!", from: 6, cc: 7, unread: true, flagged: true, hasAttach: false, preview: "Herr Meier hat sich heute zum dritten Mal beschwert. Er droht mit Anwalt wenn nicht bis Ende der Woche...", age: "vor 1 Std.", importance: true },
  { subject: "AW: Nachreichung Unterlagen - BITTE BESTÄTIGEN", from: 5, cc: 4, unread: true, flagged: false, hasAttach: true, preview: "Ich habe die fehlenden Unterlagen per Post und per Mail geschickt. Bitte bestätigen Sie den Eingang...", age: "vor 2 Std.", importance: false },
  { subject: "Re: Re: Wann kommt die Einspeisezusage endlich?", from: 4, cc: 3, unread: false, flagged: false, hasAttach: false, preview: "Nochmalige Nachfrage bezüglich der Einspeisezusage. Mein Kunde wird zunehmend ungeduldig...", age: "vor 2 Std.", importance: false },
  { subject: "AW: AW: Abstimmung Tiefbau Kreuzung Leipziger Str.", from: 14, cc: 6, unread: false, flagged: false, hasAttach: false, preview: "Die Tiefbauarbeiten an der Kreuzung müssen mit dem Straßenbauamt koordiniert werden. Termin steht noch aus...", age: "vor 2 Std.", importance: false },
  { subject: "Fwd: AW: VDE-Konformität Wechselrichter - Frage", from: 3, cc: 5, unread: true, flagged: false, hasAttach: true, preview: "Die VDE-Konformität des eingesetzten Wechselrichters muss noch nachgewiesen werden. Bitte Datenblatt einreichen...", age: "vor 3 Std.", importance: false },
  { subject: "AW: AW: AW: AW: NAV-Prüfung fehlt noch!!!", from: 7, cc: 9, unread: true, flagged: true, hasAttach: false, preview: "Die NAV-Prüfung für den Anschluss Bergstraße steht immer noch aus. Das blockiert den gesamten Vorgang...", age: "vor 3 Std.", importance: true },
  { subject: "Re: Anschlusskosten - wer zahlt was?", from: 8, cc: 4, unread: false, flagged: false, hasAttach: false, preview: "Die Frage der Kostenaufteilung ist noch nicht geklärt. Bitte um Rücksprache mit der Fachabteilung...", age: "vor 3 Std.", importance: false },
  { subject: "AW: AW: Inbetriebnahmeprotokoll fehlt", from: 11, cc: 6, unread: true, flagged: false, hasAttach: false, preview: "Das Inbetriebnahmeprotokoll wurde noch nicht eingereicht. Ohne dieses Dokument können wir nicht abschließen...", age: "vor 4 Std.", importance: false },
  { subject: "Fwd: Fwd: Fwd: Genehmigung Denkmalschutz???", from: 7, cc: 10, unread: false, flagged: false, hasAttach: true, preview: "Hat jemand Informationen ob für die PV-Anlage in der Altstadt eine Denkmalschutzgenehmigung benötigt wird?", age: "vor 4 Std.", importance: false },
  { subject: "AW: Re: AW: Messkonzept bitte nochmal schicken", from: 1, cc: 5, unread: false, flagged: false, hasAttach: true, preview: "Das Messkonzept ist anscheinend nicht angekommen. Können Sie es bitte erneut an die richtige Adresse senden?", age: "vor 5 Std.", importance: false },
  { subject: "DRINGEND: Kunde droht mit Anwalt - Projekt Bergstr.", from: 5, cc: 12, unread: true, flagged: true, hasAttach: false, preview: "ACHTUNG: Herr Meier hat heute seinen Anwalt eingeschaltet. Wir müssen sofort reagieren und den Vorgang...", age: "vor 5 Std.", importance: true },
  { subject: "AW: AW: Abnahme verschoben - neuer Termin?", from: 12, cc: 4, unread: false, flagged: false, hasAttach: false, preview: "Die Abnahme konnte leider nicht stattfinden da der Elektriker verhindert war. Neuer Terminvorschlag...", age: "vor 6 Std.", importance: false },
  { subject: "Re: Re: Re: Re: Trafostationsplanung Phase 2", from: 3, cc: 8, unread: false, flagged: false, hasAttach: true, preview: "Die überarbeitete Planung für die Trafostation Phase 2 ist beigefügt. Bitte um Freigabe bis Montag...", age: "vor 6 Std.", importance: false },
  { subject: "AW: AW: AW: Wer hat die aktuelle Version vom Lageplan?", from: 2, cc: 7, unread: true, flagged: false, hasAttach: false, preview: "Ich habe Version 3 vom 12.04., aber Herr Schmidt meint es gibt schon Version 5? Wer hat die aktuelle?", age: "vor 7 Std.", importance: false },
  { subject: "Fwd: Newsletter EVU-Verband Juni 2024", from: 10, cc: 0, unread: false, flagged: false, hasAttach: false, preview: "Die neuesten Informationen aus dem EVU-Verband zu regulatorischen Änderungen und Branchentrends...", age: "vor 7 Std.", importance: false },
  { subject: "AW: AW: Zählerantrag Formular veraltet?", from: 6, cc: 3, unread: false, flagged: false, hasAttach: true, preview: "Das eingereichte Formular scheint nicht mehr aktuell zu sein. Bitte verwenden Sie das neue Formular von...", age: "vor 8 Std.", importance: false },
  { subject: "Re: AW: Netzbetreiberwechsel - was bedeutet das für uns", from: 13, cc: 9, unread: false, flagged: false, hasAttach: false, preview: "Der angekündigte Netzbetreiberwechsel hat Auswirkungen auf laufende Anträge. Bitte informieren Sie...", age: "vor 9 Std.", importance: false },
  { subject: "AW: AW: AW: AW: Baustromanschluss Projekt Ost", from: 14, cc: 6, unread: true, flagged: false, hasAttach: false, preview: "Der Baustromanschluss wird dringend benötigt. Die Baustelle steht seit Montag still weil kein Strom...", age: "vor 9 Std.", importance: false },
  { subject: "Fwd: Rechnung Tiefbau - falsche Kostenstelle??", from: 6, cc: 5, unread: false, flagged: false, hasAttach: true, preview: "Die Rechnung für die Tiefbauarbeiten wurde auf die falsche Kostenstelle gebucht. Bitte korrigieren...", age: "gestern", importance: false },
  { subject: "AW: AW: AW: Netzanschluss Schulze - Eskalation!", from: 0, cc: 11, unread: false, flagged: true, hasAttach: false, preview: "Der Fall Schulze eskaliert weiter. Die Geschäftsführung ist bereits informiert und erwartet eine Lösung...", age: "gestern", importance: true },
];

interface SortedThread {
  subject: string;
  participants: string[];
  lastUpdate: string;
  tag: string;
  tagColor: string;
  unread: boolean;
  count: number;
  hasAttach: boolean;
}

interface SortedProject {
  name: string;
  icon: string;
  status: "green" | "yellow" | "red";
  statusLabel: string;
  threads: SortedThread[];
}

const SORTED_PROJECTS: SortedProject[] = [
  {
    name: "PV-Anlage Schulstraße 14 — Fam. Müller",
    icon: "☀️",
    status: "red",
    statusLabel: "Einspeisezusage ausstehend · 3 offene Punkte",
    threads: [
      { subject: "Netzanschlussanfrage", participants: ["S. Müller", "Planungsbüro Weber"], lastUpdate: "vor 2 Min.", tag: "Anfrage", tagColor: "#0078d4", unread: true, count: 12, hasAttach: true },
      { subject: "Einspeisezusage", participants: ["Solartechnik Braun"], lastUpdate: "vor 12 Min.", tag: "Blockiert", tagColor: "#d13438", unread: true, count: 8, hasAttach: false },
      { subject: "Zählerplatz Fotos & Prüfung", participants: ["Installateur Wagner"], lastUpdate: "vor 18 Min.", tag: "Rückfrage", tagColor: "#ca5010", unread: true, count: 4, hasAttach: true },
      { subject: "VDE-Konformität Wechselrichter", participants: ["Netzgesellschaft"], lastUpdate: "vor 3 Std.", tag: "Klärung", tagColor: "#ca5010", unread: false, count: 3, hasAttach: true },
    ],
  },
  {
    name: "Netzanschluss Rosenweg 5 — Gewerbe",
    icon: "🏭",
    status: "yellow",
    statusLabel: "Netzverträglichkeitsprüfung läuft",
    threads: [
      { subject: "Netzverträglichkeitsprüfung", participants: ["Netzgesellschaft"], lastUpdate: "vor 23 Min.", tag: "In Prüfung", tagColor: "#0078d4", unread: true, count: 5, hasAttach: true },
      { subject: "Lageplan & Unterlagen", participants: ["Bauamt Halle"], lastUpdate: "vor 31 Min.", tag: "Nachreichung", tagColor: "#ca5010", unread: false, count: 7, hasAttach: true },
      { subject: "Angebot Hausanschluss", participants: ["A. Fischer"], lastUpdate: "vor 45 Min.", tag: "Info", tagColor: "#8a8886", unread: false, count: 2, hasAttach: true },
    ],
  },
  {
    name: "PV-Anlage Gartenweg 7 — Hr. Klein",
    icon: "🏠",
    status: "green",
    statusLabel: "Alle Unterlagen vollständig",
    threads: [
      { subject: "Terminabstimmung Anschluss", participants: ["Energieberatung Becker"], lastUpdate: "vor 52 Min.", tag: "Termin", tagColor: "#107c10", unread: false, count: 3, hasAttach: false },
      { subject: "Messkonzept", participants: ["Elektro Schmidt"], lastUpdate: "vor 5 Std.", tag: "Erledigt", tagColor: "#107c10", unread: false, count: 4, hasAttach: true },
    ],
  },
  {
    name: "Industriegebiet Ost — Trafostation Phase 2",
    icon: "⚡",
    status: "yellow",
    statusLabel: "Abstimmung Tiefbau offen",
    threads: [
      { subject: "Trafostationsplanung", participants: ["Netzgesellschaft", "Netzbetreiber Ost"], lastUpdate: "vor 6 Std.", tag: "Planung", tagColor: "#0078d4", unread: false, count: 9, hasAttach: true },
      { subject: "Tiefbau Kreuzung Leipziger Str.", participants: ["Dachdeckerei Lang"], lastUpdate: "vor 2 Std.", tag: "Koordination", tagColor: "#ca5010", unread: false, count: 4, hasAttach: false },
      { subject: "Baustromanschluss", participants: ["Dachdeckerei Lang"], lastUpdate: "vor 9 Std.", tag: "Offen", tagColor: "#ca5010", unread: true, count: 6, hasAttach: false },
    ],
  },
  {
    name: "Netzanschluss Bergstraße — Hr. Meier",
    icon: "⚠️",
    status: "red",
    statusLabel: "Eskalation — Kunde unzufrieden",
    threads: [
      { subject: "Kundenbeschwerde & Eskalation", participants: ["PV-Anlage Ost", "Geschäftsführung"], lastUpdate: "vor 5 Std.", tag: "Eskalation", tagColor: "#d13438", unread: true, count: 11, hasAttach: false },
      { subject: "NAV-Prüfung", participants: ["Bauamt Halle"], lastUpdate: "vor 3 Std.", tag: "Fehlend", tagColor: "#d13438", unread: true, count: 5, hasAttach: false },
      { subject: "Inbetriebnahmeprotokoll", participants: ["Installateur Wagner"], lastUpdate: "vor 4 Std.", tag: "Nachreichung", tagColor: "#ca5010", unread: true, count: 3, hasAttach: true },
    ],
  },
];

const FOLDERS_BEFORE = [
  { name: "Posteingang", count: 1247, icon: "📥", active: true },
  { name: "Entwürfe", count: 23, icon: "📝", active: false },
  { name: "Gesendete Elemente", count: 0, icon: "📤", active: false },
  { name: "Gelöschte Elemente", count: 892, icon: "🗑️", active: false },
  { name: "Junk-E-Mail", count: 156, icon: "⚠️", active: false },
  { name: "Archiv", count: 0, icon: "📦", active: false },
];

const FOLDERS_AFTER = [
  { name: "Posteingang", count: 14, icon: "📥", active: true, sub: "Netzanschluss-Assistent" },
  { name: "Entwürfe", count: 2, icon: "📝", active: false },
  { name: "Gesendete Elemente", count: 0, icon: "📤", active: false },
  { name: "Gelöschte Elemente", count: 3, icon: "🗑️", active: false },
  { name: "Archiv", count: 0, icon: "📦", active: false },
];

function OutlookRibbon() {
  return (
    <div className="ol-ribbon">
      <div className="ol-ribbon__tabs">
        <span className="ol-ribbon__tab">Datei</span>
        <span className="ol-ribbon__tab ol-ribbon__tab--active">Start</span>
        <span className="ol-ribbon__tab">Senden/Empfangen</span>
        <span className="ol-ribbon__tab">Ordner</span>
        <span className="ol-ribbon__tab">Ansicht</span>
        <span className="ol-ribbon__tab">Netzanschluss-Assistent</span>
      </div>
      <div className="ol-ribbon__bar">
        <div className="ol-ribbon__group">
          <button className="ol-ribbon__btn ol-ribbon__btn--primary">
            <span className="ol-ribbon__btn-icon">✉️</span>
            <span>Neue<br/>E-Mail</span>
          </button>
          <div className="ol-ribbon__group-sep" />
          <button className="ol-ribbon__btn">
            <span className="ol-ribbon__btn-icon">🗑️</span>
            <span>Löschen</span>
          </button>
          <button className="ol-ribbon__btn">
            <span className="ol-ribbon__btn-icon">📁</span>
            <span>Archivieren</span>
          </button>
          <button className="ol-ribbon__btn">
            <span className="ol-ribbon__btn-icon">⚠️</span>
            <span>Junk-E-Mail</span>
          </button>
          <div className="ol-ribbon__group-sep" />
          <button className="ol-ribbon__btn">
            <span className="ol-ribbon__btn-icon">↩️</span>
            <span>Antworten</span>
          </button>
          <button className="ol-ribbon__btn">
            <span className="ol-ribbon__btn-icon">↩️</span>
            <span>Allen<br/>antworten</span>
          </button>
          <button className="ol-ribbon__btn">
            <span className="ol-ribbon__btn-icon">➡️</span>
            <span>Weiter-<br/>leiten</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function OutlookSidebar({ folders }: { folders: typeof FOLDERS_BEFORE }) {
  return (
    <div className="ol-sidebar">
      <div className="ol-sidebar__account">
        <div className="ol-sidebar__avatar" style={{ background: "#0078d4" }}>SW</div>
        <div className="ol-sidebar__account-info">
          <div className="ol-sidebar__account-name">Stadtwerke Halle</div>
          <div className="ol-sidebar__account-email">netzanschluss@stadtwerke-halle.de</div>
        </div>
      </div>
      <div className="ol-sidebar__search">
        <span className="ol-sidebar__search-icon">🔍</span>
        <span className="ol-sidebar__search-text">Suchen</span>
      </div>
      <div className="ol-sidebar__folders">
        {folders.map((f, i) => (
          <div key={i} className={`ol-folder ${f.active ? "ol-folder--active" : ""}`}>
            <span className="ol-folder__icon">{f.icon}</span>
            <span className="ol-folder__name">{f.name}</span>
            {f.count > 0 && <span className="ol-folder__count">{f.count.toLocaleString("de-DE")}</span>}
          </div>
        ))}
      </div>
      <div className="ol-sidebar__nav">
        <div className="ol-sidebar__nav-item ol-sidebar__nav-item--active">📧</div>
        <div className="ol-sidebar__nav-item">📅</div>
        <div className="ol-sidebar__nav-item">👥</div>
        <div className="ol-sidebar__nav-item">✅</div>
      </div>
    </div>
  );
}

function ChaoticInbox() {
  const [selected, setSelected] = useState(0);
  const mail = CHAOTIC_MAILS[selected];
  const sender = SENDERS[mail.from];

  return (
    <div className="ol-window">
      <div className="ol-titlebar">
        <span className="ol-titlebar__dots">
          <span className="ol-dot ol-dot--close" />
          <span className="ol-dot ol-dot--min" />
          <span className="ol-dot ol-dot--max" />
        </span>
        <span className="ol-titlebar__text">Posteingang — netzanschluss@stadtwerke-halle.de — Outlook</span>
      </div>
      <OutlookRibbon />
      <div className="ol-body">
        <OutlookSidebar folders={FOLDERS_BEFORE} />
        <div className="ol-list">
          <div className="ol-list__header">
            <span className="ol-list__title">Posteingang</span>
            <span className="ol-list__badge">1.247</span>
          </div>
          <div className="ol-list__filter">
            <span>Alle</span>
            <span className="ol-list__filter--active">Ungelesen</span>
            <span>Erwähnt</span>
          </div>
          <div className="ol-list__items">
            {CHAOTIC_MAILS.map((m, i) => {
              const s = SENDERS[m.from];
              return (
                <div
                  key={i}
                  className={`ol-mail ${m.unread ? "ol-mail--unread" : ""} ${i === selected ? "ol-mail--selected" : ""}`}
                  onClick={() => setSelected(i)}
                >
                  {m.unread && <div className="ol-mail__unread-bar" />}
                  <div className="ol-mail__avatar" style={{ background: s.color }}>{s.initials}</div>
                  <div className="ol-mail__content">
                    <div className="ol-mail__top">
                      <span className="ol-mail__sender">{s.name}</span>
                      <span className="ol-mail__time">{m.age}</span>
                    </div>
                    <div className="ol-mail__subject">
                      {m.importance && <span className="ol-mail__importance">❗</span>}
                      {m.subject}
                    </div>
                    <div className="ol-mail__preview">{m.preview.slice(0, 80)}...</div>
                    <div className="ol-mail__meta">
                      {m.cc > 0 && <span className="ol-mail__cc-badge">CC +{m.cc}</span>}
                      {m.hasAttach && <span className="ol-mail__attach">📎</span>}
                      {m.flagged && <span className="ol-mail__flag">🚩</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="ol-reading">
          <div className="ol-reading__header">
            <div className="ol-reading__subject">{mail.subject}</div>
            <div className="ol-reading__from-row">
              <div className="ol-reading__avatar" style={{ background: sender.color }}>{sender.initials}</div>
              <div>
                <div className="ol-reading__from-name">{sender.name} <span className="ol-reading__from-email">&lt;{sender.email}&gt;</span></div>
                <div className="ol-reading__to">An: netzanschluss@stadtwerke-halle.de</div>
                {mail.cc > 0 && <div className="ol-reading__cc">CC: {Array.from({ length: mail.cc }, (_, j) => SENDERS[(mail.from + j + 1) % SENDERS.length].email).join("; ")}</div>}
              </div>
            </div>
            {mail.importance && <div className="ol-reading__importance-banner">❗ Diese Nachricht wurde mit hoher Wichtigkeit gesendet.</div>}
          </div>
          <div className="ol-reading__body">
            <p>{mail.preview}</p>
            <p>Mit freundlichen Grüßen<br/>{sender.name}</p>
          </div>
        </div>
      </div>
      <div className="ol-statusbar">
        <span>Alle Ordner sind aktuell.</span>
        <span>Elemente: 1.247 · Ungelesen: 1.247</span>
      </div>
    </div>
  );
}

function SortedInbox() {
  const [expanded, setExpanded] = useState<number>(0);
  const [selectedThread, setSelectedThread] = useState<{ pi: number; ti: number }>({ pi: 0, ti: 0 });
  const proj = SORTED_PROJECTS[selectedThread.pi];
  const thread = proj.threads[selectedThread.ti];

  return (
    <div className="ol-window">
      <div className="ol-titlebar">
        <span className="ol-titlebar__dots">
          <span className="ol-dot ol-dot--close" />
          <span className="ol-dot ol-dot--min" />
          <span className="ol-dot ol-dot--max" />
        </span>
        <span className="ol-titlebar__text">Posteingang — netzanschluss@stadtwerke-halle.de — Outlook</span>
      </div>
      <OutlookRibbon />
      <div className="ol-body">
        <OutlookSidebar folders={FOLDERS_AFTER} />
        <div className="ol-list ol-list--sorted">
          <div className="ol-list__header">
            <span className="ol-list__title">Posteingang</span>
            <span className="ol-list__badge ol-list__badge--good">14</span>
          </div>
          <div className="ol-list__filter">
            <span className="ol-list__filter--active">Nach Vorgang</span>
            <span>Alle</span>
            <span>Ungelesen</span>
          </div>
          <div className="ol-list__items">
            {SORTED_PROJECTS.map((p, pi) => (
              <div key={pi} className="ol-project">
                <div
                  className={`ol-project__header ${expanded === pi ? "ol-project__header--open" : ""}`}
                  onClick={() => setExpanded(expanded === pi ? -1 : pi)}
                >
                  <span className="ol-project__toggle">{expanded === pi ? "▾" : "▸"}</span>
                  <span className="ol-project__icon">{p.icon}</span>
                  <span className="ol-project__name">{p.name}</span>
                  <span className={`ol-project__dot ol-project__dot--${p.status}`} />
                  <span className="ol-project__count">{p.threads.length}</span>
                </div>
                {expanded === pi && p.threads.map((t, ti) => (
                  <div
                    key={ti}
                    className={`ol-thread ${selectedThread.pi === pi && selectedThread.ti === ti ? "ol-thread--selected" : ""} ${t.unread ? "ol-thread--unread" : ""}`}
                    onClick={() => setSelectedThread({ pi, ti })}
                  >
                    {t.unread && <div className="ol-mail__unread-bar" />}
                    <div className="ol-thread__content">
                      <div className="ol-thread__top">
                        <span className="ol-thread__subject">{t.subject}</span>
                        <span className="ol-thread__time">{t.lastUpdate}</span>
                      </div>
                      <div className="ol-thread__participants">{t.participants.join(", ")}</div>
                      <div className="ol-thread__meta">
                        <span className="ol-thread__tag" style={{ background: t.tagColor + "18", color: t.tagColor, borderColor: t.tagColor + "40" }}>{t.tag}</span>
                        <span className="ol-thread__msg-count">{t.count} Nachrichten</span>
                        {t.hasAttach && <span className="ol-mail__attach">📎</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="ol-reading">
          <div className="ol-reading__project-banner" style={{ borderLeftColor: proj.status === "red" ? "#d13438" : proj.status === "yellow" ? "#ca5010" : "#107c10" }}>
            <span>{proj.icon} {proj.name}</span>
            <span className={`ol-reading__status ol-reading__status--${proj.status}`}>{proj.statusLabel}</span>
          </div>
          <div className="ol-reading__header">
            <div className="ol-reading__subject">{thread.subject}</div>
            <div className="ol-reading__thread-info">
              <span className="ol-thread__tag" style={{ background: thread.tagColor + "18", color: thread.tagColor, borderColor: thread.tagColor + "40" }}>{thread.tag}</span>
              <span>{thread.count} Nachrichten in diesem Thread</span>
              <span>Beteiligte: {thread.participants.join(", ")}</span>
            </div>
          </div>
          <div className="ol-reading__body">
            <div className="ol-reading__thread-list">
              {Array.from({ length: Math.min(thread.count, 3) }, (_, i) => (
                <div key={i} className="ol-reading__thread-msg">
                  <div className="ol-reading__thread-msg-header">
                    <strong>{i === 0 ? thread.participants[0] : i === 1 ? "Sie" : thread.participants[thread.participants.length - 1]}</strong>
                    <span className="ol-reading__thread-msg-time">{i === 0 ? thread.lastUpdate : i === 1 ? "vor 1 Tag" : "vor 3 Tagen"}</span>
                  </div>
                  <p className="ol-reading__thread-msg-body">
                    {i === 0 ? "Letzte Nachricht zum Thema. Bitte um Rückmeldung..." : i === 1 ? "Vielen Dank, wir prüfen die Unterlagen und melden uns." : "Erstanfrage eingereicht mit allen verfügbaren Dokumenten."}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="ol-statusbar">
        <span>Netzanschluss-Assistent aktiv · Alle Vorgänge aktuell</span>
        <span>Vorgänge: 5 · Threads: 14</span>
      </div>
    </div>
  );
}

export function MockInbox() {
  const [view, setView] = useState<"before" | "after">("before");

  return (
    <div className="mock-inbox-demo">
      <header className="demo-header">
        <h1>E-Mail-Posteingang — Vorher / Nachher</h1>
        <p className="demo-header__sub">So verändert der Netzanschluss-Assistent Ihren Arbeitsalltag in Outlook</p>
      </header>

      <div className="demo-toggle">
        <button
          className={`demo-toggle__btn ${view === "before" ? "demo-toggle__btn--active demo-toggle__btn--before" : ""}`}
          onClick={() => setView("before")}
        >
          Ohne unser Tool
        </button>
        <button
          className={`demo-toggle__btn ${view === "after" ? "demo-toggle__btn--active demo-toggle__btn--after" : ""}`}
          onClick={() => setView("after")}
        >
          Mit Netzanschluss-Assistent
        </button>
      </div>

      {view === "before" && (
        <>
          <ChaoticInbox />
          <div className="demo-pain-points">
            <div className="pain-point"><strong>1.247 ungelesene Mails</strong><p>Wichtige Anfragen gehen in der Flut unter</p></div>
            <div className="pain-point"><strong>Endlose CC-Ketten</strong><p>Bis zu 12 Personen in CC — niemand fühlt sich zuständig</p></div>
            <div className="pain-point"><strong>Kein Projektüberblick</strong><p>Welche Vorgänge blockiert sind, sieht man erst wenn der Kunde anruft</p></div>
          </div>
        </>
      )}

      {view === "after" && (
        <>
          <SortedInbox />
          <div className="demo-benefits">
            <div className="benefit"><strong>Automatisch nach Vorgang sortiert</strong><p>Jede E-Mail wird dem richtigen Projekt zugeordnet</p></div>
            <div className="benefit"><strong>Status auf einen Blick</strong><p>Ampelsystem zeigt sofort wo es hakt</p></div>
            <div className="benefit"><strong>Thematische Threads</strong><p>Keine CC-Ketten — klare Zuordnung pro Aufgabe</p></div>
          </div>
        </>
      )}
    </div>
  );
}
