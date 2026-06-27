import { ProjectsView } from "./components/projects/ProjectsView";

export function App() {
  return (
    <div className="app">
      <header className="app__header">
        <div className="app__logo">Netzanschluss-Assistent</div>
        <h1>Eingehende Kommunikation → CRM</h1>
        <p className="app__subtitle">
          Ein durchgehender Funnel: Nachrichten aus allen Kanälen (E-Mail, Brief,
          Anruf) werden klassifiziert, je Projekt zu Threads gebündelt, gegen das
          aktuelle Regelwerk geprüft, in der Sprache des Empfängers beantwortet
          (nach Freigabe) — und verdichtet im CRM/TINA abgelegt.
        </p>
      </header>

      <ol className="pipeline-legend">
        <li>1 · Posteingang &amp; Klassifikation</li>
        <li>2 · Threads &amp; Dubletten</li>
        <li>3 · Anforderungsprofil</li>
        <li>4 · Antwort &amp; Freigabe</li>
        <li>5 · CRM-Verdichtung</li>
      </ol>

      <main>
        <ProjectsView />
      </main>

      <footer className="app__footer">
        Netzanschluss-Assistent &middot; Prototyp &middot; Hackathon-Demo
      </footer>
    </div>
  );
}
