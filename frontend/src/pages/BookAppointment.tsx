import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Mail,
  Phone,
  MessageSquare,
  CheckCircle,
  ArrowLeft,
  ShieldCheck,
  Building,
  Check
} from "lucide-react";
import { notification } from "antd";
import { useIsMobile } from "../hooks/useBreakpoint";

interface Agent {
  id: string;
  name: string;
  imageUrl: string;
  brokerage: string;
  phone: string;
  email: string;
}

interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

export default function BookAppointment() {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [agent, setAgent] = useState<Agent | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    leadName: "",
    leadEmail: "",
    leadPhone: "",
    message: "",
    serviceType: "showing",
  });

  useEffect(() => {
    if (agentId) {
      fetchAgent();
    }
  }, [agentId]);

  useEffect(() => {
    if (selectedDate && agentId) {
      fetchAvailableSlots();
    }
  }, [selectedDate, agentId]);

  const fetchAgent = async () => {
    try {
      const response = await fetch(`/api/agents/${agentId}`);
      if (response.ok) {
        const data = await response.json();
        setAgent(data);
      }
    } catch (error) {
      console.error("Error fetching agent:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      const response = await fetch(
        `/api/calendar/availability/${agentId}/slots?date=${selectedDate}&duration=60`
      );
      if (response.ok) {
        const data = await response.json();
        setAvailableSlots(data.slots || []);
      }
    } catch (error) {
      console.error("Error fetching available slots:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.leadName || formData.leadName.trim().length < 2) {
      notification.error({ message: "Incomplete Field", description: "Please enter your full legal name." });
      return;
    }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.leadEmail);
    if (!emailOk) {
      notification.error({ message: "Invalid Email", description: "Please enter a valid email address." });
      return;
    }
    if (!selectedSlot) {
      notification.error({ message: "Time Required", description: "Please select an available appointment time slot." });
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/calendar/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId,
          leadName: formData.leadName.trim(),
          leadEmail: formData.leadEmail.trim(),
          leadPhone: formData.leadPhone,
          requestedDate: selectedDate,
          requestedTime: new Date(selectedSlot.startTime).toTimeString().slice(0, 5),
          duration: 60,
          message: formData.message,
          serviceType: formData.serviceType,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      });

      if (response.ok) {
        setSuccess(true);
      } else {
        const err = await response.json().catch(() => ({}));
        notification.error({ message: "Booking Conflict", description: err.error || "Failed to reserve slot." });
      }
    } catch (error) {
      notification.error({ message: "Network Error", description: "Failed to schedule appointment." });
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 60);
    return maxDate.toISOString().split("T")[0];
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 800, margin: "80px auto", padding: "0 24px" }}>
        <div style={{ height: 180, background: "#f5f5f5", borderRadius: 12, marginBottom: 24 }} />
        <div style={{ height: 380, background: "#f5f5f5", borderRadius: 12 }} />
      </div>
    );
  }

  if (!agent) {
    return (
      <div style={{ padding: "120px 24px", textAlign: "center", maxWidth: 440, margin: "0 auto" }}>
        <h2 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 32, marginBottom: 12 }}>Specialist Unavailable</h2>
        <p style={{ color: "#666", marginBottom: 24 }}>The selected advisor calendar is currently offline.</p>
        <Link
          to="/agents"
          style={{
            padding: "10px 20px",
            background: "#111",
            color: "#fff",
            borderRadius: 8,
            textDecoration: "none",
            fontWeight: 700,
          }}
        >
          View All Specialists
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{ background: "#fbfbfb", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div
          style={{
            background: "#ffffff",
            borderRadius: 16,
            maxWidth: 520,
            width: "100%",
            padding: "48px 36px",
            textAlign: "center",
            boxShadow: "0 20px 40px rgba(0,0,0,0.06)",
            border: "1px solid #eee",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "#dcfce7",
              color: "#166534",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            <CheckCircle size={28} />
          </div>

          <h2 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 32, fontWeight: 400, margin: "0 0 12px", color: "#111" }}>
            Showing Requested
          </h2>
          <p style={{ color: "#555", fontSize: 15, lineHeight: 1.6, margin: "0 0 32px" }}>
            {agent.name} has received your reservation request for {selectedDate}. A formal confirmation and digital calendar link has been sent to <strong>{formData.leadEmail}</strong>.
          </p>

          <Link
            to={`/agents/${agent.id}`}
            style={{
              display: "inline-block",
              height: 46,
              lineHeight: "46px",
              padding: "0 28px",
              background: "#111",
              color: "#fff",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Return to Specialist Profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#fbfbfb", minHeight: "100vh", padding: isMobile ? "24px 16px 80px" : "48px 32px 96px" }}>
      <div style={{ maxWidth: 840, margin: "0 auto" }}>
        {/* Back Link */}
        <Link
          to={`/agents/${agent.id}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            color: "#666",
            fontSize: 13,
            fontWeight: 600,
            textDecoration: "none",
            marginBottom: 24,
          }}
        >
          <ArrowLeft size={15} />
          <span>Back to {agent.name}</span>
        </Link>

        {/* Advisor Showcase Card */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: 16,
            border: "1px solid #ebebeb",
            padding: "24px 28px",
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginBottom: 32,
            boxShadow: "0 4px 16px rgba(0,0,0,0.02)",
          }}
        >
          <img
            src={agent.imageUrl || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80"}
            alt={agent.name}
            style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover" }}
          />
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: "#111" }}>{agent.name}</h2>
              <ShieldCheck size={16} color="#166534" />
            </div>
            <p style={{ fontSize: 13, color: "#666", margin: "0 0 6px" }}>
              {agent.brokerage || "Torra Commercial & Luxury Real Estate"}
            </p>
            <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#444" }}>
              {agent.phone && <span>Tel: {agent.phone}</span>}
              {agent.email && <span>{agent.email}</span>}
            </div>
          </div>
        </div>

        {/* Appointment Reservation Suite */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: 16,
            border: "1px solid #ebebeb",
            padding: isMobile ? "28px 20px" : "36px 36px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
          }}
        >
          <h1
            style={{
              fontFamily: '"DM Serif Display", Georgia, serif',
              fontSize: isMobile ? 26 : 34,
              fontWeight: 400,
              color: "#111",
              margin: "0 0 8px",
            }}
          >
            Schedule Private Appointment
          </h1>
          <p style={{ color: "#666", fontSize: 14, margin: "0 0 32px" }}>
            Select your consultation requirements and choose a verified availability window.
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Step 1: Appointment Category */}
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#444", marginBottom: 8 }}>
                Consultation Type
              </label>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 10 }}>
                {[
                  { id: "showing", label: "Property Showing" },
                  { id: "consultation", label: "Private Advisory" },
                  { id: "appraisal", label: "Home Valuation" },
                  { id: "inspection", label: "Commercial Review" },
                ].map((t) => {
                  const active = formData.serviceType === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, serviceType: t.id })}
                      style={{
                        height: 44,
                        padding: "0 12px",
                        borderRadius: 8,
                        border: active ? "1.5px solid #111" : "1px solid #d5d5d5",
                        background: active ? "#111" : "#fff",
                        color: active ? "#fff" : "#333",
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.12s",
                      }}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Date Selector */}
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#444", marginBottom: 8 }}>
                Select Desired Date *
              </label>
              <input
                type="date"
                required
                min={getMinDate()}
                max={getMaxDate()}
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedSlot(null);
                }}
                style={{
                  width: "100%",
                  height: 46,
                  padding: "0 16px",
                  borderRadius: 8,
                  border: "1px solid #d0d0d0",
                  fontSize: 14,
                  fontWeight: 600,
                  outline: "none",
                }}
              />
            </div>

            {/* Step 3: Available Time Slots */}
            {selectedDate && (
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#444", marginBottom: 8 }}>
                  Available Time Windows *
                </label>
                {availableSlots.length > 0 ? (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
                      gap: 10,
                    }}
                  >
                    {availableSlots.map((slot, index) => {
                      const active = selectedSlot === slot;
                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          style={{
                            height: 42,
                            borderRadius: 8,
                            border: active ? "1.5px solid #b40101" : "1px solid #d5d5d5",
                            background: active ? "#fff5f5" : "#fff",
                            color: active ? "#b40101" : "#111",
                            fontSize: 13,
                            fontWeight: 700,
                            cursor: "pointer",
                            transition: "all 0.12s",
                          }}
                        >
                          {formatTime(slot.startTime)}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ padding: "16px", background: "#fafafa", borderRadius: 8, fontSize: 13, color: "#666" }}>
                    No available public slots on this date. Select another date or contact advisor directly.
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Contact Info */}
            <div style={{ borderTop: "1px solid #eee", paddingTop: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Your Contact Details</h3>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#555", marginBottom: 4 }}>
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={formData.leadName}
                    onChange={(e) => setFormData({ ...formData, leadName: e.target.value })}
                    style={{ width: "100%", height: 42, padding: "0 12px", borderRadius: 6, border: "1px solid #d0d0d0", fontSize: 14, outline: "none" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#555", marginBottom: 4 }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="john@example.com"
                    value={formData.leadEmail}
                    onChange={(e) => setFormData({ ...formData, leadEmail: e.target.value })}
                    style={{ width: "100%", height: 42, padding: "0 12px", borderRadius: 6, border: "1px solid #d0d0d0", fontSize: 14, outline: "none" }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#555", marginBottom: 4 }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="(469) 000-0000"
                  value={formData.leadPhone}
                  onChange={(e) => setFormData({ ...formData, leadPhone: e.target.value })}
                  style={{ width: "100%", height: 42, padding: "0 12px", borderRadius: 6, border: "1px solid #d0d0d0", fontSize: 14, outline: "none" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#555", marginBottom: 4 }}>
                  Inquiry Notes / Specific Property (Optional)
                </label>
                <textarea
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Specify property address or confidential investment requirements..."
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 6, border: "1px solid #d0d0d0", fontSize: 14, outline: "none" }}
                />
              </div>
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={submitting || (selectedDate && !selectedSlot)}
              style={{
                height: 50,
                background: "#b40101",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 700,
                cursor: submitting ? "not-allowed" : "pointer",
                opacity: submitting || (selectedDate && !selectedSlot) ? 0.7 : 1,
                transition: "background 0.15s",
              }}
            >
              {submitting ? "Confirming Reservation..." : "Confirm Showing Reservation"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
