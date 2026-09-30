import React, { useState } from 'react';
import { Vehicle } from '../types';
import { Bus, CheckCircle2, X } from 'lucide-react';

interface BookingModalProps {
  vehicle: Vehicle | null;
  onClose: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ vehicle, onClose }) => {
  const [days, setDays] = useState(3);
  const [startDate, setStartDate] = useState('2026-08-10');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [org, setOrg] = useState('');
  const [isDone, setIsDone] = useState(false);

  if (!vehicle) return null;

  const totalCost = vehicle.pricePerDay * days;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    setIsDone(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl border border-slate-300 text-black">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <Bus className="w-5 h-5 text-indigo-700" />
            <h3 className="font-black text-base text-black font-['Manrope']">
              Reserve {vehicle.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-black font-bold text-sm cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isDone ? (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1">
              <p className="font-black text-black">Reg: {vehicle.regNumber}</p>
              <p className="text-slate-800 font-bold">Capacity: {vehicle.capacity} | Base Rate: ₹{vehicle.pricePerDay.toLocaleString('en-IN')}/day</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-black text-slate-800 mb-1">Rental Duration (Days)</label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-black font-bold focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-black text-slate-800 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-black font-bold focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-black text-slate-800 mb-1">Organization / Event Name</label>
              <input
                type="text"
                placeholder="e.g. Infosys Corporate Offsite"
                value={org}
                onChange={(e) => setOrg(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-black font-bold placeholder:text-slate-500 focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-black text-slate-800 mb-1">Contact Name</label>
                <input
                  type="text"
                  required
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-black font-bold placeholder:text-slate-500 focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-black text-slate-800 mb-1">Mobile Number</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-black font-bold placeholder:text-slate-500 focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-700 font-black block">ESTIMATED COST</span>
                <span className="text-xl font-black text-rose-700 font-['Manrope']">
                  ₹{totalCost.toLocaleString('en-IN')}
                </span>
              </div>

              <button
                type="submit"
                className="bg-amber-600 hover:bg-amber-700 text-white font-black px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider cursor-pointer shadow-md"
              >
                Confirm Fleet Hold
              </button>
            </div>
          </form>
        ) : (
          <div className="py-6 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h4 className="font-black text-lg text-black">Hold Confirmed!</h4>
            <p className="text-xs text-slate-800 font-bold">
              Vehicle <strong>{vehicle.regNumber}</strong> is placed on hold for {days} days starting {startDate}.
            </p>
            <button
              onClick={onClose}
              className="mt-2 bg-indigo-700 text-white font-black px-6 py-2 rounded-xl text-xs uppercase cursor-pointer shadow-md"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
