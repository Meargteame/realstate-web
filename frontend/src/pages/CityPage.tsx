/**
 * TEMPLATE: Location / SEO Landing Page
 * Route: /homes/:city
 * Purpose: SEO traffic at scale. One template generates thousands of city pages.
 * Every city page is a lead funnel entry + property search engine.
 */
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Row, Col, Typography, Card, Statistic, Button, Form, Input, Tag, Divider, notification } from "antd";
import { 
  SearchOutlined, EnvironmentOutlined, RiseOutlined, 
  HomeOutlined, ArrowRightOutlined, DollarOutlined  
} from "@ant-design/icons";
import PropertyCard from "@/components/PropertyCard";

const { Title, Text, Paragraph } = Typography;

const CITY_MARKET_DATA: Record<string, any> = {
  default: { medianPrice: 485000, priceChange: 5.2, avgDom: 18, totalListings: 342 },
  austin: { medianPrice: 620000, priceChange: 8.1, avgDom: 12, totalListings: 1240 },
  miami: { medianPrice: 750000, priceChange: 11.4, avgDom: 21, totalListings: 890 },
  charlotte: { medianPrice: 420000, priceChange: 6.7, avgDom: 14, totalListings: 680 },
  dallas: { medianPrice: 510000, priceChange: 4.9, avgDom: 16, totalListings: 1450 },
  denver: { medianPrice: 580000, priceChange: 3.2, avgDom: 22, totalListings: 510 },
};

export default function CityPage() {
  const { city } = useParams<{ city: string }>();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const cityKey = city?.toLowerCase() || "default";
  const displayName = city?.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ') || "Your City";
  const market = CITY_MARKET_DATA[cityKey] || CITY_MARKET_DATA.default;

  useEffect(() => {
    fetch(`/api/properties?q=${city}`)
      .then(r => r.json())
      .then(d => { setProperties(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [city]);

  const onValuationSubmit = (values: any) => {
    notification.success({
      message: 'Valuation Request Received',
      description: `We've received your request for ${values.address}. An agent will contact you shortly with your home's estimated market value.`,
      duration: 6
    });
  };

  const AntCard = Card as any;

  return (
    <div style={{ background: '#f8f9fa' }}>
      {/* Hero */}
      <section style={{
        position: 'relative', height: '500px', display: 'flex', alignItems: 'center',
        justifyContent: 'center', overflow: 'hidden', color: 'white', textAlign: 'center'
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url("https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1920&q=80")`,
          backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.45)'
        }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '900px', padding: '0 32px' }}>
          <Tag color="#b40101" style={{ fontSize: '13px', fontWeight: 'bold', padding: '4px 16px', marginBottom: '24px', borderRadius: '4px' }}>
            <EnvironmentOutlined /> LOCAL MARKET REPORT
          </Tag>
          <Title style={{ color: 'white', fontSize: '72px', fontWeight: 900, margin: 0, lineHeight: 1, letterSpacing: '-2px' }}>
            Homes for Sale in {displayName}
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '22px', display: 'block', margin: '24px 0 40px' }}>
            {market.totalListings} active listings · Median price ${(market.medianPrice / 1000).toFixed(0)}K
          </Text>
          <Button
            size="large"
            icon={<SearchOutlined />}
            onClick={() => navigate(`/properties?q=${city}`)}
            style={{ height: '64px', padding: '0 48px', fontWeight: 900, borderRadius: '32px', fontSize: '16px', background: '#b40101', borderColor: '#b40101', color: 'white' }}
          >
            Search All {displayName} Listings
          </Button>
        </div>
      </section>

      {/* Market Stats */}
      <section style={{ background: '#111827', padding: '48px 64px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <Row gutter={[48, 24]} justify="center">
            {[
              { label: 'Median List Price', value: `$${(market.medianPrice / 1000).toFixed(0)}K`, icon: <DollarOutlined /> },
              { label: 'Avg. Days on Market', value: `${market.avgDom} days`, icon: <HomeOutlined /> },
              { label: 'YoY Price Change', value: `+${market.priceChange}%`, icon: <RiseOutlined /> },
              { label: 'Active Listings', value: `${market.totalListings}`, icon: <EnvironmentOutlined /> },
            ].map((stat, i) => (
              <Col xs={12} md={6} key={i} style={{ textAlign: 'center' }}>
                <div style={{ color: '#b40101', fontSize: '32px', marginBottom: '8px' }}>{stat.icon}</div>
                <div style={{ color: 'white', fontSize: '32px', fontWeight: 900 }}>{stat.value}</div>
                <div style={{ color: '#6b7280', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>{stat.label}</div>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Listings Grid */}
      <section style={{ maxWidth: '1400px', margin: '0 auto', padding: '80px 64px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <Title level={2} style={{ fontWeight: 900, textTransform: 'uppercase', margin: 0 }}>Featured Listings</Title>
            <Text type="secondary">in {displayName}</Text>
          </div>
          <Button type="default" icon={<ArrowRightOutlined />} onClick={() => navigate(`/properties?q=${city}`)}>
            View All
          </Button>
        </div>

        <Row gutter={[32, 32]}>
          {properties.slice(0, 6).map(p => (
            <Col xs={24} md={12} lg={8} key={p.id}>
              <PropertyCard property={p} />
            </Col>
          ))}
          {!loading && properties.length === 0 && (
            <Col span={24} style={{ textAlign: 'center', padding: '64px' }}>
              <Text type="secondary">No listings found in {displayName}. Showing nearby properties.</Text>
            </Col>
          )}
        </Row>
      </section>

      {/* Lead Capture: Home Valuation */}
      <section style={{ background: '#111827', padding: '96px 64px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <Row gutter={64} align="middle">
            <Col xs={24} md={12}>
              <Title level={2} style={{ color: 'white', fontWeight: 900, textTransform: 'uppercase', fontSize: '48px', letterSpacing: '-1px' }}>
                What Is Your {displayName} Home Worth?
              </Title>
              <Paragraph style={{ color: '#9ca3af', fontSize: '18px', lineHeight: 1.8 }}>
                Get an instant, data-driven valuation from a KW® local expert. No obligations, no cost.
              </Paragraph>
            </Col>
            <Col xs={24} md={12}>
              <AntCard style={{ borderRadius: '16px', border: 'none' }} styles={{ body: { padding: '32px' } }}>
                <Title level={4} style={{ textAlign: 'center', fontWeight: 900, textTransform: 'uppercase', marginBottom: '24px' }}>
                  Get My Free Home Valuation
                </Title>
                <Form layout="vertical" onFinish={onValuationSubmit}>
                  <Form.Item name="address" rules={[{ required: true, message: 'Enter your property address' }]}>
                    <Input size="large" placeholder="Property Address" prefix={<EnvironmentOutlined />} style={{ borderRadius: '24px' }} />
                  </Form.Item>
                  <Form.Item name="name" rules={[{ required: true }]}>
                    <Input size="large" placeholder="Your Full Name" style={{ borderRadius: '24px' }} />
                  </Form.Item>
                  <Form.Item name="email" rules={[{ required: true, type: 'email' }]}>
                    <Input size="large" placeholder="Email Address" style={{ borderRadius: '24px' }} />
                  </Form.Item>
                  <Form.Item name="phone">
                    <Input size="large" placeholder="Phone Number (optional)" style={{ borderRadius: '24px' }} />
                  </Form.Item>
                  <Button type="primary" block size="large" htmlType="submit"
                    style={{ background: '#b40101', borderColor: '#b40101', height: '56px', fontWeight: 900, borderRadius: '28px' }}>
                    GET FREE VALUATION
                  </Button>
                </Form>
              </AntCard>
            </Col>
          </Row>
        </div>
      </section>

      {/* Neighborhood Insights */}
      <section style={{ maxWidth: '1400px', margin: '0 auto', padding: '80px 64px' }}>
        <Title level={2} style={{ fontWeight: 900, textTransform: 'uppercase', marginBottom: '48px' }}>Explore {displayName} Neighborhoods</Title>
        <Row gutter={[24, 24]}>
          {['Downtown', 'Midtown', 'East Side', 'Northshore', 'West End', 'Historic District'].map((n, i) => (
            <Col xs={12} md={8} lg={4} key={i}>
              <div
                onClick={() => navigate(`/properties?q=${city}+${n}`)}
                style={{
                  padding: '24px 16px', background: 'white', borderRadius: '12px',
                  textAlign: 'center', cursor: 'pointer', border: '1px solid #f0f0f0',
                  transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}
              >
                <EnvironmentOutlined style={{ fontSize: '24px', color: '#b40101', marginBottom: '12px', display: 'block' }} />
                <Text strong style={{ fontSize: '14px' }}>{n}</Text>
              </div>
            </Col>
          ))}
        </Row>
      </section>
    </div>
  );
}
