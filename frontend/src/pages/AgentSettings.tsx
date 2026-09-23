import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import {
  User,
  Upload,
  Lock,
  Clock,
  Bell,
  CheckCircle,
  Save,
  Shield,
  Building,
  Mail,
  Phone,
  MapPin,
  Sparkles
} from "lucide-react";

export default function AgentSettings() {
  const { agent: parentAgent } = useOutletContext<{ agent: any }>();
  const [activeTab, setActiveTab] = useState<'profile' | 'hours' | 'security' | 'notifications'>('profile');

  // Profile Form state
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    location: "Austin, Texas",
    specialties: "Luxury Estates, Waterfront Residences"
  });

  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Security Form state
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Office Hours
  const [officeHours, setOfficeHours] = useState<any[]>([
    { day: 'Monday', open: '09:00', close: '18:00', enabled: true },
    { day: 'Tuesday', open: '09:00', close: '18:00', enabled: true },
    { day: 'Wednesday', open: '09:00', close: '18:00', enabled: true },
    { day: 'Thursday', open: '09:00', close: '18:00', enabled: true },
    { day: 'Friday', open: '09:00', close: '18:00', enabled: true },
    { day: 'Saturday', open: '10:00', close: '16:00', enabled: true },
    { day: 'Sunday', open: '11:00', close: '15:00', enabled: false },
  ]);
  const [savingHours, setSavingHours] = useState(false);

  // Notifications
  const [notifications, setNotifications] = useState({
    emailLeads: true,
    emailInquiries: true,
    emailNews: false,
    smsLeads: true,
    smsAppointments: true,
    pushAll: true,
  });

  const authHeaders = () => ({
    'Authorization': `Bearer ${parentAgent?.token || ''}`
  });

  useEffect(() => {
    if (parentAgent) {
      setImageUrl(parentAgent.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(parentAgent.name || 'Agent')}&background=0f172a&color=fff&size=256`);
      setProfileData({
        name: parentAgent.name || "",
        email: parentAgent.email || "",
        phone: parentAgent.phone || "",
        bio: parentAgent.bio || "Specializing in exceptional Austin residences and bespoke architectural estates.",
        location: parentAgent.location || "Austin, Texas",
        specialties: Array.isArray(parentAgent.specialties) ? parentAgent.specialties.join(", ") : (parentAgent.specialties || "Waterfront Estates, Hill Country Compounds, Modernist Penthouses")
      });
    }
  }, [parentAgent]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image file size must be under 5MB.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const res = await fetch(`/api/upload/agent/${parentAgent.id}/avatar`, {
        method: 'POST',
        headers: authHeaders(),
        body: formData
      });

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setImageUrl(data.imageUrl);
      setProfileMessage({ text: 'Executive headshot updated successfully.', type: 'success' });
    } catch {
      setProfileMessage({ text: 'Headshot upload failed. Please try again.', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMessage(null);

    const payload = {
      ...profileData,
      specialties: profileData.specialties.split(',').map(s => s.trim()).filter(Boolean)
    };

    try {
      const res = await fetch(`/api/agents/${parentAgent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Update failed');
      setProfileMessage({ text: 'Profile credentials updated.', type: 'success' });
    } catch {
      setProfileMessage({ text: 'Failed to save changes. Please try again.', type: 'error' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordMessage({ text: 'New passwords do not match.', type: 'error' });
      return;
    }

    setSavingPassword(true);
    setPasswordMessage(null);

    try {
      const res = await fetch(`/api/agents/${parentAgent.id}/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Password update failed');
      }

      setPasswordMessage({ text: 'Account password successfully updated.', type: 'success' });
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      setPasswordMessage({ text: err.message || 'Failed to update password.', type: 'error' });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSaveOfficeHours = async () => {
    setSavingHours(true);
    try {
      await fetch(`/api/agents/${parentAgent.id}/office-hours`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ officeHours })
      });
      alert('Showing consultation hours saved.');
    } catch {
      alert('Failed to save office hours.');
    } finally {
      setSavingHours(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-stone-200">
        <div className="text-[11px] uppercase tracking-[0.25em] text-[#b40101] font-semibold mb-1">
          Broker Credentials & Configurations
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl text-stone-900 tracking-tight">
          Executive Settings
        </h2>
        <p className="text-stone-500 text-xs sm:text-sm mt-0.5">
          Manage your public advisor profile, consultation hours, and security parameters.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 overflow-x-auto scrollbar-none">
        {[
          { key: 'profile', label: 'Advisor Profile', icon: User },
          { key: 'hours', label: 'Showing Hours', icon: Clock },
          { key: 'security', label: 'Security & Access', icon: Shield },
          { key: 'notifications', label: 'Client Alerts', icon: Bell }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 whitespace-nowrap transition-colors ${
                isActive
                  ? 'border-[#b40101] text-stone-900 font-semibold'
                  : 'border-transparent text-stone-500 hover:text-stone-900'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#b40101]' : 'text-stone-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab: Profile */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Headshot Card */}
          <div className="md:col-span-4 bg-white p-6 rounded-lg border border-stone-200/90 shadow-xs flex flex-col items-center text-center space-y-4">
            <div className="relative group">
              <img
                src={imageUrl}
                alt={parentAgent?.name}
                className="w-32 h-32 rounded-full object-cover border-2 border-stone-200 shadow-sm"
              />
              <label
                htmlFor="avatar-upload"
                className="absolute inset-0 bg-stone-950/60 text-white rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[10px] font-medium"
              >
                <Upload className="w-5 h-5 mb-1" />
                <span>{uploading ? 'Uploading...' : 'Replace'}</span>
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={uploading}
                className="hidden"
              />
            </div>

            <div>
              <h3 className="font-serif text-lg text-stone-900">{profileData.name || 'Private Advisor'}</h3>
              <p className="text-xs text-stone-400 mt-0.5">Licensed Associate Broker</p>
              <div className="inline-block mt-2 px-2.5 py-0.5 rounded text-[10px] uppercase font-mono tracking-wider bg-stone-100 text-stone-700">
                Torra Private Client Group
              </div>
            </div>

            <div className="w-full pt-4 border-t border-stone-100 text-left text-xs space-y-2 text-stone-500">
              <div className="flex justify-between">
                <span>Brokerage ID:</span>
                <span className="font-mono text-stone-800">TR-884920</span>
              </div>
              <div className="flex justify-between">
                <span>Accreditation:</span>
                <span className="text-emerald-700 font-medium">Verified Active</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-8 bg-white p-6 sm:p-8 rounded-lg border border-stone-200/90 shadow-xs">
            <h3 className="font-serif text-lg text-stone-900 mb-6">Broker Dossier Details</h3>

            {profileMessage && (
              <div className={`p-3 rounded text-xs mb-4 ${
                profileMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                {profileMessage.text}
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded focus:outline-none focus:border-stone-900 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Direct Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded focus:outline-none focus:border-stone-900 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Direct Phone *
                  </label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    placeholder="+1 (512) 555-0199"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded focus:outline-none focus:border-stone-900 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Primary Territory
                  </label>
                  <input
                    type="text"
                    value={profileData.location}
                    onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded focus:outline-none focus:border-stone-900 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Representation Specialties (Comma separated)
                </label>
                <input
                  type="text"
                  value={profileData.specialties}
                  onChange={(e) => setProfileData({ ...profileData, specialties: e.target.value })}
                  placeholder="Waterfront Estates, Historic Compounds, Modernist Penthouses"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded focus:outline-none focus:border-stone-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Executive Bio & Narrative
                </label>
                <textarea
                  rows={4}
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded focus:outline-none focus:border-stone-900 focus:bg-white leading-relaxed"
                />
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-medium text-white bg-[#b40101] hover:bg-[#900101] disabled:opacity-50 rounded transition-colors shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingProfile ? "Saving..." : "Save Profile"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab: Showing Hours */}
      {activeTab === 'hours' && (
        <div className="bg-white p-6 sm:p-8 rounded-lg border border-stone-200/90 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-stone-200">
            <div>
              <h3 className="font-serif text-lg text-stone-900">Showing & Appointment Availability</h3>
              <p className="text-xs text-stone-500">
                Specify window intervals for client showing requests and private consultations.
              </p>
            </div>
            <button
              onClick={handleSaveOfficeHours}
              disabled={savingHours}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-[#b40101] hover:bg-[#900101] rounded transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingHours ? 'Saving...' : 'Save Availability'}</span>
            </button>
          </div>

          <div className="divide-y divide-stone-100">
            {officeHours.map((h, i) => (
              <div key={h.day} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 w-36">
                  <input
                    type="checkbox"
                    checked={h.enabled}
                    onChange={(e) => {
                      const updated = [...officeHours];
                      updated[i].enabled = e.target.checked;
                      setOfficeHours(updated);
                    }}
                    className="rounded text-[#b40101] focus:ring-[#b40101]"
                  />
                  <span className={`font-medium ${h.enabled ? 'text-stone-900' : 'text-stone-400'}`}>
                    {h.day}
                  </span>
                </div>

                {h.enabled ? (
                  <div className="flex items-center gap-3">
                    <input
                      type="time"
                      value={h.open}
                      onChange={(e) => {
                        const updated = [...officeHours];
                        updated[i].open = e.target.value;
                        setOfficeHours(updated);
                      }}
                      className="px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded font-mono text-xs"
                    />
                    <span className="text-stone-400">to</span>
                    <input
                      type="time"
                      value={h.close}
                      onChange={(e) => {
                        const updated = [...officeHours];
                        updated[i].close = e.target.value;
                        setOfficeHours(updated);
                      }}
                      className="px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded font-mono text-xs"
                    />
                  </div>
                ) : (
                  <span className="text-stone-400 italic">Closed for showings</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Security */}
      {activeTab === 'security' && (
        <div className="max-w-xl bg-white p-6 sm:p-8 rounded-lg border border-stone-200/90 shadow-xs space-y-6">
          <div>
            <h3 className="font-serif text-lg text-stone-900">Update Access Password</h3>
            <p className="text-xs text-stone-500">
              Ensure your account credentials follow cryptographic security standards.
            </p>
          </div>

          {passwordMessage && (
            <div className={`p-3 rounded text-xs ${
              passwordMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              {passwordMessage.text}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Current Password *
              </label>
              <input
                type="password"
                required
                value={passwords.currentPassword}
                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded focus:outline-none focus:border-stone-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                New Password *
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded focus:outline-none focus:border-stone-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Confirm New Password *
              </label>
              <input
                type="password"
                required
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded focus:outline-none focus:border-stone-900 focus:bg-white"
              />
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                disabled={savingPassword}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-medium text-white bg-[#b40101] hover:bg-[#900101] disabled:opacity-50 rounded transition-colors shadow-xs"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{savingPassword ? "Updating..." : "Update Password"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab: Notifications */}
      {activeTab === 'notifications' && (
        <div className="bg-white p-6 sm:p-8 rounded-lg border border-stone-200/90 shadow-xs space-y-6">
          <div>
            <h3 className="font-serif text-lg text-stone-900">Notification Preferences</h3>
            <p className="text-xs text-stone-500">
              Control the delivery frequency of buyer inquiries, showing notifications, and offers.
            </p>
          </div>

          <div className="space-y-4 divide-y divide-stone-100 text-xs">
            {[
              { key: 'emailLeads', title: 'Email Lead Inquiries', desc: 'Receive immediate email notifications whenever a client inquires about your listing.' },
              { key: 'emailInquiries', title: 'Showing Requests', desc: 'Alert when a prospective buyer or agent requests a private showing.' },
              { key: 'smsLeads', title: 'SMS Instant Alerts', desc: 'Direct mobile SMS dispatch for high-priority inquiries.' },
              { key: 'pushAll', title: 'Browser Real-Time Pushes', desc: 'Real-time desktop alerts when active in the Torra Command Suite.' }
            ].map(item => (
              <div key={item.key} className="pt-3 flex items-center justify-between">
                <div>
                  <div className="font-medium text-stone-900">{item.title}</div>
                  <div className="text-[11px] text-stone-400">{item.desc}</div>
                </div>
                <input
                  type="checkbox"
                  checked={(notifications as any)[item.key]}
                  onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                  className="rounded text-[#b40101] focus:ring-[#b40101] h-4 w-4"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
