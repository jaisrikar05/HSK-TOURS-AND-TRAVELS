import React, { useState } from 'react';
import { Vehicle, MaintenanceAlert, ViewMode } from '../types';
import { 
  ShieldCheck, LayoutDashboard, BarChart3, Settings, 
  Search, Bell, Download, AlertTriangle, CheckCircle2,
  Fuel, Wrench, Truck, ArrowUpRight, Trash2
} from 'lucide-react';

interface FleetManagementProps {
  vehicles: Vehicle[];
  alerts: MaintenanceAlert[];
  onNavigate: (view: ViewMode) => void;
  onUpdateVehicles?: (vehicles: Vehicle[]) => void;
}

export const FleetManagement: React.FC<FleetManagementProps> = ({
  vehicles,
  alerts: initialAlerts,
  onNavigate,
  onUpdateVehicles,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'settings'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [alerts, setAlerts] = useState<MaintenanceAlert[]>(initialAlerts);

  // Settings State
  const [speedLimit, setSpeedLimit] = useState(80);
  const [telemetryInterval, setTelemetryInterval] = useState(15);
  const [serviceInterval, setServiceInterval] = useState(10000);
  const [autoDispatch, setAutoDispatch] = useState(true);
  const [savedSettings, setSavedSettings] = useState(false);

  // Delete Vehicle State & Handler
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);

  const handleDeleteVehicle = (vehicleIdOrObj: string | Vehicle, vehicleReg?: string, vehicleName?: string) => {
    if (typeof vehicleIdOrObj === 'object') {
      setVehicleToDelete(vehicleIdOrObj);
    } else {
      const target = vehicles.find(v => v.id === vehicleIdOrObj);
      if (target) setVehicleToDelete(target);
    }
  };

  const confirmDeleteVehicle = () => {
    if (!vehicleToDelete) return;
    const updated = vehicles.filter(v => v.id !== vehicleToDelete.id);
    if (onUpdateVehicles) {
      onUpdateVehicles(updated);
    }
    setVehicleToDelete(null);
  };

  // Export CSV Handler
  const handleExportCSV = () => {
    const headers = ['Vehicle Registration,Driver Name,Status,Capacity,Price Per Day\n'];
    const rows = vehicles.map(v => `${v.regNumber},"${v.currentDriver || 'Unassigned'}",${v.status},${v.capacity},₹${v.pricePerDay}\n`);
    const blob = new Blob([...headers, ...rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'HSK_Fleet_Operations_Report.csv';
    a.click();
  };

  // Resolve Alert Handler
  const handleResolveAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSettings(true);
    setTimeout(() => setSavedSettings(false), 3000);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row text-slate-900 bg-slate-50">
      {/* ADMIN SIDEBAR */}
      <aside className="w-full md:w-64 bg-white text-slate-900 flex flex-col justify-between shrink-0 p-4 border-r border-slate-300 shadow-sm">
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2 pt-2 border-b border-slate-200 pb-4">
            <div className="w-9 h-9 rounded-xl bg-indigo-700 text-white flex items-center justify-center font-black shadow-md border border-indigo-800">
              <ShieldCheck className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <span className="font-black text-xs tracking-wider block uppercase text-slate-900">Fleet Operations</span>
              <span className="text-[10px] text-indigo-700 font-bold">Control Center</span>
            </div>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black transition cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-indigo-700 text-white shadow-md'
                  : 'text-slate-800 hover:bg-slate-100 hover:text-black'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black transition cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-indigo-700 text-white shadow-md'
                  : 'text-slate-800 hover:bg-slate-100 hover:text-black'
              }`}
            >
              <BarChart3 className="w-4 h-4 shrink-0" />
              <span>Fleet Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black transition cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-indigo-700 text-white shadow-md'
                  : 'text-slate-800 hover:bg-slate-100 hover:text-black'
              }`}
            >
              <Settings className="w-4 h-4 shrink-0" />
              <span>Ops Settings</span>
            </button>
          </nav>
        </div>

        {/* Admin Profile & Navigation */}
        <div className="pt-6 border-t border-slate-200 space-y-3">
          <button
            onClick={() => onNavigate('admin')}
            className="w-full text-left px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-black text-indigo-900 border border-slate-300 transition flex items-center justify-between"
          >
            <span>← Back to Main Admin</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-indigo-700" />
          </button>

          <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
            <div className="w-10 h-10 rounded-full bg-indigo-700 text-white flex items-center justify-center overflow-hidden shrink-0 font-black border border-indigo-800">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
                alt="Master Controller"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h5 className="font-black text-xs text-slate-900 leading-tight">Admin Profile</h5>
              <span className="text-[10px] text-indigo-700 font-bold">Master Controller</span>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN ADMIN AREA */}
      <main className="flex-1 p-4 sm:p-8 space-y-8 max-w-[1280px] overflow-x-hidden">
        {/* HEADER BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-300">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-indigo-100 text-indigo-900 text-[10px] font-black uppercase px-2.5 py-0.5 rounded border border-indigo-200">
                LIVE TELEMETRY
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-['Manrope'] uppercase tracking-tight">
                Fleet Operations Dashboard
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 font-['Inter'] mt-1 font-bold">
              Real-time oversight of HSK Travels luxury bus fleet, compliance permits & route telemetry.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search Vehicle Reg or Driver..."
                className="w-full bg-white border border-slate-300 rounded-full pl-9 pr-4 py-2 text-xs text-slate-900 font-bold placeholder:text-slate-500 focus:outline-none focus:border-indigo-600 shadow-sm"
              />
            </div>

            <button 
              onClick={() => alert('All GPS telemetry and diagnostic sensors operational across 110 fleet units.')}
              className="p-2.5 bg-white border border-slate-300 rounded-full text-slate-700 hover:text-black transition shadow-sm cursor-pointer relative"
              title="System Alerts"
            >
              <Bell className="w-5 h-5 text-indigo-700" />
              {alerts.length > 0 && (
                <span className="absolute top-0 right-0 w-3 h-3 bg-rose-600 rounded-full ring-2 ring-white animate-pulse"></span>
              )}
            </button>
          </div>
        </div>

        {/* OVERVIEW TAB CONTENT */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* 4 STAT CARDS GRID */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-white rounded-2xl p-5 border-l-4 border-l-blue-600 border border-slate-300 shadow-sm space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-600">
                  ACTIVE ON-ROUTE TRIPS
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 font-['Manrope']">
                    42
                  </span>
                  <span className="text-xs font-black text-emerald-700 flex items-center gap-0.5">
                    ↗ +12%
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div className="h-full bg-blue-600 w-[65%] rounded-full"></div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border-l-4 border-l-emerald-600 border border-slate-300 shadow-sm space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-600">
                  TRIPS COMPLETED TODAY
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 font-['Manrope']">
                    128
                  </span>
                  <span className="text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded">
                    Target Met
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div className="h-full bg-emerald-600 w-[85%] rounded-full"></div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border-l-4 border-l-indigo-600 border border-slate-300 shadow-sm space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-600">
                  FLEET UTILIZATION
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 font-['Manrope']">
                    86<span className="text-lg text-slate-500 font-bold">/110</span>
                  </span>
                  <span className="text-xs font-black text-indigo-700">
                    78% Utilized
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div className="h-full bg-indigo-600 w-[78%] rounded-full"></div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border-l-4 border-l-rose-600 border border-slate-300 shadow-sm space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-600">
                  CRITICAL ALERTS
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl sm:text-4xl font-black text-rose-700 font-['Manrope']">
                    0{alerts.length}
                  </span>
                  <span className="text-[10px] font-black bg-rose-100 text-rose-950 border border-rose-300 px-2 py-0.5 rounded flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-rose-700" />
                    <span>Action Needed</span>
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div className="h-full bg-rose-600 w-[40%] rounded-full"></div>
                </div>
              </div>
            </div>

            {/* MIDDLE SECTION: FLEET STATUS TRACKER TABLE */}
            <div className="bg-white rounded-3xl p-6 border border-slate-300 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="text-lg font-black text-slate-900 font-['Manrope']">
                    Fleet Status Tracker
                  </h3>
                  <p className="text-xs text-slate-600 font-bold">Showing live status across registered vehicles</p>
                </div>

                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-indigo-900 font-black rounded-xl text-xs transition cursor-pointer border border-slate-300 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-700" />
                  <span>Export CSV</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b-2 border-slate-200 text-slate-800 font-black uppercase text-[10px] tracking-wider bg-slate-50">
                      <th className="py-3 px-3">Vehicle / Reg No</th>
                      <th className="py-3 px-3">Assigned Driver</th>
                      <th className="py-3 px-3">Current Status</th>
                      <th className="py-3 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {vehicles.length > 0 ? (
                      vehicles
                      .filter(v => v.name.toLowerCase().includes(searchTerm.toLowerCase()) || v.regNumber.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map((v, i) => (
                        <tr key={v.id} className="hover:bg-slate-50 transition font-bold">
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-2">
                              <span className="font-black text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded text-[11px] border border-indigo-200">
                                A{i + 1}
                              </span>
                              <div>
                                <span className="font-black text-slate-900 font-mono text-xs block">{v.regNumber}</span>
                                <span className="text-[10px] text-slate-500 font-bold">{v.name}</span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-3 font-bold text-slate-800">
                            {v.currentDriver || 'Unassigned'}
                          </td>

                          <td className="py-3.5 px-3">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                                v.status === 'ON TRIP'
                                  ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                                  : v.status === 'IDLE' || v.status === 'AVAILABLE'
                                  ? 'bg-slate-100 text-slate-900 border-slate-300'
                                  : 'bg-rose-100 text-rose-950 border-rose-300'
                              }`}
                            >
                              {v.status === 'ON TRIP' ? 'ONGOING TRIP' : v.status}
                            </span>
                          </td>

                          <td className="py-3.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => alert(`Showing operational trip history for ${v.regNumber} (${v.name}) assigned to ${v.currentDriver || 'Staff Driver'}`)}
                                className="text-indigo-700 hover:text-indigo-900 font-black text-xs cursor-pointer hover:underline"
                              >
                                History →
                              </button>
                              <button
                                onClick={() => handleDeleteVehicle(v.id, v.regNumber, v.name)}
                                className="p-1.5 rounded-lg text-rose-600 hover:text-rose-800 hover:bg-rose-50 transition cursor-pointer border border-rose-200 shadow-sm"
                                title="Delete Vehicle from Fleet"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-500 font-bold">
                          No vehicles in fleet. Click 'Back to Main Admin' to add vehicles.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* BOTTOM SECTION: MAINTENANCE ALERTS */}
            <div className="bg-white text-slate-900 rounded-3xl p-6 border border-slate-300 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="font-black text-slate-900 text-base font-['Manrope'] flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-700" />
                  <span>Fleet Maintenance & Diagnostic Alerts</span>
                </h3>
                <span className="text-xs text-indigo-900 font-black">{alerts.length} Active Notice(s)</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {alerts.length === 0 ? (
                  <div className="col-span-full p-4 bg-emerald-50 text-emerald-950 rounded-2xl text-xs font-black border border-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                    <span>All vehicle diagnostic sensors and maintenance schedules reporting optimal operating conditions.</span>
                  </div>
                ) : (
                  alerts.map((alt) => (
                    <div key={alt.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <h5 className="font-black text-xs text-rose-700 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>{alt.title}</span>
                          </h5>
                          <span className="text-[10px] text-slate-600 font-bold">{alt.time}</span>
                        </div>

                        <p className="text-[11px] text-slate-800 leading-relaxed font-bold">
                          {alt.description}
                        </p>
                      </div>

                      <button
                        onClick={() => handleResolveAlert(alt.id)}
                        className="self-start mt-2 text-[11px] font-black text-indigo-700 hover:text-indigo-900 underline cursor-pointer"
                      >
                        Mark as Resolved
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ANALYTICS TAB CONTENT */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-300 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-600 uppercase">Avg Fuel Efficiency</span>
                  <Fuel className="w-5 h-5 text-amber-600" />
                </div>
                <div className="text-3xl font-black text-slate-900 font-['Manrope']">
                  4.8 <span className="text-sm font-bold text-slate-600">km / L</span>
                </div>
                <p className="text-xs text-emerald-700 font-black">↗ +0.4 km/L vs last quarter (Volvo B11R Fleet)</p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-300 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-600 uppercase">Total Distance Logged</span>
                  <Truck className="w-5 h-5 text-indigo-700" />
                </div>
                <div className="text-3xl font-black text-slate-900 font-['Manrope']">
                  142,850 <span className="text-sm font-bold text-slate-600">km</span>
                </div>
                <p className="text-xs text-indigo-700 font-black">Across 110 fleet units this month</p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-300 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-600 uppercase">Scheduled Maintenance</span>
                  <Wrench className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="text-3xl font-black text-slate-900 font-['Manrope']">
                  98.2% <span className="text-sm font-bold text-slate-600">On-Time</span>
                </div>
                <p className="text-xs text-emerald-700 font-black">Zero breakdown incidents on corporate routes</p>
              </div>
            </div>

            {/* Fleet Revenue & Utilization Breakdown */}
            <div className="bg-white rounded-3xl p-6 border border-slate-300 shadow-sm space-y-4">
              <h3 className="text-lg font-black text-slate-900 font-['Manrope']">
                Vehicle Performance & Revenue Metrics
              </h3>
              <div className="space-y-4">
                {vehicles.map((v) => (
                  <div key={v.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-bold">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900 text-sm">{v.name}</span>
                        <span className="text-xs font-mono bg-white px-2 py-0.5 rounded border border-slate-300 text-slate-800">{v.regNumber}</span>
                      </div>
                      <p className="text-xs text-slate-600 font-bold">Capacity: {v.capacity} Seats | Driver: {v.currentDriver || 'Unassigned'}</p>
                    </div>

                    <div className="flex items-center gap-4 sm:gap-6">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 uppercase font-black block">Base Daily Rate</span>
                        <span className="text-base font-black text-slate-900 font-['Manrope']">₹{v.pricePerDay.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 uppercase font-black block">Occupancy Rate</span>
                        <span className="text-base font-black text-indigo-700">92%</span>
                      </div>
                      <button
                        onClick={() => handleDeleteVehicle(v.id, v.regNumber, v.name)}
                        className="p-2 rounded-xl text-rose-600 hover:text-rose-800 hover:bg-rose-100 transition cursor-pointer border border-rose-200 shadow-sm"
                        title="Delete Vehicle from Fleet"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS TAB CONTENT */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-300 shadow-sm space-y-6 max-w-2xl">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-xl font-black text-slate-900 font-['Manrope']">
                Fleet Operations & Safety Settings
              </h2>
              <p className="text-xs text-slate-700 font-bold mt-0.5">
                Configure governor speeds, telemetry sync intervals, and automated maintenance triggers.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-5 text-xs font-bold">
              <div>
                <label className="block font-black text-slate-800 mb-1">
                  Speed Governor Limit (km/h)
                </label>
                <input
                  type="number"
                  value={speedLimit}
                  onChange={(e) => setSpeedLimit(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-black font-bold focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
                <p className="text-[11px] text-slate-500 mt-1">Automated speed warning triggered if driver exceeds threshold.</p>
              </div>

              <div>
                <label className="block font-black text-slate-800 mb-1">
                  GPS Telemetry Sync Frequency (Seconds)
                </label>
                <input
                  type="number"
                  value={telemetryInterval}
                  onChange={(e) => setTelemetryInterval(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-black font-bold focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-black text-slate-800 mb-1">
                  Automated Maintenance Interval (Kilometers)
                </label>
                <input
                  type="number"
                  value={serviceInterval}
                  onChange={(e) => setServiceInterval(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-black font-bold focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="autodispatch"
                  checked={autoDispatch}
                  onChange={(e) => setAutoDispatch(e.target.checked)}
                  className="w-4 h-4 text-indigo-700 rounded border-slate-300 focus:ring-indigo-600"
                />
                <label htmlFor="autodispatch" className="font-black text-slate-900 cursor-pointer">
                  Enable Automated Backup Driver Dispatch on Route Delays (&gt;30 mins)
                </label>
              </div>

              {savedSettings && (
                <div className="p-3 bg-emerald-100 text-emerald-950 border border-emerald-300 rounded-xl text-xs font-black">
                  ✓ Operational parameters saved & synced to all onboard vehicle units.
                </div>
              )}

              <button
                type="submit"
                className="bg-indigo-700 hover:bg-indigo-800 text-white font-black px-6 py-3 rounded-xl uppercase tracking-wider cursor-pointer shadow-md"
              >
                Save Operations Settings
              </button>
            </form>
          </div>
        )}
      </main>

      {/* DELETE VEHICLE CONFIRMATION MODAL */}
      {vehicleToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-rose-300 rounded-3xl p-6 relative space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 border-b border-rose-100 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 border border-rose-200">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 font-['Manrope']">
                  Confirm Vehicle Removal
                </h3>
                <p className="text-[11px] text-rose-700 font-bold">
                  Remove from Fleet Operations Control
                </p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-black text-slate-900">{vehicleToDelete.name}</span>
                <span className="font-mono text-[10px] bg-indigo-100 text-indigo-950 px-2 py-0.5 rounded border border-indigo-200 font-black">
                  {vehicleToDelete.regNumber}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 font-medium">
                Category: <strong className="text-slate-800">{vehicleToDelete.category}</strong> • Driver: <strong className="text-slate-800">{vehicleToDelete.currentDriver || 'Unassigned'}</strong>
              </p>
            </div>

            <p className="text-xs text-slate-700 font-medium">
              Are you sure you want to permanently remove this vehicle from the active fleet records?
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={confirmDeleteVehicle}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-black py-2.5 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer shadow-md flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Yes, Delete Vehicle</span>
              </button>
              <button
                onClick={() => setVehicleToDelete(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs rounded-xl transition cursor-pointer border border-slate-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
