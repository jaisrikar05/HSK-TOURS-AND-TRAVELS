import React, { useState } from 'react';
import { PhoneCall, Mail, MapPin, X, CheckCircle } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const [sent, setSent] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl border border-slate-300 text-black">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-rose-600" />
            <h3 className="font-black text-base text-black font-['Manrope']">
              Contact HSK Travels
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-black font-bold text-sm cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!sent ? (
          <div className="space-y-4 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2 text-black font-bold">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="font-black text-black">+91 98422 12345 / +91 422 2300000</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="text-black">support@hsktours.com / bookings@hsktours.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-slate-800">HSK Central Hub, Trichy Road, Coimbatore - 641018</span>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block font-black text-slate-800 mb-1">Your Query / Group Requirement</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe your corporate trip size, dates, or custom bus requirement..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-black font-bold placeholder:text-slate-500 focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 rounded-xl uppercase tracking-wider transition cursor-pointer shadow-md"
              >
                Send Request
              </button>
            </form>
          </div>
        ) : (
          <div className="py-6 text-center space-y-3">
            <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
            <h4 className="font-black text-lg text-black">Message Sent!</h4>
            <p className="text-xs text-slate-800 font-bold">
              Our 24/7 corporate travel concierge will reach out within 15 minutes.
            </p>
            <button
              onClick={onClose}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-6 py-2 rounded-xl text-xs cursor-pointer shadow-md"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
