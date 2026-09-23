import { Link } from "react-router-dom";
import { useState } from "react";
import { Check } from "lucide-react";
import TorraLogo from "./TorraLogo";

const COL_LINKS = [
  {
    title: "Homes",
    links: [
      { label: "Buy a Home", href: "/properties" },
      { label: "Rent a Home", href: "/properties?status=For+Rent" },
      { label: "Luxury ($1M+)", href: "/properties?minPrice=1000000" },
      { label: "Commercial", href: "/properties?propertyType=Commercial" },
      { label: "Land & Lots", href: "/properties?propertyType=Land" },
      { label: "Open Houses", href: "/open-houses" },
    ],
  },
  {
    title: "Tools",
    links: [
      { label: "Home Value Estimate", href: "/home-value" },
      { label: "Mortgage Calculator", href: "/mortgage-calculator" },
      { label: "Affordability Calculator", href: "/affordability-calculator" },
      { label: "Find an Agent", href: "/agents" },
      { label: "Market Reports", href: "/blog" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Become an Agent", href: "/become-agent" },
      { label: "Blog", href: "/blog" },
      { label: "Terms of Use", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
    ],
  },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const subscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return;
    try {
      const prev = JSON.parse(localStorage.getItem("torra_newsletter") || "[]");
      if (!prev.includes(email.trim())) {
        prev.push(email.trim());
        localStorage.setItem("torra_newsletter", JSON.stringify(prev));
      }
    } catch {}
    setDone(true);
    setEmail("");
  };

  return (
    <footer
      style={{
        background: "#111",
        color: "#aaa",
        borderTop: "1px solid #222",
      }}
    >
      {/* Main columns */}
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "64px 32px 48px",
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr 1fr",
          gap: 48,
        }}
      >
        {/* Brand */}
        <div>
          <div style={{ marginBottom: 20 }}>
            <TorraLogo size={40} color="#b40101" compact showText />
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: "#666", marginBottom: 24, maxWidth: 280 }}>
            Commercial & luxury residential brokerage serving North America. Texas Real Estate Commission License #0751886.
          </p>
          <div style={{ fontSize: 13, color: "#555", lineHeight: 1.8 }}>
            <div>7945 FM 2757, Forney, TX 75126</div>
            <div>
              <a href="tel:4693456868" style={{ color: "#666", textDecoration: "none" }}>
                (469) 345-6868
              </a>
            </div>
          </div>
        </div>

        {/* Link columns */}
        {COL_LINKS.map((col) => (
          <div key={col.title}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#fff",
                marginBottom: 20,
              }}
            >
              {col.title}
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link
                    to={l.href}
                    style={{ color: "#666", textDecoration: "none", fontSize: 14, fontWeight: 400, transition: "color 0.12s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#ccc")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#666")}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Newsletter + bottom bar */}
      <div style={{ borderTop: "1px solid #222" }}>
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "32px 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 32,
            flexWrap: "wrap",
          }}
        >
          {/* Newsletter */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>
              Market updates, weekly.
            </span>
            {done ? (
              <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#4ade80", fontSize: 14, fontWeight: 600 }}>
                <Check size={14} /> Subscribed
              </span>
            ) : (
              <form onSubmit={subscribe} style={{ display: "flex", gap: 0 }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  style={{
                    background: "#1a1a1a",
                    border: "1px solid #333",
                    borderRight: "none",
                    borderRadius: "6px 0 0 6px",
                    padding: "9px 14px",
                    fontSize: 14,
                    color: "#fff",
                    outline: "none",
                    width: 220,
                  }}
                />
                <button
                  type="submit"
                  style={{
                    background: "#b40101",
                    border: "none",
                    borderRadius: "0 6px 6px 0",
                    padding: "9px 18px",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#fff",
                    cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#910101")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#b40101")}
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>

          {/* Copyright */}
          <div style={{ fontSize: 13, color: "#444" }}>
            © {new Date().getFullYear()} Torra Real Estate Group LLC
          </div>
        </div>

        {/* Legal disclaimer */}
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "0 32px 32px",
            fontSize: 12,
            color: "#3a3a3a",
            lineHeight: 1.7,
          }}
        >
          Equal Housing Opportunity. TORRA supports the Fair Housing Act and Equal Opportunity Act. Listing information is deemed reliable but not guaranteed. Properties subject to prior sale or withdrawal.
        </div>
      </div>
    </footer>
  );
}
