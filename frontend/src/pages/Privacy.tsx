import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const sections = [
  {
    title: "1. Privacy Commitment",
    body: "Torra Commercial Real Estate Group (\"Torra\", \"we\", \"us\") prioritizes client discretion and data privacy. This policy outlines how information is gathered, managed, and safeguarded across all Torra interfaces and valuation tooling.",
  },
  {
    title: "2. Information Gathering",
    body: "We collect information provided directly through private inquiries, consultation bookings, search filters, saved listings, and seller valuation requests. Usage statistics including search geometry and viewed residences are monitored to improve advisory accuracy.",
  },
  {
    title: "3. Information Application",
    body: "Information is utilized solely to deliver customized market analysis, pair clients with verified specialists, schedule showings, and maintain platform integrity. Torra never sells client dossiers to third-party telemarketers.",
  },
  {
    title: "4. Disclosures to Licensed Specialists",
    body: "When you request a showing or submit a valuation inquiry, pertinent property notes and contact details are delivered securely to the assigned certified listing specialist to facilitate direct communication.",
  },
  {
    title: "5. Security Safeguards",
    body: "Torra utilizes enterprise encryption and transport layer security (TLS) to safeguard client credentials and communications. Direct agent messages are transmitted over authenticated channels.",
  },
  {
    title: "6. Client Rights & Erasure",
    body: "Clients hold the right to review, rectify, or request immediate erasure of their account records and saved portfolios at any time by contacting our security office.",
  },
  {
    title: "7. Data Governance Contact",
    body: "For security or data privacy requests, contact privacy@torra.com.",
  },
];

export default function Privacy() {
  return (
    <div style={{ background: "#ffffff", minHeight: "100vh", padding: "64px 24px 96px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <Link
          to="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            color: "#666",
            fontSize: 13,
            fontWeight: 600,
            textDecoration: "none",
            marginBottom: 28,
          }}
        >
          <ArrowLeft size={14} />
          <span>Return Home</span>
        </Link>

        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: "#b40101",
            display: "block",
            marginBottom: 8,
          }}
        >
          Data Governance &amp; Discretion
        </span>

        <h1
          style={{
            fontFamily: '"DM Serif Display", Georgia, serif',
            fontSize: 48,
            fontWeight: 400,
            color: "#111",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            margin: "0 0 12px",
          }}
        >
          Privacy Policy
        </h1>

        <p style={{ color: "#777", fontSize: 14, marginBottom: 48 }}>
          Effective Date: January 1, 2026 · Confidential Client Protection Notice
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
          {sections.map((section) => (
            <section key={section.title}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#111", margin: "0 0 10px" }}>
                {section.title}
              </h2>
              <p style={{ fontSize: 15, lineHeight: 1.75, color: "#555", margin: 0 }}>
                {section.body}
              </p>
            </section>
          ))}
        </div>

        <div style={{ marginTop: 56, paddingTop: 28, borderTop: "1px solid #eee", fontSize: 13, color: "#777" }}>
          Reference our accompanying{" "}
          <Link to="/terms" style={{ color: "#b40101", fontWeight: 700, textDecoration: "underline" }}>
            Terms of Use
          </Link>{" "}
          for service governance conditions.
        </div>
      </div>
    </div>
  );
}
