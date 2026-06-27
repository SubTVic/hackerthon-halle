import { useEffect, useState } from "react";
import type { Requirement, Thread, ApprovalStatus } from "../../../projects";
import { buildDraft } from "../../../projects";

interface Props {
  thread: Thread;
  openReqs: Requirement[];
  onStatusChange: (threadId: string, status: ApprovalStatus) => void;
}

export function ResponseDraftView({ thread, openReqs, onStatusChange }: Props) {
  const initial = buildDraft(thread, openReqs);
  const [body, setBody] = useState(initial.body);
  const [status, setStatus] = useState<ApprovalStatus>("draft");

  // Bei Threadwechsel Entwurf neu aufbauen.
  useEffect(() => {
    const d = buildDraft(thread, openReqs);
    setBody(d.body);
    setStatus("draft");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thread.id]);

  function setAndReport(s: ApprovalStatus) {
    setStatus(s);
    onStatusChange(thread.id, s);
  }

  return (
    <div className="draft">
      <div className="draft__head">
        <div>
          <span className="draft__to">An: {initial.to}</span>
          <span className="draft__tone">Tonfall: {initial.tone}</span>
        </div>
        <span className={"draft__status draft__status--" + status}>
          {status === "draft" ? "Entwurf — Freigabe nötig" : status === "approved" ? "Freigegeben" : "Versendet ✓"}
        </span>
      </div>

      <div className="draft__subject">{initial.subject}</div>

      <textarea
        className="draft__body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        disabled={status === "sent"}
        rows={14}
      />

      <div className="draft__actions">
        {status === "draft" && (
          <>
            <button className="btn btn--primary" onClick={() => setAndReport("approved")}>
              ✓ Freigeben
            </button>
            <span className="draft__note">Kein Versand ohne menschliche Freigabe.</span>
          </>
        )}
        {status === "approved" && (
          <>
            <button className="btn btn--send" onClick={() => setAndReport("sent")}>
              ✈ Senden
            </button>
            <button className="btn btn--ghost" onClick={() => setAndReport("draft")}>
              Zurück zu Entwurf
            </button>
          </>
        )}
        {status === "sent" && (
          <span className="draft__sent">Antwort versendet · im Thread dokumentiert</span>
        )}
      </div>
    </div>
  );
}
