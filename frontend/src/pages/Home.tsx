import React from "react";
import Hero from "@/components/Hero";
import ExpertSection from "@/components/ExpertSection";
import { Button, Typography, Row, Col } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRightOutlined } from "@ant-design/icons";

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
        height: '700px', 
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
          filter: 'brightness(0.35)'
        }} />
        
        <div style={{ 
          position: 'relative', 
          zIndex: 1, 
          maxWidth: '1400px', 
          margin: '0 auto', 
          padding: '0 64px', 
          width: '100%' 
        }}>
          <div style={{ maxWidth: '900px' }}>
            <Title style={{ 
              color: 'white', 
              fontSize: '72px', 
              fontWeight: 900, 
              marginBottom: '32px', 
              letterSpacing: '-0.02em', 
              lineHeight: 1.1,
              textShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }}>
              Where Entrepreneurs Thrive™
            </Title>
            <Paragraph style={{ 
              color: 'rgba(255,255,255,0.9)', 
              fontSize: '26px', 
              marginBottom: '56px',
              lineHeight: 1.6,
              fontWeight: 400
            }}>
              Join a team of doers, dreamers, and entrepreneurs building extraordinary careers.
            </Paragraph>
            <Link to="/become-agent">
              <Button 
                type="primary" 
                size="large"
                icon={<ArrowRightOutlined />}
                iconPosition="end"
                style={{ 
                  background: '#b40101', 
                  borderColor: '#b40101', 
                  height: '68px', 
                  padding: '0 48px', 
                  fontWeight: 700,
                  fontSize: '16px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  borderRadius: '34px',
                  boxShadow: '0 8px 24px rgba(180,1,1,0.4)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(180,1,1,0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(180,1,1,0.4)';
                }}
              >
                Become a Keller Williams® Agent
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Informed Section */}
      <section style={{ 
        padding: '128px 64px', 
        background: 'linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%)', 
        textAlign: 'center', 
        borderTop: '1px solid #f0f0f0' 
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <Title 
            level={2} 
            style={{ 
              fontSize: '64px', 
              fontWeight: 900, 
              marginBottom: '32px', 
              letterSpacing: '-0.02em',
              color: '#111827',
              lineHeight: 1.1
            }}
          >
            Informed, empowered, successful.
          </Title>
          <Paragraph style={{ 
            color: '#6b7280', 
            fontSize: '24px', 
            marginBottom: '72px',
            lineHeight: 1.6,
            fontWeight: 400
          }}>
            Discover the perfect home loan solution with Keller Home Loans.
          </Paragraph>
          
          <div style={{ 
            width: '360px', 
            height: '480px', 
            margin: '0 auto', 
            border: '12px solid white', 
            boxShadow: '0 32px 64px rgba(0,0,0,0.12)', 
            overflow: 'hidden',
            borderRadius: '8px'
          }}>
            <img 
              src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
              alt="Expert" 
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover',
                transition: 'transform 0.3s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            />
          </div>
          
          <Button 
            size="large"
            onClick={() => navigate('/mortgage-calculator')}
            style={{ 
              marginTop: '72px',
              borderColor: '#111827',
              color: '#111827',
              fontWeight: 700,
              height: '64px',
              padding: '0 48px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              borderRadius: '32px',
              fontSize: '15px',
              borderWidth: '2px',
              background: 'white'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#111827';
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.color = '#111827';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Learn More About Loans
          </Button>
        </div>
      </section>
    </div>
  );
}
