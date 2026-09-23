import React, { useState, useEffect } from "react";
import { useOutletContext, Link } from "react-router-dom";
import {
  Home,
  Plus,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  Bed,
  Bath,
  Square,
  Upload,
  X,
  Check,
  Building,
  DollarSign
} from "lucide-react";

export default function AgentListings() {
  const { agent: parentAgent } = useOutletContext<{ agent: any }>();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingProperty, setEditingProperty] = useState<any>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    address: "",
    city: "Austin",
    state: "TX",
    zip: "",
    price: "",
    propertyType: "Single Family",
    bedrooms: "3",
    bathrooms: "2.5",
    sqft: "2400",
    status: "Active",
    description: "",
    imageUrl: ""
  });

  const authHeaders = () => ({
    'Authorization': `Bearer ${parentAgent?.token || ''}`
  });

  useEffect(() => {
    if (!parentAgent) return;
    fetchListings();
  }, [parentAgent]);

  const fetchListings = () => {
    fetch(`/api/properties?agentId=${parentAgent.id}&limit=100`, { headers: authHeaders() })
      .then(res => res.json())
      .then(data => {
        setListings(Array.isArray(data) ? data : (data.data || []));
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/properties/${id}`, {
        method: 'DELETE',
        headers: authHeaders()
      });
      if (!res.ok) throw new Error('Failed to delete');
      setListings(prev => prev.filter(p => p.id !== id));
      setDeleteCandidate(null);
    } catch {
      alert("Failed to delete listing. Please try again.");
    }
  };

  const handleOpenAdd = () => {
    setEditingProperty(null);
    setFormData({
      address: "",
      city: "Austin",
      state: "TX",
      zip: "",
      price: "",
      propertyType: "Single Family",
      bedrooms: "4",
      bathrooms: "3.5",
      sqft: "3200",
      status: "Active",
      description: "",
      imageUrl: ""
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (property: any) => {
    setEditingProperty(property);
    setFormData({
      address: property.address || "",
      city: property.city || "",
      state: property.state || "TX",
      zip: property.zip || "",
      price: String(property.price || ""),
      propertyType: property.propertyType || "Single Family",
      bedrooms: String(property.beds || property.bedrooms || 3),
      bathrooms: String(property.baths || property.bathrooms || 2.5),
      sqft: String(property.sqft || 2000),
      status: property.status || "Active",
      description: property.description || "",
      imageUrl: property.imageUrl || property.images?.[0] || ""
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zip: formData.zip,
      price: Number(formData.price),
      propertyType: formData.propertyType,
      beds: Number(formData.bedrooms),
      baths: Number(formData.bathrooms),
      sqft: Number(formData.sqft),
      status: formData.status,
      description: formData.description,
      imageUrl: formData.imageUrl || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
      agentId: parentAgent.id
    };

    try {
      if (editingProperty) {
        const res = await fetch(`/api/properties/${editingProperty.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', ...authHeaders() },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Failed to update listing');
        const updated = await res.json();
        setListings(prev => prev.map(p => p.id === updated.id ? updated : p));
      } else {
        const res = await fetch('/api/properties', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders() },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Failed to create listing');
        const newProperty = await res.json();
        setListings(prev => [newProperty, ...prev]);
      }

      setIsModalOpen(false);
      setEditingProperty(null);
    } catch {
      alert(`Failed to ${editingProperty ? 'update' : 'publish'} listing.`);
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val || 0);

  const filteredListings = listings.filter(item => {
    if (filterStatus !== 'ALL' && item.status !== filterStatus) return false;
    if (searchText) {
      const q = searchText.toLowerCase();
      const addrMatch = (item.address || '').toLowerCase().includes(q);
      const cityMatch = (item.city || '').toLowerCase().includes(q);
      if (!addrMatch && !cityMatch) return false;
    }
    return true;
  });

  const totalValue = listings.reduce((sum, item) => sum + (Number(item.price) || 0), 0);

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="text-[11px] uppercase tracking-[0.25em] text-[#b40101] font-semibold mb-1">
            Exclusive Inventory Desk
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-stone-900 tracking-tight">
            Represented Residences
          </h2>
          <p className="text-stone-500 text-xs sm:text-sm mt-0.5">
            Active brokerage representations totaling <span className="font-mono text-stone-900 font-semibold">{formatCurrency(totalValue)}</span> across {listings.length} residences.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-[#b40101] hover:bg-[#900101] rounded transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Publish Residence</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-lg border border-stone-200/90 shadow-xs">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {['ALL', 'Active', 'Pending', 'Sold'].map(st => {
            const count = st === 'ALL' ? listings.length : listings.filter(l => l.status === st).length;
            const isSelected = filterStatus === st;
            return (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded text-xs font-medium tracking-wide whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                <span>{st === 'ALL' ? 'All Residences' : st}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-stone-700 text-stone-200' : 'bg-stone-200 text-stone-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative shrink-0 md:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search address or city..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded focus:outline-none focus:border-stone-900 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Listings Table */}
      <div className="bg-white rounded-lg border border-stone-200/90 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-stone-400 text-xs">
            <div className="w-8 h-8 border-2 border-stone-300 border-t-[#b40101] rounded-full animate-spin mx-auto mb-3" />
            Loading residence inventory...
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="p-16 text-center text-stone-400">
            <Home className="w-10 h-10 mx-auto mb-3 text-stone-300" />
            <p className="text-sm font-medium text-stone-700 mb-1">No residences found</p>
            <p className="text-xs text-stone-400 max-w-sm mx-auto mb-4">
              Add your exclusive client listings to showcase on the market and receive private showing requests.
            </p>
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-[#b40101] hover:bg-[#900101] rounded transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create First Listing</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-stone-50/80 border-b border-stone-200/80 text-[10px] uppercase tracking-wider text-stone-500 font-semibold">
                  <th className="py-3 px-5">Residence</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Specifications</th>
                  <th className="py-3 px-4">Property Type</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredListings.map((prop) => {
                  const statusBadges: Record<string, string> = {
                    Active: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                    Pending: 'bg-amber-50 text-amber-800 border-amber-200',
                    Sold: 'bg-stone-100 text-stone-700 border-stone-200'
                  };
                  return (
                    <tr key={prop.id} className="hover:bg-stone-50/70 transition-colors">
                      {/* Image & Address */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <img
                            src={prop.imageUrl || prop.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=80'}
                            alt={prop.address}
                            className="w-14 h-11 object-cover rounded border border-stone-200 shrink-0"
                          />
                          <div>
                            <div className="font-medium text-stone-900 text-sm">{prop.address}</div>
                            <div className="text-[11px] text-stone-400">{prop.city}, {prop.state} {prop.zip}</div>
                          </div>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-4 px-4 font-serif text-sm font-normal text-stone-900 whitespace-nowrap">
                        {formatCurrency(prop.price)}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-semibold border ${statusBadges[prop.status] || 'bg-stone-100 text-stone-700 border-stone-200'}`}>
                          {(prop.status || 'Active').toUpperCase()}
                        </span>
                      </td>

                      {/* Specs */}
                      <td className="py-4 px-4 text-stone-600 whitespace-nowrap">
                        <div className="flex items-center gap-3 text-[11px]">
                          <span className="flex items-center gap-1"><Bed className="w-3.5 h-3.5 text-stone-400" />{prop.beds || prop.bedrooms || 0} Beds</span>
                          <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5 text-stone-400" />{prop.baths || prop.bathrooms || 0} Baths</span>
                          <span className="flex items-center gap-1"><Square className="w-3.5 h-3.5 text-stone-400" />{Number(prop.sqft || 0).toLocaleString()} Sq Ft</span>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="py-4 px-4 text-stone-500 whitespace-nowrap">
                        {prop.propertyType || 'Single Family'}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <Link
                            to={`/properties/${prop.id}`}
                            target="_blank"
                            className="p-1.5 text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded transition-colors"
                            title="View Public Presentation"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => handleOpenEdit(prop)}
                            className="p-1.5 text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded transition-colors"
                            title="Edit Listing Details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteCandidate(prop.id)}
                            className="p-1.5 text-rose-600 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 rounded transition-colors"
                            title="Delete Representation"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-stone-200 shadow-2xl max-w-sm w-full p-6 space-y-4">
            <h3 className="font-serif text-lg text-stone-900">Remove Representation</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Are you sure you wish to remove this property mandate from the Torra brokerage register? This action cannot be reversed.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteCandidate(null)}
                className="px-3.5 py-1.5 text-xs text-stone-600 hover:text-stone-900 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteCandidate)}
                className="px-4 py-2 text-xs font-medium text-white bg-rose-700 hover:bg-rose-800 rounded transition-colors"
              >
                Confirm Removal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg border border-stone-200 shadow-2xl max-w-2xl w-full p-6 my-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div>
                <h3 className="font-serif text-xl text-stone-900">
                  {editingProperty ? "Edit Representation" : "New Property Mandate"}
                </h3>
                <p className="text-xs text-stone-500">
                  Fill in property specifications to publish to the market.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Street Address *
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. 2400 Stratford Drive"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded focus:outline-none focus:border-stone-900 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded focus:outline-none focus:border-stone-900 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={2}
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded focus:outline-none focus:border-stone-900 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.zip}
                    onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded focus:outline-none focus:border-stone-900 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Listing Price ($ USD) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1000}
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="2500000"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded focus:outline-none focus:border-stone-900 focus:bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Property Type
                  </label>
                  <select
                    value={formData.propertyType}
                    onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded focus:outline-none focus:border-stone-900 focus:bg-white"
                  >
                    <option value="Single Family">Single Family Residence</option>
                    <option value="Condo">Luxury Penthouse / Condo</option>
                    <option value="Townhouse">Architectural Townhome</option>
                    <option value="Land">Estate Grounds / Land</option>
                    <option value="Multi-Family">Multi-Family Asset</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Bedrooms
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded focus:outline-none focus:border-stone-900 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Bathrooms
                  </label>
                  <input
                    type="number"
                    step={0.5}
                    min={0}
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded focus:outline-none focus:border-stone-900 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Square Feet
                  </label>
                  <input
                    type="number"
                    min={100}
                    value={formData.sqft}
                    onChange={(e) => setFormData({ ...formData, sqft: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded focus:outline-none focus:border-stone-900 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Listing Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded focus:outline-none focus:border-stone-900 focus:bg-white"
                  >
                    <option value="Active">Active Presentation</option>
                    <option value="Pending">Pending Contract</option>
                    <option value="Sold">Sold / Settled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Primary Cover Photo URL
                  </label>
                  <input
                    type="text"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded focus:outline-none focus:border-stone-900 focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-medium text-white bg-[#b40101] hover:bg-[#900101] disabled:opacity-50 rounded transition-colors shadow-xs"
                >
                  {submitting ? "Saving..." : editingProperty ? "Save Changes" : "Publish Mandate"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
