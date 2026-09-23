import React, { useState } from "react";
import { Link } from "react-router-dom";
import { notification } from "antd";
import {
  MapPin,
  CheckCircle,
  TrendingUp,
  ShieldCheck,
  User,
  Mail,
  Phone,
  ArrowRight,
  ArrowLeft,
  Building,
  Sparkles,
  Lock
} from "lucide-react";
import { useIsMobile } from "../hooks/useBreakpoint";

export default function HomeValue() {
  const isMobile = useIsMobile();
  const [step, setStep] = useState(0);
  const [address, setAddress] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [timeline, setTimeline] = useState("3_months");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (address.trim()) setStep(1);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      notification.error({ message: "Incomplete Details", description: "Name and email are required to receive your valuation." });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          message: `Home Valuation Request for: ${address.trim()} · Target Horizon: ${timeline}`,
          type: "valuation_request",
          source: "home_value_tool",
        }),
      });

      if (!response.ok) throw new Error("Submission failed");
      setSubmitted(true);
    } catch (error) {
      notification.error({
        message: "Submission Error",
        description: "Something went wrong while connecting with advisory services.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ background: "#ffffff", minHeight: "100vh" }}>
      {/* ── EDITORIAL HERO ── */}
      <section
        style={{
          background: "#0f172a",
          color: "#ffffff",
          padding: isMobile ? "64px 20px 80px" : "96px 48px 112px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: 'url("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80")',
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.14,
          }}
        />

        <div style={{ maxWidth: 840, margin: "0 auto", position: "relative", zIndex: 10, textAlign: "center" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              marginBottom: 18,
              borderLeft: "3px solid #b40101",
              paddingLeft: 12,
            }}
          >
            <span
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              Seller Advisory &amp; Portfolio Assessment
            </span>
          </div>

          <h1
            style={{
              fontFamily: '"DM Serif Display", Georgia, serif',
              fontSize: isMobile ? 36 : 60,
              fontWeight: 400,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              margin: "0 0 16px",
            }}
          >
            Understand the True Worth of Your Residence.
          </h1>

          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 18, lineHeight: 1.6, margin: "0 auto 36px", maxWidth: 620 }}>
            Receive a discrete, data-backed comparative market analysis prepared directly by a certified Torra managing specialist. Zero automated algorithm guesswork.
          </p>
        </div>
      </section>

      {/* ── VALUE PROPOSITION STRIP ── */}
      <section style={{ borderBottom: "1px solid #ebebeb", background: "#fafafa" }}>
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "24px 32px",
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
            gap: 20,
            textAlign: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <ShieldCheck size={20} color="#b40101" />
            <span style={{ fontSize: 13, fontWeight: 700, color: "#222" }}>100% Confidential &amp; Obligation-Free</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <TrendingUp size={20} color="#b40101" />
            <span style={{ fontSize: 13, fontWeight: 700, color: "#222" }}>Synthesized With Closed Comps &amp; Private Sales</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <Building size={20} color="#b40101" />
            <span style={{ fontSize: 13, fontWeight: 700, color: "#222" }}>Delivered in 24 Hours by Senior Broker</span>
          </div>
        </div>
      </section>

      {/* ── INTERACTIVE FUNNEL CONTAINER ── */}
      <div style={{ maxWidth: 680, margin: isMobile ? "40px auto 80px" : "64px auto 112px", padding: "0 20px" }}>
        {submitted ? (
          <div
            style={{
              background: "#ffffff",
              borderRadius: 16,
              border: "1px solid #ebebeb",
              padding: isMobile ? "36px 20px" : "56px 48px",
              textAlign: "center",
              boxShadow: "0 20px 40px rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "#dcfce7",
                color: "#166534",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
              }}
            >
              <CheckCircle size={32} />
            </div>

            <h2
              style={{
                fontFamily: '"DM Serif Display", serif',
                fontSize: 32,
                fontWeight: 400,
                color: "#111",
                margin: "0 0 12px",
              }}
            >
              Valuation Request Initiated
            </h2>

            <p style={{ color: "#555", fontSize: 16, lineHeight: 1.6, margin: "0 0 32px" }}>
              Our senior advisory team for your neighborhood is compiling comparable sales data and private buyer demand for <strong>{address}</strong>. Your customized appraisal report will be dispatched to <strong>{email}</strong> within 24 business hours.
            </p>

            <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
              <Link
                to="/properties"
                style={{
                  height: 46,
                  lineHeight: "46px",
                  padding: "0 24px",
                  background: "#111",
                  color: "#fff",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                Explore Active Market
              </Link>
              <Link
                to="/agents"
                style={{
                  height: 46,
                  lineHeight: "46px",
                  padding: "0 24px",
                  background: "#fff",
                  color: "#111",
                  border: "1px solid #d5d5d5",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                View Advisor Roster
              </Link>
            </div>
          </div>
        ) : (
          <div
            style={{
              background: "#ffffff",
              borderRadius: 16,
              border: "1px solid #e5e5e5",
              boxShadow: "0 20px 48px rgba(0,0,0,0.06)",
              overflow: "hidden",
            }}
          >
            {/* Step Progress Header */}
            <div
              style={{
                background: "#fafafa",
                borderBottom: "1px solid #eee",
                padding: "16px 28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#666" }}>
                Step {step + 1} of 2: {step === 0 ? "Property Location" : "Confidential Delivery"}
              </span>
              <div style={{ display: "flex", gap: 6 }}>
                <span style={{ width: 32, height: 4, borderRadius: 2, background: step >= 0 ? "#b40101" : "#ddd" }} />
                <span style={{ width: 32, height: 4, borderRadius: 2, background: step >= 1 ? "#b40101" : "#ddd" }} />
              </div>
            </div>

            <div style={{ padding: isMobile ? "28px 20px" : "40px 36px" }}>
              {step === 0 ? (
                /* Step 1: Address */
                <form onSubmit={handleAddressSubmit}>
                  <h3
                    style={{
                      fontFamily: '"DM Serif Display", serif',
                      fontSize: 26,
                      fontWeight: 400,
                      color: "#111",
                      margin: "0 0 8px",
                    }}
                  >
                    Enter Property Address
                  </h3>
                  <p style={{ color: "#666", fontSize: 14, margin: "0 0 24px" }}>
                    Provide the street address, city, and zip code of the residence you wish to evaluate.
                  </p>

                  <div style={{ marginBottom: 24 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        border: "1.5px solid #d5d5d5",
                        borderRadius: 8,
                        padding: "0 16px",
                        height: 52,
                        background: "#fff",
                      }}
                    >
                      <MapPin size={20} color="#b40101" style={{ flexShrink: 0, marginRight: 12 }} />
                      <input
                        type="text"
                        placeholder="e.g. 4200 River Oaks Blvd, Houston, TX 77019"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        style={{
                          width: "100%",
                          border: "none",
                          fontSize: 16,
                          fontWeight: 500,
                          outline: "none",
                          color: "#111",
                        }}
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!address.trim()}
                    style={{
                      width: "100%",
                      height: 50,
                      background: "#b40101",
                      color: "#fff",
                      border: "none",
                      borderRadius: 8,
                      fontSize: 15,
                      fontWeight: 700,
                      cursor: address.trim() ? "pointer" : "not-allowed",
                      opacity: address.trim() ? 1 : 0.6,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      transition: "background 0.15s",
                    }}
                  >
                    <span>Proceed to Delivery Setup</span>
                    <ArrowRight size={16} />
                  </button>
                </form>
              ) : (
                /* Step 2: Contact & Selling Horizon */
                <form onSubmit={handleContactSubmit}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <button
                      type="button"
                      onClick={() => setStep(0)}
                      style={{ border: "none", background: "none", cursor: "pointer", padding: 0, color: "#666" }}
                    >
                      <ArrowLeft size={16} />
                    </button>
                    <h3
                      style={{
                        fontFamily: '"DM Serif Display", serif',
                        fontSize: 26,
                        fontWeight: 400,
                        color: "#111",
                        margin: 0,
                      }}
                    >
                      Delivery Information
                    </h3>
                  </div>

                  <p style={{ color: "#666", fontSize: 14, margin: "0 0 20px" }}>
                    Evaluating: <strong style={{ color: "#111" }}>{address}</strong>
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#555", marginBottom: 4 }}>
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={{ width: "100%", height: 44, padding: "0 14px", borderRadius: 8, border: "1px solid #d5d5d5", fontSize: 14, outline: "none" }}
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
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ width: "100%", height: 44, padding: "0 14px", borderRadius: 8, border: "1px solid #d5d5d5", fontSize: 14, outline: "none" }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#555", marginBottom: 4 }}>
                        Phone Number (Optional)
                      </label>
                      <input
                        type="tel"
                        placeholder="(469) 000-0000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        style={{ width: "100%", height: 44, padding: "0 14px", borderRadius: 8, border: "1px solid #d5d5d5", fontSize: 14, outline: "none" }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#555", marginBottom: 6 }}>
                        Estimated Selling Horizon
                      </label>
                      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 8 }}>
                        {[
                          { id: "immediate", label: "Immediate (30d)" },
                          { id: "3_months", label: "1 - 3 Months" },
                          { id: "6_months", label: "3 - 6 Months" },
                          { id: "curious", label: "Just Curious" },
                        ].map((t) => {
                          const active = timeline === t.id;
                          return (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => setTimeline(t.id)}
                              style={{
                                height: 38,
                                borderRadius: 6,
                                border: active ? "1.5px solid #111" : "1px solid #d5d5d5",
                                background: active ? "#111" : "#fff",
                                color: active ? "#fff" : "#333",
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: "pointer",
                              }}
                            >
                              {t.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      type="button"
                      onClick={() => setStep(0)}
                      style={{
                        height: 50,
                        padding: "0 20px",
                        background: "#fff",
                        border: "1px solid #d5d5d5",
                        color: "#333",
                        borderRadius: 8,
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      style={{
                        flex: 1,
                        height: 50,
                        background: "#b40101",
                        color: "#fff",
                        border: "none",
                        borderRadius: 8,
                        fontSize: 15,
                        fontWeight: 700,
                        cursor: submitting ? "not-allowed" : "pointer",
                        opacity: submitting ? 0.7 : 1,
                      }}
                    >
                      {submitting ? "Analyzing Property..." : "Generate Valuation Report"}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Privacy Guarantee Footer */}
            <div style={{ padding: "12px 28px", background: "#fafafa", borderTop: "1px solid #f0f0f0", display: "flex", alignItems: "center", gap: 8 }}>
              <Lock size={13} color="#777" />
              <span style={{ fontSize: 11, color: "#777", fontWeight: 600 }}>
                Strict client privacy guaranteed. Your address details are never monetized or distributed.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
