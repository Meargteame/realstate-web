import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Layout, Button, Space, Typography, Badge, Empty, Select, Slider, InputNumber, Row, Col, Drawer, notification } from "antd";
import { PushpinOutlined, FilterOutlined, SearchOutlined, UnorderedListOutlined, DollarOutlined, HomeOutlined } from "@ant-design/icons";
import PropertyCard from "@/components/PropertyCard";

const { Content, Sider } = Layout;
const { Title, Text } = Typography;

export default function Properties() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const typeParam = searchParams.get("type") || "";
  const [showMap, setShowMap] = useState(true);
  const [properties, setProperties] = useState<any[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000000]);
  const [bedrooms, setBedrooms] = useState<number | null>(null);
  const [bathrooms, setBathrooms] = useState<number | null>(null);
  const [propertyType, setPropertyType] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("newest");

  // Set property type from URL parameter
  useEffect(() => {
    if (typeParam) {
      const typeMap: Record<string, string> = {
        'luxury': 'Single Family',
        'land': 'Land',
        'commercial': 'Commercial'
      };
      setPropertyType(typeMap[typeParam.toLowerCase()] || null);
    }
  }, [typeParam]);

  useEffect(() => {
    setLoading(true);
    const url = query ? `/api/properties?q=${encodeURIComponent(query)}` : "/api/properties";
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setProperties(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
        notification.error({ message: 'Search Error', description: 'Could not fetch properties.' });
      });
  }, [query]);

  // Apply filters
  useEffect(() => {
    let filtered = [...properties];

    // Price filter
    filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Bedrooms filter
    if (bedrooms !== null) {
      filtered = filtered.filter(p => p.beds >= bedrooms);
    }

    // Bathrooms filter
    if (bathrooms !== null) {
      filtered = filtered.filter(p => p.baths >= bathrooms);
    }

    // Property type filter
    if (propertyType) {
      filtered = filtered.filter(p => p.propertyType === propertyType);
    }

    // Sort
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "beds":
        filtered.sort((a, b) => b.beds - a.beds);
        break;
      case "sqft":
        filtered.sort((a, b) => b.sqft - a.sqft);
        break;
      case "newest":
      default:
        // Keep original order (newest first from API)
        break;
    }

    setFilteredProperties(filtered);
  }, [properties, priceRange, bedrooms, bathrooms, propertyType, sortBy]);

  const clearFilters = () => {
    setPriceRange([0, 5000000]);
    setBedrooms(null);
    setBathrooms(null);
    setPropertyType(null);
    setSortBy("newest");
  };

  const activeFilterCount = [
    priceRange[0] > 0 || priceRange[1] < 5000000,
    bedrooms !== null,
    bathrooms !== null,
    propertyType !== null
  ].filter(Boolean).length;

  const FilterPanel = () => (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Title level={4} style={{ margin: 0 }}>Filters</Title>
        {activeFilterCount > 0 && (
          <Button type="link" onClick={clearFilters} style={{ color: '#b40101' }}>
            Clear All
          </Button>
        )}
      </div>

      {/* Price Range */}
      <div style={{ marginBottom: '32px' }}>
        <Text strong style={{ display: 'block', marginBottom: '16px' }}>
          <DollarOutlined /> Price Range
        </Text>
        <Slider
          range
          min={0}
          max={5000000}
          step={50000}
          value={priceRange}
          onChange={setPriceRange}
          tooltip={{ formatter: (v) => `$${(v! / 1000).toFixed(0)}K` }}
        />
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <InputNumber
            prefix="$"
            value={priceRange[0]}
            onChange={(v) => setPriceRange([v || 0, priceRange[1]])}
            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            style={{ width: '100%' }}
          />
          <InputNumber
            prefix="$"
            value={priceRange[1]}
            onChange={(v) => setPriceRange([priceRange[0], v || 5000000])}
            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      {/* Bedrooms */}
      <div style={{ marginBottom: '32px' }}>
        <Text strong style={{ display: 'block', marginBottom: '12px' }}>
          <HomeOutlined /> Bedrooms
        </Text>
        <Space wrap>
          {[null, 1, 2, 3, 4, 5].map(num => (
            <Button
              key={num === null ? 'any' : num}
              type={bedrooms === num ? 'primary' : 'default'}
              onClick={() => setBedrooms(num)}
              style={bedrooms === num ? { background: '#b40101', borderColor: '#b40101' } : {}}
            >
              {num === null ? 'Any' : `${num}+`}
            </Button>
          ))}
        </Space>
      </div>

      {/* Bathrooms */}
      <div style={{ marginBottom: '32px' }}>
        <Text strong style={{ display: 'block', marginBottom: '12px' }}>
          Bathrooms
        </Text>
        <Space wrap>
          {[null, 1, 2, 3, 4].map(num => (
            <Button
              key={num === null ? 'any' : num}
              type={bathrooms === num ? 'primary' : 'default'}
              onClick={() => setBathrooms(num)}
              style={bathrooms === num ? { background: '#b40101', borderColor: '#b40101' } : {}}
            >
              {num === null ? 'Any' : `${num}+`}
            </Button>
          ))}
        </Space>
      </div>

      {/* Property Type */}
      <div style={{ marginBottom: '32px' }}>
        <Text strong style={{ display: 'block', marginBottom: '12px' }}>
          Property Type
        </Text>
        <Select
          value={propertyType}
          onChange={setPropertyType}
          style={{ width: '100%' }}
          placeholder="All Types"
          allowClear
        >
          <Select.Option value="Single Family">Single Family</Select.Option>
          <Select.Option value="Condo">Condo</Select.Option>
          <Select.Option value="Townhouse">Townhouse</Select.Option>
          <Select.Option value="Multi-Family">Multi-Family</Select.Option>
          <Select.Option value="Land">Land</Select.Option>
          <Select.Option value="Commercial">Commercial</Select.Option>
        </Select>
      </div>
    </div>
  );

  return (
    <Layout style={{ height: 'calc(100vh - 80px)', background: 'white' }}>
      <Content style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Top Filter Bar */}
        <div style={{ 
          height: '80px', 
          borderBottom: '1px solid #f0f0f0', 
          padding: '0 32px', 
          background: 'white', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          zIndex: 10
        }}>
          <div>
            <Title level={4} style={{ margin: 0, fontWeight: 900, textTransform: 'uppercase' }}>
              {query ? `Search: ${query}` : "All Properties"}
            </Title>
            <Text type="secondary" style={{ fontSize: '11px', fontWeight: 'bold' }}>
              {filteredProperties.length} AVAILABLE LISTINGS
              {activeFilterCount > 0 && ` · ${activeFilterCount} FILTER${activeFilterCount > 1 ? 'S' : ''} ACTIVE`}
            </Text>
          </div>

          <Space size="middle">
             <Select 
               value={sortBy} 
               onChange={setSortBy}
               style={{ width: 150 }} 
               options={[
                 { value: 'newest', label: 'Newest' },
                 { value: 'price-low', label: 'Price: Low to High' },
                 { value: 'price-high', label: 'Price: High to Low' },
                 { value: 'beds', label: 'Most Bedrooms' },
                 { value: 'sqft', label: 'Largest Sq Ft' }
               ]} 
             />
             <Badge count={activeFilterCount} offset={[-5, 5]}>
               <Button 
                 type="default" 
                 icon={<FilterOutlined />}
                 onClick={() => setShowFilters(true)}
               >
                 More Filters
               </Button>
             </Badge>
             <Button 
               type={showMap ? "primary" : "default"} 
               icon={showMap ? <UnorderedListOutlined /> : <PushpinOutlined />}
               onClick={() => setShowMap(!showMap)}
               style={showMap ? { background: '#373a4b', borderColor: '#373a4b' } : {}}
             >
               {showMap ? "HIDE MAP" : "SHOW MAP"}
             </Button>
          </Space>
        </div>

        {/* Results Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px', background: '#f8f8f8' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: showMap ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', 
            gap: '24px' 
          }}>
            {filteredProperties.length > 0 ? (
              filteredProperties.map(p => <div key={p.id}><PropertyCard property={p} /></div>)
            ) : (
              !loading && <div style={{ gridColumn: '1/-1', padding: '100px 0' }}>
                <Empty description={<span>No properties found matching your filters. Try adjusting your search.</span>} />
              </div>
            )}
          </div>
          
          {loading && <div style={{ textAlign: 'center', padding: '80px' }}><Text type="secondary">Loading properties...</Text></div>}
        </div>
      </Content>

      {/* Map Sider */}
      {showMap && (
        <Sider 
          width="40%" 
          theme="light" 
          style={{ 
            borderLeft: '1px solid #f0f0f0', 
            position: 'relative', 
            background: '#e5e7eb',
            overflow: 'hidden'
          }}
        >
          {/* Mock Interactive Map */}
          <div style={{ 
            position: 'absolute', 
            inset: 0, 
            backgroundImage: 'url("https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'grayscale(100%) opacity(0.3)'
          }} />
          
          <div style={{ position: 'relative', height: '100%', width: '100%' }}>
            {filteredProperties.map((p, i) => (
               <div 
                 key={p.id}
                 style={{ 
                   position: 'absolute',
                   left: `${20 + (i * 15) % 60}%`,
                   top: `${20 + (i * 12) % 60}%`,
                   padding: '8px 12px',
                   background: '#b40101',
                   color: 'white',
                   fontWeight: 'bold',
                   border: '2px solid white',
                   boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                   cursor: 'pointer',
                   zIndex: 2,
                   borderRadius: '4px'
                 }}
               >
                 ${(p.price / 1000).toFixed(0)}k
               </div>
            ))}
          </div>
        </Sider>
      )}

      {/* Filter Drawer for Mobile/Desktop */}
      <Drawer
        title="Filter Properties"
        placement="right"
        onClose={() => setShowFilters(false)}
        open={showFilters}
        width={400}
      >
        <FilterPanel />
      </Drawer>
    </Layout>
  );
}
