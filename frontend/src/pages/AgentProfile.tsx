import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { notification } from "antd";
import {
  Phone,
  Mail,
  ShieldCheck,
  Award,
  Calendar,
  ArrowRight,
  Star,
  MapPin,
  ExternalLink,
  CheckCircle,
  Building
} from "lucide-react";
import PropertyCard from "@/components/PropertyCard";
import AgentReviews from "../components/AgentReviews";
import { useIsMobile } from "../hooks/useBreakpoint";

export default function AgentProfile() {
  const { id } = useParams();
  const [agent, setAgent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [submittingContact, setSubmittingContact] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    fetch(`/api/agents/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setAgent(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim()) {
      notification.error({ message: "Incomplete Inquiry", description: "Name and email are required." });
      return;
    }

    setSubmittingContact(true);
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: contactName.trim(),
          email: contactEmail.trim(),
          phone: contactPhone.trim(),
          message: contactMessage.trim() || `Inquiry regarding luxury representation with ${agent.name}`,
          agentId: agent.id,
          type: "agent_contact",
        }),
      });

      if (!response.ok) throw new Error("Submission failed");

      notification.success({
        message: "Message Dispatched",
        description: `Your inquiry has been directly forwarded to ${agent.name}.`,
      });
      setContactName("");
      setContactEmail("");
      setContactPhone("");
      setContactMessage("");
    } catch (error) {
      notification.error({ message: "Submission Error", description: "Something went wrong. Please try again." });
    } finally {
      setSubmittingContact(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "60px 24px" }}>
        <div style={{ height: 320, background: "#f5f5f5", borderRadius: 16, marginBottom: 32 }} />
        <div style={{ height: 36, width: "30%", background: "#f5f5f5", borderRadius: 6 }} />
      </div>
    );
  }

  if (!agent) {
    return (
      <div style={{ padding: "120px 24px", textAlign: "center", maxWidth: 440, margin: "0 auto" }}>
        <h2 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 32, marginBottom: 12 }}>Specialist Not Found</h2>
        <p style={{ color: "#666", marginBottom: 24 }}>This profile may be inactive or currently transitioning roster territories.</p>
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

  const agentListings = agent.properties || [];

  return (
    <div style={{ background: "#ffffff", minHeight: "100vh" }}>
      {/* ── BREADCRUMB / TOP PROFILE STRIP ── */}
      <div style={{ borderBottom: "1px solid #ebebeb", background: "#fafafa" }}>
        <div
          style={{
            maxWidth: 1320,
            margin: "0 auto",
            padding: isMobile ? "12px 16px" : "14px 32px",
            fontSize: 13,
            color: "#777",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Link to="/" style={{ color: "#777", textDecoration: "none" }}>Home</Link>
          <span>/</span>
          <Link to="/agents" style={{ color: "#777", textDecoration: "none" }}>Licensed Specialists</Link>
          <span>/</span>
          <span style={{ color: "#111", fontWeight: 600 }}>{agent.name}</span>
        </div>
      </div>

      {/* ── EXECUTIVE PROFILE HERO ── */}
      <section style={{ borderBottom: "1px solid #ebebeb", padding: isMobile ? "32px 16px" : "56px 32px" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "280px 1fr",
              gap: isMobile ? 24 : 48,
              alignItems: "start",
            }}
          >
            {/* Portrait */}
            <div
              style={{
                width: isMobile ? 180 : 280,
                height: isMobile ? 220 : 340,
                borderRadius: 16,
                overflow: "hidden",
                boxShadow: "0 12px 32px rgba(0,0,0,0.08)",
                background: "#f0f0f0",
                margin: isMobile ? "0 auto" : "0",
              }}
            >
              <img
                src={agent.imageUrl || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80"}
                alt={agent.name}
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
              />
            </div>

            {/* Profile Credentials */}
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      color: "#b40101",
                    }}
                  >
                    Senior Managing Specialist
                  </span>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#166534",
                      background: "#dcfce7",
                      padding: "2px 8px",
                      borderRadius: 12,
                    }}
                  >
                    <ShieldCheck size={13} />
                    Verified License
                  </span>
                </div>

                <h1
                  style={{
                    fontFamily: '"DM Serif Display", Georgia, serif',
                    fontSize: isMobile ? 36 : 56,
                    fontWeight: 400,
                    color: "#111",
                    lineHeight: 1.05,
                    letterSpacing: "-0.02em",
                    margin: "0 0 10px",
                  }}
                >
                  {agent.name}
                </h1>

                <p style={{ fontSize: 16, color: "#666", margin: "0 0 24px" }}>
                  {agent.brokerage || "Torra Commercial & Luxury Real Estate Group"} · {agent.location || "Texas"}
                </p>

                {/* Direct Action Bar */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 32 }}>
                  <Link
                    to={`/book-appointment/${agent.id}`}
                    style={{
                      height: 44,
                      padding: "0 22px",
                      background: "#b40101",
                      color: "#fff",
                      borderRadius: 8,
                      fontSize: 14,
                      fontWeight: 700,
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      transition: "background 0.15s",
                    }}
                  >
                    <Calendar size={16} />
                    <span>Book Private Consultation</span>
                  </Link>

                  {agent.phone && (
                    <a
                      href={`tel:${agent.phone}`}
                      style={{
                        height: 44,
                        padding: "0 18px",
                        background: "#fff",
                        color: "#111",
                        border: "1px solid #d5d5d5",
                        borderRadius: 8,
                        fontSize: 14,
                        fontWeight: 600,
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <Phone size={15} />
                      <span>{agent.phone}</span>
                    </a>
                  )}

                  {agent.email && (
                    <a
                      href={`mailto:${agent.email}`}
                      style={{
                        height: 44,
                        padding: "0 18px",
                        background: "#fff",
                        color: "#111",
                        border: "1px solid #d5d5d5",
                        borderRadius: 8,
                        fontSize: 14,
                        fontWeight: 600,
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <Mail size={15} />
                      <span>Email</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Career Milestone Ribbon */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  padding: "18px 0",
                  borderTop: "1px solid #eee",
                  gap: 16,
                }}
              >
                <div>
                  <span style={{ fontSize: 11, color: "#888", fontWeight: 700, textTransform: "uppercase" }}>Active Listings</span>
                  <span style={{ fontSize: 24, fontWeight: 800, color: "#111", display: "block" }}>{agentListings.length}</span>
                </div>
                <div>
                  <span style={{ fontSize: 11, color: "#888", fontWeight: 700, textTransform: "uppercase" }}>Years of Practice</span>
                  <span style={{ fontSize: 24, fontWeight: 800, color: "#111", display: "block" }}>{agent.yearsExperience || 12} Yrs</span>
                </div>
                <div>
                  <span style={{ fontSize: 11, color: "#888", fontWeight: 700, textTransform: "uppercase" }}>Career Sales</span>
                  <span style={{ fontSize: 24, fontWeight: 800, color: "#111", display: "block" }}>$55M+</span>
                </div>
                <div>
                  <span style={{ fontSize: 11, color: "#888", fontWeight: 700, textTransform: "uppercase" }}>Client Rating</span>
                  <span style={{ fontSize: 24, fontWeight: 800, color: "#111", display: "flex", alignItems: "center", gap: 4 }}>
                    4.9 <Star size={18} fill="#f59e0b" color="#f59e0b" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT & CONTACT PANEL ── */}
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: isMobile ? "32px 16px 80px" : "48px 32px 96px" }}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr", gap: 48, alignItems: "start" }}>
          {/* Left Column: Bio & Listings */}
          <div>
            {/* Biography */}
            <div style={{ marginBottom: 48 }}>
              <h2
                style={{
                  fontFamily: '"DM Serif Display", Georgia, serif',
                  fontSize: 28,
                  fontWeight: 400,
                  color: "#111",
                  margin: "0 0 16px",
                }}
              >
                Specialist Background
              </h2>
              <p
                style={{
                  fontSize: 16,
                  lineHeight: 1.8,
                  color: "#444",
                  margin: 0,
                  whiteSpace: "pre-line",
                }}
              >
                {agent.bio ||
                  `As an esteemed specialist with Torra Commercial Real Estate Group, ${agent.name} brings an exhaustive knowledge of Texas prime submarkets, discrete client advisory, and relentless negotiation mastery. Having navigated multi-million dollar residential acquisitions and commercial investment portfolios, ${agent.name} pairs deep quantitative market analytics with an intimate rolodex of high-net-worth buyers.`}
              </p>
            </div>

            {/* Video Walkthrough if available */}
            {agent.videoUrl && (
              <div style={{ marginBottom: 48 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 14 }}>Introduction &amp; Virtual Tour</h3>
                <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden", borderRadius: 12 }}>
                  <iframe
                    src={agent.videoUrl}
                    style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {/* Active Inventory Portfolio */}
            <div style={{ marginBottom: 56 }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 24 }}>
                <h2
                  style={{
                    fontFamily: '"DM Serif Display", Georgia, serif',
                    fontSize: 28,
                    fontWeight: 400,
                    color: "#111",
                    margin: 0,
                  }}
                >
                  Active Representations ({agentListings.length})
                </h2>
                <Link
                  to="/properties"
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#b40101",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <span>All Properties</span>
                  <ArrowRight size={13} />
                </Link>
              </div>

              {agentListings.length > 0 ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                    gap: 24,
                  }}
                >
                  {agentListings.map((prop: any) => (
                    <PropertyCard key={prop.id} property={prop} />
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    padding: "40px",
                    background: "#fafafa",
                    borderRadius: 12,
                    textAlign: "center",
                    color: "#777",
                  }}
                >
                  Currently all listings under this specialist are under contract or discrete off-market agreements.
                </div>
              )}
            </div>

            {/* Client Reviews Section */}
            <div>
              <h2
                style={{
                  fontFamily: '"DM Serif Display", Georgia, serif',
                  fontSize: 28,
                  fontWeight: 400,
                  color: "#111",
                  margin: "0 0 20px",
                }}
              >
                Client Endorsements &amp; Verified Reviews
              </h2>
              <AgentReviews agentId={agent.id} showSubmitForm={true} />
            </div>
          </div>

          {/* Right Column: Sticky Consultation Form */}
          <div style={{ position: isMobile ? "static" : "sticky", top: 120 }}>
            <div
              style={{
                background: "#ffffff",
                border: "1px solid #e5e5e5",
                borderRadius: 16,
                padding: "28px 24px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
              }}
            >
              <h3 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 6px", color: "#111" }}>
                Connect With {agent.name.split(" ")[0]}
              </h3>
              <p style={{ fontSize: 13, color: "#666", margin: "0 0 20px" }}>
                Inquire about an active listing, request off-market advisory, or schedule a confidential valuation.
              </p>

              <form onSubmit={handleContactSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#555", marginBottom: 4 }}>
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    style={{ width: "100%", height: 42, padding: "0 12px", borderRadius: 6, border: "1px solid #d5d5d5", fontSize: 14, outline: "none" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#555", marginBottom: 4 }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    style={{ width: "100%", height: 42, padding: "0 12px", borderRadius: 6, border: "1px solid #d5d5d5", fontSize: 14, outline: "none" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#555", marginBottom: 4 }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    style={{ width: "100%", height: 42, padding: "0 12px", borderRadius: 6, border: "1px solid #d5d5d5", fontSize: 14, outline: "none" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#555", marginBottom: 4 }}>
                    Message / Inquired Property
                  </label>
                  <textarea
                    rows={3}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Provide details on your acquisition criteria or listing address..."
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 6, border: "1px solid #d5d5d5", fontSize: 14, outline: "none" }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingContact}
                  style={{
                    height: 46,
                    marginTop: 6,
                    background: "#b40101",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: submittingContact ? "not-allowed" : "pointer",
                    opacity: submittingContact ? 0.7 : 1,
                    transition: "background 0.15s",
                  }}
                >
                  {submittingContact ? "Sending..." : "Submit Confidential Inquiry"}
                </button>
              </form>

              <div style={{ borderTop: "1px solid #f0f0f0", marginTop: 20, paddingTop: 16 }}>
                <Link
                  to={`/book-appointment/${agent.id}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    width: "100%",
                    height: 42,
                    background: "#fafafa",
                    border: "1px solid #e0e0e0",
                    borderRadius: 8,
                    color: "#111",
                    fontSize: 13,
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  <Calendar size={15} />
                  <span>Schedule Virtual / In-Person Showing</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
