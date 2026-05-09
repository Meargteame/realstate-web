import React, { useState, useEffect } from "react";
import Hero from "@/components/Hero";
import ExpertSection from "@/components/ExpertSection";
import PropertyCard from "@/components/PropertyCard";
import { Button, Typography, Row, Col, Statistic, Space, Card } from "antd";
import { Link, useNavigate } from "react-router-dom";
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
} from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;

const trendingCities = [
  { name: "Austin, TX", image: "https://images.unsplash.com/photo-1531218150217-54595bc2b934?auto=format&fit=crop&w=600&q=80", count: "1,240" },
  { name: "Miami, FL", image: "https://images.unsplash.com/photo-1535498730771-e735b998cd64?auto=format&fit=crop&w=600&q=80", count: "890" },
  { name: "Denver, CO", image: "https://images.unsplash.com/photo-1546154288-3e3f1d2234d1?auto=format&fit=crop&w=600&q=80", count: "510" },
  { name: "Charlotte, NC", image: "https://images.unsplash.com/photo-1575917649705-5b59aaa12e6b?auto=format&fit=crop&w=600&q=80", count: "680" },
];

export default function Home() {
  const navigate = useNavigate();
  const [featuredProperties, setFeaturedProperties] = useState<any[]>([]);
  const [topAgents, setTopAgents] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/properties?limit=6")
      .then((r) => r.json())
      .then((data) => setFeaturedProperties(Array.isArray(data) ? data.slice(0, 6) : []))
      .catch(() => setFeaturedProperties([]));

    fetch("/api/agents?limit=4")
      .then((r) => r.json())
      .then((data) => setTopAgents(Array.isArray(data) ? data.slice(0, 4) : []))
      .catch(() => setTopAgents([]));
  }, []);

  return (
    <div style={{ background: "white" }}>
      <Hero />

      {/* Market Stats Bar */}
      <section style={{ background: "#111827", padding: "48px 32px" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <Row gutter={[48, 24]} justify="center">
            {[
              { label: "Active Listings", value: "3,420+", icon: <HomeOutlined /> },
              { label: "Cities Served", value: "150+", icon: <EnvironmentOutlined /> },
              { label: "Expert Agents", value: "12,000+", icon: <UserOutlined /> },
              { label: "Avg. Days on Market", value: "18", icon: <ClockCircleOutlined /> },
            ].map((stat, i) => (
              <Col xs={12} md={6} key={i} style={{ textAlign: "center" }}>
                <div style={{ color: "#b40101", fontSize: "28px", marginBottom: "8px" }}>{stat.icon}</div>
                <div style={{ color: "white", fontSize: "28px", fontWeight: 900 }}>{stat.value}</div>
                <div style={{ color: "#9ca3af", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700 }}>{stat.label}</div>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Featured Properties */}
      <section style={{ padding: "96px 32px", maxWidth: "1400px", margin: "0 auto", background: "white" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "48px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <Text strong style={{ color: "#b40101", fontSize: "13px", textTransform: "uppercase", letterSpacing: "2px", display: "block", marginBottom: "12px" }}>
              Curated for You
            </Text>
            <Title level={2} style={{ fontSize: "44px", fontWeight: 900, margin: 0, letterSpacing: "-1px" }}>
              Featured Properties
            </Title>
          </div>
          <Button
            size="large"
            onClick={() => navigate("/properties")}
            style={{
              borderColor: "#111827",
              color: "#111827",
              fontWeight: 700,
              height: "52px",
              padding: "0 32px",
              borderRadius: "26px",
              fontSize: "14px",
            }}
            icon={<ArrowRightOutlined />}
            iconPosition="end"
          >
            View All Listings
          </Button>
        </div>

        <Row gutter={[32, 32]}>
          {featuredProperties.length > 0 ? (
            featuredProperties.map((p) => (
              <Col xs={24} sm={12} lg={8} key={p.id}>
                <PropertyCard property={p} />
              </Col>
            ))
          ) : (
            [1, 2, 3, 4, 5, 6].map((i) => (
              <Col xs={24} sm={12} lg={8} key={i}>
                <div style={{ height: "420px", background: "#f3f4f6", borderRadius: "16px", animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }} />
              </Col>
            ))
          )}
        </Row>
      </section>

      {/* Trending Cities */}
      <section style={{ background: "#f8f9fa", padding: "96px 32px" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <Text strong style={{ color: "#b40101", fontSize: "13px", textTransform: "uppercase", letterSpacing: "2px", display: "block", marginBottom: "12px" }}>
              Explore Markets
            </Text>
            <Title level={2} style={{ fontSize: "44px", fontWeight: 900, margin: 0, letterSpacing: "-1px" }}>
              Trending Cities
            </Title>
          </div>

          <Row gutter={[24, 24]}>
            {trendingCities.map((city) => (
              <Col xs={24} sm={12} lg={6} key={city.name}>
                <div
                  onClick={() => navigate(`/properties?q=${city.name.split(",")[0]}`)}
                  style={{
                    position: "relative",
                    height: "360px",
                    borderRadius: "16px",
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
                  <div style={{ position: "absolute", bottom: "24px", left: "24px", color: "white" }}>
                    <Title level={4} style={{ color: "white", margin: 0, fontWeight: 800, fontSize: "24px" }}>
                      {city.name}
                    </Title>
                    <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: "14px", fontWeight: 500 }}>
                      {city.count} listings
                    </Text>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      <ExpertSection />

      {/* Top Agents */}
      <section style={{ padding: "96px 32px", maxWidth: "1400px", margin: "0 auto", background: "white" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "48px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <Text strong style={{ color: "#b40101", fontSize: "13px", textTransform: "uppercase", letterSpacing: "2px", display: "block", marginBottom: "12px" }}>
              Local Experts
            </Text>
            <Title level={2} style={{ fontSize: "44px", fontWeight: 900, margin: 0, letterSpacing: "-1px" }}>
              Meet Our Agents
            </Title>
          </div>
          <Button
            size="large"
            onClick={() => navigate("/agents")}
            style={{
              borderColor: "#111827",
              color: "#111827",
              fontWeight: 700,
              height: "52px",
              padding: "0 32px",
              borderRadius: "26px",
              fontSize: "14px",
            }}
            icon={<ArrowRightOutlined />}
            iconPosition="end"
          >
            Find an Agent
          </Button>
        </div>

        <Row gutter={[32, 32]}>
          {topAgents.length > 0 ? (
            topAgents.map((agent) => (
              <Col xs={24} sm={12} md={6} key={agent.id}>
                <Link to={`/agents/${agent.id}`} style={{ textDecoration: "none" }}>
                  <Card
                    hoverable
                    style={{ borderRadius: "16px", textAlign: "center", border: "1px solid #f0f0f0" }}
                    styles={{ body: { padding: "32px" } }}
                  >
                    <img
                      src={agent.imageUrl}
                      alt={agent.name}
                      style={{ width: "96px", height: "96px", borderRadius: "50%", objectFit: "cover", margin: "0 auto 16px", border: "4px solid white", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                    />
                    <Title level={4} style={{ margin: 0, fontSize: "18px", fontWeight: 800 }}>{agent.name}</Title>
                    <Text type="secondary" style={{ fontSize: "13px" }}>
                      {agent.brokerage || "Keller Williams®"}
                    </Text>
                    <div style={{ marginTop: "16px", display: "flex", justifyContent: "center", gap: "24px" }}>
                      <div style={{ textAlign: "center" }}>
                        <Text strong style={{ fontSize: "18px", display: "block" }}>{agent.totalSales || 0}</Text>
                        <Text type="secondary" style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: 700 }}>Sales</Text>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <Text strong style={{ fontSize: "18px", display: "block" }}>{agent.rating || "5.0"}★</Text>
                        <Text type="secondary" style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: 700 }}>Rating</Text>
                      </div>
                    </div>
                  </Card>
                </Link>
              </Col>
            ))
          ) : (
            [1, 2, 3, 4].map((i) => (
              <Col xs={24} sm={12} md={6} key={i}>
                <div style={{ height: "280px", background: "#f3f4f6", borderRadius: "16px", animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }} />
              </Col>
            ))
          )}
        </Row>
      </section>

      {/* Tools Row */}
      <section style={{ background: "#111827", padding: "80px 32px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <Row gutter={[48, 32]} align="middle">
            <Col xs={24} md={12}>
              <Title level={2} style={{ color: "white", fontSize: "40px", fontWeight: 900, marginBottom: "24px" }}>
                Smart Tools for Smart Decisions
              </Title>
              <Paragraph style={{ color: "#9ca3af", fontSize: "18px", lineHeight: 1.8, marginBottom: "32px" }}>
                Whether you're buying your first home, selling a property, or exploring investment opportunities, our suite of calculators and estimators helps you move forward with confidence.
              </Paragraph>
              <Space size="middle" wrap>
                <Button
                  size="large"
                  onClick={() => navigate("/mortgage-calculator")}
                  style={{ background: "#b40101", borderColor: "#b40101", color: "white", height: "52px", borderRadius: "26px", fontWeight: 700, padding: "0 28px" }}
                >
                  Mortgage Calculator
                </Button>
                <Button
                  size="large"
                  ghost
                  onClick={() => navigate("/home-value")}
                  style={{ color: "white", borderColor: "white", height: "52px", borderRadius: "26px", fontWeight: 700, padding: "0 28px" }}
                >
                  Home Value
                </Button>
              </Space>
            </Col>
            <Col xs={24} md={12}>
              <Row gutter={[16, 16]}>
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
                        padding: "24px",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        textAlign: "center",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                        e.currentTarget.style.transform = "translateY(-4px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      <div style={{ color: "#b40101", fontSize: "24px", marginBottom: "12px" }}>{tool.icon}</div>
                      <Text strong style={{ color: "white", fontSize: "14px", display: "block", marginBottom: "4px" }}>
                        {tool.title}
                      </Text>
                      <Text style={{ color: "#9ca3af", fontSize: "12px" }}>{tool.desc}</Text>
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
          height: "700px",
          width: "100%",
          display: "flex",
          alignItems: "center",
          color: "white",
          overflow: "hidden",
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
            padding: "0 64px",
            width: "100%",
          }}
        >
          <div style={{ maxWidth: "900px" }}>
            <Title
              style={{
                color: "white",
                fontSize: "72px",
                fontWeight: 900,
                marginBottom: "32px",
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
                fontSize: "26px",
                marginBottom: "56px",
                lineHeight: 1.6,
                fontWeight: 400,
              }}
            >
              Join a team of doers, dreamers, and entrepreneurs building extraordinary careers.
            </Paragraph>
            <Link to="/become-agent">
              <Button
                type="primary"
                size="large"
                icon={<ArrowRightOutlined />}
                iconPosition="end"
                style={{
                  background: "#b40101",
                  borderColor: "#b40101",
                  height: "68px",
                  padding: "0 48px",
                  fontWeight: 700,
                  fontSize: "16px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  borderRadius: "34px",
                  boxShadow: "0 8px 24px rgba(180,1,1,0.4)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = "0 12px 32px rgba(180,1,1,0.5)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(180,1,1,0.4)";
                }}
              >
                Become a Keller Williams® Agent
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Informed Section */}
      <section
        style={{
          padding: "128px 64px",
          background: "linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%)",
          textAlign: "center",
          borderTop: "1px solid #f0f0f0",
        }}
      >
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <Title
            level={2}
            style={{
              fontSize: "52px",
              fontWeight: 900,
              marginBottom: "16px",
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
              fontSize: "20px",
              marginBottom: "56px",
              lineHeight: 1.6,
              fontWeight: 400,
            }}
          >
            Discover the perfect home loan solution with Keller Home Loans.
          </Paragraph>

          <Row gutter={[32, 32]} justify="center">
            <Col xs={24} md={8}>
              <div style={{ padding: "32px" }}>
                <div style={{ width: "64px", height: "64px", background: "#b40101", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: "white", fontSize: "24px" }}>
                  <DollarOutlined />
                </div>
                <Title level={4} style={{ fontWeight: 800 }}>Competitive Rates</Title>
                <Paragraph style={{ color: "#6b7280" }}>Access exclusive mortgage rates through our network of certified lenders.</Paragraph>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div style={{ padding: "32px" }}>
                <div style={{ width: "64px", height: "64px", background: "#b40101", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: "white", fontSize: "24px" }}>
                  <ClockCircleOutlined />
                </div>
                <Title level={4} style={{ fontWeight: 800 }}>Fast Pre-Approval</Title>
                <Paragraph style={{ color: "#6b7280" }}>Get pre-approved in as little as 24 hours and shop with confidence.</Paragraph>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div style={{ padding: "32px" }}>
                <div style={{ width: "64px", height: "64px", background: "#b40101", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: "white", fontSize: "24px" }}>
                  <SafetyOutlined />
                </div>
                <Title level={4} style={{ fontWeight: 800 }}>Trusted Guidance</Title>
                <Paragraph style={{ color: "#6b7280" }}>Work with specialists who understand your market and your goals.</Paragraph>
              </div>
            </Col>
          </Row>

          <Button
            size="large"
            onClick={() => navigate("/mortgage-calculator")}
            style={{
              marginTop: "40px",
              borderColor: "#111827",
              color: "#111827",
              fontWeight: 700,
              height: "56px",
              padding: "0 40px",
              borderRadius: "28px",
              fontSize: "15px",
              borderWidth: "2px",
              background: "white",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#111827";
              e.currentTarget.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "white";
              e.currentTarget.style.color = "#111827";
            }}
          >
            Learn More About Loans
          </Button>
        </div>
      </section>
    </div>
  );
}
