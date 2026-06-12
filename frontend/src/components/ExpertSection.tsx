import React from "react";
import { Row, Col, Card, Typography, Button, Space } from "antd";
import { PlayCircleOutlined, RightOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

const { Title, Text, Paragraph } = Typography;

export default function ExpertSection() {
  const videos = [
    { title: "Gary Keller on 2026 Market Outlook, Fed Signals...", bg: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=600&q=80" },
    { title: "Should You Buy a Home Right Now? | Update (Jan 2026)", bg: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80" },
    { title: "Housing Market Forecast 2026 | Real Estate Update", bg: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80" }
  ];

  const articles = [
    { title: "Part One: Your First-Time Homebuyer's Guide", readTime: "4 Minutes", bg: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80" },
    { title: "Part Two: Your First-Time Homebuyer's Guide", readTime: "4 Minutes", bg: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80" },
    { title: "Part Three: Your First-Time Homebuyer's Guide", readTime: "4 Minutes", bg: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=600&q=80" }
  ];

  const AntCard = Card as any;

  return (
    <section style={{ padding: '96px 64px', maxWidth: '1400px', margin: '0 auto', background: 'white' }}>
      <div style={{ textAlign: 'center', marginBottom: '64px' }}>
        <Title level={2} style={{ fontSize: '44px', fontWeight: 900, marginBottom: '16px' }}>Take it From Our Experts</Title>
        <Paragraph style={{ color: '#8c8c8c', fontSize: '18px', maxWidth: '700px', margin: '0 auto' }}>
          Explore our blog posts to learn from the best about buying, selling, and maintaining your home.
        </Paragraph>
      </div>

      <Row gutter={[32, 32]} style={{ marginBottom: '48px' }}>
        {videos.map((vid, i) => (
          <Col xs={24} md={8} key={i}>
            <AntCard 
              hoverable
              cover={
                <div style={{ height: '224px', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <div style={{ position: 'absolute', inset: 0, backgroundImage: `url("${vid.bg}")`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                   <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)' }} />
                   <PlayCircleOutlined style={{ fontSize: '64px', color: 'white', zIndex: 1 }} />
                </div>
              }
              style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #f0f0f0' }}
            >
              <Title level={4} style={{ fontSize: '18px', height: '54px', overflow: 'hidden' }}>{vid.title}</Title>
              <Link to="/blog" style={{ color: '#b40101', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '13px' }}>
                Read More <RightOutlined style={{ fontSize: '10px' }} />
              </Link>
            </AntCard>
          </Col>
        ))}
      </Row>

      <Row gutter={[32, 32]} style={{ marginBottom: '64px' }}>
        {articles.map((art, i) => (
          <Col xs={24} md={8} key={i}>
            <AntCard 
              hoverable
              cover={<div style={{ height: '192px', backgroundImage: `url("${art.bg}")`, backgroundSize: 'cover', backgroundPosition: 'center' }} />}
              style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #f0f0f0' }}
            >
              <Text type="secondary" style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Read Time: {art.readTime}</Text>
              <Title level={4} style={{ fontSize: '18px', marginTop: '8px', height: '54px', overflow: 'hidden' }}>{art.title}</Title>
              <Link to="/blog" style={{ color: '#b40101', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '13px' }}>
                Read More <RightOutlined style={{ fontSize: '10px' }} />
              </Link>
            </AntCard>
          </Col>
        ))}
      </Row>

      <div style={{ textAlign: 'center' }}>
        <Link to="/blog">
          <Button
            type="default"
            size="large"
            style={{
              borderColor: '#111',
              color: '#111',
              fontWeight: 'bold',
              height: '56px',
              padding: '0 40px',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
          >
            Explore More Articles
          </Button>
        </Link>
      </div>
    </section>
  );
}
