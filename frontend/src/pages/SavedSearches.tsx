import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { notification } from "antd";
import {
  Bookmark,
  Bell,
  BellOff,
  Trash2,
  Play,
  ArrowRight,
  SlidersHorizontal,
  Clock,
  Search,
  Check
} from "lucide-react";
import { useIsMobile } from "../hooks/useBreakpoint";

interface SavedSearch {
  id: string;
  name: string;
  filters: any;
  emailAlerts: boolean;
  frequency: string;
  isActive: boolean;
  lastRun?: string;
  unreadAlerts: number;
  totalAlerts: number;
  createdAt: string;
}

export default function SavedSearches() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningSearch, setRunningSearch] = useState<string | null>(null);

  useEffect(() => {
    fetchSavedSearches();
  }, []);

  const fetchSavedSearches = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/saved-searches");
      const data = await response.json();
      if (response.ok) {
        setSavedSearches(data.savedSearches || []);
      }
    } catch (error) {
      console.error("Fetch saved searches error:", error);
    } finally {
      setLoading(false);
    }
  };

  const runSavedSearch = async (searchId: string, searchName: string) => {
    try {
      setRunningSearch(searchId);
      const response = await fetch(`/api/saved-searches/${searchId}/run`, { method: "POST" });
      const data = await response.json();
      if (response.ok) {
        notification.success({
          message: "Search Complete",
          description: `Identified ${data.count} properties matching "${searchName}".`,
        });
        navigate("/properties");
      }
    } catch (error) {
      notification.error({ message: "Search Error", description: "Failed to run saved criteria." });
    } finally {
      setRunningSearch(null);
    }
  };

  const toggleEmailAlerts = async (searchId: string, currentValue: boolean) => {
    try {
      const response = await fetch(`/api/saved-searches/${searchId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailAlerts: !currentValue }),
      });

      if (response.ok) {
        setSavedSearches((prev) =>
          prev.map((s) => (s.id === searchId ? { ...s, emailAlerts: !currentValue } : s))
        );
        notification.success({
          message: "Alerts Updated",
          description: `Notifications ${!currentValue ? "enabled" : "disabled"}.`,
        });
      }
    } catch (error) {
      notification.error({ message: "Error", description: "Could not update alert settings." });
    }
  };

  const deleteSearch = async (searchId: string) => {
    if (!window.confirm("Are you sure you want to remove this saved search criteria?")) return;
    try {
      const response = await fetch(`/api/saved-searches/${searchId}`, { method: "DELETE" });
      if (response.ok) {
        setSavedSearches((prev) => prev.filter((s) => s.id !== searchId));
        notification.success({ message: "Search Removed", description: "Saved criteria deleted." });
      }
    } catch (error) {
      notification.error({ message: "Error", description: "Failed to delete saved search." });
    }
  };

  return (
    <div style={{ background: "#fbfbfb", minHeight: "100vh" }}>
      {/* ── HEADER ── */}
      <section
        style={{
          background: "#ffffff",
          borderBottom: "1px solid #ebebeb",
          padding: isMobile ? "36px 16px 28px" : "56px 32px 40px",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              marginBottom: 14,
              borderLeft: "3px solid #b40101",
              paddingLeft: 12,
            }}
          >
            <span
              style={{
                color: "#666",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              Client Intelligence &amp; Alerts
            </span>
          </div>

          <h1
            style={{
              fontFamily: '"DM Serif Display", Georgia, serif',
              fontSize: isMobile ? 32 : 48,
              fontWeight: 400,
              color: "#111",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              margin: "0 0 12px",
            }}
          >
            Saved Searches &amp; Alerts
          </h1>

          <p style={{ color: "#666", fontSize: 16, margin: 0, maxWidth: 600 }}>
            Manage your tailored real estate search filters, new listing notification frequencies, and boundary alerts.
          </p>
        </div>
      </section>

      {/* ── SEARCHES LIST ── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "32px 16px 80px" : "48px 32px 96px" }}>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ height: 120, background: "#f0f0f0", borderRadius: 12 }} />
            ))}
          </div>
        ) : savedSearches.length === 0 ? (
          <div
            style={{
              padding: "80px 24px",
              background: "#ffffff",
              borderRadius: 16,
              border: "1px solid #ebebeb",
              textAlign: "center",
              maxWidth: 480,
              margin: "0 auto",
            }}
          >
            <Bookmark size={40} color="#999" style={{ margin: "0 auto 16px" }} />
            <h3 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 24, margin: "0 0 8px" }}>
              No Saved Searches
            </h3>
            <p style={{ color: "#666", fontSize: 14, margin: "0 0 24px" }}>
              Filter by location, price, and architecture on our search page, then tap "Save" to receive instant alerts when matching residences list.
            </p>
            <Link
              to="/properties"
              style={{
                display: "inline-block",
                height: 42,
                lineHeight: "42px",
                padding: "0 24px",
                background: "#111",
                color: "#fff",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Explore Properties
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {savedSearches.map((s) => (
              <div
                key={s.id}
                style={{
                  background: "#ffffff",
                  borderRadius: 12,
                  border: "1px solid #ebebeb",
                  padding: "20px 24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 16,
                  transition: "box-shadow 0.2s",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "#111" }}>{s.name}</h3>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        padding: "2px 8px",
                        borderRadius: 4,
                        background: s.emailAlerts ? "#dcfce7" : "#f5f5f5",
                        color: s.emailAlerts ? "#166534" : "#777",
                      }}
                    >
                      {s.emailAlerts ? `Alerts: ${s.frequency || "Daily"}` : "Alerts Muted"}
                    </span>
                  </div>

                  {/* Filter chips */}
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", fontSize: 12, color: "#555" }}>
                    {s.filters?.minPrice && <span>Min: ${s.filters.minPrice.toLocaleString()} ·</span>}
                    {s.filters?.maxPrice && <span>Max: ${s.filters.maxPrice.toLocaleString()} ·</span>}
                    {s.filters?.beds && <span>{s.filters.beds}+ Beds ·</span>}
                    {s.filters?.propertyType && <span>{s.filters.propertyType}</span>}
                    {!s.filters?.minPrice && !s.filters?.maxPrice && !s.filters?.beds && <span>All active criteria</span>}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button
                    onClick={() => toggleEmailAlerts(s.id, s.emailAlerts)}
                    style={{
                      height: 36,
                      padding: "0 12px",
                      borderRadius: 6,
                      border: "1px solid #d5d5d5",
                      background: "#fff",
                      color: "#333",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    {s.emailAlerts ? <BellOff size={14} /> : <Bell size={14} />}
                    <span>{s.emailAlerts ? "Mute" : "Enable Alerts"}</span>
                  </button>

                  <button
                    onClick={() => runSavedSearch(s.id, s.name)}
                    disabled={runningSearch === s.id}
                    style={{
                      height: 36,
                      padding: "0 14px",
                      borderRadius: 6,
                      border: "none",
                      background: "#b40101",
                      color: "#fff",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: runningSearch === s.id ? "not-allowed" : "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Play size={13} />
                    <span>Run Search</span>
                  </button>

                  <button
                    onClick={() => deleteSearch(s.id)}
                    style={{
                      height: 36,
                      width: 36,
                      borderRadius: 6,
                      border: "1px solid #eee",
                      background: "#fff",
                      color: "#777",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}