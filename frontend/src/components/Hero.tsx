import React, { useState } from "react";
import { Search, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TABS = [
  { key: "buy", label: "Buy" },
  { key: "rent", label: "Rent" },
  { key: "sold", label: "Recently Sold" },
  { key: "commercial", label: "Commercial" },
];

const CITIES = ["Austin", "Dallas", "Houston", "Miami", "Denver", "Charlotte"];

export default function Hero() {
  const [tab, setTab] = useState("buy");
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const search = () => {
    let url = `/properties`;
    if (tab === "rent") url += "?status=For+Rent";
    else if (tab === "sold") url += "?status=Sold";
    else if (tab === "commercial") url += "?propertyType=Commercial";
    else url += "?status=Active";
    if (query.trim()) url += `${url.includes("?") ? "&" : "?"}q=${encodeURIComponent(query.trim())}`;
    navigate(url);
  };

  return (
    <section
      style={{
        position: "relative",
        minHeight: "88vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        overflow: "hidden",
        background: "#0a0a0a",
      }}
    >
      {/* Full-bleed background photo */}
      <img
        src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2400&q=85"
        alt=""
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center 40%",
          opacity: 0.55,
        }}
      />

      {/* Bottom scrim only — lets the photo breathe at top */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "75%",
          background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.6) 50%, transparent 100%)",
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          maxWidth: 1080,
          margin: "0 auto",
          padding: "0 32px 72px",
          width: "100%",
        }}
      >
        {/* Eyebrow */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 20,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#b40101",
              display: "block",
            }}
          />
          <span
            style={{
              color: "rgba(255,255,255,0.7)",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            Torra Commercial & Luxury Residential
          </span>
        </div>

        {/* Headline — no gradient text, just white */}
        <h1
          style={{
            color: "#ffffff",
            fontSize: "clamp(38px, 6vw, 76px)",
            fontWeight: 900,
            lineHeight: 1.06,
            letterSpacing: "-0.03em",
            margin: "0 0 40px",
            maxWidth: 680,
          }}
        >
          Find your
          <br />
          next home.
        </h1>

        {/* Search widget — clean, no glassmorphism */}
        <div style={{ maxWidth: 680 }}>
          {/* Tab switcher */}
          <div style={{ display: "flex", gap: 0, marginBottom: 0 }}>
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  padding: "10px 20px",
                  fontSize: 14,
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  background: tab === t.key ? "#fff" : "rgba(255,255,255,0.12)",
                  color: tab === t.key ? "#111" : "rgba(255,255,255,0.75)",
                  borderRadius: "6px 6px 0 0",
                  transition: "all 0.15s ease",
                  marginRight: 2,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div
            style={{
              background: "#fff",
              borderRadius: "0 8px 8px 8px",
              display: "flex",
              alignItems: "center",
              overflow: "hidden",
              height: 60,
            }}
          >
            <MapPin
              size={18}
              color="#b40101"
              style={{ flexShrink: 0, marginLeft: 20 }}
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && search()}
              placeholder="City, neighborhood, address, or ZIP"
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                fontSize: 16,
                fontWeight: 400,
                color: "#111",
                padding: "0 16px",
                background: "transparent",
                height: "100%",
              }}
            />
            <button
              onClick={search}
              style={{
                background: "#b40101",
                border: "none",
                color: "#fff",
                height: "100%",
                padding: "0 28px",
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                transition: "background 0.15s",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#910101")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#b40101")}
            >
              <Search size={16} />
              Search
            </button>
          </div>

          {/* Quick city links */}
          <div
            style={{
              marginTop: 20,
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              alignItems: "center",
            }}
          >
            <span
              style={{
                color: "rgba(255,255,255,0.45)",
                fontSize: 12,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginRight: 4,
              }}
            >
              Popular:
            </span>
            {CITIES.map((city) => (
              <button
                key={city}
                onClick={() => navigate(`/properties?q=${encodeURIComponent(city)}`)}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.25)",
                  borderRadius: 20,
                  padding: "5px 14px",
                  fontSize: 13,
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.8)",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.6)";
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.8)";
                }}
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
