import React from "react";
import { Button, Typography } from "antd";
import { Link } from "react-router-dom";
import { HomeOutlined, SearchOutlined } from "@ant-design/icons";

const { Title, Paragraph } = Typography;

export default function NotFound() {
  return (
    <div style={{ 
      minHeight: 'calc(100vh - 80px)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: '#f8f9fa',
      padding: '40px'
    }}>
      <div style={{ textAlign: 'center', maxWidth: '600px' }}>
        <div style={{ 
          fontSize: '180px', 
          fontWeight: 900, 
          color: '#b40101', 
          lineHeight: 1,
          marginBottom: '24px',
          textShadow: '4px 4px 0 rgba(0,0,0,0.05)'
        }}>
          404
        </div>
        
        <Title level={1} style={{ 
          fontWeight: 900, 
          textTransform: 'uppercase', 
          marginBottom: '16px',
          fontSize: '48px'
        }}>
          Page Not Found
        </Title>
        
        <Paragraph style={{ 
          fontSize: '18px', 
          color: '#666', 
          marginBottom: '40px',
          lineHeight: 1.6
        }}>
          Sorry, the page you're looking for doesn't exist or has been moved. 
          Let's get you back on track.
        </Paragraph>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/">
            <Button 
              type="primary" 
              size="large" 
              icon={<HomeOutlined />}
              style={{ 
                background: '#111827', 
                borderColor: '#111827',
                height: '56px',
                padding: '0 32px',
                fontWeight: 'bold',
                borderRadius: '28px'
              }}
            >
              Go Home
            </Button>
          </Link>
          
          <Link to="/properties">
            <Button 
              size="large" 
              icon={<SearchOutlined />}
              style={{ 
                height: '56px',
                padding: '0 32px',
                fontWeight: 'bold',
                borderRadius: '28px'
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
