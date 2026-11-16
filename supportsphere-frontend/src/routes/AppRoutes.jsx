import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import MainLayout from "../layouts/MainLayout";
import CategoriesPage from "../pages/CategoriesPage";
import CustomersPage from "../pages/CustomersPage";
import ReportsPage from "../pages/ReportsPage";
import AnalyticsPage from "../pages/AnalyticsPage";
import DashboardPage from "../pages/DashboardPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import SettingsPage from "../pages/SettingsPage";
import TicketDetailPage from "../pages/TicketDetailPage";
import TicketsPage from "../pages/TicketsPage";
import { getCurrentUser, isAuthenticated } from "../services/api";

function ProtectedRoute() {
  return isAuthenticated() ? <Outlet /> : <Navigate to="/login" replace />;
}

function RequireRole({ roles }) {
  const user = getCurrentUser();
  return roles.includes(user?.role) ? (
    <Outlet />
  ) : (
    <Navigate to="/dashboard" replace />
  );
}

function PublicRoute() {
  return isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Outlet />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Navigate to={isAuthenticated() ? "/dashboard" : "/login"} replace />
        }
      />

      <Route element={<PublicRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/tickets" element={<TicketsPage />} />
          <Route path="/tickets/:id" element={<TicketDetailPage />} />
          <Route element={<RequireRole roles={["admin"]} />}>
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

export default AppRoutes;
