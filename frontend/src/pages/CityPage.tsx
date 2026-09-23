import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { notification } from "antd";
import {
  ArrowRight,
  TrendingUp,
  Clock,
  Building,
  Home,
  MapPin,
  Search,
  Sparkles,
  ShieldCheck,
  Check
} from "lucide-react";
import PropertyCard from "@/components/PropertyCard";
import { useIsMobile } from "../hooks/useBreakpoint";

const CITY_MARKET_DATA: Record<string, any> = {
  default: { medianPrice: 540000, priceChange: 5.4, avgDom: 18, totalListings: 342, bg: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1920&q=85" },
  austin: { medianPrice: 650000, priceChange: 8.2, avgDom: 14, totalListings: 1240, bg: "https://images.unsplash.com/photo-1531218150217-54595bc2b934?auto=format&fit=crop&w=1920&q=85" },
  miami: { medianPrice: 790000, priceChange: 11.5, avgDom: 22, totalListings: 890, bg: "https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?auto=format&fit=crop&w=1920&q=85" },
  charlotte: { medianPrice: 440000, priceChange: 6.8, avgDom: 16, totalListings: 680, bg: "https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&w=1920&q=85" },
  dallas: { medianPrice: 535000, priceChange: 5.1, avgDom: 16, totalListings: 1450, bg: "https://images.unsplash.com/photo-1545153996-e01b50d6f228?auto=format&fit=crop&w=1920&q=85" },
  denver: { medianPrice: 610000, priceChange: 3.5, avgDom: 21, totalListings: 510, bg: "https://images.unsplash.com/photo-1546156929-a4c0ac411f47?auto=format&fit=crop&w=1920&q=85" },
};

export default function CityPage() {
  const { city } = useParams<{ city: string }>();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [valuationAddress, setValuationAddress] = useState("");
  const [valuationName, setValuationName] = useState("");
  const [valuationEmail, setValuationEmail] = useState("");
  const [submittingValuation, setSubmittingValuation] = useState(false);
  const isMobile = useIsMobile();

  const cityKey = city?.toLowerCase() || "default";
  const displayName = city
    ? city
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
    : "Texas";
  const staticMarket = CITY_MARKET_DATA[cityKey] || CITY_MARKET_DATA.default;

  useEffect(() => {
    fetch(`/api/properties?q=${city}`)
      .then((r) => r.json())
      .then((d) => {
        setProperties(Array.isArray(d) ? d : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [city]);

  const market = (() => {
    if (properties.length === 0) return staticMarket;
    const prices = properties
      .map((p: any) => p.price)
      .filter((n: any) => typeof n === "number")
      .sort((a: number, b: number) => a - b);
    const median = prices.length ? prices[Math.floor(prices.length / 2)] : staticMarket.medianPrice;
    const doms = properties.map((p: any) => p.daysOnMarket).filter((n: any) => typeof n === "number");
    const avgDom = doms.length ? Math.round(doms.reduce((s: number, n: number) => s + n, 0) / doms.length) : staticMarket.avgDom;
    return {
      medianPrice: median,
      priceChange: staticMarket.priceChange,
      avgDom,
      totalListings: properties.length,
      bg: staticMarket.bg,
    };
  })();

  const handleValuationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valuationAddress.trim() || !valuationName.trim() || !valuationEmail.trim()) {
      notification.error({ message: "Incomplete Form", description: "Please complete all fields to request a valuation." });
      return;
    }

    setSubmittingValuation(true);
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: valuationName.trim(),
          email: valuationEmail.trim(),
          address: valuationAddress.trim(),
          message: `Home Valuation Request from ${displayName} market report: ${valuationAddress.trim()}`,
          type: "valuation_request",
          source: "city_page",
        }),
      });

      if (!response.ok) throw new Error("Submission failed");

      notification.success({
        message: "Market Valuation Requested",
        description: `We've prepared your inquiry for ${valuationAddress}. A Torra private advisor will contact you within 24 hours.`,
      });
      setValuationAddress("");
      setValuationName("");
      setValuationEmail("");
    } catch (error) {
      notification.error({ message: "Submission Error", description: "Something went wrong. Please try again." });
    } finally {
      setSubmittingValuation(false);
    }
  };

  const neighborhoods = [
    "Downtown & Arts District",
    "Historic Enclave",
    "Northside Estates",
    "West End Corridor",
    "Midtown Promenade",
    "Waterfront Terrace",
  ];

  return (
    <div style={{ background: "#ffffff", minHeight: "100vh" }}>
      {/* ── EDITORIAL HERO ── */}
      <section
        style={{
          position: "relative",
          minHeight: isMobile ? 440 : 540,
          display: "flex",
          alignItems: "flex-end",
          padding: isMobile ? "0 20px 48px" : "0 48px 64px",
          overflow: "hidden",
        }}
      >
        {/* Background photo */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url("${market.bg}")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        {/* Scrim gradient */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.35) 60%, rgba(0,0,0,0.1) 100%)",
          }}
        />

        {/* Content */}
        <div style={{ position: "relative", zIndex: 10, maxWidth: 960 }}>
          {/* Eyebrow */}
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
              Market Advisory · {displayName}, Texas
            </span>
          </div>

          <h1
            style={{
              fontFamily: '"DM Serif Display", Georgia, serif',
              fontSize: isMobile ? 36 : 64,
              fontWeight: 400,
              color: "#ffffff",
              lineHeight: 1.08,
              letterSpacing: "-0.02em",
              margin: "0 0 16px",
            }}
          >
            Distinctive Residences &amp; Luxury Real Estate in {displayName}.
          </h1>

          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: isMobile ? 15 : 18, margin: "0 0 28px", maxWidth: 640 }}>
            {market.totalListings} available exclusive listings with median valuation at ${(market.medianPrice / 1000).toFixed(0)}k.
          </p>

          <button
            onClick={() => navigate(`/properties?q=${city}`)}
            style={{
              height: 48,
              padding: "0 28px",
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
            <Search size={16} />
            <span>Explore All {displayName} Inventory</span>
          </button>
        </div>
      </section>

      {/* ── MARKET METRICS RIBBON ── */}
      <section style={{ borderBottom: "1px solid #eee", background: "#fafafa" }}>
        <div
          style={{
            maxWidth: 1320,
            margin: "0 auto",
            padding: "28px 32px",
            display: "grid",
            gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
            gap: 24,
          }}
        >
          <div>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 4 }}>
              Median List Price
            </span>
            <span style={{ fontFamily: '"DM Serif Display", serif', fontSize: 32, fontWeight: 400, color: "#111" }}>
              ${(market.medianPrice / 1000).toFixed(0)}k
            </span>
          </div>

          <div>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 4 }}>
              Avg. Days on Market
            </span>
            <span style={{ fontFamily: '"DM Serif Display", serif', fontSize: 32, fontWeight: 400, color: "#111" }}>
              {market.avgDom} Days
            </span>
          </div>

          <div>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 4 }}>
              YoY Market Shift
            </span>
            <span style={{ fontFamily: '"DM Serif Display", serif', fontSize: 32, fontWeight: 400, color: "#166534" }}>
              +{market.priceChange}%
            </span>
          </div>

          <div>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 4 }}>
              Current Portfolio
            </span>
            <span style={{ fontFamily: '"DM Serif Display", serif', fontSize: 32, fontWeight: 400, color: "#111" }}>
              {market.totalListings} Listings
            </span>
          </div>
        </div>
      </section>

      {/* ── CURATED RESIDENCES IN THIS MARKET ── */}
      <section style={{ maxWidth: 1320, margin: "0 auto", padding: isMobile ? "40px 16px" : "64px 32px" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 32 }}>
          <div>
            <h2
              style={{
                fontFamily: '"DM Serif Display", Georgia, serif',
                fontSize: isMobile ? 26 : 36,
                fontWeight: 400,
                color: "#111",
                margin: "0 0 6px",
              }}
            >
              Curated Residences in {displayName}
            </h2>
            <p style={{ color: "#666", fontSize: 14, margin: 0 }}>
              Handpicked active listings representing exceptional architectural craft.
            </p>
          </div>

          <Link
            to={`/properties?q=${city}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              color: "#b40101",
              fontSize: 14,
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            <span>View All ({properties.length})</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        {loading ? (
          <div style={{ height: 280, background: "#f5f5f5", borderRadius: 12 }} />
        ) : properties.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
              gap: 28,
            }}
          >
            {properties.slice(0, 6).map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        ) : (
          <div style={{ padding: "60px 0", textAlign: "center", color: "#777" }}>
            No active listings found in {displayName}. Explore neighboring Texas territories.
          </div>
        )}
      </section>

      {/* ── EDITORIAL VALUATION ESTIMATOR ── */}
      <section style={{ background: "#0f172a", color: "#ffffff", padding: isMobile ? "48px 16px" : "80px 48px" }}>
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1.2fr 1fr",
            gap: 48,
            alignItems: "center",
          }}
        >
          <div>
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
                  color: "rgba(255,255,255,0.6)",
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                Confidential Valuation
              </span>
            </div>
            <h2
              style={{
                fontFamily: '"DM Serif Display", Georgia, serif',
                fontSize: isMobile ? 32 : 48,
                fontWeight: 400,
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                margin: "0 0 16px",
              }}
            >
              What is your {displayName} property worth in today's market?
            </h2>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 16, lineHeight: 1.7, margin: "0 0 28px" }}>
              Our bespoke valuation model synthesizes real-time off-market intelligence, historical closed comps, and current buyer demand to determine true market value.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "rgba(255,255,255,0.85)" }}>
                <Check size={16} color="#b40101" />
                <span>Zero automated algorithmic guesses — verified by licensed specialists</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "rgba(255,255,255,0.85)" }}>
                <Check size={16} color="#b40101" />
                <span>Comprehensive comparative market analysis (CMA) delivered privately</span>
              </div>
            </div>
          </div>

          {/* Clean Form Card */}
          <div
            style={{
              background: "#ffffff",
              color: "#111111",
              borderRadius: 16,
              padding: isMobile ? "28px 20px" : "36px 32px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
            }}
          >
            <h3 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 6px" }}>Request Private Assessment</h3>
            <p style={{ fontSize: 13, color: "#666", margin: "0 0 24px" }}>
              Provide the address of your residence for a complimentary valuation report.
            </p>

            <form onSubmit={handleValuationSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#555", marginBottom: 6 }}>
                  Residence Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. 4200 River Oaks Blvd"
                  value={valuationAddress}
                  onChange={(e) => setValuationAddress(e.target.value)}
                  style={{
                    width: "100%",
                    height: 44,
                    padding: "0 14px",
                    borderRadius: 8,
                    border: "1px solid #d0d0d0",
                    fontSize: 14,
                    outline: "none",
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#555", marginBottom: 6 }}>
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={valuationName}
                  onChange={(e) => setValuationName(e.target.value)}
                  style={{
                    width: "100%",
                    height: 44,
                    padding: "0 14px",
                    borderRadius: 8,
                    border: "1px solid #d0d0d0",
                    fontSize: 14,
                    outline: "none",
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#555", marginBottom: 6 }}>
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={valuationEmail}
                  onChange={(e) => setValuationEmail(e.target.value)}
                  style={{
                    width: "100%",
                    height: 44,
                    padding: "0 14px",
                    borderRadius: 8,
                    border: "1px solid #d0d0d0",
                    fontSize: 14,
                    outline: "none",
                  }}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submittingValuation}
                style={{
                  height: 48,
                  marginTop: 8,
                  background: "#b40101",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: submittingValuation ? "not-allowed" : "pointer",
                  opacity: submittingValuation ? 0.7 : 1,
                  transition: "background 0.15s",
                }}
              >
                {submittingValuation ? "Processing Request..." : "Request Valuation Report"}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ── NEIGHBORHOOD DIRECTORY ── */}
      <section style={{ maxWidth: 1320, margin: "0 auto", padding: isMobile ? "48px 16px" : "80px 32px" }}>
        <h2
          style={{
            fontFamily: '"DM Serif Display", Georgia, serif',
            fontSize: isMobile ? 26 : 36,
            fontWeight: 400,
            color: "#111",
            margin: "0 0 12px",
          }}
        >
          Explore {displayName} Enclaves &amp; Neighborhoods
        </h2>
        <p style={{ color: "#666", fontSize: 15, margin: "0 0 32px" }}>
          Discover distinct architectural pockets, school districts, and premier urban developments.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(3, 1fr)",
            gap: 16,
          }}
        >
          {neighborhoods.map((n, i) => (
            <div
              key={i}
              onClick={() => navigate(`/properties?q=${city}+${n}`)}
              style={{
                padding: "24px 20px",
                background: "#ffffff",
                borderRadius: 10,
                border: "1px solid #ebebeb",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#111";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#ebebeb";
                e.currentTarget.style.transform = "none";
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: "#111" }}>{n}</span>
                <ArrowRight size={14} color="#888" />
              </div>
              <span style={{ fontSize: 12, color: "#888", display: "block", marginTop: 4 }}>View Available Homes</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
