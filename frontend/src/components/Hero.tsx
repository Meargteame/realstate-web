import React, { useState } from "react";
import { Input, Button, Card, Typography, Space, Select } from "antd";
import { 
  SearchOutlined, HomeOutlined, BankOutlined, ShopOutlined, 
  CheckCircleOutlined, EnvironmentOutlined, DollarOutlined, AppstoreOutlined,
  ArrowRightOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "../hooks/useBreakpoint";

const { Title, Text } = Typography;

export default function Hero() {
  const [searchValue, setSearchValue] = useState("");
  const [activeTab, setActiveTab] = useState("buy");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedPrice, setSelectedPrice] = useState<string>("any");
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleSearch = () => {
    const query = searchValue.trim();
    let url = `/properties?status=${activeTab === 'rent' ? 'For Rent' : activeTab === 'sold' ? 'Sold' : 'Active'}`;
    
    if (activeTab === 'commercial' || selectedType === 'commercial') {
      url += '&propertyType=Commercial';
    } else if (selectedType !== 'all') {
      url += `&propertyType=${encodeURIComponent(selectedType)}`;
    }

    if (selectedPrice !== 'any') {
      const minPrice = selectedPrice.split('-')[0];
      const maxPrice = selectedPrice.split('-')[1];
      if (minPrice) url += `&minPrice=${minPrice}`;
      if (maxPrice) url += `&maxPrice=${maxPrice}`;
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
    { key: "sold", label: "Recently Sold", icon: <CheckCircleOutlined /> },
  ];

  return (
    <section style={{ 
      position: 'relative', 
      height: isMobile ? 'auto' : '88vh', 
      minHeight: isMobile ? '620px' : '740px',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      background: '#111827',
      padding: isMobile ? '60px 16px 40px' : '0 24px'
    }}>
      {/* Architectural Background Image */}
      <div 
        style={{ 
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url("https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=90")',
          backgroundSize: 'cover',
          backgroundPosition: 'center 35%',
          opacity: 0.45,
        }} 
      />
      
      {/* Subtle Vignette Gradient Overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse at center, rgba(17, 24, 39, 0.4) 0%, rgba(17, 24, 39, 0.85) 100%)'
      }} />

      <div style={{ 
        position: 'relative', 
        zIndex: 2, 
        maxWidth: '1180px', 
        width: '100%', 
        textAlign: 'center', 
        color: 'white' 
      }}>
        {/* Luxury Badge */}
        <div style={{ marginBottom: '20px' }}>
          <span style={{
            background: 'rgba(180, 1, 1, 0.9)',
            color: '#ffffff',
            padding: '8px 20px',
            borderRadius: '30px',
            fontSize: isMobile ? '11px' : '13px',
            fontWeight: 800,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            boxShadow: '0 4px 14px rgba(180, 1, 1, 0.4)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ffffff', display: 'inline-block' }} />
            TORRA Commercial & Residential Group
          </span>
        </div>

        {/* Main Headline */}
        <Title 
          style={{ 
            color: 'white', 
            fontSize: isMobile ? '38px' : '72px', 
            fontWeight: 900, 
            marginBottom: isMobile ? '16px' : '24px', 
            letterSpacing: '-0.03em',
            lineHeight: 1.08,
            textShadow: '0 4px 24px rgba(0,0,0,0.6)'
          }}
        >
          Find Your Next <span style={{ color: '#ff4d4f', textDecoration: 'underline', textDecorationColor: '#b40101', textUnderlineOffset: '8px' }}>Extraordinary</span> Estate
        </Title>
        
        {/* Subheadline */}
        <Text 
          style={{ 
            color: 'rgba(255,255,255,0.92)', 
            fontSize: isMobile ? '15px' : '21px', 
            display: 'block', 
            fontWeight: 400,
            lineHeight: 1.6,
            maxWidth: '740px',
            margin: '0 auto 40px',
            textShadow: '0 2px 10px rgba(0,0,0,0.5)'
          }}
        >
          Search luxury residential properties, commercial developments, and prime land listings with top advisors.
        </Text>

        {/* Multi-Field Search Card */}
        <div style={{ 
          background: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          padding: isMobile ? '16px' : '24px',
          textAlign: 'left'
        }}>
          {/* Category Pill Tabs */}
          <div style={{ marginBottom: '20px', display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {tabs.map((t) => {
              const isActive = activeTab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: isMobile ? '8px 16px' : '10px 24px',
                    borderRadius: '30px',
                    fontSize: isMobile ? '13px' : '14px',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    background: isActive ? '#b40101' : '#f3f4f6',
                    color: isActive ? '#ffffff' : '#374151',
                    boxShadow: isActive ? '0 4px 12px rgba(180, 1, 1, 0.35)' : 'none',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {t.icon}
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Inputs Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '2.2fr 1.2fr 1.2fr 1.4fr',
            gap: '12px',
            alignItems: 'center'
          }}>
            {/* Location Input */}
            <div>
              <Text style={{ fontSize: '11px', fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>
                LOCATION
              </Text>
              <Input 
                size="large"
                placeholder="City, ZIP, address, or neighborhood" 
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onPressEnter={handleSearch}
                prefix={<EnvironmentOutlined style={{ color: '#b40101', fontSize: '16px' }} />}
                style={{ 
                  height: '52px', 
                  borderRadius: '12px',
                  fontSize: '15px',
                  border: '1.5px solid #e5e7eb',
                  fontWeight: 500
                }} 
              />
            </div>

            {/* Property Type */}
            <div>
              <Text style={{ fontSize: '11px', fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>
                PROPERTY TYPE
              </Text>
              <Select
                size="large"
                value={selectedType}
                onChange={(v) => setSelectedType(v)}
                style={{ width: '100%', height: '52px' }}
                options={[
                  { value: 'all', label: 'All Property Types' },
                  { value: 'Single Family', label: 'Single Family' },
                  { value: 'Condo', label: 'Condo / Townhome' },
                  { value: 'Commercial', label: 'Commercial Building' },
                  { value: 'Land', label: 'Land / Lot' },
                  { value: 'Multi-Family', label: 'Multi-Family' },
                ]}
              />
            </div>

            {/* Price Range */}
            <div>
              <Text style={{ fontSize: '11px', fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>
                MAX PRICE
              </Text>
              <Select
                size="large"
                value={selectedPrice}
                onChange={(v) => setSelectedPrice(v)}
                style={{ width: '100%', height: '52px' }}
                options={[
                  { value: 'any', label: 'Any Price' },
                  { value: '0-500000', label: 'Under $500,000' },
                  { value: '500000-1000000', label: '$500k – $1,000,000' },
                  { value: '1000000-2500000', label: '$1.0M – $2.5M' },
                  { value: '2500000-5000000', label: '$2.5M – $5.0M' },
                  { value: '5000000-100000000', label: '$5.0M+' },
                ]}
              />
            </div>

            {/* CTA Button */}
            <div style={{ marginTop: isMobile ? '8px' : '22px' }}>
              <Button 
                type="primary" 
                size="large" 
                onClick={handleSearch}
                icon={<SearchOutlined style={{ fontSize: '18px' }} />}
                style={{ 
                  height: '52px', 
                  width: '100%',
                  borderRadius: '12px',
                  background: '#b40101',
                  borderColor: '#b40101',
                  fontWeight: 800,
                  fontSize: '15px',
                  letterSpacing: '0.05em',
                  boxShadow: '0 4px 14px rgba(180, 1, 1, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                SEARCH NOW
              </Button>
            </div>
          </div>
        </div>

        {/* Popular Markets */}
        <div style={{ marginTop: '28px' }}>
           <Space size="middle" wrap justify="center">
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 700, fontSize: isMobile ? '12px' : '14px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Featured Markets:
              </Text>
              {['Austin, TX', 'Miami, FL', 'Charlotte, NC', 'Denver, CO', 'Dallas, TX'].map(city => (
                <button 
                  key={city}
                  style={{ 
                    color: 'white', 
                    cursor: 'pointer',
                    fontSize: isMobile ? '12px' : '14px',
                    fontWeight: 600,
                    padding: '6px 16px',
                    borderRadius: '20px',
                    background: 'rgba(255,255,255,0.15)',
                    border: '1px solid rgba(255,255,255,0.25)',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => navigate(`/properties?q=${city.split(',')[0]}`)}
                >
                  📍 {city}
                </button>
              ))}
           </Space>
        </div>
      </div>
    </section>
  );
}
