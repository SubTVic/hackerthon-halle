# Integration: Funnel-Engine → `netz-halle` Frontend

Ziel: unsere **Prozess-/Ablauf-Logik** (der komplette Vorgangs-Funnel) im
hübschen Live-Demo-Frontend **[netz-halle](https://github.com/jaiswalshubh000-sketch/netz-halle)**
(React 19 + Vite 6 + Tailwind 4 + lucide-react) laufen lassen.

Beide Projekte sind React + Vite + TypeScript und teilen sich bereits den
ursprünglichen Scaffold (`canonical/`, `adapters/`, `validate/`, `respond/`,
`data/`). `netz-halle` fehlt nur **unsere neue Funnel-Engine** (`src/projects/`)
und die passende Ansicht.

## Was übertragen wird

| Teil | Quelle (hackerthon-halle) | Ziel (netz-halle) | Abhängigkeiten |
|------|---------------------------|-------------------|----------------|
| **Engine** | `src/projects/` (ganzer Ordner) | `src/projects/` | **keine** — reines TypeScript |
| **Ansicht** | `integration/NetzFunnelPanel.tsx` | `src/components/NetzFunnelPanel.tsx` | react, tailwind, lucide-react (alle schon vorhanden) |

Die Engine ist bewusst **dependency-frei und framework-unabhängig**: kein React,
keine Imports außerhalb von `src/projects/`. Sie lässt sich daher 1:1 kopieren.

## Schritte

1. **Engine kopieren** — den Ordner `src/projects/` aus diesem Repo nach
   `netz-halle/src/projects/` kopieren. (Die enthaltene `projects.test.ts`
   ist optional; `netz-halle` hat aktuell keine Test-Runner.)

   ```bash
   # im netz-halle-Repo, mit hackerthon-halle als Nachbarordner:
   cp -r ../hackerthon-halle/src/projects ./src/projects
   ```

2. **Panel kopieren** — `integration/NetzFunnelPanel.tsx` nach
   `netz-halle/src/components/NetzFunnelPanel.tsx`. Der Import oben
   (`from "../projects"`) passt, wenn das Panel unter `src/components/` liegt.

3. **Einbinden** — in `netz-halle/src/App.tsx`:

   ```tsx
   import NetzFunnelPanel from "./components/NetzFunnelPanel";

   // ... irgendwo im JSX rendern, z.B. als eigener Tab/Abschnitt:
   <NetzFunnelPanel />
   ```

4. **Starten** — `npm run dev`. Es ist **kein `GEMINI_API_KEY` nötig**: die
   Engine arbeitet komplett mit den hinterlegten Demo-Daten (fake-first), die
   Live-Demo bricht also nie ab.

## Was das Panel zeigt (der gesamte Funnel auf einer Seite)

1. **Projektauswahl** — 3 Beispielprojekte mit zentraler Referenznummer
   (Rechenzentrum #1654, EFH #2089, Windpark #3320).
2. **Posteingang** — Mehrkanal (E-Mail/Brief-OCR/Anruf), Anhänge, automatische
   Klassifikation → Projekt + Vorgangsnummer (`1654.T.01`).
3. **Threads** — Bündelung pro Vorgang inkl. Zusammenfassung von
   Mehrfach-Nachfragen derselben Person.
4. **Stakeholder-Sicht** (pro Thread aufklappbar) — derselbe Sachverhalt für
   Techniker / Sachbearbeiter / Investor / Strategie übersetzt.
5. **Anforderungsprofil** — konfigurierbar (Toggle + Regelwerk-Stand), spiegelt
   wechselnde Gesetzeslage ohne Code-Änderung.
6. **Antwort & Freigabe** — Entwurf in der Sprache des Empfängers, Versand erst
   nach menschlicher Freigabe.
7. **CRM-Verdichtung + TINA-Export** — ein verdichteter Datensatz pro Projekt
   plus CSV-Export für den CURSOR/TINA-Import.

## Engine-API (falls eigene UI gewünscht)

```ts
import {
  PROJECTS, inboxForProject, buildThreads,        // Posteingang → Threads
  defaultProfile, evaluateProfile, RULESET_VERSIONS, // Anforderungen
  buildDraft,                                       // Antwortentwurf
  perspectivesForThread, STAKEHOLDERS,              // Stakeholder-Sicht
  compileCrm, serializeTinaCsv,                     // CRM + TINA-CSV
} from "./projects";

const threads = buildThreads(inboxForProject("1654"), "1654");
const profile = defaultProfile("datacenter");
const status  = evaluateProfile(profile);
const crm     = compileCrm(PROJECTS[0], threads, status);
const csv     = serializeTinaCsv(crm);
```

Alle Funktionen sind rein und deterministisch — gut testbar und ohne Netz-/
API-Aufruf. Die LLM-Anbindung (Gemini) von `netz-halle` kann später optional
vor die heuristische Klassifikation geschaltet werden; Fallback bleibt die
Engine.

## Versions-Hinweis

- `netz-halle`: React **19**, `hackerthon-halle`: React **18**. Das Panel nutzt
  nur stabile, in beiden Versionen identische APIs (`useState`, `useMemo`) —
  kein Anpassungsbedarf.
- Tailwind-4-Utility-Klassen werden verwendet; keine zusätzliche Config nötig.
