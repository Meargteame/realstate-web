import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { notification } from "antd";
import {
  ArrowLeft,
  Share2,
  Heart,
  MapPin,
  Check,
  Phone,
  Mail,
  MessageSquare,
  Maximize2,
  Calendar,
  Clock,
  Sparkles,
  ShieldCheck,
  X,
  ChevronLeft,
  ChevronRight,
  Calculator,
  Bed,
  Bath,
  Grid,
  TrendingUp,
  Building
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import PropertyChatModal from "../components/PropertyChatModal";
import PropertyCard from "../components/PropertyCard";
import { useIsMobile } from "../hooks/useBreakpoint";

const formatPrice = (val: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val);

export default function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState<any>(null);
  const [agent, setAgent] = useState<any>(null);
  const [similarProperties, setSimilarProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [showChatModal, setShowChatModal] = useState(false);
  const [hasExistingChat, setHasExistingChat] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Mortgage Calculator state
  const [mortgageDown, setMortgageDown] = useState(20);
  const [mortgageRate, setMortgageRate] = useState(6.5);
  const [mortgageYears, setMortgageYears] = useState(30);
  const [priceHistory, setPriceHistory] = useState<any[]>([]);
  const isMobile = useIsMobile();

  const calcMonthlyPayment = (price: number) => {
    const principal = price * (1 - mortgageDown / 100);
    const monthlyRate = mortgageRate / 100 / 12;
    const numPayments = mortgageYears * 12;
    if (monthlyRate === 0) return principal / numPayments;
    return (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
  };

  const galleryImages = [
    property?.imageUrl,
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=85",
    "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1400&q=85",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=85",
    "https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1400&q=85",
  ].filter(Boolean);

  useEffect(() => {
    fetch(`/api/properties/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProperty(data);
        if (data?.agent) setAgent(data.agent);

        if (data?.id && data?.agent?.id) {
          const storageKey = `conversation_${data.id}_${data.agent.id}`;
          const stored = localStorage.getItem(storageKey);
          if (stored) {
            setHasExistingChat(true);
            try {
              const convData = JSON.parse(stored);
              checkUnreadMessages(convData.conversationId);
            } catch (error) {
              console.error("Error parsing stored conversation:", error);
            }
          }
        }
        setLoading(false);
      })
      .catch((err: any) => {
        console.error(err);
        setLoading(false);
      });

    fetch(`/api/properties/${id}/similar?limit=3`)
      .then((res) => res.json())
      .then((data) => setSimilarProperties(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error fetching similar properties:", err));

    fetch(`/api/properties/${id}/price-history`)
      .then((res) => res.json())
      .then((data) => setPriceHistory(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error fetching price history:", err));
  }, [id]);

  const handleShare = async () => {
    const shareData = {
      title: property.address,
      text: `Tour this luxury listing at ${property.address} via Torra`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      notification.success({ message: "Link Copied", description: "Listing URL copied to clipboard" });
    }
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    notification.success({
      message: isSaved ? "Removed from Portfolio" : "Saved to Portfolio",
      description: isSaved ? "Residence removed from your saved collection." : "Residence bookmarked in your private collection.",
    });
  };

  const checkUnreadMessages = async (conversationId: string) => {
    try {
      const res = await fetch(`/api/messages/conversation/${conversationId}`);
      if (!res.ok) return;
      const messages = await res.json();
      const lastReadKey = `lastRead_${conversationId}`;
      const lastReadTime = localStorage.getItem(lastReadKey);
      if (lastReadTime) {
        const unread = messages.filter(
          (msg: any) => msg.senderType === "agent" && new Date(msg.createdAt) > new Date(lastReadTime)
        ).length;
        setUnreadCount(unread);
      } else {
        const unread = messages.filter((msg: any) => msg.senderType === "agent").length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error("Error checking unread messages:", error);
    }
  };

  useEffect(() => {
    if (!hasExistingChat || !property?.id || !agent?.id) return;
    const storageKey = `conversation_${property.id}_${agent.id}`;
    const stored = localStorage.getItem(storageKey);
    if (!stored) return;
    try {
      const convData = JSON.parse(stored);
      checkUnreadMessages(convData.conversationId);
      const interval = setInterval(() => checkUnreadMessages(convData.conversationId), 10000);
      return () => clearInterval(interval);
    } catch (error) {}
  }, [hasExistingChat, property?.id, agent?.id]);

  if (loading) {
    return (
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "60px 24px" }}>
        <div style={{ height: 480, background: "#f5f5f5", borderRadius: 16, marginBottom: 32 }} />
        <div style={{ height: 40, width: "40%", background: "#f5f5f5", borderRadius: 8, marginBottom: 16 }} />
        <div style={{ height: 24, width: "60%", background: "#f5f5f5", borderRadius: 8 }} />
      </div>
    );
  }

  if (!property) {
    return (
      <div style={{ padding: "120px 24px", textAlign: "center", maxWidth: 500, margin: "0 auto" }}>
        <h2 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 32, marginBottom: 12 }}>Residence Not Found</h2>
        <p style={{ color: "#666", marginBottom: 24 }}>This listing may have been sold or removed from the public inventory.</p>
        <Link
          to="/properties"
          style={{
            display: "inline-flex",
            padding: "12px 24px",
            background: "#111",
            color: "#fff",
            borderRadius: 8,
            textDecoration: "none",
            fontWeight: 700,
          }}
        >
          Explore Available Listings
        </Link>
      </div>
    );
  }

  const pricePerSqFt = property.sqft ? Math.round(property.price / property.sqft) : null;

  return (
    <div style={{ background: "#ffffff", minHeight: "100vh" }}>
      {/* ── TOP BREADCRUMB / ACTION BAR ── */}
      <div
        style={{
          borderBottom: "1px solid #ebebeb",
          background: "#ffffff",
          position: "sticky",
          top: 68,
          zIndex: 30,
        }}
      >
        <div
          style={{
            maxWidth: 1320,
            margin: "0 auto",
            padding: isMobile ? "12px 16px" : "14px 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Link
            to="/properties"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              color: "#333",
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to Residences</span>
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              onClick={handleShare}
              style={{
                height: 38,
                padding: "0 14px",
                borderRadius: 8,
                border: "1px solid #d5d5d5",
                background: "#fff",
                color: "#111",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f7f7f7")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
            >
              <Share2 size={15} />
              <span>Share</span>
            </button>

            <button
              onClick={handleSave}
              style={{
                height: 38,
                padding: "0 16px",
                borderRadius: 8,
                border: isSaved ? "1.5px solid #b40101" : "1px solid #d5d5d5",
                background: isSaved ? "#fff5f5" : "#fff",
                color: isSaved ? "#b40101" : "#111",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                transition: "all 0.15s",
              }}
            >
              <Heart size={15} fill={isSaved ? "#b40101" : "none"} color={isSaved ? "#b40101" : "#111"} />
              <span>{isSaved ? "Saved" : "Save Listing"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── ARCHITECTURAL PHOTO MOSAIC ── */}
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: isMobile ? "16px 16px 0" : "24px 32px 0" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "3fr 2fr",
            gap: 10,
            borderRadius: 16,
            overflow: "hidden",
            position: "relative",
            maxHeight: isMobile ? 320 : 540,
          }}
        >
          {/* Main Hero Photo */}
          <div
            onClick={() => {
              setActivePhotoIndex(0);
              setShowGallery(true);
            }}
            style={{
              position: "relative",
              cursor: "pointer",
              height: isMobile ? 320 : 540,
              overflow: "hidden",
            }}
          >
            <img
              src={galleryImages[0]}
              alt={property.address}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "transform 0.5s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            />
            {property.status && (
              <span
                style={{
                  position: "absolute",
                  top: 20,
                  left: 20,
                  background: property.status === "For Rent" ? "#111" : "#b40101",
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 800,
                  padding: "5px 10px",
                  borderRadius: 6,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                {property.status}
              </span>
            )}
          </div>

          {/* 4-Image Grid (Desktop only) */}
          {!isMobile && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gridTemplateRows: "1fr 1fr",
                gap: 10,
                height: 540,
              }}
            >
              {galleryImages.slice(1, 5).map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setActivePhotoIndex(idx + 1);
                    setShowGallery(true);
                  }}
                  style={{
                    position: "relative",
                    cursor: "pointer",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={img}
                    alt={`Property view ${idx + 2}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transition: "transform 0.4s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  />
                  {idx === 3 && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(0,0,0,0.35)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        gap: 8,
                        fontSize: 14,
                        fontWeight: 700,
                        backdropFilter: "blur(2px)",
                      }}
                    >
                      <Grid size={18} />
                      <span>View all {galleryImages.length} photos</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Mobile All Photos Button */}
          {isMobile && (
            <button
              onClick={() => setShowGallery(true)}
              style={{
                position: "absolute",
                bottom: 16,
                right: 16,
                background: "rgba(0,0,0,0.75)",
                color: "#fff",
                border: "none",
                borderRadius: 20,
                padding: "6px 14px",
                fontSize: 12,
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                backdropFilter: "blur(4px)",
              }}
            >
              <Grid size={14} />
              <span>{galleryImages.length} Photos</span>
            </button>
          )}
        </div>
      </div>

      {/* ── CORE RESIDENCE CONTENT & SHOWING SIDEBAR ── */}
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: isMobile ? "24px 16px 80px" : "36px 32px 96px" }}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr", gap: 48, alignItems: "start" }}>
          {/* ── LEFT COLUMN: MAIN ARCHITECTURAL DETAILS ── */}
          <div>
            {/* Header info */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "#b40101",
                  }}
                >
                  {property.propertyType || "Luxury Residence"}
                </span>
                {property.isVerified && (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#166534",
                      background: "#dcfce7",
                      padding: "2px 8px",
                      borderRadius: 12,
                    }}
                  >
                    <ShieldCheck size={13} />
                    Verified Exclusive
                  </span>
                )}
              </div>

              {/* Massive Serif Price */}
              <h1
                style={{
                  fontFamily: '"DM Serif Display", Georgia, serif',
                  fontSize: isMobile ? 36 : 52,
                  fontWeight: 400,
                  color: "#111",
                  letterSpacing: "-0.02em",
                  margin: "0 0 8px",
                  lineHeight: 1.05,
                }}
              >
                {formatPrice(property.price)}
              </h1>

              {/* Address */}
              <p style={{ fontSize: 18, color: "#555", margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
                <MapPin size={18} color="#888" style={{ flexShrink: 0 }} />
                <span>
                  {property.address}, {property.city}, {property.state} {property.zip}
                </span>
              </p>
            </div>

            {/* Key Specs Ribbon */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                padding: "20px 0",
                borderTop: "1px solid #eee",
                borderBottom: "1px solid #eee",
                marginBottom: 36,
              }}
            >
              <div>
                <span style={{ fontSize: 12, color: "#888", fontWeight: 600, display: "block" }}>Bedrooms</span>
                <span style={{ fontSize: 22, fontWeight: 800, color: "#111" }}>{property.beds || "—"}</span>
              </div>
              <div>
                <span style={{ fontSize: 12, color: "#888", fontWeight: 600, display: "block" }}>Bathrooms</span>
                <span style={{ fontSize: 22, fontWeight: 800, color: "#111" }}>{property.baths || "—"}</span>
              </div>
              <div>
                <span style={{ fontSize: 12, color: "#888", fontWeight: 600, display: "block" }}>Square Feet</span>
                <span style={{ fontSize: 22, fontWeight: 800, color: "#111" }}>
                  {property.sqft ? property.sqft.toLocaleString() : "—"}
                </span>
              </div>
              <div>
                <span style={{ fontSize: 12, color: "#888", fontWeight: 600, display: "block" }}>Price / Sq Ft</span>
                <span style={{ fontSize: 22, fontWeight: 800, color: "#111" }}>
                  {pricePerSqFt ? `$${pricePerSqFt}` : "—"}
                </span>
              </div>
            </div>

            {/* Narrative Description */}
            <div style={{ marginBottom: 40 }}>
              <h2
                style={{
                  fontFamily: '"DM Serif Display", Georgia, serif',
                  fontSize: 28,
                  fontWeight: 400,
                  color: "#111",
                  margin: "0 0 16px",
                }}
              >
                The Residence
              </h2>
              <p
                style={{
                  fontSize: 16,
                  lineHeight: 1.8,
                  color: "#444",
                  margin: 0,
                  whiteSpace: "pre-line",
                }}
              >
                {property.description ||
                  `Exquisitely designed ${property.propertyType?.toLowerCase() || "residence"} positioned in the prestigious enclave of ${property.city}. This architectural masterpiece offers an expansive open concept, floor-to-ceiling glazing, and museum-grade finishes throughout. The chef's kitchen features imported quartz surfaces, custom cabinetry, and premium integrated appliances. An effortless flow between indoor grand living and outdoor sanctuary creates an exceptional environment for entertaining.`}
              </p>
            </div>

            {/* Architectural & Key Features */}
            <div style={{ marginBottom: 44 }}>
              <h2
                style={{
                  fontFamily: '"DM Serif Display", Georgia, serif',
                  fontSize: 24,
                  fontWeight: 400,
                  color: "#111",
                  margin: "0 0 20px",
                }}
              >
                Features &amp; Finishes
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                  gap: "14px 24px",
                }}
              >
                {(Array.isArray(property.features) && property.features.length > 0
                  ? property.features
                  : [
                      "Custom European Oak Hardwood Flooring",
                      "Sub-Zero & Wolf Professional Appliance Suite",
                      "Primary Suite with Dual Walk-in Dressing Rooms",
                      "Motorized Solar & Privacy Shades",
                      "Multi-zone Smart Climate & Lutron Lighting",
                      "Private Outdoor Terrace & Heated Pool",
                      "Attached Multi-Car Climate-Controlled Garage",
                      "24/7 Monitored Security Integration",
                    ]
                ).map((feature: string, idx: number) => (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        background: "#f0fdf4",
                        color: "#166534",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Check size={13} strokeWidth={3} />
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#333" }}>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Property Facts Matrix */}
            <div style={{ marginBottom: 44 }}>
              <h2
                style={{
                  fontFamily: '"DM Serif Display", Georgia, serif',
                  fontSize: 24,
                  fontWeight: 400,
                  color: "#111",
                  margin: "0 0 20px",
                }}
              >
                Property Details &amp; Architecture
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3, 1fr)",
                  gap: 16,
                  background: "#fafafa",
                  padding: 24,
                  borderRadius: 12,
                  border: "1px solid #ebebeb",
                }}
              >
                <div>
                  <span style={{ fontSize: 12, color: "#777", fontWeight: 600, display: "block" }}>Property Type</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>{property.propertyType || "Single Family"}</span>
                </div>
                <div>
                  <span style={{ fontSize: 12, color: "#777", fontWeight: 600, display: "block" }}>Year Built</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>{property.yearBuilt || "2022"}</span>
                </div>
                <div>
                  <span style={{ fontSize: 12, color: "#777", fontWeight: 600, display: "block" }}>Lot Size</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>
                    {property.lotSize ? `${property.lotSize.toLocaleString()} sqft` : "0.32 Acres"}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: 12, color: "#777", fontWeight: 600, display: "block" }}>HOA Dues</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>
                    {property.hoaFees ? `${formatPrice(property.hoaFees)} / mo` : "None"}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: 12, color: "#777", fontWeight: 600, display: "block" }}>Property Condition</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>{property.condition || "Pristine"}</span>
                </div>
                <div>
                  <span style={{ fontSize: 12, color: "#777", fontWeight: 600, display: "block" }}>Days on Market</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>{property.daysOnMarket || "14"} Days</span>
                </div>
              </div>
            </div>

            {/* Historical Price Trend */}
            {priceHistory.length > 1 && (
              <div style={{ marginBottom: 44 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <TrendingUp size={20} color="#b40101" />
                  <h2 style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: 24, fontWeight: 400, color: "#111", margin: 0 }}>
                    Valuation &amp; Price History
                  </h2>
                </div>
                <div style={{ width: "100%", height: 260, padding: "16px 0", background: "#fafafa", borderRadius: 12, border: "1px solid #eee" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={priceHistory.map((h: any) => ({
                        date: new Date(h.changedAt).toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
                        price: h.price,
                      }))}
                      margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e8" />
                      <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#777" }} />
                      <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12, fill: "#777" }} width={65} />
                      <RechartsTooltip formatter={(v: any) => formatPrice(Number(v))} />
                      <Line type="monotone" dataKey="price" stroke="#b40101" strokeWidth={2.5} dot={{ r: 5, fill: "#b40101" }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN: STICKY INQUIRY & AGENT PANEL ── */}
          <div style={{ position: isMobile ? "static" : "sticky", top: 130 }}>
            <div
              style={{
                background: "#ffffff",
                border: "1px solid #e5e5e5",
                borderRadius: 16,
                padding: "28px 24px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
                marginBottom: 24,
              }}
            >
              <h3 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 6px", color: "#111" }}>
                Request a Private Showing
              </h3>
              <p style={{ fontSize: 13, color: "#666", margin: "0 0 20px" }}>
                Connect directly with the listing specialist for a discrete in-person or virtual walkthrough.
              </p>

              {/* Agent Badge */}
              {agent && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "14px 16px",
                    background: "#f9f9f9",
                    borderRadius: 12,
                    marginBottom: 20,
                  }}
                >
                  <img
                    src={agent.imageUrl || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80"}
                    alt={agent.name}
                    style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover" }}
                  />
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#111" }}>{agent.name}</div>
                    <div style={{ fontSize: 12, color: "#777" }}>{agent.brokerage || "Torra Commercial & Luxury Group"}</div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <button
                  onClick={() => setShowChatModal(true)}
                  style={{
                    height: 48,
                    background: "#b40101",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    position: "relative",
                  }}
                >
                  <MessageSquare size={16} />
                  <span>{hasExistingChat ? "Continue Conversation" : "Message Listing Specialist"}</span>
                  {unreadCount > 0 && (
                    <span
                      style={{
                        position: "absolute",
                        top: -6,
                        right: -6,
                        background: "#111",
                        color: "#fff",
                        fontSize: 11,
                        fontWeight: 800,
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {unreadCount}
                    </span>
                  )}
                </button>

                {agent?.phone && (
                  <a
                    href={`tel:${agent.phone}`}
                    style={{
                      height: 44,
                      background: "#fff",
                      color: "#111",
                      border: "1px solid #d5d5d5",
                      borderRadius: 8,
                      fontSize: 14,
                      fontWeight: 600,
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    <Phone size={15} />
                    <span>Call ({agent.phone})</span>
                  </a>
                )}
              </div>
            </div>

            {/* ── MORTGAGE ESTIMATOR ── */}
            <div
              style={{
                background: "#ffffff",
                border: "1px solid #e5e5e5",
                borderRadius: 16,
                padding: "24px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <Calculator size={18} color="#b40101" />
                <h4 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Estimated Payment</h4>
              </div>

              <div
                style={{
                  background: "#111111",
                  color: "#ffffff",
                  padding: "18px 20px",
                  borderRadius: 12,
                  marginBottom: 16,
                }}
              >
                <span style={{ fontSize: 12, color: "#999", display: "block" }}>Est. Monthly Cost</span>
                <span
                  style={{
                    fontFamily: '"DM Serif Display", serif',
                    fontSize: 32,
                    fontWeight: 400,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {formatPrice(calcMonthlyPayment(property.price))}
                </span>
                <span style={{ fontSize: 13, color: "#bbb", marginLeft: 4 }}>/mo</span>
              </div>

              {/* Slider Inputs */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                    <span>Down Payment</span>
                    <span>{mortgageDown}% (${((property.price * mortgageDown) / 100).toLocaleString()})</span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={50}
                    value={mortgageDown}
                    onChange={(e) => setMortgageDown(Number(e.target.value))}
                    style={{ width: "100%", accentColor: "#b40101" }}
                  />
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                    <span>Interest Rate</span>
                    <span>{mortgageRate}%</span>
                  </div>
                  <input
                    type="range"
                    min={3}
                    max={10}
                    step={0.1}
                    value={mortgageRate}
                    onChange={(e) => setMortgageRate(Number(e.target.value))}
                    style={{ width: "100%", accentColor: "#b40101" }}
                  />
                </div>

                <div>
                  <span style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6 }}>Loan Duration</span>
                  <div style={{ display: "flex", gap: 8 }}>
                    {[15, 20, 30].map((y) => (
                      <button
                        key={y}
                        onClick={() => setMortgageYears(y)}
                        style={{
                          flex: 1,
                          height: 34,
                          border: mortgageYears === y ? "1.5px solid #111" : "1px solid #d5d5d5",
                          background: mortgageYears === y ? "#111" : "#fff",
                          color: mortgageYears === y ? "#fff" : "#333",
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        {y} Yrs
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── SIMILAR RESIDENCES CAROUSEL / GRID ── */}
        {similarProperties.length > 0 && (
          <div style={{ marginTop: 64, paddingTop: 48, borderTop: "1px solid #eaeaea" }}>
            <h2
              style={{
                fontFamily: '"DM Serif Display", Georgia, serif',
                fontSize: 32,
                fontWeight: 400,
                color: "#111",
                marginBottom: 24,
              }}
            >
              Similar Architectural Residences
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
                gap: 24,
              }}
            >
              {similarProperties.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── FULL SCREEN PHOTO GALLERY OVERLAY ── */}
      {showGallery && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "#000000",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Top Bar */}
          <div
            style={{
              padding: "20px 28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              color: "#fff",
              zIndex: 10,
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 600 }}>
              {activePhotoIndex + 1} / {galleryImages.length}
            </span>
            <button
              onClick={() => setShowGallery(false)}
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "none",
                borderRadius: "50%",
                width: 40,
                height: 40,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Large Image Container */}
          <div
            style={{
              flex: 1,
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 24px 24px",
            }}
          >
            <img
              src={galleryImages[activePhotoIndex]}
              alt={`Photo ${activePhotoIndex + 1}`}
              style={{
                maxWidth: "100%",
                maxHeight: "85vh",
                objectFit: "contain",
                borderRadius: 8,
              }}
            />

            {/* Prev / Next buttons */}
            {galleryImages.length > 1 && (
              <>
                <button
                  onClick={() => setActivePhotoIndex((i) => (i === 0 ? galleryImages.length - 1 : i - 1))}
                  style={{
                    position: "absolute",
                    left: 24,
                    background: "rgba(255,255,255,0.15)",
                    border: "none",
                    borderRadius: "50%",
                    width: 48,
                    height: 48,
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={() => setActivePhotoIndex((i) => (i === galleryImages.length - 1 ? 0 : i + 1))}
                  style={{
                    position: "absolute",
                    right: 24,
                    background: "rgba(255,255,255,0.15)",
                    border: "none",
                    borderRadius: "50%",
                    width: 48,
                    height: 48,
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── AGENT DIRECT CHAT MODAL ── */}
      <PropertyChatModal
        visible={showChatModal}
        onClose={() => {
          setShowChatModal(false);
          if (property?.id && agent?.id) {
            const storageKey = `conversation_${property.id}_${agent.id}`;
            const stored = localStorage.getItem(storageKey);
            if (stored) {
              try {
                const convData = JSON.parse(stored);
                localStorage.setItem(`lastRead_${convData.conversationId}`, new Date().toISOString());
                setUnreadCount(0);
              } catch (e) {}
            }
            setHasExistingChat(!!stored);
          }
        }}
        property={property}
        agent={agent}
      />
    </div>
  );
}
