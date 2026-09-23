import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, AlertCircle, X } from "lucide-react";
import TorraLogo from "@/components/TorraLogo";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) return setError("Email is required.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError("Enter a valid email.");
    if (!password) return setError("Password is required.");

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json().catch(() => ({ error: "Invalid response" }));
      if (!res.ok) throw new Error(data.error || "Invalid credentials");

      localStorage.setItem("torra_user", JSON.stringify({
        id: data.id, agentId: data.agentId,
        firstName: data.name?.split(" ")[0] || "User",
        name: data.name, email: data.email,
        role: data.role, token: data.token,
      }));

      if (data.role === "admin") navigate("/admin");
      else if (data.role === "agent" || data.agentId) navigate("/command");
      else navigate("/account");
    } catch (err: any) {
      setError(err.message || "Failed to log in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#fff" }}>
      {/* ── Left: editorial photo panel ── */}
      <div
        style={{
          width: "48%",
          position: "relative",
          overflow: "hidden",
          flexShrink: 0,
          display: "none",
        }}
        className="login-panel"
      >
        <img
          src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85"
          alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 30%" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.38)" }} />
        
        {/* Bottom text */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "40px 48px" }}>
          <blockquote style={{ margin: 0 }}>
            <p style={{ fontSize: 22, fontWeight: 700, color: "#fff", lineHeight: 1.4, letterSpacing: "-0.02em", marginBottom: 16 }}>
              "Torra found us our dream home in three weeks. I don't think we could have done it without them."
            </p>
            <footer style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>
              — Sarah & James M., Austin TX
            </footer>
          </blockquote>
        </div>
      </div>

      {/* ── Right: form ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px clamp(24px, 8vw, 96px)",
          position: "relative",
        }}
      >
        {/* Close */}
        <button
          onClick={() => navigate("/")}
          aria-label="Close"
          style={{
            position: "absolute", top: 24, right: 24,
            background: "none", border: "none",
            width: 36, height: 36, borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "#aaa", transition: "all 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#f5f5f5"; e.currentTarget.style.color = "#111"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#aaa"; }}
        >
          <X size={18} />
        </button>

        <div style={{ maxWidth: 400, width: "100%" }}>
          {/* Logo */}
          <div style={{ marginBottom: 48 }}>
            <TorraLogo size={36} color="#b40101" compact showText />
          </div>

          {/* Heading */}
          <h1 style={{ fontSize: 32, fontWeight: 900, color: "#111", letterSpacing: "-0.03em", margin: "0 0 8px" }}>
            Welcome back.
          </h1>
          <p style={{ fontSize: 15, color: "#888", margin: "0 0 40px", fontWeight: 400 }}>
            Don't have an account?{" "}
            <Link to="/signup" style={{ color: "#b40101", fontWeight: 700, textDecoration: "none" }}>
              Sign up
            </Link>
          </p>

          <form onSubmit={handleLogin} noValidate style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Email */}
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#333", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                style={{
                  width: "100%", height: 52,
                  border: "1.5px solid #e0e0e0",
                  borderRadius: 8, padding: "0 16px",
                  fontSize: 15, color: "#111",
                  background: "#fff", outline: "none",
                  transition: "border-color 0.15s",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#b40101")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#e0e0e0")}
              />
            </div>

            {/* Password */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#333", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Password
                </label>
                <Link to="/forgot-password" style={{ fontSize: 12, color: "#b40101", fontWeight: 600, textDecoration: "none" }}>
                  Forgot?
                </Link>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  style={{
                    width: "100%", height: 52,
                    border: "1.5px solid #e0e0e0",
                    borderRadius: 8, padding: "0 48px 0 16px",
                    fontSize: 15, color: "#111",
                    background: "#fff", outline: "none",
                    transition: "border-color 0.15s",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#b40101")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#e0e0e0")}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((p) => !p)}
                  style={{
                    position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", color: "#aaa", padding: 0,
                  }}
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                background: "#fff5f5", border: "1px solid #fecaca",
                borderRadius: 8, padding: "12px 16px",
                color: "#b40101", fontSize: 13, fontWeight: 600,
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                height: 52, background: "#b40101",
                color: "#fff", border: "none",
                borderRadius: 8, fontSize: 15,
                fontWeight: 800, cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                transition: "background 0.15s",
                letterSpacing: "0.01em",
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "#910101"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#b40101"; }}
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>

      {/* Inline style for responsive panel */}
      <style>{`
        @media (min-width: 900px) {
          .login-panel { display: block !important; }
        }
      `}</style>
    </div>
  );
}
