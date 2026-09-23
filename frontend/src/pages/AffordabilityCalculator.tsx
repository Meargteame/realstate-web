import React, { useState } from "react";
import { Link } from "react-router-dom";
import { notification } from "antd";
import {
  Calculator,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  CheckCircle,
  ArrowRight,
  PieChart,
  Home,
  Check
} from "lucide-react";
import { useIsMobile } from "../hooks/useBreakpoint";

export default function AffordabilityCalculator() {
  const isMobile = useIsMobile();
  const [annualIncome, setAnnualIncome] = useState(140000);
  const [monthlyDebts, setMonthlyDebts] = useState(750);
  const [downPayment, setDownPayment] = useState(85000);
  const [interestRate, setInterestRate] = useState(6.75);
  const [loanTerm, setLoanTerm] = useState(30);

  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [submittingLead, setSubmittingLead] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);

  // Calculation
  const monthlyIncome = annualIncome / 12;
  const maxMonthlyHousingFront = monthlyIncome * 0.28; // 28% front-end
  const maxTotalDebtBack = monthlyIncome * 0.36; // 36% back-end
  const maxHousingBack = Math.max(0, maxTotalDebtBack - monthlyDebts);
  const affordableMonthlyPayment = Math.min(maxMonthlyHousingFront, maxHousingBack);

  const monthlyRate = interestRate / 100 / 12;
  const numPayments = loanTerm * 12;
  const maxLoanAmount =
    monthlyRate > 0 && affordableMonthlyPayment > 0
      ? affordableMonthlyPayment * ((1 - Math.pow(1 + monthlyRate, -numPayments)) / monthlyRate)
      : 0;

  const maxHomePrice = maxLoanAmount + downPayment;
  const dtiRatio = monthlyIncome > 0 ? (((affordableMonthlyPayment + monthlyDebts) / monthlyIncome) * 100).toFixed(1) : "0";

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
          message: `Affordability Inquiry: Annual Income ${fmt(annualIncome)}, Down Payment ${fmt(downPayment)}, Max Home Capacity ${fmt(maxHomePrice)}, DTI ${dtiRatio}%`,
          type: "affordability_inquiry",
          source: "affordability_calculator",
        }),
      });

      if (!response.ok) throw new Error("Submission failed");
      setLeadSubmitted(true);
      notification.success({
        message: "Match Prepared",
        description: "A Torra client advisor will send you custom properties matching this purchasing capacity.",
      });
    } catch (error) {
      notification.error({ message: "Submission Error", description: "Could not send inquiry." });
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
              Purchasing Capacity Engine
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
            Home Affordability &amp; Budget Modeling
          </h1>

          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 17, lineHeight: 1.6, margin: "0 auto", maxWidth: 600 }}>
            Establish a safe acquisition budget based on debt-to-income benchmarks (28/36 rule) and liquid down payment reserves.
          </p>
        </div>
      </section>

      {/* ── MAIN INTERACTIVE CONTAINER ── */}
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: isMobile ? "32px 16px 80px" : "56px 32px 112px" }}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.25fr 1fr", gap: 48, alignItems: "start" }}>
          {/* Inputs Column */}
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
              Financial Profile Inputs
            </h2>

            {/* Annual Gross Income */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                <label style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", color: "#555" }}>
                  Annual Gross Household Income
                </label>
                <span style={{ fontFamily: '"DM Serif Display", serif', fontSize: 22, color: "#111" }}>
                  {fmt(annualIncome)}
                </span>
              </div>
              <input
                type="range"
                min={50000}
                max={600000}
                step={5000}
                value={annualIncome}
                onChange={(e) => setAnnualIncome(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#b40101" }}
              />
              <span style={{ fontSize: 12, color: "#777" }}>Monthly gross: {fmt(monthlyIncome)}</span>
            </div>

            {/* Monthly Liabilities */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                <label style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", color: "#555" }}>
                  Monthly Recurring Liabilities
                </label>
                <span style={{ fontSize: 18, fontWeight: 700, color: "#111" }}>
                  {fmt(monthlyDebts)}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={5000}
                step={50}
                value={monthlyDebts}
                onChange={(e) => setMonthlyDebts(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#b40101" }}
              />
              <span style={{ fontSize: 12, color: "#777" }}>Auto loans, student debt, credit card minimums</span>
            </div>

            {/* Down Payment Reserve */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                <label style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", color: "#555" }}>
                  Liquid Down Payment Funds
                </label>
                <span style={{ fontSize: 18, fontWeight: 700, color: "#111" }}>
                  {fmt(downPayment)}
                </span>
              </div>
              <input
                type="range"
                min={10000}
                max={1000000}
                step={10000}
                value={downPayment}
                onChange={(e) => setDownPayment(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#b40101" }}
              />
            </div>

            {/* Mortgage Rate */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                <label style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", color: "#555" }}>
                  Estimated Interest Rate
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
          </div>

          {/* Results & Inventory Search Column */}
          <div style={{ position: isMobile ? "static" : "sticky", top: 100 }}>
            {/* Purchasing Power Receipt */}
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
                Maximum Purchasing Capacity
              </span>
              <div
                style={{
                  fontFamily: '"DM Serif Display", serif',
                  fontSize: isMobile ? 42 : 54,
                  fontWeight: 400,
                  letterSpacing: "-0.02em",
                  margin: "8px 0 16px",
                  lineHeight: 1,
                  color: "#ffffff",
                }}
              >
                {fmt(maxHomePrice)}
              </div>

              {/* Stat breakdown */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, borderTop: "1px solid rgba(255,255,255,0.12)", paddingTop: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ color: "rgba(255,255,255,0.7)" }}>Max Monthly Housing</span>
                  <span style={{ fontWeight: 700 }}>{fmt(affordableMonthlyPayment)}/mo</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ color: "rgba(255,255,255,0.7)" }}>Max Loan Financed</span>
                  <span style={{ fontWeight: 700 }}>{fmt(maxLoanAmount)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ color: "rgba(255,255,255,0.7)" }}>Debt-to-Income (DTI)</span>
                  <span style={{ fontWeight: 700, color: Number(dtiRatio) <= 36 ? "#4ade80" : "#fbbf24" }}>
                    {dtiRatio}% (Target: ≤ 36%)
                  </span>
                </div>
              </div>

              <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.12)" }}>
                <Link
                  to={`/properties?maxPrice=${Math.round(maxHomePrice)}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    height: 46,
                    background: "#b40101",
                    color: "#ffffff",
                    borderRadius: 8,
                    fontWeight: 700,
                    fontSize: 14,
                    textDecoration: "none",
                  }}
                >
                  <Home size={16} />
                  <span>Browse Homes Under {fmt(maxHomePrice)}</span>
                </Link>
              </div>
            </div>

            {/* Advisory Request Card */}
            <div
              style={{
                background: "#ffffff",
                border: "1px solid #e5e5e5",
                borderRadius: 16,
                padding: "24px",
              }}
            >
              <h3 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 6px", color: "#111" }}>
                Curated Portfolio Match
              </h3>
              <p style={{ fontSize: 13, color: "#666", margin: "0 0 16px" }}>
                Let a Torra specialist assemble a private collection of on-market and off-market residences within this price target.
              </p>

              {leadSubmitted ? (
                <div style={{ padding: "14px", background: "#dcfce7", borderRadius: 8, color: "#166534", fontSize: 13, fontWeight: 600, textAlign: "center" }}>
                  Inquiry logged. An advisor will prepare residences matching your budget.
                </div>
              ) : (
                <form onSubmit={handleLeadSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <input
                    type="text"
                    required
                    placeholder="Your Name"
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                    style={{ width: "100%", height: 40, padding: "0 12px", borderRadius: 6, border: "1px solid #d5d5d5", fontSize: 13, outline: "none" }}
                  />
                  <input
                    type="email"
                    required
                    placeholder="Email Address"
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    style={{ width: "100%", height: 40, padding: "0 12px", borderRadius: 6, border: "1px solid #d5d5d5", fontSize: 13, outline: "none" }}
                  />
                  <button
                    type="submit"
                    disabled={submittingLead}
                    style={{
                      height: 42,
                      background: "#111",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: submittingLead ? "not-allowed" : "pointer",
                    }}
                  >
                    {submittingLead ? "Transmitting..." : "Send Matching Portfolio"}
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
