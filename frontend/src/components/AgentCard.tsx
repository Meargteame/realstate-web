import React from "react";
import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Award, ArrowRight, ShieldCheck } from "lucide-react";
import { useIsMobile } from "../hooks/useBreakpoint";

export default function AgentCard({ agent }: { agent: any }) {
  const isMobile = useIsMobile();

  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: 12,
        border: "1px solid #ebebeb",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.08)";
        e.currentTarget.style.borderColor = "#ddd";
        e.currentTarget.style.transform = "translateY(-3px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.borderColor = "#ebebeb";
        e.currentTarget.style.transform = "none";
      }}
    >
      {/* Agent Portrait */}
      <Link
        to={`/agents/${agent.id}`}
        style={{
          position: "relative",
          width: "100%",
          height: isMobile ? 260 : 300,
          background: "#f3f3f3",
          display: "block",
          overflow: "hidden",
          textDecoration: "none",
        }}
      >
        <img
          src={agent.imageUrl || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80"}
          alt={agent.name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "top center",
            transition: "transform 0.4s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        />
        {/* Territory Tag */}
        <div
          style={{
            position: "absolute",
            bottom: 12,
            left: 12,
            background: "rgba(0,0,0,0.75)",
            color: "#fff",
            fontSize: 11,
            fontWeight: 700,
            padding: "4px 10px",
            borderRadius: 4,
            backdropFilter: "blur(4px)",
            letterSpacing: "0.04em",
          }}
        >
          {agent.location || "Texas Luxury Specialist"}
        </div>
      </Link>

      {/* Body Info */}
      <div style={{ padding: "20px 20px 24px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
            <Link
              to={`/agents/${agent.id}`}
              style={{
                fontFamily: '"DM Serif Display", Georgia, serif',
                fontSize: 20,
                color: "#111",
                textDecoration: "none",
                fontWeight: 400,
                lineHeight: 1.2,
              }}
            >
              {agent.name}
            </Link>
            <ShieldCheck size={16} color="#166534" />
          </div>

          <span style={{ fontSize: 12, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 14 }}>
            {agent.brokerage || "Torra Private Client Group"}
          </span>

          {/* Specialties / Languages */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
            {(agent.specialties?.split(",") || ["Commercial", "Luxury Homes"]).slice(0, 2).map((s: string, i: number) => (
              <span
                key={i}
                style={{
                  background: "#f5f5f5",
                  color: "#444",
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "3px 8px",
                  borderRadius: 4,
                }}
              >
                {s.trim()}
              </span>
            ))}
            {agent.languages && agent.languages.length > 0 && (
              <span
                style={{
                  background: "#f5f5f5",
                  color: "#444",
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "3px 8px",
                  borderRadius: 4,
                }}
              >
                {agent.languages.join(", ")}
              </span>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 12 }}>
            {agent.phone && (
              <a
                href={`tel:${agent.phone}`}
                title={`Call ${agent.name}`}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "#f5f5f5",
                  color: "#333",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#ebebeb")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#f5f5f5")}
              >
                <Phone size={14} />
              </a>
            )}
            {agent.email && (
              <a
                href={`mailto:${agent.email}`}
                title={`Email ${agent.name}`}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "#f5f5f5",
                  color: "#333",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#ebebeb")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#f5f5f5")}
              >
                <Mail size={14} />
              </a>
            )}
          </div>

          <Link
            to={`/agents/${agent.id}`}
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#b40101",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <span>View Portfolio</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}
