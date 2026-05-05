import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, Phone, Mail } from 'lucide-react';

interface OpenHouse {
  id: string;
  startTime: string;
  endTime: string;
  description?: string;
  property: {
    id: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    price: number;
    beds: number;
    baths: number;
    sqft: number;
    imageUrl: string;
    propertyType: string;
  };
  agent: {
    id: string;
    name: string;
    phone: string;
    email: string;
    imageUrl: string;
    brokerage: string;
  };
  _count: {
    rsvps: number;
  };
}

interface RSVPForm {
  name: string;
  email: string;
  phone: string;
  guests: number;
  message: string;
}

const OpenHouses: React.FC = () => {
  const [openHouses, setOpenHouses] = useState<OpenHouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [showRSVPModal, setShowRSVPModal] = useState(false);
  const [selectedOpenHouse, setSelectedOpenHouse] = useState<OpenHouse | null>(null);
  const [rsvpForm, setRSVPForm] = useState<RSVPForm>({
    name: '',
    email: '',
    phone: '',
    guests: 1,
    message: ''
  });
  const [rsvpLoading, setRSVPLoading] = useState(false);

  useEffect(() => {
    fetchOpenHouses();
  }, [selectedCity, selectedDate]);

  const fetchOpenHouses = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCity) params.append('city', selectedCity);
      if (selectedDate) params.append('date', selectedDate);

      const response = await fetch(`/api/open-houses?${params}`);
      const data = await response.json();
      setOpenHouses(data);
    } catch (error) {
      console.error('Error fetching open houses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRSVP = async (openHouse: OpenHouse) => {
    setSelectedOpenHouse(openHouse);
    setShowRSVPModal(true);
  };

  const submitRSVP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOpenHouse) return;

    setRSVPLoading(true);
    try {
      const response = await fetch(`/api/open-houses/${selectedOpenHouse.id}/rsvp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rsvpForm),
      });

      if (response.ok) {
        alert('RSVP submitted successfully! You will receive a confirmation email.');
        setShowRSVPModal(false);
        setRSVPForm({
          name: '',
          email: '',
          phone: '',
          guests: 1,
          message: ''
        });
        fetchOpenHouses(); // Refresh to update RSVP count
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to submit RSVP');
      }
    } catch (error) {
      console.error('Error submitting RSVP:', error);
      alert('Failed to submit RSVP');
    } finally {
      setRSVPLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const cities = [...new Set(openHouses.map(oh => oh.property.city))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading open houses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Open Houses</h1>
          <p className="mt-2 text-gray-600">
            Browse upcoming open houses and RSVP to visit properties
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Cities</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedCity('');
                  setSelectedDate('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Open Houses List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {openHouses.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No open houses found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your filters or check back later for new open houses.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {openHouses.map((openHouse) => (
              <div key={openHouse.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <img
                      className="h-48 w-48 object-cover"
                      src={openHouse.property.imageUrl}
                      alt={openHouse.property.address}
                    />
                  </div>
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {formatPrice(openHouse.property.price)}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {openHouse.property.beds} bed • {openHouse.property.baths} bath • {openHouse.property.sqft.toLocaleString()} sqft
                        </p>
                        <div className="flex items-center mt-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-1" />
                          {openHouse.property.address}, {openHouse.property.city}, {openHouse.property.state}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        {formatDate(openHouse.startTime)}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        {formatTime(openHouse.startTime)} - {formatTime(openHouse.endTime)}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="h-4 w-4 mr-2" />
                        {openHouse._count.rsvps} people attending
                      </div>
                    </div>

                    {openHouse.description && (
                      <p className="mt-3 text-sm text-gray-600">
                        {openHouse.description}
                      </p>
                    )}

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <img
                          className="h-8 w-8 rounded-full"
                          src={openHouse.agent.imageUrl}
                          alt={openHouse.agent.name}
                        />
                        <div className="ml-2">
                          <p className="text-sm font-medium text-gray-900">
                            {openHouse.agent.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {openHouse.agent.brokerage}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRSVP(openHouse)}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        RSVP
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RSVP Modal */}
      {showRSVPModal && selectedOpenHouse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              RSVP for Open House
            </h3>
            
            <div className="mb-4 p-3 bg-gray-50 rounded-md">
              <p className="font-medium text-gray-900">
                {selectedOpenHouse.property.address}
              </p>
              <p className="text-sm text-gray-600">
                {formatDate(selectedOpenHouse.startTime)} • {formatTime(selectedOpenHouse.startTime)} - {formatTime(selectedOpenHouse.endTime)}
              </p>
            </div>

            <form onSubmit={submitRSVP} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={rsvpForm.name}
                  onChange={(e) => setRSVPForm({ ...rsvpForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={rsvpForm.email}
                  onChange={(e) => setRSVPForm({ ...rsvpForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={rsvpForm.phone}
                  onChange={(e) => setRSVPForm({ ...rsvpForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Guests
                </label>
                <select
                  value={rsvpForm.guests}
                  onChange={(e) => setRSVPForm({ ...rsvpForm, guests: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message (Optional)
                </label>
                <textarea
                  rows={3}
                  value={rsvpForm.message}
                  onChange={(e) => setRSVPForm({ ...rsvpForm, message: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Any questions or special requests..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowRSVPModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rsvpLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {rsvpLoading ? 'Submitting...' : 'Submit RSVP'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpenHouses;