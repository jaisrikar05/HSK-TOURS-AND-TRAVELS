import React, { useState, useRef } from 'react';
import {
  ShieldCheck, Shield, User, Mail, Phone, MapPin, Building,
  FileText, CheckCircle2, Edit3, Save, RotateCcw, Award,
  Camera, Copy, Check, Upload, Sparkles, AlertCircle,
  Lock, KeyRound, Bell, Radio, Printer, QrCode, ArrowRight,
  Briefcase, Hash, Globe, CheckCheck, RefreshCw
} from 'lucide-react';
import { AdminProfile } from '../types';

interface AdminProfileSectionProps {
  profile: AdminProfile;
  onUpdateProfile: (updated: AdminProfile) => void;
  onNavigateTab?: (tab: string) => void;
  onLockSession?: () => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300',
];

const ROLE_PRESETS = [
  'Chief Operations Officer & Master Controller',
  'Fleet Director & Logistics Head',
  'Senior Dispatch & Route Controller',
  'Customer Experience & Charter Manager',
  'Central Operations Executive'
];

const BASE_HUBS = [
  'Coimbatore Central Fleet Terminal (HQ)',
  'Bengaluru Indiranagar Logistics Hub',
  'Chennai Koyambedu Coach Depot',
  'Madurai Junction Service Center',
  'Ooty Hill Operations Station'
];

export const AdminProfileSection: React.FC<AdminProfileSectionProps> = ({
  profile,
  onUpdateProfile,
  onNavigateTab,
  onLockSession,
}) => {
  const [formData, setFormData] = useState<AdminProfile>(profile);
  const [activeSubTab, setActiveSubTab] = useState<'identity' | 'avatar' | 'security' | 'idcard'>('identity');
  const [isSavedRecently, setIsSavedRecently] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasUnsavedChanges = JSON.stringify(formData) !== JSON.stringify(profile);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!formData.fullName.trim()) {
      errors.fullName = 'Full Name is required';
    } else if (formData.fullName.trim().length < 2) {
      errors.fullName = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      errors.email = 'Valid administrative email is required for 2FA';
    }

    if (!formData.phone.trim() || formData.phone.length < 8) {
      errors.phone = 'Valid direct phone number is required';
    }

    if (!formData.employeeId.trim()) {
      errors.employeeId = 'Employee ID / Admin badge is required';
    }

    if (!formData.roleTitle.trim()) {
      errors.roleTitle = 'Executive role title is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      setActiveSubTab('identity');
      return;
    }

    const now = new Date();
    const updated: AdminProfile = {
      ...formData,
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      roleTitle: formData.roleTitle.trim(),
      department: formData.department.trim(),
      employeeId: formData.employeeId.trim().toUpperCase(),
      baseHub: formData.baseHub.trim(),
      digitalSignatureName: formData.digitalSignatureName.trim() || `${formData.fullName.trim()} [Admin]`,
      lastUpdated: `${now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} at ${now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`
    };

    onUpdateProfile(updated);
    setIsSavedRecently(true);
    setTimeout(() => setIsSavedRecently(false), 4000);
  };

  const handleReset = () => {
    setFormData(profile);
    setValidationErrors({});
    setIsAvatarPickerOpen(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2.5 * 1024 * 1024) {
        alert('Image size exceeds 2.5MB. Please choose a smaller photo.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setFormData(prev => ({ ...prev, avatarUrl: reader.result as string }));
          setIsAvatarPickerOpen(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyCustomUrl = () => {
    if (customAvatarUrl.trim()) {
      setFormData(prev => ({ ...prev, avatarUrl: customAvatarUrl.trim() }));
      setCustomAvatarUrl('');
      setIsAvatarPickerOpen(false);
    }
  };

  const handlePrintBadge = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-fade-in font-['Inter']">
      {/* SUCCESS TOAST BANNER */}
      {isSavedRecently && (
        <div className="bg-emerald-600 text-white p-4 sm:p-5 rounded-3xl shadow-xl flex items-center justify-between gap-4 animate-bounce">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-black text-sm font-['Manrope'] uppercase tracking-wider">
                Admin Profile Updated Successfully!
              </p>
              <p className="text-xs text-emerald-100 font-medium">
                Your credentials, base dispatch hub, and notification preferences have been saved and synced.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSavedRecently(false)}
            className="text-white hover:text-emerald-200 text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ADMIN PROFILE HERO HEADER */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border-2 border-amber-800/60 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 opacity-10 pointer-events-none">
          <Shield className="w-96 h-96 text-amber-400" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* AVATAR WITH BADGE */}
            <div className="relative group">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl overflow-hidden border-4 border-amber-500 shadow-2xl bg-slate-800 shrink-0">
                <img
                  src={formData.avatarUrl}
                  alt={formData.fullName}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveSubTab('avatar');
                  setIsAvatarPickerOpen(true);
                }}
                className="absolute -bottom-2 -right-2 bg-amber-500 hover:bg-amber-400 text-slate-950 p-2 rounded-xl shadow-lg transition cursor-pointer"
                title="Change admin photo"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* NAME & DESIGNATION */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
                  <ShieldCheck className="w-3 h-3 text-slate-950" />
                  Master Admin
                </span>
                <span className="bg-emerald-950 text-emerald-300 border border-emerald-700/60 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCheck className="w-3 h-3 text-emerald-400" />
                  2FA Active
                </span>
                <span className="bg-indigo-950 text-indigo-300 border border-indigo-700/60 text-[10px] font-black px-2.5 py-0.5 rounded-full font-mono">
                  {formData.employeeId}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black font-['Manrope'] text-white">
                {formData.fullName}
              </h2>

              <p className="text-xs text-amber-200 font-bold flex items-center gap-2 flex-wrap">
                <span>{formData.roleTitle}</span>
                <span>•</span>
                <span className="text-slate-300">{formData.department}</span>
              </p>

              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 font-mono pt-1">
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3 text-amber-400" />
                  {formData.email}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-amber-400" />
                  {formData.phone}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-400" />
                  {formData.baseHub}
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT HERO ACTIONS */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 self-end md:self-center">
            {hasUnsavedChanges && (
              <div className="bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-black px-3 py-2 rounded-xl flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Unsaved Edits</span>
              </div>
            )}

            {onLockSession && (
              <button
                type="button"
                onClick={onLockSession}
                className="bg-slate-800 hover:bg-slate-700 text-rose-300 border border-slate-700 font-black px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 shadow-sm"
              >
                <Lock className="w-3.5 h-3.5 text-rose-400" />
                <span>Lock Session</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveSubTab('idcard')}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 shadow-lg"
            >
              <Award className="w-3.5 h-3.5 text-slate-950" />
              <span>View Executive ID Card</span>
            </button>
          </div>
        </div>

        {/* HERO STATS BAR */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-slate-800/80 text-xs">
          <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
            <span className="text-[10px] text-amber-300 font-black uppercase tracking-wider block">Clearance Level</span>
            <span className="font-black text-white text-sm">Level 5 (Master)</span>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
            <span className="text-[10px] text-amber-300 font-black uppercase tracking-wider block">Two-Step Verification</span>
            <span className="font-black text-emerald-400 text-sm">Active via Gmail</span>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
            <span className="text-[10px] text-amber-300 font-black uppercase tracking-wider block">Assigned Base Hub</span>
            <span className="font-black text-white text-sm truncate block">{formData.baseHub}</span>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
            <span className="text-[10px] text-amber-300 font-black uppercase tracking-wider block">Last Profile Update</span>
            <span className="font-black text-slate-300 text-sm truncate block">{formData.lastUpdated || 'Initial Setup'}</span>
          </div>
        </div>
      </div>

      {/* EDITING FORM & SUB-NAVIGATION */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SUB-TABS NAVIGATION */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border-2 border-slate-300">
          <button
            type="button"
            onClick={() => setActiveSubTab('identity')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition cursor-pointer ${
              activeSubTab === 'identity'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-white text-slate-800 hover:bg-slate-200 border border-slate-300'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Executive Identity & Role</span>
            {validationErrors.fullName || validationErrors.email || validationErrors.phone ? (
              <span className="w-2 h-2 rounded-full bg-rose-500" />
            ) : null}
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('avatar')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition cursor-pointer ${
              activeSubTab === 'avatar'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-white text-slate-800 hover:bg-slate-200 border border-slate-300'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Photo & Avatar</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('security')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition cursor-pointer ${
              activeSubTab === 'security'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-white text-slate-800 hover:bg-slate-200 border border-slate-300'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Operations & Alerts</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('idcard')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition cursor-pointer ${
              activeSubTab === 'idcard'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-white text-slate-800 hover:bg-slate-200 border border-slate-300'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Official HSK ID Badge</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* SUB-TAB 1: EXECUTIVE IDENTITY & ROLE */}
        {/* ========================================================================= */}
        {activeSubTab === 'identity' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-300 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b-2 border-slate-200">
              <div>
                <h3 className="text-lg font-black text-black font-['Manrope']">
                  Administrative Personnel Information
                </h3>
                <p className="text-xs text-slate-600 font-bold">
                  Update your executive designation, base station hub, and contact credentials.
                </p>
              </div>
              <span className="text-[10px] bg-amber-100 text-amber-950 font-black px-2.5 py-1 rounded-full uppercase border border-amber-300">
                Level 5 Clearance
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-black uppercase tracking-wider flex items-center justify-between">
                  <span>Full Legal / Admin Name *</span>
                  {validationErrors.fullName && (
                    <span className="text-[10px] text-rose-600 font-bold">{validationErrors.fullName}</span>
                  )}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Srikar G. K."
                    className="w-full bg-slate-50 border-2 border-slate-300 focus:border-amber-600 rounded-2xl pl-10 pr-4 py-3 text-sm text-black font-bold focus:outline-none focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Employee ID */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-black uppercase tracking-wider flex items-center justify-between">
                  <span>Executive Employee ID *</span>
                  {validationErrors.employeeId && (
                    <span className="text-[10px] text-rose-600 font-bold">{validationErrors.employeeId}</span>
                  )}
                </label>
                <div className="relative">
                  <Hash className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value.toUpperCase() })}
                    placeholder="HSK-ADM-001"
                    className="w-full bg-slate-50 border-2 border-slate-300 focus:border-amber-600 rounded-2xl pl-10 pr-4 py-3 text-sm text-black font-mono font-black uppercase tracking-wider focus:outline-none focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Role Title with Presets */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-black text-black uppercase tracking-wider flex items-center justify-between">
                  <span>Executive Designation / Role Title *</span>
                  {validationErrors.roleTitle && (
                    <span className="text-[10px] text-rose-600 font-bold">{validationErrors.roleTitle}</span>
                  )}
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={formData.roleTitle}
                    onChange={(e) => setFormData({ ...formData, roleTitle: e.target.value })}
                    placeholder="e.g. Chief Operations Officer & Master Controller"
                    className="w-full bg-slate-50 border-2 border-slate-300 focus:border-amber-600 rounded-2xl pl-10 pr-4 py-3 text-sm text-black font-bold focus:outline-none focus:bg-white transition"
                  />
                </div>
                {/* Role quick presets chips */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-600 font-black uppercase">Quick presets:</span>
                  {ROLE_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setFormData({ ...formData, roleTitle: preset })}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border font-bold transition cursor-pointer ${
                        formData.roleTitle === preset
                          ? 'bg-amber-100 text-amber-950 border-amber-400 font-black'
                          : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Department */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-black uppercase tracking-wider">
                  Operational Department / Unit
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="e.g. HSK Central Operations & Fleet Logistics"
                    className="w-full bg-slate-50 border-2 border-slate-300 focus:border-amber-600 rounded-2xl pl-10 pr-4 py-3 text-sm text-black font-bold focus:outline-none focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Base Station Hub Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-black uppercase tracking-wider">
                  Assigned Operating Base Hub
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <select
                    value={formData.baseHub}
                    onChange={(e) => setFormData({ ...formData, baseHub: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-300 focus:border-amber-600 rounded-2xl pl-10 pr-4 py-3 text-sm text-black font-bold focus:outline-none focus:bg-white transition cursor-pointer"
                  >
                    {BASE_HUBS.map((hub) => (
                      <option key={hub} value={hub}>
                        {hub}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Administrative Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-black uppercase tracking-wider flex items-center justify-between">
                  <span>Administrative Email (2FA Delivery) *</span>
                  {validationErrors.email && (
                    <span className="text-[10px] text-rose-600 font-bold">{validationErrors.email}</span>
                  )}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="admin@hsktours.com"
                    className="w-full bg-slate-50 border-2 border-slate-300 focus:border-amber-600 rounded-2xl pl-10 pr-4 py-3 text-sm text-black font-bold focus:outline-none focus:bg-white transition"
                  />
                </div>
                <p className="text-[11px] text-amber-800 font-semibold">
                  Two-step verification security codes are dispatched to this address.
                </p>
              </div>

              {/* Direct Hotline Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-black uppercase tracking-wider flex items-center justify-between">
                  <span>Direct Dispatch Phone Number *</span>
                  {validationErrors.phone && (
                    <span className="text-[10px] text-rose-600 font-bold">{validationErrors.phone}</span>
                  )}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98450 11234"
                    className="w-full bg-slate-50 border-2 border-slate-300 focus:border-amber-600 rounded-2xl pl-10 pr-4 py-3 text-sm text-black font-bold focus:outline-none focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Alternate Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-black uppercase tracking-wider">
                  Alternate / Office Landline
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    value={formData.alternatePhone || ''}
                    onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })}
                    placeholder="+91 80 2345 6789"
                    className="w-full bg-slate-50 border-2 border-slate-300 focus:border-amber-600 rounded-2xl pl-10 pr-4 py-3 text-sm text-black font-bold focus:outline-none focus:bg-white transition"
                  />
                </div>
              </div>

              {/* 24/7 Breakdown & Emergency Backup Contact */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-black uppercase tracking-wider">
                  24/7 Breakdown / Emergency Desk Phone
                </label>
                <div className="relative">
                  <Radio className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    placeholder="+91 94433 22110 (24/7 Recovery Desk)"
                    className="w-full bg-slate-50 border-2 border-slate-300 focus:border-amber-600 rounded-2xl pl-10 pr-4 py-3 text-sm text-black font-bold focus:outline-none focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Digital Dispatch Signature */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-black text-black uppercase tracking-wider">
                  Digital Dispatch Signature (Printed on Charter Sheets & Vouchers)
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={formData.digitalSignatureName}
                    onChange={(e) => setFormData({ ...formData, digitalSignatureName: e.target.value })}
                    placeholder="Srikar G.K. [Chief Dispatch Controller]"
                    className="w-full bg-slate-50 border-2 border-slate-300 focus:border-amber-600 rounded-2xl pl-10 pr-4 py-3 text-sm text-black font-bold focus:outline-none focus:bg-white transition"
                  />
                </div>
                <p className="text-[11px] text-slate-600 font-medium">
                  This signature stamp automatically authorizes driver trip sheets, vehicle permit waivers, and booking manifests.
                </p>
              </div>

              {/* Operational Scope & Bio */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-black text-black uppercase tracking-wider">
                  Executive Scope of Responsibilities & Bio
                </label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Describe your administrative roles, fleet oversight, and VIP client logistics responsibilities..."
                  className="w-full bg-slate-50 border-2 border-slate-300 focus:border-amber-600 rounded-2xl p-4 text-sm text-black font-bold focus:outline-none focus:bg-white transition"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUB-TAB 2: PHOTO & AVATAR */}
        {/* ========================================================================= */}
        {activeSubTab === 'avatar' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-300 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b-2 border-slate-200">
              <div>
                <h3 className="text-lg font-black text-black font-['Manrope']">
                  Executive Portrait & Profile Picture
                </h3>
                <p className="text-xs text-slate-600 font-bold">
                  Choose from professional executive portraits, upload a custom picture, or provide a photo URL.
                </p>
              </div>
              <span className="text-[10px] bg-slate-100 text-slate-800 font-black px-2.5 py-1 rounded-full uppercase border border-slate-300">
                Visual Identity
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-300">
              <div className="w-28 h-28 rounded-3xl overflow-hidden border-4 border-amber-500 shadow-xl bg-slate-800 shrink-0">
                <img
                  src={formData.avatarUrl}
                  alt={formData.fullName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-2 text-center sm:text-left">
                <h4 className="font-black text-base text-black font-['Manrope']">
                  {formData.fullName}
                </h4>
                <p className="text-xs text-slate-600 font-bold">
                  {formData.roleTitle} • {formData.employeeId}
                </p>
                <p className="text-xs text-slate-500">
                  This photo is shown on your Executive Dashboard, driver dispatch logs, and authorized staff badge.
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-2 justify-center sm:justify-start">
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
                    className="bg-amber-600 hover:bg-amber-700 text-white font-black text-xs px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Image from Device</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAvatarPickerOpen(!isAvatarPickerOpen)}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-900 font-black text-xs px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Select Preset Portrait</span>
                  </button>
                </div>
              </div>
            </div>

            {/* PRESET PORTRAITS GRID */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-black uppercase tracking-wider">
                Official Executive Portrait Presets
              </h4>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {AVATAR_PRESETS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFormData({ ...formData, avatarUrl: url })}
                    className={`relative rounded-2xl overflow-hidden border-4 transition cursor-pointer group aspect-square shadow-sm ${
                      formData.avatarUrl === url
                        ? 'border-amber-600 ring-2 ring-amber-400 scale-105'
                        : 'border-slate-200 hover:border-amber-400'
                    }`}
                  >
                    <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                    {formData.avatarUrl === url && (
                      <div className="absolute inset-0 bg-amber-600/30 flex items-center justify-center">
                        <Check className="w-6 h-6 text-white drop-shadow-md" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* CUSTOM PHOTO URL INPUT */}
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-black text-black uppercase tracking-wider">
                Or Paste Image Web Link / URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={customAvatarUrl}
                  onChange={(e) => setCustomAvatarUrl(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  className="flex-1 bg-slate-50 border-2 border-slate-300 focus:border-amber-600 rounded-2xl px-4 py-2.5 text-xs text-black font-bold focus:outline-none focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={handleApplyCustomUrl}
                  disabled={!customAvatarUrl.trim()}
                  className="bg-slate-900 hover:bg-black text-white font-black text-xs px-4 py-2.5 rounded-2xl transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Apply URL
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUB-TAB 3: OPERATIONS & ALERTS */}
        {/* ========================================================================= */}
        {activeSubTab === 'security' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-300 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b-2 border-slate-200">
              <div>
                <h3 className="text-lg font-black text-black font-['Manrope']">
                  Operations, Telematics & Alert Notifications
                </h3>
                <p className="text-xs text-slate-600 font-bold">
                  Configure high-priority dispatch notifications, vehicle fitness sensor alerts, and auto-lock security.
                </p>
              </div>
              <span className="text-[10px] bg-emerald-100 text-emerald-950 font-black px-2.5 py-1 rounded-full uppercase border border-emerald-300">
                Security Enforced
              </span>
            </div>

            {/* 2FA Status Card */}
            <div className="p-5 bg-gradient-to-r from-emerald-50 to-slate-50 rounded-2xl border-2 border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-black text-sm text-black font-['Manrope']">
                    Two-Step Verification (2FA) Active
                  </h4>
                  <p className="text-xs text-slate-600 font-medium">
                    Every admin login requires code verification delivered to <strong className="text-emerald-800">{formData.email}</strong>.
                  </p>
                </div>
              </div>

              {onLockSession && (
                <button
                  type="button"
                  onClick={onLockSession}
                  className="bg-slate-900 hover:bg-black text-amber-400 font-black text-xs px-4 py-2.5 rounded-xl transition cursor-pointer shrink-0 flex items-center gap-1.5 shadow-md"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Lock / Re-verify Session</span>
                </button>
              )}
            </div>

            {/* Notification Toggles */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-black text-black uppercase tracking-wider">
                Operational Alert Preferences
              </h4>

              {/* New Bookings Alert */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border-2 border-slate-200">
                <div className="space-y-0.5">
                  <h5 className="text-sm font-black text-black flex items-center gap-2">
                    <Bell className="w-4 h-4 text-amber-600" />
                    New Passenger Charter Bookings
                  </h5>
                  <p className="text-xs text-slate-600 font-medium">
                    Receive instant pings when a customer books a tour package or custom charter coach.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.notifyNewBookings}
                  onChange={(e) => setFormData({ ...formData, notifyNewBookings: e.target.checked })}
                  className="w-5 h-5 text-amber-600 rounded-lg focus:ring-amber-500 accent-amber-600 cursor-pointer"
                />
              </div>

              {/* Fleet Maintenance Alert */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border-2 border-slate-200">
                <div className="space-y-0.5">
                  <h5 className="text-sm font-black text-black flex items-center gap-2">
                    <Radio className="w-4 h-4 text-rose-600" />
                    Fleet Telematics, FC Permits & Maintenance Alerts
                  </h5>
                  <p className="text-xs text-slate-600 font-medium">
                    Alert dispatch when coach fitness certificates expire or engine service milestones are reached.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.notifyFleetMaintenance}
                  onChange={(e) => setFormData({ ...formData, notifyFleetMaintenance: e.target.checked })}
                  className="w-5 h-5 text-amber-600 rounded-lg focus:ring-amber-500 accent-amber-600 cursor-pointer"
                />
              </div>

              {/* Feedback Alerts */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border-2 border-slate-200">
                <div className="space-y-0.5">
                  <h5 className="text-sm font-black text-black flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                    Customer Feedback & Rating Submissions
                  </h5>
                  <p className="text-xs text-slate-600 font-medium">
                    Ping when travelers submit trip reviews or driver service evaluations.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.notifyFeedbackAlerts}
                  onChange={(e) => setFormData({ ...formData, notifyFeedbackAlerts: e.target.checked })}
                  className="w-5 h-5 text-amber-600 rounded-lg focus:ring-amber-500 accent-amber-600 cursor-pointer"
                />
              </div>

              {/* High Value Trips Alert */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border-2 border-slate-200">
                <div className="space-y-0.5">
                  <h5 className="text-sm font-black text-black flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    High-Value Charters & VIP Requests (&gt; ₹50,000)
                  </h5>
                  <p className="text-xs text-slate-600 font-medium">
                    Urgent priority notifications for large institutional or wedding charter contracts.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.notifyHighValueTrips}
                  onChange={(e) => setFormData({ ...formData, notifyHighValueTrips: e.target.checked })}
                  className="w-5 h-5 text-amber-600 rounded-lg focus:ring-amber-500 accent-amber-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Session Inactivity Timeout */}
            <div className="space-y-2 pt-3">
              <label className="text-xs font-black text-black uppercase tracking-wider block">
                Administrative Inactivity Auto-Lock Period
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[15, 30, 60, 120].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setFormData({ ...formData, sessionTimeoutMinutes: mins })}
                    className={`py-3 px-4 rounded-2xl border-2 text-xs font-black transition cursor-pointer text-center ${
                      formData.sessionTimeoutMinutes === mins
                        ? 'border-amber-600 bg-amber-50 text-amber-950 shadow-sm'
                        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {mins} Minutes
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUB-TAB 4: OFFICIAL HSK ADMINISTRATIVE ID CARD */}
        {/* ========================================================================= */}
        {activeSubTab === 'idcard' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-300 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-slate-200">
              <div>
                <h3 className="text-lg font-black text-black font-['Manrope']">
                  Official Administrative Staff Credential
                </h3>
                <p className="text-xs text-slate-600 font-bold">
                  Official digital identification badge authorized by HSK Tours & Travels Corporate Board.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintBadge}
                  className="bg-slate-900 hover:bg-black text-white font-black text-xs px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-md"
                >
                  <Printer className="w-4 h-4 text-amber-400" />
                  <span>Print ID Card</span>
                </button>
              </div>
            </div>

            {/* VISUAL EXECUTIVE ID CARD */}
            <div className="max-w-md mx-auto bg-gradient-to-b from-slate-900 via-slate-900 to-amber-950 text-white rounded-3xl p-6 sm:p-8 border-4 border-amber-500 shadow-2xl space-y-6 relative overflow-hidden">
              <div className="absolute -right-8 -top-8 opacity-10 pointer-events-none">
                <Shield className="w-64 h-64 text-amber-300" />
              </div>

              {/* CARD TOP HEADER */}
              <div className="flex items-center justify-between border-b border-amber-500/40 pb-4 relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black font-['Manrope'] shadow-md">
                    HSK
                  </div>
                  <div>
                    <h4 className="font-black text-xs uppercase tracking-widest text-amber-300">
                      HSK TOURS & TRAVELS
                    </h4>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
                      Executive Operations Authorization
                    </span>
                  </div>
                </div>

                <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                  Level 5 Clearance
                </span>
              </div>

              {/* CARD PHOTO & INFO */}
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-xl bg-slate-800 shrink-0">
                  <img
                    src={formData.avatarUrl}
                    alt={formData.fullName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-1 min-w-0">
                  <span className="text-[10px] text-amber-400 font-mono font-black block">
                    BADGE: {formData.employeeId}
                  </span>
                  <h3 className="font-black text-lg text-white font-['Manrope'] truncate">
                    {formData.fullName}
                  </h3>
                  <p className="text-xs text-amber-200 font-bold truncate">
                    {formData.roleTitle}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate font-medium">
                    {formData.department}
                  </p>
                </div>
              </div>

              {/* DETAILS GRID */}
              <div className="grid grid-cols-2 gap-3 text-[11px] bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 relative z-10 font-mono">
                <div>
                  <span className="text-[9px] text-slate-400 uppercase block font-sans font-bold">Base Terminal</span>
                  <span className="font-bold text-white text-xs truncate block">{formData.baseHub.split('(')[0]}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase block font-sans font-bold">Direct Phone</span>
                  <span className="font-bold text-white text-xs truncate block">{formData.phone}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase block font-sans font-bold">Security 2FA</span>
                  <span className="font-bold text-emerald-400 text-xs">ENFORCED</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase block font-sans font-bold">Authorized Sign</span>
                  <span className="font-bold text-amber-300 text-xs truncate block">{formData.digitalSignatureName}</span>
                </div>
              </div>

              {/* CARD FOOTER & BARCODE */}
              <div className="flex items-center justify-between pt-2 border-t border-amber-500/30 text-[10px] text-slate-400 relative z-10">
                <div className="font-mono tracking-widest text-amber-300 font-bold">
                  ||||| | |||| || ||||| ||| |
                </div>
                <span className="text-[9px] text-slate-400 uppercase font-black">
                  Valid Across TN, KL, KA
                </span>
              </div>
            </div>
          </div>
        )}

        {/* BOTTOM STICKY SAVE & RESET BAR */}
        <div className="sticky bottom-4 z-20 bg-slate-900/95 backdrop-blur-md text-white p-4 sm:p-5 rounded-3xl shadow-2xl border-2 border-amber-600/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-black text-sm font-['Manrope'] text-white">
                {hasUnsavedChanges ? 'You have pending modifications to the Admin Profile' : 'Admin Profile is synced & up-to-date'}
              </p>
              <p className="text-xs text-slate-300 font-medium">
                Changes apply immediately to your active session, fleet reports, and dispatch manifests.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {hasUnsavedChanges && (
              <button
                type="button"
                onClick={handleReset}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-black px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 border border-slate-700"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}

            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-2 shadow-lg shadow-amber-500/20"
            >
              <Save className="w-4 h-4 text-slate-950" />
              <span>Save Admin Profile</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
