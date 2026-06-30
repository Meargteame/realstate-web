import React from "react";
import { Button, Typography } from "antd";
import { Link } from "react-router-dom";
import { HomeOutlined, SearchOutlined } from "@ant-design/icons";
import { useIsMobile } from "../hooks/useBreakpoint";

const { Title, Paragraph } = Typography;

export default function NotFound() {
  const isMobile = useIsMobile();
  return (
    <div style={{ 
      minHeight: 'calc(100vh - 80px)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: '#f8f9fa',
      padding: isMobile ? '24px 16px' : '40px'
    }}>
      <div style={{ textAlign: 'center', maxWidth: '600px' }}>
        <div style={{
          width: isMobile ? '48px' : '64px', height: isMobile ? '48px' : '64px', background: '#b40101',
          borderRadius: '14px', display: 'flex', alignItems: 'center',
          justifyContent: 'center', color: 'white', fontSize: isMobile ? '22px' : '28px',
          fontWeight: 900, letterSpacing: '-0.5px', margin: '0 auto 16px'
        }}>TR</div>
        <div style={{ 
          fontSize: isMobile ? '96px' : '180px', 
          fontWeight: 900, 
          color: '#b40101', 
          lineHeight: 1,
          marginBottom: isMobile ? '12px' : '24px',
          textShadow: '4px 4px 0 rgba(0,0,0,0.05)'
        }}>
          404
        </div>
        
        <Title level={1} style={{ 
          fontWeight: 900, 
          textTransform: 'uppercase', 
          marginBottom: isMobile ? '12px' : '16px',
          fontSize: isMobile ? '28px' : '48px'
        }}>
          Page Not Found
        </Title>
        
        <Paragraph style={{ 
          fontSize: isMobile ? '15px' : '18px', 
          color: '#666', 
          marginBottom: isMobile ? '24px' : '40px',
          lineHeight: 1.6
        }}>
          Sorry, the page you're looking for doesn't exist or has been moved. 
          Let's get you back on track.
        </Paragraph>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/">
            <Button 
              type="primary" 
              size={isMobile ? "middle" : "large"} 
              icon={<HomeOutlined />}
              style={{ 
                background: '#b40101', 
                borderColor: '#b40101',
                height: isMobile ? '44px' : '56px',
                padding: isMobile ? '0 24px' : '0 32px',
                fontWeight: 'bold',
                borderRadius: isMobile ? '22px' : '28px',
                fontSize: isMobile ? '13px' : '15px'
              }}
            >
              Go Home
            </Button>
          </Link>
          
          <Link to="/properties">
            <Button 
              size={isMobile ? "middle" : "large"} 
              icon={<SearchOutlined />}
              style={{ 
                height: isMobile ? '44px' : '56px',
                padding: isMobile ? '0 24px' : '0 32px',
                fontWeight: 'bold',
                borderRadius: isMobile ? '22px' : '28px',
                fontSize: isMobile ? '13px' : '15px'
              }}
            >
              Browse Properties
            </Button>
          </Link>
        </div>

        <div style={{ marginTop: '64px', padding: '32px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <Title level={4} style={{ marginBottom: '16px' }}>Popular Pages</Title>
          <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/properties" style={{ color: '#b40101', fontWeight: 'bold' }}>Properties</Link>
            <Link to="/agents" style={{ color: '#b40101', fontWeight: 'bold' }}>Find an Agent</Link>
            <Link to="/mortgage-calculator" style={{ color: '#b40101', fontWeight: 'bold' }}>Mortgage Calculator</Link>
            <Link to="/home-value" style={{ color: '#b40101', fontWeight: 'bold' }}>Home Value</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
