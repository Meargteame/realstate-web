import React, { useState } from "react";
import { Link } from "react-router-dom";
import { notification } from "antd";
import {
  Calculator,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Building,
  CheckCircle,
  ArrowRight,
  Percent,
  Calendar,
  Lock
} from "lucide-react";
import { useIsMobile } from "../hooks/useBreakpoint";

export default function MortgageCalculator() {
  const isMobile = useIsMobile();
  const [homePrice, setHomePrice] = useState(650000);
  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [interestRate, setInterestRate] = useState(6.75);
  const [loanTerm, setLoanTerm] = useState(30);

  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [submittingLead, setSubmittingLead] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);

  const downPayment = homePrice * (downPaymentPct / 100);
  const loanAmount = homePrice - downPayment;
  const monthlyRate = interestRate / 100 / 12;
  const numPayments = loanTerm * 12;
  const monthlyPI =
    loanAmount > 0 && monthlyRate > 0
      ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
        (Math.pow(1 + monthlyRate, numPayments) - 1)
      : 0;

  const estimatedTax = (homePrice * 0.0125) / 12; // Approx 1.25% annual
  const estimatedInsurance = (homePrice * 0.0035) / 12; // Approx 0.35% annual
  const totalMonthly = monthlyPI + estimatedTax + estimatedInsurance;
  const totalPaid = monthlyPI * numPayments;
  const totalInterest = totalPaid - loanAmount;

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName.trim() || !leadEmail.trim()) {
      notification.error({ message: "Incomplete Details", description: "Name and email are required." });
      return;
    }

    setSubmittingLead(true);
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: leadName.trim(),
          email: leadEmail.trim(),
          phone: leadPhone.trim(),
          message: `Mortgage Pre-Approval Inquiry: Target Home Price ${fmt(homePrice)}, Down Payment ${fmt(downPayment)} (${downPaymentPct}%), Est Monthly ${fmt(totalMonthly)}`,
          type: "mortgage_inquiry",
          source: "mortgage_calculator",
        }),
      });

      if (!response.ok) throw new Error("Submission failed");
      setLeadSubmitted(true);
      notification.success({
        message: "Lending Specialist Assigned",
        description: "A certified lending officer will review your financing scenario and deliver competitive rates.",
      });
    } catch (error) {
      notification.error({ message: "Submission Error", description: "Could not dispatch request." });
    } finally {
      setSubmittingLead(false);
    }
  };

  return (
    <div style={{ background: "#ffffff", minHeight: "100vh" }}>
      {/* ── EDITORIAL HERO ── */}
      <section
        style={{
          background: "#0f172a",
          color: "#ffffff",
          padding: isMobile ? "56px 20px 72px" : "88px 48px 96px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ maxWidth: 840, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 10 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              marginBottom: 16,
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
              Capital Planning &amp; Financing
            </span>
          </div>

          <h1
            style={{
              fontFamily: '"DM Serif Display", Georgia, serif',
              fontSize: isMobile ? 36 : 56,
              fontWeight: 400,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              margin: "0 0 16px",
            }}
          >
            Mortgage &amp; Payment Analysis
          </h1>

          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 17, lineHeight: 1.6, margin: "0 auto", maxWidth: 600 }}>
            Model your capital requirements, interest amortization, and projected monthly obligations with institutional precision.
          </p>
        </div>
      </section>

      {/* ── MAIN INTERACTIVE CALCULATOR ── */}
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: isMobile ? "32px 16px 80px" : "56px 32px 112px" }}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.25fr 1fr", gap: 48, alignItems: "start" }}>
          {/* Controls Column */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: 16,
              border: "1px solid #e5e5e5",
              padding: isMobile ? "28px 20px" : "36px 36px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
            }}
          >
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 24px", color: "#111" }}>
              Financing Variables
            </h2>

            {/* Home Price */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
                <label style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", color: "#555" }}>
                  Purchase Price
                </label>
                <span style={{ fontFamily: '"DM Serif Display", serif', fontSize: 24, fontWeight: 400, color: "#111" }}>
                  {fmt(homePrice)}
                </span>
              </div>
              <input
                type="range"
                min={150000}
                max={5000000}
                step={25000}
                value={homePrice}
                onChange={(e) => setHomePrice(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#b40101" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#888", marginTop: 4 }}>
                <span>$150k</span>
                <span>$2.5M</span>
                <span>$5M+</span>
              </div>
            </div>

            {/* Down Payment */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
                <label style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", color: "#555" }}>
                  Down Payment ({downPaymentPct}%)
                </label>
                <span style={{ fontSize: 18, fontWeight: 700, color: "#111" }}>
                  {fmt(downPayment)}
                </span>
              </div>
              <input
                type="range"
                min={5}
                max={50}
                step={1}
                value={downPaymentPct}
                onChange={(e) => setDownPaymentPct(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#b40101" }}
              />
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                {[10, 20, 25, 30].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setDownPaymentPct(pct)}
                    style={{
                      flex: 1,
                      height: 32,
                      borderRadius: 6,
                      border: downPaymentPct === pct ? "1.5px solid #111" : "1px solid #d5d5d5",
                      background: downPaymentPct === pct ? "#111" : "#fff",
                      color: downPaymentPct === pct ? "#fff" : "#333",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Interest Rate */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
                <label style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", color: "#555" }}>
                  Interest Rate
                </label>
                <span style={{ fontSize: 18, fontWeight: 700, color: "#111" }}>
                  {interestRate.toFixed(2)}%
                </span>
              </div>
              <input
                type="range"
                min={3.5}
                max={11.0}
                step={0.05}
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#b40101" }}
              />
            </div>

            {/* Loan Duration */}
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, textTransform: "uppercase", color: "#555", marginBottom: 10 }}>
                Amortization Horizon
              </label>
              <div style={{ display: "flex", gap: 10 }}>
                {[15, 20, 30].map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setLoanTerm(term)}
                    style={{
                      flex: 1,
                      height: 44,
                      borderRadius: 8,
                      border: loanTerm === term ? "1.5px solid #b40101" : "1px solid #d5d5d5",
                      background: loanTerm === term ? "#fff5f5" : "#fff",
                      color: loanTerm === term ? "#b40101" : "#333",
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {term} Years Fixed
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results & Pre-Approval Column */}
          <div style={{ position: isMobile ? "static" : "sticky", top: 100 }}>
            {/* Payment Summary Box */}
            <div
              style={{
                background: "#0f172a",
                color: "#ffffff",
                borderRadius: 16,
                padding: "32px 28px",
                marginBottom: 24,
                boxShadow: "0 16px 36px rgba(15, 23, 42, 0.2)",
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.6)" }}>
                Total Projected Monthly Outlay
              </span>
              <div
                style={{
                  fontFamily: '"DM Serif Display", serif',
                  fontSize: isMobile ? 42 : 56,
                  fontWeight: 400,
                  letterSpacing: "-0.02em",
                  margin: "8px 0 16px",
                  lineHeight: 1,
                }}
              >
                {fmt(totalMonthly)}
                <span style={{ fontSize: 16, color: "rgba(255,255,255,0.6)", marginLeft: 6 }}>/ mo</span>
              </div>

              {/* Monthly Breakdown */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, borderTop: "1px solid rgba(255,255,255,0.12)", paddingTop: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ color: "rgba(255,255,255,0.7)" }}>Principal &amp; Interest</span>
                  <span style={{ fontWeight: 700 }}>{fmt(monthlyPI)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ color: "rgba(255,255,255,0.7)" }}>Est. Property Taxes</span>
                  <span style={{ fontWeight: 700 }}>{fmt(estimatedTax)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ color: "rgba(255,255,255,0.7)" }}>Est. Homeowners Insurance</span>
                  <span style={{ fontWeight: 700 }}>{fmt(estimatedInsurance)}</span>
                </div>
              </div>

              {/* Summary Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 20, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.12)" }}>
                <div>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", display: "block" }}>Loan Capital</span>
                  <span style={{ fontSize: 16, fontWeight: 700 }}>{fmt(loanAmount)}</span>
                </div>
                <div>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", display: "block" }}>Total Interest</span>
                  <span style={{ fontSize: 16, fontWeight: 700 }}>{fmt(totalInterest)}</span>
                </div>
              </div>
            </div>

            {/* Lending Pre-Approval Card */}
            <div
              style={{
                background: "#ffffff",
                border: "1.5px solid #b40101",
                borderRadius: 16,
                padding: "28px 24px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
              }}
            >
              <h3 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 6px", color: "#111" }}>
                Connect With a Lending Partner
              </h3>
              <p style={{ fontSize: 13, color: "#666", margin: "0 0 20px" }}>
                Obtain certified pre-qualification letters to strengthen your purchase offers on competitive properties.
              </p>

              {leadSubmitted ? (
                <div style={{ padding: "16px", background: "#dcfce7", borderRadius: 8, color: "#166534", fontSize: 13, fontWeight: 600, textAlign: "center" }}>
                  Inquiry sent. A dedicated mortgage advisor will contact you within 24 hours.
                </div>
              ) : (
                <form onSubmit={handleLeadSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#555", marginBottom: 4 }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={leadName}
                      onChange={(e) => setLeadName(e.target.value)}
                      style={{ width: "100%", height: 42, padding: "0 12px", borderRadius: 6, border: "1px solid #d5d5d5", fontSize: 14, outline: "none" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#555", marginBottom: 4 }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="jane@example.com"
                      value={leadEmail}
                      onChange={(e) => setLeadEmail(e.target.value)}
                      style={{ width: "100%", height: 42, padding: "0 12px", borderRadius: 6, border: "1px solid #d5d5d5", fontSize: 14, outline: "none" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#555", marginBottom: 4 }}>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="(469) 000-0000"
                      value={leadPhone}
                      onChange={(e) => setLeadPhone(e.target.value)}
                      style={{ width: "100%", height: 42, padding: "0 12px", borderRadius: 6, border: "1px solid #d5d5d5", fontSize: 14, outline: "none" }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingLead}
                    style={{
                      height: 46,
                      marginTop: 4,
                      background: "#b40101",
                      color: "#fff",
                      border: "none",
                      borderRadius: 8,
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: submittingLead ? "not-allowed" : "pointer",
                      opacity: submittingLead ? 0.7 : 1,
                      transition: "background 0.15s",
                    }}
                  >
                    {submittingLead ? "Transmitting..." : "Request Lending Consultation"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
