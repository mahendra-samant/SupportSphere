import "./AdminPages.css";
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Users,
  UserRoundCheck,
  UserRoundPlus,
  UserX,
  UserCheck,
  Pencil,
  Plus,
  X,
  Mail,
  Ticket,
  RefreshCw,
} from "lucide-react";

import PageState from "../components/PageState";
import { getCustomers, createCustomer, updateCustomer } from "../services/api";

function getErrorMessage(error) {
  const data = error?.data;

  if (data && typeof data === "object") {
    return Object.entries(data)
      .map(([field, messages]) => {
        const message = Array.isArray(messages)
          ? messages.join(", ")
          : String(messages);

        return `${field}: ${message}`;
      })
      .join(" | ");
  }

  return error?.message || "Something went wrong. Please try again.";
}

function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [success, setSuccess] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  async function loadCustomers() {
    setLoading(true);
    setError("");

    try {
      const data = await getCustomers();
      setCustomers(Array.isArray(data) ? data : data?.results || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    const term = query.trim().toLowerCase();

    if (!term) return customers;

    return customers.filter((customer) =>
      `${customer.name || ""} ${customer.email || ""} ${customer.id}`
        .toLowerCase()
        .includes(term),
    );
  }, [customers, query]);

  const activeCount = customers.filter((customer) => customer.is_active).length;

  const inactiveCount = customers.length - activeCount;

  function openCreateModal() {
    setEditingCustomer(null);
    setForm({ name: "", email: "", password: "" });
    setActionError("");
    setSuccess("");
    setModalOpen(true);
  }

  function openEditModal(customer) {
    setEditingCustomer(customer);
    setForm({
      name: customer.name || "",
      email: customer.email || "",
      password: "",
    });
    setActionError("");
    setSuccess("");
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;

    setModalOpen(false);
    setEditingCustomer(null);
    setForm({ name: "", email: "", password: "" });
    setActionError("");
  }

  function handleFormChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setActionError("");
    setSuccess("");

    const payload = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
    };

    if (!payload.name || !payload.email) {
      setActionError("Please enter the customer's name and email.");
      return;
    }

    if (!editingCustomer && !form.password) {
      setActionError("Please enter a password for the new customer.");
      return;
    }

    if (!editingCustomer && form.password.length < 8) {
      setActionError("Password must contain at least 8 characters.");
      return;
    }

    if (!editingCustomer) {
      payload.password = form.password;
    }

    setSaving(true);

    try {
      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, payload);
        setSuccess("Customer details updated successfully.");
      } else {
        await createCustomer(payload);
        setSuccess("New customer created successfully.");
      }

      setModalOpen(false);
      setEditingCustomer(null);
      setForm({ name: "", email: "", password: "" });

      await loadCustomers();
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(customer) {
    const nextStatus = !customer.is_active;
    const action = nextStatus ? "activate" : "deactivate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${customer.name}'s account?`,
    );

    if (!confirmed) return;

    setActionError("");
    setSuccess("");

    try {
      await updateCustomer(customer.id, {
        is_active: nextStatus,
      });

      setCustomers((previous) =>
        previous.map((item) =>
          item.id === customer.id ? { ...item, is_active: nextStatus } : item,
        ),
      );

      setSuccess(
        `${customer.name}'s account has been ${nextStatus ? "activated" : "deactivated"}.`,
      );
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  }

  return (
    <section className="page-section page-enter admin-page customer-management">
      <div className="page-title-row">
        <div>
          <span className="page-kicker">CUSTOMER MANAGEMENT</span>
          <h2>Customers</h2>
          <p>Manage customer accounts, contact details and account status.</p>
        </div>

        <button className="customer-primary-btn" onClick={openCreateModal}>
          <Plus size={17} />
          Add customer
        </button>
      </div>

      <div className="admin-summary-grid">
        <article className="admin-summary-card">
          <span className="admin-summary-icon">
            <Users size={19} />
          </span>
          <div>
            <small>Total customers</small>
            <strong>{customers.length}</strong>
          </div>
        </article>

        <article className="admin-summary-card">
          <span className="admin-summary-icon">
            <UserRoundCheck size={19} />
          </span>
          <div>
            <small>Active customers</small>
            <strong>{activeCount}</strong>
          </div>
        </article>

        <article className="admin-summary-card">
          <span className="admin-summary-icon">
            <UserX size={19} />
          </span>
          <div>
            <small>Inactive customers</small>
            <strong>{inactiveCount}</strong>
          </div>
        </article>
      </div>

      {success && (
        <div className="customer-alert customer-alert-success">{success}</div>
      )}

      {actionError && !modalOpen && (
        <div className="customer-alert customer-alert-error">{actionError}</div>
      )}

      <article className="panel-card admin-table-card">
        <div className="panel-card-header admin-table-heading">
          <div>
            <h3>Customer directory</h3>
            <p>All registered customer accounts</p>
          </div>

          <div className="customer-toolbar">
            <label className="admin-search">
              <Search size={16} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search name, email or ID"
              />
            </label>

            <button
              className="customer-icon-btn"
              onClick={loadCustomers}
              title="Refresh customers"
              disabled={loading}
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {error ? (
          <PageState
            type="error"
            title="Unable to load customers"
            message={error}
          />
        ) : loading ? (
          <PageState type="loading" title="Loading customers" />
        ) : (
          <div className="table-wrap">
            <table className="data-table customer-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Tickets</th>
                  <th>Status</th>
                  <th>Account ID</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                    <tr key={customer.id}>
                      <td>
                        <div className="table-person">
                          <span className="mini-avatar">
                            {(customer.name || "C").charAt(0).toUpperCase()}
                          </span>
                          <strong>{customer.name || "Unnamed customer"}</strong>
                        </div>
                      </td>

                      <td>
                        <span className="customer-email">
                          <Mail size={14} />
                          {customer.email}
                        </span>
                      </td>

                      <td>
                        <span className="customer-ticket-count">
                          <Ticket size={14} />
                          {customer.ticket_count ?? 0}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`customer-status ${
                            customer.is_active ? "is-active" : "is-inactive"
                          }`}
                        >
                          {customer.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td>#{customer.id}</td>

                      <td>
                        <div className="customer-actions">
                          <button
                            className="customer-action-btn"
                            onClick={() => openEditModal(customer)}
                            title="Edit customer"
                          >
                            <Pencil size={15} />
                          </button>

                          <button
                            className={`customer-action-btn ${
                              customer.is_active
                                ? "customer-deactivate-btn"
                                : "customer-activate-btn"
                            }`}
                            onClick={() => handleStatusChange(customer)}
                            title={
                              customer.is_active
                                ? "Deactivate account"
                                : "Activate account"
                            }
                          >
                            {customer.is_active ? (
                              <UserX size={15} />
                            ) : (
                              <UserCheck size={15} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="table-feedback">
                      {query
                        ? "No customers match your search."
                        : "No customer accounts found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </article>

      {modalOpen && (
        <div
          className="customer-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <section
            className="customer-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="customer-modal-title"
          >
            <div className="customer-modal-header">
              <div>
                <span className="page-kicker">
                  {editingCustomer ? "CUSTOMER DETAILS" : "NEW ACCOUNT"}
                </span>
                <h3 id="customer-modal-title">
                  {editingCustomer ? "Edit customer" : "Add customer"}
                </h3>
                <p>
                  {editingCustomer
                    ? "Update this customer's account information."
                    : "Create a new customer account in SupportSphere."}
                </p>
              </div>

              <button
                className="customer-icon-btn"
                onClick={closeModal}
                disabled={saving}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="customer-form">
              {actionError && (
                <div className="customer-alert customer-alert-error">
                  {actionError}
                </div>
              )}

              <label>
                Customer name
                <input
                  name="name"
                  value={form.name}
                  onChange={handleFormChange}
                  placeholder="Enter full name"
                  required
                />
              </label>

              <label>
                Email address
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleFormChange}
                  placeholder="customer@example.com"
                  required
                />
              </label>

              {!editingCustomer && (
                <label>
                  Temporary password
                  <input
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleFormChange}
                    placeholder="At least 8 characters"
                    minLength={8}
                    required
                  />
                </label>
              )}

              {editingCustomer && (
                <p className="customer-form-note">
                  Password is not changed when editing customer details.
                </p>
              )}

              <div className="customer-modal-footer">
                <button
                  type="button"
                  className="customer-secondary-btn"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="customer-primary-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingCustomer
                      ? "Save changes"
                      : "Create customer"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}

export default CustomersPage;
