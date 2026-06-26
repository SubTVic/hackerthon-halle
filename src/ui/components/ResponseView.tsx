import type { DraftMessage } from "../../respond";

interface Props {
  draft: DraftMessage;
}

const CHANNEL_LABEL: Record<string, string> = {
  email: "E-Mail",
  letter: "Brief",
  fax: "Fax",
  portal: "Portal",
  phone: "Telefon",
  sms: "SMS",
};

export function ResponseView({ draft }: Props) {
  return (
    <section className="card">
      <div className="card__title">
        <span className="card__title-icon">{"📤"}</span>
        Automatische Nachforderung
      </div>

      <div className="mail-preview">
        <div className="mail__head">
          <div className="mail__head-row">
            <strong>Kanal:</strong> {CHANNEL_LABEL[draft.channel] ?? draft.channel}
          </div>
          <div className="mail__head-row">
            <strong>An:</strong> {draft.to ?? "Keine Kontaktadresse vorhanden"}
          </div>
          <div className="mail__head-row">
            <strong>Betreff:</strong> {draft.subject}
          </div>
        </div>
        <div className="mail__body-wrap">
          <pre className="mail__body">{draft.body}</pre>
        </div>
      </div>
    </section>
  );
}
