import { useMemo, useState } from "react";
import { Lightbulb, Sparkles } from "lucide-react";

const RULES = [
  { category: "Network", terms: ["wifi", "wi-fi", "internet", "vpn", "network", "connection", "connectivity"] },
  { category: "Access", terms: ["password", "login", "sign in", "permission", "access", "locked", "mfa", "account"] },
  { category: "Hardware", terms: ["laptop", "computer", "desktop", "monitor", "keyboard", "mouse", "printer", "battery", "overheat"] },
  { category: "Software", terms: ["application", "app", "software", "crm", "erp", "crash", "bug", "install", "update"] },
  { category: "Facilities", terms: ["air conditioning", "ac ", "light", "desk", "room", "facility"] },
];

const URGENT_TERMS = ["outage", "everyone", "entire team", "company-wide", "security breach", "data loss", "production down", "cannot work"];
const HIGH_TERMS = ["urgent", "blocked", "critical", "deadline", "multiple users", "not working", "failed"];

function recommendTriage(text) {
  const normalized = text.toLowerCase();
  const categoryScores = RULES.map((rule) => ({
    category: rule.category,
    score: rule.terms.reduce((score, term) => score + (normalized.includes(term) ? 1 : 0), 0),
  })).sort((a, b) => b.score - a.score);
  const matched = categoryScores[0]?.score > 0 ? categoryScores[0].category : "Software";
  const urgent = URGENT_TERMS.some((term) => normalized.includes(term));
  const high = HIGH_TERMS.some((term) => normalized.includes(term));
  const priority = urgent ? "critical" : high ? "high" : normalized.length > 100 ? "medium" : "low";
  const reason = urgent
    ? "A service-wide, security or data-impact phrase was detected."
    : high
      ? "The description contains an urgency or work-blocking phrase."
      : "No strong urgency phrase was found; review the suggested priority before submitting.";
  return { category: matched, priority, reason };
}

function SmartTriagePanel() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const result = useMemo(() => recommendTriage(`${title} ${description}`.trim()), [title, description]);
  const hasInput = Boolean(title.trim() || description.trim());

  return (
    <section className="smart-triage panel-card">
      <div className="smart-triage-heading">
        <span className="smart-triage-icon"><Sparkles size={18} /></span>
        <div>
          <h3>Smart Triage Assistant</h3>
          <p>Get an explainable category and priority suggestion from ticket keywords.</p>
        </div>
      </div>
      <div className="smart-triage-fields">
        <label>
          <span>Issue title</span>
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Company VPN is unavailable" />
        </label>
        <label>
          <span>What happened?</span>
          <textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Describe the impact and who is affected..." rows={3} />
        </label>
      </div>
      {hasInput ? (
        <div className="triage-result" aria-live="polite">
          <div className="triage-result-top">
            <strong><Lightbulb size={16} /> Suggested triage</strong>
            <span className={`triage-priority triage-${result.priority}`}>{result.priority}</span>
          </div>
          <p><b>Category:</b> {result.category}</p>
          <p className="triage-reason">{result.reason}</p>
        </div>
      ) : (
        <p className="triage-hint">Enter a sample issue to see how the recommendation works.</p>
      )}
      <p className="triage-disclaimer">Decision support only: suggestions use transparent keyword rules, not a trained AI model. A support agent should verify them.</p>
    </section>
  );
}

export default SmartTriagePanel;
