import type { ProcessEvent } from "./types";

export type Stakeholder = "techniker" | "sachbearbeiter" | "investor" | "strategie";

export interface StakeholderPerspective {
  role: Stakeholder;
  roleLabel: string;
  roleIcon: string;
  summary: string;
  details: string[];
  actionRequired: string | null;
  relevance: "high" | "medium" | "low";
}

export interface TranslatedProblem {
  originalEvent: ProcessEvent;
  headline: string;
  perspectives: StakeholderPerspective[];
}

interface TranslationRule {
  match: (e: ProcessEvent) => boolean;
  translate: (e: ProcessEvent) => Omit<TranslatedProblem, "originalEvent">;
}

const RULES: TranslationRule[] = [
  {
    match: (e) => e.type === "problem_report" && e.severity === "blocker" && e.senderRole === "technician",
    translate: () => ({
      headline: "Zählerschrank zu klein — Montage blockiert",
      perspectives: [
        {
          role: "techniker",
          roleLabel: "Techniker / Ingenieur",
          roleIcon: "🔧",
          summary: "NA-Schutz passt nicht in vorhandenen Zählerschrank. Umbau oder Austausch nötig.",
          details: [
            "Zählerschrank: Bestandsanlage, kein freier Platz für NA-Schutz (VDE-AR-N 4105)",
            "Option A: Zählerschrank gegen größeres Modell tauschen (3-Punkt-Feld, mind. 1100mm)",
            "Option B: Separater AP-Verteiler für NA-Schutz neben Zählerschrank",
            "Montage kann erst nach Umbau fortgesetzt werden",
          ],
          actionRequired: "Bestandsaufnahme Zählerschrank-Maße dokumentieren, Foto an Sachbearbeiter",
          relevance: "high",
        },
        {
          role: "sachbearbeiter",
          roleLabel: "Sachbearbeiter (Netzbetreiber)",
          roleIcon: "📋",
          summary: "Vorgang blockiert: Zählerschrank-Umbau erforderlich vor Weiterbau.",
          details: [
            "Netzanschluss-Vorgang pausiert bis Umbau abgeschlossen",
            "Angebot für Zählerschrank-Umbau muss vom Anlagenbetreiber beauftragt werden",
            "Geschätzte Verzögerung: 2–4 Wochen (Materialbestellung + Umbauleistung)",
            "Nachricht an Antragsteller mit Kostenvoranschlag vorbereiten",
          ],
          actionRequired: "Antragsteller über Umbau-Erfordernis informieren, Kostenvoranschlag erstellen",
          relevance: "high",
        },
        {
          role: "investor",
          roleLabel: "Investor / Bauherr",
          roleIcon: "💼",
          summary: "Es gibt ein technisches Problem, das die Installation um ca. 2–4 Wochen verzögert. Es entstehen zusätzliche Kosten für einen Umbau.",
          details: [
            "Der Schaltschrank am Haus ist zu klein für die nötige Schutzeinrichtung",
            "Ein Umbau ist erforderlich — Ihr Netzbetreiber schickt Ihnen einen Kostenvoranschlag",
            "Geschätzte Mehrkosten: ca. 800–1.500 € (je nach Aufwand)",
            "Die PV-Anlage selbst ist davon nicht betroffen",
          ],
          actionRequired: null,
          relevance: "medium",
        },
        {
          role: "strategie",
          roleLabel: "Strategie / Portfolio",
          roleIcon: "📊",
          summary: "1 Vorgang blockiert (Zählerschrank-Umbau). Verzögerung +2–4 Wochen. Betrifft KPI Durchlaufzeit.",
          details: [
            "Häufigkeit dieses Problems im Portfolio: ~15% aller PV-Anschlüsse",
            "Durchschnittliche Verzögerung bei Zählerschrank-Problemen: 3,2 Wochen",
            "Empfehlung: Zählerschrank-Prüfung in Phase 1 (vor Baubeginn) vorziehen",
            "Potenzielle KPI-Verbesserung bei Vorabprüfung: -40% Baustellenblockaden",
          ],
          actionRequired: null,
          relevance: "medium",
        },
      ],
    }),
  },
  {
    match: (e) => e.type === "complaint" && e.senderRole === "investor",
    translate: () => ({
      headline: "Investor-Beschwerde: Verzögerung Netzanschluss",
      perspectives: [
        {
          role: "techniker",
          roleLabel: "Techniker / Ingenieur",
          roleIcon: "🔧",
          summary: "Kein technischer Handlungsbedarf. Beschwerde betrifft Prozess-Dauer, nicht Technik.",
          details: [
            "Montage-Status: Wartet auf Freigabe / Material",
            "Keine offenen technischen Fragen vom Techniker-Team",
          ],
          actionRequired: null,
          relevance: "low",
        },
        {
          role: "sachbearbeiter",
          roleLabel: "Sachbearbeiter (Netzbetreiber)",
          roleIcon: "📋",
          summary: "Investor beschwert sich über Bearbeitungsdauer. Eskalationsgefahr — Rückruf innerhalb 24h empfohlen.",
          details: [
            "Vorgang seit 18 Tagen offen — Durchschnitt für vergleichbare Vorgänge: 12 Tage",
            "Investor erwähnt bereits bestellte Anlage und wartenden Installateur",
            "Beschwerde-Kanal: Telefon (direkt, emotional)",
            "Empfehlung: Konkreten Zeitplan mit nächsten Schritten kommunizieren",
          ],
          actionRequired: "Rückruf an Investor mit konkretem Zeitplan (Frist: 24h)",
          relevance: "high",
        },
        {
          role: "investor",
          roleLabel: "Investor / Bauherr",
          roleIcon: "💼",
          summary: "Ihre Beschwerde wurde erfasst. Ein Sachbearbeiter meldet sich innerhalb von 24 Stunden mit einem konkreten Zeitplan bei Ihnen.",
          details: [
            "Ihr Vorgang wird priorisiert bearbeitet",
            "Nächster Schritt: Netzverträglichkeitsprüfung (bereits in Bearbeitung)",
            "Voraussichtlicher Abschluss: ca. 2 Wochen nach Freigabe",
          ],
          actionRequired: null,
          relevance: "high",
        },
        {
          role: "strategie",
          roleLabel: "Strategie / Portfolio",
          roleIcon: "📊",
          summary: "Investor-Eskalation bei Vorgang mit 18 Tagen Laufzeit (150% des Durchschnitts). Reputationsrisiko.",
          details: [
            "Beschwerden pro Monat (aktuell): 12 — Trend: +20% ggü. Vorquartal",
            "Hauptursache: 65% der Beschwerden wegen unklarer Kommunikation zum Zeitplan",
            "Automatische Statusmeldungen könnten 40–60% der Beschwerden vermeiden",
            "Kostenrisiko bei Eskalation (Anwalt/BNetzA): ~2.000–5.000 € pro Fall",
          ],
          actionRequired: null,
          relevance: "high",
        },
      ],
    }),
  },
  {
    match: (e) => e.type === "question" && e.senderRole === "installer",
    translate: () => ({
      headline: "Widerspruch Messkonzept: Voll- vs. Überschusseinspeisung",
      perspectives: [
        {
          role: "techniker",
          roleLabel: "Techniker / Ingenieur",
          roleIcon: "🔧",
          summary: "Messkonzept unklar: Antrag sagt Volleinspeisung, Betreiber will Überschuss. Unterschiedliche Zähler-Konfiguration nötig.",
          details: [
            "Volleinspeisung: Erzeugungszähler + separater Bezugszähler (2-Zähler-Modell)",
            "Überschusseinspeisung: Zweirichtungszähler reicht (1-Zähler-Modell)",
            "Bei Überschuss: Wechselrichter muss Eigenverbrauch-Optimierung unterstützen",
            "Klärung VOR Zählersetzung erforderlich",
          ],
          actionRequired: "Warten auf Klärung des Messkonzepts vor Zählerbestellung",
          relevance: "high",
        },
        {
          role: "sachbearbeiter",
          roleLabel: "Sachbearbeiter (Netzbetreiber)",
          roleIcon: "📋",
          summary: "Widerspruch im Antrag: Veräußerungsform muss geklärt werden. Antragsteller kontaktieren.",
          details: [
            "VDE-Feld 3.1.9 (Veräußerungsform) muss korrigiert werden",
            "Betrifft auch Einspeisevertrag und Abrechnung",
            "Rückfrage an Antragsteller: Welches Modell ist gewünscht?",
            "Marktstammdatenregister-Meldung erst nach Klärung",
          ],
          actionRequired: "Antragsteller kontaktieren: Voll- oder Überschusseinspeisung?",
          relevance: "high",
        },
        {
          role: "investor",
          roleLabel: "Investor / Bauherr",
          roleIcon: "💼",
          summary: "Es gibt eine Unstimmigkeit in Ihrem Antrag. Bitte teilen Sie uns mit, ob Sie den gesamten Strom einspeisen oder zuerst selbst verbrauchen möchten.",
          details: [
            "Volleinspeisung: Sie speisen alles ein und beziehen Strom normal vom Netz",
            "Überschusseinspeisung: Sie verbrauchen Ihren Strom selbst, nur der Rest wird eingespeist (meist wirtschaftlicher)",
            "Die Wahl beeinflusst Ihren Zähler und die Abrechnung",
          ],
          actionRequired: null,
          relevance: "medium",
        },
        {
          role: "strategie",
          roleLabel: "Strategie / Portfolio",
          roleIcon: "📊",
          summary: "Messkonzept-Widerspruch — häufige Fehlerquelle bei Online-Anträgen. Prozessoptimierung möglich.",
          details: [
            "Anteil inkonsistenter Messkonzept-Angaben: ~22% aller PV-Anträge",
            "Durchschnittliche Verzögerung durch Rückfrage: 5 Arbeitstage",
            "Verbesserung: Dropdown mit Erklärtext im Online-Portal würde ~80% der Fehler vermeiden",
            "Gesamteffekt: ~1.100 eingesparte Sachbearbeiter-Stunden/Jahr",
          ],
          actionRequired: null,
          relevance: "medium",
        },
      ],
    }),
  },
  {
    match: (e) => e.senderRole === "applicant" && e.body.toLowerCase().includes("lageplan"),
    translate: () => ({
      headline: "Lageplan nachgereicht — Dokument eingegangen",
      perspectives: [
        {
          role: "techniker",
          roleLabel: "Techniker / Ingenieur",
          roleIcon: "🔧",
          summary: "Lageplan eingegangen. Prüfung des Aufstellungsorts und Abstandsflächen möglich.",
          details: [
            "Lageplan muss auf korrekte Einzeichnung des PV-Aufstellungsorts geprüft werden",
            "Relevante Prüfpunkte: Abstand zur Grundstücksgrenze, Dachneigung, Verschattung",
            "VDE 8.1 — Lageplan jetzt vorhanden",
          ],
          actionRequired: "Lageplan technisch prüfen (Aufstellungsort, Abstandsflächen)",
          relevance: "medium",
        },
        {
          role: "sachbearbeiter",
          roleLabel: "Sachbearbeiter (Netzbetreiber)",
          roleIcon: "📋",
          summary: "Nachgefordeter Lageplan ist eingegangen. Offener Punkt kann abgehakt werden.",
          details: [
            "Dokument per E-Mail eingereicht — in Vorgang archivieren",
            "Offene Nachforderung 'Lageplan' kann als erledigt markiert werden",
            "Nächster Schritt: Prüfung und ggf. Freigabe zur Netzverträglichkeit",
          ],
          actionRequired: "Lageplan im Vorgang archivieren, Nachforderung als erledigt markieren",
          relevance: "high",
        },
        {
          role: "investor",
          roleLabel: "Investor / Bauherr",
          roleIcon: "💼",
          summary: "Ihr Lageplan ist bei uns eingegangen. Vielen Dank! Wir prüfen das Dokument und melden uns bei Rückfragen.",
          details: [
            "Der Lageplan wird in den nächsten 2–3 Werktagen geprüft",
            "Wenn alles passt, geht es direkt weiter mit der Netzverträglichkeitsprüfung",
          ],
          actionRequired: null,
          relevance: "low",
        },
        {
          role: "strategie",
          roleLabel: "Strategie / Portfolio",
          roleIcon: "📊",
          summary: "Nachgefordertes Dokument eingegangen. Vorgang rückt in Richtung Abschluss.",
          details: [
            "Durchschnittliche Reaktionszeit bei Nachforderungen: 6,8 Tage",
            "Lageplan ist das am häufigsten nachgeforderte Dokument (34% aller Nachforderungen)",
          ],
          actionRequired: null,
          relevance: "low",
        },
      ],
    }),
  },
  {
    match: (e) => e.type === "status_update" && e.senderRole === "technician" && e.body.toLowerCase().includes("erledigt"),
    translate: () => ({
      headline: "Montage abgeschlossen — bereit für Zählersetzung",
      perspectives: [
        {
          role: "techniker",
          roleLabel: "Techniker / Ingenieur",
          roleIcon: "🔧",
          summary: "PV-Module montiert und angeschlossen. Anlage bereit für Zähler und Inbetriebnahme.",
          details: [
            "Montage: Abgeschlossen (Module + Wechselrichter + Verkabelung)",
            "NA-Schutz: Verbaut und betriebsbereit",
            "Nächster technischer Schritt: Zähler setzen + Erstinbetriebnahme",
            "Erforderlich für IBN: Zählersetzung durch Netzbetreiber, Inbetriebnahmeprotokoll",
          ],
          actionRequired: null,
          relevance: "high",
        },
        {
          role: "sachbearbeiter",
          roleLabel: "Sachbearbeiter (Netzbetreiber)",
          roleIcon: "📋",
          summary: "Meilenstein erreicht: Montage abgeschlossen. Zählersetzung beauftragen.",
          details: [
            "Vorgang wechselt in Phase 'Inbetriebnahme'",
            "Zählersetzung beim Messstellenbetreiber beauftragen",
            "Inbetriebnahmeprotokoll nach Zählersetzung anfordern",
            "Marktstammdatenregister-Meldung vorbereiten",
          ],
          actionRequired: "Zählersetzung beauftragen, IBN-Termin koordinieren",
          relevance: "high",
        },
        {
          role: "investor",
          roleLabel: "Investor / Bauherr",
          roleIcon: "💼",
          summary: "Gute Nachricht: Die PV-Anlage ist fertig montiert! Als nächstes wird der Stromzähler getauscht, dann kann die Anlage in Betrieb gehen.",
          details: [
            "Ihre Anlage ist installiert und technisch betriebsbereit",
            "Der Netzbetreiber setzt in den nächsten Tagen einen neuen Zähler",
            "Nach der Inbetriebnahme beginnt die Einspeisung und Vergütung",
          ],
          actionRequired: null,
          relevance: "high",
        },
        {
          role: "strategie",
          roleLabel: "Strategie / Portfolio",
          roleIcon: "📊",
          summary: "Montage-Meilenstein erreicht. Vorgang in finaler Phase — voraussichtlicher Abschluss in 1–2 Wochen.",
          details: [
            "Durchschnittliche Zeit Montage → Inbetriebnahme: 8 Werktage",
            "Dieser Vorgang liegt 6 Tage über Durchschnitt (wegen Zählerschrank-Problem)",
            "Portfolio-Status: 67% der laufenden PV-Vorgänge in Phase Bau/Installation",
          ],
          actionRequired: null,
          relevance: "medium",
        },
      ],
    }),
  },
];

export function translateForStakeholders(event: ProcessEvent): TranslatedProblem {
  for (const rule of RULES) {
    if (rule.match(event)) {
      return { originalEvent: event, ...rule.translate(event) };
    }
  }
  return {
    originalEvent: event,
    headline: event.subject ?? "Nachricht eingegangen",
    perspectives: [
      {
        role: "sachbearbeiter",
        roleLabel: "Sachbearbeiter (Netzbetreiber)",
        roleIcon: "📋",
        summary: event.body.substring(0, 120),
        details: [],
        actionRequired: null,
        relevance: "low",
      },
    ],
  };
}
