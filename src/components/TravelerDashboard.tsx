import React, { useState, useEffect } from 'react';
import { PlannedTrip, Vehicle, TripFeedback, ViewMode, TourPackage, PaymentRecord, CustomerProfile } from '../types';
import { initialCustomerProfile } from '../data/mockData';
import { 
  LayoutDashboard, Map, MapPin, Bus, Compass, HelpCircle, Bell, Settings, 
  Sparkles, Send, Download, Eye, Star, Wifi, Snowflake, Volume2, 
  Filter, ArrowUpDown, Shield, CheckCircle, Clock, AlertTriangle, ShieldCheck,
  CreditCard, QrCode, Smartphone, Building2, Wallet, FileText, CheckCircle2,
  Printer, ArrowRight, ExternalLink, RefreshCw, User, Edit3
} from 'lucide-react';
import { OnlinePaymentModal } from './OnlinePaymentModal';
import { ScanAndPaySection } from './ScanAndPaySection';
import { CustomerProfileSection } from './CustomerProfileSection';

interface TravelerDashboardProps {
  plannedTrips: PlannedTrip[];
  vehicles: Vehicle[];
  feedbackList: TripFeedback[];
  packages?: TourPackage[];
  onNavigate: (view: ViewMode) => void;
  onBookVehicle: (v: Vehicle) => void;
  onSubmitFeedback: (fb: { rating: number; comment: string; tripName: string }) => void;
  onUpdateTrips?: (trips: PlannedTrip[]) => void;
  paymentRecords?: PaymentRecord[];
  onAddPaymentRecord?: (record: PaymentRecord, updatedTrip: PlannedTrip) => void;
  customerProfile?: CustomerProfile;
  onUpdateCustomerProfile?: (updated: CustomerProfile) => void;
}

export const TravelerDashboard: React.FC<TravelerDashboardProps> = ({
  plannedTrips,
  vehicles,
  feedbackList,
  packages,
  onNavigate,
  onBookVehicle,
  onSubmitFeedback,
  onUpdateTrips,
  paymentRecords = [],
  onAddPaymentRecord,
  customerProfile,
  onUpdateCustomerProfile,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'trips' | 'scanpay' | 'payments' | 'fleet' | 'planner' | 'profile' | 'support'>('overview');
  
  // Customer Profile state with fallback to initialCustomerProfile
  const [currentProfile, setCurrentProfile] = useState<CustomerProfile>(() => {
    if (customerProfile) return customerProfile;
    try {
      const saved = localStorage.getItem('hsk_tours_customer_profile_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return initialCustomerProfile;
  });

  useEffect(() => {
    if (customerProfile) {
      setCurrentProfile(customerProfile);
    }
  }, [customerProfile]);

  const handleSaveProfile = (updated: CustomerProfile) => {
    setCurrentProfile(updated);
    if (onUpdateCustomerProfile) {
      onUpdateCustomerProfile(updated);
    }
    try {
      localStorage.setItem('hsk_tours_customer_profile_v1', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save customer profile', e);
    }
  };

  // Payment Modal state
  const [paymentModalTrip, setPaymentModalTrip] = useState<PlannedTrip | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<PaymentRecord | null>(null);

  // Quick Pay Ad-Hoc form state
  const [quickPayTitle, setQuickPayTitle] = useState('');
  const [quickPayAmount, setQuickPayAmount] = useState<number>(5000);
  const [quickPayVehicle, setQuickPayVehicle] = useState('Executive Tempo Traveler');

  // Interactive AI Trip Planner & Travel Concierge Chat state in Dashboard
  const [plannerMessages, setPlannerMessages] = useState<Array<{
    sender: 'user' | 'assistant';
    text?: string;
    card?: {
      title: string;
      days: string[];
      recommendedVehicle: string;
      estPrice: string;
    };
    sources?: Array<{ title: string; uri: string }>;
    mapPlaces?: Array<{ title: string; uri: string; address?: string; snippet?: string }>;
  }>>([
    {
      sender: 'assistant',
      text: 'Hello! I am your real-time **HSK AI Assistant**. Ask me any travel questions — route analysis, Google Maps location data, live fleet recommendations, online payment options, weather updates, or custom day-by-day itineraries across South India!'
    }
  ]);

  const [plannerInput, setPlannerInput] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // Rating state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  // Review Modal preview
  const [previewTrip, setPreviewTrip] = useState<PlannedTrip | null>(null);

  // Trip filter in Trips tab
  const [tripFilter, setTripFilter] = useState<'ALL' | 'PENDING' | 'CONFIRMED' | 'PAID'>('ALL');

  // Calculations for billing metrics
  const pendingTrips = plannedTrips.filter((t) => t.paymentStatus !== 'Paid');
  const totalPaidAmount = paymentRecords.reduce((acc, p) => acc + (p.status === 'SUCCESS' ? p.amount : 0), 0);
  const totalDueAmount = pendingTrips.reduce((acc, t) => acc + Math.max(0, t.totalCost - (t.paidAmount || 0)), 0);

  const handleSendPlannerMsg = async (msgToSend?: string) => {
    const text = msgToSend || plannerInput;
    if (!text.trim()) return;

    setPlannerInput('');
    setPlannerMessages((prev) => [...prev, { sender: 'user', text }]);
    setIsAiGenerating(true);

    const historyPayload = plannerMessages
      .map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text || '' }]
      }))
      .slice(-6);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: historyPayload })
      });

      const data = await response.json();
      if (data.reply) {
        setPlannerMessages((prev) => [
          ...prev,
          {
            sender: 'assistant',
            text: data.reply,
            card: data.itineraryCard,
            sources: data.sources,
            mapPlaces: data.mapPlaces
          }
        ]);
      } else {
        setPlannerMessages((prev) => [
          ...prev,
          {
            sender: 'assistant',
            text: 'I can assist you with your Southern Indian journey plans, online payment options (Google Pay, PhonePe, Cards, NetBanking), vehicle bookings, or live route weather!'
          }
        ]);
      }
    } catch {
      setPlannerMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: 'Our AI concierge is ready to assist. You can explore available buses, initiate an online payment for your booked itineraries, or contact our 24/7 hotline at +91 98450 11234.'
        }
      ]);
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    onSubmitFeedback({
      rating,
      comment,
      tripName: plannedTrips[0]?.title || 'South India Tour'
    });

    setFeedbackSuccess(true);
    setComment('');
    setTimeout(() => setFeedbackSuccess(false), 4000);
  };

  const handlePaymentSuccess = (record: PaymentRecord, updatedTrip: PlannedTrip) => {
    if (onAddPaymentRecord) {
      onAddPaymentRecord(record, updatedTrip);
    } else if (onUpdateTrips) {
      onUpdateTrips(plannedTrips.map((t) => (t.id === updatedTrip.id ? updatedTrip : t)));
    }
  };

  const handleCreateAdHocPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPayTitle.trim() || quickPayAmount <= 0) return;

    const adHocTrip: PlannedTrip = {
      id: `custom-pay-${Date.now().toString().slice(-4)}`,
      title: quickPayTitle.trim(),
      dates: 'Flexible Travel Dates',
      status: 'Processing',
      image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=800',
      vehicleName: quickPayVehicle,
      guestsCount: 4,
      totalCost: quickPayAmount,
      itinerarySummary: `Ad-hoc charter payment reference: ${quickPayTitle}.`,
      paymentStatus: 'Pending',
      paidAmount: 0
    };

    setPaymentModalTrip(adHocTrip);
  };

  const filteredTrips = plannedTrips.filter((t) => {
    if (tripFilter === 'PENDING') return t.paymentStatus !== 'Paid';
    if (tripFilter === 'PAID') return t.paymentStatus === 'Paid';
    if (tripFilter === 'CONFIRMED') return t.status === 'Confirmed';
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-black flex flex-col md:flex-row font-['Inter'] relative">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-64 bg-slate-100 border-r-2 border-slate-300 p-6 flex flex-col justify-between shrink-0 shadow-sm">
        <div className="space-y-8">
          {/* Brand Logo & Portal */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-700 text-white flex items-center justify-center font-black text-sm tracking-wider font-['Manrope'] shadow-md">
              HSK
            </div>
            <div>
              <span className="font-black text-xs text-black block leading-none font-['Manrope']">Fleet Operations</span>
              <span className="text-[10px] text-indigo-900 font-extrabold">Traveler Portal</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black transition cursor-pointer ${
                activeTab === 'overview'
                  ? 'active-tab text-white shadow-md'
                  : 'text-black hover:bg-slate-200 hover:text-indigo-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-indigo-700" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('trips')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-black transition cursor-pointer ${
                activeTab === 'trips'
                  ? 'active-tab text-white shadow-md'
                  : 'text-black hover:bg-slate-200 hover:text-indigo-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Map className="w-4 h-4 text-indigo-700" />
                <span>My Custom Trips</span>
              </div>
              <span className="text-[10px] bg-slate-200 text-slate-800 font-black px-1.5 py-0.5 rounded-full">
                {plannedTrips.length}
              </span>
            </button>

            {/* SCAN & PAY (QR) TAB */}
            <button
              onClick={() => setActiveTab('scanpay')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-black transition cursor-pointer ${
                activeTab === 'scanpay'
                  ? 'active-tab text-white shadow-md'
                  : 'text-black hover:bg-slate-200 hover:text-indigo-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <QrCode className="w-4 h-4 text-amber-500" />
                <span>Scan & Pay (QR)</span>
              </div>
              <span className="text-[10px] bg-amber-100 text-amber-950 font-black px-1.5 py-0.5 rounded border border-amber-300">
                UPI QR
              </span>
            </button>

            {/* PAYMENTS & BILLING TAB */}
            <button
              onClick={() => setActiveTab('payments')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-black transition cursor-pointer ${
                activeTab === 'payments'
                  ? 'active-tab text-white shadow-md'
                  : 'text-black hover:bg-slate-200 hover:text-indigo-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <CreditCard className="w-4 h-4 text-indigo-700" />
                <span>Payments & Invoices</span>
              </div>
              {pendingTrips.length > 0 && (
                <span className="bg-rose-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-sm">
                  {pendingTrips.length}
                </span>
              )}
            </button>

            {/* CUSTOMER ACCOUNT & PROFILE TAB */}
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-black transition cursor-pointer ${
                activeTab === 'profile'
                  ? 'active-tab text-white shadow-md'
                  : 'text-black hover:bg-slate-200 hover:text-indigo-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-indigo-700" />
                <span>Account & Profile</span>
              </div>
              <span className="text-[10px] bg-indigo-100 text-indigo-950 font-black px-1.5 py-0.5 rounded border border-indigo-200">
                Edit
              </span>
            </button>

            <button
              onClick={() => setActiveTab('fleet')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black transition cursor-pointer ${
                activeTab === 'fleet'
                  ? 'active-tab text-white shadow-md'
                  : 'text-black hover:bg-slate-200 hover:text-indigo-900'
              }`}
            >
              <Bus className="w-4 h-4 text-indigo-700" />
              <span>Fleet Explorer</span>
            </button>

            <button
              onClick={() => setActiveTab('planner')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black transition cursor-pointer ${
                activeTab === 'planner'
                  ? 'active-tab text-white shadow-md'
                  : 'text-black hover:bg-slate-200 hover:text-rose-700'
              }`}
            >
              <Compass className="w-4 h-4 text-rose-600" />
              <span>AI Planner</span>
            </button>

            <button
              onClick={() => setActiveTab('support')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black transition cursor-pointer ${
                activeTab === 'support'
                  ? 'active-tab text-white shadow-md'
                  : 'text-black hover:bg-slate-200 hover:text-indigo-900'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-indigo-700" />
              <span>Support</span>
            </button>
          </nav>
        </div>

        {/* Profile Card & Switch at Bottom */}
        <div className="pt-6 border-t-2 border-slate-300 space-y-3">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left flex items-center gap-3 p-2.5 rounded-2xl border-2 transition cursor-pointer group ${
              activeTab === 'profile'
                ? 'bg-indigo-50 border-indigo-600 shadow-sm'
                : 'glass border-slate-300 hover:border-indigo-400 hover:bg-slate-200/70'
            }`}
            title="Click to view and edit profile information"
          >
            <div className="w-10 h-10 rounded-full bg-indigo-700 text-white flex items-center justify-center overflow-hidden shrink-0 font-bold border border-indigo-800 relative">
              <img
                src={currentProfile.avatarUrl}
                alt={currentProfile.fullName}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h5 className="font-black text-xs text-black leading-tight truncate group-hover:text-indigo-900">
                  {currentProfile.fullName}
                </h5>
                <Edit3 className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 shrink-0 ml-1" />
              </div>
              <span className="text-[11px] text-indigo-900 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                {currentProfile.tier}
              </span>
            </div>
          </button>

          <button
            onClick={() => onNavigate('admin')}
            className="w-full bg-slate-900 hover:bg-black text-amber-300 font-black py-2.5 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 shadow-md border border-slate-800"
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Switch to Admin Panel</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 sm:p-8 space-y-8 max-w-[1280px] overflow-x-hidden">
        
        {/* TOP WELCOME BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b-2 border-slate-300 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-black font-['Manrope']">
                {activeTab === 'profile'
                  ? 'CUSTOMER ACCOUNT & PROFILE'
                  : activeTab === 'payments' 
                  ? 'PAYMENTS & BILLING' 
                  : activeTab === 'scanpay'
                  ? 'UPI SCAN & PAY DIGITAL TERMINAL'
                  : activeTab === 'trips'
                  ? 'MY CUSTOM TRIPS'
                  : activeTab === 'fleet'
                  ? 'FLEET EXPLORER'
                  : activeTab === 'planner'
                  ? 'AI CONCIERGE & PLANNER'
                  : activeTab === 'support'
                  ? 'TRAVELER SUPPORT & HELPLINE'
                  : `WELCOME BACK, ${currentProfile.fullName.toUpperCase()}`}
              </h1>
              {activeTab === 'profile' && (
                <span className="bg-indigo-100 text-indigo-950 border border-indigo-300 text-[10px] font-black px-2.5 py-1 rounded-full uppercase flex items-center gap-1">
                  <User className="w-3 h-3 text-indigo-700" />
                  <span>Verified Traveler</span>
                </span>
              )}
              {activeTab === 'payments' && (
                <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-black px-2.5 py-1 rounded-full uppercase">
                  NPCI & RBI Compliant
                </span>
              )}
              {activeTab === 'scanpay' && (
                <span className="bg-amber-100 text-amber-950 border border-amber-300 text-[10px] font-black px-2.5 py-1 rounded-full uppercase flex items-center gap-1">
                  <QrCode className="w-3 h-3 text-amber-600" />
                  <span>Instant UPI QR</span>
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-black font-['Inter'] mt-1 font-bold">
              {activeTab === 'profile'
                ? 'Manage your passenger identity, edit contact numbers, update residential address, and customize travel preferences.'
                : activeTab === 'payments'
                ? 'Pay your itineraries online with Google Pay, PhonePe, Cards, Net Banking & Corporate Wire.'
                : activeTab === 'scanpay'
                ? 'Scan live dynamic QR with any UPI app (GPay, PhonePe, Paytm), or add and manage custom QR codes.'
                : 'Manage your upcoming luxury itineraries, pay dues online, and check live fleet status.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {activeTab !== 'profile' && (
              <button
                onClick={() => setActiveTab('profile')}
                className="bg-white hover:bg-slate-100 text-black font-black px-3.5 py-2 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-2 shadow-sm border-2 border-slate-300 group"
                title="View & Edit Customer Profile"
              >
                <div className="w-5 h-5 rounded-full overflow-hidden shrink-0 border border-indigo-700">
                  <img src={currentProfile.avatarUrl} alt="" className="w-full h-full object-cover" />
                </div>
                <span className="hidden sm:inline font-['Manrope']">Account & Profile</span>
                <Edit3 className="w-3.5 h-3.5 text-indigo-700 group-hover:scale-110 transition-transform" />
              </button>
            )}

            {activeTab !== 'scanpay' && (
              <button
                onClick={() => setActiveTab('scanpay')}
                className="bg-slate-900 hover:bg-black text-amber-300 font-black px-3.5 py-2 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 shadow-md border border-slate-800"
              >
                <QrCode className="w-4 h-4 text-amber-400" />
                <span>Scan & Pay</span>
              </button>
            )}

            {pendingTrips.length > 0 && activeTab !== 'payments' && (
              <button
                onClick={() => setActiveTab('payments')}
                className="bg-amber-600 hover:bg-amber-700 text-white font-black px-3.5 py-2 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 shadow-md"
              >
                <CreditCard className="w-4 h-4" />
                <span>Pay Dues ({pendingTrips.length})</span>
              </button>
            )}

            <button 
              onClick={() => alert('Notifications: All coach schedules running on time.')}
              className="p-2.5 glass border-2 border-slate-300 rounded-full text-black hover:text-indigo-900 hover:bg-slate-200 transition cursor-pointer"
            >
              <Bell className="w-5 h-5" />
            </button>
            <button 
              onClick={() => alert('Preferences saved.')}
              className="p-2.5 glass border-2 border-slate-300 rounded-full text-black hover:text-indigo-900 hover:bg-slate-200 transition cursor-pointer"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: OVERVIEW */}
        {/* ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            
            {/* ONLINE PAYMENT NOTICE & BANNER */}
            <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl border-2 border-indigo-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Instant Online Payments
                  </span>
                  <span className="text-[11px] text-indigo-200 font-bold">
                    0% Gateway Surcharge
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black font-['Manrope'] uppercase tracking-wide">
                  Pay with Google Pay, PhonePe, Paytm, Cards & Net Banking
                </h3>
                <p className="text-xs text-indigo-200 font-medium">
                  Confirm coach bookings instantly by paying full charter fare or a 25% token advance. Receive instant digital tax vouchers with SAC code 996412.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  onClick={() => setActiveTab('scanpay')}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-5 py-3 rounded-2xl text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-2 shadow-lg hover:shadow-amber-400/20"
                >
                  <QrCode className="w-4 h-4 text-slate-950" />
                  <span>Scan & Pay (QR)</span>
                </button>

                <button
                  onClick={() => setActiveTab('payments')}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-black px-5 py-3 rounded-2xl text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-2 shadow-lg border border-slate-700"
                >
                  <CreditCard className="w-4 h-4 text-amber-300" />
                  <span>View Invoices</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* CUSTOMER ACCOUNT & PROFILE SUMMARY CARD */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-slate-300 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-indigo-700 shrink-0 bg-indigo-50 shadow-md">
                  <img
                    src={currentProfile.avatarUrl}
                    alt={currentProfile.fullName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-black text-base text-black font-['Manrope'] truncate">
                      {currentProfile.fullName}
                    </h3>
                    <span className="text-[10px] bg-amber-100 text-amber-950 font-black px-2 py-0.5 rounded border border-amber-300">
                      {currentProfile.tier}
                    </span>
                    {currentProfile.isCorporateBilling && (
                      <span className="text-[10px] bg-indigo-100 text-indigo-950 font-black px-2 py-0.5 rounded border border-indigo-300">
                        GST Registered
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 font-bold truncate">
                    {currentProfile.email} • {currentProfile.phone} • {currentProfile.city}, {currentProfile.state}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 font-semibold">
                    <span>Billing: <strong className="text-slate-800">{currentProfile.isCorporateBilling ? (currentProfile.companyName || 'Corporate GST') : 'Personal'}</strong></span>
                    <span>•</span>
                    <span>Pref Seat: <strong className="text-slate-800">{currentProfile.preferredSeat}</strong></span>
                    <span>•</span>
                    <span>Coach: <strong className="text-slate-800">{currentProfile.preferredCoachType}</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
                <button
                  onClick={() => setActiveTab('profile')}
                  className="bg-indigo-700 hover:bg-indigo-800 text-white font-black px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-2 shadow-md"
                >
                  <Edit3 className="w-4 h-4 text-amber-300" />
                  <span>Edit Profile & GST</span>
                </button>
              </div>
            </div>

            {/* GRID: MY PLANNED TRIPS & AI TRIP PLANNER */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* LEFT: MY PLANNED TRIPS */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-black font-['Manrope'] uppercase tracking-wider">
                      MY PLANNED TRIPS
                    </h2>
                    <span className="text-xs font-black text-slate-600 bg-slate-200 px-2 py-0.5 rounded-full">
                      {plannedTrips.length}
                    </span>
                  </div>
                  <button 
                    onClick={() => setActiveTab('trips')}
                    className="text-xs font-black text-indigo-800 hover:text-indigo-950 hover:underline cursor-pointer uppercase"
                  >
                    VIEW ALL TRIPS
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {plannedTrips.map((trip) => {
                    const isPaid = trip.paymentStatus === 'Paid';
                    const isAdvance = trip.paymentStatus === 'Advance Paid';

                    return (
                      <div
                        key={trip.id}
                        className="glass-card rounded-2xl overflow-hidden hover:border-slate-400 transition flex flex-col justify-between border-2 border-slate-300 shadow-sm"
                      >
                        <div className="relative h-36 bg-slate-900">
                          <img
                            src={trip.image}
                            alt={trip.title}
                            className="w-full h-full object-cover opacity-90"
                          />
                          <div
                            className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-black text-white shadow-md border border-white/20 backdrop-blur-md uppercase ${
                              trip.status === 'Processing'
                                ? 'bg-blue-700'
                                : trip.status === 'Confirmed'
                                ? 'bg-amber-700'
                                : 'bg-emerald-700'
                            }`}
                          >
                            {trip.status}
                          </div>

                          {/* Payment status badge on image */}
                          <div className="absolute bottom-3 left-3">
                            <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase shadow-md border ${
                              isPaid 
                                ? 'bg-emerald-600 text-white border-emerald-400' 
                                : isAdvance 
                                ? 'bg-amber-600 text-white border-amber-400' 
                                : 'bg-rose-600 text-white border-rose-400'
                            }`}>
                              {isPaid ? 'PAID IN FULL' : isAdvance ? 'ADVANCE PAID' : 'PAYMENT PENDING'}
                            </span>
                          </div>
                        </div>

                        <div className="p-4 space-y-3">
                          <div>
                            <h4 className="font-black text-sm text-black uppercase">{trip.title}</h4>
                            <p className="text-xs text-black font-bold mt-0.5">📅 {trip.dates}</p>
                            <p className="text-[11px] text-slate-700 font-bold">🚌 {trip.vehicleName}</p>
                          </div>

                          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                            <div>
                              <span className="text-[10px] text-slate-500 font-bold block uppercase">Fare</span>
                              <span className="font-mono font-black text-black">₹{trip.totalCost.toLocaleString('en-IN')}</span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              {!isPaid && (
                                <button
                                  onClick={() => setPaymentModalTrip(trip)}
                                  className="bg-indigo-700 hover:bg-indigo-800 text-white font-black px-3 py-1.5 rounded-lg text-[11px] transition cursor-pointer flex items-center gap-1 shadow-md uppercase"
                                >
                                  <CreditCard className="w-3.5 h-3.5 text-amber-300" />
                                  <span>Pay Online</span>
                                </button>
                              )}

                              <button
                                onClick={() => setPreviewTrip(trip)}
                                className="bg-slate-200 hover:bg-slate-300 text-black font-extrabold px-2.5 py-1.5 rounded-lg text-[11px] transition cursor-pointer flex items-center gap-1 border border-slate-400"
                              >
                                <Eye className="w-3.5 h-3.5 text-indigo-700" />
                                <span>Details</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* RIGHT: AI TRIP PLANNER CHAT BOX */}
              <div className="lg:col-span-5 glass-dark text-black rounded-3xl p-5 shadow-xl border-2 border-slate-300 space-y-4">
                <div className="flex items-center justify-between border-b-2 border-slate-300 pb-3">
                  <h3 className="font-black text-base flex items-center gap-2 font-['Manrope'] text-black uppercase">
                    <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" />
                    <span>AI Concierge & Planner</span>
                  </h3>
                  <span className="text-[10px] bg-indigo-100 text-indigo-950 font-black px-2 py-0.5 rounded border border-indigo-300">
                    Gemini 3.6 Real-Time
                  </span>
                </div>

                {/* Messages Feed */}
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 text-xs">
                  {plannerMessages.map((m, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col ${
                        m.sender === 'user' ? 'items-end' : 'items-start'
                      } space-y-1.5`}
                    >
                      <div
                        className={`p-3 rounded-2xl max-w-[85%] text-xs font-medium leading-relaxed ${
                          m.sender === 'user'
                            ? 'bg-indigo-700 text-white rounded-tr-none'
                            : 'bg-white text-black border-2 border-slate-300 rounded-tl-none shadow-sm'
                        }`}
                      >
                        {m.text}
                      </div>

                      {/* Itinerary Card */}
                      {m.card && (
                        <div className="bg-slate-50 border-2 border-indigo-200 rounded-2xl p-3 max-w-[90%] space-y-2 text-black shadow-md">
                          <h4 className="font-black text-xs text-indigo-950 uppercase">{m.card.title}</h4>
                          <div className="space-y-1 text-[11px] font-bold text-slate-800">
                            <p>🚌 Suggested Fleet: <strong>{m.card.recommendedVehicle}</strong></p>
                            <p>💰 Est. Rate: <strong>{m.card.estPrice}</strong></p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {isAiGenerating && (
                    <div className="text-indigo-900 font-extrabold text-xs italic flex items-center gap-2 p-2 bg-indigo-50 rounded-xl border border-indigo-200 w-max">
                      <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-600" />
                      <span>Analyzing with Gemini Real-Time AI...</span>
                    </div>
                  )}
                </div>

                {/* Quick Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px]">
                  <button
                    type="button"
                    onClick={() => handleSendPlannerMsg('How do I pay for my booked trip online?')}
                    className="bg-amber-100 hover:bg-amber-200 text-amber-950 font-black px-2.5 py-1 rounded-full whitespace-nowrap cursor-pointer border border-amber-400 transition"
                  >
                    💳 Online Payment Options
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSendPlannerMsg('Which vehicles are available right now?')}
                    className="bg-emerald-100 hover:bg-emerald-200 text-emerald-950 font-black px-2.5 py-1 rounded-full whitespace-nowrap cursor-pointer border border-emerald-400 transition"
                  >
                    🚌 Check Fleet Fares
                  </button>
                </div>

                {/* Input */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendPlannerMsg();
                  }}
                  className="flex items-center gap-2 pt-2 border-t-2 border-slate-300"
                >
                  <input
                    type="text"
                    value={plannerInput}
                    onChange={(e) => setPlannerInput(e.target.value)}
                    placeholder="Ask about payments, routes, or custom trips..."
                    className="w-full bg-white text-black placeholder:text-slate-600 text-xs px-4 py-2.5 rounded-xl border-2 border-slate-300 focus:outline-none focus:border-indigo-600 font-bold"
                  />
                  <button
                    type="submit"
                    disabled={isAiGenerating}
                    className="bg-indigo-700 hover:bg-indigo-800 text-white p-2.5 rounded-xl transition cursor-pointer shrink-0 disabled:opacity-50 shadow-md"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>

            {/* REAL-TIME VEHICLE AVAILABILITY TABLE */}
            <div className="glass-card rounded-3xl p-6 border-2 border-slate-300 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="text-xl font-black text-black font-['Manrope'] uppercase tracking-wider">
                  REAL-TIME VEHICLE AVAILABILITY
                </h3>
                <button
                  onClick={() => setActiveTab('fleet')}
                  className="text-xs font-black text-indigo-800 hover:underline uppercase cursor-pointer"
                >
                  View All Fleet
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b-2 border-slate-300 text-black font-black uppercase text-[11px] tracking-wider">
                      <th className="py-3 px-4">Vehicle Details</th>
                      <th className="py-3 px-4">Capacity</th>
                      <th className="py-3 px-4">Amenities</th>
                      <th className="py-3 px-4">Current Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {vehicles.slice(0, 4).map((v) => (
                      <tr key={v.id} className="hover:bg-slate-100 transition">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-900 flex items-center justify-center font-black shrink-0 border border-indigo-300">
                              <Bus className="w-5 h-5 text-indigo-800" />
                            </div>
                            <div>
                              <p className="font-black text-black">{v.name}</p>
                              <span className="text-[11px] text-slate-800 font-mono font-bold">{v.regNumber}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4 font-extrabold text-black">{v.capacity}</td>

                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2 text-slate-900 font-bold">
                            {v.amenities.includes('wifi') && <Wifi className="w-4 h-4 text-indigo-800" title="Wi-Fi" />}
                            {v.amenities.includes('ac') && <Snowflake className="w-4 h-4 text-cyan-800" title="Climate AC" />}
                            {v.amenities.includes('audio') && <Volume2 className="w-4 h-4 text-rose-800" title="Surround Sound" />}
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase border ${
                              v.status === 'AVAILABLE'
                                ? 'bg-emerald-100 text-emerald-950 border-emerald-400'
                                : v.status === 'ON TRIP'
                                ? 'bg-rose-100 text-rose-950 border-rose-400'
                                : 'bg-amber-100 text-amber-950 border-amber-400'
                            }`}
                          >
                            {v.status}
                          </span>
                        </td>

                        <td className="py-4 px-4 text-right">
                          {v.status === 'AVAILABLE' ? (
                            <button
                              onClick={() => onBookVehicle(v)}
                              className="text-indigo-900 hover:text-black font-black text-xs cursor-pointer hover:underline uppercase"
                            >
                              QUICK BOOK
                            </button>
                          ) : (
                            <span className="text-slate-500 font-extrabold text-xs uppercase">BUSY</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SHARE YOUR EXPERIENCE & RECENT FEEDBACK */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Rate Your Last Trip */}
              <div className="lg:col-span-6 glass-card rounded-3xl p-6 border-2 border-slate-300 shadow-xl space-y-4">
                <h3 className="text-xl font-black text-black font-['Manrope'] uppercase tracking-wider">
                  SHARE YOUR EXPERIENCE
                </h3>

                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-black uppercase mb-2">
                      Rate Your Last Trip ({plannedTrips[0]?.title || 'South India Tour'})
                    </label>
                    <div className="flex items-center gap-1.5 text-amber-500">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="p-1 focus:outline-none cursor-pointer"
                        >
                          <Star className={`w-6 h-6 ${star <= rating ? 'fill-amber-500 text-amber-500' : 'text-slate-300'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Tell us what you loved or how we can improve..."
                      rows={3}
                      className="w-full p-3 bg-white border-2 border-slate-300 rounded-2xl text-xs sm:text-sm text-black placeholder:text-slate-600 focus:outline-none focus:border-indigo-600 font-bold"
                    />
                  </div>

                  {feedbackSuccess && (
                    <div className="p-3 bg-emerald-100 text-emerald-950 rounded-xl text-xs font-black flex items-center gap-2 border border-emerald-400">
                      <CheckCircle className="w-4 h-4 text-emerald-700" />
                      <span>Thank you! Your feedback has been published.</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="bg-indigo-700 hover:bg-indigo-800 text-white font-black px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer border border-transparent shadow-md"
                  >
                    SUBMIT REVIEW
                  </button>
                </form>
              </div>

              {/* Recent Feedback Feed */}
              <div className="lg:col-span-6 space-y-4">
                <h3 className="text-xl font-black text-black font-['Manrope'] uppercase tracking-wider">
                  RECENT FEEDBACK
                </h3>

                <div className="space-y-4">
                  {feedbackList.slice(0, 3).map((fb) => (
                    <div key={fb.id} className="glass-card rounded-2xl p-5 border-2 border-slate-300 shadow-md space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 font-black text-black flex items-center justify-center text-xs border border-slate-400">
                            {fb.author[0]}
                          </div>
                          <div>
                            <h5 className="font-black text-xs text-black">{fb.author}</h5>
                            <p className="text-[10px] text-slate-800 font-bold">{fb.timeAgo}</p>
                          </div>
                        </div>

                        <div className="flex text-amber-500 text-xs">
                          {Array.from({ length: fb.rating }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          ))}
                        </div>
                      </div>

                      <p className="text-xs text-black italic leading-relaxed font-bold">
                        "{fb.comment}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: PAYMENTS & BILLING CENTER */}
        {/* ========================================================================= */}
        {activeTab === 'payments' && (
          <div className="space-y-8">
            
            {/* 4 SUMMARY METRICS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border-2 border-slate-300 shadow-sm space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-500">Total Bookings</span>
                <div className="text-2xl font-black text-black font-['Manrope']">
                  {plannedTrips.length} Trips
                </div>
                <p className="text-[11px] font-bold text-slate-600">Reserved Coach Itineraries</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border-2 border-slate-300 shadow-sm space-y-1">
                <span className="text-[10px] font-black uppercase text-emerald-800">Total Settled Online</span>
                <div className="text-2xl font-black text-emerald-700 font-mono">
                  ₹{totalPaidAmount.toLocaleString('en-IN')}
                </div>
                <p className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified by Bank Gateway</span>
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border-2 border-slate-300 shadow-sm space-y-1">
                <span className="text-[10px] font-black uppercase text-rose-800">Payment Due / Pending</span>
                <div className="text-2xl font-black text-rose-700 font-mono">
                  ₹{totalDueAmount.toLocaleString('en-IN')}
                </div>
                <p className="text-[11px] font-bold text-rose-800">
                  {pendingTrips.length} trip{pendingTrips.length === 1 ? '' : 's'} awaiting settlement
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border-2 border-slate-300 shadow-sm space-y-1">
                <span className="text-[10px] font-black uppercase text-indigo-900">Supported Online Modes</span>
                <div className="text-base font-black text-indigo-950 font-['Manrope'] mt-1">
                  UPI, Cards, NetBanking
                </div>
                <p className="text-[11px] font-bold text-slate-600">Google Pay, PhonePe, Paytm, RuPay</p>
              </div>
            </div>

            {/* SUPPORTED ONLINE PLATFORMS BANNER */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border-2 border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="font-black text-base uppercase font-['Manrope'] text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <span>Certified Online Payment Channels</span>
                  </h3>
                  <p className="text-xs text-slate-300 font-medium">
                    Integrated with Reserve Bank of India (RBI) tokenization and NPCI 256-bit SSL encrypted channels.
                  </p>
                </div>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black px-3 py-1 rounded-full uppercase w-max">
                  0% Convenience Charge
                </span>
              </div>

              {/* PLATFORM BADGES ROW */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white text-slate-900 flex items-center justify-center font-black text-xs shrink-0">
                    GPay
                  </div>
                  <div>
                    <h5 className="font-black text-xs text-white">Google Pay</h5>
                    <span className="text-[9px] text-slate-400 font-bold block">Instant UPI</span>
                  </div>
                </div>

                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                    पे
                  </div>
                  <div>
                    <h5 className="font-black text-xs text-white">PhonePe</h5>
                    <span className="text-[9px] text-slate-400 font-bold block">UPI / Wallet</span>
                  </div>
                </div>

                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-cyan-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                    Paytm
                  </div>
                  <div>
                    <h5 className="font-black text-xs text-white">Paytm UPI</h5>
                    <span className="text-[9px] text-slate-400 font-bold block">Wallet / QR</span>
                  </div>
                </div>

                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                    BHIM
                  </div>
                  <div>
                    <h5 className="font-black text-xs text-white">BHIM UPI</h5>
                    <span className="text-[9px] text-slate-400 font-bold block">Any Bank VPA</span>
                  </div>
                </div>

                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-black text-xs text-white">Cards</h5>
                    <span className="text-[9px] text-slate-400 font-bold block">Visa / MC / RuPay</span>
                  </div>
                </div>

                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-black text-xs shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-black text-xs text-white">NetBanking</h5>
                    <span className="text-[9px] text-slate-400 font-bold block">50+ Indian Banks</span>
                  </div>
                </div>
              </div>
            </div>

            {/* PROMINENT UPI SCAN & PAY BANNER IN PAYMENTS TAB */}
            <div className="bg-gradient-to-r from-amber-50 via-indigo-50 to-slate-100 rounded-3xl p-5 sm:p-6 border-2 border-amber-300 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                    Scan & Pay Terminal
                  </span>
                  <span className="text-[11px] font-black text-indigo-950">
                    Google Pay • PhonePe • Paytm • BHIM
                  </span>
                </div>
                <h4 className="font-black text-base text-black uppercase font-['Manrope']">
                  Dynamic UPI QR Code Counter & Custom QR Manager
                </h4>
                <p className="text-xs text-slate-700 font-bold">
                  Scan live dynamic QR codes for any coach charter, enter UTR reference for instant verification, or upload / add custom company & driver QR codes.
                </p>
              </div>

              <button
                onClick={() => setActiveTab('scanpay')}
                className="bg-slate-900 hover:bg-black text-amber-300 font-black px-5 py-3 rounded-2xl text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-2 shadow-lg border border-slate-800 shrink-0"
              >
                <QrCode className="w-4 h-4 text-amber-400" />
                <span>Launch QR Terminal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* PENDING INVOICES (ACTION REQUIRED) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-black uppercase font-['Manrope'] flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-indigo-700" />
                  <span>Pending Invoices & Trips to Settle</span>
                </h3>
                <span className="text-xs font-bold text-slate-600">
                  {pendingTrips.length} Outstanding Payment{pendingTrips.length === 1 ? '' : 's'}
                </span>
              </div>

              {pendingTrips.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingTrips.map((trip) => {
                    const balance = trip.totalCost - (trip.paidAmount || 0);

                    return (
                      <div
                        key={trip.id}
                        className="bg-white rounded-3xl p-5 border-2 border-slate-300 shadow-md space-y-4 flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                              REF: {trip.id}
                            </span>
                            <span className="text-[10px] font-black uppercase text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                              {trip.paymentStatus || 'Payment Due'}
                            </span>
                          </div>

                          <h4 className="font-black text-base text-black uppercase font-['Manrope']">
                            {trip.title}
                          </h4>
                          <p className="text-xs text-slate-700 font-bold">
                            Coach: <strong className="text-black">{trip.vehicleName}</strong> • {trip.dates} ({trip.guestsCount} Travelers)
                          </p>
                        </div>

                        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
                          <div className="flex justify-between font-bold text-slate-700">
                            <span>Total Trip Cost:</span>
                            <span className="font-mono text-black font-extrabold">₹{trip.totalCost.toLocaleString('en-IN')}</span>
                          </div>
                          {trip.paidAmount && trip.paidAmount > 0 ? (
                            <div className="flex justify-between font-bold text-emerald-800">
                              <span>Advance Paid:</span>
                              <span className="font-mono">₹{trip.paidAmount.toLocaleString('en-IN')}</span>
                            </div>
                          ) : null}
                          <div className="flex justify-between font-black text-sm text-rose-700 pt-1 border-t border-slate-200">
                            <span>Balance Due:</span>
                            <span className="font-mono">₹{balance.toLocaleString('en-IN')}</span>
                          </div>
                        </div>

                        <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                          <button
                            onClick={() => setPaymentModalTrip(trip)}
                            className="flex-1 w-full bg-indigo-700 hover:bg-indigo-800 text-white font-black py-3 px-3 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 shadow-md hover:shadow-indigo-500/20"
                          >
                            <CreditCard className="w-4 h-4 text-amber-300" />
                            <span>Pay Online Gateway</span>
                          </button>

                          <button
                            onClick={() => setActiveTab('scanpay')}
                            className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                          >
                            <QrCode className="w-4 h-4 text-slate-950" />
                            <span>Scan & Pay (QR)</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-6 text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h4 className="font-black text-base text-emerald-950 uppercase">All Bookings Settled</h4>
                  <p className="text-xs text-emerald-800 font-bold">
                    You have no pending balances. All booked itineraries are confirmed and dispatched!
                  </p>
                </div>
              )}
            </div>

            {/* PAYMENT HISTORY & TAX INVOICES TABLE */}
            <div className="bg-white rounded-3xl p-6 border-2 border-slate-300 shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-slate-200 pb-3">
                <div>
                  <h3 className="font-black text-base uppercase text-black font-['Manrope']">
                    Payment History & Digital Tax Invoices
                  </h3>
                  <p className="text-xs text-slate-600 font-bold">
                    Official GST receipts with SAC Code 996412 for passenger transport services.
                  </p>
                </div>

                <span className="text-xs font-black text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-300">
                  {paymentRecords.length} Completed Receipt{paymentRecords.length === 1 ? '' : 's'}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b-2 border-slate-300 text-black font-black uppercase text-[11px] tracking-wider">
                      <th className="py-3 px-3">Receipt / Invoice No</th>
                      <th className="py-3 px-3">Trip Details</th>
                      <th className="py-3 px-3">Platform & Mode</th>
                      <th className="py-3 px-3">Transaction ID</th>
                      <th className="py-3 px-3">Amount</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Invoice Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {paymentRecords.length > 0 ? (
                      paymentRecords.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50 transition font-bold">
                          <td className="py-3.5 px-3">
                            <span className="font-mono text-black font-black block">
                              {p.receiptNumber || 'HSK-INV-2026'}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">{p.date}</span>
                          </td>

                          <td className="py-3.5 px-3 text-black">
                            <p className="font-black uppercase">{p.tripTitle}</p>
                            <span className="text-[10px] text-slate-600">Ref: {p.tripId}</span>
                          </td>

                          <td className="py-3.5 px-3">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-indigo-950 font-black border border-slate-300 text-[11px]">
                              {p.paymentMode === 'upi' ? <Smartphone className="w-3.5 h-3.5 text-indigo-700" /> : <CreditCard className="w-3.5 h-3.5 text-indigo-700" />}
                              <span>{p.platform}</span>
                            </span>
                          </td>

                          <td className="py-3.5 px-3 font-mono text-[11px] text-slate-800">
                            {p.transactionId}
                          </td>

                          <td className="py-3.5 px-3 font-mono font-black text-black text-sm">
                            ₹{p.amount.toLocaleString('en-IN')}
                          </td>

                          <td className="py-3.5 px-3">
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-950 border border-emerald-300 uppercase">
                              {p.status}
                            </span>
                          </td>

                          <td className="py-3.5 px-3 text-right">
                            <button
                              onClick={() => setViewingReceipt(p)}
                              className="bg-slate-200 hover:bg-slate-300 text-black font-black px-3 py-1.5 rounded-lg text-xs uppercase cursor-pointer border border-slate-300 transition inline-flex items-center gap-1"
                            >
                              <Printer className="w-3.5 h-3.5 text-indigo-700" />
                              <span>View / Print</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-500 font-bold">
                          No payment records found. Select an invoice above to make your first online payment.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* AD-HOC QUICK PAYMENT / CUSTOM FARE SETTLEMENT */}
            <div className="bg-gradient-to-br from-slate-100 to-indigo-50/50 rounded-3xl p-6 border-2 border-indigo-200 shadow-md space-y-4">
              <div className="border-b border-indigo-200 pb-3">
                <h4 className="font-black text-base text-black uppercase font-['Manrope'] flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-indigo-700" />
                  <span>Custom Quote, Extra Kilometers or Phone Booking Payment</span>
                </h4>
                <p className="text-xs text-slate-700 font-bold">
                  Received a direct quotation from our 24/7 travel desk or need to settle additional route kilometers? Pay directly online.
                </p>
              </div>

              <form onSubmit={handleCreateAdHocPayment} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-800 mb-1">
                    Booking Reference or Purpose
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Extra 120 KM for Ooty Trip"
                    value={quickPayTitle}
                    onChange={(e) => setQuickPayTitle(e.target.value)}
                    className="w-full p-2.5 bg-white border-2 border-slate-300 rounded-xl text-black font-bold text-xs focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-800 mb-1">
                    Amount to Pay (INR ₹)
                  </label>
                  <input
                    type="number"
                    min={100}
                    step={100}
                    required
                    value={quickPayAmount}
                    onChange={(e) => setQuickPayAmount(Number(e.target.value))}
                    className="w-full p-2.5 bg-white border-2 border-slate-300 rounded-xl text-black font-mono font-bold text-xs focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full bg-indigo-700 hover:bg-indigo-800 text-white font-black py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 shadow-md"
                  >
                    <span>Proceed to Gateway</span>
                    <ArrowRight className="w-4 h-4 text-amber-300" />
                  </button>
                </div>
              </form>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: SCAN & PAY (DYNAMIC UPI & CUSTOM QR CODE TERMINAL) */}
        {/* ========================================================================= */}
        {activeTab === 'scanpay' && (
          <ScanAndPaySection
            plannedTrips={plannedTrips}
            paymentRecords={paymentRecords}
            onPaymentSuccess={(rec, updatedTrip) => {
              handlePaymentSuccess(rec, updatedTrip);
            }}
            onViewReceipt={(rec) => setViewingReceipt(rec)}
          />
        )}

        {/* ========================================================================= */}
        {/* TAB: CUSTOMER ACCOUNT & PROFILE (EDIT PERSONAL, CORPORATE GST & SETTINGS) */}
        {/* ========================================================================= */}
        {activeTab === 'profile' && (
          <CustomerProfileSection
            profile={currentProfile}
            onUpdateProfile={handleSaveProfile}
            onNavigateTab={(tab) => setActiveTab(tab as any)}
          />
        )}

        {/* ========================================================================= */}
        {/* TAB 3: MY CUSTOM TRIPS */}
        {/* ========================================================================= */}
        {activeTab === 'trips' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-black font-['Manrope'] uppercase tracking-wider">
                  ALL BOOKED & CUSTOM CHARTER TRIPS
                </h3>
                <p className="text-xs text-slate-700 font-bold">
                  View and manage all coach charters, itineraries, and online payment statuses.
                </p>
              </div>

              {/* FILTER BUTTONS */}
              <div className="flex items-center gap-1.5 bg-slate-200 p-1 rounded-xl text-xs">
                {(['ALL', 'PENDING', 'CONFIRMED', 'PAID'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setTripFilter(f)}
                    className={`px-3 py-1.5 rounded-lg font-black uppercase transition cursor-pointer ${
                      tripFilter === f
                        ? 'bg-indigo-700 text-white shadow-sm'
                        : 'text-slate-700 hover:text-black'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTrips.map((trip) => {
                const isPaid = trip.paymentStatus === 'Paid';
                const isAdvance = trip.paymentStatus === 'Advance Paid';

                return (
                  <div
                    key={trip.id}
                    className="glass-card rounded-3xl overflow-hidden hover:border-slate-400 transition flex flex-col justify-between border-2 border-slate-300 shadow-md"
                  >
                    <div className="relative h-44 bg-slate-900">
                      <img
                        src={trip.image}
                        alt={trip.title}
                        className="w-full h-full object-cover opacity-90"
                      />
                      <div
                        className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-black text-white shadow-md border border-white/20 backdrop-blur-md uppercase ${
                          trip.status === 'Processing'
                            ? 'bg-blue-700'
                            : trip.status === 'Confirmed'
                            ? 'bg-amber-700'
                            : 'bg-emerald-700'
                        }`}
                      >
                        {trip.status}
                      </div>

                      <div className="absolute bottom-3 left-3">
                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase shadow-md border ${
                          isPaid 
                            ? 'bg-emerald-600 text-white border-emerald-400' 
                            : isAdvance 
                            ? 'bg-amber-600 text-white border-amber-400' 
                            : 'bg-rose-600 text-white border-rose-400'
                        }`}>
                          {isPaid ? 'PAID IN FULL' : isAdvance ? 'ADVANCE PAID' : 'PAYMENT DUE'}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 space-y-4">
                      <div>
                        <h4 className="font-black text-base text-black uppercase font-['Manrope']">{trip.title}</h4>
                        <p className="text-xs text-black font-bold mt-0.5">📅 {trip.dates}</p>
                        <p className="text-xs text-slate-700 font-bold mt-0.5">🚌 Coach: {trip.vehicleName}</p>
                        <p className="text-xs text-slate-700 font-bold">👥 Group: {trip.guestsCount} Travelers</p>
                      </div>

                      <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 space-y-1 text-xs">
                        <div className="flex justify-between font-bold text-slate-700">
                          <span>Total Fare:</span>
                          <span className="font-mono text-black font-black">₹{trip.totalCost.toLocaleString('en-IN')}</span>
                        </div>
                        {trip.transactionId && (
                          <div className="flex justify-between font-bold text-[10px] text-slate-600">
                            <span>Txn Ref:</span>
                            <span className="font-mono">{trip.transactionId}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        {!isPaid ? (
                          <div className="flex-1 flex gap-2">
                            <button
                              onClick={() => setPaymentModalTrip(trip)}
                              className="flex-1 bg-indigo-700 hover:bg-indigo-800 text-white font-black py-2.5 px-3 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                            >
                              <CreditCard className="w-4 h-4 text-amber-300" />
                              <span>Pay Online</span>
                            </button>
                            <button
                              onClick={() => setActiveTab('scanpay')}
                              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-2.5 px-3 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1 shadow-md"
                              title="Scan dynamic UPI QR code"
                            >
                              <QrCode className="w-4 h-4 text-slate-950" />
                              <span>QR</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              const rec = paymentRecords.find((p) => p.tripId === trip.id) || {
                                id: `pay-${trip.id}`,
                                tripId: trip.id,
                                tripTitle: trip.title,
                                amount: trip.totalCost,
                                paymentMode: 'upi',
                                platform: trip.paymentMethod || 'Online Gateway',
                                transactionId: trip.transactionId || 'TXN-CONFIRMED',
                                date: trip.paymentDate || 'Verified',
                                status: 'SUCCESS',
                                paymentType: 'full',
                                receiptNumber: 'HSK-INV-2026'
                              };
                              setViewingReceipt(rec);
                            }}
                            className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-black py-2.5 px-3 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                          >
                            <Printer className="w-4 h-4" />
                            <span>VIEW RECEIPT</span>
                          </button>
                        )}

                        <button
                          onClick={() => setPreviewTrip(trip)}
                          className="bg-slate-200 hover:bg-slate-300 text-black font-black py-2.5 px-3 rounded-xl text-xs uppercase cursor-pointer border border-slate-300 transition"
                        >
                          DETAILS
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: FLEET EXPLORER */}
        {/* ========================================================================= */}
        {activeTab === 'fleet' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-black text-black font-['Manrope'] uppercase tracking-wider">
                HSK LUXURY FLEET SPECIFICATIONS & BOOKING
              </h3>
              <p className="text-xs text-slate-700 font-bold">
                Browse our real-time luxury coach roster, seating capacities, and reserve buses directly.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((v) => (
                <div key={v.id} className="bg-white rounded-3xl p-5 border-2 border-slate-300 shadow-md space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-black text-indigo-900 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
                        {v.regNumber}
                      </span>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase border ${
                          v.status === 'AVAILABLE'
                            ? 'bg-emerald-100 text-emerald-950 border-emerald-400'
                            : 'bg-rose-100 text-rose-950 border-rose-400'
                        }`}
                      >
                        {v.status}
                      </span>
                    </div>

                    <h4 className="font-black text-base text-black uppercase font-['Manrope']">{v.name}</h4>
                    <p className="text-xs text-slate-700 font-bold">Capacity: {v.capacity} Passengers • Air Conditioned</p>

                    <div className="flex items-center gap-2 pt-1 text-slate-900 font-bold text-xs">
                      {v.amenities.includes('wifi') && <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] flex items-center gap-1 font-bold">📶 Wi-Fi</span>}
                      {v.amenities.includes('ac') && <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] flex items-center gap-1 font-bold">❄️ Climate AC</span>}
                      {v.amenities.includes('audio') && <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] flex items-center gap-1 font-bold">🔊 Surround Sound</span>}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block uppercase">Base Charter</span>
                      <span className="text-lg font-black text-black font-mono">₹{v.pricePerDay.toLocaleString('en-IN')}<span className="text-xs font-normal text-slate-600">/day</span></span>
                    </div>

                    {v.status === 'AVAILABLE' ? (
                      <button
                        onClick={() => onBookVehicle(v)}
                        className="bg-indigo-700 hover:bg-indigo-800 text-white font-black px-4 py-2 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer shadow-md"
                      >
                        RESERVE
                      </button>
                    ) : (
                      <span className="text-slate-500 font-black text-xs uppercase">ON ASSIGNMENT</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: AI PLANNER */}
        {/* ========================================================================= */}
        {activeTab === 'planner' && (
          <div className="bg-white rounded-3xl p-6 border-2 border-slate-300 shadow-xl space-y-4">
            <div className="border-b-2 border-slate-200 pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-black text-lg text-black font-['Manrope'] uppercase flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                  <span>Gemini Real-Time Travel Concierge & Route Grounding</span>
                </h3>
                <p className="text-xs text-slate-600 font-bold">
                  Ask multi-day route inquiries, online payment guidance, live weather checks, or custom tourist advice.
                </p>
              </div>
              <span className="bg-indigo-100 text-indigo-950 font-black text-xs px-3 py-1 rounded-full border border-indigo-200">
                ACTIVE
              </span>
            </div>

            <div className="space-y-3 min-h-[400px] max-h-[500px] overflow-y-auto pr-2 text-xs">
              {plannerMessages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${
                    m.sender === 'user' ? 'items-end' : 'items-start'
                  } space-y-1.5`}
                >
                  <div
                    className={`p-3.5 rounded-2xl max-w-[85%] text-xs font-medium leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-indigo-700 text-white rounded-tr-none'
                        : 'bg-slate-50 text-black border-2 border-slate-300 rounded-tl-none shadow-sm'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendPlannerMsg();
              }}
              className="flex items-center gap-2 pt-3 border-t-2 border-slate-200"
            >
              <input
                type="text"
                value={plannerInput}
                onChange={(e) => setPlannerInput(e.target.value)}
                placeholder="Ask route, bus comparison, or payment options..."
                className="w-full bg-slate-50 text-black text-xs px-4 py-3 rounded-xl border-2 border-slate-300 focus:outline-none focus:border-indigo-600 font-bold"
              />
              <button
                type="submit"
                disabled={isAiGenerating}
                className="bg-indigo-700 hover:bg-indigo-800 text-white p-3 rounded-xl transition cursor-pointer shadow-md disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: SUPPORT */}
        {/* ========================================================================= */}
        {activeTab === 'support' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-300 shadow-xl space-y-6">
            <div>
              <h3 className="text-xl font-black text-black font-['Manrope'] uppercase tracking-wider">
                24/7 CUSTOMER SUPPORT & EMERGENCY ASSISTANCE
              </h3>
              <p className="text-xs text-slate-700 font-bold mt-1">
                Reach our fleet controllers, payment reconciliation managers, or roadside assistance desk.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 p-5 rounded-2xl border-2 border-slate-200 space-y-2">
                <span className="text-[10px] font-black uppercase text-indigo-900 block">Direct Hotline</span>
                <h4 className="font-black text-lg text-black font-mono">+91 98450 11234</h4>
                <p className="text-xs text-slate-600 font-bold">Toll-free customer reservations and inquiries.</p>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border-2 border-slate-200 space-y-2">
                <span className="text-[10px] font-black uppercase text-emerald-900 block">Payment Desk</span>
                <h4 className="font-black text-sm text-black font-mono">billing@hsktours.com</h4>
                <p className="text-xs text-slate-600 font-bold">GST tax invoices, refunds & payment reconciliations.</p>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border-2 border-slate-200 space-y-2">
                <span className="text-[10px] font-black uppercase text-rose-900 block">Roadside Support</span>
                <h4 className="font-black text-lg text-black font-mono">1800-425-9988</h4>
                <p className="text-xs text-slate-600 font-bold">24-hour backup driver and mechanical emergency dispatch.</p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 1: ONLINE PAYMENT MODAL */}
        {/* ========================================================================= */}
        {paymentModalTrip && (
          <OnlinePaymentModal
            trip={paymentModalTrip}
            isOpen={!!paymentModalTrip}
            onClose={() => setPaymentModalTrip(null)}
            onPaymentSuccess={(rec, updatedTrip) => {
              handlePaymentSuccess(rec, updatedTrip);
            }}
          />
        )}

        {/* ========================================================================= */}
        {/* MODAL 2: VIEW TAX RECEIPT / INVOICE MODAL */}
        {/* ========================================================================= */}
        {viewingReceipt && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl border-2 border-slate-300 text-black">
              <div className="flex items-center justify-between border-b-2 border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-700" />
                  <h3 className="font-black text-base text-black uppercase font-['Manrope']">
                    HSK Official Tax Invoice
                  </h3>
                </div>
                <button
                  onClick={() => setViewingReceipt(null)}
                  className="text-slate-500 hover:text-black font-black text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="flex justify-between items-start bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div>
                    <h4 className="font-black text-sm text-indigo-950">HSK TOURS & TRAVELS PVT LTD</h4>
                    <p className="text-[10px] text-slate-600 font-bold">GSTIN: 33AABCH1234F1Z8 • SAC: 996412</p>
                    <p className="text-[10px] text-slate-600 font-bold">Coimbatore, Tamil Nadu • Support: +91 98450 11234</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs font-black text-black block">{viewingReceipt.receiptNumber || 'HSK-INV-2026'}</span>
                    <span className="text-[10px] text-slate-500">{viewingReceipt.date}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 font-bold block text-[10px] uppercase">Itinerary Ref</span>
                    <strong className="text-black font-black">{viewingReceipt.tripTitle}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block text-[10px] uppercase">Transaction Ref</span>
                    <strong className="text-black font-mono">{viewingReceipt.transactionId}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block text-[10px] uppercase">Payment Platform</span>
                    <strong className="text-indigo-900 font-black">{viewingReceipt.platform}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block text-[10px] uppercase">Payment Status</span>
                    <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-950 font-black text-[10px] uppercase border border-emerald-300">
                      SUCCESS - SETTLED
                    </span>
                  </div>
                </div>

                <div className="bg-slate-100 p-3.5 rounded-xl border border-slate-200 space-y-1 text-xs">
                  <div className="flex justify-between font-bold text-slate-700">
                    <span>Amount Paid:</span>
                    <span className="font-mono font-black text-black">₹{viewingReceipt.amount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-600">
                    <span>5% Central & State GST Component:</span>
                    <span className="font-mono">₹{Math.round(viewingReceipt.amount * 0.05).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-black rounded-xl text-xs font-black uppercase cursor-pointer flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4 text-indigo-700" />
                  <span>Print Receipt</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewingReceipt(null)}
                  className="px-5 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-black uppercase cursor-pointer shadow-md"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 3: REVIEW ITINERARY DETAILS */}
        {/* ========================================================================= */}
        {previewTrip && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border-2 border-slate-300 text-black">
              <div className="flex items-center justify-between border-b-2 border-slate-300 pb-3">
                <h3 className="font-black text-base text-black uppercase">{previewTrip.title}</h3>
                <button
                  onClick={() => setPreviewTrip(null)}
                  className="text-slate-600 hover:text-black font-black text-base cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2 text-xs text-black font-bold">
                <p><strong className="text-black font-black">Dates:</strong> {previewTrip.dates}</p>
                <p><strong className="text-black font-black">Assigned Bus:</strong> {previewTrip.vehicleName}</p>
                <p><strong className="text-black font-black">Passenger Group:</strong> {previewTrip.guestsCount} Guests</p>
                <p><strong className="text-black font-black">Est. Total Cost:</strong> ₹{previewTrip.totalCost.toLocaleString('en-IN')}</p>
                <p>
                  <strong className="text-black font-black">Payment Status: </strong>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                    previewTrip.paymentStatus === 'Paid'
                      ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                      : previewTrip.paymentStatus === 'Advance Paid'
                      ? 'bg-amber-100 text-amber-950 border border-amber-300'
                      : 'bg-rose-100 text-rose-950 border border-rose-300'
                  }`}>
                    {previewTrip.paymentStatus || 'Pending'}
                  </span>
                </p>
                
                <div className="bg-slate-100 p-3 rounded-2xl text-black text-xs mt-3 border border-slate-300">
                  <p className="font-black text-indigo-950 mb-1 uppercase">Itinerary Overview:</p>
                  <p className="font-bold">{previewTrip.itinerarySummary}</p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  onClick={() => setPreviewTrip(null)}
                  className="px-4 py-2 bg-slate-200 border border-slate-400 rounded-xl text-xs font-black text-black hover:bg-slate-300 cursor-pointer uppercase"
                >
                  Close
                </button>

                {previewTrip.paymentStatus !== 'Paid' ? (
                  <button
                    onClick={() => {
                      const t = previewTrip;
                      setPreviewTrip(null);
                      setPaymentModalTrip(t);
                    }}
                    className="px-4 py-2 bg-indigo-700 text-white rounded-xl text-xs font-black hover:bg-indigo-800 transition cursor-pointer shadow-md uppercase flex items-center gap-1.5"
                  >
                    <CreditCard className="w-4 h-4 text-amber-300" />
                    <span>Pay Online Now</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      alert(`Trip ${previewTrip.title} is already paid in full. Receipt: ${previewTrip.transactionId || 'Confirmed'}`);
                      setPreviewTrip(null);
                    }}
                    className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-black hover:bg-emerald-800 transition cursor-pointer shadow-md uppercase flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Paid Voucher</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};
