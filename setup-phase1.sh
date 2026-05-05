#!/bin/bash

echo "🚀 Setting up Phase 1: Interactive Map Search"
echo "============================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

echo ""
echo "📦 Installing frontend dependencies..."
cd frontend
npm install mapbox-gl react-map-gl @mapbox/mapbox-gl-draw @turf/turf
if [ $? -eq 0 ]; then
    echo "✅ Frontend dependencies installed"
else
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

echo ""
echo "📦 Installing backend dependencies..."
cd ../backend
npm install axios
if [ $? -eq 0 ]; then
    echo "✅ Backend dependencies installed"
else
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

echo ""
echo "🗺️  Adding coordinates to properties..."
node prisma/seedWithCoordinates.js
if [ $? -eq 0 ]; then
    echo "✅ Properties geocoded successfully"
else
    echo "⚠️  Geocoding failed - properties may not have coordinates"
fi

echo ""
echo "🧪 Testing map API..."
node test-map-api.js
if [ $? -eq 0 ]; then
    echo "✅ Map API test passed"
else
    echo "⚠️  Map API test failed - check database connection"
fi

echo ""
echo "📝 Creating environment file..."
cd ../frontend
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "✅ Created .env file from example"
    echo "⚠️  Please add your Mapbox token to frontend/.env"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "🎉 Phase 1 setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Add Mapbox token to frontend/.env (optional - fallback works without it)"
echo "2. Start backend: cd backend && npm run dev"
echo "3. Start frontend: cd frontend && npm run dev"
echo "4. Visit http://localhost:3000/properties to test the map"
echo ""
echo "📖 For detailed instructions, see: PHASE_1_MAP_SEARCH_COMPLETE.md"