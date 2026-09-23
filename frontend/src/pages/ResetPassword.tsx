import React, { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle2, Eye, EyeOff, ArrowLeft } from "lucide-react";
import TorraLogo from "@/components/TorraLogo";
import { useIsMobile } from "../hooks/useBreakpoint";

export default function ResetPassword() {
  const isMobile = useIsMobile();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const missingParams = !token || !email;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password) {
      setError("New password is required.");
      return;
    }
    if (!confirm) {
      setError("Please confirm your new password.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, password }),
      });

      const data = await res.json().catch(() => ({ error: "Invalid server response" }));
      if (!res.ok) {
        throw new Error(data.error || "Failed to reset password.");
      }

      setDone(true);
      setTimeout(() => navigate("/login"), 2500);
    } catch (err: any) {
      setError(err.message || "Failed to reset password. Please try again.");
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

          <div style={{ position: "relative", zIndex: 10 }}>
            <Link to="/" style={{ textDecoration: "none" }}>
              <TorraLogo variant="light" />
            </Link>
          </div>

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
          <h1
            style={{
              fontFamily: '"DM Serif Display", Georgia, serif',
              fontSize: 34,
              fontWeight: 400,
              color: "#111",
              margin: "0 0 8px",
            }}
          >
            Create New Password
          </h1>
          <p style={{ color: "#666", fontSize: 14, margin: "0 0 32px" }}>
            {email ? (
              <>
                Setting credentials for <strong>{email}</strong>
              </>
            ) : (
              "Set a secure password for your Torra account."
            )}
          </p>

          {missingParams ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", gap: 12, padding: "16px", background: "#fee2e2", borderRadius: 8, color: "#991b1b", fontSize: 14 }}>
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
                <span>This reset link has expired or is invalid. Please request a new link.</span>
              </div>
              <Link
                to="/forgot-password"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 46,
                  background: "#b40101",
                  color: "#fff",
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 14,
                  textDecoration: "none",
                }}
              >
                Request New Link
              </Link>
            </div>
          ) : done ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", gap: 12, padding: "16px", background: "#dcfce7", borderRadius: 8, color: "#166534", fontSize: 14 }}>
                <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: 2 }} />
                <span>Your credentials have been securely updated. Redirecting to login...</span>
              </div>
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
                }}
              >
                Go to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#555", marginBottom: 6 }}>
                  New Password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: "100%",
                      height: 46,
                      padding: "0 40px 0 14px",
                      borderRadius: 8,
                      border: "1px solid #d5d5d5",
                      fontSize: 14,
                      outline: "none",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      color: "#777",
                      padding: 0,
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#555", marginBottom: 6 }}>
                  Confirm Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Re-enter password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
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
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
