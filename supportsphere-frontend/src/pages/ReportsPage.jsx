import "./AdminPages.css";
import { useEffect, useMemo, useState } from "react";
import {
  Download,
  FileBarChart,
  Ticket,
  CheckCircle2,
  Clock3,
  AlertTriangle,
} from "lucide-react";
import PageState from "../components/PageState";
import { loadAllTickets } from "../utils/loadAllTickets";
const STATUSES = [
  ["open", "Open"],
  ["in_progress", "In progress"],
  ["resolved", "Resolved"],
  ["closed", "Closed"],
  ["cancelled", "Cancelled"],
];
const PRIORITIES = [
  ["critical", "Critical"],
  ["high", "High"],
  ["medium", "Medium"],
  ["low", "Low"],
];
function ReportsPage() {
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
        if (active) setError("Could not load ticket data for reports.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  const statusCounts = useMemo(
    () =>
      Object.fromEntries(
        STATUSES.map(([key]) => [
          key,
          tickets.filter((t) => t.status === key).length,
        ]),
      ),
    [tickets],
  );
  const priorityCounts = useMemo(
    () =>
      Object.fromEntries(
        PRIORITIES.map(([key]) => [
          key,
          tickets.filter((t) => t.priority === key).length,
        ]),
      ),
    [tickets],
  );
  const categoryCounts = useMemo(() => {
    const counts = {};
    tickets.forEach((t) => {
      const name =
        t.category_detail?.name || t.category_name || `Category ${t.category}`;
      counts[name] = (counts[name] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [tickets]);
  const resolved = (statusCounts.resolved || 0) + (statusCounts.closed || 0);
  const percent = (value) =>
    tickets.length ? Math.round((value / tickets.length) * 100) : 0;
  function exportCsv() {
    const rows = [
      [
        "Ticket ID",
        "Title",
        "Status",
        "Priority",
        "Category",
        "Requester",
        "Assignee",
        "Created",
      ],
      ...tickets.map((t) => [
        t.id,
        t.title,
        t.status,
        t.priority,
        t.category_detail?.name || t.category_name || t.category,
        t.created_by_name || t.created_by_username,
        t.assigned_to_name || t.assigned_to_username,
        t.created_at,
      ]),
    ];
    const csv = rows
      .map((row) =>
        row
          .map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`)
          .join(","),
      )
      .join("\r\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "supportsphere-ticket-report.csv";
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <section className="page-section page-enter admin-page">
      <div className="page-title-row">
        <div>
          <span className="page-kicker">OPERATIONS OVERVIEW</span>
          <h2>Reports</h2>
          <p>A snapshot of ticket volume, workload and support outcomes.</p>
        </div>
        <button
          className="primary-button"
          onClick={exportCsv}
          disabled={loading || !tickets.length}
        >
          <Download size={16} /> Export CSV
        </button>
      </div>
      {error ? (
        <PageState type="error" title="Report unavailable" message={error} />
      ) : loading ? (
        <PageState type="loading" title="Preparing reports" />
      ) : (
        <>
          <div className="admin-summary-grid admin-summary-grid-four">
            <article className="admin-summary-card">
              <span className="admin-summary-icon">
                <Ticket size={18} />
              </span>
              <div>
                <small>Total tickets</small>
                <strong>{tickets.length}</strong>
              </div>
            </article>
            <article className="admin-summary-card">
              <span className="admin-summary-icon">
                <Clock3 size={18} />
              </span>
              <div>
                <small>Active backlog</small>
                <strong>{statusCounts.open + statusCounts.in_progress}</strong>
              </div>
            </article>
            <article className="admin-summary-card">
              <span className="admin-summary-icon">
                <CheckCircle2 size={18} />
              </span>
              <div>
                <small>Resolved / closed</small>
                <strong>{resolved}</strong>
              </div>
            </article>
            <article className="admin-summary-card">
              <span className="admin-summary-icon">
                <AlertTriangle size={18} />
              </span>
              <div>
                <small>Critical priority</small>
                <strong>{priorityCounts.critical}</strong>
              </div>
            </article>
          </div>
          <div className="admin-report-grid">
            <article className="panel-card admin-insight-card">
              <div className="panel-card-header">
                <div>
                  <h3>Ticket status</h3>
                  <p>Distribution by current workflow stage</p>
                </div>
                <FileBarChart size={19} />
              </div>
              {STATUSES.map(([key, label]) => (
                <div className="admin-bar-row" key={key}>
                  <div>
                    <span>{label}</span>
                    <strong>{statusCounts[key]}</strong>
                  </div>
                  <div className="admin-bar-track">
                    <span style={{ width: `${percent(statusCounts[key])}%` }} />
                  </div>
                </div>
              ))}
            </article>
            <article className="panel-card admin-insight-card">
              <div className="panel-card-header">
                <div>
                  <h3>Priority breakdown</h3>
                  <p>Urgency of incoming support issues</p>
                </div>
              </div>
              {PRIORITIES.map(([key, label]) => (
                <div className="admin-bar-row" key={key}>
                  <div>
                    <span>{label}</span>
                    <strong>{priorityCounts[key]}</strong>
                  </div>
                  <div className={`admin-bar-track priority-${key}`}>
                    <span
                      style={{ width: `${percent(priorityCounts[key])}%` }}
                    />
                  </div>
                </div>
              ))}
            </article>
            <article className="panel-card admin-insight-card admin-category-report">
              <div className="panel-card-header">
                <div>
                  <h3>Tickets by category</h3>
                  <p>Categories generating the most support requests</p>
                </div>
              </div>
              {categoryCounts.length ? (
                categoryCounts.map(([name, count]) => (
                  <div className="admin-category-row" key={name}>
                    <span>{name}</span>
                    <strong>{count}</strong>
                  </div>
                ))
              ) : (
                <p className="admin-empty">No category data yet.</p>
              )}
            </article>
          </div>
        </>
      )}
    </section>
  );
}
export default ReportsPage;
