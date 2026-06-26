import type { DraftMessage } from "../../respond";

interface Props {
  draft: DraftMessage;
}

// Schritt 5: automatisch erzeugte Nachforderungs-Mail (echt generiert,
// NICHT versendet — nur Anzeige).
export function ResponseView({ draft }: Props) {
  return (
    <section className="card">
      <h2>
        5 · Nachforderungs-Nachricht
        <span className="badge badge--fallback">nicht versendet (Demo)</span>
      </h2>
      <div className="mail">
        <div className="mail__head">
          <div><strong>Kanal:</strong> {draft.channel}</div>
          <div><strong>An:</strong> {draft.to ?? "— (keine Kontaktadresse erkannt)"}</div>
          <div><strong>Betreff:</strong> {draft.subject}</div>
        </div>
        <pre className="mail__body">{draft.body}</pre>
      </div>
    </section>
  );
}
