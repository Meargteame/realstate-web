import React, { useState, useEffect } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import { Layout, Button, Space, Typography, Badge, Empty, Select, Slider, InputNumber, Row, Col, Drawer, notification } from "antd";
import { PushpinOutlined, FilterOutlined, SearchOutlined, UnorderedListOutlined, DollarOutlined, HomeOutlined, SaveOutlined } from "@ant-design/icons";
import PropertyCard from "@/components/PropertyCard";
import PropertyMap from "@/components/PropertyMap";
import SaveSearchModal from "@/components/SaveSearchModal";

const { Content, Sider } = Layout;
const { Title, Text } = Typography;

export default function Properties() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const query = searchParams.get("q") || "";
  const typeParam = searchParams.get("type") || "";
  const [showMap, setShowMap] = useState(true);
  const [properties, setProperties] = useState<any[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [mapBounds, setMapBounds] = useState<any>(null);
  const [drawnArea, setDrawnArea] = useState<any>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [savingSearch, setSavingSearch] = useState(false);
  
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
    
    // Use map API if we have drawn area, otherwise use regular search
    const url = drawnArea 
      ? "/api/map/search-area"
      : query 
        ? `/api/properties?q=${encodeURIComponent(query)}` 
        : "/api/properties";

    const fetchProperties = async () => {
      try {
        let response;
        
        if (drawnArea) {
          // Search within drawn area
          response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              geometry: drawnArea,
              filters: {
                minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
                maxPrice: priceRange[1] < 5000000 ? priceRange[1] : undefined,
                beds: bedrooms,
                baths: bathrooms,
                propertyType: propertyType
              }
            })
          });
          const data = await response.json();
          setProperties(data.properties || []);
        } else {
          // Regular search
          response = await fetch(url);
          const data = await response.json();
          setProperties(Array.isArray(data) ? data : []);
        }
        
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
        notification.error({ message: 'Search Error', description: 'Could not fetch properties.' });
      }
    };

    fetchProperties();
  }, [query, drawnArea]);

  // Apply filters (only if not using drawn area, as area search handles filters on backend)
  useEffect(() => {
    if (drawnArea) {
      // For drawn area searches, properties are already filtered on backend
      setFilteredProperties(properties);
      return;
    }

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
  }, [properties, priceRange, bedrooms, bathrooms, propertyType, sortBy, drawnArea]);

  const clearFilters = () => {
    setPriceRange([0, 5000000]);
    setBedrooms(null);
    setBathrooms(null);
    setPropertyType(null);
    setSortBy("newest");
    setDrawnArea(null); // Clear drawn area
  };

  // Handle map interactions
  const handlePropertySelect = (property: any) => {
    setSelectedProperty(property);
  };

  const handleDrawComplete = (area: any) => {
    setDrawnArea(area);
  };

  const handleMapBoundsChange = (bounds: any) => {
    setMapBounds(bounds);
  };

  // Handle save search
  const handleSaveSearch = async (searchData: any) => {
    try {
      setSavingSearch(true);
      
      const response = await fetch('/api/saved-searches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: searchData.name,
          filters: {
            minPrice: priceRange[0] > 0 ? priceRange[0] : null,
            maxPrice: priceRange[1] < 5000000 ? priceRange[1] : null,
            beds: bedrooms,
            baths: bathrooms,
            propertyType: propertyType,
            query: query,
            mapArea: drawnArea,
            bounds: mapBounds
          },
          emailAlerts: searchData.emailAlerts,
          frequency: searchData.frequency
        })
      });

      const data = await response.json();

      if (response.ok) {
        notification.success({
          message: 'Search Saved!',
          description: `"${searchData.name}" has been saved. You'll receive ${searchData.frequency} notifications for new matches.`
        });
        setShowSaveModal(false);
      } else {
        notification.error({
          message: 'Save Failed',
          description: data.error || 'Failed to save search'
        });
      }
    } catch (error) {
      console.error('Save search error:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to save search'
      });
    } finally {
      setSavingSearch(false);
    }
  };

  // Check if there are active filters to show save button
  const hasActiveFilters = () => {
    return (
      priceRange[0] > 0 || 
      priceRange[1] < 5000000 || 
      bedrooms !== null || 
      bathrooms !== null || 
      propertyType !== null || 
      drawnArea !== null ||
      query !== ""
    );
  };

  const activeFilterCount = [
    priceRange[0] > 0 || priceRange[1] < 5000000,
    bedrooms !== null,
    bathrooms !== null,
    propertyType !== null,
    drawnArea !== null
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
              {drawnArea ? "Search Area Results" : query ? `Search: ${query}` : "All Properties"}
            </Title>
            <Text type="secondary" style={{ fontSize: '11px', fontWeight: 'bold' }}>
              {filteredProperties.length} AVAILABLE LISTINGS
              {activeFilterCount > 0 && ` · ${activeFilterCount} FILTER${activeFilterCount > 1 ? 'S' : ''} ACTIVE`}
              {drawnArea && " · CUSTOM AREA"}
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
             
             {hasActiveFilters() && (
               <Button
                 type="default"
                 icon={<SaveOutlined />}
                 onClick={() => setShowSaveModal(true)}
                 style={{ borderColor: '#b40101', color: '#b40101' }}
               >
                 Save Search
               </Button>
             )}
             
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
            background: '#f8f8f8',
            overflow: 'hidden'
          }}
        >
          <PropertyMap
            properties={filteredProperties}
            onPropertySelect={handlePropertySelect}
            onBoundsChange={handleMapBoundsChange}
            onDrawComplete={handleDrawComplete}
            height="100%"
            showControls={true}
          />
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

      {/* Save Search Modal */}
      <SaveSearchModal
        visible={showSaveModal}
        onCancel={() => setShowSaveModal(false)}
        onSave={handleSaveSearch}
        currentFilters={{
          minPrice: priceRange[0] > 0 ? priceRange[0] : null,
          maxPrice: priceRange[1] < 5000000 ? priceRange[1] : null,
          beds: bedrooms,
          baths: bathrooms,
          propertyType: propertyType,
          query: query
        }}
        currentMapArea={drawnArea}
        loading={savingSearch}
      />
    </Layout>
  );
}
