import React, { useState, useEffect } from "react";
import { Typography, Space, message } from "antd";
import { 
  HeartOutlined, 
  HeartFilled, 
  ArrowRightOutlined, 
  EnvironmentOutlined,
  EyeOutlined,
  CompassOutlined
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { useIsMobile } from "../hooks/useBreakpoint";

const { Title, Text } = Typography;

interface PropertyCardProps {
  property: any;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const isMobile = useIsMobile();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('torra_saved_properties') || '[]');
      if (Array.isArray(saved) && saved.includes(property.id)) {
        setIsSaved(true);
      }
    } catch {}
  }, [property.id]);

  const toggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      let saved = JSON.parse(localStorage.getItem('torra_saved_properties') || '[]');
      if (!Array.isArray(saved)) saved = [];
      
      if (isSaved) {
        saved = saved.filter((id: any) => id !== property.id);
        setIsSaved(false);
        message.info("Property removed from saved homes");
      } else {
        saved.push(property.id);
        setIsSaved(true);
        message.success("Property saved to your wishlist!");
      }
      localStorage.setItem('torra_saved_properties', JSON.stringify(saved));
    } catch {
      setIsSaved(!isSaved);
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val || 0);

  const isLuxury = (property.price || 0) >= 1500000;
  const isRent = property.status === 'For Rent';

  return (
    <Link to={`/properties/${property.id}`} style={{ display: 'block', textDecoration: 'none', height: '100%' }}>
      <div 
        style={{ 
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.05), 0 2px 4px -2px rgba(15, 23, 42, 0.05)',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          position: 'relative'
        }}
        onMouseEnter={(e) => {
          if (isMobile) return;
          e.currentTarget.style.transform = 'translateY(-6px)';
          e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(15, 23, 42, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.04)';
          e.currentTarget.style.borderColor = '#cbd5e1';
          const img = e.currentTarget.querySelector('img');
          if (img) img.style.transform = 'scale(1.06)';
        }}
        onMouseLeave={(e) => {
          if (isMobile) return;
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(15, 23, 42, 0.05), 0 2px 4px -2px rgba(15, 23, 42, 0.05)';
          e.currentTarget.style.borderColor = '#e2e8f0';
          const img = e.currentTarget.querySelector('img');
          if (img) img.style.transform = 'scale(1.0)';
        }}
      >
        {/* Photo Container */}
        <div style={{ position: 'relative', height: '240px', width: '100%', background: '#0f172a', overflow: 'hidden' }}>
          <img
            alt={property.address || "Real Estate Listing"}
            src={property.imageUrl || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=900&q=80"}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: imageLoaded ? 1 : 0.4,
              transition: 'opacity 0.4s ease, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />

          {/* Top Status & Feature Badges */}
          <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ 
              background: isRent ? '#1d4ed8' : '#b40101', 
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '11px',
              padding: '4px 10px',
              borderRadius: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              boxShadow: '0 2px 8px rgba(0,0,0,0.25)'
            }}>
              {property.status || 'FOR SALE'}
            </span>

            {isLuxury && (
              <span style={{ 
                background: '#0f172a', 
                color: '#fbbf24',
                fontWeight: 800,
                fontSize: '11px',
                padding: '4px 10px',
                borderRadius: '6px',
                letterSpacing: '0.05em',
                border: '1px solid rgba(251, 191, 36, 0.4)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
              }}>
                ★ LUXURY
              </span>
            )}
          </div>

          {/* Property Type Badge */}
          {property.propertyType && (
            <div style={{ position: 'absolute', bottom: 12, left: 12 }}>
              <span style={{ 
                background: 'rgba(15, 23, 42, 0.85)', 
                backdropFilter: 'blur(8px)',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '11px',
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}>
                {property.propertyType}
              </span>
            </div>
          )}

          {/* 360 Virtual Tour Pill */}
          <div style={{ position: 'absolute', bottom: 12, right: 12 }}>
            <span style={{ 
              background: 'rgba(255, 255, 255, 0.92)', 
              backdropFilter: 'blur(8px)',
              color: '#0f172a',
              fontWeight: 700,
              fontSize: '11px',
              padding: '3px 8px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <EyeOutlined style={{ fontSize: '12px', color: '#b40101' }} />
              360° Tour
            </span>
          </div>

          {/* Save Wishlist Heart Button */}
          <button 
            style={{ 
              position: 'absolute', 
              top: 12, 
              right: 12,
              background: 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(8px)',
              border: 'none',
              borderRadius: '50%',
              width: '38px',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
              cursor: 'pointer',
              transition: 'transform 0.2s ease, background 0.2s ease'
            }}
            onClick={toggleSave}
            title={isSaved ? "Remove from wishlist" : "Save property"}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            {isSaved ? (
              <HeartFilled style={{ fontSize: '18px', color: '#b40101' }} />
            ) : (
              <HeartOutlined style={{ fontSize: '18px', color: '#475569' }} />
            )}
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '20px 22px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            {/* Price Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
              <div style={{ fontSize: '26px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em', lineHeight: 1 }}>
                {formatCurrency(property.price)}
                {isRent && <span style={{ fontSize: '14px', fontWeight: 600, color: '#64748b' }}>/mo</span>}
              </div>
            </div>

            {/* Core Specs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', fontWeight: 600, color: '#334155', marginBottom: '10px' }}>
              <span><strong>{property.beds || 0}</strong> <span style={{ color: '#64748b', fontWeight: 500 }}>beds</span></span>
              <span style={{ color: '#cbd5e1' }}>•</span>
              <span><strong>{property.baths || 0}</strong> <span style={{ color: '#64748b', fontWeight: 500 }}>baths</span></span>
              <span style={{ color: '#cbd5e1' }}>•</span>
              <span><strong>{(property.sqft || 0).toLocaleString()}</strong> <span style={{ color: '#64748b', fontWeight: 500 }}>sqft</span></span>
            </div>

            {/* Address */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', color: '#64748b', fontSize: '14px', fontWeight: 500, lineHeight: 1.4 }}>
              <EnvironmentOutlined style={{ color: '#94a3b8', marginTop: '3px', flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {property.address}, {property.city}, {property.state} {property.zip}
              </span>
            </div>
          </div>

          {/* Footer Card Ribbon */}
          <div style={{ marginTop: '18px', paddingTop: '14px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>
              {property.agent?.name || 'TORRA Premier Group'}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#b40101', fontSize: '13px', fontWeight: 700 }}>
              <span>Explore</span>
              <ArrowRightOutlined style={{ fontSize: '12px' }} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
