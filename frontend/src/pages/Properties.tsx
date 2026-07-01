import React, { useState, useEffect } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import { Layout, Button, Space, Typography, Badge, Empty, Select, Slider, InputNumber, Row, Col, Drawer, notification, Checkbox, Card, FloatButton, Skeleton } from "antd";
import { PushpinOutlined, FilterOutlined, SearchOutlined, UnorderedListOutlined, AppstoreOutlined, DollarOutlined, HomeOutlined, SaveOutlined, EnvironmentOutlined } from "@ant-design/icons";
import PropertyCard from "@/components/PropertyCard";
import PropertyMapLeaflet from "@/components/PropertyMapLeaflet";
import SaveSearchModal from "@/components/SaveSearchModal";
import { useIsMobile, useIsTablet } from "../hooks/useBreakpoint";
import { useDebounce } from "../hooks/useDebounce";

const { Content, Sider } = Layout;
const { Title, Text } = Typography;
const AntCard = Card as any;

export default function Properties() {
  const [searchParams, setSearchParams] = useSearchParams();
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
  const [showMapModal, setShowMapModal] = useState(false);
  
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  
  // Filter states (initialised from URL so shared links restore the search)
  const [priceRange, setPriceRange] = useState<[number, number]>([
    parseInt(searchParams.get("minPrice") || "0", 10),
    parseInt(searchParams.get("maxPrice") || "5000000", 10)
  ]);
  const [bedrooms, setBedrooms] = useState<number | null>(
    searchParams.get("beds") ? Number(searchParams.get("beds")) : null
  );
  const [bathrooms, setBathrooms] = useState<number | null>(
    searchParams.get("baths") ? Number(searchParams.get("baths")) : null
  );
  const [propertyType, setPropertyType] = useState<string | null>(
    searchParams.get("propertyType") || null
  );
  const [sortBy, setSortBy] = useState<string>(searchParams.get("sort") || "newest");
  
  // Phase 7A: Advanced filters
  const [yearRange, setYearRange] = useState<[number, number]>([1900, new Date().getFullYear()]);
  const [lotSizeRange, setLotSizeRange] = useState<[number, number]>([0, 100000]);
  const [hoaFeesRange, setHoaFeesRange] = useState<[number, number]>([0, 1000]);
  const [minGarageSpaces, setMinGarageSpaces] = useState<number | null>(null);
  const [hasPool, setHasPool] = useState<boolean>(false);
  const [hasBasement, setHasBasement] = useState<boolean>(false);
  const [hasFireplace, setHasFireplace] = useState<boolean>(false);
  const [isWaterfront, setIsWaterfront] = useState<boolean>(false);
  const [isPetFriendly, setIsPetFriendly] = useState<boolean>(false);
  const [storiesRange, setStoriesRange] = useState<[number, number]>([1, 5]);
  const [condition, setCondition] = useState<string | null>(null);
  const [maxDaysOnMarket, setMaxDaysOnMarket] = useState<number | null>(null);

  // Serialize all filters into one string and debounce it so that dragging a
  // slider (which fires dozens of state updates) only triggers ONE fetch.
  const filterSignature = JSON.stringify({
    query, drawnArea, priceRange, bedrooms, bathrooms, propertyType,
    yearRange, lotSizeRange, hoaFeesRange, minGarageSpaces, hasPool,
    hasBasement, hasFireplace, isWaterfront, isPetFriendly, storiesRange,
    condition, maxDaysOnMarket
  });
  const debouncedSignature = useDebounce(filterSignature, 400);

  // Keep the URL in sync with the primary filters so a search is shareable and
  // restorable via the back button. Uses replace to avoid spamming history.
  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    const setOrDelete = (key: string, value: string | null | undefined, isDefault: boolean) => {
      if (value && !isDefault) next.set(key, value);
      else next.delete(key);
    };
    setOrDelete("propertyType", propertyType, !propertyType);
    setOrDelete("beds", bedrooms?.toString(), bedrooms == null);
    setOrDelete("baths", bathrooms?.toString(), bathrooms == null);
    setOrDelete("minPrice", priceRange[0].toString(), priceRange[0] <= 0);
    setOrDelete("maxPrice", priceRange[1].toString(), priceRange[1] >= 5000000);
    setOrDelete("sort", sortBy, sortBy === "newest");

    if (next.toString() !== searchParams.toString()) {
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyType, bedrooms, bathrooms, priceRange, sortBy]);

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
    
    const fetchProperties = async () => {
      try {
        let response;
        
        if (drawnArea) {
          // Search within drawn area
          response = await fetch("/api/map/search-area", {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              geometry: drawnArea,
              filters: buildFilterParams()
            })
          });
          const data = await response.json();
          setProperties(data.properties || []);
        } else {
          // Build query string with all filters
          const params = new URLSearchParams();
          
          if (query) params.append('q', query);
          if (priceRange[0] > 0) params.append('minPrice', priceRange[0].toString());
          if (priceRange[1] < 5000000) params.append('maxPrice', priceRange[1].toString());
          if (bedrooms) params.append('beds', bedrooms.toString());
          if (bathrooms) params.append('baths', bathrooms.toString());
          if (propertyType) params.append('propertyType', propertyType);
          
          // Phase 7A: Advanced filters
          if (yearRange[0] > 1900) params.append('minYear', yearRange[0].toString());
          if (yearRange[1] < new Date().getFullYear()) params.append('maxYear', yearRange[1].toString());
          if (lotSizeRange[0] > 0) params.append('minLotSize', lotSizeRange[0].toString());
          if (lotSizeRange[1] < 100000) params.append('maxLotSize', lotSizeRange[1].toString());
          if (hoaFeesRange[0] > 0) params.append('minHoaFees', hoaFeesRange[0].toString());
          if (hoaFeesRange[1] < 1000) params.append('maxHoaFees', hoaFeesRange[1].toString());
          if (minGarageSpaces) params.append('minGarageSpaces', minGarageSpaces.toString());
          if (hasPool) params.append('hasPool', 'true');
          if (hasBasement) params.append('hasBasement', 'true');
          if (hasFireplace) params.append('hasFireplace', 'true');
          if (isWaterfront) params.append('isWaterfront', 'true');
          if (isPetFriendly) params.append('isPetFriendly', 'true');
          if (storiesRange[0] > 1) params.append('minStories', storiesRange[0].toString());
          if (storiesRange[1] < 5) params.append('maxStories', storiesRange[1].toString());
          if (condition) params.append('condition', condition);
          if (maxDaysOnMarket) params.append('maxDaysOnMarket', maxDaysOnMarket.toString());
          
          response = await fetch(`/api/properties?${params.toString()}`);
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
  }, [debouncedSignature]);
  
  // Helper function to build filter params
  const buildFilterParams = () => {
    const filters: any = {};
    if (priceRange[0] > 0) filters.minPrice = priceRange[0];
    if (priceRange[1] < 5000000) filters.maxPrice = priceRange[1];
    if (bedrooms) filters.beds = bedrooms;
    if (bathrooms) filters.baths = bathrooms;
    if (propertyType) filters.propertyType = propertyType;
    if (yearRange[0] > 1900) filters.minYear = yearRange[0];
    if (yearRange[1] < new Date().getFullYear()) filters.maxYear = yearRange[1];
    if (lotSizeRange[0] > 0) filters.minLotSize = lotSizeRange[0];
    if (lotSizeRange[1] < 100000) filters.maxLotSize = lotSizeRange[1];
    if (hoaFeesRange[0] > 0) filters.minHoaFees = hoaFeesRange[0];
    if (hoaFeesRange[1] < 1000) filters.maxHoaFees = hoaFeesRange[1];
    if (minGarageSpaces) filters.minGarageSpaces = minGarageSpaces;
    if (hasPool) filters.hasPool = true;
    if (hasBasement) filters.hasBasement = true;
    if (hasFireplace) filters.hasFireplace = true;
    if (isWaterfront) filters.isWaterfront = true;
    if (isPetFriendly) filters.isPetFriendly = true;
    if (storiesRange[0] > 1) filters.minStories = storiesRange[0];
    if (storiesRange[1] < 5) filters.maxStories = storiesRange[1];
    if (condition) filters.condition = condition;
    if (maxDaysOnMarket) filters.maxDaysOnMarket = maxDaysOnMarket;
    return filters;
  };

  // Apply sorting (filters are now handled by backend)
  useEffect(() => {
    let sorted = [...properties];

    // Sort
    switch (sortBy) {
      case "price-low":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "beds":
        sorted.sort((a, b) => b.beds - a.beds);
        break;
      case "sqft":
        sorted.sort((a, b) => b.sqft - a.sqft);
        break;
      case "newest":
      default:
        // Keep original order (newest first from API)
        break;
    }

    setFilteredProperties(sorted);
  }, [properties, sortBy]);

  const clearFilters = () => {
    setPriceRange([0, 5000000]);
    setBedrooms(null);
    setBathrooms(null);
    setPropertyType(null);
    setSortBy("newest");
    setDrawnArea(null);
    setYearRange([1900, new Date().getFullYear()]);
    setLotSizeRange([0, 100000]);
    setHoaFeesRange([0, 1000]);
    setMinGarageSpaces(null);
    setHasPool(false);
    setHasBasement(false);
    setHasFireplace(false);
    setIsWaterfront(false);
    setIsPetFriendly(false);
    setStoriesRange([1, 5]);
    setCondition(null);
    setMaxDaysOnMarket(null);
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
            bounds: mapBounds,
            // Phase 7A: Advanced filters
            minYear: yearRange[0] > 1900 ? yearRange[0] : null,
            maxYear: yearRange[1] < new Date().getFullYear() ? yearRange[1] : null,
            minLotSize: lotSizeRange[0] > 0 ? lotSizeRange[0] : null,
            maxLotSize: lotSizeRange[1] < 100000 ? lotSizeRange[1] : null,
            minHoaFees: hoaFeesRange[0] > 0 ? hoaFeesRange[0] : null,
            maxHoaFees: hoaFeesRange[1] < 1000 ? hoaFeesRange[1] : null,
            minGarageSpaces: minGarageSpaces,
            hasPool: hasPool || null,
            hasBasement: hasBasement || null,
            hasFireplace: hasFireplace || null,
            isWaterfront: isWaterfront || null,
            isPetFriendly: isPetFriendly || null,
            minStories: storiesRange[0] > 1 ? storiesRange[0] : null,
            maxStories: storiesRange[1] < 5 ? storiesRange[1] : null,
            condition: condition,
            maxDaysOnMarket: maxDaysOnMarket
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
      query !== "" ||
      yearRange[0] > 1900 ||
      yearRange[1] < new Date().getFullYear() ||
      lotSizeRange[0] > 0 ||
      lotSizeRange[1] < 100000 ||
      hoaFeesRange[0] > 0 ||
      hoaFeesRange[1] < 1000 ||
      minGarageSpaces !== null ||
      hasPool ||
      hasBasement ||
      hasFireplace ||
      isWaterfront ||
      isPetFriendly ||
      storiesRange[0] > 1 ||
      storiesRange[1] < 5 ||
      condition !== null ||
      maxDaysOnMarket !== null
    );
  };

  const activeFilterCount = [
    priceRange[0] > 0 || priceRange[1] < 5000000,
    bedrooms !== null,
    bathrooms !== null,
    propertyType !== null,
    drawnArea !== null,
    yearRange[0] > 1900 || yearRange[1] < new Date().getFullYear(),
    lotSizeRange[0] > 0 || lotSizeRange[1] < 100000,
    hoaFeesRange[0] > 0 || hoaFeesRange[1] < 1000,
    minGarageSpaces !== null,
    hasPool,
    hasBasement,
    hasFireplace,
    isWaterfront,
    isPetFriendly,
    storiesRange[0] > 1 || storiesRange[1] < 5,
    condition !== null,
    maxDaysOnMarket !== null
  ].filter(Boolean).length;

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
          options={[
            { value: 'Single Family', label: 'Single Family' },
            { value: 'Condo', label: 'Condo' },
            { value: 'Townhouse', label: 'Townhouse' },
            { value: 'Multi-Family', label: 'Multi-Family' },
            { value: 'Land', label: 'Land' },
            { value: 'Commercial', label: 'Commercial' }
          ]}
        />
      </div>

      {/* Phase 7A: Advanced Filters */}
      <div style={{ marginBottom: '32px' }}>
        <Text strong style={{ display: 'block', marginBottom: '16px' }}>
          Year Built
        </Text>
        <Slider
          range
          min={1900}
          max={new Date().getFullYear()}
          step={5}
          value={yearRange}
          onChange={setYearRange}
        />
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <InputNumber
            value={yearRange[0]}
            onChange={(v) => setYearRange([v || 1900, yearRange[1]])}
            style={{ width: '100%' }}
          />
          <InputNumber
            value={yearRange[1]}
            onChange={(v) => setYearRange([yearRange[0], v || new Date().getFullYear()])}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <Text strong style={{ display: 'block', marginBottom: '16px' }}>
          Lot Size (Sq Ft)
        </Text>
        <Slider
          range
          min={0}
          max={100000}
          step={1000}
          value={lotSizeRange}
          onChange={setLotSizeRange}
          tooltip={{ formatter: (v) => `${(v! / 1000).toFixed(0)}K` }}
        />
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <InputNumber
            value={lotSizeRange[0]}
            onChange={(v) => setLotSizeRange([v || 0, lotSizeRange[1]])}
            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            style={{ width: '100%' }}
          />
          <InputNumber
            value={lotSizeRange[1]}
            onChange={(v) => setLotSizeRange([lotSizeRange[0], v || 100000])}
            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <Text strong style={{ display: 'block', marginBottom: '16px' }}>
          HOA Fees (Monthly)
        </Text>
        <Slider
          range
          min={0}
          max={1000}
          step={25}
          value={hoaFeesRange}
          onChange={setHoaFeesRange}
          tooltip={{ formatter: (v) => `$${v}` }}
        />
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <InputNumber
            prefix="$"
            value={hoaFeesRange[0]}
            onChange={(v) => setHoaFeesRange([v || 0, hoaFeesRange[1]])}
            style={{ width: '100%' }}
          />
          <InputNumber
            prefix="$"
            value={hoaFeesRange[1]}
            onChange={(v) => setHoaFeesRange([hoaFeesRange[0], v || 1000])}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <Text strong style={{ display: 'block', marginBottom: '12px' }}>
          Garage Spaces
        </Text>
        <Space wrap>
          {[null, 1, 2, 3, 4].map(num => (
            <Button
              key={num === null ? 'any' : num}
              type={minGarageSpaces === num ? 'primary' : 'default'}
              onClick={() => setMinGarageSpaces(num)}
              style={minGarageSpaces === num ? { background: '#b40101', borderColor: '#b40101' } : {}}
            >
              {num === null ? 'Any' : `${num}+`}
            </Button>
          ))}
        </Space>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <Text strong style={{ display: 'block', marginBottom: '16px' }}>
          Stories
        </Text>
        <Slider
          range
          min={1}
          max={5}
          step={1}
          value={storiesRange}
          onChange={setStoriesRange}
        />
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <InputNumber
            value={storiesRange[0]}
            onChange={(v) => setStoriesRange([v || 1, storiesRange[1]])}
            style={{ width: '100%' }}
          />
          <InputNumber
            value={storiesRange[1]}
            onChange={(v) => setStoriesRange([storiesRange[0], v || 5])}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <Text strong style={{ display: 'block', marginBottom: '12px' }}>
          Property Condition
        </Text>
        <Select
          value={condition}
          onChange={setCondition}
          style={{ width: '100%' }}
          placeholder="Any Condition"
          allowClear
          options={[
            { value: 'New', label: 'New' },
            { value: 'Excellent', label: 'Excellent' },
            { value: 'Good', label: 'Good' },
            { value: 'Fair', label: 'Fair' },
            { value: 'Needs Work', label: 'Needs Work' }
          ]}
        />
      </div>

      <div style={{ marginBottom: '32px' }}>
        <Text strong style={{ display: 'block', marginBottom: '12px' }}>
          Days on Market (Max)
        </Text>
        <InputNumber
          value={maxDaysOnMarket}
          onChange={setMaxDaysOnMarket}
          style={{ width: '100%' }}
          placeholder="Any"
          min={1}
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <Text strong style={{ display: 'block', marginBottom: '12px' }}>
          Property Features
        </Text>
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Checkbox checked={hasPool} onChange={(e) => setHasPool(e.target.checked)}>
            Has Pool
          </Checkbox>
          <Checkbox checked={hasBasement} onChange={(e) => setHasBasement(e.target.checked)}>
            Has Basement
          </Checkbox>
          <Checkbox checked={hasFireplace} onChange={(e) => setHasFireplace(e.target.checked)}>
            Has Fireplace
          </Checkbox>
          <Checkbox checked={isWaterfront} onChange={(e) => setIsWaterfront(e.target.checked)}>
            Waterfront Property
          </Checkbox>
          <Checkbox checked={isPetFriendly} onChange={(e) => setIsPetFriendly(e.target.checked)}>
            Pet Friendly
          </Checkbox>
        </Space>
      </div>
    </div>
  );

  return (
    <Layout style={{ height: 'calc(100vh - 80px)', background: 'white' }}>
      <Content style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Top Filter Bar */}
        <div style={{ 
          minHeight: isMobile ? '120px' : '88px', 
          borderBottom: '2px solid #f0f0f0', 
          padding: isMobile ? '16px 16px' : '0 40px', 
          background: 'white', 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'center', 
          justifyContent: 'space-between',
          gap: isMobile ? '12px' : '0',
          zIndex: 10
        }}>
          <div>
            <Title level={3} style={{ margin: 0, fontWeight: 900, textTransform: 'uppercase', fontSize: isMobile ? '18px' : '24px', letterSpacing: '-0.5px' }}>
              {drawnArea ? "Search Area Results" : query ? `Search: ${query}` : "All Properties"}
            </Title>
            <Text type="secondary" style={{ fontSize: isMobile ? '11px' : '12px', fontWeight: 700, letterSpacing: '0.5px' }}>
              {filteredProperties.length} AVAILABLE LISTINGS
              {activeFilterCount > 0 && ` · ${activeFilterCount} FILTER${activeFilterCount > 1 ? 'S' : ''} ACTIVE`}
              {drawnArea && " · CUSTOM AREA"}
            </Text>
          </div>

          <Space size={isMobile ? "small" : "middle"} wrap>
             <Select 
               value={sortBy} 
               onChange={setSortBy}
               style={{ width: isMobile ? 120 : 150 }} 
               size={isMobile ? "middle" : "large"}
               options={[
                 { value: 'newest', label: 'Newest' },
                 { value: 'price-low', label: 'Price: Low' },
                 { value: 'price-high', label: 'Price: High' },
                 { value: 'beds', label: 'Most Beds' },
                 { value: 'sqft', label: 'Largest' }
               ]} 
             />
             
             {hasActiveFilters() && !isMobile && (
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
                 size={isMobile ? "middle" : "large"}
               >
                 {isMobile ? "Filters" : "More Filters"}
               </Button>
             </Badge>
             
             {!isMobile && (
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
             )}
             
             {!isMobile && (
               <Button 
                 type={showMap ? "primary" : "default"} 
                 icon={showMap ? <UnorderedListOutlined /> : <PushpinOutlined />}
                 onClick={() => setShowMap(!showMap)}
                 style={showMap ? { background: '#373a4b', borderColor: '#373a4b' } : {}}
               >
                 {showMap ? "HIDE MAP" : "SHOW MAP"}
               </Button>
             )}
          </Space>
        </div>

        {/* Results Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '16px' : '40px', background: '#fafafa' }}>
          {loading ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile
                ? '1fr'
                : isTablet
                  ? 'repeat(2, 1fr)'
                  : showMap
                    ? 'repeat(2, 1fr)'
                    : 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: isMobile ? '16px' : '32px'
            }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <AntCard key={i} style={{ borderRadius: '12px' }}>
                  <Skeleton.Image active style={{ width: '100%', height: 180 }} />
                  <Skeleton active paragraph={{ rows: 2 }} style={{ marginTop: 16 }} />
                </AntCard>
              ))}
            </div>
          ) : viewMode === 'grid' ? (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: isMobile 
                ? '1fr' 
                : isTablet 
                  ? 'repeat(2, 1fr)' 
                  : showMap 
                    ? 'repeat(2, 1fr)' 
                    : 'repeat(auto-fill, minmax(320px, 1fr))', 
              gap: isMobile ? '16px' : '32px' 
            }}>
              {filteredProperties.length > 0 ? (
                filteredProperties.map(p => <div key={p.id}><PropertyCard property={p} /></div>)
              ) : (
                !loading && <div style={{ gridColumn: '1/-1', padding: isMobile ? '60px 0' : '120px 0', textAlign: 'center' }}>
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
                          loading="lazy"
                          style={{ 
                            width: '100%', 
                            height: '250px', 
                            objectFit: 'cover',
                            borderRadius: isMobile ? '12px 12px 0 0' : '12px 0 0 12px',
                            transition: 'opacity 0.3s ease'
                          }}
                        />
                      </Col>
                      <Col xs={24} md={16} style={{ padding: isMobile ? '16px' : '24px' }}>
                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                          <Title level={3} style={{ margin: 0, color: '#b40101', fontSize: isMobile ? '20px' : '24px' }}>
                            ${p.price?.toLocaleString()}
                          </Title>
                          <Text strong style={{ fontSize: isMobile ? 14 : 16 }}>{p.address}</Text>
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
        </div>
      </Content>

      {/* Map Sider - Desktop only */}
      {!isMobile && showMap && (
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

      {/* Mobile Map Button */}
      {isMobile && (
        <FloatButton
          icon={<EnvironmentOutlined />}
          type="primary"
          style={{ right: 16, bottom: 80, background: '#b40101' }}
          onClick={() => setShowMapModal(true)}
          badge={{ count: filteredProperties.length }}
        />
      )}

      {/* Mobile Map Modal */}
      <Drawer
        title="Map View"
        placement="bottom"
        onClose={() => setShowMapModal(false)}
        open={showMapModal}
        height="90%"
        styles={{ body: { padding: 0 } }}
      >
        <PropertyMapLeaflet
          properties={filteredProperties}
          onPropertySelect={handlePropertySelect}
          onBoundsChange={handleMapBoundsChange}
          onDrawComplete={handleDrawComplete}
          height="100%"
          showControls={true}
        />
      </Drawer>

      {/* Filter Drawer for Mobile/Desktop */}
      <Drawer
        title="Filter Properties"
        placement="right"
        onClose={() => setShowFilters(false)}
        open={showFilters}
        width={isMobile ? '100%' : 400}
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
