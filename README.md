# Grid Connection Funnel

Übersetzungs-Layer für Netzbetreiber. Eingehende Netzanschluss-Anfragen aus
beliebigen Kanälen (Mail, Brief, Fax, Portal, Telefon-Transkript) werden in ein
einziges **kanonisches JSON** überführt, auf Vollständigkeit geprüft und in das
interne Zielformat (VDE-Datenset) exportiert. Fehlende Pflichtangaben werden
erkannt und eine Nachforderungs-Nachricht erzeugt.

```
[ beliebige Eingänge ]  ->  [ KANONISCHES JSON ]  ->  [ internes Zielformat ]
  Mail, Fax, Telefon         Single Source of Truth      VDE-Datenset, SAP, …
```

## Schnellstart (fake-first, kein API-Key nötig)

```bash
npm install
npm run dev      # öffnet die Demo, läuft komplett mit hartkodierten Fallbacks
```

`npm run typecheck` prüft die Typen, `npm test` läuft die Test-Suite.

## Architektur

| Modul          | Status      | Inhalt |
|----------------|-------------|--------|
| `canonical/`   | **ECHT**    | Kanonisches Schema (`types.ts`) + Pflicht-/Vorbedingungs-Registry (`fields.ts`) |
| `validate/`    | **ECHT**    | Vollständigkeits- & Vorbedingungsprüfung |
| `ingest/`      | halb-fake   | Eingangs-Parser; LLM optional, sonst hartkodierte Fallback-JSONs |
| `adapters/vde` | echt-genug  | Mapping kanonisch → VDE-Datenset-Feldnummern |
| `respond/`     | halb-fake   | Nachforderungs-Mail (echt generiert, **nicht** versendet) |
| `ui/`          | fake        | Demo-Frontend, zeigt den End-to-End-Pfad |
| `data/`        | —           | `vde-pv-fields.json` — 104 PV-Felder aus VDE-Datenset 3.0 |

**Scope (Hackathon):** nur Anlagentyp PV bis 30 kW, Antragphase 1.

## Was echt vs. simuliert ist

- **ECHT:** Schema + Vollständigkeitsprüfung gegen das dokumentierte VDE-Datenset.
- **SIMULIERT:** Kanäle (3 Beispiel-Buttons), LLM-Parsing (Fallback-JSON),
  Mail-Versand (nur Anzeige).

## Offene TODOs (für Sonnet)

Im Code mit `TODO(sonnet)` markiert. Kern:
- `canonical/fields.ts` — Feld-Registry aus `data/vde-pv-fields.json` vervollständigen
- `adapters/vde.ts` — `VDE_TO_CANONICAL`-Mapping vervollständigen
- `validate/` — Konsistenzprüfungen (powerKw ≤ 30, IBAN-Vorbedingung …)
- `ingest/llmParser.ts` — echten Claude-Call (optional, mit Fallback)
