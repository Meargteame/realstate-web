import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Hero from "@/components/Hero";
import PropertyCard from "@/components/PropertyCard";
import { ArrowRight, ArrowUpRight } from "lucide-react";

/* ─── tiny helpers ─── */
const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

const MARKETS = [
  { city: "Austin", state: "TX", median: "$585K", img: "https://images.unsplash.com/photo-1531218150217-54595bc2b934?auto=format&fit=crop&w=800&q=80" },
  { city: "Miami", state: "FL", median: "$640K", img: "https://images.unsplash.com/photo-1535498730771-e735b998cd64?auto=format&fit=crop&w=800&q=80" },
  { city: "Dallas", state: "TX", median: "$475K", img: "https://images.unsplash.com/photo-1546154288-3e3f1d2234d1?auto=format&fit=crop&w=800&q=80" },
  { city: "Charlotte", state: "NC", median: "$420K", img: "https://images.unsplash.com/photo-1575917649705-5b59aaa12e6b?auto=format&fit=crop&w=800&q=80" },
  { city: "Denver", state: "CO", median: "$530K", img: "https://images.unsplash.com/photo-1619468129361-605ebea04b44?auto=format&fit=crop&w=800&q=80" },
];

/* ─── scroll-reveal hook ─── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

/* ─── Reveal wrapper ─── */
function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "luxury" | "rent" | "commercial">("all");

  useEffect(() => {
    fetch("/api/properties?limit=9")
      .then((r) => r.json())
      .then((d) => { setProperties(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = (() => {
    const p = properties;
    if (filter === "luxury") return p.filter((x) => x.price >= 1_000_000).slice(0, 6);
    if (filter === "rent") return p.filter((x) => x.status === "For Rent").slice(0, 6);
    if (filter === "commercial") return p.filter((x) => x.propertyType === "Commercial").slice(0, 6);
    return p.slice(0, 6);
  })();

  return (
    <main style={{ background: "#fff", color: "#111" }}>
      {/* ──── Hero ──── */}
      <Hero />

      {/* ──── Featured Listings ──── */}
      <section style={{ padding: "96px 0" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px" }}>
          
          {/* Section header */}
          <Reveal>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 48 }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#b40101", marginBottom: 12 }}>
                  Featured Listings
                </p>
                <h2 style={{ fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1.08, color: "#111", margin: 0 }}>
                  Homes worth seeing.
                </h2>
              </div>

              {/* Filter tabs */}
              <div style={{ display: "flex", gap: 4 }}>
                {(["all", "luxury", "rent", "commercial"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    style={{
                      padding: "8px 16px",
                      fontSize: 13,
                      fontWeight: 600,
                      border: "1px solid",
                      borderColor: filter === f ? "#111" : "#e0e0e0",
                      background: filter === f ? "#111" : "#fff",
                      color: filter === f ? "#fff" : "#555",
                      borderRadius: 6,
                      cursor: "pointer",
                      transition: "all 0.15s",
                      textTransform: "capitalize",
                    }}
                  >
                    {f === "all" ? "All" : f === "luxury" ? "Luxury" : f === "rent" ? "For Rent" : "Commercial"}
                  </button>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Property grid */}
          {loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{ borderRadius: 4, background: "#f5f5f5", aspectRatio: "4/3", animation: "pulse 1.5s ease-in-out infinite" }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0", color: "#999", fontSize: 16 }}>
              No properties in this category yet.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
                gap: 24,
              }}
            >
              {filtered.map((p, i) => (
                <Reveal key={p.id} delay={i * 60}>
                  <PropertyCard property={p} />
                </Reveal>
              ))}
            </div>
          )}

          <Reveal delay={200}>
            <div style={{ textAlign: "center", marginTop: 56 }}>
              <button
                onClick={() => navigate("/properties")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#111",
                  background: "transparent",
                  border: "1.5px solid #111",
                  borderRadius: 6,
                  padding: "14px 32px",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  letterSpacing: "0.01em",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#111"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#111"; }}
              >
                Browse all listings
                <ArrowRight size={16} />
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ──── Markets — horizontal editorial strip ──── */}
      <section style={{ background: "#0a0a0a", padding: "96px 0", overflow: "hidden" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px" }}>
          <Reveal>
            <div style={{ marginBottom: 48 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#b40101", marginBottom: 12 }}>
                Active Markets
              </p>
              <h2 style={{ fontSize: "clamp(28px, 3.5vw, 48px)", fontWeight: 900, letterSpacing: "-0.03em", color: "#fff", margin: 0, lineHeight: 1.1 }}>
                Where people are moving.
              </h2>
            </div>
          </Reveal>

          {/* City grid — asymmetric */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: 12 }}>
            {MARKETS.map((m, i) => (
              <Reveal key={m.city} delay={i * 70}>
                <Link
                  to={`/properties?q=${m.city}`}
                  style={{ textDecoration: "none", display: "block" }}
                >
                  <div
                    style={{
                      position: "relative",
                      height: i === 0 ? 440 : 212,
                      overflow: "hidden",
                      borderRadius: 4,
                      cursor: "pointer",
                      background: "#1a1a1a",
                    }}
                    onMouseEnter={(e) => {
                      const img = e.currentTarget.querySelector<HTMLElement>(".mkt-img");
                      if (img) img.style.transform = "scale(1.06)";
                    }}
                    onMouseLeave={(e) => {
                      const img = e.currentTarget.querySelector<HTMLElement>(".mkt-img");
                      if (img) img.style.transform = "scale(1)";
                    }}
                  >
                    <img
                      className="mkt-img"
                      src={m.img}
                      alt={m.city}
                      style={{
                        position: "absolute", inset: 0,
                        width: "100%", height: "100%",
                        objectFit: "cover",
                        opacity: 0.65,
                        transition: "transform 0.5s ease",
                      }}
                    />
                    {/* Scrim */}
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)" }} />
                    
                    {/* Text */}
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: i === 0 ? "24px 28px" : "16px 18px" }}>
                      <div style={{ fontSize: i === 0 ? 28 : 18, fontWeight: 900, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1 }}>
                        {m.city}
                      </div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 4 }}>
                        {m.state} · Median {m.median}
                      </div>
                    </div>

                    {/* Arrow */}
                    <div style={{ position: "absolute", top: 14, right: 14 }}>
                      <ArrowUpRight size={18} color="rgba(255,255,255,0.6)" />
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ──── Big statement ──── */}
      <section style={{ padding: "120px 40px", textAlign: "center" }}>
        <Reveal>
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <h2 style={{
              fontSize: "clamp(36px, 5vw, 72px)",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              lineHeight: 1.05,
              color: "#111",
              margin: "0 0 32px",
            }}>
              $480M in closed transactions.
              <br />
              <span style={{ color: "#b40101" }}>One focus:</span> yours.
            </h2>
            <p style={{ fontSize: 18, color: "#666", lineHeight: 1.7, marginBottom: 44, maxWidth: 560, margin: "0 auto 44px" }}>
              Whether you're buying your first home, selling a portfolio, or acquiring commercial space — 
              our advisors have seen it before and know what it takes.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
              <button
                onClick={() => navigate("/agents")}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: "#b40101", color: "#fff",
                  border: "none", borderRadius: 6,
                  padding: "15px 32px", fontSize: 15, fontWeight: 700,
                  cursor: "pointer", transition: "background 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#910101")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#b40101")}
              >
                Meet our agents <ArrowRight size={16} />
              </button>
              <button
                onClick={() => navigate("/home-value")}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: "transparent", color: "#111",
                  border: "1.5px solid #ccc", borderRadius: 6,
                  padding: "15px 32px", fontSize: 15, fontWeight: 700,
                  cursor: "pointer", transition: "all 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#111"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#ccc"; }}
              >
                Get a home estimate
              </button>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ──── Divider strip ──── */}
      <div style={{ background: "#f5f5f5", borderTop: "1px solid #e8e8e8", borderBottom: "1px solid #e8e8e8" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px" }}>
          <div style={{ display: "flex", gap: 0 }}>
            {[
              { num: "1,450+", label: "Active Listings" },
              { num: "14 days", label: "Avg. Time to Offer" },
              { num: "99.4%", label: "List-to-Sale Ratio" },
              { num: "$480M+", label: "Total Volume Closed" },
            ].map((s, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  padding: "40px 32px",
                  borderRight: i < 3 ? "1px solid #e8e8e8" : "none",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 36, fontWeight: 900, letterSpacing: "-0.03em", color: "#111" }}>{s.num}</div>
                <div style={{ fontSize: 13, color: "#888", marginTop: 4, fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ──── Full-width luxury photo CTA ──── */}
      <section style={{ position: "relative", height: 560, overflow: "hidden" }}>
        <img
          src="https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=2000&q=85"
          alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 35%" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)" }} />
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "flex-start", justifyContent: "center",
          maxWidth: 1280, margin: "0 auto", padding: "0 80px",
          left: "50%", transform: "translateX(-50%)", width: "100%",
        }}>
          <Reveal>
            <>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#b40101", marginBottom: 16 }}>
                Sell with Torra
              </p>
              <h2 style={{ fontSize: "clamp(30px, 4vw, 58px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.08, margin: "0 0 24px", maxWidth: 520 }}>
                Know what your home is worth — today.
              </h2>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 17, lineHeight: 1.6, marginBottom: 36, maxWidth: 440 }}>
                Get an accurate market valuation from our team, not an algorithm.
              </p>
              <button
                onClick={() => navigate("/home-value")}
                style={{
                  background: "#fff", color: "#111",
                  border: "none", borderRadius: 6,
                  padding: "15px 32px", fontSize: 15, fontWeight: 800,
                  cursor: "pointer", transition: "all 0.15s",
                  display: "inline-flex", alignItems: "center", gap: 8,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#f5f5f5"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; }}
              >
                Get your estimate <ArrowRight size={16} />
              </button>
            </>
          </Reveal>
        </div>
      </section>

      {/* ──── Property types — minimal text links ──── */}
      <section style={{ padding: "96px 0", borderBottom: "1px solid #f0f0f0" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px" }}>
          <Reveal>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#999", marginBottom: 40 }}>
              Browse by type
            </p>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1px", background: "#f0f0f0", border: "1px solid #f0f0f0" }}>
            {[
              { label: "Single Family Homes", count: "840+ listings", href: "/properties?propertyType=Single+Family" },
              { label: "Luxury Estates", count: "$1M+ listings", href: "/properties?minPrice=1000000" },
              { label: "Condos & Lofts", count: "310+ units", href: "/properties?propertyType=Condo" },
              { label: "Commercial Spaces", count: "120+ spaces", href: "/properties?propertyType=Commercial" },
              { label: "Rental Properties", count: "250+ leases", href: "/properties?status=For+Rent" },
              { label: "Land & Development", count: "90+ lots", href: "/properties?propertyType=Land" },
            ].map((item, i) => (
              <Link
                key={i}
                to={item.href}
                style={{ textDecoration: "none", background: "#fff" }}
              >
                <div
                  style={{
                    padding: "36px 32px",
                    borderRight: i % 3 < 2 ? "1px solid #f0f0f0" : "none",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                >
                  <div>
                    <div style={{ fontSize: 17, fontWeight: 700, color: "#111", marginBottom: 4 }}>{item.label}</div>
                    <div style={{ fontSize: 13, color: "#999" }}>{item.count}</div>
                  </div>
                  <ArrowUpRight size={18} color="#ccc" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ──── Blog teaser ──── */}
      <section style={{ padding: "96px 0" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px" }}>
          <Reveal>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 48 }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#b40101", marginBottom: 12 }}>
                  Market Insights
                </p>
                <h2 style={{ fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: 900, letterSpacing: "-0.03em", color: "#111", margin: 0, lineHeight: 1.1 }}>
                  What's happening in real estate.
                </h2>
              </div>
              <Link to="/blog" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 700, color: "#111", textDecoration: "none" }}>
                All articles <ArrowRight size={14} />
              </Link>
            </div>
          </Reveal>
          
          {/* 3-col editorial blog preview */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32 }}>
            {[
              { title: "Fed Rate Cuts: What It Means for Your Mortgage", cat: "Finance", date: "Sep 2026", img: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=700&q=80" },
              { title: "Texas Real Estate: Where Are Buyers Moving in 2026?", cat: "Markets", date: "Sep 2026", img: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=700&q=80" },
              { title: "Luxury vs. Ultra-Luxury: Understanding the Difference", cat: "Luxury", date: "Aug 2026", img: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=700&q=80" },
            ].map((post, i) => (
              <Reveal key={i} delay={i * 80}>
                <Link to="/blog" style={{ textDecoration: "none", display: "block" }}>
                  <div
                    style={{ overflow: "hidden", borderRadius: 4, marginBottom: 20, aspectRatio: "16/10", background: "#f0f0f0" }}
                    onMouseEnter={(e) => {
                      const img = e.currentTarget.querySelector<HTMLElement>("img");
                      if (img) img.style.transform = "scale(1.04)";
                    }}
                    onMouseLeave={(e) => {
                      const img = e.currentTarget.querySelector<HTMLElement>("img");
                      if (img) img.style.transform = "scale(1)";
                    }}
                  >
                    <img src={post.img} alt={post.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" }} />
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#b40101", marginBottom: 8 }}>
                    {post.cat}
                  </div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: "#111", lineHeight: 1.4, margin: "0 0 8px", letterSpacing: "-0.01em" }}>
                    {post.title}
                  </h3>
                  <div style={{ fontSize: 12, color: "#aaa" }}>{post.date}</div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ──── Bottom CTA band ──── */}
      <section style={{ background: "#111", padding: "80px 40px", textAlign: "center" }}>
        <Reveal>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#b40101", marginBottom: 20 }}>
            Ready to start?
          </p>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 52px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.03em", margin: "0 0 20px" }}>
            Your next chapter is one search away.
          </h2>
          <p style={{ fontSize: 16, color: "#666", marginBottom: 36, maxWidth: 480, margin: "0 auto 36px" }}>
            Thousands of verified listings, expert agents, and market tools — all in one place.
          </p>
          <button
            onClick={() => navigate("/properties")}
            style={{
              background: "#b40101", color: "#fff", border: "none",
              borderRadius: 6, padding: "16px 40px",
              fontSize: 15, fontWeight: 800, cursor: "pointer",
              transition: "background 0.15s",
              display: "inline-flex", alignItems: "center", gap: 10,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#910101")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#b40101")}
          >
            Search homes now <ArrowRight size={16} />
          </button>
        </Reveal>
      </section>
    </main>
  );
}
