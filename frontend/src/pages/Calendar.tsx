import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, Plus, X, Check, AlertCircle } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  eventType: string;
  status: string;
  allDay: boolean;
}

interface BookingRequest {
  id: string;
  leadName: string;
  leadEmail: string;
  leadPhone?: string;
  requestedDate: string;
  requestedTime: string;
  duration: number;
  message?: string;
  status: string;
  createdAt: string;
}

const Calendar: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [loading, setLoading] = useState(true);

  const agentId = localStorage.getItem('agentId');
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (agentId && token) {
      fetchEvents();
      fetchBookingRequests();
    }
  }, [agentId, token, currentDate]);

  const fetchEvents = async () => {
    try {
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const response = await fetch(
        `http://localhost:5000/api/calendar/events/agent/${agentId}?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingRequests = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/calendar/bookings/agent/${agentId}?status=pending`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setBookingRequests(data);
      }
    } catch (error) {
      console.error('Error fetching booking requests:', error);
    }
  };

  const handleCreateEvent = async (eventData: any) => {
    try {
      const response = await fetch('http://localhost:5000/api/calendar/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...eventData,
          agentId
        })
      });

      if (response.ok) {
        fetchEvents();
        setShowEventModal(false);
      }
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const handleConfirmBooking = async (bookingId: string, startTime: string, endTime: string) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/calendar/bookings/${bookingId}/confirm`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ startTime, endTime })
        }
      );

      if (response.ok) {
        fetchEvents();
        fetchBookingRequests();
      }
    } catch (error) {
      console.error('Error confirming booking:', error);
    }
  };

  const handleRejectBooking = async (bookingId: string) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/calendar/bookings/${bookingId}/reject`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        fetchBookingRequests();
      }
    } catch (error) {
      console.error('Error rejecting booking:', error);
    }
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getEventsForDay = (date: Date | null) => {
    if (!date) return [];
    
    return events.filter(event => {
      const eventDate = new Date(event.startTime);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const eventTypeColors: Record<string, string> = {
    showing: 'bg-blue-100 text-blue-800 border-blue-300',
    appointment: 'bg-green-100 text-green-800 border-green-300',
    open_house: 'bg-purple-100 text-purple-800 border-purple-300',
    meeting: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    personal: 'bg-gray-100 text-gray-800 border-gray-300'
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-600 mt-1">Manage your appointments and showings</p>
        </div>
        <Button onClick={() => setShowEventModal(true)} className="bg-red-600 hover:bg-red-700">
          <Plus className="w-4 h-4 mr-2" />
          New Event
        </Button>
      </div>

      {/* Booking Requests Alert */}
      {bookingRequests.length > 0 && (
        <Card className="p-4 mb-6 bg-yellow-50 border-yellow-200">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900">
                {bookingRequests.length} Pending Booking Request{bookingRequests.length !== 1 ? 's' : ''}
              </h3>
              <div className="mt-3 space-y-3">
                {bookingRequests.map(request => (
                  <div key={request.id} className="bg-white p-3 rounded-lg border border-yellow-200">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{request.leadName}</p>
                        <p className="text-sm text-gray-600">{request.leadEmail}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {new Date(request.requestedDate).toLocaleDateString()} at {request.requestedTime}
                        </p>
                        {request.message && (
                          <p className="text-sm text-gray-600 mt-1 italic">"{request.message}"</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            const requestedDateTime = new Date(request.requestedDate);
                            const [hours, minutes] = request.requestedTime.split(':');
                            requestedDateTime.setHours(parseInt(hours), parseInt(minutes));
                            const endTime = new Date(requestedDateTime.getTime() + request.duration * 60000);
                            handleConfirmBooking(request.id, requestedDateTime.toISOString(), endTime.toISOString());
                          }}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRejectBooking(request.id)}
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
          >
            Previous
          </Button>
          <h2 className="text-xl font-semibold">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <Button
            variant="outline"
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
          >
            Next
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentDate(new Date())}
          >
            Today
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card className="p-6">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {dayNames.map(day => (
            <div key={day} className="text-center font-semibold text-gray-700 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-2">
          {getDaysInMonth().map((date, index) => {
            const dayEvents = getEventsForDay(date);
            const isToday = date && 
              date.getDate() === new Date().getDate() &&
              date.getMonth() === new Date().getMonth() &&
              date.getFullYear() === new Date().getFullYear();

            return (
              <div
                key={index}
                className={`min-h-[120px] p-2 border rounded-lg ${
                  date ? 'bg-white hover:bg-gray-50' : 'bg-gray-50'
                } ${isToday ? 'border-red-500 border-2' : 'border-gray-200'}`}
              >
                {date && (
                  <>
                    <div className={`text-sm font-medium mb-2 ${isToday ? 'text-red-600' : 'text-gray-700'}`}>
                      {date.getDate()}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map(event => (
                        <div
                          key={event.id}
                          onClick={() => setSelectedEvent(event)}
                          className={`text-xs p-1 rounded border cursor-pointer ${
                            eventTypeColors[event.eventType] || eventTypeColors.personal
                          }`}
                        >
                          <div className="font-medium truncate">{event.title}</div>
                          {!event.allDay && (
                            <div className="text-xs opacity-75">{formatTime(event.startTime)}</div>
                          )}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-gray-500 pl-1">
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-lg w-full p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-bold">{selectedEvent.title}</h3>
              <button onClick={() => setSelectedEvent(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center text-gray-600">
                <Clock className="w-4 h-4 mr-2" />
                <span>
                  {formatTime(selectedEvent.startTime)} - {formatTime(selectedEvent.endTime)}
                </span>
              </div>
              
              {selectedEvent.location && (
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{selectedEvent.location}</span>
                </div>
              )}
              
              {selectedEvent.description && (
                <p className="text-gray-600 mt-4">{selectedEvent.description}</p>
              )}
              
              <div className="mt-4">
                <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                  eventTypeColors[selectedEvent.eventType] || eventTypeColors.personal
                }`}>
                  {selectedEvent.eventType.replace('_', ' ')}
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Calendar;
