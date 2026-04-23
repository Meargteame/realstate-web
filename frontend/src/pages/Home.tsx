import React from "react";
import Hero from "@/components/Hero";
import ExpertSection from "@/components/ExpertSection";
import { Button, Typography, Row, Col } from "antd";
import { Link, useNavigate } from "react-router-dom";

const { Title, Paragraph } = Typography;

export default function Home() {
  const navigate = useNavigate();
  return (
    <div style={{ background: 'white' }}>
      <Hero />
      <ExpertSection />

      {/* Entrepreneurs Section */}
      <section style={{ 
        position: 'relative', 
        height: '650px', 
        width: '100%', 
        display: 'flex', 
        alignItems: 'center',
        color: 'white',
        overflow: 'hidden'
      }}>
        <div style={{ 
          position: 'absolute', 
          inset: 0, 
          backgroundImage: 'url("https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.4)'
        }} />
        
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1400px', margin: '0 auto', padding: '0 64px', width: '100%' }}>
          <div style={{ maxWidth: '800px' }}>
            <Title style={{ color: 'white', fontSize: '64px', fontWeight: 900, marginBottom: '24px', letterSpacing: '-2px', lineHeight: 1.1 }}>
              Where Entrepreneurs Thrive™
            </Title>
            <Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: '24px', marginBottom: '48px' }}>
              Join a team of doers, dreamers, and entrepreneurs.
            </Paragraph>
            <Link to="/become-agent">
              <Button 
                type="primary" 
                size="large"
                style={{ 
                  background: '#b40101', 
                  borderColor: '#b40101', 
                  height: '64px', 
                  padding: '0 48px', 
                  fontWeight: 'bold',
                  fontSize: '16px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}
              >
                Become a Keller Williams® Agent
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Informed Section */}
      <section style={{ padding: '128px 64px', background: '#f8f9fa', textAlign: 'center', borderTop: '1px solid #f0f0f0' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <Title level={2} style={{ fontSize: '56px', fontWeight: 900, marginBottom: '32px', letterSpacing: '-1.5px' }}>
            Informed, empowered, successful.
          </Title>
          <Paragraph style={{ color: '#555', fontSize: '22px', marginBottom: '64px' }}>
            Discover the perfect home loan solution with Keller Home Loans.
          </Paragraph>
          
          <div style={{ width: '300px', height: '400px', margin: '0 auto', border: '8px solid white', boxShadow: '0 32px 64px rgba(0,0,0,0.15)', overflow: 'hidden' }}>
            <img 
              src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
              alt="Expert" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          
          <Button 
            size="large"
            onClick={() => navigate('/mortgage-calculator')}
            style={{ 
              marginTop: '64px',
              borderColor: '#111',
              color: '#111',
              fontWeight: 'bold',
              height: '56px',
              padding: '0 40px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              borderRadius: '28px'
            }}
          >
            Learn More About Loans
          </Button>
        </div>
      </section>
    </div>
  );
}
