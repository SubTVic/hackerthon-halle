import { useState } from "react";
import {
  perspectivesForThread,
  STAKEHOLDERS,
  type Project,
  type Stakeholder,
  type Thread,
} from "../../../projects";

interface Props {
  thread: Thread;
  project: Project;
}

const REL_CLASS = { high: "rel--high", medium: "rel--medium", low: "rel--low" };

export function ThreadPerspectives({ thread, project }: Props) {
  const [filter, setFilter] = useState<Stakeholder | "all">("all");
  const all = perspectivesForThread(thread, project);
  const shown = filter === "all" ? all : all.filter((p) => p.role === filter);

  return (
    <div className="persp">
      <div className="persp__bar">
        <span className="persp__bar-label">Sicht:</span>
        <button
          className={"persp__chip" + (filter === "all" ? " persp__chip--on" : "")}
          onClick={() => setFilter("all")}
        >
          👁 Alle
        </button>
        {STAKEHOLDERS.map((s) => (
          <button
            key={s.role}
            className={"persp__chip" + (filter === s.role ? " persp__chip--on" : "")}
            onClick={() => setFilter(s.role)}
          >
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      <div className="persp__grid">
        {shown.map((p) => (
          <div key={p.role} className={"persp__card " + REL_CLASS[p.relevance]}>
            <div className="persp__head">
              <span className="persp__icon">{p.icon}</span>
              <span className="persp__role">{p.label}</span>
              <span className={"persp__rel persp__rel--" + p.relevance}>
                {p.relevance === "high" ? "hohe Relevanz" : p.relevance === "medium" ? "relevant" : "gering"}
              </span>
            </div>
            <div className="persp__summary">{p.summary}</div>
            {p.action && (
              <div className="persp__action">
                <span>⚡</span>
                <span className="persp__action-label">Handlungsbedarf:</span>
                {p.action}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
