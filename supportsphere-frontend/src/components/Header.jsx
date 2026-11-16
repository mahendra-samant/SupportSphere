import { UserRound } from "lucide-react";
import { getCurrentUser } from "../services/api";

function Header() {
  const currentUser = getCurrentUser();

  const displayName = currentUser?.name || "Guest User";
  const role = currentUser?.role
    ? currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)
    : "User";

  return (
    <header className="topbar">
      <div className="topbar-welcome">
        <strong>Welcome back, {displayName}</strong>
        <span>Here's what's happening in your workspace today.</span>
      </div>

      <div className="topbar-actions">
        <div className="user-chip">
          <div className="user-avatar">
            <UserRound size={18} />
          </div>

          <div>
            <strong>{displayName}</strong>
            <span>
              {role} - {currentUser?.email || "User"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
