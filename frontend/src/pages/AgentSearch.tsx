import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { notification } from "antd";
import {
  Search,
  Globe,
  Award,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  UserCheck
} from "lucide-react";
import AgentCard from "@/components/AgentCard";
import { useIsMobile } from "../hooks/useBreakpoint";

export default function AgentSearch() {
  const isMobile = useIsMobile();
  const [agents, setAgents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [showLuxuryOnly, setShowLuxuryOnly] = useState(false);

  const fetchAgents = (q?: string) => {
    setLoading(true);
    const url = q ? `/api/agents?q=${encodeURIComponent(q)}` : "/api/agents";
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setAgents(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
        notification.error({ message: "Network Error", description: "Could not retrieve licensed advisor roster." });
      });
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAgents(searchQuery);
  };

  const filteredAgents = agents.filter((agent) => {
    if (selectedLanguage && !agent.languages?.includes(selectedLanguage)) {
      return false;
    }
    if (showLuxuryOnly && !agent.isLuxury) {
      return false;
    }
    return true;
  });

  return (
    <div style={{ background: "#fbfbfb", minHeight: "100vh" }}>
      {/* ── EDITORIAL HEADER & ROSTER HERO ── */}
      <section
        style={{
          background: "#ffffff",
          borderBottom: "1px solid #eaeaea",
          padding: isMobile ? "36px 16px 32px" : "56px 32px 48px",
        }}
      >
        <div style={{ maxWidth: 1320, margin: "0 auto" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              marginBottom: 14,
              borderLeft: "3px solid #b40101",
              paddingLeft: 12,
            }}
          >
            <span
              style={{
                color: "#666",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              Private Client Advisory
            </span>
          </div>

          <h1
            style={{
              fontFamily: '"DM Serif Display", Georgia, serif',
              fontSize: isMobile ? 32 : 52,
              fontWeight: 400,
              color: "#111",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              margin: "0 0 12px",
            }}
          >
            The Torra Licensed Specialists
          </h1>

          <p style={{ color: "#666", fontSize: 16, margin: "0 0 32px", maxWidth: 640 }}>
            Connect with Texas' foremost real estate advisors specializing in commercial acquisition, trophy residential estates, and discrete off-market transactions.
          </p>

          {/* Search Bar & Filter Controls */}
          <form
            onSubmit={handleSearch}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            {/* Search Input Box */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "#f4f4f4",
                borderRadius: 8,
                padding: "0 16px",
                flex: isMobile ? "1 1 100%" : "0 1 440px",
                height: 46,
              }}
            >
              <Search size={18} color="#777" style={{ flexShrink: 0, marginRight: 10 }} />
              <input
                type="text"
                placeholder="Find specialist by name, city, or specialty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: "none",
                  background: "transparent",
                  width: "100%",
                  fontSize: 14,
                  outline: "none",
                  color: "#111",
                }}
              />
            </div>

            {/* Language Selector */}
            <div style={{ position: "relative" }}>
              <select
                value={selectedLanguage || ""}
                onChange={(e) => setSelectedLanguage(e.target.value || null)}
                style={{
                  height: 46,
                  padding: "0 32px 0 14px",
                  borderRadius: 8,
                  border: selectedLanguage ? "1.5px solid #111" : "1px solid #d5d5d5",
                  background: selectedLanguage ? "#111" : "#fff",
                  color: selectedLanguage ? "#fff" : "#111",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  appearance: "none",
                  outline: "none",
                }}
              >
                <option value="" style={{ color: "#111", background: "#fff" }}>All Languages</option>
                <option value="English" style={{ color: "#111", background: "#fff" }}>English</option>
                <option value="Spanish" style={{ color: "#111", background: "#fff" }}>Spanish</option>
                <option value="Mandarin" style={{ color: "#111", background: "#fff" }}>Mandarin</option>
                <option value="French" style={{ color: "#111", background: "#fff" }}>French</option>
              </select>
              <ChevronDown
                size={14}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                  color: selectedLanguage ? "#fff" : "#666",
                }}
              />
            </div>

            {/* Luxury Toggle */}
            <button
              type="button"
              onClick={() => setShowLuxuryOnly(!showLuxuryOnly)}
              style={{
                height: 46,
                padding: "0 18px",
                borderRadius: 8,
                border: showLuxuryOnly ? "1.5px solid #b40101" : "1px solid #d5d5d5",
                background: showLuxuryOnly ? "#fff5f5" : "#fff",
                color: showLuxuryOnly ? "#b40101" : "#333",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                transition: "all 0.15s",
              }}
            >
              <Award size={16} />
              <span>Luxury Certified</span>
            </button>

            {/* Submit */}
            <button
              type="submit"
              style={{
                height: 46,
                padding: "0 24px",
                borderRadius: 8,
                border: "none",
                background: "#b40101",
                color: "#fff",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#910101")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#b40101")}
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* ── AGENT DIRECTORY GRID ── */}
      <section style={{ maxWidth: 1320, margin: "0 auto", padding: isMobile ? "32px 16px 80px" : "48px 32px 96px" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 28 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#777", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            {filteredAgents.length} {filteredAgents.length === 1 ? "Specialist" : "Specialists"} Available
          </span>
          {(selectedLanguage || showLuxuryOnly || searchQuery) && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedLanguage(null);
                setShowLuxuryOnly(false);
                fetchAgents("");
              }}
              style={{
                border: "none",
                background: "none",
                color: "#b40101",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Reset Filters
            </button>
          )}
        </div>

        {loading ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 28,
            }}
          >
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} style={{ height: 380, background: "#f0f0f0", borderRadius: 12 }} />
            ))}
          </div>
        ) : filteredAgents.length === 0 ? (
          <div style={{ padding: "80px 20px", textAlign: "center", maxWidth: 440, margin: "0 auto" }}>
            <UserCheck size={40} color="#999" style={{ margin: "0 auto 16px" }} />
            <h3 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 24, margin: "0 0 8px" }}>
              No Specialists Found
            </h3>
            <p style={{ color: "#666", fontSize: 14, margin: "0 0 20px" }}>
              We couldn't find any advisors matching your criteria. Try adjusting your query or resetting language filters.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 28,
            }}
          >
            {filteredAgents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
