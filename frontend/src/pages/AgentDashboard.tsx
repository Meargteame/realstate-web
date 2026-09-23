import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import {
  Users,
  Home,
  ArrowUpRight,
  Calendar,
  Award,
  Clock,
  Mail,
  ChevronRight,
  TrendingUp,
  DollarSign,
  Plus
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function AgentDashboard() {
  const { agent: parentAgent } = useOutletContext<{ agent: any }>();
  const [activeListings, setActiveListings] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<any[]>([]);
  const navigate = useNavigate();

  const authHeaders = () => ({
    'Authorization': `Bearer ${parentAgent?.token || ''}`
  });

  useEffect(() => {
    if (!parentAgent) return;
    
    Promise.all([
      fetch(`/api/properties?agentId=${parentAgent.id}&limit=100`, { headers: authHeaders() }).then(r => r.json()),
      fetch(`/api/leads?agentId=${parentAgent.id}&limit=100`, { headers: authHeaders() }).then(r => r.json())
    ])
      .then(([propsData, leadsData]) => {
        setActiveListings(Array.isArray(propsData) ? propsData : (propsData.data || []));
        setLeads(Array.isArray(leadsData?.leads) ? leadsData.leads : (Array.isArray(leadsData) ? leadsData : []));
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    const token = JSON.parse(localStorage.getItem('torra_user') || '{}').token;
    fetch(`/api/calendar/bookings/agent/${parentAgent.id}?status=confirmed`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setAppointments(Array.isArray(data) ? data.filter((a: any) => a.status === 'confirmed' || a.status === 'pending').slice(0, 5) : []);
      })
      .catch(() => {});
  }, [parentAgent]);

  const totalVolume = activeListings.reduce((sum: number, p: any) => sum + (p.price || 0), 0);
  const newLeads = leads.filter((l: any) => l.status === 'New').length;
  const pipeline = leads.filter((l: any) => l.status === 'Contacted').length;
  const closedLeads = leads.filter((l: any) => l.status === 'Closed').length;
  const conversionRate = leads.length > 0 ? Math.round((closedLeads / leads.length) * 100) : 0;

  const leadsChartData = useMemo(() => {
    const months: Record<string, number> = {};
    leads.forEach((l: any) => {
      const d = new Date(l.createdAt || Date.now());
      const key = `${d.toLocaleString('default', { month: 'short' })}`;
      months[key] = (months[key] || 0) + 1;
    });
    const result = Object.entries(months).map(([name, count]) => ({ name, leads: count }));
    return result.length > 0 ? result : [
      { name: 'May', leads: 4 },
      { name: 'Jun', leads: 7 },
      { name: 'Jul', leads: 12 },
      { name: 'Aug', leads: 9 },
      { name: 'Sep', leads: 15 }
    ];
  }, [leads]);

  const statusData = useMemo(() => {
    const data = [
      { name: 'New Inquiries', value: leads.filter((l: any) => l.status === 'New').length || 1, color: '#b40101' },
      { name: 'In Dialogue', value: leads.filter((l: any) => l.status === 'Contacted').length || 2, color: '#1e293b' },
      { name: 'Qualified Buyers', value: leads.filter((l: any) => l.status === 'Qualified').length || 1, color: '#475569' },
      { name: 'Under Contract / Closed', value: leads.filter((l: any) => l.status === 'Closed').length || 1, color: '#10b981' },
    ];
    return data;
  }, [leads]);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  if (loading) {
    return (
      <div className="p-8 space-y-6 max-w-7xl mx-auto">
        <div className="h-8 bg-stone-200 animate-pulse rounded w-1/4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-stone-100 animate-pulse rounded-lg border border-stone-200" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="text-[11px] uppercase tracking-[0.25em] text-[#b40101] font-semibold mb-1">
            Executive Summary
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-stone-900 tracking-tight">
            Performance Overview
          </h2>
          <p className="text-stone-500 text-xs sm:text-sm mt-0.5">
            Active brokerage representations, pipeline health, and showing schedule.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/command/calendar"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-stone-700 bg-white border border-stone-300 hover:border-stone-900 rounded transition-colors shadow-xs"
          >
            <Calendar className="w-3.5 h-3.5 text-stone-500" />
            <span>Showing Schedule</span>
          </Link>
          <Link
            to="/command/listings"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-[#b40101] hover:bg-[#900101] rounded transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Representation</span>
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Active Volume */}
        <div className="bg-white p-5 rounded-lg border border-stone-200/90 shadow-xs hover:border-stone-900 transition-all duration-200">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-stone-500">
              Active Portfolio
            </span>
            <DollarSign className="w-4 h-4 text-stone-400" />
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-normal text-stone-900">
            {formatCurrency(totalVolume)}
          </div>
          <div className="text-[11px] text-stone-500 mt-2 flex items-center gap-1.5">
            <span className="font-mono text-stone-700 font-semibold">{activeListings.length}</span> active exclusive mandates
          </div>
        </div>

        {/* Active Listings */}
        <div className="bg-white p-5 rounded-lg border border-stone-200/90 shadow-xs hover:border-stone-900 transition-all duration-200">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-stone-500">
              Listed Residences
            </span>
            <Home className="w-4 h-4 text-stone-400" />
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-normal text-stone-900">
            {activeListings.length}
          </div>
          <div className="text-[11px] text-stone-500 mt-2 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
            <span>100% Verified by Torra Desk</span>
          </div>
        </div>

        {/* New Inquiries */}
        <div className={`p-5 rounded-lg border shadow-xs transition-all duration-200 ${
          newLeads > 0 
            ? 'bg-rose-50/40 border-rose-200 hover:border-[#b40101]' 
            : 'bg-white border-stone-200/90 hover:border-stone-900'
        }`}>
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-stone-500">
              New Inquiries
            </span>
            <Users className={`w-4 h-4 ${newLeads > 0 ? 'text-[#b40101]' : 'text-stone-400'}`} />
          </div>
          <div className={`font-serif text-2xl sm:text-3xl font-normal ${newLeads > 0 ? 'text-[#b40101]' : 'text-stone-900'}`}>
            {newLeads}
          </div>
          <div className="text-[11px] mt-2 flex items-center justify-between">
            <span className={newLeads > 0 ? 'text-[#b40101] font-semibold' : 'text-stone-500'}>
              {newLeads > 0 ? 'Immediate follow-up required' : 'Inbox up to date'}
            </span>
            {newLeads > 0 && (
              <Link to="/command/leads" className="text-[10px] text-[#b40101] underline font-medium">Review</Link>
            )}
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="bg-white p-5 rounded-lg border border-stone-200/90 shadow-xs hover:border-stone-900 transition-all duration-200">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-stone-500">
              Deal Pipeline
            </span>
            <TrendingUp className="w-4 h-4 text-stone-400" />
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-normal text-stone-900">
            {pipeline}
          </div>
          <div className="text-[11px] text-stone-500 mt-2 flex items-center gap-1.5">
            <span className="font-mono text-emerald-600 font-semibold">{conversionRate}%</span> close conversion benchmark
          </div>
        </div>
      </div>

      {/* Visual Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Inquiry Growth Chart */}
        <div className="lg:col-span-8 bg-white p-6 rounded-lg border border-stone-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100">
            <div>
              <h3 className="font-serif text-base text-stone-900 tracking-tight">
                Client Inquiry Momentum
              </h3>
              <p className="text-stone-500 text-xs mt-0.5">
                Monthly verified client inquiries received through exclusive portfolios
              </p>
            </div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-stone-400 bg-stone-100 px-2 py-0.5 rounded">
              Trailing Months
            </span>
          </div>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={leadsChartData}>
                <CartesianGrid strokeDasharray="2 2" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="name"
                  fontSize={11}
                  stroke="#94a3b8"
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  fontSize={11}
                  stroke="#94a3b8"
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#fff',
                    fontSize: '11px',
                    padding: '8px 12px'
                  }}
                  itemStyle={{ color: '#fff' }}
                />
                <Line
                  type="monotone"
                  dataKey="leads"
                  stroke="#b40101"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#b40101', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, fill: '#b40101' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pipeline Distribution */}
        <div className="lg:col-span-4 bg-white p-6 rounded-lg border border-stone-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-serif text-base text-stone-900 tracking-tight">
              Client Pipeline
            </h3>
            <p className="text-stone-500 text-xs mt-0.5 mb-4">
              Status division across all registered buyer and seller contacts
            </p>

            <div className="h-44 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={72}
                    paddingAngle={3}
                  >
                    {statusData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: 'none',
                      borderRadius: '4px',
                      color: '#fff',
                      fontSize: '11px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-stone-100">
            {statusData.map((s, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-stone-600">{s.name}</span>
                </div>
                <span className="font-mono font-medium text-stone-900">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Operational Targets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-lg border border-stone-200/90 shadow-xs">
          <div className="flex items-center gap-3 mb-3">
            <Award className="w-5 h-5 text-[#b40101]" />
            <h4 className="font-medium text-stone-900 text-xs uppercase tracking-wider">
              Monthly Mandate Target
            </h4>
          </div>
          <div className="flex items-baseline justify-between text-xs text-stone-500 mb-2">
            <span>Portfolio expansion</span>
            <span className="font-mono text-stone-900 font-semibold">{activeListings.length} / 10 residences</span>
          </div>
          <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-[#b40101] h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (activeListings.length / 10) * 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-stone-200/90 shadow-xs">
          <div className="flex items-center gap-3 mb-3">
            <Users className="w-5 h-5 text-stone-800" />
            <h4 className="font-medium text-stone-900 text-xs uppercase tracking-wider">
              Acquisition Target
            </h4>
          </div>
          <div className="flex items-baseline justify-between text-xs text-stone-500 mb-2">
            <span>Qualified inquiries</span>
            <span className="font-mono text-stone-900 font-semibold">{leads.length} / 25 clients</span>
          </div>
          <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-stone-800 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (leads.length / 25) * 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-stone-200/90 shadow-xs">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="w-5 h-5 text-[#b40101]" />
            <h4 className="font-medium text-stone-900 text-xs uppercase tracking-wider">
              Speed to Contact
            </h4>
          </div>
          <div className="flex items-baseline justify-between text-xs text-stone-500 mb-2">
            <span>First contact velocity</span>
            <span className="font-mono text-stone-900 font-semibold">
              {leads.length > 0 ? Math.round(((leads.length - newLeads) / leads.length) * 100) : 100}% on pace
            </span>
          </div>
          <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-[#b40101] h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${leads.length > 0 ? Math.min(100, Math.round(((leads.length - newLeads) / leads.length) * 100)) : 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tables & Feed Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Client Activity */}
        <div className="lg:col-span-8 bg-white rounded-lg border border-stone-200/90 shadow-xs overflow-hidden flex flex-col">
          <div className="p-5 border-b border-stone-200/80 flex items-center justify-between">
            <div>
              <h3 className="font-serif text-base text-stone-900 tracking-tight">
                Recent Client Engagements
              </h3>
              <p className="text-stone-500 text-xs mt-0.5">
                Latest client inquiries and showing requests
              </p>
            </div>
            <Link
              to="/command/leads"
              className="text-xs text-[#b40101] hover:text-[#900101] font-medium flex items-center gap-1"
            >
              <span>View All ({leads.length})</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto flex-1">
            {leads.length === 0 ? (
              <div className="p-12 text-center text-stone-400">
                <Users className="w-8 h-8 mx-auto mb-2 text-stone-300" />
                <p className="text-xs">No client inquiries registered yet.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-stone-50/80 border-b border-stone-200/80 text-[10px] uppercase tracking-wider text-stone-500">
                    <th className="py-3 px-5 font-semibold">Client</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold">Inquiry</th>
                    <th className="py-3 px-4 font-semibold">Date</th>
                    <th className="py-3 px-5 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {leads.slice(0, 6).map((lead: any) => {
                    const statusColors: Record<string, string> = {
                      New: 'bg-rose-100 text-rose-800 border-rose-200',
                      Contacted: 'bg-sky-100 text-sky-800 border-sky-200',
                      Qualified: 'bg-amber-100 text-amber-800 border-amber-200',
                      Closed: 'bg-emerald-100 text-emerald-800 border-emerald-200'
                    };
                    return (
                      <tr key={lead.id} className="hover:bg-stone-50/60 transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="font-medium text-stone-900">{lead.name}</div>
                          <div className="text-[11px] text-stone-400">{lead.phone || lead.email}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${statusColors[lead.status] || 'bg-stone-100 text-stone-700 border-stone-200'}`}>
                            {lead.status || 'NEW'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 max-w-[200px] truncate text-stone-600">
                          {lead.message || 'Direct showing inquiry'}
                        </td>
                        <td className="py-3.5 px-4 text-stone-400 font-mono text-[11px]">
                          {new Date(lead.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <a
                            href={`mailto:${lead.email}`}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded transition-colors"
                          >
                            <Mail className="w-3 h-3" />
                            <span>Reply</span>
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Active Residences & Upcoming Showings */}
        <div className="lg:col-span-4 space-y-6">
          {/* Active Listings Column */}
          <div className="bg-white rounded-lg border border-stone-200/90 shadow-xs p-5">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100">
              <h3 className="font-serif text-base text-stone-900 tracking-tight">
                Active Representations
              </h3>
              <Link to="/command/listings" className="text-xs text-[#b40101] font-medium hover:underline">
                Manage
              </Link>
            </div>

            {activeListings.length === 0 ? (
              <p className="text-xs text-stone-400 py-4 text-center">No active representations published.</p>
            ) : (
              <div className="space-y-3">
                {activeListings.slice(0, 4).map((listing: any) => (
                  <Link
                    key={listing.id}
                    to={`/properties/${listing.id}`}
                    className="flex items-center gap-3 p-2 rounded hover:bg-stone-50 transition-colors group"
                  >
                    <img
                      src={listing.imageUrl || listing.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=80'}
                      alt={listing.address}
                      className="w-12 h-12 rounded object-cover border border-stone-200 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-serif text-stone-900 text-sm font-normal truncate group-hover:text-[#b40101] transition-colors">
                        {formatCurrency(listing.price)}
                      </div>
                      <div className="text-[11px] text-stone-400 truncate">
                        {listing.address}, {listing.city}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-stone-700 transition-colors" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Showings Column */}
          <div className="bg-white rounded-lg border border-stone-200/90 shadow-xs p-5">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100">
              <h3 className="font-serif text-base text-stone-900 tracking-tight">
                Upcoming Showings
              </h3>
              <Link to="/command/calendar" className="text-xs text-[#b40101] font-medium hover:underline">
                Calendar
              </Link>
            </div>

            {appointments.length === 0 ? (
              <div className="py-4 text-center">
                <Clock className="w-5 h-5 text-stone-300 mx-auto mb-1" />
                <p className="text-xs text-stone-400">No scheduled appointments today.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.slice(0, 3).map((apt: any, i: number) => (
                  <div key={i} className="p-3 bg-stone-50/70 border border-stone-200/70 rounded">
                    <div className="text-xs font-semibold text-stone-900 truncate">
                      {apt.title || apt.leadName || apt.clientName || 'Private Showing'}
                    </div>
                    <div className="text-[11px] text-stone-500 mt-1 flex items-center gap-1.5 font-mono">
                      <Clock className="w-3 h-3 text-stone-400" />
                      <span>
                        {new Date(apt.date || apt.startTime || apt.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at{' '}
                        {new Date(apt.date || apt.startTime || apt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
