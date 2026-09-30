import React, { useState, useEffect } from 'react';
import { ViewMode, UserRole, TourPackage, Vehicle, PlannedTrip, TripFeedback, PaymentRecord, CustomerProfile, AdminProfile } from './types';
import { initialPackages, initialVehicles, initialPlannedTrips, initialFeedback, initialMaintenanceAlerts, initialPaymentRecords, initialCustomerProfile, initialAdminProfile } from './data/mockData';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { PublicHome } from './components/PublicHome';
import { TravelerDashboard } from './components/TravelerDashboard';
import { FleetManagement } from './components/FleetManagement';
import { AdminDashboard } from './components/AdminDashboard';
import { PackageDetailModal } from './components/PackageDetailModal';
import { BookingModal } from './components/BookingModal';
import { SignInModal } from './components/SignInModal';
import { ContactModal } from './components/ContactModal';
import { AdminVerificationModal } from './components/AdminVerificationModal';
import { GeminiChatWidget } from './components/GeminiChatWidget';
import { ShieldAlert, Lock, ShieldCheck, KeyRound } from 'lucide-react';

const VEHICLES_STORAGE_KEY = 'hsk_tours_vehicles_app_v1';
const PACKAGES_STORAGE_KEY = 'hsk_tours_packages_app_v1';
const TRIPS_STORAGE_KEY = 'hsk_tours_trips_app_v1';
const FEEDBACK_STORAGE_KEY = 'hsk_tours_feedback_app_v1';
const PAYMENTS_STORAGE_KEY = 'hsk_tours_payments_app_v1';
const ROLE_STORAGE_KEY = 'hsk_tours_user_role_v1';
const ADMIN_AUTH_KEY = 'hsk_tours_admin_authenticated_2fa';
const ADMIN_CREDENTIAL_KEY = 'hsk_tours_admin_credential_2fa';
const ADMIN_EMAIL_KEY = 'hsk_tours_admin_email_2fa';
const CUSTOMER_PROFILE_STORAGE_KEY = 'hsk_tours_customer_profile_v1';
const ADMIN_PROFILE_STORAGE_KEY = 'hsk_tours_admin_profile_v1';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('home');
  
  // Admin Authentication State (Enforced each session via Two-Step Verification)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(ADMIN_AUTH_KEY) === 'true';
    } catch (e) {
      return false;
    }
  });

  const [adminCredential, setAdminCredential] = useState<string>(() => {
    try {
      return sessionStorage.getItem(ADMIN_CREDENTIAL_KEY) || '';
    } catch (e) {
      return '';
    }
  });

  const [adminEmail, setAdminEmail] = useState<string>(() => {
    try {
      return sessionStorage.getItem(ADMIN_EMAIL_KEY) || '9158.jaisrikargkky@gmail.com';
    } catch (e) {
      return '9158.jaisrikargkky@gmail.com';
    }
  });

  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState<boolean>(false);

  const [userRole, setUserRole] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem(ROLE_STORAGE_KEY);
      if (saved === 'admin' && sessionStorage.getItem(ADMIN_AUTH_KEY) === 'true') return 'admin';
    } catch (e) {
      console.error('Failed to load user role from storage', e);
    }
    return 'customer';
  });

  const [packages, setPackages] = useState<TourPackage[]>(() => {
    try {
      const saved = localStorage.getItem(PACKAGES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to load packages from storage', e);
    }
    return initialPackages;
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    try {
      const saved = localStorage.getItem(VEHICLES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to load vehicles from storage', e);
    }
    return initialVehicles; // []
  });

  const [plannedTrips, setPlannedTrips] = useState<PlannedTrip[]>(() => {
    try {
      const saved = localStorage.getItem(TRIPS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to load trips from storage', e);
    }
    return initialPlannedTrips;
  });

  const [feedbackList, setFeedbackList] = useState<TripFeedback[]>(() => {
    try {
      const saved = localStorage.getItem(FEEDBACK_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to load feedback from storage', e);
    }
    return initialFeedback;
  });

  const [payments, setPayments] = useState<PaymentRecord[]>(() => {
    try {
      const saved = localStorage.getItem(PAYMENTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to load payments from storage', e);
    }
    return initialPaymentRecords;
  });

  const [customerProfile, setCustomerProfile] = useState<CustomerProfile>(() => {
    try {
      const saved = localStorage.getItem(CUSTOMER_PROFILE_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load customer profile from storage', e);
    }
    return initialCustomerProfile;
  });

  const handleUpdateCustomerProfile = (updated: CustomerProfile) => {
    setCustomerProfile(updated);
    try {
      localStorage.setItem(CUSTOMER_PROFILE_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save customer profile', e);
    }
  };

  const [adminProfile, setAdminProfile] = useState<AdminProfile>(() => {
    try {
      const saved = localStorage.getItem(ADMIN_PROFILE_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load admin profile from storage', e);
    }
    return initialAdminProfile;
  });

  const handleUpdateAdminProfile = (updated: AdminProfile) => {
    setAdminProfile(updated);
    try {
      localStorage.setItem(ADMIN_PROFILE_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save admin profile', e);
    }
    if (updated.email && updated.email !== adminEmail) {
      setAdminEmail(updated.email);
      try {
        sessionStorage.setItem(ADMIN_EMAIL_KEY, updated.email);
      } catch (e) {
        console.error('Failed to update admin email in session', e);
      }
    }
  };

  // Save to localStorage whenever state updates
  useEffect(() => {
    try {
      localStorage.setItem(ROLE_STORAGE_KEY, userRole);
    } catch (e) {
      console.error('Failed to save user role to storage', e);
    }
  }, [userRole]);

  useEffect(() => {
    try {
      localStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(vehicles));
    } catch (e) {
      console.error('Failed to save vehicles to storage', e);
    }
  }, [vehicles]);

  useEffect(() => {
    try {
      localStorage.setItem(PACKAGES_STORAGE_KEY, JSON.stringify(packages));
    } catch (e) {
      console.error('Failed to save packages to storage', e);
    }
  }, [packages]);

  useEffect(() => {
    try {
      localStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(plannedTrips));
    } catch (e) {
      console.error('Failed to save plannedTrips to storage', e);
    }
  }, [plannedTrips]);

  useEffect(() => {
    try {
      localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(feedbackList));
    } catch (e) {
      console.error('Failed to save feedback to storage', e);
    }
  }, [feedbackList]);

  useEffect(() => {
    try {
      localStorage.setItem(PAYMENTS_STORAGE_KEY, JSON.stringify(payments));
    } catch (e) {
      console.error('Failed to save payments to storage', e);
    }
  }, [payments]);

  // Payment handler
  const handleAddPayment = (record: PaymentRecord, updatedTrip: PlannedTrip) => {
    setPayments((prev) => [record, ...prev]);
    setPlannedTrips((prev) =>
      prev.map((t) => (t.id === updatedTrip.id ? updatedTrip : t))
    );
  };

  // Modals state
  const [selectedPackage, setSelectedPackage] = useState<TourPackage | null>(null);
  const [selectedVehicleToBook, setSelectedVehicleToBook] = useState<Vehicle | null>(null);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [targetAuthRole, setTargetAuthRole] = useState<UserRole>('customer');
  const [isContactOpen, setIsContactOpen] = useState(false);

  // Package booking handler
  const handleConfirmPackageBooking = (details: {
    packageName: string;
    guests: number;
    travelDate: string;
    preferredBus: string;
    contactName: string;
    contactPhone: string;
  }) => {
    const totalCost = (selectedPackage?.pricePerPerson || 8500) * details.guests;
    const newTrip: PlannedTrip = {
      id: `trip-${Date.now()}`,
      title: details.packageName,
      dates: details.travelDate,
      status: 'Processing',
      image: selectedPackage?.image || 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&q=80&w=800',
      vehicleName: details.preferredBus,
      guestsCount: details.guests,
      totalCost,
      itinerarySummary: `Custom ${details.packageName} for ${details.guests} travelers.`,
      paymentStatus: 'Pending',
      paidAmount: 0
    };

    setPlannedTrips((prev) => [newTrip, ...prev]);
  };

  // Feedback submit handler
  const handleSubmitFeedback = (fb: { rating: number; comment: string; tripName: string }) => {
    const newFb: TripFeedback = {
      id: `fb-${Date.now()}`,
      author: 'Traveler User',
      timeAgo: 'Just now',
      rating: fb.rating,
      comment: fb.comment,
      tripName: fb.tripName
    };
    setFeedbackList((prev) => [newFb, ...prev]);
  };

  // Package cover photo AI update handler
  const handleUpdatePackageCover = (packageId: string, imageUrl: string, imageSize: '1K' | '2K' | '4K') => {
    setPackages(prev =>
      prev.map(p =>
        p.id === packageId ? { ...p, image: imageUrl, imageSize, imageGeneratedByAI: true } : p
      )
    );
    if (selectedPackage && selectedPackage.id === packageId) {
      setSelectedPackage(prev => prev ? { ...prev, image: imageUrl, imageSize, imageGeneratedByAI: true } : null);
    }
  };

  // Admin Auth Handlers (Two-Step Verification)
  const handleAdminAuthSuccess = (token: string, credential: string, verifiedEmail?: string) => {
    setIsAdminAuthenticated(true);
    setAdminCredential(credential);
    if (verifiedEmail) {
      setAdminEmail(verifiedEmail);
      try {
        sessionStorage.setItem(ADMIN_EMAIL_KEY, verifiedEmail);
      } catch (e) {}
    }
    setUserRole('admin');
    setCurrentView('admin');
    try {
      sessionStorage.setItem(ADMIN_AUTH_KEY, 'true');
      sessionStorage.setItem(ADMIN_CREDENTIAL_KEY, credential);
      localStorage.setItem(ROLE_STORAGE_KEY, 'admin');
    } catch (e) {
      console.error('Failed to save admin auth status', e);
    }
  };

  const handleLockAdminSession = () => {
    setIsAdminAuthenticated(false);
    setAdminCredential('');
    setUserRole('customer');
    setCurrentView('home');
    try {
      sessionStorage.removeItem(ADMIN_AUTH_KEY);
      sessionStorage.removeItem(ADMIN_CREDENTIAL_KEY);
      localStorage.removeItem(ADMIN_AUTH_KEY);
      localStorage.removeItem(ADMIN_CREDENTIAL_KEY);
      localStorage.setItem(ROLE_STORAGE_KEY, 'customer');
    } catch (e) {
      console.error('Failed to clear admin auth status', e);
    }
  };

  const handleNavigate = (view: ViewMode) => {
    if (view === 'admin' || view === 'fleet-admin') {
      if (!isAdminAuthenticated) {
        setIsAdminAuthModalOpen(true);
        return;
      }
      setUserRole('admin');
    } else if (view === 'dashboard') {
      setUserRole('customer');
    }
    setCurrentView(view);
  };

  const handleSwitchRole = (role: UserRole) => {
    if (role === 'admin') {
      if (!isAdminAuthenticated) {
        setIsAdminAuthModalOpen(true);
        return;
      }
      setUserRole('admin');
      setCurrentView('admin');
    } else {
      setUserRole('customer');
      setCurrentView('dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-['Inter'] flex flex-col justify-between selection:bg-indigo-600 selection:text-white relative overflow-x-hidden">
      {/* Header Navigation */}
      <Header
        currentView={currentView}
        userRole={userRole}
        isAdminAuthenticated={isAdminAuthenticated}
        onNavigate={handleNavigate}
        onSwitchRole={handleSwitchRole}
        onOpenSignIn={(mode = 'signin', role) => {
          if (role === 'admin' && !isAdminAuthenticated) {
            setIsAdminAuthModalOpen(true);
          } else {
            setAuthMode(mode);
            setTargetAuthRole(role || userRole);
            setIsSignInOpen(true);
          }
        }}
        onOpenContact={() => setIsContactOpen(true)}
        onOpenAdminAuth={() => setIsAdminAuthModalOpen(true)}
        onLockAdminAuth={handleLockAdminSession}
      />

      {/* Main View Area */}
      <div className="flex-1">
        {currentView === 'home' && (
          <PublicHome
            packages={packages}
            vehicles={vehicles}
            plannedTrips={plannedTrips}
            feedbackList={feedbackList}
            onSelectPackage={(pkg) => setSelectedPackage(pkg)}
            onNavigate={handleNavigate}
            onUpdatePackageCover={handleUpdatePackageCover}
          />
        )}

        {currentView === 'packages' && (
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-12 space-y-8">
            <div className="border-b border-slate-200 pb-4">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-['Manrope'] uppercase tracking-tight">
                All Tour Packages
              </h1>
              <p className="text-slate-600 mt-1 font-normal">
                Explore curated leisure and corporate tours with luxury bus transport included.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="glass-card rounded-2xl overflow-hidden hover:border-indigo-300 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 shadow-md bg-white border border-slate-200"
                >
                  <div className="relative h-56 bg-slate-100">
                    <img
                      src={pkg.image}
                      alt={pkg.subtitle}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 right-4 bg-indigo-600 text-white px-3.5 py-1.5 rounded-full shadow-md text-xs font-extrabold border border-indigo-500">
                      ₹{(pkg.pricePerPerson / 1000).toFixed(2)}k / person
                    </div>
                  </div>

                  <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-900 font-['Manrope']">
                        {pkg.title} <span className="text-rose-600">{pkg.subtitle}</span>
                      </h3>
                      <p className="text-slate-600 text-xs sm:text-sm mt-2 line-clamp-2 font-normal">
                        {pkg.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {pkg.highlights.map((h, i) => (
                        <span key={i} className="bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase px-2.5 py-1 rounded-md border border-indigo-100">
                          {h}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={() => setSelectedPackage(pkg)}
                      className="w-full py-3 border border-indigo-600 text-indigo-700 hover:bg-indigo-600 hover:text-white font-bold text-xs uppercase tracking-widest rounded-xl transition cursor-pointer text-center bg-indigo-50/50 shadow-sm hover:border-indigo-600"
                    >
                      VIEW DETAILS & BOOK
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(currentView === 'dashboard' || currentView === 'ai-planner') && (
          <TravelerDashboard
            plannedTrips={plannedTrips}
            vehicles={vehicles}
            feedbackList={feedbackList}
            packages={packages}
            onNavigate={handleNavigate}
            onBookVehicle={(v) => setSelectedVehicleToBook(v)}
            onSubmitFeedback={handleSubmitFeedback}
            onUpdateTrips={(updated) => setPlannedTrips(updated)}
            paymentRecords={payments}
            onAddPaymentRecord={handleAddPayment}
            customerProfile={customerProfile}
            onUpdateCustomerProfile={handleUpdateCustomerProfile}
          />
        )}

        {/* ADMIN DASHBOARD VIEW (GUARDED BY AUTH) */}
        {currentView === 'admin' && (
          isAdminAuthenticated ? (
            <AdminDashboard
              plannedTrips={plannedTrips}
              vehicles={vehicles}
              packages={packages}
              feedbackList={feedbackList}
              adminEmail={adminProfile.email || adminEmail}
              adminProfile={adminProfile}
              onUpdateAdminProfile={handleUpdateAdminProfile}
              onLockSession={handleLockAdminSession}
              onUpdateTrips={(updated) => setPlannedTrips(updated)}
              onUpdateVehicles={(updated) => setVehicles(updated)}
              onUpdatePackages={(updated) => setPackages(updated)}
              onNavigate={handleNavigate}
            />
          ) : (
            <div className="max-w-2xl mx-auto my-16 p-8 bg-white rounded-3xl border-2 border-rose-200 shadow-2xl text-center space-y-6 font-['Inter']">
              <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-3xl flex items-center justify-center mx-auto border-2 border-amber-300 shadow-inner">
                <ShieldAlert className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-mono font-black text-rose-600 uppercase tracking-widest bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                  Two-Step Verification Required
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-['Manrope']">
                  Admin Login & Verification
                </h2>
                <p className="text-sm text-slate-600 font-medium max-w-md mx-auto">
                  The HSK Admin Control Center & Fleet Management tools are restricted. Two-step verification code will be sent to your Gmail each time you log in.
                </p>
              </div>

              <button
                onClick={() => setIsAdminAuthModalOpen(true)}
                className="py-4 px-8 bg-slate-900 hover:bg-black text-amber-400 font-black rounded-2xl text-xs uppercase tracking-wider transition cursor-pointer shadow-xl border border-slate-800 inline-flex items-center gap-2"
              >
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span>Log In with Two-Step Verification</span>
              </button>
            </div>
          )
        )}

        {/* FLEET MANAGEMENT VIEW (GUARDED BY AUTH) */}
        {currentView === 'fleet-admin' && (
          isAdminAuthenticated ? (
            <FleetManagement
              vehicles={vehicles}
              alerts={initialMaintenanceAlerts}
              onNavigate={handleNavigate}
              onUpdateVehicles={(updated) => setVehicles(updated)}
            />
          ) : (
            <div className="max-w-2xl mx-auto my-16 p-8 bg-white rounded-3xl border-2 border-rose-200 shadow-2xl text-center space-y-6 font-['Inter']">
              <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-3xl flex items-center justify-center mx-auto border-2 border-rose-300 shadow-inner">
                <Lock className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-mono font-black text-rose-600 uppercase tracking-widest bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                  Fleet Manager Locked
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-['Manrope']">
                  Admin Login Required
                </h2>
                <p className="text-sm text-slate-600 font-medium max-w-md mx-auto">
                  Two-step authentication required. Sign in with your admin credentials and verification code sent to your Gmail to manage fleet telematics.
                </p>
              </div>

              <button
                onClick={() => setIsAdminAuthModalOpen(true)}
                className="py-4 px-8 bg-slate-900 hover:bg-black text-amber-400 font-black rounded-2xl text-xs uppercase tracking-wider transition cursor-pointer shadow-xl border border-slate-800 inline-flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Log In with Two-Step Verification</span>
              </button>
            </div>
          )
        )}
      </div>

      {/* Footer */}
      <Footer onNavigate={(view) => setCurrentView(view)} />

      {/* Modals */}
      {selectedPackage && (
        <PackageDetailModal
          pkg={selectedPackage}
          onClose={() => setSelectedPackage(null)}
          onConfirmBooking={handleConfirmPackageBooking}
          onUpdatePackageCover={handleUpdatePackageCover}
        />
      )}

      {selectedVehicleToBook && (
        <BookingModal
          vehicle={selectedVehicleToBook}
          onClose={() => setSelectedVehicleToBook(null)}
        />
      )}

      {isSignInOpen && (
        <SignInModal
          isOpen={isSignInOpen}
          initialMode={authMode}
          targetRole={targetAuthRole}
          onClose={() => setIsSignInOpen(false)}
          onOpenAdminAuth={(email) => {
            setIsSignInOpen(false);
            if (email) setAdminEmail(email);
            setIsAdminAuthModalOpen(true);
          }}
          onSuccessfulAuth={(authenticatedRole) => {
            if (authenticatedRole === 'admin') {
              setIsSignInOpen(false);
              setIsAdminAuthModalOpen(true);
            } else {
              setUserRole('customer');
              setCurrentView('dashboard');
            }
          }}
        />
      )}

      {isAdminAuthModalOpen && (
        <AdminVerificationModal
          isOpen={isAdminAuthModalOpen}
          initialEmail={adminProfile.email || adminEmail}
          onClose={() => setIsAdminAuthModalOpen(false)}
          onSuccessfulAuth={handleAdminAuthSuccess}
        />
      )}

      {isContactOpen && (
        <ContactModal
          isOpen={isContactOpen}
          onClose={() => setIsContactOpen(false)}
        />
      )}

      {/* Floating Gemini AI Chat Widget */}
      <GeminiChatWidget
        vehicles={vehicles}
        packages={packages}
        plannedTrips={plannedTrips}
        feedbackList={feedbackList}
      />
    </div>
  );
}
