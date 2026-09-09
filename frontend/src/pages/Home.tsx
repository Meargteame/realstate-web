import React, { useState, useEffect } from "react";
import Hero from "@/components/Hero";
import PropertyCard from "@/components/PropertyCard";
import { Button, Typography, Row, Col, Card, Space, Slider, InputNumber, Tag, Tabs } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useIsMobile } from "../hooks/useBreakpoint";
import {
  ArrowRightOutlined,
  HomeOutlined,
  DollarOutlined,
  CalculatorOutlined,
  SearchOutlined,
  EnvironmentOutlined,
  CheckCircleFilled,
  StarFilled,
  SafetyCertificateFilled,
  ThunderboltFilled,
  TeamOutlined,
  VideoCameraOutlined,
  GlobalOutlined,
  KeyOutlined,
  RiseOutlined
} from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;

export default function Home() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  // Mortgage Quick Estimator States
  const [homePrice, setHomePrice] = useState<number>(650000);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [loanTermYears, setLoanTermYears] = useState<number>(30);
  const [interestRate, setInterestRate] = useState<number>(6.5);

  useEffect(() => {
    fetch("/api/properties?limit=12")
      .then((r) => r.json())
      .then((data) => {
        setProperties(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setProperties([]);
        setLoading(false);
      });
  }, []);

  // Filtered properties based on active tab
  const getFilteredProperties = () => {
    if (selectedFilter === "luxury") {
      return properties.filter(p => (p.price || 0) >= 1000000).slice(0, 6);
    }
    if (selectedFilter === "commercial") {
      return properties.filter(p => p.propertyType === 'Commercial' || p.propertyType === 'Industrial').slice(0, 6);
    }
    if (selectedFilter === "rent") {
      return properties.filter(p => p.status === 'For Rent').slice(0, 6);
    }
    if (selectedFilter === "single-family") {
      return properties.filter(p => p.propertyType === 'Single Family' || !p.propertyType).slice(0, 6);
    }
    return properties.slice(0, 6);
  };

  // Calculate monthly mortgage payment
  const calculateMonthlyPayment = () => {
    const principal = homePrice * (1 - downPaymentPercent / 100);
    const monthlyRate = (interestRate / 100) / 12;
    const totalPayments = loanTermYears * 12;
    
    let monthlyPI = 0;
    if (monthlyRate > 0) {
      monthlyPI = (principal * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments))) / 
                  (Math.pow(1 + monthlyRate, totalPayments) - 1);
    } else {
      monthlyPI = principal / totalPayments;
    }

    const estimatedTax = (homePrice * 0.012) / 12;
    const estimatedInsurance = (homePrice * 0.004) / 12;
    const totalMonthly = Math.round(monthlyPI + estimatedTax + estimatedInsurance);

    return {
      monthlyPI: Math.round(monthlyPI),
      estimatedTax: Math.round(estimatedTax),
      estimatedInsurance: Math.round(estimatedInsurance),
      totalMonthly
    };
  };

  const mortgage = calculateMonthlyPayment();

  const categories = [
    { name: "Single Family", count: "840+ Homes", icon: <HomeOutlined />, link: "/properties?propertyType=Single+Family" },
    { name: "Luxury Estates", count: "$1M+ Listings", icon: <StarFilled />, link: "/properties?minPrice=1000000" },
    { name: "Commercial & Retail", count: "120+ Spaces", icon: <GlobalOutlined />, link: "/properties?type=Commercial" },
    { name: "Modern Condos", count: "310+ Units", icon: <KeyOutlined />, link: "/properties?propertyType=Condo" },
    { name: "Rental Properties", count: "250+ Leases", icon: <DollarOutlined />, link: "/properties?status=For+Rent" },
    { name: "Land & Development", count: "90+ Lots", icon: <EnvironmentOutlined />, link: "/properties?type=Land" },
  ];

  const popularMarkets = [
    { city: "Austin, TX", count: "1,240 homes", median: "$585,000", growth: "+4.8%", img: "https://images.unsplash.com/photo-1531218150217-54595bc2b934?auto=format&fit=crop&w=700&q=80" },
    { city: "Miami, FL", count: "3,850 homes", median: "$640,000", growth: "+6.2%", img: "https://images.unsplash.com/photo-1535498730771-e735b998cd64?auto=format&fit=crop&w=700&q=80" },
    { city: "Dallas, TX", count: "2,490 homes", median: "$475,000", growth: "+3.9%", img: "https://images.unsplash.com/photo-1546154288-3e3f1d2234d1?auto=format&fit=crop&w=700&q=80" },
    { city: "Charlotte, NC", count: "1,620 homes", median: "$420,000", growth: "+5.1%", img: "https://images.unsplash.com/photo-1575917649705-5b59aaa12e6b?auto=format&fit=crop&w=700&q=80" },
  ];

  const valueProps = [
    {
      icon: <SafetyCertificateFilled style={{ fontSize: '32px', color: '#b40101' }} />,
      title: "100% MLS Real-Time Sync",
      desc: "Instant live updates directly from multiple MLS data feeds ensures you never miss a newly listed property."
    },
    {
      icon: <VideoCameraOutlined style={{ fontSize: '32px', color: '#b40101' }} />,
      title: "Immersive 3D & Video Tours",
      desc: "Experience high-definition Matterport 360° virtual tours from the comfort of your mobile device or laptop."
    },
    {
      icon: <TeamOutlined style={{ fontSize: '32px', color: '#b40101' }} />,
      title: "Top-Tier Certified Advisors",
      desc: "Work with elite, high-producing commercial and residential specialists dedicated to negotiating your best deal."
    },
    {
      icon: <RiseOutlined style={{ fontSize: '32px', color: '#b40101' }} />,
      title: "Instant Market Intelligence",
      desc: "Accurate predictive valuation metrics, historical comps, and neighborhood growth trends at your fingertips."
    }
  ];

  return (
    <div style={{ background: "#ffffff", color: "#0f172a" }}>
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. Lifestyle & Property Category Navigation */}
      <section style={{ padding: isMobile ? '32px 16px' : '48px 32px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1320px', margin: '0 auto' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(6, 1fr)', 
            gap: '14px' 
          }}>
            {categories.map((cat, idx) => (
              <div
                key={idx}
                onClick={() => navigate(cat.link)}
                style={{
                  background: '#ffffff',
                  borderRadius: '14px',
                  padding: '20px 16px',
                  textAlign: 'center',
                  border: '1px solid #e2e8f0',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  boxShadow: '0 2px 4px rgba(15, 23, 42, 0.04)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = '#b40101';
                  e.currentTarget.style.boxShadow = '0 12px 20px -5px rgba(180, 1, 1, 0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(15, 23, 42, 0.04)';
                }}
              >
                <div style={{ fontSize: '24px', color: '#b40101', marginBottom: '8px' }}>
                  {cat.icon}
                </div>
                <div style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a', marginBottom: '2px' }}>
                  {cat.name}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                  {cat.count}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Featured Properties Showcase with Tabbed Filters */}
      <section style={{ padding: isMobile ? '48px 16px' : '80px 32px', maxWidth: '1360px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#b40101', fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
              <ThunderboltFilled /> Handpicked & Verified
            </div>
            <Title level={2} style={{ fontSize: isMobile ? '28px' : '38px', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
              Featured Properties
            </Title>
          </div>

          {/* Quick Category Filter Pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { key: 'all', label: 'All Listings' },
              { key: 'luxury', label: 'Luxury $1M+' },
              { key: 'single-family', label: 'Single Family' },
              { key: 'commercial', label: 'Commercial' },
              { key: 'rent', label: 'For Rent' }
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setSelectedFilter(f.key)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: 700,
                  border: '1px solid',
                  borderColor: selectedFilter === f.key ? '#b40101' : '#cbd5e1',
                  background: selectedFilter === f.key ? '#b40101' : '#ffffff',
                  color: selectedFilter === f.key ? '#ffffff' : '#475569',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Property Grid */}
        <Row gutter={[24, 28]}>
          {loading ? (
            <div style={{ padding: '60px 0', textAlign: 'center', width: '100%', color: '#64748b' }}>
              Loading properties...
            </div>
          ) : getFilteredProperties().length > 0 ? (
            getFilteredProperties().map((p) => (
              <Col xs={24} sm={12} lg={8} key={p.id}>
                <PropertyCard property={p} />
              </Col>
            ))
          ) : (
            <div style={{ padding: '60px 0', textAlign: 'center', width: '100%', color: '#64748b' }}>
              No properties found in this category.
            </div>
          )}
        </Row>

        <div style={{ textAlign: 'center', marginTop: '48px' }}>
          <Button 
            type="primary" 
            size="large"
            onClick={() => navigate('/properties')}
            style={{ 
              height: '52px', 
              padding: '0 36px', 
              fontSize: '15px', 
              fontWeight: 800, 
              borderRadius: '10px',
              background: '#0f172a',
              borderColor: '#0f172a'
            }}
          >
            Explore All 1,450+ Properties <ArrowRightOutlined />
          </Button>
        </div>
      </section>

      {/* 4. Interactive Mortgage & Affordability Quick Estimator */}
      <section style={{ background: '#090d16', color: '#ffffff', padding: isMobile ? '50px 16px' : '90px 32px', position: 'relative', overflow: 'hidden' }}>
        <div 
          style={{ 
            position: 'absolute', 
            top: 0, 
            right: 0, 
            width: '400px', 
            height: '400px', 
            background: 'radial-gradient(circle, rgba(180, 1, 1, 0.15) 0%, rgba(0,0,0,0) 70%)',
            pointerEvents: 'none'
          }} 
        />

        <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <Row gutter={[48, 36]} align="middle">
            {/* Left Column: Explainer */}
            <Col xs={24} lg={11}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.1)', padding: '6px 14px', borderRadius: '20px', color: '#f87171', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '16px' }}>
                <CalculatorOutlined /> Smart Finance Calculator
              </div>
              <Title level={2} style={{ color: '#ffffff', fontSize: isMobile ? '30px' : '42px', fontWeight: 900, marginBottom: '18px', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
                Estimate Your Monthly Mortgage Payment
              </Title>
              <Paragraph style={{ color: '#94a3b8', fontSize: '16px', lineHeight: 1.6, marginBottom: '28px' }}>
                Calculate your estimated principal, interest, taxes, and insurance in real-time to determine your purchasing power.
              </Paragraph>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#e2e8f0', fontSize: '15px', fontWeight: 600 }}>
                  <CheckCircleFilled style={{ color: '#4ade80' }} /> Accurate principal & interest calculation
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#e2e8f0', fontSize: '15px', fontWeight: 600 }}>
                  <CheckCircleFilled style={{ color: '#4ade80' }} /> Includes estimated property taxes and insurance
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#e2e8f0', fontSize: '15px', fontWeight: 600 }}>
                  <CheckCircleFilled style={{ color: '#4ade80' }} /> Connect directly with verified mortgage loan officers
                </div>
              </div>

              <Button 
                type="primary" 
                size="large"
                onClick={() => navigate('/mortgage-calculator')}
                style={{ 
                  background: '#b40101', 
                  borderColor: '#b40101', 
                  fontWeight: 800, 
                  borderRadius: '10px', 
                  height: '48px', 
                  padding: '0 28px' 
                }}
              >
                Detailed Mortgage Tool <ArrowRightOutlined />
              </Button>
            </Col>

            {/* Right Column: Interactive Card */}
            <Col xs={24} lg={13}>
              <div 
                style={{ 
                  background: 'rgba(15, 23, 42, 0.85)', 
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)', 
                  borderRadius: '24px', 
                  padding: isMobile ? '24px 20px' : '36px',
                  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
                }}
              >
                {/* Result Display Box */}
                <div 
                  style={{ 
                    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', 
                    borderRadius: '16px', 
                    padding: '24px', 
                    textAlign: 'center',
                    border: '1px solid rgba(255,255,255,0.1)',
                    marginBottom: '28px'
                  }}
                >
                  <Text style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Estimated Total Monthly Payment
                  </Text>
                  <div style={{ fontSize: isMobile ? '38px' : '48px', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.03em', margin: '4px 0' }}>
                    ${mortgage.totalMonthly.toLocaleString()}
                    <span style={{ fontSize: '16px', color: '#94a3b8', fontWeight: 600 }}>/mo</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '12px', color: '#cbd5e1', flexWrap: 'wrap', marginTop: '10px' }}>
                    <span>P&I: <strong>${mortgage.monthlyPI.toLocaleString()}</strong></span>
                    <span>•</span>
                    <span>Taxes: <strong>${mortgage.estimatedTax.toLocaleString()}</strong></span>
                    <span>•</span>
                    <span>Ins: <strong>${mortgage.estimatedInsurance.toLocaleString()}</strong></span>
                  </div>
                </div>

                {/* Home Price Slider */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#e2e8f0', fontWeight: 700, marginBottom: '6px' }}>
                    <span>Home Price</span>
                    <span style={{ color: '#60a5fa', fontSize: '16px' }}>${homePrice.toLocaleString()}</span>
                  </div>
                  <Slider 
                    min={100000} 
                    max={2500000} 
                    step={10000} 
                    value={homePrice} 
                    onChange={setHomePrice} 
                  />
                </div>

                {/* Down Payment Slider */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#e2e8f0', fontWeight: 700, marginBottom: '6px' }}>
                    <span>Down Payment ({downPaymentPercent}%)</span>
                    <span style={{ color: '#60a5fa', fontSize: '16px' }}>${Math.round(homePrice * (downPaymentPercent / 100)).toLocaleString()}</span>
                  </div>
                  <Slider 
                    min={0} 
                    max={50} 
                    step={5} 
                    value={downPaymentPercent} 
                    onChange={setDownPaymentPercent} 
                  />
                </div>

                {/* Interest Rate & Term Selection */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <div style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '13px', marginBottom: '8px' }}>Interest Rate</div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {[6.0, 6.5, 7.0].map((rate) => (
                        <button
                          key={rate}
                          onClick={() => setInterestRate(rate)}
                          style={{
                            flex: 1,
                            padding: '8px 0',
                            borderRadius: '8px',
                            border: '1px solid',
                            borderColor: interestRate === rate ? '#b40101' : '#334155',
                            background: interestRate === rate ? '#b40101' : '#1e293b',
                            color: '#ffffff',
                            fontWeight: 700,
                            fontSize: '13px',
                            cursor: 'pointer'
                          }}
                        >
                          {rate}%
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '13px', marginBottom: '8px' }}>Loan Term</div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {[15, 30].map((term) => (
                        <button
                          key={term}
                          onClick={() => setLoanTermYears(term)}
                          style={{
                            flex: 1,
                            padding: '8px 0',
                            borderRadius: '8px',
                            border: '1px solid',
                            borderColor: loanTermYears === term ? '#b40101' : '#334155',
                            background: loanTermYears === term ? '#b40101' : '#1e293b',
                            color: '#ffffff',
                            fontWeight: 700,
                            fontSize: '13px',
                            cursor: 'pointer'
                          }}
                        >
                          {term} Years
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* 5. 3-Core Services (Buy, Sell, Rent) */}
      <section style={{ padding: isMobile ? '48px 16px' : '80px 32px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <Text style={{ color: '#b40101', fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '6px' }}>
              Full-Service Real Estate
            </Text>
            <Title level={2} style={{ fontSize: isMobile ? '28px' : '38px', fontWeight: 900, color: '#0f172a', margin: 0 }}>
              How We Can Help You
            </Title>
          </div>

          <Row gutter={[28, 28]}>
            {/* Buy Card */}
            <Col xs={24} md={8}>
              <div style={{ 
                background: '#ffffff', 
                borderRadius: '20px', 
                padding: '40px 32px', 
                border: '1px solid #e2e8f0', 
                boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.05)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: '#fee2e2', color: '#b40101', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', fontSize: '26px' }}>
                    <HomeOutlined />
                  </div>
                  <Title level={3} style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
                    Buy a Property
                  </Title>
                  <Paragraph style={{ color: '#64748b', fontSize: '15px', lineHeight: 1.6, marginBottom: '24px' }}>
                    Explore residential and commercial properties with verified data, custom alerts, and top buyer representation.
                  </Paragraph>
                </div>
                <Button 
                  type="primary" 
                  size="large"
                  onClick={() => navigate('/properties')}
                  style={{ background: '#b40101', borderColor: '#b40101', fontWeight: 700, borderRadius: '10px', height: '48px', width: '100%' }}
                >
                  Browse Properties
                </Button>
              </div>
            </Col>

            {/* Sell Card */}
            <Col xs={24} md={8}>
              <div style={{ 
                background: '#ffffff', 
                borderRadius: '20px', 
                padding: '40px 32px', 
                border: '1px solid #e2e8f0', 
                boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.05)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: '#e0e7ff', color: '#4338ca', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', fontSize: '26px' }}>
                    <DollarOutlined />
                  </div>
                  <Title level={3} style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
                    Sell with Confidence
                  </Title>
                  <Paragraph style={{ color: '#64748b', fontSize: '15px', lineHeight: 1.6, marginBottom: '24px' }}>
                    Get an instant AI valuation and partner with high-producing listing agents who maximize your net proceeds.
                  </Paragraph>
                </div>
                <Button 
                  type="primary" 
                  size="large"
                  onClick={() => navigate('/home-value')}
                  style={{ background: '#0f172a', borderColor: '#0f172a', fontWeight: 700, borderRadius: '10px', height: '48px', width: '100%' }}
                >
                  Get Home Valuation
                </Button>
              </div>
            </Col>

            {/* Rent Card */}
            <Col xs={24} md={8}>
              <div style={{ 
                background: '#ffffff', 
                borderRadius: '20px', 
                padding: '40px 32px', 
                border: '1px solid #e2e8f0', 
                boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.05)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', fontSize: '26px' }}>
                    <KeyOutlined />
                  </div>
                  <Title level={3} style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
                    Rent a Home or Lease
                  </Title>
                  <Paragraph style={{ color: '#64748b', fontSize: '15px', lineHeight: 1.6, marginBottom: '24px' }}>
                    Discover premium rental single-family homes, luxury condominiums, and commercial retail leases nationwide.
                  </Paragraph>
                </div>
                <Button 
                  type="default" 
                  size="large"
                  onClick={() => navigate('/properties?status=For+Rent')}
                  style={{ fontWeight: 700, borderRadius: '10px', height: '48px', width: '100%', borderColor: '#cbd5e1' }}
                >
                  Find Rentals
                </Button>
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* 6. Popular Real Estate Markets Grid */}
      <section style={{ padding: isMobile ? '48px 16px' : '80px 32px', maxWidth: '1360px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '44px' }}>
          <Text style={{ color: '#b40101', fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '6px' }}>
            Top Metro Hubs
          </Text>
          <Title level={2} style={{ fontSize: isMobile ? '28px' : '38px', fontWeight: 900, color: '#0f172a', marginBottom: '12px' }}>
            Explore High-Demand US Markets
          </Title>
          <Text style={{ color: '#64748b', fontSize: '16px' }}>
            Discover active property listings, price trends, and new developments
          </Text>
        </div>

        <Row gutter={[24, 24]}>
          {popularMarkets.map((m) => (
            <Col xs={24} sm={12} lg={6} key={m.city}>
              <div 
                onClick={() => navigate(`/properties?q=${encodeURIComponent(m.city.split(',')[0])}`)}
                style={{ 
                  position: 'relative', 
                  height: '280px', 
                  borderRadius: '20px', 
                  overflow: 'hidden',
                  cursor: 'pointer',
                  boxShadow: '0 8px 16px -4px rgba(15, 23, 42, 0.12)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  const img = e.currentTarget.querySelector('img');
                  if (img) img.style.transform = 'scale(1.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  const img = e.currentTarget.querySelector('img');
                  if (img) img.style.transform = 'scale(1.0)';
                }}
              >
                <img 
                  src={m.img} 
                  alt={m.city} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} 
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(15,23,42,0.1) 30%, rgba(15,23,42,0.85) 100%)' }} />
                
                {/* Growth Pill */}
                <div style={{ position: 'absolute', top: 16, right: 16 }}>
                  <span style={{ background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)', color: '#4ade80', fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)' }}>
                    {m.growth} YoY
                  </span>
                </div>

                {/* Bottom City Specs */}
                <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px', color: 'white' }}>
                  <Title level={4} style={{ color: 'white', margin: 0, fontSize: '20px', fontWeight: 900 }}>{m.city}</Title>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', fontSize: '13px', color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>
                    <span>{m.count}</span>
                    <span>Median: {m.median}</span>
                  </div>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </section>

      {/* 7. Why TORRA Advantage */}
      <section style={{ background: '#f8fafc', padding: isMobile ? '50px 16px' : '90px 32px', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 56px' }}>
            <Text style={{ color: '#b40101', fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '6px' }}>
              The TORRA Advantage
            </Text>
            <Title level={2} style={{ fontSize: isMobile ? '28px' : '38px', fontWeight: 900, color: '#0f172a', margin: 0 }}>
              Engineered for Modern Real Estate
            </Title>
          </div>

          <Row gutter={[28, 28]}>
            {valueProps.map((vp, idx) => (
              <Col xs={24} sm={12} lg={6} key={idx}>
                <div style={{ 
                  background: '#ffffff', 
                  borderRadius: '16px', 
                  padding: '32px 24px', 
                  border: '1px solid #e2e8f0', 
                  boxShadow: '0 2px 4px rgba(15, 23, 42, 0.04)',
                  height: '100%'
                }}>
                  <div style={{ marginBottom: '18px' }}>
                    {vp.icon}
                  </div>
                  <Title level={4} style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>
                    {vp.title}
                  </Title>
                  <Paragraph style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
                    {vp.desc}
                  </Paragraph>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* 8. Call to Action Banner */}
      <section style={{ padding: isMobile ? '40px 16px' : '72px 32px', background: '#0f172a' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
          <Title level={2} style={{ color: '#ffffff', fontSize: isMobile ? '28px' : '40px', fontWeight: 900, marginBottom: '16px', letterSpacing: '-0.02em' }}>
            Ready to Take the Next Step in Real Estate?
          </Title>
          <Paragraph style={{ color: '#94a3b8', fontSize: '16px', maxWidth: '600px', margin: '0 auto 32px', lineHeight: 1.6 }}>
            Whether buying an investment property or discovering your forever home, our elite advisors are ready to guide you.
          </Paragraph>
          <Space size="middle" wrap justify="center">
            <Button 
              type="primary" 
              size="large"
              onClick={() => navigate('/properties')}
              style={{ 
                height: '50px', 
                padding: '0 32px', 
                borderRadius: '10px', 
                background: '#b40101', 
                borderColor: '#b40101', 
                fontWeight: 800, 
                fontSize: '15px' 
              }}
            >
              Browse Listings
            </Button>
            <Button 
              type="default" 
              size="large"
              onClick={() => navigate('/agents')}
              style={{ 
                height: '50px', 
                padding: '0 32px', 
                borderRadius: '10px', 
                fontWeight: 700, 
                fontSize: '15px', 
                background: 'transparent', 
                color: '#ffffff', 
                borderColor: 'rgba(255,255,255,0.3)' 
              }}
            >
              Find an Agent
            </Button>
          </Space>
        </div>
      </section>
    </div>
  );
}
