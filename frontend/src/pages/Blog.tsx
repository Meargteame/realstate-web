import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Clock,
  Eye,
  ArrowRight,
  BookOpen,
  Calendar,
  ChevronDown,
  Sparkles
} from "lucide-react";
import { useIsMobile } from "../hooks/useBreakpoint";

export default function Blog() {
  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchPosts();
    fetchCategories();
    fetchTags();
  }, [page, search, selectedCategory, selectedTag]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "9",
      });
      if (search) params.append("search", search);
      if (selectedCategory) params.append("category", selectedCategory);
      if (selectedTag) params.append("tag", selectedTag);

      const response = await fetch(`/api/blog?${params}`);
      const data = await response.json();
      setPosts(data.posts || []);
      setTotal(data.pagination?.total || 0);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/blog/categories");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await fetch("/api/blog/tags");
      const data = await response.json();
      setTags(data);
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const featuredPost = posts[0];
  const regularPosts = posts.slice(1);

  return (
    <div style={{ background: "#ffffff", minHeight: "100vh" }}>
      {/* ── EDITORIAL PUBLICATION HEADER ── */}
      <section
        style={{
          borderBottom: "1px solid #ebebeb",
          padding: isMobile ? "40px 16px 28px" : "64px 32px 40px",
          background: "#fafafa",
        }}
      >
        <div style={{ maxWidth: 1320, margin: "0 auto" }}>
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
                color: "#666",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
              }}
            >
              The Torra Journal · Market Intelligence &amp; Architecture
            </span>
          </div>

          <h1
            style={{
              fontFamily: '"DM Serif Display", Georgia, serif',
              fontSize: isMobile ? 36 : 60,
              fontWeight: 400,
              color: "#111",
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              margin: "0 0 16px",
            }}
          >
            Perspectives, Analysis &amp; Design
          </h1>

          <p style={{ color: "#666", fontSize: 17, lineHeight: 1.6, margin: "0 0 32px", maxWidth: 640 }}>
            Macroeconomic shifts, regional market benchmarks, luxury architectural profiles, and discrete acquisition commentary.
          </p>

          {/* Search & Category Pills */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "#ffffff",
                border: "1px solid #d5d5d5",
                borderRadius: 8,
                padding: "0 14px",
                height: 42,
                flex: isMobile ? "1 1 100%" : "0 1 360px",
              }}
            >
              <Search size={16} color="#777" style={{ marginRight: 8, flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search perspectives & reports..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ border: "none", width: "100%", outline: "none", fontSize: 13 }}
              />
            </div>

            {/* Category Pills */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                onClick={() => setSelectedCategory(null)}
                style={{
                  height: 38,
                  padding: "0 16px",
                  borderRadius: 20,
                  border: selectedCategory === null ? "1.5px solid #111" : "1px solid #d5d5d5",
                  background: selectedCategory === null ? "#111" : "#fff",
                  color: selectedCategory === null ? "#fff" : "#333",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                All Topics
              </button>
              {categories.map((c) => {
                const active = selectedCategory === c.slug;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(active ? null : c.slug)}
                    style={{
                      height: 38,
                      padding: "0 16px",
                      borderRadius: 20,
                      border: active ? "1.5px solid #b40101" : "1px solid #d5d5d5",
                      background: active ? "#fff5f5" : "#fff",
                      color: active ? "#b40101" : "#333",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── ARTICLES FEED ── */}
      <section style={{ maxWidth: 1320, margin: "0 auto", padding: isMobile ? "32px 16px 80px" : "56px 32px 96px" }}>
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 32 }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} style={{ height: 360, background: "#f0f0f0", borderRadius: 12 }} />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div style={{ padding: "80px 20px", textAlign: "center", maxWidth: 440, margin: "0 auto" }}>
            <BookOpen size={40} color="#999" style={{ margin: "0 auto 16px" }} />
            <h3 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 24, margin: "0 0 8px" }}>
              No Articles Found
            </h3>
            <p style={{ color: "#666", fontSize: 14, margin: "0 0 20px" }}>
              No publications match your selected topic or query. Try resetting your search filter.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setSelectedCategory(null);
                setSelectedTag(null);
              }}
              style={{
                height: 40,
                padding: "0 20px",
                background: "#111",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Reset Topics
            </button>
          </div>
        ) : (
          <div>
            {/* Featured Lead Story (Page 1 only) */}
            {featuredPost && page === 1 && !search && !selectedCategory && (
              <Link
                to={`/blog/${featuredPost.slug}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1.3fr 1fr",
                  gap: 36,
                  alignItems: "center",
                  background: "#ffffff",
                  borderRadius: 16,
                  border: "1px solid #ebebeb",
                  overflow: "hidden",
                  textDecoration: "none",
                  color: "inherit",
                  marginBottom: 56,
                  transition: "box-shadow 0.2s, border-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.06)";
                  e.currentTarget.style.borderColor = "#ddd";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.borderColor = "#ebebeb";
                }}
              >
                <div style={{ height: isMobile ? 240 : 420, overflow: "hidden" }}>
                  <img
                    src={featuredPost.coverImage || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"}
                    alt={featuredPost.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
                <div style={{ padding: isMobile ? "0 20px 24px" : "32px 40px 32px 0" }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      color: "#b40101",
                      display: "block",
                      marginBottom: 10,
                    }}
                  >
                    Featured Editorial
                  </span>
                  <h2
                    style={{
                      fontFamily: '"DM Serif Display", Georgia, serif',
                      fontSize: isMobile ? 26 : 38,
                      fontWeight: 400,
                      color: "#111",
                      lineHeight: 1.15,
                      letterSpacing: "-0.02em",
                      margin: "0 0 14px",
                    }}
                  >
                    {featuredPost.title}
                  </h2>
                  <p style={{ color: "#555", fontSize: 15, lineHeight: 1.6, margin: "0 0 20px" }}>
                    {featuredPost.excerpt || featuredPost.content?.slice(0, 180) + "..."}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 12, color: "#888" }}>
                    <span>{formatDate(featuredPost.publishedAt || featuredPost.createdAt)}</span>
                    <span>·</span>
                    <span>{featuredPost.readTime || "5 min"} read</span>
                  </div>
                </div>
              </Link>
            )}

            {/* Standard Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
                gap: 36,
              }}
            >
              {(page === 1 && !search && !selectedCategory ? regularPosts : posts).map((p) => (
                <Link
                  key={p.id}
                  to={`/blog/${p.slug}`}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    textDecoration: "none",
                    color: "inherit",
                    background: "#ffffff",
                    borderRadius: 12,
                    border: "1px solid #ebebeb",
                    overflow: "hidden",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.06)";
                    e.currentTarget.style.borderColor = "#ddd";
                    e.currentTarget.style.transform = "translateY(-3px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.borderColor = "#ebebeb";
                    e.currentTarget.style.transform = "none";
                  }}
                >
                  <div style={{ height: 220, overflow: "hidden", background: "#f3f3f3" }}>
                    <img
                      src={p.coverImage || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"}
                      alt={p.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      loading="lazy"
                    />
                  </div>

                  <div style={{ padding: "20px 22px 24px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        {p.categories && p.categories[0] && (
                          <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#b40101" }}>
                            {p.categories[0].name}
                          </span>
                        )}
                      </div>

                      <h3
                        style={{
                          fontFamily: '"DM Serif Display", Georgia, serif',
                          fontSize: 20,
                          fontWeight: 400,
                          color: "#111",
                          lineHeight: 1.25,
                          margin: "0 0 10px",
                        }}
                      >
                        {p.title}
                      </h3>

                      <p style={{ color: "#666", fontSize: 13, lineHeight: 1.6, margin: "0 0 16px" }}>
                        {p.excerpt || p.content?.slice(0, 110) + "..."}
                      </p>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #f0f0f0", paddingTop: 14, fontSize: 12, color: "#888" }}>
                      <span>{formatDate(p.publishedAt || p.createdAt)}</span>
                      <span style={{ fontWeight: 700, color: "#b40101", display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <span>Read</span>
                        <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
