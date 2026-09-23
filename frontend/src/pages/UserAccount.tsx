import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { notification } from "antd";
import {
  User,
  Heart,
  Calendar,
  Clock,
  ShieldCheck,
  LogOut,
  Edit2,
  Check,
  Building,
  Mail,
  Phone,
  ArrowRight,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import PropertyCard from "@/components/PropertyCard";
import { useIsMobile } from "../hooks/useBreakpoint";

export default function UserAccount() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [savedProperties, setSavedProperties] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"profile" | "saved" | "appointments" | "messages">("saved");

  useEffect(() => {
    const stored = localStorage.getItem("torra_user");
    if (!stored) {
      navigate("/login");
      return;
    }
    const parsed = JSON.parse(stored);
    setUser(parsed);
    setFormData({ name: parsed.name || "", email: parsed.email || "" });
    fetchUserData(parsed);
  }, [navigate]);

  const fetchUserData = async (userData: any) => {
    try {
      const headers = { Authorization: `Bearer ${userData.token}` };

      const meRes = await fetch(`/api/users/${userData.id}`, { headers }).catch(() => null);
      if (meRes?.ok) {
        const me = await meRes.json();
        setUser((prev: any) => ({ ...prev, ...me }));
      }

      const propsRes = await fetch(`/api/properties/saved?userId=${userData.id}`, { headers }).catch(() => null);
      if (propsRes?.ok) {
        const propsData = await propsRes.json();
        setSavedProperties(Array.isArray(propsData) ? propsData : []);
      }

      const apptRes = await fetch(`/api/bookings/user/${userData.id}`, { headers }).catch(() => null);
      if (apptRes?.ok) {
        const apptData = await apptRes.json();
        setAppointments(Array.isArray(apptData) ? apptData : []);
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("torra_user");
    navigate("/");
    window.location.reload();
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.token) {
      notification.warning({ message: "Session expired. Please sign in again." });
      handleLogout();
      return;
    }
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ name: formData.name, email: formData.email }),
      });

      if (res.ok) {
        const updated = await res.json();
        const updatedUser = { ...user, ...updated };
        localStorage.setItem("torra_user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        setEditing(false);
        notification.success({ message: "Profile Updated", description: "Account credentials successfully modified." });
        return;
      }

      const data = await res.json().catch(() => ({}));
      notification.error({ message: "Update Failed", description: data.error || "Could not update profile." });
    } catch (err) {
      notification.error({ message: "Network Error", description: "Please verify connection and retry." });
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 1120, margin: "80px auto", padding: "0 24px" }}>
        <div style={{ height: 160, background: "#f5f5f5", borderRadius: 16, marginBottom: 32 }} />
        <div style={{ height: 400, background: "#f5f5f5", borderRadius: 16 }} />
      </div>
    );
  }

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "January 2026";
  const isAgent = user?.role === "agent" || user?.agentId;

  return (
    <div style={{ background: "#fbfbfb", minHeight: "100vh" }}>
      {/* ── EXECUTIVE CLIENT HEADER ── */}
      <section
        style={{
          background: "#0f172a",
          color: "#ffffff",
          padding: isMobile ? "36px 16px 48px" : "56px 32px 64px",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              alignItems: isMobile ? "flex-start" : "center",
              justifyContent: "space-between",
              flexDirection: isMobile ? "column" : "row",
              gap: 20,
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    color: "#b40101",
                  }}
                >
                  {isAgent ? "Licensed Broker Portal" : user?.role === "admin" ? "Administrator" : "Private Client Member"}
                </span>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>· Member since {memberSince}</span>
              </div>

              <h1
                style={{
                  fontFamily: '"DM Serif Display", Georgia, serif',
                  fontSize: isMobile ? 32 : 44,
                  fontWeight: 400,
                  margin: 0,
                  color: "#ffffff",
                  lineHeight: 1.1,
                }}
              >
                {user?.name || "Client Account"}
              </h1>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, margin: "6px 0 0" }}>
                {user?.email}
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              {isAgent && (
                <Link
                  to="/command"
                  style={{
                    height: 40,
                    padding: "0 18px",
                    background: "#b40101",
                    color: "#fff",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 700,
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span>Command Center</span>
                  <ArrowRight size={14} />
                </Link>
              )}
              {user?.role === "admin" && (
                <Link
                  to="/admin"
                  style={{
                    height: 40,
                    padding: "0 18px",
                    background: "#b40101",
                    color: "#fff",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 700,
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span>Admin Dashboard</span>
                  <ArrowRight size={14} />
                </Link>
              )}
              <button
                onClick={handleLogout}
                style={{
                  height: 40,
                  padding: "0 16px",
                  background: "rgba(255,255,255,0.1)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── NAVIGATION TABS & DASHBOARD BODY ── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "24px 16px 80px" : "36px 32px 96px" }}>
        {/* Tab Controls */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            borderBottom: "1px solid #e5e5e5",
            marginBottom: 36,
            overflowX: "auto",
          }}
        >
          {[
            { id: "saved", label: `Saved Residences (${savedProperties.length})`, icon: <Heart size={16} /> },
            { id: "appointments", label: `Showing Appointments (${appointments.length})`, icon: <Calendar size={16} /> },
            { id: "profile", label: "Profile & Credentials", icon: <User size={16} /> },
          ].map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  height: 46,
                  padding: "0 18px",
                  background: "none",
                  border: "none",
                  borderBottom: active ? "2px solid #b40101" : "2px solid transparent",
                  color: active ? "#b40101" : "#555",
                  fontSize: 14,
                  fontWeight: active ? 700 : 500,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  whiteSpace: "nowrap",
                  transition: "all 0.15s",
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── TAB 1: SAVED RESIDENCES ── */}
        {activeTab === "saved" && (
          <div>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 24 }}>
              <h2 style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: 26, margin: 0, fontWeight: 400 }}>
                Curated Private Collection
              </h2>
              <Link
                to="/properties"
                style={{
                  color: "#b40101",
                  fontSize: 13,
                  fontWeight: 700,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <span>Explore More Listings</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {savedProperties.length > 0 ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
                  gap: 28,
                }}
              >
                {savedProperties.map((p) => (
                  <PropertyCard key={p.id} property={p} />
                ))}
              </div>
            ) : (
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
                <Heart size={36} color="#aaa" style={{ margin: "0 auto 16px" }} />
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 8px" }}>No Saved Residences</h3>
                <p style={{ color: "#666", fontSize: 14, margin: "0 0 24px" }}>
                  When exploring listings, tap the heart icon to curate residences into your portfolio.
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
                  Discover Residences
                </Link>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: SHOWING APPOINTMENTS ── */}
        {activeTab === "appointments" && (
          <div>
            <h2 style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: 26, margin: "0 0 24px", fontWeight: 400 }}>
              Scheduled Private Showings
            </h2>

            {appointments.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {appointments.map((appt) => (
                  <div
                    key={appt.id}
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
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 10,
                          background: "#fff1f0",
                          color: "#b40101",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Calendar size={22} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px", color: "#111" }}>
                          {appt.serviceType ? `${appt.serviceType[0].toUpperCase()}${appt.serviceType.slice(1)}` : "Private Showing"}
                        </h4>
                        <div style={{ display: "flex", gap: 14, fontSize: 13, color: "#666" }}>
                          <span>
                            Date: {appt.requestedDate ? new Date(appt.requestedDate).toLocaleDateString() : "Pending Confirmation"}
                          </span>
                          {appt.requestedTime && <span>· Time: {appt.requestedTime}</span>}
                        </div>
                      </div>
                    </div>

                    <span
                      style={{
                        padding: "6px 14px",
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        background: appt.status === "confirmed" ? "#dcfce7" : "#fef3c7",
                        color: appt.status === "confirmed" ? "#166534" : "#92400e",
                      }}
                    >
                      {appt.status || "Pending Review"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
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
                <Calendar size={36} color="#aaa" style={{ margin: "0 auto 16px" }} />
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 8px" }}>No Booked Showings</h3>
                <p style={{ color: "#666", fontSize: 14, margin: "0 0 24px" }}>
                  Connect with a certified specialist to book private in-person or virtual walkthroughs.
                </p>
                <Link
                  to="/agents"
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
                  Find Listing Specialist
                </Link>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: PROFILE & CREDENTIALS ── */}
        {activeTab === "profile" && (
          <div style={{ maxWidth: 640 }}>
            <div
              style={{
                background: "#ffffff",
                borderRadius: 16,
                border: "1px solid #ebebeb",
                padding: isMobile ? "24px 20px" : "36px 36px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.02)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "#111" }}>Account Information</h3>
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    style={{
                      border: "none",
                      background: "none",
                      color: "#b40101",
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Edit2 size={13} />
                    <span>Edit</span>
                  </button>
                )}
              </div>

              {editing ? (
                <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#555", marginBottom: 4 }}>
                      Legal Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      style={{ width: "100%", height: 42, padding: "0 12px", borderRadius: 6, border: "1px solid #d5d5d5", fontSize: 14, outline: "none" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#555", marginBottom: 4 }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      style={{ width: "100%", height: 42, padding: "0 12px", borderRadius: 6, border: "1px solid #d5d5d5", fontSize: 14, outline: "none" }}
                    />
                  </div>

                  <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      style={{ height: 42, padding: "0 18px", borderRadius: 6, border: "1px solid #d5d5d5", background: "#fff", color: "#333", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{ height: 42, padding: "0 22px", borderRadius: 6, border: "none", background: "#b40101", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#888", display: "block", marginBottom: 2 }}>
                      Full Name
                    </span>
                    <span style={{ fontSize: 16, fontWeight: 600, color: "#111" }}>{user?.name || "Not specified"}</span>
                  </div>

                  <div>
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#888", display: "block", marginBottom: 2 }}>
                      Email Address
                    </span>
                    <span style={{ fontSize: 16, fontWeight: 600, color: "#111" }}>{user?.email}</span>
                  </div>

                  <div>
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#888", display: "block", marginBottom: 2 }}>
                      Account Identifier
                    </span>
                    <span style={{ fontSize: 13, fontFamily: "monospace", color: "#666" }}>{user?.id || "—"}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
