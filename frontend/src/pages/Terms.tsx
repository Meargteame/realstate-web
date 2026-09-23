import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const sections = [
  {
    title: "1. Acceptance of Terms",
    body: "By accessing or using the Torra Commercial Real Estate Group platform (the \"Service\"), you agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use the Service.",
  },
  {
    title: "2. Use of the Service",
    body: "You may use the Service only for lawful purposes and in accordance with these Terms. You agree not to use the Service in any way that violates any applicable federal, state, local, or international law or regulation, or to transmit any advertising or promotional material without our prior written consent.",
  },
  {
    title: "3. Accounts",
    body: "When you create an account with us, you must provide information that is accurate and complete. You are responsible for safeguarding the credentials you use to access the Service and for any activities under your account. Notify us immediately of any unauthorized use of your account.",
  },
  {
    title: "4. Property Listings & Representation",
    body: "Property information displayed on the Service is provided by licensed specialists, institutional MLS syndication, and private third-party sources and is believed to be reliable but is not guaranteed. Prices, availability, and property details are subject to change without notice. Torra is not liable for inadvertent typographical errors or omissions in any listing representation.",
  },
  {
    title: "5. Licensed Advisory Services",
    body: "Torra connects buyers and sellers with certified luxury and commercial real estate specialists. Torra acts as a licensed brokerage and adheres strictly to Texas Real Estate Commission (TREC) guidelines and Consumer Protection notices.",
  },
  {
    title: "6. Proprietary Intellectual Property",
    body: "The Service, including its proprietary interface designs, algorithmic valuation tooling, photography assets, and branding, is the exclusive intellectual property of Torra Real Estate Cloud and its licensors.",
  },
  {
    title: "7. Limitation of Liability",
    body: "To the maximum extent permitted by law, Torra shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your access to or use of the Service.",
  },
  {
    title: "8. Amendments & Modifications",
    body: "We reserve the right to modify or replace these Terms at any time. Material amendments will be communicated through the Service. Continued utilization of the Service following revisions constitutes affirmative acceptance of the revised Terms.",
  },
  {
    title: "9. Legal Inquiries",
    body: "Questions regarding these Terms of Service should be directed to legal@torra.com or by mail to Torra Headquarters, Forney, TX 75126.",
  },
];

export default function Terms() {
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
          Governance &amp; Disclosures
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
          Terms of Use
        </h1>

        <p style={{ color: "#777", fontSize: 14, marginBottom: 48 }}>
          Effective Date: January 1, 2026 · Texas Real Estate Commission Compliant
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
          <Link to="/privacy" style={{ color: "#b40101", fontWeight: 700, textDecoration: "underline" }}>
            Privacy Policy
          </Link>{" "}
          for details on information handling and security practices.
        </div>
      </div>
    </div>
  );
}
