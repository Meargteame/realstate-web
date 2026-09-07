import React, { useState } from "react";
import { Input, Button, Typography, Space } from "antd";
import { SearchOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "../hooks/useBreakpoint";

const { Title, Text } = Typography;

export default function Hero() {
  const [searchValue, setSearchValue] = useState("");
  const [activeTab, setActiveTab] = useState("buy");
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleSearch = () => {
    const query = searchValue.trim();
    let url = `/properties?status=${activeTab === 'rent' ? 'For Rent' : activeTab === 'sold' ? 'Sold' : 'Active'}`;
    if (activeTab === 'commercial') {
      url += '&propertyType=Commercial';
    }
    if (query) {
      url += `&q=${encodeURIComponent(query)}`;
    }
    navigate(url);
  };

  const tabs = [
    { key: "buy", label: "Buy" },
    { key: "rent", label: "Rent" },
    { key: "commercial", label: "Commercial" },
    { key: "sold", label: "Sold" },
  ];

  return (
    <section style={{ 
      position: 'relative', 
      height: isMobile ? '520px' : '620px',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      background: '#0f172a'
    }}>
      {/* High-Resolution Architectural Photography Background */}
      <div 
        style={{ 
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url("https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=90")',
          backgroundSize: 'cover',
          backgroundPosition: 'center 40%',
          opacity: 0.55,
        }} 
      />
      
      {/* Subtle Overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.4) 0%, rgba(15, 23, 42, 0.75) 100%)'
      }} />

      <div style={{ 
        position: 'relative', 
        zIndex: 2, 
        maxWidth: '960px', 
        width: '100%', 
        padding: '0 20px',
        textAlign: 'center'
      }}>
        {/* Main Headline (Zillow / Compass Style) */}
        <Title 
          style={{ 
            color: 'white', 
            fontSize: isMobile ? '32px' : '58px', 
            fontWeight: 800, 
            marginBottom: '16px', 
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
            textShadow: '0 2px 10px rgba(0,0,0,0.5)'
          }}
        >
          Agents. Neighborhoods. Homes.
        </Title>
        
        {/* Subheadline */}
        <Text 
          style={{ 
            color: 'rgba(255,255,255,0.92)', 
            fontSize: isMobile ? '15px' : '19px', 
            display: 'block', 
            fontWeight: 400,
            lineHeight: 1.5,
            maxWidth: '620px',
            margin: '0 auto 32px',
            textShadow: '0 1px 4px rgba(0,0,0,0.5)'
          }}
        >
          Discover US commercial real estate & luxury residential properties with TORRA Group
        </Text>

        {/* Zillow / Redfin Style Search Container */}
        <div style={{ 
          maxWidth: '820px',
          margin: '0 auto',
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2)',
          padding: isMobile ? '12px' : '16px 20px'
        }}>
          {/* Tab Switcher */}
          <div style={{ marginBottom: '12px', display: 'flex', gap: '6px' }}>
            {tabs.map((t) => {
              const isActive = activeTab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    background: isActive ? '#b40101' : 'transparent',
                    color: isActive ? '#ffffff' : '#4b5563',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Search Input Bar */}
          <div style={{ display: 'flex', gap: '8px', flexDirection: isMobile ? 'column' : 'row' }}>
            <Input 
              size="large"
              placeholder="Address, City, Neighborhood, or ZIP code" 
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onPressEnter={handleSearch}
              prefix={<SearchOutlined style={{ color: '#6b7280', fontSize: '18px', marginRight: '4px' }} />}
              style={{ 
                height: '52px', 
                borderRadius: '10px',
                fontSize: '16px',
                border: '1.5px solid #d1d5db',
                fontWeight: 500
              }} 
            />
            <Button 
              type="primary" 
              size="large" 
              onClick={handleSearch}
              style={{ 
                height: '52px', 
                padding: '0 32px',
                borderRadius: '10px',
                background: '#b40101',
                borderColor: '#b40101',
                fontWeight: 700,
                fontSize: '15px',
                letterSpacing: '0.02em',
                flexShrink: 0
              }}
            >
              Search
            </Button>
          </div>
        </div>

        {/* Location Pills */}
        <div style={{ marginTop: '24px' }}>
           <Space size="small" wrap justify="center">
              <Text style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 600, fontSize: '13px' }}>
                Popular Cities:
              </Text>
              {['Austin, TX', 'Miami, FL', 'Charlotte, NC', 'Denver, CO', 'Dallas, TX'].map(city => (
                <span 
                  key={city}
                  style={{ 
                    color: 'white', 
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 600,
                    padding: '4px 12px',
                    borderRadius: '16px',
                    background: 'rgba(255,255,255,0.15)',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => navigate(`/properties?q=${city.split(',')[0]}`)}
                >
                  {city}
                </span>
              ))}
           </Space>
        </div>
      </div>
    </section>
  );
}
