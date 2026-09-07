import React, { useState, useEffect } from "react";
import Hero from "@/components/Hero";
import ExpertSection from "@/components/ExpertSection";
import EstateJournal from "@/components/EstateJournal";
import PropertyCard from "@/components/PropertyCard";
import { Button, Typography, Row, Col, Statistic, Space, Card } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useIsMobile } from "../hooks/useBreakpoint";
import {
  ArrowRightOutlined,
  HomeOutlined,
  UserOutlined,
  RiseOutlined,
  SafetyOutlined,
  SearchOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  HeartOutlined,
  GlobalOutlined,
  ThunderboltOutlined,
  StarFilled,
} from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;

const CITY_FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1531218150217-54595bc2b934?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1535498730771-e735b998cd64?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1546154288-3e3f1d2234d1?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1575917649705-5b59aaa12e6b?auto=format&fit=crop&w=600&q=80",
];

export default function Home() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [featuredProperties, setFeaturedProperties] = useState<any[]>([]);
  const [topAgents, setTopAgents] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [trendingCities, setTrendingCities] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/properties?limit=6")
      .then((r) => r.json())
      .then((data) => setFeaturedProperties(Array.isArray(data) ? data.slice(0, 6) : []))
      .catch(() => setFeaturedProperties([]));

    fetch("/api/agents?limit=4")
      .then((r) => r.json())
      .then((data) => setTopAgents(Array.isArray(data) ? data.slice(0, 4) : []))
      .catch(() => setTopAgents([]));

    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => setStats(data && !data.error ? data : null))
      .catch(() => setStats(null));

    fetch("/api/stats/trending-cities?limit=4")
      .then((r) => r.json())
      .then((data) => setTrendingCities(Array.isArray(data) ? data : []))
      .catch(() => setTrendingCities([]));
  }, []);

  const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k+` : `${n}`);
  const statItems = [
    { label: "Active Listings", value: stats ? fmt(stats.activeListings) : "—", icon: <HomeOutlined /> },
    { label: "Cities Served", value: stats ? `${stats.citiesServed}` : "—", icon: <EnvironmentOutlined /> },
    { label: "Expert Agents", value: stats ? fmt(stats.totalAgents) : "—", icon: <UserOutlined /> },
    { label: "Avg. Days on Market", value: stats && stats.avgDaysOnMarket ? `${stats.avgDaysOnMarket}` : "—", icon: <ClockCircleOutlined /> },
  ];

  const FALLBACK_CITIES = [
    { name: "Austin, TX", city: "Austin", count: 0 },
    { name: "Miami, FL", city: "Miami", count: 0 },
    { name: "Denver, CO", city: "Denver", count: 0 },
    { name: "Charlotte, NC", city: "Charlotte", count: 0 },
  ];
  const displayCities = (trendingCities.length > 0 ? trendingCities : FALLBACK_CITIES).map((c: any, i: number) => ({
    ...c,
    image: c.imageUrl || CITY_FALLBACK_IMAGES[i % CITY_FALLBACK_IMAGES.length],
  }));

  const sectionPadding = isMobile ? '40px 16px' : '96px 32px';
  const sectionTitleSize = isMobile ? '26px' : '44px';
  const btnSm = isMobile ? "middle" : "large";
  const btnH = isMobile ? '40px' : '52px';
  const btnP = isMobile ? '0 16px' : '0 32px';
  const btnR = isMobile ? '20px' : '26px';
  const btnFs = isMobile ? '12px' : '14px';

  return (
    <div style={{ background: "white" }}>
      <Hero />

      {/* Market Stats Bar */}
      <section style={{ background: "#111827", padding: isMobile ? "28px 16px" : "48px 32px" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <Row gutter={[isMobile ? 8 : 48, isMobile ? 16 : 24]} justify="center">
            {statItems.map((stat, i) => (
              <Col span={isMobile ? 12 : 6} key={i} style={{ textAlign: "center" }}>
                <div style={{ color: "#b40101", fontSize: isMobile ? "20px" : "28px", marginBottom: "4px" }}>{stat.icon}</div>
                <div style={{ color: "white", fontSize: isMobile ? "20px" : "28px", fontWeight: 900 }}>{stat.value}</div>
                <div style={{ color: "#9ca3af", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700, marginTop: "2px" }}>{stat.label}</div>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Featured Properties */}
      <section style={{ padding: sectionPadding, maxWidth: "1400px", margin: "0 auto", background: "white" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: isMobile ? "24px" : "48px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <Text strong style={{ color: "#b40101", fontSize: "12px", textTransform: "uppercase", letterSpacing: "2px", display: "block", marginBottom: "8px" }}>
              Curated for You
            </Text>
            <Title level={2} style={{ fontSize: sectionTitleSize, fontWeight: 900, margin: 0, letterSpacing: "-1px" }}>
              Featured Properties
            </Title>
          </div>
          <Button
            size={btnSm}
            onClick={() => navigate("/properties")}
            style={{
              borderColor: "#b40101",
              color: "#b40101",
              fontWeight: 700,
              height: btnH,
              padding: btnP,
              borderRadius: btnR,
              fontSize: btnFs,
            }}
            icon={<ArrowRightOutlined />}
            iconPosition="end"
          >
            View All Listings
          </Button>
        </div>

        <Row gutter={[isMobile ? 16 : 32, isMobile ? 16 : 32]}>
          {featuredProperties.length > 0 ? (
            featuredProperties.map((p) => (
              <Col xs={24} sm={12} lg={8} key={p.id}>
                <PropertyCard property={p} />
              </Col>
            ))
          ) : (
            [1, 2, 3, 4, 5, 6].map((i) => (
              <Col xs={24} sm={12} lg={8} key={i}>
                <div style={{ height: "380px", background: "#f3f4f6", borderRadius: "12px", animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }} />
              </Col>
            ))
          )}
        </Row>
      </section>

      {/* Why TORRA */}
      <section style={{ padding: sectionPadding, background: "linear-gradient(to bottom, #ffffff 0%, #fafafa 100%)" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: isMobile ? "28px" : "56px" }}>
            <Text strong style={{ color: "#b40101", fontSize: "12px", textTransform: "uppercase", letterSpacing: "2px", display: "block", marginBottom: "8px" }}>
              Why Choose Us
            </Text>
            <Title level={2} style={{ fontSize: sectionTitleSize, fontWeight: 900, margin: 0, letterSpacing: "-1px" }}>
              Why TORRA?
            </Title>
          </div>
          <Row gutter={[isMobile ? 16 : 32, isMobile ? 16 : 32]}>
            {[
              { icon: <TrophyOutlined />, title: "Top 1% Agents", desc: "Work exclusively with vetted, top-performing agents who deliver results above market average." },
              { icon: <HeartOutlined />, title: "Personalized Match", desc: "Our AI-powered matchmaking pairs you with the perfect agent based on your goals, budget, and timeline." },
              { icon: <GlobalOutlined />, title: "Nationwide Network", desc: "Access properties and agents across 150+ cities with local expertise in every neighborhood." },
              { icon: <ThunderboltOutlined />, title: "Lightning Fast", desc: "Close deals 30% faster with our streamlined digital process, from listing to closing." },
            ].map((item, i) => (
              <Col xs={24} sm={12} md={6} key={i}>
                <div
                  style={{
                    background: "white",
                    borderRadius: "12px",
                    padding: isMobile ? "28px 16px" : "40px 24px",
                    textAlign: "center",
                    border: "1px solid #f0f0f0",
                    transition: "all 0.3s",
                    cursor: "default",
                    height: "100%",
                  }}
                  onMouseEnter={(e) => {
                    if (isMobile) return;
                    e.currentTarget.style.transform = "translateY(-8px)";
                    e.currentTarget.style.boxShadow = "0 16px 40px rgba(180,1,1,0.12)";
                    e.currentTarget.style.borderColor = "#b40101";
                  }}
                  onMouseLeave={(e) => {
                    if (isMobile) return;
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.borderColor = "#f0f0f0";
                  }}
                >
                  <div style={{
                    width: "64px", height: "64px", background: "rgba(180,1,1,0.08)",
                    borderRadius: "50%", display: "flex", alignItems: "center",
                    justifyContent: "center", margin: "0 auto 16px",
                    color: "#b40101", fontSize: "26px"
                  }}>
                    {item.icon}
                  </div>
                  <Title level={4} style={{ fontSize: isMobile ? "16px" : "18px", fontWeight: 800, marginBottom: "8px" }}>{item.title}</Title>
                  <Paragraph style={{ color: "#6b7280", margin: 0, lineHeight: 1.7, fontSize: isMobile ? "14px" : "15px" }}>{item.desc}</Paragraph>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Trending Cities */}
      <section style={{ background: "#f8f9fa", padding: sectionPadding }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: isMobile ? "28px" : "56px" }}>
            <Text strong style={{ color: "#b40101", fontSize: "12px", textTransform: "uppercase", letterSpacing: "2px", display: "block", marginBottom: "8px" }}>
              Explore Markets
            </Text>
            <Title level={2} style={{ fontSize: sectionTitleSize, fontWeight: 900, margin: 0, letterSpacing: "-1px" }}>
              Trending Cities
            </Title>
          </div>

          <Row gutter={[isMobile ? 16 : 24, isMobile ? 16 : 24]}>
            {displayCities.map((city) => (
              <Col xs={24} sm={12} lg={6} key={city.name}>
                <div
                  onClick={() => navigate(`/properties?q=${city.name.split(",")[0]}`)}
                  style={{
                    position: "relative",
                    height: isMobile ? "240px" : "360px",
                    borderRadius: "12px",
                    overflow: "hidden",
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  }}
                >
                  <img
                    src={city.image}
                    alt={city.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s" }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)",
                    }}
                  />
                  <div style={{ position: "absolute", bottom: "16px", left: "16px", color: "white" }}>
                    <Title level={4} style={{ color: "white", margin: 0, fontWeight: 800, fontSize: isMobile ? "20px" : "24px" }}>
                      {city.name}
                    </Title>
                    <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: "13px", fontWeight: 500 }}>
                      {city.count > 0 ? `${city.count.toLocaleString()} listings` : "Explore market"}
                    </Text>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      <ExpertSection />

      {/* The Estate Journal — connected to /api/blog */}
      <EstateJournal />

      {/* Testimonials */}
      <section style={{ padding: sectionPadding, background: "#f8f9fa" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: isMobile ? "28px" : "56px" }}>
            <Text strong style={{ color: "#b40101", fontSize: "12px", textTransform: "uppercase", letterSpacing: "2px", display: "block", marginBottom: "8px" }}>
              Client Stories
            </Text>
            <Title level={2} style={{ fontSize: sectionTitleSize, fontWeight: 900, margin: 0, letterSpacing: "-1px" }}>
              What Our Clients Say
            </Title>
          </div>
          <Row gutter={[isMobile ? 16 : 32, isMobile ? 16 : 32]}>
            {[
              {
                name: "Sarah & Michael Thompson",
                role: "Home Buyers in Austin, TX",
                text: "TORRA matched us with an incredible agent who found our dream home in just 2 weeks. The process was seamless and stress-free. We couldn't be happier!",
                rating: 5,
              },
              {
                name: "James Rodriguez",
                role: "Property Investor in Miami, FL",
                text: "As an investor, I need agents who understand the market. TORRA's platform connected me with a top-tier agent who helped me close 3 properties under market value.",
                rating: 5,
              },
              {
                name: "Emily Chen",
                role: "First-Time Seller in Denver, CO",
                text: "Selling my first home was daunting, but my TORRA agent guided me through every step. Sold above asking price in just 5 days. Absolutely phenomenal service!",
                rating: 5,
              },
            ].map((review, i) => (
              <Col xs={24} md={8} key={i}>
                <div style={{
                  background: "white",
                  borderRadius: "12px",
                  padding: isMobile ? "24px 20px" : "40px 32px",
                  border: "1px solid #f0f0f0",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column" as const,
                  position: "relative",
                }}>
                  <div style={{ color: "#b40101", fontSize: "40px", lineHeight: 1, marginBottom: "12px", fontFamily: "Georgia, serif", opacity: 0.3 }}>
                    &ldquo;
                  </div>
                  <Paragraph style={{ fontSize: isMobile ? "14px" : "15px", lineHeight: 1.8, color: "#374151", flex: 1, margin: 0 }}>
                    {review.text}
                  </Paragraph>
                  <div style={{ display: "flex", gap: "2px", margin: "16px 0 8px" }}>
                    {Array.from({ length: review.rating }).map((_, j) => (
                      <StarFilled key={j} style={{ color: "#f59e0b", fontSize: "14px" }} />
                    ))}
                  </div>
                  <div>
                    <Text strong style={{ fontSize: "14px", display: "block" }}>{review.name}</Text>
                    <Text type="secondary" style={{ fontSize: "12px" }}>{review.role}</Text>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Top Agents */}
      <section style={{ padding: sectionPadding, maxWidth: "1400px", margin: "0 auto", background: "white" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: isMobile ? "24px" : "48px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <Text strong style={{ color: "#b40101", fontSize: "12px", textTransform: "uppercase", letterSpacing: "2px", display: "block", marginBottom: "8px" }}>
              Local Experts
            </Text>
            <Title level={2} style={{ fontSize: sectionTitleSize, fontWeight: 900, margin: 0, letterSpacing: "-1px" }}>
              Meet Our Agents
            </Title>
          </div>
          <Button
            size={btnSm}
            onClick={() => navigate("/agents")}
            style={{
              borderColor: "#b40101",
              color: "#b40101",
              fontWeight: 700,
              height: btnH,
              padding: btnP,
              borderRadius: btnR,
              fontSize: btnFs,
            }}
            icon={<ArrowRightOutlined />}
            iconPosition="end"
          >
            Find an Agent
          </Button>
        </div>

        <Row gutter={[isMobile ? 16 : 32, isMobile ? 16 : 32]}>
          {topAgents.length > 0 ? (
            topAgents.map((agent) => (
              <Col xs={24} sm={12} md={6} key={agent.id}>
                <Link to={`/agents/${agent.id}`} style={{ textDecoration: "none" }}>
                  <Card
                    hoverable
                    style={{ borderRadius: "12px", textAlign: "center", border: "1px solid #f0f0f0" }}
                    styles={{ body: { padding: isMobile ? "24px 16px" : "32px" } }}
                  >
                    <img
                      src={agent.imageUrl}
                      alt={agent.name}
                      style={{ width: "80px", height: "80px", borderRadius: "50%", objectFit: "cover", margin: "0 auto 12px", border: "4px solid white", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                    />
                    <Title level={4} style={{ margin: 0, fontSize: isMobile ? "16px" : "18px", fontWeight: 800 }}>{agent.name}</Title>
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      {agent.brokerage || "TORRA Commercial Real Estate"}
                    </Text>
                    <div style={{ marginTop: "12px", display: "flex", justifyContent: "center", gap: "24px" }}>
                      <div style={{ textAlign: "center" }}>
                        <Text strong style={{ fontSize: "16px", display: "block" }}>{agent.totalSales || 0}</Text>
                        <Text type="secondary" style={{ fontSize: "10px", textTransform: "uppercase", fontWeight: 700 }}>Sales</Text>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <Text strong style={{ fontSize: "16px", display: "block" }}>{agent.rating || "5.0"}★</Text>
                        <Text type="secondary" style={{ fontSize: "10px", textTransform: "uppercase", fontWeight: 700 }}>Rating</Text>
                      </div>
                    </div>
                  </Card>
                </Link>
              </Col>
            ))
          ) : (
            [1, 2, 3, 4].map((i) => (
              <Col xs={24} sm={12} md={6} key={i}>
                <div style={{ height: "260px", background: "#f3f4f6", borderRadius: "12px", animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }} />
              </Col>
            ))
          )}
        </Row>
      </section>

      {/* Tools Row */}
      <section style={{ background: "#111827", padding: isMobile ? "48px 16px" : "80px 32px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <Row gutter={[48, isMobile ? 24 : 32]} align="middle">
            <Col xs={24} md={12}>
              <Title level={2} style={{ color: "white", fontSize: isMobile ? "26px" : "40px", fontWeight: 900, marginBottom: isMobile ? "12px" : "24px" }}>
                Smart Tools for Smart Decisions
              </Title>
              <Paragraph style={{ color: "#9ca3af", fontSize: isMobile ? "15px" : "18px", lineHeight: 1.8, marginBottom: "24px" }}>
                Whether you're buying your first home, selling a property, or exploring investment opportunities, our suite of calculators and estimators helps you move forward with confidence.
              </Paragraph>
              <Space size="middle" wrap>
                <Button
                  size={isMobile ? "middle" : "large"}
                  onClick={() => navigate("/mortgage-calculator")}
                  style={{ background: "#b40101", borderColor: "#b40101", color: "white", height: isMobile ? "44px" : "52px", borderRadius: "22px", fontWeight: 700, padding: isMobile ? "0 20px" : "0 28px", fontSize: isMobile ? "13px" : "14px" }}
                >
                  Mortgage Calculator
                </Button>
                <Button
                  size={isMobile ? "middle" : "large"}
                  ghost
                  onClick={() => navigate("/home-value")}
                  style={{ color: "white", borderColor: "white", height: isMobile ? "44px" : "52px", borderRadius: "22px", fontWeight: 700, padding: isMobile ? "0 20px" : "0 28px", fontSize: isMobile ? "13px" : "14px" }}
                >
                  Home Value
                </Button>
              </Space>
            </Col>
            <Col xs={24} md={12}>
              <Row gutter={[isMobile ? 12 : 16, isMobile ? 12 : 16]}>
                {[
                  { icon: <DollarOutlined />, title: "Mortgage Calculator", desc: "Estimate monthly payments", link: "/mortgage-calculator" },
                  { icon: <RiseOutlined />, title: "Home Value Estimator", desc: "Get a free property valuation", link: "/home-value" },
                  { icon: <SafetyOutlined />, title: "Affordability Calculator", desc: "See what you can afford", link: "/affordability-calculator" },
                  { icon: <SearchOutlined />, title: "Advanced Property Search", desc: "Filter by 17+ criteria", link: "/properties" },
                ].map((tool, i) => (
                  <Col span={12} key={i}>
                    <div
                      onClick={() => navigate(tool.link)}
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "12px",
                        padding: isMobile ? "16px 12px" : "24px",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        textAlign: "center",
                      }}
                      onMouseEnter={(e) => {
                        if (isMobile) return;
                        e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                        e.currentTarget.style.transform = "translateY(-4px)";
                      }}
                      onMouseLeave={(e) => {
                        if (isMobile) return;
                        e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      <div style={{ color: "#b40101", fontSize: isMobile ? "20px" : "24px", marginBottom: "8px" }}>{tool.icon}</div>
                      <Text strong style={{ color: "white", fontSize: isMobile ? "12px" : "14px", display: "block", marginBottom: "4px" }}>
                        {tool.title}
                      </Text>
                      <Text style={{ color: "#9ca3af", fontSize: isMobile ? "11px" : "12px", display: "block" }}>{tool.desc}</Text>
                    </div>
                  </Col>
                ))}
              </Row>
            </Col>
          </Row>
        </div>
      </section>

      {/* Entrepreneurs Section */}
      <section
        style={{
          position: "relative",
          height: isMobile ? "auto" : "700px",
          minHeight: isMobile ? "400px" : "700px",
          width: "100%",
          display: "flex",
          alignItems: "center",
          color: "white",
          overflow: "hidden",
          padding: isMobile ? "48px 0" : "0",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: 'url("https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")',
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.35)",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: "1400px",
            margin: "0 auto",
            padding: isMobile ? "0 24px" : "0 64px",
            width: "100%",
          }}
        >
          <div style={{ maxWidth: "900px" }}>
            <Title
              style={{
                color: "white",
                fontSize: isMobile ? "32px" : "72px",
                fontWeight: 900,
                marginBottom: isMobile ? "12px" : "32px",
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
                textShadow: "0 4px 12px rgba(0,0,0,0.3)",
              }}
            >
              Where Entrepreneurs Thrive™
            </Title>
            <Paragraph
              style={{
                color: "rgba(255,255,255,0.9)",
                fontSize: isMobile ? "16px" : "26px",
                marginBottom: isMobile ? "24px" : "56px",
                lineHeight: 1.6,
                fontWeight: 400,
              }}
            >
              Join a team of doers, dreamers, and entrepreneurs building extraordinary careers.
            </Paragraph>
            <Link to="/become-agent">
              <Button
                type="primary"
                size={isMobile ? "middle" : "large"}
                icon={<ArrowRightOutlined />}
                iconPosition="end"
                style={{
                  background: "#b40101",
                  borderColor: "#b40101",
                  height: isMobile ? "44px" : "68px",
                  padding: isMobile ? "0 24px" : "0 48px",
                  fontWeight: 700,
                  fontSize: isMobile ? "13px" : "16px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  borderRadius: isMobile ? "22px" : "34px",
                  boxShadow: "0 8px 24px rgba(180,1,1,0.4)",
                }}
                onMouseEnter={(e) => {
                  if (isMobile) return;
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = "0 12px 32px rgba(180,1,1,0.5)";
                }}
                onMouseLeave={(e) => {
                  if (isMobile) return;
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(180,1,1,0.4)";
                }}
              >
                Become a TORRA Agent
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Informed Section */}
      <section
        style={{
          padding: isMobile ? "48px 16px" : "128px 64px",
          background: "linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%)",
          textAlign: "center",
          borderTop: "1px solid #f0f0f0",
        }}
      >
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <Title
            level={2}
            style={{
              fontSize: isMobile ? "28px" : "52px",
              fontWeight: 900,
              marginBottom: "12px",
              letterSpacing: "-0.02em",
              color: "#111827",
              lineHeight: 1.1,
            }}
          >
            Informed, empowered, successful.
          </Title>
          <Paragraph
            style={{
              color: "#6b7280",
              fontSize: isMobile ? "16px" : "20px",
              marginBottom: isMobile ? "24px" : "56px",
              lineHeight: 1.6,
              fontWeight: 400,
            }}
          >
            Discover the perfect home loan solution with TORRA Home Loans.
          </Paragraph>

          <Row gutter={[isMobile ? 16 : 32, isMobile ? 16 : 32]} justify="center">
            <Col xs={24} md={8}>
              <div style={{ padding: isMobile ? "16px" : "32px" }}>
                <div style={{ width: "56px", height: "56px", background: "#b40101", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "white", fontSize: "22px" }}>
                  <DollarOutlined />
                </div>
                <Title level={4} style={{ fontSize: isMobile ? "17px" : "18px", fontWeight: 800 }}>Competitive Rates</Title>
                <Paragraph style={{ color: "#6b7280", fontSize: isMobile ? "14px" : "15px" }}>Access exclusive mortgage rates through our network of certified lenders.</Paragraph>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div style={{ padding: isMobile ? "16px" : "32px" }}>
                <div style={{ width: "56px", height: "56px", background: "#b40101", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "white", fontSize: "22px" }}>
                  <ClockCircleOutlined />
                </div>
                <Title level={4} style={{ fontSize: isMobile ? "17px" : "18px", fontWeight: 800 }}>Fast Pre-Approval</Title>
                <Paragraph style={{ color: "#6b7280", fontSize: isMobile ? "14px" : "15px" }}>Get pre-approved in as little as 24 hours and shop with confidence.</Paragraph>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div style={{ padding: isMobile ? "16px" : "32px" }}>
                <div style={{ width: "56px", height: "56px", background: "#b40101", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "white", fontSize: "22px" }}>
                  <SafetyOutlined />
                </div>
                <Title level={4} style={{ fontSize: isMobile ? "17px" : "18px", fontWeight: 800 }}>Trusted Guidance</Title>
                <Paragraph style={{ color: "#6b7280", fontSize: isMobile ? "14px" : "15px" }}>Work with specialists who understand your market and your goals.</Paragraph>
              </div>
            </Col>
          </Row>

          <Button
            size={isMobile ? "middle" : "large"}
            onClick={() => navigate("/mortgage-calculator")}
            style={{
              marginTop: isMobile ? "16px" : "40px",
              borderColor: "#b40101",
              color: "#b40101",
              fontWeight: 700,
              height: isMobile ? "44px" : "56px",
              padding: isMobile ? "0 24px" : "0 40px",
              borderRadius: isMobile ? "22px" : "28px",
              fontSize: isMobile ? "13px" : "15px",
              borderWidth: "2px",
              background: "white",
            }}
            onMouseEnter={(e) => {
              if (isMobile) return;
              e.currentTarget.style.background = "#b40101";
              e.currentTarget.style.color = "white";
            }}
            onMouseLeave={(e) => {
              if (isMobile) return;
              e.currentTarget.style.background = "white";
              e.currentTarget.style.color = "#b40101";
            }}
          >
            Learn More About Loans
          </Button>
        </div>
      </section>
    </div>
  );
}
