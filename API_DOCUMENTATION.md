# 📚 Complete API Documentation - KW.com Clone

**Version**: 1.0.0  
**Last Updated**: May 5, 2026  
**Base URL**: `http://localhost:5000/api` (development) or `https://yourdomain.com/api` (production)

---

## 🔐 Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "User Name",
    "role": "user"
  }
}
```

### Sign Up
```
POST /auth/signup
Content-Type: application/json

{
  "name": "User Name",
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "User Name",
    "role": "user"
  }
}
```

---

## 🏠 Properties API

### Get All Properties
```
GET /properties
Query Parameters:
  - page: number (default: 1)
  - limit: number (default: 10)
  - city: string (filter by city)
  - minPrice: number
  - maxPrice: number
  - beds: number
  - baths: number
  - type: string (property type)
  - sort: string (newest, price_asc, price_desc, beds, sqft)

Response:
{
  "properties": [
    {
      "id": "prop-id",
      "address": "123 Main St",
      "city": "Austin",
      "state": "TX",
      "zip": "78701",
      "price": 450000,
      "beds": 3,
      "baths": 2,
      "sqft": 2000,
      "imageUrl": "https://...",
      "status": "Active",
      "propertyType": "Single Family",
      "latitude": 30.2672,
      "longitude": -97.7431,
      "agent": { ... }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "pages": 15
  }
}
```

### Get Property Details
```
GET /properties/:id

Response:
{
  "id": "prop-id",
  "address": "123 Main St",
  "city": "Austin",
  "state": "TX",
  "zip": "78701",
  "price": 450000,
  "beds": 3,
  "baths": 2,
  "sqft": 2000,
  "imageUrl": "https://...",
  "status": "Active",
  "propertyType": "Single Family",
  "latitude": 30.2672,
  "longitude": -97.7431,
  "agent": {
    "id": "agent-id",
    "name": "Agent Name",
    "email": "agent@example.com",
    "phone": "555-1234",
    "imageUrl": "https://...",
    "brokerage": "Keller Williams"
  }
}
```

### Create Property (Agent Only)
```
POST /properties
Authorization: Bearer <token>
Content-Type: application/json

{
  "address": "123 Main St",
  "city": "Austin",
  "state": "TX",
  "zip": "78701",
  "price": 450000,
  "beds": 3,
  "baths": 2,
  "sqft": 2000,
  "imageUrl": "https://...",
  "propertyType": "Single Family"
}

Response: { property object }
```

---

## 👥 Agents API

### Get All Agents
```
GET /agents
Query Parameters:
  - page: number (default: 1)
  - limit: number (default: 10)
  - search: string (search by name)
  - city: string (filter by city)
  - specialty: string (filter by specialty)

Response:
{
  "agents": [
    {
      "id": "agent-id",
      "name": "Agent Name",
      "email": "agent@example.com",
      "phone": "555-1234",
      "imageUrl": "https://...",
      "brokerage": "Keller Williams",
      "rating": 4.8,
      "reviews": 45,
      "license": "TX123456",
      "languages": ["English", "Spanish"],
      "bio": "Experienced agent...",
      "location": "Austin, TX",
      "specialties": ["Luxury", "Investment"]
    }
  ],
  "pagination": { ... }
}
```

### Get Agent Details
```
GET /agents/:id

Response: { agent object with properties }
```

---

## 📍 Map API

### Get Properties with Coordinates
```
GET /map/properties
Query Parameters:
  - bounds: string (minLat,minLng,maxLat,maxLng)
  - minPrice: number
  - maxPrice: number
  - beds: number

Response:
{
  "properties": [
    {
      "id": "prop-id",
      "address": "123 Main St",
      "price": 450000,
      "beds": 3,
      "baths": 2,
      "latitude": 30.2672,
      "longitude": -97.7431,
      "imageUrl": "https://..."
    }
  ]
}
```

### Search Area (Polygon)
```
POST /map/search-area
Content-Type: application/json

{
  "geometry": {
    "type": "Polygon",
    "coordinates": [
      [[-97.8, 30.2], [-97.7, 30.2], [-97.7, 30.3], [-97.8, 30.3], [-97.8, 30.2]]
    ]
  },
  "minPrice": 200000,
  "maxPrice": 600000,
  "beds": 3
}

Response: { properties array }
```

---

## 💾 Saved Searches API

### Get Saved Searches
```
GET /saved-searches
Authorization: Bearer <token>

Response:
{
  "searches": [
    {
      "id": "search-id",
      "name": "Austin 3BR Homes",
      "filters": { ... },
      "emailAlerts": true,
      "frequency": "daily",
      "lastRun": "2026-05-05T10:00:00Z",
      "isActive": true,
      "createdAt": "2026-05-01T10:00:00Z"
    }
  ]
}
```

### Create Saved Search
```
POST /saved-searches
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Austin 3BR Homes",
  "filters": {
    "city": "Austin",
    "minPrice": 300000,
    "maxPrice": 600000,
    "beds": 3
  },
  "emailAlerts": true,
  "frequency": "daily"
}

Response: { saved search object }
```

### Update Saved Search
```
PATCH /saved-searches/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "frequency": "weekly"
}

Response: { updated saved search object }
```

### Delete Saved Search
```
DELETE /saved-searches/:id
Authorization: Bearer <token>

Response: { "message": "Saved search deleted successfully" }
```

---

## 🏠 Open Houses API

### Get All Open Houses
```
GET /open-houses
Query Parameters:
  - city: string
  - date: string (YYYY-MM-DD)
  - agentId: string

Response:
{
  "openHouses": [
    {
      "id": "oh-id",
      "startTime": "2026-05-10T14:00:00Z",
      "endTime": "2026-05-10T16:00:00Z",
      "description": "Beautiful home...",
      "property": { ... },
      "agent": { ... },
      "_count": {
        "rsvps": 12
      }
    }
  ]
}
```

### Create Open House (Agent Only)
```
POST /open-houses
Authorization: Bearer <token>
Content-Type: application/json

{
  "propertyId": "prop-id",
  "agentId": "agent-id",
  "startTime": "2026-05-10T14:00:00Z",
  "endTime": "2026-05-10T16:00:00Z",
  "description": "Beautiful home with great views"
}

Response: { open house object }
```

### RSVP to Open House
```
POST /open-houses/:id/rsvp
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "555-1234",
  "guests": 2,
  "message": "Looking forward to it!"
}

Response: { rsvp object }
```

### Get RSVPs (Agent Only)
```
GET /open-houses/:id/rsvps
Authorization: Bearer <token>

Response:
{
  "rsvps": [
    {
      "id": "rsvp-id",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "555-1234",
      "guests": 2,
      "status": "confirmed",
      "createdAt": "2026-05-05T10:00:00Z"
    }
  ]
}
```

---

## ⭐ Reviews API

### Get Agent Reviews
```
GET /reviews/agent/:agentId
Query Parameters:
  - page: number (default: 1)
  - limit: number (default: 10)
  - transactionType: string (buyer, seller, rental)

Response:
{
  "reviews": [
    {
      "id": "review-id",
      "reviewerName": "John Doe",
      "rating": 5,
      "comment": "Excellent service!",
      "transactionType": "buyer",
      "verified": true,
      "agentResponse": "Thank you!",
      "createdAt": "2026-05-01T10:00:00Z"
    }
  ],
  "stats": {
    "averageRating": 4.8,
    "totalReviews": 45,
    "ratingBreakdown": {
      "5": 40,
      "4": 4,
      "3": 1
    }
  }
}
```

### Submit Review
```
POST /reviews/agent/:agentId
Content-Type: application/json

{
  "reviewerName": "John Doe",
  "reviewerEmail": "john@example.com",
  "rating": 5,
  "comment": "Excellent service!",
  "transactionType": "buyer"
}

Response: { review object }
```

### Agent Response to Review
```
PATCH /reviews/:id/respond
Authorization: Bearer <token>
Content-Type: application/json

{
  "agentResponse": "Thank you for the kind words!"
}

Response: { updated review object }
```

---

## 🎬 Virtual Tours API

### Get Property Tours
```
GET /virtual-tours/property/:propertyId

Response:
{
  "tours": [
    {
      "id": "tour-id",
      "type": "matterport",
      "url": "https://my.matterport.com/show/?m=...",
      "title": "Living Room 360°",
      "description": "Beautiful living room with natural light",
      "isPrimary": true,
      "createdAt": "2026-05-01T10:00:00Z"
    }
  ]
}
```

### Add Virtual Tour (Agent Only)
```
POST /virtual-tours/property/:propertyId
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "matterport",
  "url": "https://my.matterport.com/show/?m=...",
  "title": "Living Room 360°",
  "description": "Beautiful living room",
  "isPrimary": true
}

Response: { tour object }
```

### Update Virtual Tour (Agent Only)
```
PATCH /virtual-tours/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "isPrimary": false
}

Response: { updated tour object }
```

### Delete Virtual Tour (Agent Only)
```
DELETE /virtual-tours/:id
Authorization: Bearer <token>

Response: { "message": "Virtual tour deleted successfully" }
```

---

## 📊 Market Data API

### Get Market Data by Zip Code
```
GET /market-data/zip/:zipCode

Response:
{
  "zipCode": "78701",
  "city": "Austin",
  "state": "TX",
  "avgPrice": 450000,
  "medianPrice": 425000,
  "avgDaysOnMarket": 35,
  "pricePerSqft": 225,
  "inventoryCount": 45,
  "salesVolume": 12,
  "priceChange": 2.5,
  "updatedAt": "2026-05-05T10:00:00Z"
}
```

### Get City Market Trends
```
GET /market-data/city/:city/:state

Response:
{
  "city": "Austin",
  "state": "TX",
  "avgPrice": 450000,
  "medianPrice": 425000,
  "avgDaysOnMarket": 35,
  "pricePerSqft": 225,
  "totalInventory": 450,
  "totalSalesVolume": 120,
  "priceChange": 2.5,
  "zipCodes": [
    {
      "zipCode": "78701",
      "avgPrice": 450000,
      ...
    }
  ]
}
```

### Get Neighborhood Statistics
```
GET /market-data/neighborhood/:zipCode

Response:
{
  "zipCode": "78701",
  "totalProperties": 150,
  "activeListings": 45,
  "soldProperties": 12,
  "avgPrice": 450000,
  "medianPrice": 425000,
  "avgSqft": 2000,
  "avgPricePerSqft": 225,
  "propertyTypes": {
    "Single Family": 100,
    "Condo": 30,
    "Townhouse": 20
  },
  "bedroomBreakdown": {
    "2": 30,
    "3": 70,
    "4+": 50
  },
  "priceRanges": {
    "Under $200k": 5,
    "$200k-$400k": 40,
    "$400k-$600k": 60,
    "$600k-$800k": 30,
    "Over $800k": 15
  }
}
```

### Compare Properties
```
POST /market-data/compare
Content-Type: application/json

{
  "propertyIds": ["prop-id-1", "prop-id-2", "prop-id-3"]
}

Response:
{
  "properties": [
    {
      "id": "prop-id-1",
      "address": "123 Main St",
      "price": 450000,
      "beds": 3,
      "baths": 2,
      "sqft": 2000,
      "pricePerSqft": 225,
      "priceVsMarket": "above",
      "marketData": { ... }
    }
  ],
  "stats": {
    "priceRange": {
      "min": 400000,
      "max": 500000,
      "avg": 450000
    },
    "sqftRange": { ... },
    "pricePerSqftRange": { ... }
  }
}
```

---

## 💬 Leads API

### Get All Leads (Agent Only)
```
GET /leads
Authorization: Bearer <token>
Query Parameters:
  - status: string (New, Contacted, Qualified, Converted)
  - page: number
  - limit: number

Response:
{
  "leads": [
    {
      "id": "lead-id",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "555-1234",
      "message": "Interested in properties...",
      "status": "New",
      "type": "home_valuation",
      "date": "2026-05-05T10:00:00Z",
      "property": { ... }
    }
  ]
}
```

### Create Lead
```
POST /leads
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "555-1234",
  "message": "Interested in properties...",
  "agentId": "agent-id",
  "propertyId": "prop-id",
  "type": "home_valuation"
}

Response: { lead object }
```

### Update Lead Status (Agent Only)
```
PATCH /leads/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "Contacted",
  "notes": "Called and left voicemail"
}

Response: { updated lead object }
```

---

## ❤️ Favorites API

### Get Favorite Properties
```
GET /favorites
Authorization: Bearer <token>

Response:
{
  "favorites": [
    {
      "id": "fav-id",
      "property": { ... },
      "createdAt": "2026-05-01T10:00:00Z"
    }
  ]
}
```

### Add to Favorites
```
POST /favorites
Authorization: Bearer <token>
Content-Type: application/json

{
  "propertyId": "prop-id"
}

Response: { favorite object }
```

### Remove from Favorites
```
DELETE /favorites/:propertyId
Authorization: Bearer <token>

Response: { "message": "Removed from favorites" }
```

---

## 🎯 Opportunities API (Agent CRM)

### Get All Opportunities (Agent Only)
```
GET /opportunities
Authorization: Bearer <token>
Query Parameters:
  - status: string (Cultivate, Appointment, Active, Under Contract, Closed)
  - page: number
  - limit: number

Response:
{
  "opportunities": [
    {
      "id": "opp-id",
      "name": "John Doe - 123 Main St",
      "type": "listing",
      "dealType": "sale",
      "price": 450000,
      "status": "Active",
      "probability": 75,
      "createdAt": "2026-05-01T10:00:00Z"
    }
  ]
}
```

### Create Opportunity (Agent Only)
```
POST /opportunities
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Doe - 123 Main St",
  "type": "listing",
  "dealType": "sale",
  "price": 450000,
  "status": "Cultivate",
  "probability": 20
}

Response: { opportunity object }
```

### Update Opportunity (Agent Only)
```
PATCH /opportunities/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "Active",
  "probability": 75
}

Response: { updated opportunity object }
```

---

## 🔍 Health Check

### Server Health
```
GET /health

Response:
{
  "status": "ok",
  "message": "KW Real Estate Backend is active."
}
```

---

## ⚠️ Error Responses

All errors follow this format:

```
{
  "error": "Error message",
  "status": 400,
  "timestamp": "2026-05-05T10:00:00Z"
}
```

### Common Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

---

## 📈 Rate Limiting

- **Public endpoints**: 100 requests per minute
- **Authenticated endpoints**: 1000 requests per minute
- **Rate limit headers**:
  - `X-RateLimit-Limit`: Total requests allowed
  - `X-RateLimit-Remaining`: Requests remaining
  - `X-RateLimit-Reset`: Unix timestamp when limit resets

---

## 🔄 Pagination

All list endpoints support pagination:

```
Query Parameters:
  - page: number (default: 1)
  - limit: number (default: 10, max: 100)

Response includes:
{
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "pages": 15
  }
}
```

---

## 📞 Support

For API support, contact: api-support@yourdomain.com

**API Documentation Version**: 1.0.0  
**Last Updated**: May 5, 2026