import React, { useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import TorraLogo from "@/components/TorraLogo";
import { useIsMobile } from "../hooks/useBreakpoint";

export default function ForgotPassword() {
  const isMobile = useIsMobile();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json().catch(() => ({ error: "Invalid server response" }));
      if (!res.ok) {
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      setSent(true);
      if (data.devResetUrl) setDevResetUrl(data.devResetUrl);
    } catch (err: any) {
      setError(err.message || "Failed to send reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
        overflow: "hidden",
        background: "#ffffff",
      }}
    >
      {/* ── LEFT ARCHITECTURAL VISUAL PANEL ── */}
      {!isMobile && (
        <div
          style={{
            position: "relative",
            height: "100%",
            background: "#0f172a",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "48px",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: 'url("https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=85")',
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.1) 100%)",
            }}
          />

          {/* Top Logo */}
          <div style={{ position: "relative", zIndex: 10 }}>
            <Link to="/" style={{ textDecoration: "none" }}>
              <TorraLogo variant="light" />
            </Link>
          </div>

          {/* Bottom Editorial Quote */}
          <div style={{ position: "relative", zIndex: 10, maxWidth: 460 }}>
            <p
              style={{
                fontFamily: '"DM Serif Display", serif',
                fontSize: 28,
                color: "#ffffff",
                lineHeight: 1.25,
                margin: "0 0 12px",
              }}
            >
              "Security and discretion are foundational to luxury property advisory."
            </p>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Torra Client Security
            </span>
          </div>
        </div>
      )}

      {/* ── RIGHT FORM PANEL ── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: isMobile ? "32px 20px" : "48px 64px",
          overflowY: "auto",
        }}
      >
        <div style={{ maxWidth: 400, width: "100%" }}>
          <Link
            to="/login"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              fontWeight: 600,
              color: "#666",
              textDecoration: "none",
              marginBottom: 32,
            }}
          >
            <ArrowLeft size={14} />
            <span>Back to Login</span>
          </Link>

          <h1
            style={{
              fontFamily: '"DM Serif Display", Georgia, serif',
              fontSize: 34,
              fontWeight: 400,
              color: "#111",
              margin: "0 0 8px",
            }}
          >
            Recover Credentials
          </h1>
          <p style={{ color: "#666", fontSize: 14, margin: "0 0 32px" }}>
            Enter your account email to receive an authenticated password reset link.
          </p>

          {sent ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  padding: "16px",
                  background: "#dcfce7",
                  border: "1px solid #bbf7d0",
                  borderRadius: 8,
                  color: "#166534",
                  fontSize: 14,
                }}
              >
                <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: 2 }} />
                <span>
                  If an account is associated with <strong>{email.trim()}</strong>, an authorized reset link has been dispatched.
                </span>
              </div>

              {devResetUrl && (
                <div style={{ padding: "12px", background: "#f5f5f5", borderRadius: 8, fontSize: 12, wordBreak: "break-all" }}>
                  <span style={{ fontWeight: 700, display: "block", marginBottom: 4 }}>Dev Reset URL:</span>
                  <Link to={devResetUrl.replace(/^https?:\/\/[^/]+/, "")} style={{ color: "#b40101" }}>
                    {devResetUrl}
                  </Link>
                </div>
              )}

              <Link
                to="/login"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 46,
                  background: "#111",
                  color: "#fff",
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 14,
                  textDecoration: "none",
                  marginTop: 8,
                }}
              >
                Return to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#555", marginBottom: 6 }}>
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: "100%",
                    height: 46,
                    padding: "0 14px",
                    borderRadius: 8,
                    border: "1px solid #d5d5d5",
                    fontSize: 14,
                    outline: "none",
                  }}
                />
              </div>

              {error && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "#fee2e2", borderRadius: 6, color: "#991b1b", fontSize: 13 }}>
                  <AlertCircle size={15} style={{ flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  height: 48,
                  background: "#b40101",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.7 : 1,
                  transition: "background 0.15s",
                }}
              >
                {loading ? "Transmitting..." : "Send Reset Link"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
