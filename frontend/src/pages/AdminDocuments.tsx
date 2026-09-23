import React, { useState, useEffect } from "react";
import {
  FolderLock,
  Search,
  Plus,
  Download,
  Trash2,
  FileText,
  File,
  Shield,
  Clock,
  ExternalLink,
  Upload,
  X
} from "lucide-react";

export default function AdminDocuments() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categoryId: "",
    fileUrl: "",
    fileType: "application/pdf"
  });

  useEffect(() => {
    fetchDocuments();
    fetchCategories();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('torra_user') || '{}');
      const res = await fetch(`/api/documents?userId=${user.id}`);
      const data = await res.json();
      setDocuments(Array.isArray(data) ? data : []);
    } catch {
      console.error('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/documents/categories');
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch {}
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const user = JSON.parse(localStorage.getItem('torra_user') || '{}');
      const payload = {
        ...formData,
        fileUrl: formData.fileUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileSize: 1024 * 1024 * 2.4, // 2.4 MB
        uploadedBy: user.id
      };

      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setShowModal(false);
        setFormData({ title: "", description: "", categoryId: "", fileUrl: "", fileType: "application/pdf" });
        fetchDocuments();
      } else {
        alert('Failed to archive document');
      }
    } catch {
      alert('Error uploading document');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownload = async (doc: any) => {
    try {
      const user = JSON.parse(localStorage.getItem('torra_user') || '{}');
      const res = await fetch(`/api/documents/${doc.id}/download?userId=${user.id}`);
      const data = await res.json();
      if (res.ok && data.fileUrl) {
        window.open(data.fileUrl, '_blank');
      } else {
        window.open(doc.fileUrl || '#', '_blank');
      }
    } catch {
      window.open(doc.fileUrl || '#', '_blank');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setDocuments(prev => prev.filter(d => d.id !== id));
        setDeleteCandidate(null);
      }
    } catch {
      alert('Failed to delete document');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '1.2 MB';
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const filteredDocs = documents.filter(d => {
    if (selectedCategory !== 'ALL' && d.categoryId !== selectedCategory) return false;
    if (searchText && !d.title?.toLowerCase().includes(searchText.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="text-[11px] uppercase tracking-[0.25em] text-[#b40101] font-semibold mb-1">
            Institutional Vault & Archives
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-stone-900 tracking-tight">
            Compliance & Legal Repository
          </h2>
          <p className="text-stone-500 text-xs sm:text-sm mt-0.5">
            TREC representation disclosures, purchase and sale master templates, and closing dossiers.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-[#b40101] hover:bg-[#900101] rounded transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Upload Archive Record</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-lg border border-stone-200/90 shadow-xs">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {['ALL', ...categories.map(c => c.id || c.name)].map((catId) => {
            const isSelected = selectedCategory === catId;
            const categoryObj = categories.find(c => (c.id || c.name) === catId);
            const label = catId === 'ALL' ? 'All Records' : categoryObj?.name || catId;
            return (
              <button
                key={catId}
                onClick={() => setSelectedCategory(catId)}
                className={`px-3 py-1.5 rounded text-xs font-medium tracking-wide whitespace-nowrap transition-colors ${
                  isSelected
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {label}
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
            placeholder="Search document title..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded focus:outline-none focus:border-stone-900 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-lg border border-stone-200/90 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-stone-400 text-xs">
            <div className="w-8 h-8 border-2 border-stone-300 border-t-[#b40101] rounded-full animate-spin mx-auto mb-3" />
            Auditing institutional archive...
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="p-16 text-center text-stone-400">
            <FolderLock className="w-10 h-10 mx-auto mb-3 text-stone-300" />
            <p className="text-sm font-medium text-stone-700 mb-1">No documents registered in this archive</p>
            <p className="text-xs text-stone-400">Upload contract standards, disclosure addenda, and wire instructions.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-stone-50/80 border-b border-stone-200/80 text-[10px] uppercase tracking-wider text-stone-500 font-semibold">
                  <th className="py-3 px-5">Document Title & Description</th>
                  <th className="py-3 px-4">Classification</th>
                  <th className="py-3 px-4">File Size</th>
                  <th className="py-3 px-4">Archived Date</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded bg-rose-50 border border-rose-100 text-[#b40101] flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 max-w-sm">
                          <div className="font-semibold text-stone-900 text-sm truncate">{doc.title}</div>
                          <div className="text-[11px] text-stone-400 truncate">{doc.description || 'Master agreement document'}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-semibold bg-stone-100 text-stone-700 border border-stone-200">
                        {doc.category?.name || 'Institutional'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-stone-600">
                      {formatFileSize(doc.fileSize)}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-stone-400 whitespace-nowrap">
                      {new Date(doc.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>

                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleDownload(doc)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Retrieve</span>
                        </button>
                        <button
                          onClick={() => setDeleteCandidate(doc.id)}
                          className="p-1.5 text-rose-600 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 rounded transition-colors"
                          title="Purge Archive Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-stone-200 shadow-2xl max-w-sm w-full p-6 space-y-4">
            <h3 className="font-serif text-lg text-stone-900">Purge Archive Record</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Are you sure you wish to delete this document from the governance repository? Download permissions will be revoked.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button onClick={() => setDeleteCandidate(null)} className="px-3.5 py-1.5 text-xs text-stone-600 hover:text-stone-900">Cancel</button>
              <button onClick={() => handleDelete(deleteCandidate)} className="px-4 py-2 text-xs font-medium text-white bg-rose-700 hover:bg-rose-800 rounded">Confirm Purge</button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Record Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-stone-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-serif text-lg text-stone-900">Upload Archive Record</h3>
              <button onClick={() => setShowModal(false)} className="text-stone-400 hover:text-stone-700"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleUpload} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">Document Record Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. TREC Information About Brokerage Services (IABS)"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded focus:outline-none focus:border-stone-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">Classification Category</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded focus:outline-none focus:border-stone-900 focus:bg-white"
                >
                  <option value="">Select Category...</option>
                  {categories.map((c: any) => (
                    <option key={c.id || c.name} value={c.id || c.name}>{c.name || c.id}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">File Storage URL</label>
                <input
                  type="text"
                  value={formData.fileUrl}
                  onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                  placeholder="https://assets.torra.com/legal/..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded focus:outline-none focus:border-stone-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">Document Summary & Notes</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mandatory state-mandated disclosure form..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded focus:outline-none focus:border-stone-900 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-xs text-stone-600 hover:text-stone-900">Cancel</button>
                <button type="submit" disabled={submitting} className="px-5 py-2 text-xs font-medium text-white bg-[#b40101] hover:bg-[#900101] rounded shadow-xs">
                  {submitting ? 'Archiving...' : 'Archive Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
