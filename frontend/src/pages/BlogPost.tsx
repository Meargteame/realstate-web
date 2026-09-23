import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, Calendar, Share2, User, BookOpen, ArrowRight } from "lucide-react";
import SocialShare from "@/components/SocialShare";
import { useIsMobile } from "../hooks/useBreakpoint";

export default function BlogPost() {
  const isMobile = useIsMobile();
  const { slug } = useParams();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);

  useEffect(() => {
    fetchPost();
  }, [slug]);

  useEffect(() => {
    if (post) {
      document.title = `${post.title} | Torra Estate Journal`;
    }
  }, [post]);

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/blog/${slug}`);
      const data = await response.json();
      setPost(data);

      if (data.categories?.length > 0) {
        try {
          const catSlug = data.categories[0].slug;
          const relRes = await fetch(`/api/blog?category=${catSlug}&limit=3`);
          const relData = await relRes.json();
          setRelatedPosts((relData.posts || []).filter((p: any) => p.id !== data.id).slice(0, 3));
        } catch {}
      }
    } catch (error) {
      console.error("Error fetching blog post:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 840, margin: "80px auto", padding: "0 24px" }}>
        <div style={{ height: 40, width: "70%", background: "#f0f0f0", borderRadius: 8, marginBottom: 20 }} />
        <div style={{ height: 380, background: "#f0f0f0", borderRadius: 12, marginBottom: 32 }} />
      </div>
    );
  }

  if (!post) {
    return (
      <div style={{ padding: "120px 24px", textAlign: "center", maxWidth: 440, margin: "0 auto" }}>
        <h2 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 32, marginBottom: 12 }}>Article Not Found</h2>
        <p style={{ color: "#666", marginBottom: 24 }}>This journal entry may have been moved or archived.</p>
        <Link
          to="/blog"
          style={{
            padding: "10px 20px",
            background: "#111",
            color: "#fff",
            borderRadius: 8,
            textDecoration: "none",
            fontWeight: 700,
          }}
        >
          Return to Journal
        </Link>
      </div>
    );
  }

  return (
    <div style={{ background: "#ffffff", minHeight: "100vh" }}>
      {/* ── BREADCRUMB STRIP ── */}
      <div style={{ borderBottom: "1px solid #ebebeb", background: "#fafafa" }}>
        <div
          style={{
            maxWidth: 1000,
            margin: "0 auto",
            padding: isMobile ? "12px 16px" : "14px 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Link
            to="/blog"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              color: "#555",
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            <ArrowLeft size={15} />
            <span>Estate Journal</span>
          </Link>

          {post.categories && post.categories[0] && (
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#b40101" }}>
              {post.categories[0].name}
            </span>
          )}
        </div>
      </div>

      {/* ── ARTICLE HEADER ── */}
      <article style={{ maxWidth: 840, margin: "0 auto", padding: isMobile ? "32px 16px 80px" : "56px 24px 96px" }}>
        <h1
          style={{
            fontFamily: '"DM Serif Display", Georgia, serif',
            fontSize: isMobile ? 32 : 52,
            fontWeight: 400,
            color: "#111",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            margin: "0 0 20px",
          }}
        >
          {post.title}
        </h1>

        {post.excerpt && (
          <p
            style={{
              fontSize: 18,
              lineHeight: 1.6,
              color: "#555",
              margin: "0 0 28px",
              fontStyle: "italic",
            }}
          >
            {post.excerpt}
          </p>
        )}

        {/* Byline */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 0",
            borderTop: "1px solid #eee",
            borderBottom: "1px solid #eee",
            marginBottom: 36,
            fontSize: 13,
            color: "#666",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "#f0f0f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#444",
                fontWeight: 700,
              }}
            >
              {post.author?.name ? post.author.name[0] : "T"}
            </div>
            <div>
              <span style={{ fontWeight: 700, color: "#111", display: "block" }}>
                {post.author?.name || "Torra Advisory Group"}
              </span>
              <span style={{ fontSize: 11, color: "#888" }}>Managing Research Editor</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span>{formatDate(post.publishedAt || post.createdAt)}</span>
            <span>·</span>
            <span>{post.readTime || "5 min"} read</span>
          </div>
        </div>

        {/* Hero Cover Photo */}
        {post.coverImage && (
          <div
            style={{
              width: "100%",
              height: isMobile ? 260 : 480,
              borderRadius: 16,
              overflow: "hidden",
              marginBottom: 44,
              boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
            }}
          >
            <img src={post.coverImage} alt={post.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        )}

        {/* Article Body Content */}
        <div
          style={{
            fontSize: 17,
            lineHeight: 1.85,
            color: "#222",
            whiteSpace: "pre-line",
            fontFamily: '"DM Sans", system-ui, sans-serif',
          }}
        >
          {post.content}
        </div>

        {/* Social Share Ribbon */}
        <div style={{ marginTop: 48, paddingTop: 28, borderTop: "1px solid #eee", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#666" }}>
            Share Perspective
          </span>
          <SocialShare url={window.location.href} title={post.title} />
        </div>
      </article>

      {/* ── RELATED PERSPECTIVES ── */}
      {relatedPosts.length > 0 && (
        <section style={{ borderTop: "1px solid #ebebeb", background: "#fafafa", padding: isMobile ? "48px 16px" : "64px 32px 80px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <h2
              style={{
                fontFamily: '"DM Serif Display", Georgia, serif',
                fontSize: 28,
                fontWeight: 400,
                color: "#111",
                marginBottom: 32,
              }}
            >
              Related Perspectives
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
                gap: 28,
              }}
            >
              {relatedPosts.map((r) => (
                <Link
                  key={r.id}
                  to={`/blog/${r.slug}`}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    textDecoration: "none",
                    color: "inherit",
                    background: "#ffffff",
                    borderRadius: 12,
                    border: "1px solid #ebebeb",
                    overflow: "hidden",
                  }}
                >
                  <div style={{ height: 180, overflow: "hidden" }}>
                    <img
                      src={r.coverImage || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80"}
                      alt={r.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                  <div style={{ padding: 18 }}>
                    <h3 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 18, margin: "0 0 8px", color: "#111" }}>
                      {r.title}
                    </h3>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#b40101", display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <span>Read Perspective</span>
                      <ArrowRight size={12} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
