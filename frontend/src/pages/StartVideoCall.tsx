import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Video, Calendar, User, Mail, Home } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

const StartVideoCall: React.FC = () => {
  const { agent: parentAgent } = useOutletContext<{ agent: any }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    leadName: '',
    leadEmail: '',
    propertyId: ''
  });

  const agentId = parentAgent?.id;
  const token = parentAgent?.token;

  const handleStartCall = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create video call
      const response = await fetch('/api/video/calls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          agentId,
          leadName: formData.leadName,
          leadEmail: formData.leadEmail,
          propertyId: formData.propertyId || null
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Navigate to video call page
        navigate(`/video-call/${data.id}`);
      } else {
        alert('Failed to start video call');
      }
    } catch (error) {
      console.error('Error starting video call:', error);
      alert('Failed to start video call');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickStart = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/video/calls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          agentId,
          leadName: 'Quick Call',
          leadEmail: 'quick@call.com'
        })
      });

      if (response.ok) {
        const data = await response.json();
        navigate(`/video-call/${data.id}`);
      }
    } catch (error) {
      console.error('Error starting quick call:', error);
      alert('Failed to start video call');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Video className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Start Video Call</h1>
          <p className="text-gray-600">Connect with clients through video</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Quick Start */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Quick Start</h2>
            <p className="text-gray-600 mb-6">
              Start an instant video call without scheduling
            </p>
            <Button
              onClick={handleQuickStart}
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              <Video className="w-4 h-4 mr-2" />
              Start Instant Call
            </Button>
          </Card>

          {/* Schedule Call */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Schedule Call</h2>
            <p className="text-gray-600 mb-6">
              Schedule a video call for later
            </p>
            <Button
              onClick={() => navigate('/command/calendar')}
              variant="outline"
              className="w-full"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Go to Calendar
            </Button>
          </Card>
        </div>

        {/* Scheduled Call Form */}
        <Card className="p-8 mt-6">
          <h2 className="text-2xl font-bold mb-6">Start Call with Client</h2>
          
          <form onSubmit={handleStartCall} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Client Name *
              </label>
              <Input
                type="text"
                required
                value={formData.leadName}
                onChange={(e) => setFormData({ ...formData, leadName: e.target.value })}
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                Client Email *
              </label>
              <Input
                type="email"
                required
                value={formData.leadEmail}
                onChange={(e) => setFormData({ ...formData, leadEmail: e.target.value })}
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Home className="w-4 h-4 inline mr-1" />
                Property ID (Optional)
              </label>
              <Input
                type="text"
                value={formData.propertyId}
                onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                placeholder="Property ID for virtual tour"
              />
              <p className="text-sm text-gray-500 mt-1">
                Add a property ID to start a virtual property tour
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              {loading ? 'Starting Call...' : 'Start Video Call'}
            </Button>
          </form>
        </Card>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <Card className="p-6 text-center">
            <Video className="w-8 h-8 text-red-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">HD Video</h3>
            <p className="text-sm text-gray-600">
              Crystal clear video quality
            </p>
          </Card>

          <Card className="p-6 text-center">
            <Calendar className="w-8 h-8 text-red-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Screen Sharing</h3>
            <p className="text-sm text-gray-600">
              Share property listings and documents
            </p>
          </Card>

          <Card className="p-6 text-center">
            <Home className="w-8 h-8 text-red-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Virtual Tours</h3>
            <p className="text-sm text-gray-600">
              Show properties remotely
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StartVideoCall;
