import React, { useState, useEffect } from "react";
import { useSearchParams, useLocation, Link } from "react-router-dom";
import { notification } from "antd";
import {
  SlidersHorizontal,
  LayoutGrid,
  List,
  Map as MapIcon,
  MapPin,
  Bookmark,
  X,
  RotateCcw,
  ChevronDown,
  DollarSign,
  Home,
  Check,
  Search,
  Sparkles,
  ArrowRight,
  Bed,
  Bath,
  Maximize2
} from "lucide-react";
import PropertyCard from "@/components/PropertyCard";
import PropertyMapLeaflet from "@/components/PropertyMapLeaflet";
import SaveSearchModal from "@/components/SaveSearchModal";
import { useIsMobile, useIsTablet } from "../hooks/useBreakpoint";
import { useDebounce } from "../hooks/useDebounce";

export default function Properties() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const query = searchParams.get("q") || "";
  const typeParam = searchParams.get("type") || "";
  const [showMap, setShowMap] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [properties, setProperties] = useState<any[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [mapBounds, setMapBounds] = useState<any>(null);
  const [drawnArea, setDrawnArea] = useState<any>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [savingSearch, setSavingSearch] = useState(false);
  const [showMobileMap, setShowMobileMap] = useState(false);

  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  // Filter states
  const [priceRange, setPriceRange] = useState<[number, number]>([
    parseInt(searchParams.get("minPrice") || "0", 10),
    parseInt(searchParams.get("maxPrice") || "5000000", 10),
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

  // Advanced filters
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

  // Quick filter dropdown state
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Debounce signature
  const filterSignature = JSON.stringify({
    query,
    drawnArea,
    priceRange,
    bedrooms,
    bathrooms,
    propertyType,
    yearRange,
    lotSizeRange,
    hoaFeesRange,
    minGarageSpaces,
    hasPool,
    hasBasement,
    hasFireplace,
    isWaterfront,
    isPetFriendly,
    storiesRange,
    condition,
    maxDaysOnMarket,
  });
  const debouncedSignature = useDebounce(filterSignature, 350);

  // Keep URL in sync
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
  }, [propertyType, bedrooms, bathrooms, priceRange, sortBy]);

  // Set property type from URL parameter
  useEffect(() => {
    if (typeParam) {
      const typeMap: Record<string, string> = {
        luxury: "Single Family",
        land: "Land",
        commercial: "Commercial",
      };
      setPropertyType(typeMap[typeParam.toLowerCase()] || null);
    }
  }, [typeParam]);

  // Fetch properties
  useEffect(() => {
    setLoading(true);
    const fetchProperties = async () => {
      try {
        let response;
        if (drawnArea) {
          response = await fetch("/api/map/search-area", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              geometry: drawnArea,
              filters: buildFilterParams(),
            }),
          });
          const data = await response.json();
          setProperties(data.properties || []);
        } else {
          const params = new URLSearchParams();
          if (query) params.append("q", query);
          if (priceRange[0] > 0) params.append("minPrice", priceRange[0].toString());
          if (priceRange[1] < 5000000) params.append("maxPrice", priceRange[1].toString());
          if (bedrooms) params.append("beds", bedrooms.toString());
          if (bathrooms) params.append("baths", bathrooms.toString());
          if (propertyType) params.append("propertyType", propertyType);

          if (yearRange[0] > 1900) params.append("minYear", yearRange[0].toString());
          if (yearRange[1] < new Date().getFullYear()) params.append("maxYear", yearRange[1].toString());
          if (lotSizeRange[0] > 0) params.append("minLotSize", lotSizeRange[0].toString());
          if (lotSizeRange[1] < 100000) params.append("maxLotSize", lotSizeRange[1].toString());
          if (hoaFeesRange[0] > 0) params.append("minHoaFees", hoaFeesRange[0].toString());
          if (hoaFeesRange[1] < 1000) params.append("maxHoaFees", hoaFeesRange[1].toString());
          if (minGarageSpaces) params.append("minGarageSpaces", minGarageSpaces.toString());
          if (hasPool) params.append("hasPool", "true");
          if (hasBasement) params.append("hasBasement", "true");
          if (hasFireplace) params.append("hasFireplace", "true");
          if (isWaterfront) params.append("isWaterfront", "true");
          if (isPetFriendly) params.append("isPetFriendly", "true");
          if (storiesRange[0] > 1) params.append("minStories", storiesRange[0].toString());
          if (storiesRange[1] < 5) params.append("maxStories", storiesRange[1].toString());
          if (condition) params.append("condition", condition);
          if (maxDaysOnMarket) params.append("maxDaysOnMarket", maxDaysOnMarket.toString());

          response = await fetch(`/api/properties?${params.toString()}`);
          const data = await response.json();
          setProperties(Array.isArray(data) ? data : []);
        }
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
        notification.error({ message: "Search Error", description: "Could not fetch properties." });
      }
    };

    fetchProperties();
  }, [debouncedSignature]);

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

  // Sorting
  useEffect(() => {
    let sorted = [...properties];
    switch (sortBy) {
      case "price-low":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "beds":
        sorted.sort((a, b) => (b.beds || 0) - (a.beds || 0));
        break;
      case "sqft":
        sorted.sort((a, b) => (b.sqft || 0) - (a.sqft || 0));
        break;
      case "newest":
      default:
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
    setActiveDropdown(null);
  };

  const handlePropertySelect = (property: any) => {
    setSelectedProperty(property);
  };

  const handleDrawComplete = (area: any) => {
    setDrawnArea(area);
  };

  const handleMapBoundsChange = (bounds: any) => {
    setMapBounds(bounds);
  };

  const handleSaveSearch = async (searchData: any) => {
    try {
      setSavingSearch(true);
      const response = await fetch("/api/saved-searches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
            maxDaysOnMarket: maxDaysOnMarket,
          },
          emailAlerts: searchData.emailAlerts,
          frequency: searchData.frequency,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        notification.success({
          message: "Search Saved",
          description: `"${searchData.name}" has been saved. Notifications scheduled.`,
        });
        setShowSaveModal(false);
      } else {
        notification.error({ message: "Save Failed", description: data.error || "Failed to save search" });
      }
    } catch (error) {
      console.error("Save search error:", error);
      notification.error({ message: "Error", description: "Failed to save search" });
    } finally {
      setSavingSearch(false);
    }
  };

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
    maxDaysOnMarket !== null,
  ].filter(Boolean).length;

  const propertyTypeOptions = [
    "Single Family",
    "Condo",
    "Townhouse",
    "Multi-Family",
    "Land",
    "Commercial",
  ];

  return (
    <div style={{ height: "calc(100vh - 68px)", display: "flex", flexDirection: "column", background: "#ffffff" }}>
      {/* ── TOP EDITORIAL FILTER HEADER ── */}
      <header
        style={{
          borderBottom: "1px solid #eaeaea",
          background: "#ffffff",
          padding: isMobile ? "12px 16px" : "14px 28px",
          zIndex: 40,
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          {/* Title & Count */}
          <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
            <h1
              style={{
                fontFamily: '"DM Serif Display", Georgia, serif',
                fontSize: isMobile ? 20 : 26,
                fontWeight: 400,
                color: "#111111",
                letterSpacing: "-0.02em",
                margin: 0,
                lineHeight: 1.1,
              }}
            >
              {drawnArea ? "Custom Boundary" : query ? `"${query}"` : "Exclusive Properties"}
            </h1>
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#777777",
                letterSpacing: "0.02em",
                whiteSpace: "nowrap",
              }}
            >
              {loading ? "Searching..." : `${filteredProperties.length} ${filteredProperties.length === 1 ? "Home" : "Homes"}`}
            </span>
          </div>

          {/* Quick Filter Bar & Action Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Desktop Quick Dropdowns */}
            {!isMobile && (
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {/* Price Quick Button */}
                <button
                  onClick={() => setShowFilters(true)}
                  style={{
                    height: 36,
                    padding: "0 14px",
                    borderRadius: 20,
                    border: priceRange[0] > 0 || priceRange[1] < 5000000 ? "1.5px solid #111" : "1px solid #d5d5d5",
                    background: priceRange[0] > 0 || priceRange[1] < 5000000 ? "#111" : "#fff",
                    color: priceRange[0] > 0 || priceRange[1] < 5000000 ? "#fff" : "#222",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    transition: "all 0.15s ease",
                  }}
                >
                  <span>
                    {priceRange[0] > 0 || priceRange[1] < 5000000
                      ? `$${(priceRange[0] / 1000).toFixed(0)}k - $${(priceRange[1] / 1000).toFixed(0)}k`
                      : "Price"}
                  </span>
                  <ChevronDown size={14} />
                </button>

                {/* Beds Quick Button */}
                <button
                  onClick={() => setShowFilters(true)}
                  style={{
                    height: 36,
                    padding: "0 14px",
                    borderRadius: 20,
                    border: bedrooms !== null ? "1.5px solid #111" : "1px solid #d5d5d5",
                    background: bedrooms !== null ? "#111" : "#fff",
                    color: bedrooms !== null ? "#fff" : "#222",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    transition: "all 0.15s ease",
                  }}
                >
                  <span>{bedrooms !== null ? `${bedrooms}+ Beds` : "Beds & Baths"}</span>
                  <ChevronDown size={14} />
                </button>

                {/* Home Type Quick Button */}
                <button
                  onClick={() => setShowFilters(true)}
                  style={{
                    height: 36,
                    padding: "0 14px",
                    borderRadius: 20,
                    border: propertyType !== null ? "1.5px solid #111" : "1px solid #d5d5d5",
                    background: propertyType !== null ? "#111" : "#fff",
                    color: propertyType !== null ? "#fff" : "#222",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    transition: "all 0.15s ease",
                  }}
                >
                  <span>{propertyType || "Property Type"}</span>
                  <ChevronDown size={14} />
                </button>
              </div>
            )}

            {/* All Filters Trigger */}
            <button
              onClick={() => setShowFilters(true)}
              style={{
                height: 36,
                padding: "0 14px",
                borderRadius: 20,
                border: activeFilterCount > 0 ? "1.5px solid #b40101" : "1px solid #d5d5d5",
                background: activeFilterCount > 0 ? "#fff5f5" : "#fff",
                color: activeFilterCount > 0 ? "#b40101" : "#222",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                transition: "all 0.15s ease",
              }}
            >
              <SlidersHorizontal size={14} />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span
                  style={{
                    background: "#b40101",
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 800,
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Save Search Button */}
            {hasActiveFilters() && !isMobile && (
              <button
                onClick={() => setShowSaveModal(true)}
                style={{
                  height: 36,
                  padding: "0 14px",
                  borderRadius: 20,
                  border: "1px solid #d5d5d5",
                  background: "#fff",
                  color: "#111",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f7f7f7")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
              >
                <Bookmark size={14} color="#b40101" />
                <span>Save</span>
              </button>
            )}

            {/* Sort Dropdown */}
            <div style={{ position: "relative" }}>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  height: 36,
                  padding: "0 32px 0 12px",
                  borderRadius: 20,
                  border: "1px solid #d5d5d5",
                  background: "#fff",
                  color: "#222",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  outline: "none",
                  appearance: "none",
                }}
              >
                <option value="newest">Sort: Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="beds">Bedrooms</option>
                <option value="sqft">Square Feet</option>
              </select>
              <ChevronDown
                size={14}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                  color: "#666",
                }}
              />
            </div>

            {/* Desktop View Mode & Map Toggle */}
            {!isMobile && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 6 }}>
                {/* Grid / List Switcher */}
                <div
                  style={{
                    display: "flex",
                    background: "#f3f3f3",
                    padding: 3,
                    borderRadius: 8,
                  }}
                >
                  <button
                    onClick={() => setViewMode("grid")}
                    style={{
                      border: "none",
                      background: viewMode === "grid" ? "#ffffff" : "transparent",
                      color: viewMode === "grid" ? "#111" : "#777",
                      padding: "5px 8px",
                      borderRadius: 6,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      boxShadow: viewMode === "grid" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                    }}
                    title="Grid view"
                  >
                    <LayoutGrid size={15} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    style={{
                      border: "none",
                      background: viewMode === "list" ? "#ffffff" : "transparent",
                      color: viewMode === "list" ? "#111" : "#777",
                      padding: "5px 8px",
                      borderRadius: 6,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      boxShadow: viewMode === "list" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                    }}
                    title="List view"
                  >
                    <List size={15} />
                  </button>
                </div>

                {/* Map Toggle Button */}
                <button
                  onClick={() => setShowMap(!showMap)}
                  style={{
                    height: 36,
                    padding: "0 12px",
                    borderRadius: 8,
                    border: "1px solid #d5d5d5",
                    background: showMap ? "#111" : "#fff",
                    color: showMap ? "#fff" : "#111",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    transition: "all 0.15s ease",
                  }}
                >
                  <MapIcon size={14} />
                  <span>{showMap ? "Hide Map" : "Show Map"}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Active Filter Chips Bar (if any filters active) */}
        {activeFilterCount > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
              marginTop: 10,
              paddingTop: 10,
              borderTop: "1px solid #f2f2f2",
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#888", letterSpacing: "0.08em" }}>
              Active:
            </span>
            {propertyType && (
              <span
                onClick={() => setPropertyType(null)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 12,
                  fontWeight: 600,
                  background: "#f5f5f5",
                  padding: "2px 8px 2px 10px",
                  borderRadius: 14,
                  cursor: "pointer",
                  color: "#222",
                }}
              >
                {propertyType} <X size={12} />
              </span>
            )}
            {bedrooms !== null && (
              <span
                onClick={() => setBedrooms(null)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 12,
                  fontWeight: 600,
                  background: "#f5f5f5",
                  padding: "2px 8px 2px 10px",
                  borderRadius: 14,
                  cursor: "pointer",
                  color: "#222",
                }}
              >
                {bedrooms}+ Beds <X size={12} />
              </span>
            )}
            {bathrooms !== null && (
              <span
                onClick={() => setBathrooms(null)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 12,
                  fontWeight: 600,
                  background: "#f5f5f5",
                  padding: "2px 8px 2px 10px",
                  borderRadius: 14,
                  cursor: "pointer",
                  color: "#222",
                }}
              >
                {bathrooms}+ Baths <X size={12} />
              </span>
            )}
            {(priceRange[0] > 0 || priceRange[1] < 5000000) && (
              <span
                onClick={() => setPriceRange([0, 5000000])}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 12,
                  fontWeight: 600,
                  background: "#f5f5f5",
                  padding: "2px 8px 2px 10px",
                  borderRadius: 14,
                  cursor: "pointer",
                  color: "#222",
                }}
              >
                ${(priceRange[0] / 1000).toFixed(0)}k - ${(priceRange[1] / 1000).toFixed(0)}k <X size={12} />
              </span>
            )}
            {hasPool && (
              <span
                onClick={() => setHasPool(false)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 12,
                  fontWeight: 600,
                  background: "#f5f5f5",
                  padding: "2px 8px 2px 10px",
                  borderRadius: 14,
                  cursor: "pointer",
                  color: "#222",
                }}
              >
                Pool <X size={12} />
              </span>
            )}
            {isWaterfront && (
              <span
                onClick={() => setIsWaterfront(false)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 12,
                  fontWeight: 600,
                  background: "#f5f5f5",
                  padding: "2px 8px 2px 10px",
                  borderRadius: 14,
                  cursor: "pointer",
                  color: "#222",
                }}
              >
                Waterfront <X size={12} />
              </span>
            )}
            <button
              onClick={clearFilters}
              style={{
                border: "none",
                background: "none",
                color: "#b40101",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                padding: "2px 6px",
              }}
            >
              Reset all
            </button>
          </div>
        )}
      </header>

      {/* ── MAIN CONTENT (RESULTS & MAP) ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>
        {/* Listings Container */}
        <main
          style={{
            flex: 1,
            height: "100%",
            overflowY: "auto",
            padding: isMobile ? "16px" : "28px 32px",
            background: "#fbfbfb",
          }}
        >
          {loading ? (
            /* Loading Skeletons */
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile
                  ? "1fr"
                  : showMap
                  ? "repeat(2, 1fr)"
                  : "repeat(auto-fill, minmax(310px, 1fr))",
                gap: 24,
              }}
            >
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  style={{
                    background: "#fff",
                    borderRadius: 12,
                    border: "1px solid #ebebeb",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: 220,
                      background: "linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)",
                      backgroundSize: "200% 100%",
                      animation: "skeletonShimmer 1.5s infinite",
                    }}
                  />
                  <div style={{ padding: 20 }}>
                    <div style={{ height: 24, width: "50%", background: "#f0f0f0", borderRadius: 4, marginBottom: 12 }} />
                    <div style={{ height: 16, width: "80%", background: "#f0f0f0", borderRadius: 4, marginBottom: 8 }} />
                    <div style={{ height: 14, width: "60%", background: "#f0f0f0", borderRadius: 4 }} />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProperties.length === 0 ? (
            /* Empty State */
            <div
              style={{
                padding: "80px 24px",
                textAlign: "center",
                maxWidth: 480,
                margin: "0 auto",
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "#f0f0f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                  color: "#666",
                }}
              >
                <Search size={24} />
              </div>
              <h3
                style={{
                  fontFamily: '"DM Serif Display", Georgia, serif',
                  fontSize: 26,
                  color: "#111",
                  margin: "0 0 10px",
                  fontWeight: 400,
                }}
              >
                No Matching Residences
              </h3>
              <p style={{ color: "#666", fontSize: 15, lineHeight: 1.5, margin: "0 0 24px" }}>
                We couldn't find any homes matching your precise filter criteria. Try expanding your price range or adjusting room specifications.
              </p>
              <button
                onClick={clearFilters}
                style={{
                  height: 44,
                  padding: "0 24px",
                  background: "#111",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <RotateCcw size={15} />
                <span>Reset All Filters</span>
              </button>
            </div>
          ) : viewMode === "grid" ? (
            /* Grid View */
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile
                  ? "1fr"
                  : showMap
                  ? "repeat(2, 1fr)"
                  : "repeat(auto-fill, minmax(310px, 1fr))",
                gap: 24,
              }}
            >
              {filteredProperties.map((p) => (
                <div key={p.id}>
                  <PropertyCard property={p} />
                </div>
              ))}
            </div>
          ) : (
            /* List View — Sleek Editorial Row Cards */
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {filteredProperties.map((p) => (
                <div
                  key={p.id}
                  style={{
                    display: "flex",
                    flexDirection: isMobile ? "column" : "row",
                    background: "#ffffff",
                    borderRadius: 12,
                    border: "1px solid #ebebeb",
                    overflow: "hidden",
                    transition: "box-shadow 0.2s, border-color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.07)";
                    e.currentTarget.style.borderColor = "#ddd";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.borderColor = "#ebebeb";
                  }}
                >
                  {/* Photo */}
                  <div
                    style={{
                      width: isMobile ? "100%" : 320,
                      height: isMobile ? 220 : 200,
                      position: "relative",
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={p.imageUrl || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"}
                      alt={p.title || p.address}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      loading="lazy"
                    />
                    {p.status && (
                      <span
                        style={{
                          position: "absolute",
                          top: 12,
                          left: 12,
                          background: p.status === "For Rent" ? "#111" : "#b40101",
                          color: "#fff",
                          fontSize: 10,
                          fontWeight: 800,
                          padding: "4px 8px",
                          borderRadius: 4,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}
                      >
                        {p.status}
                      </span>
                    )}
                  </div>

                  {/* Information */}
                  <div
                    style={{
                      flex: 1,
                      padding: 24,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6 }}>
                        <span
                          style={{
                            fontFamily: '"DM Serif Display", Georgia, serif',
                            fontSize: 26,
                            fontWeight: 400,
                            color: "#111",
                            letterSpacing: "-0.02em",
                          }}
                        >
                          ${p.price?.toLocaleString()}
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#888", textTransform: "uppercase" }}>
                          {p.propertyType || "Residential"}
                        </span>
                      </div>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111", margin: "0 0 4px" }}>
                        {p.address}
                      </h3>
                      <p style={{ fontSize: 13, color: "#666", margin: "0 0 16px" }}>
                        {p.city}, {p.state} {p.zip}
                      </p>

                      {/* Specs */}
                      <div style={{ display: "flex", gap: 20, fontSize: 13, color: "#444" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                          <Bed size={15} color="#888" />
                          <strong>{p.beds}</strong> Beds
                        </span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                          <Bath size={15} color="#888" />
                          <strong>{p.baths}</strong> Baths
                        </span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                          <Maximize2 size={15} color="#888" />
                          <strong>{p.sqft?.toLocaleString()}</strong> Sq Ft
                        </span>
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
                      <Link
                        to={`/properties/${p.id}`}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#b40101",
                          textDecoration: "none",
                        }}
                      >
                        <span>View Residence</span>
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* Desktop Split Map */}
        {!isMobile && showMap && (
          <aside
            style={{
              width: "42%",
              height: "100%",
              position: "relative",
              borderLeft: "1px solid #ebebeb",
              background: "#f4f4f4",
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
          </aside>
        )}
      </div>

      {/* ── MOBILE FLOATING MAP BUTTON ── */}
      {isMobile && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 50,
          }}
        >
          <button
            onClick={() => setShowMobileMap(!showMobileMap)}
            style={{
              height: 44,
              padding: "0 20px",
              borderRadius: 22,
              background: "#111111",
              color: "#ffffff",
              border: "none",
              fontSize: 14,
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
              cursor: "pointer",
            }}
          >
            {showMobileMap ? <List size={16} /> : <MapIcon size={16} />}
            <span>{showMobileMap ? "View List" : `Map (${filteredProperties.length})`}</span>
          </button>
        </div>
      )}

      {/* ── MOBILE FULL-SCREEN MAP MODAL ── */}
      {isMobile && showMobileMap && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "#fff",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid #eee",
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 16 }}>Map Explorer ({filteredProperties.length})</span>
            <button
              onClick={() => setShowMobileMap(false)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
            >
              <X size={20} />
            </button>
          </div>
          <div style={{ flex: 1, position: "relative" }}>
            <PropertyMapLeaflet
              properties={filteredProperties}
              onPropertySelect={handlePropertySelect}
              onBoundsChange={handleMapBoundsChange}
              onDrawComplete={handleDrawComplete}
              height="100%"
              showControls={true}
            />
          </div>
        </div>
      )}

      {/* ── LUXURY SLIDE-IN FILTER DRAWER ── */}
      {showFilters && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setShowFilters(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              zIndex: 998,
              transition: "opacity 0.2s",
            }}
          />

          {/* Drawer */}
          <div
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              bottom: 0,
              width: isMobile ? "100%" : 440,
              background: "#ffffff",
              zIndex: 999,
              display: "flex",
              flexDirection: "column",
              boxShadow: "-8px 0 32px rgba(0,0,0,0.15)",
            }}
          >
            {/* Drawer Header */}
            <div
              style={{
                padding: "20px 28px",
                borderBottom: "1px solid #eaeaea",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <h2
                  style={{
                    fontFamily: '"DM Serif Display", Georgia, serif',
                    fontSize: 24,
                    fontWeight: 400,
                    margin: 0,
                    color: "#111",
                  }}
                >
                  Refine Search
                </h2>
                <span style={{ fontSize: 12, color: "#888", fontWeight: 600 }}>
                  {filteredProperties.length} homes currently match
                </span>
              </div>
              <button
                onClick={() => setShowFilters(false)}
                style={{
                  background: "#f4f4f4",
                  border: "none",
                  borderRadius: "50%",
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Drawer Body Scroll */}
            <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
              {/* Price Range */}
              <div style={{ marginBottom: 32 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#333", marginBottom: 12 }}>
                  Price Range
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <span style={{ fontSize: 11, color: "#777", fontWeight: 600 }}>Minimum</span>
                    <input
                      type="number"
                      value={priceRange[0]}
                      step={50000}
                      onChange={(e) => setPriceRange([Number(e.target.value) || 0, priceRange[1]])}
                      style={{
                        width: "100%",
                        height: 42,
                        padding: "0 12px",
                        border: "1px solid #d5d5d5",
                        borderRadius: 8,
                        fontSize: 14,
                        fontWeight: 600,
                        marginTop: 4,
                      }}
                    />
                  </div>
                  <div>
                    <span style={{ fontSize: 11, color: "#777", fontWeight: 600 }}>Maximum</span>
                    <input
                      type="number"
                      value={priceRange[1]}
                      step={100000}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value) || 5000000])}
                      style={{
                        width: "100%",
                        height: 42,
                        padding: "0 12px",
                        border: "1px solid #d5d5d5",
                        borderRadius: 8,
                        fontSize: 14,
                        fontWeight: 600,
                        marginTop: 4,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Bedrooms */}
              <div style={{ marginBottom: 32 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#333", marginBottom: 12 }}>
                  Bedrooms
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  {[null, 1, 2, 3, 4, 5].map((num) => {
                    const active = bedrooms === num;
                    return (
                      <button
                        key={num === null ? "any" : num}
                        onClick={() => setBedrooms(num)}
                        style={{
                          flex: 1,
                          height: 40,
                          borderRadius: 8,
                          border: active ? "1.5px solid #111" : "1px solid #d5d5d5",
                          background: active ? "#111" : "#fff",
                          color: active ? "#fff" : "#111",
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: "pointer",
                          transition: "all 0.12s",
                        }}
                      >
                        {num === null ? "Any" : `${num}+`}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bathrooms */}
              <div style={{ marginBottom: 32 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#333", marginBottom: 12 }}>
                  Bathrooms
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  {[null, 1, 2, 3, 4].map((num) => {
                    const active = bathrooms === num;
                    return (
                      <button
                        key={num === null ? "any" : num}
                        onClick={() => setBathrooms(num)}
                        style={{
                          flex: 1,
                          height: 40,
                          borderRadius: 8,
                          border: active ? "1.5px solid #111" : "1px solid #d5d5d5",
                          background: active ? "#111" : "#fff",
                          color: active ? "#fff" : "#111",
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: "pointer",
                          transition: "all 0.12s",
                        }}
                      >
                        {num === null ? "Any" : `${num}+`}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Property Type */}
              <div style={{ marginBottom: 32 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#333", marginBottom: 12 }}>
                  Property Type
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {propertyTypeOptions.map((type) => {
                    const active = propertyType === type;
                    return (
                      <button
                        key={type}
                        onClick={() => setPropertyType(active ? null : type)}
                        style={{
                          height: 42,
                          padding: "0 12px",
                          borderRadius: 8,
                          border: active ? "1.5px solid #b40101" : "1px solid #d5d5d5",
                          background: active ? "#fff5f5" : "#fff",
                          color: active ? "#b40101" : "#333",
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: "pointer",
                          textAlign: "left",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          transition: "all 0.12s",
                        }}
                      >
                        <span>{type}</span>
                        {active && <Check size={14} color="#b40101" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Features & Amenities */}
              <div style={{ marginBottom: 32 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#333", marginBottom: 12 }}>
                  Desirable Features
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { label: "Private Swimming Pool", checked: hasPool, toggle: () => setHasPool(!hasPool) },
                    { label: "Finished Basement", checked: hasBasement, toggle: () => setHasBasement(!hasBasement) },
                    { label: "Fireplace", checked: hasFireplace, toggle: () => setHasFireplace(!hasFireplace) },
                    { label: "Waterfront Residence", checked: isWaterfront, toggle: () => setIsWaterfront(!isWaterfront) },
                    { label: "Pet Friendly", checked: isPetFriendly, toggle: () => setIsPetFriendly(!isPetFriendly) },
                  ].map((feat) => (
                    <label
                      key={feat.label}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        cursor: "pointer",
                        fontSize: 14,
                        color: "#222",
                        fontWeight: 500,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={feat.checked}
                        onChange={feat.toggle}
                        style={{
                          width: 18,
                          height: 18,
                          accentColor: "#b40101",
                          cursor: "pointer",
                        }}
                      />
                      <span>{feat.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Drawer Sticky Footer */}
            <div
              style={{
                padding: "16px 28px",
                borderTop: "1px solid #eaeaea",
                display: "flex",
                alignItems: "center",
                gap: 12,
                background: "#fafafa",
              }}
            >
              <button
                onClick={clearFilters}
                style={{
                  height: 48,
                  padding: "0 18px",
                  border: "1px solid #d5d5d5",
                  background: "#fff",
                  color: "#333",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Reset All
              </button>
              <button
                onClick={() => setShowFilters(false)}
                style={{
                  flex: 1,
                  height: 48,
                  border: "none",
                  background: "#b40101",
                  color: "#fff",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                View {filteredProperties.length} Properties
              </button>
            </div>
          </div>
        </>
      )}

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
          query: query,
        }}
        currentMapArea={drawnArea}
        loading={savingSearch}
      />
    </div>
  );
}
