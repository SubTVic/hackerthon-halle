import type { CanonicalRequest } from "../../canonical";

interface Props {
  raw: string;
  request: CanonicalRequest;
  source: "llm" | "fallback";
}

// Schritt 2: Rohtext -> kanonisches JSON (Single Source of Truth).
export function CanonicalView({ raw, request, source }: Props) {
  return (
    <section className="card">
      <h2>
        2 · Übersetzung ins kanonische JSON
        <span className={`badge badge--${source}`}>
          {source === "llm" ? "LLM" : "Fallback (simuliert)"}
        </span>
      </h2>
      <div className="split">
        <div>
          <h3>Roh-Eingang</h3>
          <pre className="raw">{raw}</pre>
        </div>
        <div>
          <h3>Kanonisch</h3>
          <pre className="json">{JSON.stringify(request, null, 2)}</pre>
        </div>
      </div>
    </section>
  );
}
