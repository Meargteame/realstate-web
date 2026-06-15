import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, Mail, Phone, MessageSquare, CheckCircle } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';

interface Agent {
  id: string;
  name: string;
  imageUrl: string;
  brokerage: string;
  phone: string;
  email: string;
}

interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

const BookAppointment: React.FC = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  
  const [agent, setAgent] = useState<Agent | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    leadName: '',
    leadEmail: '',
    leadPhone: '',
    message: '',
    serviceType: 'showing'
  });

  useEffect(() => {
    if (agentId) {
      fetchAgent();
    }
  }, [agentId]);

  useEffect(() => {
    if (selectedDate && agentId) {
      fetchAvailableSlots();
    }
  }, [selectedDate, agentId]);

  const fetchAgent = async () => {
    try {
      const response = await fetch(`/api/agents/${agentId}`);
      if (response.ok) {
        const data = await response.json();
        setAgent(data);
      }
    } catch (error) {
      console.error('Error fetching agent:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      const response = await fetch(
        `/api/calendar/availability/${agentId}/slots?date=${selectedDate}&duration=60`
      );
      if (response.ok) {
        const data = await response.json();
        setAvailableSlots(data.slots || []);
      }
    } catch (error) {
      console.error('Error fetching available slots:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation (mirrors the server checks for fast feedback).
    if (!formData.leadName || formData.leadName.trim().length < 2) {
      alert('Please enter your full name.');
      return;
    }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.leadEmail);
    if (!emailOk) {
      alert('Please enter a valid email address.');
      return;
    }
    if (formData.leadPhone && formData.leadPhone.replace(/[^\d]/g, '').length < 7) {
      alert('Please enter a valid phone number, or leave it blank.');
      return;
    }
    if (!selectedSlot) {
      alert('Please select a time slot');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/calendar/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          agentId,
          leadName: formData.leadName.trim(),
          leadEmail: formData.leadEmail.trim(),
          leadPhone: formData.leadPhone,
          requestedDate: selectedDate,
          requestedTime: new Date(selectedSlot.startTime).toTimeString().slice(0, 5),
          duration: 60,
          message: formData.message,
          serviceType: formData.serviceType,
          // Pass the browser's timezone so the agent sees the request in context.
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        })
      });

      if (response.ok) {
        setSuccess(true);
      } else {
        // Surface the server's specific message (e.g. duplicate slot, past date).
        const err = await response.json().catch(() => ({}));
        alert(err.error || 'Failed to book appointment. Please try again.');
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Failed to book appointment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 60); // 60 days in advance
    return maxDate.toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 text-center">
          <p className="text-gray-600">Agent not found</p>
          <Button onClick={() => navigate('/')} className="mt-4">
            Go Home
          </Button>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Request Sent!</h2>
          <p className="text-gray-600 mb-6">
            {agent.name} will review your request and confirm your appointment shortly.
            You'll receive a confirmation email at {formData.leadEmail}.
          </p>
          <Button onClick={() => navigate('/')} className="bg-red-600 hover:bg-red-700">
            Back to Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Agent Info */}
        <Card className="p-6 mb-8">
          <div className="flex items-center gap-4">
            <img
              src={agent.imageUrl}
              alt={agent.name}
              className="w-20 h-20 rounded-full object-cover"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{agent.name}</h1>
              <p className="text-gray-600">{agent.brokerage}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  {agent.phone}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {agent.email}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Booking Form */}
        <Card className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Book an Appointment</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  Your Name *
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
                  Email *
                </label>
                <Input
                  type="email"
                  required
                  value={formData.leadEmail}
                  onChange={(e) => setFormData({ ...formData, leadEmail: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-1" />
                Phone Number
              </label>
              <Input
                type="tel"
                value={formData.leadPhone}
                onChange={(e) => setFormData({ ...formData, leadPhone: e.target.value })}
                placeholder="(555) 123-4567"
              />
            </div>

            {/* Service Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Appointment Type
              </label>
              <select
                value={formData.serviceType}
                onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="showing">Property Showing</option>
                <option value="consultation">Consultation</option>
                <option value="appraisal">Appraisal</option>
                <option value="inspection">Inspection</option>
              </select>
            </div>

            {/* Date Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Select Date *
              </label>
              <Input
                type="date"
                required
                min={getMinDate()}
                max={getMaxDate()}
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedSlot(null);
                }}
              />
            </div>

            {/* Time Slot Selection */}
            {selectedDate && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Select Time *
                </label>
                {availableSlots.length > 0 ? (
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                    {availableSlots.map((slot, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                          selectedSlot === slot
                            ? 'border-red-600 bg-red-50 text-red-700'
                            : 'border-gray-200 hover:border-red-300 text-gray-700'
                        }`}
                      >
                        {formatTime(slot.startTime)}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">
                    No available time slots for this date. Please select another date.
                  </p>
                )}
              </div>
            )}

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MessageSquare className="w-4 h-4 inline mr-1" />
                Message (Optional)
              </label>
              <Textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Tell us what you're looking for..."
                rows={4}
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={submitting || !selectedSlot}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300"
            >
              {submitting ? 'Sending Request...' : 'Request Appointment'}
            </Button>

            <p className="text-sm text-gray-500 text-center">
              * Required fields. Your appointment will be confirmed by the agent.
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default BookAppointment;
