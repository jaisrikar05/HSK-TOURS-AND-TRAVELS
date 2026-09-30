import React from 'react';
import { Logo } from './Logo';
import { ViewMode, UserRole } from '../types';
import { PhoneCall, UserCheck, UserPlus, Compass, ShieldCheck, User, ArrowRightLeft, Lock } from 'lucide-react';

interface HeaderProps {
  currentView: ViewMode;
  userRole: UserRole;
  isAdminAuthenticated?: boolean;
  onNavigate: (view: ViewMode) => void;
  onSwitchRole: (role: UserRole) => void;
  onOpenSignIn: (mode?: 'signin' | 'signup', targetRole?: UserRole) => void;
  onOpenContact: () => void;
  onOpenAdminAuth?: () => void;
  onLockAdminAuth?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  userRole,
  isAdminAuthenticated = false,
  onNavigate,
  onSwitchRole,
  onOpenSignIn,
  onOpenContact,
  onOpenAdminAuth,
  onLockAdminAuth,
}) => {
  const isAdminView = currentView === 'admin' || currentView === 'fleet-admin' || userRole === 'admin';

  const handleAdminAccessAttempt = () => {
    if (isAdminAuthenticated) {
      onSwitchRole('admin');
      onNavigate('admin');
    } else if (onOpenAdminAuth) {
      onOpenAdminAuth();
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-sm transition-all">
      {/* Top Portal Switcher Bar */}
      <div className="bg-slate-900 text-white text-xs py-1.5 px-4 sm:px-6 flex items-center justify-between font-bold border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-indigo-500/30 text-indigo-300 font-mono font-black px-2 py-0.5 rounded uppercase tracking-wider border border-indigo-500/40">
            Active Mode
          </span>
          {userRole === 'admin' && isAdminAuthenticated ? (
            <span className="flex items-center gap-1.5 text-amber-400 font-black text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>ADMIN & FLEET CONTROL CENTER</span>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded font-mono font-black">
                ACTIVE
              </span>
            </span>
          ) : userRole === 'admin' ? (
            <span className="flex items-center gap-1 text-amber-400 font-black text-[11px]">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>ADMIN LOGIN REQUIRED</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-indigo-300 font-black text-[11px]">
              <User className="w-3.5 h-3.5" />
              <span>CUSTOMER TRAVEL PORTAL</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-4 text-[11px]">
          {userRole === 'customer' ? (
            <button
              onClick={handleAdminAccessAttempt}
              className="text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer font-black hover:underline"
            >
              <Lock className="w-3 h-3 text-amber-400" />
              <span>Switch to Admin Portal →</span>
            </button>
          ) : (
            <div className="flex items-center gap-3">
              {onLockAdminAuth && (
                <button
                  onClick={onLockAdminAuth}
                  className="text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer font-black hover:underline"
                  title="Lock Admin Session"
                >
                  <Lock className="w-3 h-3 text-rose-400" />
                  <span>Lock Admin Session</span>
                </button>
              )}
              <button
                onClick={() => {
                  onSwitchRole('customer');
                  onNavigate('dashboard');
                }}
                className="text-indigo-300 hover:text-indigo-200 flex items-center gap-1 cursor-pointer font-black hover:underline"
              >
                <ArrowRightLeft className="w-3 h-3" />
                <span>Return to Customer Portal →</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
        {/* Brand Logo */}
        <button 
          onClick={() => onNavigate(userRole === 'admin' ? 'admin' : 'home')}
          className="flex items-center gap-2 hover:opacity-95 transition text-left cursor-pointer focus:outline-none"
        >
          <Logo lightMode={true} />
        </button>

        {/* Center Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-1.5 lg:gap-2.5 bg-slate-100 px-2 py-1.5 rounded-full border border-slate-300 shadow-inner">
          {userRole === 'customer' ? (
            <>
              <button
                onClick={() => onNavigate('home')}
                className={`px-4 py-1.5 rounded-full text-xs font-black transition cursor-pointer ${
                  currentView === 'home'
                    ? 'bg-indigo-700 text-white shadow-sm'
                    : 'text-slate-800 hover:text-indigo-700 hover:bg-slate-200'
                }`}
              >
                Home
              </button>

              <button
                onClick={() => onNavigate('packages')}
                className={`px-4 py-1.5 rounded-full text-xs font-black transition cursor-pointer ${
                  currentView === 'packages'
                    ? 'bg-indigo-700 text-white shadow-sm'
                    : 'text-slate-800 hover:text-indigo-700 hover:bg-slate-200'
                }`}
              >
                Packages
              </button>

              <button
                onClick={() => onNavigate('ai-planner')}
                className={`px-4 py-1.5 rounded-full text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                  currentView === 'ai-planner'
                    ? 'bg-gradient-to-r from-rose-700 to-indigo-700 text-white shadow-sm'
                    : 'text-slate-800 hover:text-rose-700 hover:bg-slate-200'
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                AI Planner
              </button>

              <button
                onClick={() => onNavigate('dashboard')}
                className={`px-4 py-1.5 rounded-full text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                  currentView === 'dashboard'
                    ? 'bg-indigo-700 text-white shadow-sm'
                    : 'text-slate-900 hover:text-indigo-700 hover:bg-slate-200'
                }`}
              >
                <User className="w-3.5 h-3.5 text-indigo-600" />
                <span>Customer Dashboard</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onNavigate('admin')}
                className={`px-4 py-1.5 rounded-full text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                  currentView === 'admin'
                    ? 'bg-amber-700 text-white shadow-sm'
                    : 'text-slate-900 hover:text-amber-800 hover:bg-amber-100'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>Admin Control Center</span>
              </button>

              <button
                onClick={() => onNavigate('fleet-admin')}
                className={`px-4 py-1.5 rounded-full text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                  currentView === 'fleet-admin'
                    ? 'bg-indigo-700 text-white shadow-sm'
                    : 'text-slate-900 hover:text-indigo-700 hover:bg-slate-200'
                }`}
              >
                <span>Fleet Management</span>
              </button>

              <button
                onClick={() => onNavigate('home')}
                className="px-3 py-1.5 rounded-full text-xs font-black text-slate-700 hover:text-black hover:bg-slate-200 transition cursor-pointer"
              >
                Public Site View
              </button>
            </>
          )}
        </nav>

        {/* Right CTA Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          <button
            onClick={onOpenContact}
            className="hidden xl:flex items-center gap-1.5 px-3.5 py-2 text-xs font-black text-black hover:text-indigo-900 bg-slate-100 hover:bg-slate-200 rounded-full transition border border-slate-300 cursor-pointer"
          >
            <PhoneCall className="w-3.5 h-3.5 text-rose-600" />
            <span>SUPPORT</span>
          </button>

          <button
            onClick={() => onOpenSignIn('signin', userRole)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-black font-black rounded-full text-xs uppercase tracking-wider transition border border-slate-300 flex items-center gap-1.5 cursor-pointer"
          >
            <UserCheck className="w-3.5 h-3.5 text-indigo-700" />
            <span>LOG IN</span>
          </button>

          {userRole === 'customer' ? (
            <button
              onClick={() => onOpenSignIn('signup', 'customer')}
              className="bg-gradient-to-r from-rose-700 to-indigo-700 hover:from-rose-600 hover:to-indigo-600 text-white font-black px-4 py-2 rounded-full text-xs uppercase tracking-wider transition shadow-md shadow-rose-600/30 border border-transparent flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>REGISTER</span>
            </button>
          ) : (
            <button
              onClick={() => {
                onSwitchRole('customer');
                onNavigate('dashboard');
              }}
              className="bg-slate-900 hover:bg-black text-amber-400 font-black px-4 py-2 rounded-full text-xs uppercase tracking-wider transition shadow-md border border-slate-800 flex items-center gap-1.5 cursor-pointer"
            >
              <span>EXIT ADMIN</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden flex items-center justify-around bg-slate-100 border-t border-slate-200 py-2 px-2 text-xs font-semibold overflow-x-auto">
        {userRole === 'customer' ? (
          <>
            <button
              onClick={() => onNavigate('home')}
              className={`px-3 py-1.5 rounded-full font-bold ${currentView === 'home' ? 'bg-indigo-600 text-white' : 'text-slate-700'}`}
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('packages')}
              className={`px-3 py-1.5 rounded-full font-bold ${currentView === 'packages' ? 'bg-indigo-600 text-white' : 'text-slate-700'}`}
            >
              Packages
            </button>
            <button
              onClick={() => onNavigate('ai-planner')}
              className={`px-3 py-1.5 rounded-full font-bold ${currentView === 'ai-planner' ? 'bg-rose-600 text-white' : 'text-slate-700'}`}
            >
              AI Planner
            </button>
            <button
              onClick={() => onNavigate('dashboard')}
              className={`px-3 py-1.5 rounded-full font-bold ${currentView === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-slate-700'}`}
            >
              Customer Dashboard
            </button>
            <button
              onClick={handleAdminAccessAttempt}
              className="px-3 py-1.5 rounded-full font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 cursor-pointer"
            >
              <Lock className="w-3 h-3 text-amber-700" />
              <span>Admin Mode</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => onNavigate('admin')}
              className={`px-3 py-1.5 rounded-full font-bold ${currentView === 'admin' ? 'bg-amber-600 text-white' : 'text-slate-700'}`}
            >
              Admin Dashboard
            </button>
            <button
              onClick={() => onNavigate('fleet-admin')}
              className={`px-3 py-1.5 rounded-full font-bold ${currentView === 'fleet-admin' ? 'bg-indigo-600 text-white' : 'text-slate-700'}`}
            >
              Fleet Manager
            </button>
            <button
              onClick={() => {
                onSwitchRole('customer');
                onNavigate('dashboard');
              }}
              className="px-3 py-1.5 rounded-full font-bold bg-indigo-100 text-indigo-900 border border-indigo-300"
            >
              Customer View
            </button>
          </>
        )}
      </div>
    </header>
  );
};

