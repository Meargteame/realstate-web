import React, { useState, useEffect } from 'react';
import { Play, Maximize, Eye, ExternalLink, Plus, Edit, Trash2 } from 'lucide-react';

interface VirtualTour {
  id: string;
  type: 'matterport' | 'youtube' | 'video' | '360photo';
  url: string;
  title?: string;
  description?: string;
  isPrimary: boolean;
}

interface VirtualTourViewerProps {
  propertyId: string;
  isAgent?: boolean;
  agentId?: string;
}

const VirtualTourViewer: React.FC<VirtualTourViewerProps> = ({ 
  propertyId, 
  isAgent = false, 
  agentId 
}) => {
  const [tours, setTours] = useState<VirtualTour[]>([]);
  const [selectedTour, setSelectedTour] = useState<VirtualTour | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [tourForm, setTourForm] = useState({
    type: 'matterport' as const,
    url: '',
    title: '',
    description: '',
    isPrimary: false
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTours();
  }, [propertyId]);

  const fetchTours = async () => {
    try {
      const response = await fetch(`/api/virtual-tours/property/${propertyId}`);
      const data = await response.json();
      setTours(data);
      
      // Set primary tour as selected, or first tour if no primary
      const primaryTour = data.find((tour: VirtualTour) => tour.isPrimary);
      setSelectedTour(primaryTour || data[0] || null);
    } catch (error) {
      console.error('Error fetching virtual tours:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTour = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(`/api/virtual-tours/property/${propertyId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tourForm),
      });

      if (response.ok) {
        setShowAddForm(false);
        setTourForm({
          type: 'matterport',
          url: '',
          title: '',
          description: '',
          isPrimary: false
        });
        fetchTours();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add virtual tour');
      }
    } catch (error) {
      console.error('Error adding virtual tour:', error);
      alert('Failed to add virtual tour');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteTour = async (tourId: string) => {
    if (!confirm('Are you sure you want to delete this virtual tour?')) return;

    try {
      const response = await fetch(`/api/virtual-tours/${tourId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchTours();
        if (selectedTour?.id === tourId) {
          setSelectedTour(null);
        }
      } else {
        alert('Failed to delete virtual tour');
      }
    } catch (error) {
      console.error('Error deleting virtual tour:', error);
      alert('Failed to delete virtual tour');
    }
  };

  const setPrimaryTour = async (tourId: string) => {
    try {
      const response = await fetch(`/api/virtual-tours/${tourId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isPrimary: true }),
      });

      if (response.ok) {
        fetchTours();
      } else {
        alert('Failed to set primary tour');
      }
    } catch (error) {
      console.error('Error setting primary tour:', error);
      alert('Failed to set primary tour');
    }
  };

  const renderTourViewer = (tour: VirtualTour) => {
    const baseClasses = "w-full h-96 rounded-lg";

    switch (tour.type) {
      case 'matterport':
        return (
          <iframe
            src={tour.url}
            className={baseClasses}
            frameBorder="0"
            allowFullScreen
            title={tour.title || 'Matterport Virtual Tour'}
          />
        );

      case 'youtube':
        // Convert YouTube URL to embed format
        let embedUrl = tour.url;
        if (tour.url.includes('youtube.com/watch?v=')) {
          const videoId = tour.url.split('v=')[1]?.split('&')[0];
          embedUrl = `https://www.youtube.com/embed/${videoId}`;
        } else if (tour.url.includes('youtu.be/')) {
          const videoId = tour.url.split('youtu.be/')[1]?.split('?')[0];
          embedUrl = `https://www.youtube.com/embed/${videoId}`;
        }

        return (
          <iframe
            src={embedUrl}
            className={baseClasses}
            frameBorder="0"
            allowFullScreen
            title={tour.title || 'YouTube Virtual Tour'}
          />
        );

      case 'video':
        return (
          <video
            src={tour.url}
            className={baseClasses}
            controls
            poster=""
          >
            Your browser does not support the video tag.
          </video>
        );

      case '360photo':
        return (
          <div className={`${baseClasses} bg-gray-100 flex items-center justify-center`}>
            <div className="text-center">
              <Eye className="mx-auto h-12 w-12 text-gray-400 mb-2" />
              <p className="text-gray-600">360° Photo Viewer</p>
              <p className="text-sm text-gray-500 mt-1">
                Click to view in full screen
              </p>
              <button
                onClick={() => window.open(tour.url, '_blank')}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <ExternalLink className="h-4 w-4 inline mr-1" />
                Open 360° View
              </button>
            </div>
          </div>
        );

      default:
        return (
          <div className={`${baseClasses} bg-gray-100 flex items-center justify-center`}>
            <p className="text-gray-500">Unsupported tour type</p>
          </div>
        );
    }
  };

  const getTourTypeIcon = (type: string) => {
    switch (type) {
      case 'matterport':
        return <Maximize className="h-4 w-4" />;
      case 'youtube':
      case 'video':
        return <Play className="h-4 w-4" />;
      case '360photo':
        return <Eye className="h-4 w-4" />;
      default:
        return <Eye className="h-4 w-4" />;
    }
  };

  const getTourTypeLabel = (type: string) => {
    switch (type) {
      case 'matterport':
        return 'Matterport 3D';
      case 'youtube':
        return 'YouTube Video';
      case 'video':
        return 'Video Tour';
      case '360photo':
        return '360° Photo';
      default:
        return 'Virtual Tour';
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-96 bg-gray-200 rounded-lg mb-4"></div>
        <div className="flex space-x-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 w-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (tours.length === 0 && !isAgent) {
    return null; // Don't show anything if no tours and not an agent
  }

  return (
    <div className="space-y-4">
      {/* Main Tour Viewer */}
      {selectedTour ? (
        <div className="space-y-2">
          {renderTourViewer(selectedTour)}
          {selectedTour.title && (
            <h3 className="text-lg font-semibold text-gray-900">
              {selectedTour.title}
            </h3>
          )}
          {selectedTour.description && (
            <p className="text-gray-600">{selectedTour.description}</p>
          )}
        </div>
      ) : (
        <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Eye className="mx-auto h-12 w-12 text-gray-400 mb-2" />
            <p className="text-gray-600">No virtual tours available</p>
            {isAgent && (
              <button
                onClick={() => setShowAddForm(true)}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Virtual Tour
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tour Thumbnails */}
      {tours.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">Virtual Tours</h4>
            {isAgent && (
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Tour
              </button>
            )}
          </div>

          <div className="flex space-x-2 overflow-x-auto pb-2">
            {tours.map((tour) => (
              <div
                key={tour.id}
                className={`flex-shrink-0 relative group cursor-pointer ${
                  selectedTour?.id === tour.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedTour(tour)}
              >
                <div className="w-32 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                  {getTourTypeIcon(tour.type)}
                </div>
                
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all duration-200 flex items-center justify-center">
                  <Play className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </div>

                {tour.isPrimary && (
                  <div className="absolute top-1 left-1">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-600 text-white">
                      Primary
                    </span>
                  </div>
                )}

                {isAgent && (
                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="flex space-x-1">
                      {!tour.isPrimary && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPrimaryTour(tour.id);
                          }}
                          className="p-1 bg-white rounded shadow-sm hover:bg-gray-50"
                          title="Set as primary"
                        >
                          <Eye className="h-3 w-3 text-gray-600" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTour(tour.id);
                        }}
                        className="p-1 bg-white rounded shadow-sm hover:bg-gray-50"
                        title="Delete tour"
                      >
                        <Trash2 className="h-3 w-3 text-red-600" />
                      </button>
                    </div>
                  </div>
                )}

                <div className="mt-1">
                  <p className="text-xs text-gray-600 truncate">
                    {getTourTypeLabel(tour.type)}
                  </p>
                  {tour.title && (
                    <p className="text-xs font-medium text-gray-900 truncate">
                      {tour.title}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Tour Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Add Virtual Tour
            </h3>

            <form onSubmit={addTour} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tour Type *
                </label>
                <select
                  value={tourForm.type}
                  onChange={(e) => setTourForm({ ...tourForm, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="matterport">Matterport 3D Tour</option>
                  <option value="youtube">YouTube Video</option>
                  <option value="video">Video File</option>
                  <option value="360photo">360° Photo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL *
                </label>
                <input
                  type="url"
                  required
                  value={tourForm.url}
                  onChange={(e) => setTourForm({ ...tourForm, url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={
                    tourForm.type === 'matterport' ? 'https://my.matterport.com/show/?m=...' :
                    tourForm.type === 'youtube' ? 'https://youtube.com/watch?v=...' :
                    'https://example.com/tour.mp4'
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={tourForm.title}
                  onChange={(e) => setTourForm({ ...tourForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Living Room 360° View"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={tourForm.description}
                  onChange={(e) => setTourForm({ ...tourForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description of the tour..."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPrimary"
                  checked={tourForm.isPrimary}
                  onChange={(e) => setTourForm({ ...tourForm, isPrimary: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isPrimary" className="ml-2 block text-sm text-gray-900">
                  Set as primary tour
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Adding...' : 'Add Tour'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VirtualTourViewer;