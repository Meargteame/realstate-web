const axios = require('axios');

class GeocodingService {
  constructor() {
    // Using OpenStreetMap Nominatim (free) as primary, can switch to Google/Mapbox later
    this.nominatimBaseUrl = 'https://nominatim.openstreetmap.org/search';
    this.mapboxToken = process.env.MAPBOX_ACCESS_TOKEN;
    this.googleApiKey = process.env.GOOGLE_MAPS_API_KEY;
  }

  /**
   * Geocode an address using Nominatim (OpenStreetMap)
   * Free service, no API key required
   */
  async geocodeWithNominatim(address) {
    try {
      const response = await axios.get(this.nominatimBaseUrl, {
        params: {
          q: address,
          format: 'json',
          limit: 1,
          countrycodes: 'us', // Restrict to US
          addressdetails: 1
        },
        headers: {
          'User-Agent': 'KW-RealEstate-Platform/1.0'
        }
      });

      if (response.data && response.data.length > 0) {
        const result = response.data[0];
        return {
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon),
          formattedAddress: result.display_name,
          confidence: parseFloat(result.importance || 0.5)
        };
      }

      return null;
    } catch (error) {
      console.error('Nominatim geocoding error:', error.message);
      return null;
    }
  }

  /**
   * Geocode an address using Mapbox (requires API key)
   * More accurate for real estate addresses
   */
  async geocodeWithMapbox(address) {
    if (!this.mapboxToken) {
      console.warn('Mapbox token not configured, falling back to Nominatim');
      return this.geocodeWithNominatim(address);
    }

    try {
      const response = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json`, {
        params: {
          access_token: this.mapboxToken,
          country: 'us',
          types: 'address,poi',
          limit: 1
        }
      });

      if (response.data.features && response.data.features.length > 0) {
        const feature = response.data.features[0];
        const [longitude, latitude] = feature.center;
        
        return {
          latitude,
          longitude,
          formattedAddress: feature.place_name,
          confidence: feature.relevance || 0.5
        };
      }

      return null;
    } catch (error) {
      console.error('Mapbox geocoding error:', error.message);
      // Fallback to Nominatim
      return this.geocodeWithNominatim(address);
    }
  }

  /**
   * Geocode an address using Google Maps (requires API key)
   * Most accurate but has usage limits
   */
  async geocodeWithGoogle(address) {
    if (!this.googleApiKey) {
      console.warn('Google API key not configured, falling back to Mapbox');
      return this.geocodeWithMapbox(address);
    }

    try {
      const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
        params: {
          address,
          key: this.googleApiKey,
          region: 'us'
        }
      });

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        const result = response.data.results[0];
        const location = result.geometry.location;
        
        return {
          latitude: location.lat,
          longitude: location.lng,
          formattedAddress: result.formatted_address,
          confidence: this.getGoogleConfidence(result.geometry.location_type)
        };
      }

      return null;
    } catch (error) {
      console.error('Google geocoding error:', error.message);
      // Fallback to Mapbox
      return this.geocodeWithMapbox(address);
    }
  }

  /**
   * Convert Google location type to confidence score
   */
  getGoogleConfidence(locationType) {
    switch (locationType) {
      case 'ROOFTOP': return 1.0;
      case 'RANGE_INTERPOLATED': return 0.8;
      case 'GEOMETRIC_CENTER': return 0.6;
      case 'APPROXIMATE': return 0.4;
      default: return 0.5;
    }
  }

  /**
   * Main geocoding method with fallback chain
   * Tries services in order: Google -> Mapbox -> Nominatim
   */
  async geocodeAddress(address) {
    if (!address || typeof address !== 'string') {
      return null;
    }

    // Clean and format address
    const cleanAddress = address.trim();
    if (!cleanAddress) {
      return null;
    }

    // Try geocoding services in order of accuracy
    let result = null;

    // 1. Try Google (most accurate)
    if (this.googleApiKey) {
      result = await this.geocodeWithGoogle(cleanAddress);
      if (result && result.confidence > 0.7) {
        result.provider = 'google';
        return result;
      }
    }

    // 2. Try Mapbox (good accuracy)
    if (this.mapboxToken) {
      result = await this.geocodeWithMapbox(cleanAddress);
      if (result && result.confidence > 0.5) {
        result.provider = 'mapbox';
        return result;
      }
    }

    // 3. Fallback to Nominatim (free but less accurate)
    result = await this.geocodeWithNominatim(cleanAddress);
    if (result) {
      result.provider = 'nominatim';
      return result;
    }

    return null;
  }

  /**
   * Batch geocode multiple addresses
   */
  async batchGeocode(addresses, options = {}) {
    const { 
      batchSize = 10, 
      delayMs = 100, // Delay between requests to respect rate limits
      onProgress = null 
    } = options;

    const results = [];
    
    for (let i = 0; i < addresses.length; i += batchSize) {
      const batch = addresses.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (address, index) => {
        // Add delay to respect rate limits
        if (index > 0) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
        
        try {
          const result = await this.geocodeAddress(address);
          return { address, result, success: !!result };
        } catch (error) {
          console.error(`Geocoding failed for address: ${address}`, error.message);
          return { address, result: null, success: false, error: error.message };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Report progress
      if (onProgress) {
        onProgress({
          completed: Math.min(i + batchSize, addresses.length),
          total: addresses.length,
          percentage: Math.round((Math.min(i + batchSize, addresses.length) / addresses.length) * 100)
        });
      }

      // Add delay between batches
      if (i + batchSize < addresses.length) {
        await new Promise(resolve => setTimeout(resolve, delayMs * 2));
      }
    }

    return results;
  }

  /**
   * Reverse geocode coordinates to address
   */
  async reverseGeocode(latitude, longitude) {
    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
        params: {
          lat: latitude,
          lon: longitude,
          format: 'json',
          addressdetails: 1
        },
        headers: {
          'User-Agent': 'KW-RealEstate-Platform/1.0'
        }
      });

      if (response.data && response.data.display_name) {
        return {
          address: response.data.display_name,
          city: response.data.address?.city || response.data.address?.town || response.data.address?.village,
          state: response.data.address?.state,
          country: response.data.address?.country,
          zipCode: response.data.address?.postcode
        };
      }

      return null;
    } catch (error) {
      console.error('Reverse geocoding error:', error.message);
      return null;
    }
  }

  /**
   * Validate coordinates
   */
  isValidCoordinates(latitude, longitude) {
    return (
      typeof latitude === 'number' &&
      typeof longitude === 'number' &&
      latitude >= -90 && latitude <= 90 &&
      longitude >= -180 && longitude <= 180 &&
      !isNaN(latitude) && !isNaN(longitude)
    );
  }

  /**
   * Calculate distance between two points in kilometers
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  toRadians(degrees) {
    return degrees * (Math.PI/180);
  }
}

module.exports = new GeocodingService();