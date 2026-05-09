import React, { useState, useEffect } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import { Layout, Button, Space, Typography, Badge, Empty, Select, Slider, InputNumber, Row, Col, Drawer, notification, Checkbox, Card } from "antd";
import { PushpinOutlined, FilterOutlined, SearchOutlined, UnorderedListOutlined, AppstoreOutlined, DollarOutlined, HomeOutlined, SaveOutlined } from "@ant-design/icons";
import PropertyCard from "@/components/PropertyCard";
import PropertyMapLeaflet from "@/components/PropertyMapLeaflet";
import SaveSearchModal from "@/components/SaveSearchModal";

const { Content, Sider } = Layout;
const { Title, Text } = Typography;

export default function Properties() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const query = searchParams.get("q") || "";
  const typeParam = searchParams.get("type") || "";
  const [showMap, setShowMap] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
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
  
  // Advanced filters
  const [lotSize, setLotSize] = useState<number | null>(null);
  const [yearBuilt, setYearBuilt] = useState<number | null>(null);
  const [hasGarage, setHasGarage] = useState<boolean>(false);
  const [hasPool, setHasPool] = useState<boolean>(false);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

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
    setLotSize(null);
    setYearBuilt(null);
    setHasGarage(false);
    setHasPool(false);
    setSelectedFeatures([]);
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
    drawnArea !== null,
    lotSize !== null,
    yearBuilt !== null,
    hasGarage,
    hasPool,
    selectedFeatures.length > 0
  ].filter(Boolean).length;

  const propertyFeatures = [
    'Hardwood Floors',
    'Granite Counters',
    'Stainless Appliances',
    'Central Air',
    'Fireplace',
    'Walk-in Closet',
    'Updated Kitchen',
    'Updated Bathroom',
    'Basement',
    'Deck/Patio'
  ];

  const FilterPanel = () => (
    <div style={{ padding: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <Title level={3} style={{ margin: 0, fontWeight: 900, fontSize: '24px' }}>Filters</Title>
        {activeFilterCount > 0 && (
          <Button type="link" onClick={clearFilters} style={{ color: '#b40101', fontWeight: 700, fontSize: '13px' }}>
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

      {/* Advanced Filters */}
      <div style={{ marginBottom: '32px' }}>
        <Text strong style={{ display: 'block', marginBottom: '12px' }}>
          Lot Size (Min Sq Ft)
        </Text>
        <InputNumber
          value={lotSize}
          onChange={setLotSize}
          style={{ width: '100%' }}
          placeholder="Any"
          formatter={value => value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
        />
      </div>

      <div style={{ marginBottom: '32px' }}>
        <Text strong style={{ display: 'block', marginBottom: '12px' }}>
          Year Built (Min)
        </Text>
        <InputNumber
          value={yearBuilt}
          onChange={setYearBuilt}
          style={{ width: '100%' }}
          placeholder="Any"
          min={1800}
          max={new Date().getFullYear()}
        />
      </div>

      <div style={{ marginBottom: '32px' }}>
        <Checkbox checked={hasGarage} onChange={(e) => setHasGarage(e.target.checked)}>
          <Text strong>Has Garage</Text>
        </Checkbox>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <Checkbox checked={hasPool} onChange={(e) => setHasPool(e.target.checked)}>
          <Text strong>Has Pool</Text>
        </Checkbox>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <Text strong style={{ display: 'block', marginBottom: '12px' }}>
          Property Features
        </Text>
        <Checkbox.Group
          options={propertyFeatures}
          value={selectedFeatures}
          onChange={setSelectedFeatures}
          style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
        />
      </div>
    </div>
  );

  return (
    <Layout style={{ height: 'calc(100vh - 80px)', background: 'white' }}>
      <Content style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Top Filter Bar */}
        <div style={{ 
          height: '88px', 
          borderBottom: '2px solid #f0f0f0', 
          padding: '0 40px', 
          background: 'white', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          zIndex: 10
        }}>
          <div>
            <Title level={3} style={{ margin: 0, fontWeight: 900, textTransform: 'uppercase', fontSize: '24px', letterSpacing: '-0.5px' }}>
              {drawnArea ? "Search Area Results" : query ? `Search: ${query}` : "All Properties"}
            </Title>
            <Text type="secondary" style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.5px' }}>
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
             
             <Button.Group>
               <Button 
                 type={viewMode === 'grid' ? "primary" : "default"}
                 icon={<AppstoreOutlined />}
                 onClick={() => setViewMode('grid')}
                 style={viewMode === 'grid' ? { background: '#b40101', borderColor: '#b40101' } : {}}
               >
                 Grid
               </Button>
               <Button 
                 type={viewMode === 'list' ? "primary" : "default"}
                 icon={<UnorderedListOutlined />}
                 onClick={() => setViewMode('list')}
                 style={viewMode === 'list' ? { background: '#b40101', borderColor: '#b40101' } : {}}
               >
                 List
               </Button>
             </Button.Group>
             
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
        <div style={{ flex: 1, overflowY: 'auto', padding: '40px', background: '#fafafa' }}>
          {viewMode === 'grid' ? (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: showMap ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(320px, 1fr))', 
              gap: '32px' 
            }}>
              {filteredProperties.length > 0 ? (
                filteredProperties.map(p => <div key={p.id}><PropertyCard property={p} /></div>)
              ) : (
                !loading && <div style={{ gridColumn: '1/-1', padding: '120px 0', textAlign: 'center' }}>
                  <Empty 
                    description={
                      <div style={{ marginTop: '24px' }}>
                        <Text style={{ fontSize: '16px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                          No properties found
                        </Text>
                        <Text type="secondary" style={{ fontSize: '14px' }}>
                          Try adjusting your filters or search criteria
                        </Text>
                      </div>
                    } 
                  />
                </div>
              )}
            </div>
          ) : (
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {filteredProperties.length > 0 ? (
                filteredProperties.map(p => (
                  <Card 
                    key={p.id}
                    hoverable
                    style={{ borderRadius: '12px' }}
                    styles={{ body: { padding: 0 } }}
                  >
                    <Row>
                      <Col xs={24} md={8}>
                        <img 
                          src={p.imageUrl} 
                          alt={p.address}
                          style={{ 
                            width: '100%', 
                            height: '250px', 
                            objectFit: 'cover',
                            borderRadius: '12px 0 0 12px'
                          }}
                        />
                      </Col>
                      <Col xs={24} md={16} style={{ padding: '24px' }}>
                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                          <Title level={3} style={{ margin: 0, color: '#b40101' }}>
                            ${p.price?.toLocaleString()}
                          </Title>
                          <Text strong style={{ fontSize: 16 }}>{p.address}</Text>
                          <Text type="secondary">{p.city}, {p.state} {p.zip}</Text>
                          <Space size="large" style={{ marginTop: 12 }}>
                            <Text><strong>{p.beds}</strong> Beds</Text>
                            <Text><strong>{p.baths}</strong> Baths</Text>
                            <Text><strong>{p.sqft?.toLocaleString()}</strong> Sq Ft</Text>
                          </Space>
                          <div style={{ marginTop: 16 }}>
                            <Button type="primary" href={`/properties/${p.id}`} style={{ background: '#b40101', borderColor: '#b40101' }}>
                              View Details
                            </Button>
                          </div>
                        </Space>
                      </Col>
                    </Row>
                  </Card>
                ))
              ) : (
                !loading && <Empty description={<span>No properties found matching your filters. Try adjusting your search.</span>} />
              )}
            </Space>
          )}
          
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
          <PropertyMapLeaflet
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
