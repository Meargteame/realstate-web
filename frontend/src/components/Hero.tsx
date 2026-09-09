import React, { useState } from "react";
import { Input, Button, Typography, Space, Select } from "antd";
import { 
  SearchOutlined, 
  EnvironmentOutlined, 
  HomeOutlined, 
  BankOutlined, 
  ShopOutlined, 
  CheckCircleFilled 
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "../hooks/useBreakpoint";

const { Title, Text } = Typography;

export default function Hero() {
  const [searchValue, setSearchValue] = useState("");
  const [activeTab, setActiveTab] = useState("buy");
  const [propertyType, setPropertyType] = useState<string>("all");
  const [priceTier, setPriceTier] = useState<string>("all");
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleSearch = () => {
    const query = searchValue.trim();
    let url = `/properties?status=${activeTab === 'rent' ? 'For Rent' : activeTab === 'sold' ? 'Sold' : 'Active'}`;
    
    if (activeTab === 'commercial') {
      url += '&propertyType=Commercial';
    } else if (propertyType && propertyType !== 'all') {
      url += `&propertyType=${encodeURIComponent(propertyType)}`;
    }

    if (priceTier === 'under500k') {
      url += '&maxPrice=500000';
    } else if (priceTier === '500k-1m') {
      url += '&minPrice=500000&maxPrice=1000000';
    } else if (priceTier === '1m-2m') {
      url += '&minPrice=1000000&maxPrice=2000000';
    } else if (priceTier === 'luxury2m') {
      url += '&minPrice=2000000';
    }

    if (query) {
      url += `&q=${encodeURIComponent(query)}`;
    }
    navigate(url);
  };

  const tabs = [
    { key: "buy", label: "Buy", icon: <HomeOutlined /> },
    { key: "rent", label: "Rent", icon: <BankOutlined /> },
    { key: "commercial", label: "Commercial", icon: <ShopOutlined /> },
    { key: "sold", label: "Recently Sold", icon: <CheckCircleFilled /> },
  ];

  const popularCities = [
    { name: "Austin, TX", query: "Austin" },
    { name: "Miami, FL", query: "Miami" },
    { name: "Dallas, TX", query: "Dallas" },
    { name: "Charlotte, NC", query: "Charlotte" },
    { name: "Denver, CO", query: "Denver" },
    { name: "Houston, TX", query: "Houston" },
  ];

  return (
    <section 
      style={{ 
        position: 'relative', 
        minHeight: isMobile ? '640px' : '720px',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: '#090d16',
        padding: isMobile ? '60px 16px 40px' : '80px 24px 60px'
      }}
    >
      {/* High-Resolution Luxury Architectural Photography Background */}
      <div 
        style={{ 
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url("https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2400&q=90")',
          backgroundSize: 'cover',
          backgroundPosition: 'center 45%',
          opacity: 0.45,
          transform: 'scale(1.02)'
        }} 
      />
      
      {/* Modern Radial & Gradient Scrim */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(9, 13, 22, 0.75) 0%, rgba(15, 23, 42, 0.5) 45%, rgba(9, 13, 22, 0.95) 100%)'
        }} 
      />

      {/* Hero Content Area */}
      <div 
        style={{ 
          position: 'relative', 
          zIndex: 10, 
          maxWidth: '1100px', 
          width: '100%', 
          margin: '0 auto',
          textAlign: 'center'
        }}
      >
        {/* Luxury Brand Pill Badge */}
        <div style={{ marginBottom: '18px', display: 'inline-flex' }}>
          <div 
            style={{ 
              background: 'rgba(255, 255, 255, 0.12)', 
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.25)', 
              padding: '6px 18px', 
              borderRadius: '999px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
            }}
          >
            <span style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              backgroundColor: '#ef4444', 
              boxShadow: '0 0 10px #ef4444' 
            }} />
            <Text style={{ color: '#ffffff', fontSize: '13px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              TORRA Commercial & Luxury Residential Group
            </Text>
          </div>
        </div>

        {/* Main Headline */}
        <Title 
          style={{ 
            color: '#ffffff', 
            fontSize: isMobile ? '34px' : '62px', 
            fontWeight: 900, 
            marginBottom: '16px', 
            letterSpacing: '-0.03em',
            lineHeight: 1.12,
            textShadow: '0 4px 20px rgba(0,0,0,0.6)'
          }}
        >
          Find Your Next Masterpiece
        </Title>
        
        {/* Subheadline */}
        <Text 
          style={{ 
            color: 'rgba(241, 245, 249, 0.92)', 
            fontSize: isMobile ? '16px' : '20px', 
            display: 'block', 
            fontWeight: 400,
            lineHeight: 1.6,
            maxWidth: '680px',
            margin: '0 auto 36px',
            textShadow: '0 2px 8px rgba(0,0,0,0.6)'
          }}
        >
          Search verified MLS listings, curated luxury estates, and prime commercial investments across North America.
        </Text>

        {/* Glassmorphic Search Container */}
        <div 
          style={{ 
            maxWidth: '920px',
            margin: '0 auto',
            background: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.2)',
            padding: isMobile ? '14px' : '20px 24px',
            textAlign: 'left'
          }}
        >
          {/* Tab Switcher */}
          <div 
            style={{ 
              marginBottom: '16px', 
              display: 'flex', 
              gap: '6px', 
              borderBottom: '1px solid #e2e8f0', 
              paddingBottom: '12px',
              overflowX: 'auto'
            }}
          >
            {tabs.map((t) => {
              const isActive = activeTab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 18px',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    background: isActive ? '#b40101' : 'transparent',
                    color: isActive ? '#ffffff' : '#64748b',
                    boxShadow: isActive ? '0 4px 12px rgba(180, 1, 1, 0.3)' : 'none',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {t.icon}
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Input Bar & Quick Filters */}
          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: isMobile ? '1fr' : '1fr auto auto auto', 
              gap: '10px',
              alignItems: 'center'
            }}
          >
            {/* Location / Keyword Input */}
            <Input 
              size="large"
              placeholder="City, Neighborhood, Address, or ZIP" 
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onPressEnter={handleSearch}
              prefix={<EnvironmentOutlined style={{ color: '#b40101', fontSize: '18px', marginRight: '6px' }} />}
              style={{ 
                height: '54px', 
                borderRadius: '12px',
                fontSize: '15px',
                border: '1.5px solid #cbd5e1',
                fontWeight: 500,
                background: '#ffffff'
              }} 
            />

            {/* Property Type Selector */}
            {!isMobile && activeTab !== 'commercial' && (
              <Select
                value={propertyType}
                onChange={setPropertyType}
                style={{ width: '160px', height: '54px' }}
                options={[
                  { value: 'all', label: 'All Property Types' },
                  { value: 'Single Family', label: 'Single Family' },
                  { value: 'Condo', label: 'Luxury Condo' },
                  { value: 'Townhouse', label: 'Townhouse' },
                  { value: 'Land', label: 'Land & Lots' },
                ]}
              />
            )}

            {/* Price Tier Selector */}
            {!isMobile && (
              <Select
                value={priceTier}
                onChange={setPriceTier}
                style={{ width: '150px', height: '54px' }}
                options={[
                  { value: 'all', label: 'Any Price' },
                  { value: 'under500k', label: 'Under $500k' },
                  { value: '500k-1m', label: '$500k – $1M' },
                  { value: '1m-2m', label: '$1M – $2M' },
                  { value: 'luxury2m', label: '$2M+ Luxury' },
                ]}
              />
            )}

            {/* Search CTA Button */}
            <Button 
              type="primary" 
              size="large" 
              onClick={handleSearch}
              icon={<SearchOutlined />}
              style={{ 
                height: '54px', 
                padding: '0 32px',
                borderRadius: '12px',
                background: '#b40101',
                borderColor: '#b40101',
                fontWeight: 800,
                fontSize: '15px',
                letterSpacing: '0.02em',
                boxShadow: '0 4px 14px rgba(180, 1, 1, 0.4)',
                width: isMobile ? '100%' : 'auto'
              }}
            >
              Search
            </Button>
          </div>
        </div>

        {/* Live Market Trust Stats Counter Bar */}
        <div 
          style={{ 
            marginTop: '36px',
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
            gap: isMobile ? '12px' : '16px',
            maxWidth: '860px',
            margin: '36px auto 0'
          }}
        >
          {[
            { value: "1,450+", label: "Verified MLS Listings" },
            { value: "$480M+", label: "Total Real Estate Volume" },
            { value: "14 Days", label: "Average Time on Market" },
            { value: "99.4%", label: "List-to-Sale Ratio" },
          ].map((stat, idx) => (
            <div 
              key={idx}
              style={{
                background: 'rgba(15, 23, 42, 0.65)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '14px',
                padding: '12px 14px',
                textAlign: 'center'
              }}
            >
              <div style={{ color: '#ffffff', fontSize: isMobile ? '18px' : '22px', fontWeight: 900, letterSpacing: '-0.02em' }}>
                {stat.value}
              </div>
              <div style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '2px' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Trending Market Location Chips */}
        <div style={{ marginTop: '28px' }}>
          <Space size="small" wrap justify="center">
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: '13px' }}>
              🔥 Trending Metro Markets:
            </Text>
            {popularCities.map(city => (
              <span 
                key={city.name}
                style={{ 
                  color: '#ffffff', 
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                  padding: '5px 14px',
                  borderRadius: '20px',
                  background: 'rgba(255,255,255,0.12)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  transition: 'all 0.2s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(180, 1, 1, 0.8)';
                  e.currentTarget.style.borderColor = '#b40101';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)';
                }}
                onClick={() => navigate(`/properties?q=${encodeURIComponent(city.query)}`)}
              >
                {city.name}
              </span>
            ))}
          </Space>
        </div>
      </div>
    </section>
  );
}
