import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Heart, Search, Menu, X, ChevronDown, LogOut, LayoutDashboard, User, Shield } from "lucide-react";
import TorraLogo from "./TorraLogo";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [savedCount, setSavedCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    try {
      const u = localStorage.getItem("torra_user");
      if (u) setCurrentUser(JSON.parse(u));
      const saved = JSON.parse(localStorage.getItem("torra_saved_properties") || "[]");
      if (Array.isArray(saved)) setSavedCount(saved.length);
    } catch {}
  }, [location.pathname]);

  const logout = () => {
    localStorage.removeItem("torra_user");
    setCurrentUser(null);
    setUserMenuOpen(false);
    navigate("/");
    window.location.reload();
  };

  const navLinks = [
    { label: "Buy", href: "/properties" },
    { label: "Rent", href: "/properties?status=For+Rent" },
    { label: "Sell", href: "/home-value" },
    { label: "Agents", href: "/agents" },
    { label: "Blog", href: "/blog" },
  ];

  return (
    <>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          background: "#fff",
          borderBottom: scrolled ? "1px solid #e5e5e5" : "1px solid #e5e5e5",
          boxShadow: scrolled ? "0 2px 12px rgba(0,0,0,0.07)" : "none",
          transition: "box-shadow 0.2s ease",
        }}
      >



        {/* Main nav */}
        <div
          style={{
            maxWidth: 1320,
            margin: "0 auto",
            padding: "0 32px",
            height: 68,
            display: "flex",
            alignItems: "center",
            gap: 40,
          }}
        >
          {/* Logo */}
          <Link
            to="/"
            style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", flexShrink: 0 }}
          >
            <TorraLogo size={38} color="#b40101" compact showText />
          </Link>

          {/* Desktop nav */}
          <nav
            style={{ display: "flex", gap: 4, flex: 1, alignItems: "center" }}
            className="hidden-mobile"
          >
            {navLinks.map((l) => {
              const active = location.pathname === l.href || (l.href !== "/" && location.pathname.startsWith(l.href.split("?")[0]));
              return (
                <Link
                  key={l.href}
                  to={l.href}
                  style={{
                    fontSize: 15,
                    fontWeight: active ? 700 : 500,
                    color: active ? "#111" : "#444",
                    textDecoration: "none",
                    padding: "6px 14px",
                    borderRadius: 6,
                    transition: "all 0.15s ease",
                    background: active ? "#f5f5f5" : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) e.currentTarget.style.background = "#f5f5f5";
                    e.currentTarget.style.color = "#111";
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "#444";
                    }
                  }}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          {/* Right side actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
            {/* Search icon */}
            <button
              onClick={() => navigate("/properties")}
              className="hidden-mobile"
              style={{
                background: "none",
                border: "none",
                width: 40,
                height: 40,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#444",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f5f5")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
              aria-label="Search"
            >
              <Search size={18} />
            </button>

            {/* Saved */}
            <button
              onClick={() => navigate("/saved-searches")}
              className="hidden-mobile"
              style={{
                background: "none",
                border: "none",
                width: 40,
                height: 40,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#444",
                position: "relative",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f5f5")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
              aria-label="Saved homes"
            >
              <Heart size={18} />
              {savedCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    background: "#b40101",
                    color: "#fff",
                    fontSize: 9,
                    fontWeight: 700,
                    borderRadius: "50%",
                    width: 14,
                    height: 14,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {savedCount}
                </span>
              )}
            </button>

            {/* User */}
            {currentUser ? (
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setUserMenuOpen((o) => !o)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: "#f5f5f5",
                    border: "1px solid #e5e5e5",
                    borderRadius: 8,
                    padding: "6px 12px 6px 8px",
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#111",
                    transition: "border-color 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#ccc")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#e5e5e5")}
                >
                  <img
                    src={
                      currentUser.imageUrl ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || "U")}&background=b40101&color=fff&size=64`
                    }
                    alt=""
                    style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover" }}
                  />
                  <span className="hidden-mobile">
                    {currentUser.name?.split(" ")[0] || "Account"}
                  </span>
                  <ChevronDown size={14} color="#888" />
                </button>

                {userMenuOpen && (
                  <>
                    <div
                      style={{ position: "fixed", inset: 0, zIndex: 99 }}
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: "calc(100% + 8px)",
                        right: 0,
                        background: "#fff",
                        border: "1px solid #e5e5e5",
                        borderRadius: 10,
                        boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                        width: 200,
                        zIndex: 100,
                        overflow: "hidden",
                        padding: "6px 0",
                      }}
                    >
                      <div style={{ padding: "10px 16px 8px", borderBottom: "1px solid #f0f0f0" }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>{currentUser.name}</div>
                        <div style={{ fontSize: 11, color: "#888", marginTop: 1, textTransform: "capitalize" }}>
                          {currentUser.role}
                        </div>
                      </div>
                      {[
                        { label: "My Account", icon: <User size={14} />, href: "/account" },
                        ...(currentUser.role === "agent" || currentUser.agentId
                          ? [{ label: "Command Center", icon: <LayoutDashboard size={14} />, href: "/command" }]
                          : []),
                        ...(currentUser.role === "admin"
                          ? [{ label: "Admin Portal", icon: <Shield size={14} />, href: "/admin" }]
                          : []),
                      ].map((item) => (
                        <button
                          key={item.href}
                          onClick={() => { navigate(item.href); setUserMenuOpen(false); }}
                          style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "9px 16px",
                            background: "none",
                            border: "none",
                            fontSize: 13,
                            fontWeight: 500,
                            color: "#333",
                            cursor: "pointer",
                            textAlign: "left",
                            transition: "background 0.12s",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#f9f9f9")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                        >
                          <span style={{ color: "#888" }}>{item.icon}</span>
                          {item.label}
                        </button>
                      ))}
                      <div style={{ borderTop: "1px solid #f0f0f0", marginTop: 4 }}>
                        <button
                          onClick={logout}
                          style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "9px 16px",
                            background: "none",
                            border: "none",
                            fontSize: 13,
                            fontWeight: 500,
                            color: "#b40101",
                            cursor: "pointer",
                            textAlign: "left",
                            transition: "background 0.12s",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#fff5f5")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                        >
                          <LogOut size={14} />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Link
                  to="/login"
                  className="hidden-mobile"
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#111",
                    textDecoration: "none",
                    padding: "0 18px",
                    height: 38,
                    display: "inline-flex",
                    alignItems: "center",
                    borderRadius: 6,
                    border: "1.5px solid #d0d0d0",
                    transition: "border-color 0.15s, background 0.15s",
                    background: "#fff",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#999";
                    e.currentTarget.style.background = "#fafafa";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#d0d0d0";
                    e.currentTarget.style.background = "#fff";
                  }}
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#fff",
                    textDecoration: "none",
                    padding: "0 18px",
                    height: 38,
                    display: "inline-flex",
                    alignItems: "center",
                    borderRadius: 6,
                    border: "1.5px solid #b40101",
                    background: "#b40101",
                    transition: "background 0.15s, border-color 0.15s",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#910101";
                    e.currentTarget.style.borderColor = "#910101";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#b40101";
                    e.currentTarget.style.borderColor = "#b40101";
                  }}
                >
                  Sign up
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(true)}
              className="visible-mobile"
              style={{
                background: "none",
                border: "none",
                width: 40,
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#333",
                marginLeft: 4,
              }}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {menuOpen && (
        <>
          <div
            onClick={() => setMenuOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.4)",
              zIndex: 2000,
              backdropFilter: "blur(2px)",
            }}
          />
          <nav
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              bottom: 0,
              width: 280,
              background: "#fff",
              zIndex: 2001,
              display: "flex",
              flexDirection: "column",
              boxShadow: "-8px 0 32px rgba(0,0,0,0.12)",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "20px 20px 16px",
                borderBottom: "1px solid #f0f0f0",
              }}
            >
              <TorraLogo size={32} color="#b40101" compact showText />
              <button
                onClick={() => setMenuOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#555" }}
              >
                <X size={22} />
              </button>
            </div>
            <div style={{ padding: "16px 12px", flex: 1 }}>
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  to={l.href}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: "block",
                    padding: "12px 12px",
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#111",
                    textDecoration: "none",
                    borderRadius: 8,
                    marginBottom: 2,
                    transition: "background 0.12s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f5f5")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  {l.label}
                </Link>
              ))}
            </div>
            <div style={{ padding: "16px 12px 32px", borderTop: "1px solid #f0f0f0", display: "flex", flexDirection: "column", gap: 8 }}>
              {currentUser ? (
                <button
                  onClick={logout}
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "none",
                    border: "1px solid #e5e5e5",
                    borderRadius: 8,
                    fontSize: 15,
                    fontWeight: 600,
                    color: "#b40101",
                    cursor: "pointer",
                  }}
                >
                  Sign Out
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    style={{
                      display: "block",
                      textAlign: "center",
                      padding: "12px",
                      border: "1px solid #e5e5e5",
                      borderRadius: 8,
                      fontSize: 15,
                      fontWeight: 600,
                      color: "#333",
                      textDecoration: "none",
                    }}
                  >
                    Log in
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMenuOpen(false)}
                    style={{
                      display: "block",
                      textAlign: "center",
                      padding: "12px",
                      background: "#b40101",
                      borderRadius: 8,
                      fontSize: 15,
                      fontWeight: 700,
                      color: "#fff",
                      textDecoration: "none",
                    }}
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </nav>
        </>
      )}
    </>
  );
}
