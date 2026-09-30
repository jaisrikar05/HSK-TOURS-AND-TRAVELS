import React, { useState, useRef } from 'react';
import {
  User, Mail, Phone, MapPin, FileText, CheckCircle2,
  Edit3, Save, RotateCcw, ShieldCheck, Award, HeartHandshake,
  Bus, Compass, Bell, Camera, Copy, Check, Upload, Sparkles,
  AlertCircle, ExternalLink, Printer
} from 'lucide-react';
import { CustomerProfile } from '../types';

interface CustomerProfileSectionProps {
  profile: CustomerProfile;
  onUpdateProfile: (updated: CustomerProfile) => void;
  onNavigateTab?: (tab: string) => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
];

export const CustomerProfileSection: React.FC<CustomerProfileSectionProps> = ({
  profile,
  onUpdateProfile,
  onNavigateTab
}) => {
  const [formData, setFormData] = useState<CustomerProfile>(profile);
  const [activeSubTab, setActiveSubTab] = useState<'personal' | 'preferences' | 'notifications'>('personal');
  const [isSavedRecently, setIsSavedRecently] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasUnsavedChanges = JSON.stringify(formData) !== JSON.stringify(profile);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const validate = () => {
    const errors: { [key: string]: string } = {};
    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      errors.email = 'Valid email is required';
    }
    if (!formData.phone.trim() || formData.phone.length < 10) {
      errors.phone = 'Valid phone number is required';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validate()) {
      return;
    }

    onUpdateProfile(formData);
    setIsSavedRecently(true);
    setTimeout(() => setIsSavedRecently(false), 3500);
  };

  const handleReset = () => {
    setFormData(profile);
    setValidationErrors({});
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setFormData((prev) => ({ ...prev, avatarUrl: result }));
        setIsAvatarPickerOpen(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCustomUrl = () => {
    if (customAvatarUrl.trim()) {
      setFormData((prev) => ({ ...prev, avatarUrl: customAvatarUrl.trim() }));
      setCustomAvatarUrl('');
      setIsAvatarPickerOpen(false);
    }
  };

  return (
    <div className="space-y-8 font-['Inter']">
      
      {/* SUCCESS NOTIFICATION TOAST BANNER */}
      {isSavedRecently && (
        <div className="bg-emerald-500 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center justify-between animate-fade-in border-2 border-emerald-400">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
            <div>
              <p className="font-black text-sm">Customer Profile Updated Successfully!</p>
              <p className="text-xs text-emerald-100 font-medium">
                Your profile information, contact numbers, and travel preferences have been saved and synced.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSavedRecently(false)}
            className="text-xs bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg font-black transition cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* HEADER PROFILE HERO CARD */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border-2 border-indigo-900/50 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* AVATAR WITH BADGE */}
            <div className="relative group shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border-4 border-amber-400/80 shadow-2xl bg-indigo-900">
                <img
                  src={formData.avatarUrl || profile.avatarUrl}
                  alt={formData.fullName}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Change Avatar Button Overlay */}
              <button
                type="button"
                onClick={() => setIsAvatarPickerOpen(true)}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl flex flex-col items-center justify-center text-white cursor-pointer"
                title="Change Profile Photo"
              >
                <Camera className="w-6 h-6 text-amber-300" />
                <span className="text-[10px] font-black uppercase mt-1">Change</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAvatarPickerOpen(true)}
                className="absolute -bottom-1 -right-1 bg-amber-400 hover:bg-amber-300 text-slate-950 p-2 rounded-xl shadow-lg transition cursor-pointer border-2 border-slate-900"
                title="Change Photo"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* NAME, TIER & BADGES */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
                  <Award className="w-3 h-3 text-slate-950" />
                  {formData.tier}
                </span>

                <span className="bg-indigo-900/80 text-indigo-200 border border-indigo-700/60 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  KYC Verified
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black font-['Manrope'] text-white">
                {formData.fullName || 'Customer Profile'}
              </h2>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 font-medium">
                <span className="flex items-center gap-1 text-amber-300 font-mono font-bold">
                  ID: {formData.memberId}
                  <button
                    onClick={() => handleCopy(formData.memberId, 'memberId')}
                    className="p-1 hover:text-white transition cursor-pointer"
                    title="Copy Member ID"
                  >
                    {copiedField === 'memberId' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-indigo-400" />
                  {formData.email}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  {formData.phone}
                </span>
              </div>

              <p className="text-xs text-slate-400 font-medium pt-1">
                Member since {formData.joinDate} • Preferred Coach: <span className="text-amber-200 font-bold">{formData.preferredCoachType}</span>
              </p>
            </div>
          </div>

          {/* LOYALTY POINTS & QUICK STATS */}
          <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-800 gap-4">
            <div className="text-left md:text-right bg-slate-800/80 border border-slate-700/80 p-3.5 rounded-2xl">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                Loyalty & Mileage Points
              </span>
              <span className="text-2xl font-black text-amber-400 font-['Manrope']">
                {formData.loyaltyPoints.toLocaleString()} PTS
              </span>
              <span className="text-[10px] text-emerald-400 font-bold block mt-0.5">
                Eligible for ₹{(formData.loyaltyPoints * 0.5).toLocaleString()} instant discount
              </span>
            </div>

            {hasUnsavedChanges && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-black px-4 py-2 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 border border-slate-700"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Discard</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSave()}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 shadow-lg"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AVATAR PICKER MODAL */}
      {isAvatarPickerOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 border-2 border-slate-300 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b-2 border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Camera className="w-4 h-4" />
                </div>
                <h3 className="font-black text-base text-black font-['Manrope']">
                  Choose Profile Photo
                </h3>
              </div>
              <button
                onClick={() => setIsAvatarPickerOpen(false)}
                className="text-slate-400 hover:text-black p-1 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* PRESET AVATARS */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                Select from Presets
              </label>
              <div className="grid grid-cols-3 gap-3">
                {AVATAR_PRESETS.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, avatarUrl: img }));
                      setIsAvatarPickerOpen(false);
                    }}
                    className={`relative rounded-2xl overflow-hidden aspect-square border-2 transition cursor-pointer group ${
                      formData.avatarUrl === img
                        ? 'border-indigo-600 ring-2 ring-indigo-500/40'
                        : 'border-slate-200 hover:border-indigo-400'
                    }`}
                  >
                    <img src={img} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    {formData.avatarUrl === img && (
                      <div className="absolute top-1 right-1 bg-indigo-600 text-white rounded-full p-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* UPLOAD FROM DEVICE */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                Upload from Device
              </label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-black font-black text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-2 border border-slate-300"
              >
                <Upload className="w-4 h-4 text-indigo-600" />
                <span>Choose Image File (PNG, JPG)</span>
              </button>
            </div>

            {/* CUSTOM IMAGE URL */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                Or Paste Image Web Link
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://example.com/my-photo.jpg"
                  value={customAvatarUrl}
                  onChange={(e) => setCustomAvatarUrl(e.target.value)}
                  className="flex-1 bg-slate-50 border-2 border-slate-300 rounded-xl px-3 py-2 text-xs text-black font-medium focus:outline-none focus:border-indigo-600"
                />
                <button
                  type="button"
                  onClick={handleApplyCustomUrl}
                  className="bg-indigo-700 hover:bg-indigo-800 text-white font-black text-xs px-4 py-2 rounded-xl transition cursor-pointer"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NAVIGATION TABS FOR PROFILE SUB-SECTIONS */}
      <div className="flex flex-wrap items-center gap-2 border-b-2 border-slate-300 pb-3">
        <button
          type="button"
          onClick={() => setActiveSubTab('personal')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition cursor-pointer ${
            activeSubTab === 'personal'
              ? 'bg-indigo-700 text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Personal & Contact</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('preferences')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition cursor-pointer ${
            activeSubTab === 'preferences'
              ? 'bg-indigo-700 text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
          }`}
        >
          <Bus className="w-4 h-4" />
          <span>Travel & Seating Preferences</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('notifications')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition cursor-pointer ${
            activeSubTab === 'notifications'
              ? 'bg-indigo-700 text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Alerts & Notifications</span>
        </button>
      </div>

      {/* FORM CONTENT CONTAINER */}
      <form onSubmit={handleSave} className="space-y-8">
        
        {/* ========================================================================= */}
        {/* TAB 1: PERSONAL & CONTACT INFORMATION */}
        {/* ========================================================================= */}
        {activeSubTab === 'personal' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-300 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b-2 border-slate-200">
              <div>
                <h3 className="text-lg font-black text-black font-['Manrope']">
                  Personal & Contact Information
                </h3>
                <p className="text-xs text-slate-600 font-bold">
                  These details appear on your booking confirmations, driver manifests, and passenger boarding passes.
                </p>
              </div>
              <span className="text-[10px] bg-indigo-50 text-indigo-900 border border-indigo-200 font-black px-2.5 py-1 rounded-full uppercase">
                Primary Identity
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-black uppercase tracking-wider flex items-center justify-between">
                  <span>Full Name *</span>
                  {validationErrors.fullName && (
                    <span className="text-[10px] text-rose-600 font-bold normal-case">
                      {validationErrors.fullName}
                    </span>
                  )}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Enter full name"
                    className={`w-full bg-slate-50 border-2 rounded-2xl pl-10 pr-4 py-3 text-sm text-black font-bold focus:outline-none focus:bg-white transition ${
                      validationErrors.fullName ? 'border-rose-400' : 'border-slate-300 focus:border-indigo-600'
                    }`}
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-black uppercase tracking-wider flex items-center justify-between">
                  <span>Email Address *</span>
                  <span className="text-[10px] text-emerald-700 font-black bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Verified
                  </span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="traveler@domain.com"
                    className="w-full bg-slate-50 border-2 border-slate-300 focus:border-indigo-600 rounded-2xl pl-10 pr-4 py-3 text-sm text-black font-bold focus:outline-none focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Primary Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-black uppercase tracking-wider flex items-center justify-between">
                  <span>Primary Mobile (WhatsApp Enabled) *</span>
                  <span className="text-[10px] text-emerald-700 font-black bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Active
                  </span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98450 11234"
                    className="w-full bg-slate-50 border-2 border-slate-300 focus:border-indigo-600 rounded-2xl pl-10 pr-4 py-3 text-sm text-black font-bold focus:outline-none focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Alternate Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-black uppercase tracking-wider">
                  Alternate Contact Number (Optional)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    value={formData.alternatePhone || ''}
                    onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })}
                    placeholder="+91 94480 22334"
                    className="w-full bg-slate-50 border-2 border-slate-300 focus:border-indigo-600 rounded-2xl pl-10 pr-4 py-3 text-sm text-black font-bold focus:outline-none focus:bg-white transition"
                  />
                </div>
              </div>
            </div>

            {/* Residential / Postal Address */}
            <div className="pt-4 border-t border-slate-200 space-y-4">
              <h4 className="text-sm font-black text-black uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-600" />
                <span>Residential / Postal Address</span>
              </h4>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-black text-slate-700">Street Address / Apartment</label>
                  <input
                    type="text"
                    value={formData.addressLine}
                    onChange={(e) => setFormData({ ...formData, addressLine: e.target.value })}
                    placeholder="Flat / House No., Apartment, Street, Landmark"
                    className="w-full mt-1 bg-slate-50 border-2 border-slate-300 focus:border-indigo-600 rounded-2xl px-4 py-2.5 text-sm text-black font-bold focus:outline-none focus:bg-white transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-black text-slate-700">City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="e.g. Bengaluru"
                      className="w-full mt-1 bg-slate-50 border-2 border-slate-300 focus:border-indigo-600 rounded-2xl px-4 py-2.5 text-sm text-black font-bold focus:outline-none focus:bg-white transition"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black text-slate-700">State</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      placeholder="e.g. Karnataka"
                      className="w-full mt-1 bg-slate-50 border-2 border-slate-300 focus:border-indigo-600 rounded-2xl px-4 py-2.5 text-sm text-black font-bold focus:outline-none focus:bg-white transition"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black text-slate-700">PIN Code</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      placeholder="560038"
                      className="w-full mt-1 bg-slate-50 border-2 border-slate-300 focus:border-indigo-600 rounded-2xl px-4 py-2.5 text-sm text-black font-bold focus:outline-none focus:bg-white transition font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="pt-4 border-t border-slate-200 space-y-4">
              <h4 className="text-sm font-black text-black uppercase tracking-wider flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-rose-600" />
                <span>On-Tour Emergency Contact</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-black text-slate-700">Contact Person Name</label>
                  <input
                    type="text"
                    value={formData.emergencyContactName}
                    onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                    placeholder="e.g. Priya Sharma"
                    className="w-full mt-1 bg-slate-50 border-2 border-slate-300 focus:border-indigo-600 rounded-2xl px-4 py-2.5 text-sm text-black font-bold focus:outline-none focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-slate-700">Relationship</label>
                  <select
                    value={formData.emergencyContactRelation}
                    onChange={(e) => setFormData({ ...formData, emergencyContactRelation: e.target.value })}
                    className="w-full mt-1 bg-slate-50 border-2 border-slate-300 focus:border-indigo-600 rounded-2xl px-4 py-2.5 text-sm text-black font-bold focus:outline-none focus:bg-white transition cursor-pointer"
                  >
                    <option value="Spouse">Spouse</option>
                    <option value="Parent">Parent</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Friend">Friend / Colleague</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-black text-slate-700">Emergency Phone</label>
                  <input
                    type="tel"
                    value={formData.emergencyContactPhone}
                    onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                    placeholder="+91 98450 99887"
                    className="w-full mt-1 bg-slate-50 border-2 border-slate-300 focus:border-indigo-600 rounded-2xl px-4 py-2.5 text-sm text-black font-bold focus:outline-none focus:bg-white transition"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: TRAVEL, COACH & SEATING PREFERENCES */}
        {/* ========================================================================= */}
        {activeSubTab === 'preferences' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-300 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b-2 border-slate-200">
              <div>
                <h3 className="text-lg font-black text-black font-['Manrope']">
                  Travel & Seating Preferences
                </h3>
                <p className="text-xs text-slate-600 font-bold">
                  Customize your default seating, preferred coach models, and onboard dining choices.
                </p>
              </div>
              <span className="text-[10px] bg-amber-100 text-amber-950 border border-amber-300 font-black px-2.5 py-1 rounded-full uppercase">
                Smart Auto-Assign
              </span>
            </div>

            {/* SEAT POSITION PREFERENCE */}
            <div className="space-y-3">
              <label className="text-xs font-black text-black uppercase tracking-wider block">
                Preferred Seating / Berth Position
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {(['Window', 'Aisle', 'Lower Berth', 'Sleeper Upper', 'Any'] as const).map((seat) => (
                  <button
                    key={seat}
                    type="button"
                    onClick={() => setFormData({ ...formData, preferredSeat: seat })}
                    className={`py-3 px-4 rounded-2xl text-xs font-black transition cursor-pointer border-2 text-center ${
                      formData.preferredSeat === seat
                        ? 'bg-indigo-700 text-white border-indigo-800 shadow-md'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-300'
                    }`}
                  >
                    {seat}
                  </button>
                ))}
              </div>
            </div>

            {/* PREFERRED COACH CATEGORY */}
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <label className="text-xs font-black text-black uppercase tracking-wider block">
                Preferred HSK Coach Model
              </label>
              <select
                value={formData.preferredCoachType}
                onChange={(e) => setFormData({ ...formData, preferredCoachType: e.target.value })}
                className="w-full bg-slate-50 border-2 border-slate-300 focus:border-indigo-600 rounded-2xl px-4 py-3 text-sm text-black font-bold focus:outline-none focus:bg-white transition cursor-pointer"
              >
                <option value="BharatBenz AC Sleeper (Luxury 2+1)">BharatBenz AC Sleeper (Luxury 2+1) - 30 Berths</option>
                <option value="Volvo B11R Multi-Axle (Club Class)">Volvo B11R Multi-Axle (Club Class) - 49 Recliner Seats</option>
                <option value="Force Urbania Super Luxury">Force Urbania Super Luxury - 12 VIP Captain Seats</option>
                <option value="Executive Tempo Traveler">Executive Tempo Traveler - 16 Recliners</option>
                <option value="Scania Metrolink HD">Scania Metrolink HD - 45 Recliners</option>
              </select>
            </div>

            {/* DIETARY & FOOD PREFERENCES */}
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <label className="text-xs font-black text-black uppercase tracking-wider block">
                On-Board Catering & Meal Preference
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(['Pure Vegetarian', 'Jain Food', 'Non-Vegetarian', 'No Preference'] as const).map((meal) => (
                  <button
                    key={meal}
                    type="button"
                    onClick={() => setFormData({ ...formData, mealPreference: meal })}
                    className={`py-3 px-3 rounded-2xl text-xs font-black transition cursor-pointer border-2 text-center ${
                      formData.mealPreference === meal
                        ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-md'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-300'
                    }`}
                  >
                    {meal}
                  </button>
                ))}
              </div>
            </div>

            {/* PREFERRED LANGUAGE */}
            <div className="space-y-2 pt-4 border-t border-slate-200">
              <label className="text-xs font-black text-black uppercase tracking-wider block">
                Driver & Travel Concierge Language Preference
              </label>
              <input
                type="text"
                value={formData.preferredLanguage}
                onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value })}
                placeholder="e.g. English / Kannada / Hindi"
                className="w-full bg-slate-50 border-2 border-slate-300 focus:border-indigo-600 rounded-2xl px-4 py-3 text-sm text-black font-bold focus:outline-none focus:bg-white transition"
              />
              <p className="text-[11px] text-slate-500 font-medium">
                Our operations team assigns multi-lingual pilots and captains fluent in your selected languages.
              </p>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: ALERTS, NOTIFICATIONS & PRIVACY */}
        {/* ========================================================================= */}
        {activeSubTab === 'notifications' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-300 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b-2 border-slate-200">
              <div>
                <h3 className="text-lg font-black text-black font-['Manrope']">
                  Alerts & Notification Channels
                </h3>
                <p className="text-xs text-slate-600 font-bold">
                  Choose how you want to receive real-time coach tracking, driver coordinates, and travel vouchers.
                </p>
              </div>
              <span className="text-[10px] bg-emerald-100 text-emerald-950 border border-emerald-300 font-black px-2.5 py-1 rounded-full uppercase">
                Real-Time Telematics
              </span>
            </div>

            <div className="space-y-4">
              {/* WhatsApp Notification */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border-2 border-slate-200">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-black text-black flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    WhatsApp Trip Alerts & Driver Tracking
                  </h4>
                  <p className="text-xs text-slate-600 font-medium">
                    Receive instant boarding point Google Maps pins, driver mobile numbers, and live coach ETA directly on WhatsApp ({formData.phone}).
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.notifyWhatsApp}
                  onChange={(e) => setFormData({ ...formData, notifyWhatsApp: e.target.checked })}
                  className="w-5 h-5 accent-indigo-700 cursor-pointer"
                />
              </div>

              {/* SMS Notification */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border-2 border-slate-200">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-black text-black flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                    SMS Departure & Boarding Reminders
                  </h4>
                  <p className="text-xs text-slate-600 font-medium">
                    Automated SMS 2 hours prior to coach departure with vehicle registration and driver contact.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.notifySms}
                  onChange={(e) => setFormData({ ...formData, notifySms: e.target.checked })}
                  className="w-5 h-5 accent-indigo-700 cursor-pointer"
                />
              </div>

              {/* Email Booking Confirmations & Receipts */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border-2 border-slate-200">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-black text-black flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    Email Travel Itineraries & Booking Receipts
                  </h4>
                  <p className="text-xs text-slate-600 font-medium">
                    Instant PDF travel pass and booking confirmation receipt dispatched to {formData.email}.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.notifyEmailInvoice}
                  onChange={(e) => setFormData({ ...formData, notifyEmailInvoice: e.target.checked })}
                  className="w-5 h-5 accent-indigo-700 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* BOTTOM SAVE & ACTION BAR */}
        <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 border-2 border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-800 text-amber-300 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="font-black text-sm text-white">
                {hasUnsavedChanges ? 'You have unsaved changes in your profile' : 'Profile up to date & verified'}
              </p>
              <p className="text-xs text-slate-300 font-medium">
                Changes will automatically update your boarding passes, travel vouchers, and passenger trip manifests.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {hasUnsavedChanges && (
              <button
                type="button"
                onClick={handleReset}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-black px-5 py-3 rounded-2xl text-xs uppercase tracking-wider transition cursor-pointer"
              >
                Cancel Changes
              </button>
            )}

            <button
              type="submit"
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-7 py-3 rounded-2xl text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-2 shadow-lg hover:shadow-amber-400/20"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile & Preferences</span>
            </button>
          </div>
        </div>
      </form>

      {/* LIVE BOARDING PASS & VOUCHER PREVIEW */}
      <div className="bg-gradient-to-r from-slate-100 to-indigo-50/50 rounded-3xl p-6 sm:p-8 border-2 border-slate-300 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-700" />
            <h4 className="font-black text-sm uppercase tracking-wider text-black font-['Manrope']">
              Live Preview: How your profile appears on travel passes & vouchers
            </h4>
          </div>
          <span className="text-[10px] bg-slate-200 text-slate-800 font-black px-2.5 py-1 rounded-full uppercase">
            Auto-Generated
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border-2 border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase">Passenger Details</span>
            <p className="font-black text-sm text-black">{formData.fullName}</p>
            <p className="text-slate-600 font-medium">{formData.phone} • {formData.email}</p>
            <p className="text-indigo-900 font-bold">Seat Preference: {formData.preferredSeat}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase">Residential Location</span>
            <p className="font-black text-sm text-black">
              {formData.city}, {formData.state}
            </p>
            <p className="text-slate-600 font-medium truncate">
              {formData.addressLine}
            </p>
            <p className="font-mono font-bold text-slate-800">PIN: {formData.pincode}</p>
          </div>

          <div className="space-y-1 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase">Emergency Support</span>
              <p className="font-bold text-black">{formData.emergencyContactName} ({formData.emergencyContactRelation})</p>
              <p className="text-slate-600">{formData.emergencyContactPhone}</p>
            </div>
            <div className="pt-2">
              <span className="text-[10px] bg-emerald-100 text-emerald-950 font-black px-2 py-0.5 rounded border border-emerald-300">
                Verified HSK Traveler Profile
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
