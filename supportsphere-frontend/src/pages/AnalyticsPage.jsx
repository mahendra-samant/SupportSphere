import "./AdminPages.css";
import { useEffect, useMemo, useState } from "react";
import { Activity, Users, Gauge, TrendingUp } from "lucide-react";
import PageState from "../components/PageState";
import { loadAllTickets } from "../utils/loadAllTickets";
function AnalyticsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    loadAllTickets()
      .then((data) => {
        if (active) setTickets(data);
      })
      .catch(() => {
        if (active) setError("Could not load analytics data.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  const done = tickets.filter((t) =>
    ["resolved", "closed"].includes(t.status),
  ).length;
  const activeCount = tickets.filter((t) =>
    ["open", "in_progress"].includes(t.status),
  ).length;
  const rate = tickets.length ? Math.round((done / tickets.length) * 100) : 0;
  const agents = useMemo(() => {
    const g = {};
    tickets.forEach((t) => {
      const n = t.assigned_to_name || t.assigned_to_username || "Unassigned";
      g[n] = (g[n] || 0) + 1;
    });
    return Object.entries(g).sort((a, b) => b[1] - a[1]);
  }, [tickets]);
  const categories = useMemo(() => {
    const g = {};
    tickets.forEach((t) => {
      const n =
        t.category_detail?.name || t.category_name || `Category ${t.category}`;
      g[n] = (g[n] || 0) + 1;
    });
    return Object.entries(g).sort((a, b) => b[1] - a[1]);
  }, [tickets]);
  const maxAgent = Math.max(1, ...agents.map((x) => x[1]));
  const maxCategory = Math.max(1, ...categories.map((x) => x[1]));
  return (
    <section className="page-section page-enter admin-page">
      <div className="page-title-row">
        <div>
          <span className="page-kicker">SERVICE PERFORMANCE</span>
          <h2>Analytics</h2>
          <p>
            Understand ticket trends, team workload and resolution outcomes.
          </p>
        </div>
        <span className="admin-live-indicator">
          <i /> Based on live ticket records
        </span>
      </div>
      {error ? (
        <PageState type="error" title="Analytics unavailable" message={error} />
      ) : loading ? (
        <PageState type="loading" title="Calculating analytics" />
      ) : (
        <>
          <div className="admin-summary-grid admin-summary-grid-four">
            <article className="admin-summary-card">
              <span className="admin-summary-icon">
                <Activity size={18} />
              </span>
              <div>
                <small>Tickets tracked</small>
                <strong>{tickets.length}</strong>
              </div>
            </article>
            <article className="admin-summary-card">
              <span className="admin-summary-icon">
                <Gauge size={18} />
              </span>
              <div>
                <small>Resolution rate</small>
                <strong>{rate}%</strong>
              </div>
            </article>
            <article className="admin-summary-card">
              <span className="admin-summary-icon">
                <TrendingUp size={18} />
              </span>
              <div>
                <small>Active workload</small>
                <strong>{activeCount}</strong>
              </div>
            </article>
            <article className="admin-summary-card">
              <span className="admin-summary-icon">
                <Users size={18} />
              </span>
              <div>
                <small>Assigned agents</small>
                <strong>
                  {agents.filter(([name]) => name !== "Unassigned").length}
                </strong>
              </div>
            </article>
          </div>
          <div className="admin-report-grid">
            <article className="panel-card admin-insight-card">
              <div className="panel-card-header">
                <div>
                  <h3>Agent workload</h3>
                  <p>Tickets assigned per agent</p>
                </div>
              </div>
              {agents.length ? (
                agents.map(([name, count]) => (
                  <div className="admin-bar-row" key={name}>
                    <div>
                      <span>{name}</span>
                      <strong>{count}</strong>
                    </div>
                    <div className="admin-bar-track">
                      <span style={{ width: `${(count / maxAgent) * 100}%` }} />
                    </div>
                  </div>
                ))
              ) : (
                <p className="admin-empty">No assignment data yet.</p>
              )}
            </article>
            <article className="panel-card admin-insight-card">
              <div className="panel-card-header">
                <div>
                  <h3>Category demand</h3>
                  <p>Ticket volume grouped by category</p>
                </div>
              </div>
              {categories.length ? (
                categories.map(([name, count]) => (
                  <div className="admin-bar-row" key={name}>
                    <div>
                      <span>{name}</span>
                      <strong>{count}</strong>
                    </div>
                    <div className="admin-bar-track category-track">
                      <span
                        style={{ width: `${(count / maxCategory) * 100}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="admin-empty">No category data yet.</p>
              )}
            </article>
          </div>
          <p className="admin-data-note"></p>
        </>
      )}
    </section>
  );
}
export default AnalyticsPage;
