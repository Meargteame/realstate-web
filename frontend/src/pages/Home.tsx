import React, { useState, useEffect } from "react";
import Hero from "@/components/Hero";
import PropertyCard from "@/components/PropertyCard";
import { Button, Typography, Row, Col, Card, Space } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useIsMobile } from "../hooks/useBreakpoint";
import {
  ArrowRightOutlined,
  HomeOutlined,
  DollarOutlined,
  CalculatorOutlined,
  UserOutlined,
  SearchOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  StarFilled,
  SafetyOutlined
} from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;

export default function Home() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [featuredProperties, setFeaturedProperties] = useState<any[]>([]);
  const [topAgents, setTopAgents] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

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
  }, []);

  const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k+` : `${n}`);

  const popularMarkets = [
    { city: "Austin, TX", count: "1,240 homes", img: "https://images.unsplash.com/photo-1531218150217-54595bc2b934?auto=format&fit=crop&w=600&q=80" },
    { city: "Miami, FL", count: "3,850 homes", img: "https://images.unsplash.com/photo-1535498730771-e735b998cd64?auto=format&fit=crop&w=600&q=80" },
    { city: "Denver, CO", count: "2,190 homes", img: "https://images.unsplash.com/photo-1546154288-3e3f1d2234d1?auto=format&fit=crop&w=600&q=80" },
    { city: "Charlotte, NC", count: "1,620 homes", img: "https://images.unsplash.com/photo-1575917649705-5b59aaa12e6b?auto=format&fit=crop&w=600&q=80" },
  ];

  return (
    <div style={{ background: "#ffffff", color: "#0f172a" }}>
      {/* Hero Banner */}
      <Hero />

      {/* Zillow Style 3-Core Feature Cards (Buy, Sell, Rent) */}
      <section style={{ padding: isMobile ? '40px 16px' : '72px 32px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <Row gutter={[24, 24]}>
            {/* Buy Card */}
            <Col xs={24} md={8}>
              <div style={{ 
                background: '#ffffff', 
                borderRadius: '16px', 
                padding: '36px 28px', 
                border: '1px solid #e2e8f0', 
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.04)',
                textAlign: 'center',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fee2e2', color: '#b40101', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '26px' }}>
                    <HomeOutlined />
                  </div>
                  <Title level={3} style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
                    Buy a Home
                  </Title>
                  <Paragraph style={{ color: '#64748b', fontSize: '15px', lineHeight: 1.6, marginBottom: '24px' }}>
                    Explore top US listings with immersive photo tours, verified MLS data, and expert advisor support.
                  </Paragraph>
                </div>
                <Button 
                  type="primary" 
                  size="large"
                  onClick={() => navigate('/properties')}
                  style={{ background: '#b40101', borderColor: '#b40101', fontWeight: 700, borderRadius: '8px', height: '48px', width: '100%' }}
                >
                  Browse Homes
                </Button>
              </div>
            </Col>

            {/* Sell Card */}
            <Col xs={24} md={8}>
              <div style={{ 
                background: '#ffffff', 
                borderRadius: '16px', 
                padding: '36px 28px', 
                border: '1px solid #e2e8f0', 
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.04)',
                textAlign: 'center',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#dbeafe', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '26px' }}>
                    <DollarOutlined />
                  </div>
                  <Title level={3} style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
                    Sell a Home
                  </Title>
                  <Paragraph style={{ color: '#64748b', fontSize: '15px', lineHeight: 1.6, marginBottom: '24px' }}>
                    Get an instant home valuation estimate and connect with top-producing listing agents in your city.
                  </Paragraph>
                </div>
                <Button 
                  type="primary" 
                  size="large"
                  onClick={() => navigate('/home-value')}
                  style={{ background: '#0f172a', borderColor: '#0f172a', fontWeight: 700, borderRadius: '8px', height: '48px', width: '100%' }}
                >
                  Get Home Valuation
                </Button>
              </div>
            </Col>

            {/* Rent Card */}
            <Col xs={24} md={8}>
              <div style={{ 
                background: '#ffffff', 
                borderRadius: '16px', 
                padding: '36px 28px', 
                border: '1px solid #e2e8f0', 
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.04)',
                textAlign: 'center',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '26px' }}>
                    <CalculatorOutlined />
                  </div>
                  <Title level={3} style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
                    Rent a Home
                  </Title>
                  <Paragraph style={{ color: '#64748b', fontSize: '15px', lineHeight: 1.6, marginBottom: '24px' }}>
                    Search nationwide rental properties, luxury high-rise apartments, and commercial lease spaces.
                  </Paragraph>
                </div>
                <Button 
                  type="default" 
                  size="large"
                  onClick={() => navigate('/properties?status=For+Rent')}
                  style={{ fontWeight: 700, borderRadius: '8px', height: '48px', width: '100%', borderColor: '#cbd5e1' }}
                >
                  Find Rentals
                </Button>
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* Featured US Properties Grid */}
      <section style={{ padding: isMobile ? '48px 16px' : '80px 32px', maxWidth: '1360px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '36px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <Text style={{ color: '#b40101', fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '6px' }}>
              Handpicked Listings
            </Text>
            <Title level={2} style={{ fontSize: isMobile ? '28px' : '38px', fontWeight: 900, color: '#0f172a', margin: 0 }}>
              Featured US Properties
            </Title>
          </div>
          <Button 
            type="link" 
            onClick={() => navigate('/properties')}
            style={{ color: '#b40101', fontWeight: 700, fontSize: '15px', padding: 0 }}
          >
            View All Properties <ArrowRightOutlined />
          </Button>
        </div>

        <Row gutter={[24, 28]}>
          {featuredProperties.length > 0 ? (
            featuredProperties.map((p) => (
              <Col xs={24} sm={12} lg={8} key={p.id}>
                <PropertyCard property={p} />
              </Col>
            ))
          ) : (
            <div style={{ padding: '60px 0', textAlign: 'center', width: '100%', color: '#64748b' }}>
              Loading featured properties...
            </div>
          )}
        </Row>
      </section>

      {/* Popular Real Estate Markets Grid */}
      <section style={{ background: '#f8fafc', padding: isMobile ? '48px 16px' : '80px 32px', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1360px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '44px' }}>
            <Title level={2} style={{ fontSize: isMobile ? '28px' : '38px', fontWeight: 900, color: '#0f172a', marginBottom: '12px' }}>
              Explore Top US Real Estate Markets
            </Title>
            <Text style={{ color: '#64748b', fontSize: '16px' }}>
              Discover active property listings across booming metropolitan areas
            </Text>
          </div>

          <Row gutter={[20, 20]}>
            {popularMarkets.map((m) => (
              <Col xs={24} sm={12} lg={6} key={m.city}>
                <div 
                  onClick={() => navigate(`/properties?q=${m.city.split(',')[0]}`)}
                  style={{ 
                    position: 'relative', 
                    height: '240px', 
                    borderRadius: '16px', 
                    overflow: 'hidden',
                    cursor: 'pointer',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                  }}
                >
                  <img 
                    src={m.img} 
                    alt={m.city} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }} 
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(15,23,42,0.85) 100%)' }} />
                  <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px', color: 'white' }}>
                    <Title level={4} style={{ color: 'white', margin: 0, fontSize: '20px', fontWeight: 800 }}>{m.city}</Title>
                    <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', fontWeight: 600 }}>{m.count}</Text>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </section>
    </div>
  );
}
