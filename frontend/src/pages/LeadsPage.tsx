import React, { useState, useEffect, useMemo } from "react";
import { Link, useOutletContext, useNavigate } from "react-router-dom";
import {
  Users,
  Search,
  Filter,
  Download,
  Phone,
  Mail,
  MessageSquare,
  ChevronDown,
  Copy,
  Check,
  Building,
  Sparkles,
  ExternalLink
} from "lucide-react";

export default function LeadsPage() {
  const { agent: parentAgent } = useOutletContext<{ agent: any }>();
  const navigate = useNavigate();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedLeadForTemplates, setSelectedLeadForTemplates] = useState<any | null>(null);

  const authHeaders = () => ({
    'Authorization': `Bearer ${parentAgent?.token || ''}`
  });

  useEffect(() => {
    if (!parentAgent) return;
    fetch(`/api/leads?agentId=${parentAgent.id}&limit=100`, { headers: authHeaders() })
      .then(res => res.json())
      .then(data => {
        setLeads(Array.isArray(data?.leads) ? data.leads : (Array.isArray(data) ? data : []));
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [parentAgent]);

  const updateLeadStatus = async (leadId: string, status: string) => {
    const previous = leads.find(l => l.id === leadId)?.status;
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status } : l));
    try {
      const res = await fetch(`/api/leads/${leadId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Request failed');
    } catch {
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: previous } : l));
    }
  };

  const handleExport = async () => {
    try {
      const res = await fetch(`/api/leads/export?agentId=${parentAgent.id}`, { headers: authHeaders() });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `torra-clients-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      console.error('Failed to export leads');
    }
  };

  const computeLeadScore = (lead: any) => {
    let score = 0;
    if (lead.status === 'Qualified') score += 40;
    else if (lead.status === 'Contacted') score += 25;
    else if (lead.status === 'New') score += 15;
    else if (lead.status === 'Closed') score += 50;
    if (lead.property) score += 20;
    if (lead.phone) score += 10;
    const daysSince = Math.floor((Date.now() - new Date(lead.date || lead.createdAt || Date.now()).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSince <= 3) score += 20;
    else if (daysSince <= 7) score += 10;
    return Math.min(100, Math.max(10, score));
  };

  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      if (filterStatus !== 'ALL' && l.status !== filterStatus) return false;
      if (searchText) {
        const query = searchText.toLowerCase();
        const nameMatch = (l.name || '').toLowerCase().includes(query);
        const emailMatch = (l.email || '').toLowerCase().includes(query);
        const phoneMatch = (l.phone || '').toLowerCase().includes(query);
        if (!nameMatch && !emailMatch && !phoneMatch) return false;
      }
      return true;
    });
  }, [leads, filterStatus, searchText]);

  const quickResponses: Record<string, string> = {
    welcome: "Hi {name}! Thank you for your inquiry with Torra Private Brokerage. I'd be delighted to assist you with your luxury acquisition. When would be a convenient time for a confidential consultation?",
    showing: "Hi {name}! I am arranging a private viewing for the residence you noted. Which day and time window works best with your schedule this week?",
    followup: "Hi {name}! Following up on your real estate search. We have newly curated opportunities that match your portfolio criteria. Would you like me to transmit the briefing?",
    preapproval: "Hi {name}! To place priority bids with sellers, having verified luxury lending credentials is vital. I can introduce you to our private private-banking lending partner."
  };

  const copyTemplate = (templateKey: string, leadName: string) => {
    const raw = quickResponses[templateKey];
    const text = raw.replace('{name}', leadName?.split(' ')[0] || 'there');
    navigator.clipboard.writeText(text);
    setCopiedKey(templateKey);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const statusCategories = ['ALL', 'New', 'Contacted', 'Qualified', 'Closed', 'Lost'];

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="text-[11px] uppercase tracking-[0.25em] text-[#b40101] font-semibold mb-1">
            Torra Private Client CRM
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-stone-900 tracking-tight">
            Client Directory & Inquiries
          </h2>
          <p className="text-stone-500 text-xs sm:text-sm mt-0.5">
            Manage inquiries, assign status milestones, and initiate showing dialogues.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-stone-700 bg-white border border-stone-300 hover:border-stone-900 rounded transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-stone-500" />
            <span>Export Roster (CSV)</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-lg border border-stone-200/90 shadow-xs">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {statusCategories.map(cat => {
            const count = cat === 'ALL' ? leads.length : leads.filter(l => l.status === cat).length;
            const isSelected = filterStatus === cat;
            return (
              <button
                key={cat}
                onClick={() => setFilterStatus(cat)}
                className={`px-3 py-1.5 rounded text-xs font-medium tracking-wide whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                <span>{cat === 'ALL' ? 'All Clients' : cat}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-stone-700 text-stone-200' : 'bg-stone-200 text-stone-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative shrink-0 md:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search by name, email or phone..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded focus:outline-none focus:border-stone-900 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Main Clients Table */}
      <div className="bg-white rounded-lg border border-stone-200/90 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-stone-400">
            <div className="w-8 h-8 border-2 border-stone-300 border-t-[#b40101] rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs">Loading client directory...</p>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="p-16 text-center text-stone-400">
            <Users className="w-10 h-10 mx-auto mb-3 text-stone-300" />
            <p className="text-sm font-medium text-stone-700 mb-1">No matching clients found</p>
            <p className="text-xs text-stone-400 max-w-sm mx-auto">
              {searchText ? `No contacts matching "${searchText}". Try clearing search filters.` : 'Inquiries submitted across your residences will appear in this registry.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-stone-50/80 border-b border-stone-200/80 text-[10px] uppercase tracking-wider text-stone-500 font-semibold">
                  <th className="py-3 px-4 text-center">Score</th>
                  <th className="py-3 px-5">Client Name & Details</th>
                  <th className="py-3 px-4">Milestone Status</th>
                  <th className="py-3 px-4">Residence Interest</th>
                  <th className="py-3 px-4">Inquiry / Note</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredLeads.map((lead: any) => {
                  const score = computeLeadScore(lead);
                  const scoreColor = score >= 70 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : score >= 40 ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-stone-600 bg-stone-100 border-stone-200';
                  return (
                    <tr key={lead.id} className="hover:bg-stone-50/70 transition-colors">
                      {/* Score */}
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-block px-2 py-1 rounded font-mono font-bold text-[11px] border ${scoreColor}`}>
                          {score}
                        </span>
                      </td>

                      {/* Client */}
                      <td className="py-4 px-5">
                        <div className="font-semibold text-stone-900 text-sm flex items-center gap-2">
                          <span>{lead.name}</span>
                        </div>
                        <div className="text-[11px] text-stone-500 mt-0.5 space-y-0.5">
                          {lead.email && <div className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-stone-400" /><span>{lead.email}</span></div>}
                          {lead.phone && <div className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-stone-400" /><span>{lead.phone}</span></div>}
                        </div>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-4 px-4">
                        <select
                          value={lead.status || 'New'}
                          onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                          className="px-2.5 py-1 text-xs font-semibold rounded border border-stone-300 bg-white text-stone-800 focus:outline-none focus:border-stone-900 cursor-pointer shadow-2xs"
                        >
                          <option value="New">NEW INQUIRY</option>
                          <option value="Contacted">CONTACTED</option>
                          <option value="Qualified">QUALIFIED BUYER</option>
                          <option value="Closed">CLOSED DEAL</option>
                          <option value="Lost">ARCHIVED / LOST</option>
                        </select>
                      </td>

                      {/* Property */}
                      <td className="py-4 px-4 max-w-[200px]">
                        {lead.property ? (
                          <Link
                            to={`/properties/${lead.property.id}`}
                            className="text-[#b40101] hover:underline font-medium flex items-center gap-1.5 truncate"
                          >
                            <Building className="w-3.5 h-3.5 shrink-0 text-stone-400" />
                            <span className="truncate">{lead.property.address || 'View Residence'}</span>
                          </Link>
                        ) : (
                          <span className="text-stone-400 italic">General Brokerage Consultation</span>
                        )}
                      </td>

                      {/* Note / Message */}
                      <td className="py-4 px-4 max-w-[220px]">
                        <p className="text-stone-600 truncate text-[11px]" title={lead.message}>
                          {lead.message || 'Client inquired via website.'}
                        </p>
                        <button
                          onClick={() => setSelectedLeadForTemplates(selectedLeadForTemplates?.id === lead.id ? null : lead)}
                          className="mt-1 text-[10px] text-[#b40101] hover:underline font-semibold flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Quick Templates</span>
                        </button>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 text-stone-400 font-mono text-[11px] whitespace-nowrap">
                        {new Date(lead.date || lead.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          {lead.phone && (
                            <a
                              href={`tel:${lead.phone}`}
                              className="p-1.5 text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded transition-colors"
                              title="Direct Phone Call"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button
                            onClick={() => navigate('/command/inbox', { state: { leadId: lead.id } })}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-[11px] font-medium text-white bg-[#b40101] hover:bg-[#900101] rounded shadow-2xs transition-colors"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>Message</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Response Modal / Drawer */}
      {selectedLeadForTemplates && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-stone-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div>
                <h3 className="font-serif text-lg text-stone-900">
                  Concierge Response Suite
                </h3>
                <p className="text-xs text-stone-500">
                  Select and copy a customized response for {selectedLeadForTemplates.name}
                </p>
              </div>
              <button
                onClick={() => setSelectedLeadForTemplates(null)}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {Object.entries(quickResponses).map(([key, template]) => {
                const isCopied = copiedKey === key;
                const formatted = template.replace('{name}', selectedLeadForTemplates.name.split(' ')[0]);
                const titles: Record<string, string> = {
                  welcome: 'Immediate Introduction & Welcome',
                  showing: 'Private Showing Arrangement',
                  followup: 'Portfolio Follow-up',
                  preapproval: 'Private Wealth Pre-Approval'
                };
                return (
                  <div key={key} className="p-3.5 bg-stone-50 border border-stone-200 rounded space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-stone-900">{titles[key] || key}</span>
                      <button
                        onClick={() => copyTemplate(key, selectedLeadForTemplates.name)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded transition-colors ${
                          isCopied
                            ? 'bg-emerald-700 text-white'
                            : 'bg-stone-200 hover:bg-stone-300 text-stone-800'
                        }`}
                      >
                        {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{isCopied ? 'Copied to Clipboard' : 'Copy'}</span>
                      </button>
                    </div>
                    <p className="text-stone-600 text-xs leading-relaxed italic">
                      "{formatted}"
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedLeadForTemplates(null)}
                className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
