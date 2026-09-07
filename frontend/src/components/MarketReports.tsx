import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Home, Calendar, DollarSign, Clock, BarChart3 } from 'lucide-react';

interface MarketData {
  zipCode: string;
  city: string;
  state: string;
  avgPrice?: number;
  medianPrice?: number;
  avgDaysOnMarket?: number;
  pricePerSqft?: number;
  inventoryCount?: number;
  salesVolume?: number;
  priceChange?: number;
}

interface CityTrends extends MarketData {
  totalInventory: number;
  totalSalesVolume: number;
  zipCodes: MarketData[];
}

interface NeighborhoodStats {
  zipCode: string;
  totalProperties: number;
  activeListings: number;
  soldProperties: number;
  avgPrice: number;
  medianPrice: number;
  avgSqft: number;
  avgPricePerSqft: number;
  propertyTypes: { [key: string]: number };
  bedroomBreakdown: { [key: string]: number };
  priceRanges: { [key: string]: number };
}

interface MarketReportsProps {
  zipCode?: string;
  city?: string;
  state?: string;
}

const MarketReports: React.FC<MarketReportsProps> = ({ zipCode, city, state }) => {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [cityTrends, setCityTrends] = useState<CityTrends | null>(null);
  const [neighborhoodStats, setNeighborhoodStats] = useState<NeighborhoodStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'neighborhood'>('overview');

  useEffect(() => {
    if (zipCode || (city && state)) {
      fetchMarketData();
    }
  }, [zipCode, city, state]);

  const fetchMarketData = async () => {
    setLoading(true);
    try {
      const promises = [];

      // Fetch zip code data
      if (zipCode) {
        promises.push(
          fetch(`/api/market-data/zip/${zipCode}`).then(res => res.json()),
          fetch(`/api/market-data/neighborhood/${zipCode}`).then(res => res.json())
        );
      }

      // Fetch city trends
      if (city && state) {
        promises.push(
          fetch(`/api/market-data/city/${city}/${state}`).then(res => res.json())
        );
      }

      const results = await Promise.all(promises);

      if (zipCode) {
        setMarketData(results[0]);
        setNeighborhoodStats(results[1]);
        if (city && state) {
          setCityTrends(results[2]);
        }
      } else if (city && state) {
        setCityTrends(results[0]);
      }
    } catch (error) {
      console.error('Error fetching market data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const renderTrendIcon = (change: number) => {
    if (change > 0) {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    } else if (change < 0) {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
    return <BarChart3 className="h-4 w-4 text-gray-600" />;
  };

  const renderOverviewTab = () => {
    const data = marketData || cityTrends;
    if (!data) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Price</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.avgPrice ? formatPrice(data.avgPrice) : 'N/A'}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-[#b40101]" />
          </div>
          {data.priceChange !== undefined && (
            <div className="mt-2 flex items-center">
              {renderTrendIcon(data.priceChange)}
              <span className={`ml-1 text-sm ${
                data.priceChange >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatPercentage(data.priceChange)} from last period
              </span>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Median Price</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.medianPrice ? formatPrice(data.medianPrice) : 'N/A'}
              </p>
            </div>
            <Home className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Days on Market</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.avgDaysOnMarket || 'N/A'}
              </p>
            </div>
            <Clock className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Price per Sq Ft</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.pricePerSqft ? formatPrice(data.pricePerSqft) : 'N/A'}
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Inventory</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.inventoryCount || cityTrends?.totalInventory || 'N/A'}
              </p>
            </div>
            <Home className="h-8 w-8 text-[#b40101]" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sales Volume</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.salesVolume || cityTrends?.totalSalesVolume || 'N/A'}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>
    );
  };

  const renderTrendsTab = () => {
    if (!cityTrends) return null;

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {cityTrends.city}, {cityTrends.state} Market Overview
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-[#b40101]">
                {formatPrice(cityTrends.avgPrice)}
              </p>
              <p className="text-sm text-gray-600">Average Home Price</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {cityTrends.totalInventory}
              </p>
              <p className="text-sm text-gray-600">Active Listings</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {cityTrends.avgDaysOnMarket} days
              </p>
              <p className="text-sm text-gray-600">Average Days on Market</p>
            </div>
          </div>

          {cityTrends.priceChange !== undefined && (
            <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
              {renderTrendIcon(cityTrends.priceChange)}
              <span className={`ml-2 font-medium ${
                cityTrends.priceChange >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                Prices are {cityTrends.priceChange >= 0 ? 'up' : 'down'} {formatPercentage(Math.abs(cityTrends.priceChange))} from last period
              </span>
            </div>
          )}
        </div>

        {cityTrends.zipCodes && cityTrends.zipCodes.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Zip Code Breakdown
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Zip Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Inventory
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Days on Market
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price Change
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cityTrends.zipCodes.map((zip) => (
                    <tr key={zip.zipCode}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {zip.zipCode}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {zip.avgPrice ? formatPrice(zip.avgPrice) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {zip.inventoryCount || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {zip.avgDaysOnMarket || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {zip.priceChange !== undefined ? (
                          <div className="flex items-center">
                            {renderTrendIcon(zip.priceChange)}
                            <span className={`ml-1 ${
                              zip.priceChange >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {formatPercentage(zip.priceChange)}
                            </span>
                          </div>
                        ) : (
                          'N/A'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderNeighborhoodTab = () => {
    if (!neighborhoodStats) return null;

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Neighborhood Statistics - {neighborhoodStats.zipCode}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-[#b40101]">
                {neighborhoodStats.totalProperties}
              </p>
              <p className="text-sm text-gray-600">Total Properties</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {neighborhoodStats.activeListings}
              </p>
              <p className="text-sm text-gray-600">Active Listings</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {neighborhoodStats.soldProperties}
              </p>
              <p className="text-sm text-gray-600">Recently Sold</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {neighborhoodStats.avgSqft.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Avg Square Feet</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h4 className="text-md font-semibold text-gray-900 mb-4">Property Types</h4>
            <div className="space-y-2">
              {Object.entries(neighborhoodStats.propertyTypes).map(([type, count]) => (
                <div key={type} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{type}</span>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h4 className="text-md font-semibold text-gray-900 mb-4">Bedroom Distribution</h4>
            <div className="space-y-2">
              {Object.entries(neighborhoodStats.bedroomBreakdown).map(([beds, count]) => (
                <div key={beds} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{beds} bedroom{beds !== '1' ? 's' : ''}</span>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm md:col-span-2">
            <h4 className="text-md font-semibold text-gray-900 mb-4">Price Ranges</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(neighborhoodStats.priceRanges).map(([range, count]) => (
                <div key={range} className="text-center">
                  <p className="text-lg font-bold text-[#b40101]">{count}</p>
                  <p className="text-xs text-gray-600">{range}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
        <div className="h-64 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Market Reports</h2>
        <p className="text-gray-600">
          {zipCode && `Zip Code ${zipCode} • `}
          {city && state && `${city}, ${state}`}
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'trends', label: 'City Trends', icon: TrendingUp },
              { id: 'neighborhood', label: 'Neighborhood', icon: Home }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-[#b40101] text-[#b40101]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'trends' && renderTrendsTab()}
          {activeTab === 'neighborhood' && renderNeighborhoodTab()}
        </div>
      </div>
    </div>
  );
};

export default MarketReports;