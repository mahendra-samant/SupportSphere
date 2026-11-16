import {
  BarChart3, ChevronLeft, FolderKanban, LayoutDashboard, LogOut,
  Plus, Settings, SquareChartGantt, Ticket, Users,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { clearCurrentUser, getCurrentUser } from "../services/api";
import "./SidebarBrandFix.css";

const navigationByRole = {
  admin: [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/tickets", label: "All Tickets", icon: Ticket },
    { to: "/categories", label: "Categories", icon: FolderKanban },
    { to: "/settings", label: "Users & Settings", icon: Settings },
    { to: "/customers", label: "Customers", icon: Users },
    { to: "/reports", label: "Reports", icon: SquareChartGantt },
    { to: "/analytics", label: "Analytics", icon: BarChart3 },
  ],
  agent: [
    { to: "/dashboard", label: "My Dashboard", icon: LayoutDashboard },
    { to: "/tickets", label: "Assigned Tickets", icon: Ticket },
  ],
  customer: [
    { to: "/dashboard", label: "My Dashboard", icon: LayoutDashboard },
    { to: "/tickets", label: "My Tickets", icon: Ticket },
  ],
};

function Sidebar({ isCollapsed, onToggle }) {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const role = currentUser?.role || "customer";
  const items = navigationByRole[role] || navigationByRole.customer;

  return (
    <aside className={isCollapsed ? "sidebar is-collapsed" : "sidebar"}>
      <div className="sidebar-top">
        <div className="sidebar-brand">
          <span className="sidebar-brand-mark">SS</span>
          {!isCollapsed && <span className="sidebar-brand-name">SupportSphere</span>}
        </div>
        <button
          className={isCollapsed ? "collapse-button is-collapsed" : "collapse-button"}
          type="button"
          aria-label={isCollapsed ? "Expand menu" : "Collapse menu"}
          onClick={onToggle}
        >
          <ChevronLeft size={18} />
          <ChevronLeft size={18} className="collapse-button-icon" />
        </button>
      </div>

      <nav className="sidebar-nav">
        <button
          className="sidebar-create-button"
          type="button"
          onClick={() => navigate("/tickets", { state: { openCreate: true } })}
        >
          <Plus size={17} />
          <span className="nav-link-label">New Ticket</span>
        </button>

        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
          >
            <Icon size={19} />
            <span className="nav-link-label">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button
          type="button"
          className="nav-link nav-link-logout"
          onClick={() => {
            clearCurrentUser();
            navigate("/login");
          }}
        >
          <LogOut size={19} />
          <span className="nav-link-label">Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
