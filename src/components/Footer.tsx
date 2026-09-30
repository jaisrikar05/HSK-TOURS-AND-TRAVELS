import React from 'react';
import { Logo } from './Logo';
import { ViewMode } from '../types';
import { Globe, QrCode, Lock } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: ViewMode) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-100 border-t-2 border-slate-300 text-black pt-16 pb-8 mt-auto">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b-2 border-slate-300 items-start">
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <Logo lightMode showText />
            <p className="text-black text-sm max-w-md leading-relaxed mt-3 font-bold">
              Premium travel solutions for corporate and leisure journeys across India. Reliability meets modern convenience in every mile with our state-of-the-art luxury fleet.
            </p>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-7 flex flex-wrap gap-x-8 gap-y-4 items-center justify-start md:justify-end text-sm font-extrabold text-black">
            <button onClick={() => onNavigate('home')} className="hover:text-indigo-700 transition cursor-pointer">
              Home
            </button>
            <button onClick={() => onNavigate('packages')} className="hover:text-indigo-700 transition cursor-pointer">
              Tour Packages
            </button>
            <button onClick={() => onNavigate('ai-planner')} className="hover:text-indigo-700 transition cursor-pointer">
              AI Planner
            </button>
            <button onClick={() => onNavigate('dashboard')} className="hover:text-indigo-700 transition cursor-pointer">
              Fleet Solutions
            </button>
            <button onClick={() => onNavigate('fleet-admin')} className="hover:text-indigo-700 transition cursor-pointer">
              Admin Ops
            </button>
            <a href="#privacy" className="hover:text-indigo-700 transition">
              Privacy Policy
            </a>
            <a href="#terms" className="hover:text-indigo-700 transition">
              Terms of Service
            </a>
            <a href="#support" className="hover:text-indigo-700 transition">
              Support
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-800 font-extrabold">
          <p>© 2026 HSK TOURS & TRAVELS. ALL RIGHTS RESERVED.</p>
          
          <div className="flex items-center gap-4 text-black font-extrabold">
            <div className="flex items-center gap-1 hover:text-indigo-700 transition cursor-pointer">
              <QrCode className="w-4 h-4 text-indigo-700" />
              <span>Verify Bus QR</span>
            </div>
            <div className="flex items-center gap-1 hover:text-indigo-700 transition cursor-pointer">
              <Globe className="w-4 h-4 text-indigo-700" />
              <span>English (IN)</span>
            </div>
            <div className="flex items-center gap-1 hover:text-emerald-800 transition cursor-pointer">
              <Lock className="w-4 h-4 text-emerald-700" />
              <span>256-Bit SSL Secured</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
