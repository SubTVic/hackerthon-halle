import { ProjectsView } from "./components/projects/ProjectsView";

export function App() {
  return (
    <div className="shell">
      <header className="topbar">
        <div className="topbar__inner">
          <div className="topbar__brand">
            <span className="topbar__logo">⚡ Netz Halle</span>
            <span className="topbar__sub">Grid Connection Portal</span>
          </div>
          <div className="topbar__tagline">Eingehende Kommunikation → Vorgang → CRM</div>
        </div>
      </header>

      <div className="app">
        <ProjectsView />
      </div>

      <footer className="app__footer">
        Netz Halle &middot; Netzanschluss-Assistent (Prototyp) &middot; Demo läuft ohne API-Key
      </footer>
    </div>
  );
}
