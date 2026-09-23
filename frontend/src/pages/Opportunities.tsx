import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import {
  TrendingUp,
  Plus,
  DollarSign,
  Calendar,
  Building,
  User,
  MoreVertical,
  Trash2,
  Edit2,
  X,
  CheckCircle,
  Clock
} from "lucide-react";

export default function Opportunities() {
  const { agent: parentAgent } = useOutletContext<{ agent: any }>();
  const [activeSegment, setActiveSegment] = useState<'listing' | 'buyer'>('listing');
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOpp, setEditingOpp] = useState<any>(null);
  const [draggedDeal, setDraggedDeal] = useState<any>(null);
  const [leads, setLeads] = useState<any[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    clientName: "",
    price: "",
    status: "Cultivate",
    probability: 25,
    expectedCloseDate: "",
    leadId: ""
  });

  const authHeaders = () => ({
    'Authorization': `Bearer ${parentAgent?.token || ''}`
  });

  useEffect(() => {
    if (!parentAgent) return;
    fetchOpportunities();
  }, [parentAgent, activeSegment]);

  useEffect(() => {
    if (!parentAgent) return;
    fetch(`/api/leads?agentId=${parentAgent.id}&limit=100`, { headers: authHeaders() })
      .then(res => res.json())
      .then(data => setLeads(Array.isArray(data?.leads) ? data.leads : (Array.isArray(data) ? data : [])))
      .catch(() => setLeads([]));
  }, [parentAgent]);

  const fetchOpportunities = async () => {
    try {
      const res = await fetch(`/api/opportunities?agentId=${parentAgent.id}&type=${activeSegment}`, { headers: authHeaders() });
      const data = await res.json();
      if (data.error || !Array.isArray(data)) {
        setOpportunities([]);
        setLoading(false);
        return;
      }
      setOpportunities(data);
      setLoading(false);
    } catch {
      setOpportunities([]);
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingOpp(null);
    setFormData({
      title: "",
      clientName: "",
      price: "",
      status: "Cultivate",
      probability: 25,
      expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      leadId: ""
    });
    setIsModalOpen(true);
  };

  const handleEdit = (opp: any) => {
    setEditingOpp(opp);
    setFormData({
      title: opp.title || "",
      clientName: opp.clientName || "",
      price: String(opp.price || ""),
      status: opp.status || "Cultivate",
      probability: opp.probability || 25,
      expectedCloseDate: opp.expectedCloseDate ? new Date(opp.expectedCloseDate).toISOString().split('T')[0] : "",
      leadId: opp.leadId || ""
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      price: Number(formData.price),
      probability: Number(formData.probability),
      agentId: parentAgent.id,
      type: activeSegment
    };

    try {
      if (editingOpp) {
        const res = await fetch(`/api/opportunities/${editingOpp.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', ...authHeaders() },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Failed to update');
      } else {
        const res = await fetch('/api/opportunities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders() },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Failed to create');
      }
      setIsModalOpen(false);
      setEditingOpp(null);
      fetchOpportunities();
    } catch {
      alert('Failed to save opportunity');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you wish to delete this opportunity record?')) return;
    try {
      await fetch(`/api/opportunities/${id}`, { method: 'DELETE', headers: authHeaders() });
      fetchOpportunities();
    } catch {
      alert('Failed to delete opportunity');
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    const previous = opportunities.find(o => o.id === id)?.status;
    if (previous === newStatus) return;
    setOpportunities(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
    try {
      const res = await fetch(`/api/opportunities/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Failed to update');
    } catch {
      setOpportunities(prev => prev.map(o => o.id === id ? { ...o, status: previous } : o));
    }
  };

  const statuses = ['Cultivate', 'Appointment', 'Active', 'Under Contract', 'Closed'];

  const totalPipeline = opportunities.reduce((sum, o) => sum + (o.price * (o.probability || 0) / 100), 0);
  const expectedCommission = totalPipeline * 0.03;
  const rawVolume = opportunities.reduce((sum, o) => sum + (o.price || 0), 0);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val || 0);

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="text-[11px] uppercase tracking-[0.25em] text-[#b40101] font-semibold mb-1">
            Transaction Architecture
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-stone-900 tracking-tight">
            Pipeline & Deal Escrow
          </h2>
          <p className="text-stone-500 text-xs sm:text-sm mt-0.5">
            Stage progression and estimated revenue forecasting.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <div className="p-1 bg-stone-200/70 rounded flex items-center">
            <button
              onClick={() => setActiveSegment('listing')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                activeSegment === 'listing'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Listings Pipeline
            </button>
            <button
              onClick={() => setActiveSegment('buyer')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                activeSegment === 'buyer'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Buyer Representations
            </button>
          </div>

          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-[#b40101] hover:bg-[#900101] rounded transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Deal</span>
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-lg border border-stone-200/90 shadow-xs">
          <div className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold mb-1">
            Gross Pipeline Volume
          </div>
          <div className="font-serif text-2xl text-stone-900 font-normal">
            {formatCurrency(rawVolume)}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            Across {opportunities.length} active transactions
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-stone-200/90 shadow-xs">
          <div className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold mb-1">
            Probability-Weighted Pipeline
          </div>
          <div className="font-serif text-2xl text-stone-900 font-normal">
            {formatCurrency(totalPipeline)}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            Risk-adjusted transaction valuation
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-stone-200/90 shadow-xs">
          <div className="text-[10px] uppercase tracking-wider text-[#b40101] font-semibold mb-1">
            Projected Net Commission (3% GCI)
          </div>
          <div className="font-serif text-2xl text-[#b40101] font-normal">
            {formatCurrency(expectedCommission)}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            Estimated broker realization
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-6">
        {statuses.map((status) => {
          const deals = opportunities.filter((o) => o.status === status);
          const colVolume = deals.reduce((sum, o) => sum + (o.price || 0), 0);

          return (
            <div
              key={status}
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add('bg-stone-200/80');
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove('bg-stone-200/80');
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('bg-stone-200/80');
                if (draggedDeal && draggedDeal.status !== status) {
                  handleStatusChange(draggedDeal.id, status);
                }
                setDraggedDeal(null);
              }}
              className="bg-stone-100/70 rounded-lg p-3 border border-stone-200/70 min-h-[500px] flex flex-col transition-colors"
            >
              {/* Column Header */}
              <div className="pb-3 mb-3 border-b border-stone-200 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider">
                    {status}
                  </h4>
                  <div className="text-[10px] text-stone-400 font-mono mt-0.5">
                    {formatCurrency(colVolume)}
                  </div>
                </div>
                <span className="w-5 h-5 rounded-full bg-stone-200 text-stone-700 font-mono text-[10px] font-bold flex items-center justify-center">
                  {deals.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="flex-1 space-y-3">
                {deals.map((deal) => (
                  <div
                    key={deal.id}
                    draggable
                    onDragStart={() => setDraggedDeal(deal)}
                    className="p-3.5 bg-white rounded border border-stone-200 shadow-2xs hover:border-stone-900 hover:shadow-xs transition-all cursor-grab active:cursor-grabbing space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-semibold text-stone-900 leading-snug">
                        {deal.title || deal.clientName || 'Untitled Deal'}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleEdit(deal)}
                          className="p-1 text-stone-400 hover:text-stone-700 rounded"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDelete(deal.id)}
                          className="p-1 text-stone-400 hover:text-rose-700 rounded"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="font-serif text-sm text-stone-900">
                      {formatCurrency(deal.price)}
                    </div>

                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-500 font-mono">
                      <span>Prob: {deal.probability || 25}%</span>
                      {deal.expectedCloseDate && (
                        <span>
                          {new Date(deal.expectedCloseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>

                    {/* Stage quick move */}
                    <div className="pt-1 flex items-center justify-between">
                      <select
                        value={deal.status}
                        onChange={(e) => handleStatusChange(deal.id, e.target.value)}
                        className="text-[10px] bg-stone-50 border border-stone-200 rounded px-1.5 py-0.5 text-stone-600 focus:outline-none"
                      >
                        {statuses.map(st => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-stone-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-serif text-lg text-stone-900">
                {editingOpp ? "Edit Opportunity" : "New Transaction Deal"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Deal Title / Property *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. 1200 Barton Springs Penthouse"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded focus:outline-none focus:border-stone-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Client Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  placeholder="Client full name"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded focus:outline-none focus:border-stone-900 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Transaction Value ($) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1000}
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="1500000"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded focus:outline-none focus:border-stone-900 focus:bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Pipeline Stage
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded focus:outline-none focus:border-stone-900 focus:bg-white"
                  >
                    {statuses.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Probability (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={formData.probability}
                    onChange={(e) => setFormData({ ...formData, probability: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded focus:outline-none focus:border-stone-900 focus:bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Expected Closing Date
                  </label>
                  <input
                    type="date"
                    value={formData.expectedCloseDate}
                    onChange={(e) => setFormData({ ...formData, expectedCloseDate: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded focus:outline-none focus:border-stone-900 focus:bg-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs text-stone-600 hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-medium text-white bg-[#b40101] hover:bg-[#900101] rounded transition-colors shadow-xs"
                >
                  {editingOpp ? 'Save Deal' : 'Create Deal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
