import React, { useState, useEffect } from "react";
import { message } from "antd";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";

interface PropertyCardProps {
  property: any;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [imgErr, setImgErr] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("torra_saved_properties") || "[]");
      if (Array.isArray(saved) && saved.includes(property.id)) setIsSaved(true);
    } catch {}
  }, [property.id]);

  const toggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      let saved = JSON.parse(localStorage.getItem("torra_saved_properties") || "[]");
      if (!Array.isArray(saved)) saved = [];
      if (isSaved) {
        saved = saved.filter((id: string) => id !== property.id);
        message.info("Removed from saved homes");
      } else {
        saved.push(property.id);
        message.success("Saved to your homes");
      }
      localStorage.setItem("torra_saved_properties", JSON.stringify(saved));
      setIsSaved(!isSaved);
    } catch {
      setIsSaved((s) => !s);
    }
  };

  const price = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(property.price || 0);

  const isRent = property.status === "For Rent";
  const isNew = property.daysOnMarket != null && property.daysOnMarket <= 7;

  const imgSrc =
    !imgErr && property.imageUrl
      ? property.imageUrl
      : "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=900&q=80";

  return (
    <Link
      to={`/properties/${property.id}`}
      className="property-card"
      style={{ display: "block", textDecoration: "none", height: "100%" }}
    >
      <article
        style={{
          background: "#fff",
          borderRadius: "4px",
          overflow: "hidden",
          border: "1px solid #e8e8e8",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          transition: "box-shadow 0.22s ease, transform 0.22s ease",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,0,0,0.12)";
          e.currentTarget.style.transform = "translateY(-3px)";
          const img = e.currentTarget.querySelector<HTMLImageElement>(".pc-img");
          if (img) img.style.transform = "scale(1.04)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = "none";
          e.currentTarget.style.transform = "translateY(0)";
          const img = e.currentTarget.querySelector<HTMLImageElement>(".pc-img");
          if (img) img.style.transform = "scale(1)";
        }}
      >
        {/* ── Image ── */}
        <div
          style={{
            position: "relative",
            aspectRatio: "4/3",
            overflow: "hidden",
            background: "#f0f0f0",
            flexShrink: 0,
          }}
        >
          <img
            className="pc-img"
            src={imgSrc}
            alt={property.address || "Property"}
            loading="lazy"
            onError={() => setImgErr(true)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              transition: "transform 0.4s ease",
            }}
          />

          {/* Status pill — top left */}
          <span
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              background: isRent ? "#1a1a1a" : "#b40101",
              color: "#fff",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.07em",
              textTransform: "uppercase",
              padding: "4px 10px",
              borderRadius: "2px",
            }}
          >
            {isRent ? "For Rent" : isNew ? "Just Listed" : "For Sale"}
          </span>

          {/* Save button — top right */}
          <button
            onClick={toggleSave}
            aria-label={isSaved ? "Remove from saved" : "Save property"}
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              background: "rgba(255,255,255,0.92)",
              border: "none",
              borderRadius: "50%",
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "transform 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.12)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <Heart
              size={16}
              strokeWidth={2}
              color={isSaved ? "#b40101" : "#666"}
              fill={isSaved ? "#b40101" : "none"}
            />
          </button>

          {/* Days on market — bottom right */}
          {property.daysOnMarket != null && (
            <span
              style={{
                position: "absolute",
                bottom: 10,
                right: 12,
                color: "rgba(255,255,255,0.85)",
                fontSize: "11px",
                fontWeight: 600,
              }}
            >
              {property.daysOnMarket === 0
                ? "Listed today"
                : `${property.daysOnMarket}d on market`}
            </span>
          )}
        </div>

        {/* ── Info ── */}
        <div
          style={{
            padding: "16px 18px 18px",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          {/* Price */}
          <div
            style={{
              fontSize: "22px",
              fontWeight: 800,
              color: "#111",
              letterSpacing: "-0.03em",
              lineHeight: 1,
            }}
          >
            {price}
            {isRent && (
              <span style={{ fontSize: "13px", fontWeight: 500, color: "#777" }}>
                {" "}
                /mo
              </span>
            )}
          </div>

          {/* Beds / Baths / Sqft */}
          <div
            style={{
              fontSize: "13px",
              color: "#333",
              fontWeight: 500,
              display: "flex",
              gap: 8,
              alignItems: "center",
            }}
          >
            {property.beds != null && (
              <span>
                <strong>{property.beds}</strong>{" "}
                <span style={{ color: "#888" }}>bd</span>
              </span>
            )}
            {property.baths != null && (
              <>
                <span style={{ color: "#ddd" }}>|</span>
                <span>
                  <strong>{property.baths}</strong>{" "}
                  <span style={{ color: "#888" }}>ba</span>
                </span>
              </>
            )}
            {property.sqft > 0 && (
              <>
                <span style={{ color: "#ddd" }}>|</span>
                <span>
                  <strong>{(property.sqft || 0).toLocaleString()}</strong>{" "}
                  <span style={{ color: "#888" }}>sqft</span>
                </span>
              </>
            )}
          </div>

          {/* Address */}
          <div
            style={{
              fontSize: "13px",
              color: "#555",
              fontWeight: 400,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              marginTop: 2,
            }}
          >
            {[property.address, property.city, property.state]
              .filter(Boolean)
              .join(", ")}
          </div>

          {/* Agent name — bottom */}
          {property.agent?.name && (
            <div
              style={{
                marginTop: "auto",
                paddingTop: 12,
                borderTop: "1px solid #f0f0f0",
                fontSize: "12px",
                color: "#999",
                fontWeight: 500,
              }}
            >
              {property.agent.name}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
