// ============================================================================
// RESPOND — Nachforderungs-Nachricht aus fehlenden Feldern (HALB-FAKE)
// ============================================================================
// Baut aus dem ValidationResult eine Nachforderungs-Mail im Originalkanal des
// Absenders. Text wird ECHT generiert, aber NICHT versendet (nur angezeigt).
// ============================================================================

import type { CanonicalRequest } from "../canonical";
import type { ValidationResult } from "../validate";

export interface DraftMessage {
  channel: CanonicalRequest["channel"];
  to: string | null;
  subject: string;
  body: string;
}

/**
 * Erzeugt einen Nachforderungs-Entwurf. Template-basiert.
 * TODO(sonnet, optional): per LLM in höflicheres Fließ-Deutsch umschreiben,
 *   im Stil/Kanal des Absenders. Fallback bleibt dieses Template.
 */
export function buildResponse(
  req: CanonicalRequest,
  result: ValidationResult,
): DraftMessage {
  const operator = req.parties.find((p) => p.role === "operator") ?? req.parties[0];
  const to = operator?.contact.email ?? null;
  const greeting = operator?.name ? `Sehr geehrte/r ${operator.name},` : "Sehr geehrte Damen und Herren,";

  const bullets = result.missing
    .map((m) => `  • ${m.label}${m.vdeNr ? ` (VDE-Feld ${m.vdeNr})` : ""}`)
    .join("\n");

  const body = `${greeting}

vielen Dank für Ihre Netzanschluss-Anfrage (${req.requestId}).
Zur Bearbeitung fehlen uns noch folgende Pflichtangaben:

${bullets || "  (keine — Anfrage ist vollständig)"}

Bitte senden Sie uns diese Angaben zurück. Anschließend können wir Ihren
Antrag zügig weiter bearbeiten.

Mit freundlichen Grüßen
Ihr Netzbetreiber`;

  return {
    channel: req.channel,
    to,
    subject: `Rückfrage zu Ihrer Netzanschluss-Anfrage ${req.requestId}`,
    body,
  };
}
