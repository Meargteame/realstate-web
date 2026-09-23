import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  X,
  Check,
  ChevronDown,
  Sparkles,
  ArrowRight,
  Bed,
  Bath,
  Maximize2
} from "lucide-react";
import { useIsMobile } from "../hooks/useBreakpoint";

interface OpenHouse {
  id: string;
  startTime: string;
  endTime: string;
  description?: string;
  property: {
    id: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    price: number;
    beds: number;
    baths: number;
    sqft: number;
    imageUrl: string;
    propertyType: string;
  };
  agent: {
    id: string;
    name: string;
    phone: string;
    email: string;
    imageUrl: string;
    brokerage: string;
  };
  _count: {
    rsvps: number;
  };
}

interface RSVPForm {
  name: string;
  email: string;
  phone: string;
  guests: number;
  message: string;
}

export default function OpenHouses() {
  const [openHouses, setOpenHouses] = useState<OpenHouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [showRSVPModal, setShowRSVPModal] = useState(false);
  const [selectedOpenHouse, setSelectedOpenHouse] = useState<OpenHouse | null>(null);
  const [rsvpForm, setRSVPForm] = useState<RSVPForm>({
    name: "",
    email: "",
    phone: "",
    guests: 1,
    message: "",
  });
  const [rsvpLoading, setRSVPLoading] = useState(false);
  const [rsvpFeedback, setRsvpFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchOpenHouses();
  }, [selectedCity, selectedDate]);

  const fetchOpenHouses = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCity) params.append("city", selectedCity);
      if (selectedDate) params.append("date", selectedDate);

      const response = await fetch(`/api/open-houses?${params}`);
      const data = await response.json();
      setOpenHouses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching open houses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRSVP = (openHouse: OpenHouse) => {
    setSelectedOpenHouse(openHouse);
    setRsvpFeedback(null);
    setShowRSVPModal(true);
  };

  const submitRSVP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOpenHouse) return;

    setRSVPLoading(true);
    try {
      const response = await fetch(`/api/open-houses/${selectedOpenHouse.id}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rsvpForm),
      });

      if (response.ok) {
        setRsvpFeedback({
          type: "success",
          message: "Your attendance is confirmed. A calendar invitation has been sent to your email.",
        });
        setRSVPForm({ name: "", email: "", phone: "", guests: 1, message: "" });
        fetchOpenHouses();
      } else {
        const error = await response.json();
        setRsvpFeedback({ type: "error", message: error.error || "Failed to confirm RSVP" });
      }
    } catch (error) {
      setRsvpFeedback({ type: "error", message: "Network error submitting RSVP" });
    } finally {
      setRSVPLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const cities = [...new Set(openHouses.map((oh) => oh.property?.city).filter(Boolean))];

  return (
    <div style={{ background: "#fbfbfb", minHeight: "100vh" }}>
      {/* ── EDITORIAL HEADER ── */}
      <section
        style={{
          background: "#ffffff",
          borderBottom: "1px solid #eaeaea",
          padding: isMobile ? "36px 16px 28px" : "56px 32px 40px",
        }}
      >
        <div style={{ maxWidth: 1320, margin: "0 auto" }}>
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
              Private &amp; Public Showings
            </span>
          </div>

          <h1
            style={{
              fontFamily: '"DM Serif Display", Georgia, serif',
              fontSize: isMobile ? 32 : 52,
              fontWeight: 400,
              color: "#111",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              margin: "0 0 12px",
            }}
          >
            Curated Open House Showings
          </h1>

          <p style={{ color: "#666", fontSize: 16, margin: 0, maxWidth: 640 }}>
            Experience Texas' most prestigious properties in person. RSVP for a scheduled open house or connect with a dedicated listing specialist.
          </p>

          {/* Quick Filters */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
              marginTop: 28,
            }}
          >
            {/* City Filter */}
            <div style={{ position: "relative" }}>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                style={{
                  height: 40,
                  padding: "0 32px 0 14px",
                  borderRadius: 20,
                  border: "1px solid #d5d5d5",
                  background: selectedCity ? "#111" : "#fff",
                  color: selectedCity ? "#fff" : "#111",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  appearance: "none",
                  outline: "none",
                }}
              >
                <option value="" style={{ color: "#111", background: "#fff" }}>All Cities</option>
                {cities.map((c) => (
                  <option key={c} value={c} style={{ color: "#111", background: "#fff" }}>
                    {c}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                  color: selectedCity ? "#fff" : "#666",
                }}
              />
            </div>

            {/* Date Input */}
            <div>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                style={{
                  height: 40,
                  padding: "0 14px",
                  borderRadius: 20,
                  border: "1px solid #d5d5d5",
                  background: selectedDate ? "#111" : "#fff",
                  color: selectedDate ? "#fff" : "#111",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  outline: "none",
                }}
              />
            </div>

            {(selectedCity || selectedDate) && (
              <button
                onClick={() => {
                  setSelectedCity("");
                  setSelectedDate("");
                }}
                style={{
                  border: "none",
                  background: "none",
                  color: "#b40101",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  padding: "6px 10px",
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── SHOWINGS FEED ── */}
      <section style={{ maxWidth: 1320, margin: "0 auto", padding: isMobile ? "32px 16px 80px" : "48px 32px 96px" }}>
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 24 }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{ height: 260, background: "#f0f0f0", borderRadius: 12 }} />
            ))}
          </div>
        ) : openHouses.length === 0 ? (
          <div style={{ padding: "80px 20px", textAlign: "center", maxWidth: 440, margin: "0 auto" }}>
            <CalendarIcon size={40} color="#999" style={{ margin: "0 auto 16px" }} />
            <h3 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 24, margin: "0 0 8px" }}>
              No Open Houses Scheduled
            </h3>
            <p style={{ color: "#666", fontSize: 14, margin: "0 0 20px" }}>
              There are currently no public showings matching your filters. You can book a private walkthrough on any listing directly.
            </p>
            <Link
              to="/properties"
              style={{
                display: "inline-flex",
                padding: "10px 20px",
                background: "#111",
                color: "#fff",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Browse All Listings
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 24 }}>
            {openHouses.map((oh) => (
              <div
                key={oh.id}
                style={{
                  background: "#ffffff",
                  borderRadius: 12,
                  border: "1px solid #ebebeb",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: isMobile ? "column" : "row",
                  transition: "box-shadow 0.2s, border-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.06)";
                  e.currentTarget.style.borderColor = "#ddd";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.borderColor = "#ebebeb";
                }}
              >
                {/* Photo with Date Badge */}
                <div
                  style={{
                    width: isMobile ? "100%" : 240,
                    height: isMobile ? 200 : "auto",
                    position: "relative",
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={oh.property.imageUrl || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"}
                    alt={oh.property.address}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    loading="lazy"
                  />
                  {/* Event Time Pill */}
                  <div
                    style={{
                      position: "absolute",
                      top: 12,
                      left: 12,
                      background: "rgba(0,0,0,0.8)",
                      color: "#fff",
                      fontSize: 10,
                      fontWeight: 800,
                      padding: "4px 8px",
                      borderRadius: 4,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    {formatDate(oh.startTime)}
                  </div>
                </div>

                {/* Details */}
                <div style={{ padding: 20, flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 4 }}>
                      <span
                        style={{
                          fontFamily: '"DM Serif Display", Georgia, serif',
                          fontSize: 22,
                          fontWeight: 400,
                          color: "#111",
                        }}
                      >
                        {formatPrice(oh.property.price)}
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase" }}>
                        {oh.property.propertyType || "Residence"}
                      </span>
                    </div>

                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111", margin: "0 0 2px" }}>
                      {oh.property.address}
                    </h3>
                    <p style={{ fontSize: 12, color: "#666", margin: "0 0 12px" }}>
                      {oh.property.city}, {oh.property.state}
                    </p>

                    {/* Schedule Time Box */}
                    <div
                      style={{
                        background: "#fafafa",
                        padding: "8px 12px",
                        borderRadius: 6,
                        border: "1px solid #f0f0f0",
                        fontSize: 12,
                        color: "#444",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        marginBottom: 12,
                      }}
                    >
                      <Clock size={13} color="#b40101" />
                      <span>
                        {formatTime(oh.startTime)} – {formatTime(oh.endTime)}
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: 14, fontSize: 12, color: "#555" }}>
                      <span><strong>{oh.property.beds}</strong> Beds</span>
                      <span><strong>{oh.property.baths}</strong> Baths</span>
                      <span><strong>{oh.property.sqft?.toLocaleString()}</strong> Sq Ft</span>
                    </div>
                  </div>

                  {/* Host & RSVP CTA */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginTop: 16,
                      paddingTop: 12,
                      borderTop: "1px solid #f0f0f0",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <img
                        src={oh.agent.imageUrl || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=120&q=80"}
                        alt={oh.agent.name}
                        style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover" }}
                      />
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#444" }}>{oh.agent.name}</span>
                    </div>

                    <button
                      onClick={() => handleRSVP(oh)}
                      style={{
                        height: 34,
                        padding: "0 16px",
                        background: "#b40101",
                        color: "#fff",
                        border: "none",
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#910101")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "#b40101")}
                    >
                      RSVP for Tour
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── RSVP MODAL ── */}
      {showRSVPModal && selectedOpenHouse && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: 16,
              maxWidth: 480,
              width: "100%",
              padding: "28px 24px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              position: "relative",
            }}
          >
            <button
              onClick={() => setShowRSVPModal(false)}
              style={{
                position: "absolute",
                top: 20,
                right: 20,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 4,
                color: "#666",
              }}
            >
              <X size={18} />
            </button>

            <h3 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 24, margin: "0 0 6px" }}>
              Confirm Showing Attendance
            </h3>
            <p style={{ fontSize: 13, color: "#666", margin: "0 0 16px" }}>
              {selectedOpenHouse.property.address} · {formatDate(selectedOpenHouse.startTime)} at {formatTime(selectedOpenHouse.startTime)}
            </p>

            {rsvpFeedback && (
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: 8,
                  marginBottom: 16,
                  fontSize: 13,
                  fontWeight: 600,
                  background: rsvpFeedback.type === "success" ? "#dcfce7" : "#fee2e2",
                  color: rsvpFeedback.type === "success" ? "#166534" : "#991b1b",
                }}
              >
                {rsvpFeedback.message}
              </div>
            )}

            <form onSubmit={submitRSVP} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#666", marginBottom: 4 }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={rsvpForm.name}
                  onChange={(e) => setRSVPForm({ ...rsvpForm, name: e.target.value })}
                  style={{ width: "100%", height: 42, padding: "0 12px", borderRadius: 6, border: "1px solid #d5d5d5", fontSize: 14, outline: "none" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#666", marginBottom: 4 }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={rsvpForm.email}
                  onChange={(e) => setRSVPForm({ ...rsvpForm, email: e.target.value })}
                  style={{ width: "100%", height: 42, padding: "0 12px", borderRadius: 6, border: "1px solid #d5d5d5", fontSize: 14, outline: "none" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#666", marginBottom: 4 }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={rsvpForm.phone}
                    onChange={(e) => setRSVPForm({ ...rsvpForm, phone: e.target.value })}
                    style={{ width: "100%", height: 42, padding: "0 12px", borderRadius: 6, border: "1px solid #d5d5d5", fontSize: 14, outline: "none" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#666", marginBottom: 4 }}>
                    Party Size
                  </label>
                  <select
                    value={rsvpForm.guests}
                    onChange={(e) => setRSVPForm({ ...rsvpForm, guests: parseInt(e.target.value) })}
                    style={{ width: "100%", height: 42, padding: "0 10px", borderRadius: 6, border: "1px solid #d5d5d5", fontSize: 14, outline: "none" }}
                  >
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <option key={num} value={num}>{num} Guest{num > 1 ? "s" : ""}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setShowRSVPModal(false)}
                  style={{ flex: 1, height: 44, borderRadius: 8, border: "1px solid #d5d5d5", background: "#fff", color: "#333", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rsvpLoading}
                  style={{
                    flex: 1,
                    height: 44,
                    borderRadius: 8,
                    border: "none",
                    background: "#b40101",
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: rsvpLoading ? "not-allowed" : "pointer",
                    opacity: rsvpLoading ? 0.7 : 1,
                  }}
                >
                  {rsvpLoading ? "Submitting..." : "Confirm RSVP"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}