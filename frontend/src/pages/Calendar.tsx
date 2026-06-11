import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
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
  const { agent: parentAgent } = useOutletContext<{ agent: any }>();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [loading, setLoading] = useState(true);

  const agentId = parentAgent?.id;
  const token = parentAgent?.token;

  useEffect(() => {
    if (agentId && token) {
      fetchEvents();
      fetchBookingRequests();
    } else {
      setLoading(false);
    }
  }, [agentId, token, currentDate]);

  const fetchEvents = async () => {
    try {
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const response = await fetch(
        `/api/calendar/events/agent/${agentId}?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
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
        `/api/calendar/bookings/agent/${agentId}?status=pending`,
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
      const response = await fetch('/api/calendar/events', {
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
        `/api/calendar/bookings/${bookingId}/confirm`,
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
        `/api/calendar/bookings/${bookingId}/reject`,
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

  const getWeekDays = () => {
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return d;
    });
  };

  const getHoursInDay = () => Array.from({ length: 24 }, (_, i) => i);

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
    <div className="w-full px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 md:mb-8 gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Calendar</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your appointments and showings</p>
        </div>
        <Button onClick={() => setShowEventModal(true)} className="bg-red-600 hover:bg-red-700 w-full sm:w-auto">
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

      {/* View Toggle + Calendar Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (view === 'month') setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
              else if (view === 'week') { const d = new Date(currentDate); d.setDate(d.getDate() - 7); setCurrentDate(d); }
              else { const d = new Date(currentDate); d.setDate(d.getDate() - 1); setCurrentDate(d); }
            }}
          >
            Prev
          </Button>
          <h2 className="text-base sm:text-xl font-semibold whitespace-nowrap">
            {view === 'month' && `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
            {view === 'week' && (() => { const wk = getWeekDays(); return `${monthNames[wk[0].getMonth()]} ${wk[0].getDate()} - ${wk[6].getDate()}`; })()}
            {view === 'day' && `${monthNames[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`}
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (view === 'month') setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
              else if (view === 'week') { const d = new Date(currentDate); d.setDate(d.getDate() + 7); setCurrentDate(d); }
              else { const d = new Date(currentDate); d.setDate(d.getDate() + 1); setCurrentDate(d); }
            }}
          >
            Next
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>Today</Button>
        </div>
        <div className="flex bg-gray-100 rounded-lg p-1 w-full sm:w-auto">
          {(['month', 'week', 'day'] as const).map(v => (
            <Button
              key={v}
              variant={view === v ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView(v)}
              className={`flex-1 sm:flex-none ${view === v ? 'bg-red-600 hover:bg-red-700 text-white' : 'text-gray-600'}`}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Calendar Grid */}
      <Card className="p-2 sm:p-4 md:p-6 overflow-x-auto">
        {view === 'month' && (
          <>
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
              {dayNames.map(day => (
                <div key={day} className="text-center font-semibold text-gray-700 py-1 sm:py-2 text-xs sm:text-sm">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {getDaysInMonth().map((date, index) => {
                const dayEvents = getEventsForDay(date);
                const isToday = date && 
                  date.getDate() === new Date().getDate() &&
                  date.getMonth() === new Date().getMonth() &&
                  date.getFullYear() === new Date().getFullYear();

                return (
                  <div
                    key={index}
                    className={`min-h-[60px] sm:min-h-[100px] md:min-h-[120px] p-1 sm:p-2 border rounded-lg ${
                      date ? 'bg-white hover:bg-gray-50' : 'bg-gray-50'
                    } ${isToday ? 'border-red-500 border-2' : 'border-gray-200'}`}
                  >
                    {date && (
                      <>
                        <div className={`text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${isToday ? 'text-red-600' : 'text-gray-700'}`}>
                          {date.getDate()}
                        </div>
                        <div className="space-y-0.5 sm:space-y-1">
                          {dayEvents.slice(0, 2).map(event => (
                            <div
                              key={event.id}
                              onClick={() => setSelectedEvent(event)}
                              className={`text-[10px] sm:text-xs p-0.5 sm:p-1 rounded border cursor-pointer truncate ${
                                eventTypeColors[event.eventType] || eventTypeColors.personal
                              }`}
                            >
                              <div className="font-medium truncate">{event.title}</div>
                              {!event.allDay && (
                                <div className="text-[9px] sm:text-xs opacity-75 hidden sm:block">{formatTime(event.startTime)}</div>
                              )}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-[10px] sm:text-xs text-gray-500 pl-1">
                              +{dayEvents.length - 2} more
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {view === 'week' && (
          <>
            <div className="grid grid-cols-8 gap-0">
              <div className="border-r border-gray-200 pr-2"></div>
              {getWeekDays().map((day, di) => {
                const isToday = day.getDate() === new Date().getDate() && day.getMonth() === new Date().getMonth();
                return (
                  <div key={di} className={`text-center py-2 border-r border-gray-200 ${isToday ? 'text-red-600 font-bold' : 'text-gray-700 font-semibold'}`}>
                    <div className="text-xs">{dayNames[di]}</div>
                    <div className="text-lg">{day.getDate()}</div>
                  </div>
                );
              })}
              {getHoursInDay().map(hour => (
                <React.Fragment key={hour}>
                  <div className="text-xs text-gray-400 text-right pr-2 py-3 border-t border-gray-100">
                    {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                  </div>
                  {getWeekDays().map((day, di) => {
                    const hourEvents = events.filter(e => {
                      const ed = new Date(e.startTime);
                      return ed.getDate() === day.getDate() && ed.getMonth() === day.getMonth() && ed.getFullYear() === day.getFullYear() && ed.getHours() === hour;
                    });
                    return (
                      <div key={di} className="border-t border-r border-gray-100 p-1 min-h-[48px]">
                        {hourEvents.map(ev => (
                          <div key={ev.id} onClick={() => setSelectedEvent(ev)}
                            className={`text-xs p-1 rounded cursor-pointer ${eventTypeColors[ev.eventType] || 'bg-gray-100'}`}>
                            <div className="font-medium truncate">{ev.title}</div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </>
        )}

        {view === 'day' && (
          <div className="grid grid-cols-[80px_1fr] gap-0">
            {getHoursInDay().map(hour => {
              const hourEvents = events.filter(e => {
                const ed = new Date(e.startTime);
                return ed.getDate() === currentDate.getDate() && ed.getMonth() === currentDate.getMonth() && ed.getFullYear() === currentDate.getFullYear() && ed.getHours() === hour;
              });
              return (
                <React.Fragment key={hour}>
                  <div className="text-xs text-gray-400 text-right pr-3 py-4 border-t border-gray-100">
                    {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                  </div>
                  <div className="border-t border-gray-100 p-2 min-h-[60px]">
                    {hourEvents.map(ev => (
                      <div key={ev.id} onClick={() => setSelectedEvent(ev)}
                        className={`p-2 mb-1 rounded border cursor-pointer ${eventTypeColors[ev.eventType] || 'bg-gray-100'}`}>
                        <div className="font-medium">{ev.title}</div>
                        <div className="text-xs opacity-75">{formatTime(ev.startTime)} - {formatTime(ev.endTime)}</div>
                      </div>
                    ))}
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        )}
      </Card>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
          <Card className="max-w-lg w-full p-4 sm:p-6">
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
