import React, { useRef, useState } from "react";
import { notification } from "antd";
import {
  TrendingUp,
  Award,
  Globe,
  Shield,
  ArrowRight,
  CheckCircle,
  Briefcase,
  Users,
  Compass,
  Check
} from "lucide-react";
import { useIsMobile } from "../hooks/useBreakpoint";

export default function BecomeAgent() {
  const formRef = useRef<HTMLDivElement>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [experience, setExperience] = useState("licensed");
  const [loading, setLoading] = useState(false);
  const isMobile = useIsMobile();

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const onFinish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      notification.error({ message: "Incomplete Form", description: "Please complete all required fields." });
      return;
    }

    setLoading(true);
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName,
          email: email.trim(),
          phone: phone.trim(),
          message: `Agent Recruitment Inquiry: ${fullName} (${experience}). Phone: ${phone.trim()}`,
          type: "agent_inquiry",
        }),
      });

      if (!response.ok) throw new Error("Submission failed");

      notification.success({
        message: "Application Received",
        description: "Thank you for your interest in joining Torra. A talent director will connect with you within 24 hours.",
      });

      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
    } catch (error) {
      notification.error({
        message: "Submission Error",
        description: "Something went wrong. Please connect with our executive office directly.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "#ffffff", minHeight: "100vh" }}>
      {/* ── HERO RECRUITMENT SPLIT ── */}
      <section
        style={{
          background: "#0f172a",
          color: "#ffffff",
          padding: isMobile ? "64px 20px 80px" : "100px 48px 120px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: 'url("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1920&q=80")',
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.12,
          }}
        />

        <div
          style={{
            maxWidth: 1320,
            margin: "0 auto",
            position: "relative",
            zIndex: 10,
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1.2fr 1fr",
            gap: 48,
            alignItems: "center",
          }}
        >
          {/* Headline & Pitch */}
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                marginBottom: 20,
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
                Careers · Torra Private Brokerage
              </span>
            </div>

            <h1
              style={{
                fontFamily: '"DM Serif Display", Georgia, serif',
                fontSize: isMobile ? 38 : 64,
                fontWeight: 400,
                lineHeight: 1.05,
                letterSpacing: "-0.02em",
                margin: "0 0 20px",
              }}
            >
              Elevate Your Real Estate Practice With Torra.
            </h1>

            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 18, lineHeight: 1.6, margin: "0 0 36px", maxWidth: 560 }}>
              Join Texas' premier commercial and luxury residential collective. Access institutional client rosters, industry-leading splits, and proprietary transaction technology.
            </p>

            <button
              onClick={scrollToForm}
              style={{
                height: 50,
                padding: "0 32px",
                background: "#b40101",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#910101")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#b40101")}
            >
              <span>Explore Partnership</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Quick Recruitment Card */}
          <div ref={formRef}>
            <div
              style={{
                background: "#ffffff",
                color: "#111111",
                borderRadius: 16,
                padding: isMobile ? "28px 20px" : "36px 32px",
                boxShadow: "0 24px 48px rgba(0,0,0,0.3)",
              }}
            >
              <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 6px" }}>Join the Private Roster</h2>
              <p style={{ fontSize: 13, color: "#666", margin: "0 0 24px" }}>
                Submit your credentials for a confidential conversation with our brokerage leadership.
              </p>

              <form onSubmit={onFinish} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#555", marginBottom: 4 }}>
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      style={{ width: "100%", height: 42, padding: "0 12px", borderRadius: 6, border: "1px solid #d0d0d0", fontSize: 14, outline: "none" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#555", marginBottom: 4 }}>
                      Last Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      style={{ width: "100%", height: 42, padding: "0 12px", borderRadius: 6, border: "1px solid #d0d0d0", fontSize: 14, outline: "none" }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#555", marginBottom: 4 }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: "100%", height: 42, padding: "0 12px", borderRadius: 6, border: "1px solid #d0d0d0", fontSize: 14, outline: "none" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#555", marginBottom: 4 }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{ width: "100%", height: 42, padding: "0 12px", borderRadius: 6, border: "1px solid #d0d0d0", fontSize: 14, outline: "none" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#555", marginBottom: 4 }}>
                    Current License Status
                  </label>
                  <select
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    style={{ width: "100%", height: 42, padding: "0 10px", borderRadius: 6, border: "1px solid #d0d0d0", fontSize: 14, outline: "none" }}
                  >
                    <option value="licensed">Currently Licensed Real Estate Agent</option>
                    <option value="broker">Licensed Real Estate Broker</option>
                    <option value="commercial">Commercial Acquisition Specialist</option>
                    <option value="in_school">Enrolled in Real Estate Licensing</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    height: 48,
                    marginTop: 8,
                    background: "#b40101",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.7 : 1,
                    transition: "background 0.15s",
                  }}
                >
                  {loading ? "Transmitting..." : "Submit Confidential Inquiry"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ── BROKERAGE ADVANTAGES ── */}
      <section style={{ maxWidth: 1320, margin: "0 auto", padding: isMobile ? "48px 16px" : "96px 32px" }}>
        <div style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 64px" }}>
          <h2
            style={{
              fontFamily: '"DM Serif Display", Georgia, serif',
              fontSize: isMobile ? 30 : 44,
              fontWeight: 400,
              color: "#111",
              margin: "0 0 16px",
            }}
          >
            The Torra Collective Advantage
          </h2>
          <p style={{ color: "#666", fontSize: 16, lineHeight: 1.6, margin: 0 }}>
            We engineered an environment where elite advisors spend zero time on administrative friction and 100% of their energy advising clients and closing transactions.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
            gap: 32,
          }}
        >
          {[
            {
              icon: <TrendingUp size={24} color="#b40101" />,
              title: "Uncapped Commission Yields",
              desc: "Transparent tiered split structures with annual caps and profit-sharing pools designed to reward high performers.",
            },
            {
              icon: <Globe size={24} color="#b40101" />,
              title: "Global Private Rolodex",
              desc: "Direct marketing access to family offices, private equity syndicates, and ultra-high-net-worth buyers across North America.",
            },
            {
              icon: <Shield size={24} color="#b40101" />,
              title: "Proprietary Command CRM",
              desc: "Fully bespoke agent suite integrating automated follow-ups, contract generation, real-time analytics, and client video rooms.",
            },
          ].map((card, i) => (
            <div
              key={i}
              style={{
                padding: 32,
                borderRadius: 12,
                border: "1px solid #ebebeb",
                background: "#fafafa",
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 10,
                  background: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  marginBottom: 20,
                }}
              >
                {card.icon}
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 10px", color: "#111" }}>{card.title}</h3>
              <p style={{ fontSize: 14, color: "#666", lineHeight: 1.6, margin: 0 }}>{card.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
