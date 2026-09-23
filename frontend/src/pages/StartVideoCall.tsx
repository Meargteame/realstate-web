import React, { useState } from 'react';
import { useNavigate, useOutletContext, Link } from 'react-router-dom';
import { Video, Calendar, User, Mail, Home, Sparkles, Monitor, ShieldCheck, ArrowRight } from 'lucide-react';

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
        navigate(`/video-call/${data.id}`);
      } else {
        alert('Failed to initiate virtual showing room.');
      }
    } catch (error) {
      console.error('Error starting video call:', error);
      alert('Failed to initiate virtual showing room.');
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
          leadName: 'Private Client Session',
          leadEmail: 'client@private-showing.torra.com'
        })
      });

      if (response.ok) {
        const data = await response.json();
        navigate(`/video-call/${data.id}`);
      }
    } catch {
      alert('Failed to launch quick showing room.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-stone-200">
        <div className="text-[11px] uppercase tracking-[0.25em] text-[#b40101] font-semibold mb-1">
          Virtual Showing Protocol
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl text-stone-900 tracking-tight">
          Private Virtual Showing Room
        </h2>
        <p className="text-stone-500 text-xs sm:text-sm mt-0.5">
          Conduct confidential remote walkthroughs and architectural consultations in high-definition video.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Instant Session Card */}
        <div className="bg-white p-6 rounded-lg border border-stone-200/90 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="w-10 h-10 rounded-full bg-rose-50 text-[#b40101] flex items-center justify-center mb-3">
              <Video className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg text-stone-900">Instant Showing Room</h3>
            <p className="text-stone-500 text-xs mt-1 leading-relaxed">
              Instantly activate an encrypted virtual showing room and share the link with prospective buyers.
            </p>
          </div>
          <button
            onClick={handleQuickStart}
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#b40101] hover:bg-[#900101] text-white text-xs font-medium rounded transition-colors shadow-xs"
          >
            <Video className="w-3.5 h-3.5" />
            <span>Launch Instant Room</span>
          </button>
        </div>

        {/* Schedule Consultation Card */}
        <div className="bg-white p-6 rounded-lg border border-stone-200/90 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="w-10 h-10 rounded-full bg-stone-100 text-stone-700 flex items-center justify-center mb-3">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg text-stone-900">Coordinate on Calendar</h3>
            <p className="text-stone-500 text-xs mt-1 leading-relaxed">
              Schedule appointments in advance with automated confirmation notifications and calendar invites.
            </p>
          </div>
          <button
            onClick={() => navigate('/command/calendar')}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium rounded transition-colors shadow-xs"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Open Showing Schedule</span>
          </button>
        </div>
      </div>

      {/* Direct Invitation Form */}
      <div className="bg-white p-6 sm:p-8 rounded-lg border border-stone-200/90 shadow-xs space-y-6">
        <div>
          <h3 className="font-serif text-lg text-stone-900">Direct Client Showing Invitation</h3>
          <p className="text-stone-500 text-xs mt-0.5">
            Create a branded showing session tailored to a registered client.
          </p>
        </div>

        <form onSubmit={handleStartCall} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Client Name *
              </label>
              <input
                type="text"
                required
                value={formData.leadName}
                onChange={(e) => setFormData({ ...formData, leadName: e.target.value })}
                placeholder="e.g. Eleanor Vance"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded focus:outline-none focus:border-stone-900 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Client Email *
              </label>
              <input
                type="email"
                required
                value={formData.leadEmail}
                onChange={(e) => setFormData({ ...formData, leadEmail: e.target.value })}
                placeholder="client@domain.com"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded focus:outline-none focus:border-stone-900 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Associated Property Residence (Optional)
            </label>
            <input
              type="text"
              value={formData.propertyId}
              onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
              placeholder="e.g. 1200 Barton Springs Penthouse"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded focus:outline-none focus:border-stone-900 focus:bg-white"
            />
            <p className="text-[10px] text-stone-400 mt-1">
              Linking a residence embeds the property specification sheets directly in the meeting console.
            </p>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-medium text-white bg-[#b40101] hover:bg-[#900101] disabled:opacity-50 rounded transition-colors shadow-xs"
            >
              <span>{loading ? 'Initiating Room...' : 'Start Showing Consultation'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>

      {/* Protocol Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-stone-50/70 p-5 rounded-lg border border-stone-200/60">
          <Monitor className="w-5 h-5 text-[#b40101] mb-2" />
          <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider">
            High-Definition Stream
          </h4>
          <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">
            Uncompressed architectural rendering transmission for floorplans and 4K video walk-throughs.
          </p>
        </div>

        <div className="bg-stone-50/70 p-5 rounded-lg border border-stone-200/60">
          <Monitor className="w-5 h-5 text-stone-700 mb-2" />
          <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider">
            Integrated Screen Sharing
          </h4>
          <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">
            Seamlessly project legal contracts, surveys, and comparative market valuations in real-time.
          </p>
        </div>

        <div className="bg-stone-50/70 p-5 rounded-lg border border-stone-200/60">
          <ShieldCheck className="w-5 h-5 text-emerald-700 mb-2" />
          <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider">
            Confidential & Encrypted
          </h4>
          <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">
            Encrypted WebRTC peer channels protecting high-profile client identities and transaction terms.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StartVideoCall;
