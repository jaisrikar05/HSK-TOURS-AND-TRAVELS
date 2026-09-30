import React, { useState, useRef, useEffect } from 'react';
import { TourPackage, Vehicle, PlannedTrip, TripFeedback, ViewMode, AdminProfile } from '../types';
import { initialAdminProfile } from '../data/mockData';
import { AdminProfileSection } from './AdminProfileSection';
import { 
  ShieldCheck, LayoutDashboard, CalendarCheck, Bus, Package, MessageSquare, 
  Plus, Search, Filter, Download, CheckCircle2, Clock, XCircle, AlertTriangle, AlertCircle,
  TrendingUp, Users, DollarSign, Star, Edit3, Trash2, ArrowUpRight, Check, Shield, User, RefreshCw,
  Calculator, Sliders, Lock, MapPin, Route, Gauge, Sparkles, Camera, Image as ImageIcon, Wand2,
  Upload, FolderPlus, UserCheck
} from 'lucide-react';
import { RealLifeImageGeneratorModal } from './RealLifeImageGeneratorModal';

interface AdminDashboardProps {
  plannedTrips: PlannedTrip[];
  vehicles: Vehicle[];
  packages: TourPackage[];
  feedbackList: TripFeedback[];
  onUpdateTrips: (trips: PlannedTrip[]) => void;
  onUpdateVehicles: (vehicles: Vehicle[]) => void;
  onUpdatePackages: (packages: TourPackage[]) => void;
  onNavigate: (view: ViewMode) => void;
  adminEmail?: string;
  onLockSession?: () => void;
  adminProfile?: AdminProfile;
  onUpdateAdminProfile?: (profile: AdminProfile) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  plannedTrips,
  vehicles,
  packages,
  feedbackList,
  onUpdateTrips,
  onUpdateVehicles,
  onUpdatePackages,
  onNavigate,
  adminEmail = '9158.jaisrikargkky@gmail.com',
  onLockSession,
  adminProfile,
  onUpdateAdminProfile,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'fleet' | 'packages' | 'reviews' | 'audit' | 'profile'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Internal state for admin profile fallback
  const [internalAdminProfile, setInternalAdminProfile] = useState<AdminProfile>(adminProfile || initialAdminProfile);

  useEffect(() => {
    if (adminProfile) {
      setInternalAdminProfile(adminProfile);
    }
  }, [adminProfile]);

  const currentAdminProfile = adminProfile || internalAdminProfile;

  const handleSaveAdminProfile = (updated: AdminProfile) => {
    setInternalAdminProfile(updated);
    if (onUpdateAdminProfile) {
      onUpdateAdminProfile(updated);
    }
    addAuditLog(`Admin Profile updated by ${updated.fullName} (${updated.roleTitle})`, 'Security');
  };

  // Audit Log State
  const [auditLogs, setAuditLogs] = useState<Array<{ id: string; time: string; action: string; category: string }>>([
    { id: 'log-1', time: '10 mins ago', action: 'Trip #trip-101 confirmed by Admin', category: 'Bookings' },
    { id: 'log-2', time: '25 mins ago', action: 'Vehicle TN 01 XY 9988 assigned to Ooty Highway route', category: 'Fleet' },
    { id: 'log-3', time: '1 hour ago', action: 'New Package "Coorg Coffee Land" published', category: 'Packages' },
    { id: 'log-4', time: '3 hours ago', action: 'System health check completed - All sensors operational', category: 'System' }
  ]);

  const addAuditLog = (action: string, category: string) => {
    setAuditLogs(prev => [
      { id: `log-${Date.now()}`, time: 'Just now', action, category },
      ...prev
    ]);
  };

  // Modals state
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);
  const [isNewVehicleOpen, setIsNewVehicleOpen] = useState(false);
  const [isNewPackageOpen, setIsNewPackageOpen] = useState(false);

  // Edit Package Pricing & Distance Modal State
  const [editingPricePkg, setEditingPricePkg] = useState<TourPackage | null>(null);
  const [priceForm, setPriceForm] = useState({
    pricePerPerson: 8500,
    estimatedKilometers: 580,
    baseRatePerKm: 15,
    location: '',
    image: ''
  });

  // Edit Package Cover Photo Modal State (Admin Only)
  const [editingCoverPkg, setEditingCoverPkg] = useState<TourPackage | null>(null);
  const [coverForm, setCoverForm] = useState({
    image: '',
    location: ''
  });
  const [isFetchingCoverImageModal, setIsFetchingCoverImageModal] = useState(false);
  const [coverImageModalStatus, setCoverImageModalStatus] = useState<string>('');
  const [vehicleStatusNotice, setVehicleStatusNotice] = useState<string>('');

  // Real-Life AI Image Generator Modal State (gemini-3.1-flash-image with 1K, 2K, 4K options)
  const [isAiImageModalOpen, setIsAiImageModalOpen] = useState(false);
  const [aiImageModalTarget, setAiImageModalTarget] = useState<'new_pkg' | 'edit_cover' | 'package_list'>('package_list');
  const [selectedAdminGeneratorPkg, setSelectedAdminGeneratorPkg] = useState<TourPackage | null>(null);

  // File Upload Input Refs for Local Laptop/Computer Photos
  const newPkgFileInputRef = useRef<HTMLInputElement>(null);
  const editCoverFileInputRef = useRef<HTMLInputElement>(null);
  const newVehicleFileInputRef = useRef<HTMLInputElement>(null);
  const editVehicleFileInputRef = useRef<HTMLInputElement>(null);

  // Edit Vehicle Modal State (Admin Only)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);
  const [editVehicleForm, setEditVehicleForm] = useState({
    regNumber: '',
    name: '',
    category: 'Force Traveler' as Vehicle['category'],
    capacity: '12+1 Seats',
    pricePerDay: 5000,
    currentDriver: '',
    location: 'Coimbatore Hub',
    status: 'AVAILABLE' as Vehicle['status'],
    image: ''
  });
  const [vehicleImageNotice, setVehicleImageNotice] = useState<string>('');

  const handleNewPkgLocalFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, WEBP, etc.) from your device.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        setNewPkg(prev => ({ ...prev, image: reader.result as string }));
        setCoverImageStatus(`📁 Uploaded photo from device: "${file.name}"`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleEditCoverLocalFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, WEBP, etc.) from your device.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        setCoverForm(prev => ({ ...prev, image: reader.result as string }));
        setCoverImageModalStatus(`📁 Uploaded photo from device: "${file.name}"`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleNewVehicleLocalFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, WEBP, etc.) from your device.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        setNewVehicle(prev => ({ ...prev, image: reader.result as string }));
        setVehicleImageNotice(`📁 Selected vehicle photo from device: "${file.name}"`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleEditVehicleLocalFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, WEBP, etc.) from your device.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        setEditVehicleForm(prev => ({ ...prev, image: reader.result as string }));
        setVehicleImageNotice(`📁 Uploaded vehicle photo from device: "${file.name}"`);
      }
    };
    reader.readAsDataURL(file);
  };

  // Form Validation Error States
  const [bookingErrors, setBookingErrors] = useState<Record<string, string>>({});
  const [newVehicleErrors, setNewVehicleErrors] = useState<Record<string, string>>({});
  const [editVehicleErrors, setEditVehicleErrors] = useState<Record<string, string>>({});
  const [newPkgErrors, setNewPkgErrors] = useState<Record<string, string>>({});
  const [priceErrors, setPriceErrors] = useState<Record<string, string>>({});
  const [coverErrors, setCoverErrors] = useState<Record<string, string>>({});

  const handleOpenVehicleEditor = (v: Vehicle) => {
    setEditingVehicle(v);
    setEditVehicleErrors({});
    setEditVehicleForm({
      regNumber: v.regNumber || '',
      name: v.name || '',
      category: v.category || 'Force Traveler',
      capacity: v.capacity || '12+1 Seats',
      pricePerDay: v.pricePerDay || 5000,
      currentDriver: v.currentDriver || '',
      location: v.location || 'Coimbatore Hub',
      status: v.status || 'AVAILABLE',
      image: v.image || 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&q=80&w=800'
    });
    setVehicleImageNotice('');
  };

  const validateVehicleData = (
    data: {
      regNumber: string;
      name: string;
      category: string;
      capacity: string;
      pricePerDay: number | string;
      location?: string;
      image?: string;
    },
    excludeVehicleId?: string
  ): Record<string, string> => {
    const errs: Record<string, string> = {};
    const regTrimmed = (data.regNumber || '').trim();

    if (!regTrimmed) {
      errs.regNumber = 'Vehicle registration number is required (e.g. TN 38 AB 9988)';
    } else if (regTrimmed.length < 4) {
      errs.regNumber = 'Registration number must be at least 4 characters';
    } else {
      const normalized = regTrimmed.replace(/[\s-]/g, '').toUpperCase();
      const isDuplicate = vehicles.some(
        (v) => v.id !== excludeVehicleId && v.regNumber.replace(/[\s-]/g, '').toUpperCase() === normalized
      );
      if (isDuplicate) {
        errs.regNumber = `Registration "${regTrimmed.toUpperCase()}" already exists in active fleet records.`;
      }
    }

    if (!(data.name || '').trim()) {
      errs.name = 'Vehicle name is required';
    } else if (data.name.trim().length < 3) {
      errs.name = 'Vehicle name must be at least 3 characters';
    }

    if (!(data.category || '').trim()) {
      errs.category = 'Vehicle type / category is required';
    }

    if (!(data.capacity || '').trim()) {
      errs.capacity = 'Seating capacity is required (e.g. 12+1 Seats)';
    }

    const priceNum = Number(data.pricePerDay);
    if (isNaN(priceNum) || priceNum < 500) {
      errs.pricePerDay = 'Daily rate must be at least ₹500';
    } else if (priceNum > 500000) {
      errs.pricePerDay = 'Daily rate cannot exceed ₹5,00,000';
    }

    if (data.location !== undefined && !data.location.trim()) {
      errs.location = 'Depot base location is required';
    }

    if (data.image !== undefined && !data.image.trim()) {
      errs.image = 'Vehicle photo URL or base64 data is required';
    }

    return errs;
  };

  const handleSaveVehicleEditor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVehicle) return;

    const errs = validateVehicleData(editVehicleForm, editingVehicle.id);
    if (Object.keys(errs).length > 0) {
      setEditVehicleErrors(errs);
      return;
    }

    const updated = vehicles.map(v => {
      if (v.id === editingVehicle.id) {
        return {
          ...v,
          regNumber: editVehicleForm.regNumber.trim().toUpperCase(),
          name: editVehicleForm.name.trim(),
          category: editVehicleForm.category.trim(),
          capacity: editVehicleForm.capacity.trim(),
          pricePerDay: Number(editVehicleForm.pricePerDay),
          currentDriver: editVehicleForm.currentDriver.trim() || 'Unassigned Driver',
          location: editVehicleForm.location.trim() || 'Coimbatore Hub',
          status: editVehicleForm.status,
          image: editVehicleForm.image
        };
      }
      return v;
    });

    onUpdateVehicles(updated);
    addAuditLog(`Vehicle "${editVehicleForm.name}" (#${editVehicleForm.regNumber}) updated by admin. Driver: ${editVehicleForm.currentDriver}, Base Location: ${editVehicleForm.location}, Status: ${editVehicleForm.status}`, 'Fleet');
    setVehicleStatusNotice(`Updated vehicle "${editVehicleForm.name}" (${editVehicleForm.regNumber}) successfully! AI Assistant synced.`);
    setTimeout(() => {
      setVehicleStatusNotice('');
    }, 4000);
    setEditVehicleErrors({});
    setEditingVehicle(null);
  };

  const handleDeleteVehicle = (vIdOrObj: string | Vehicle) => {
    const target = typeof vIdOrObj === 'string' ? vehicles.find(v => v.id === vIdOrObj) : vIdOrObj;
    if (!target) return;
    setVehicleToDelete(target);
  };

  const confirmDeleteVehicle = () => {
    if (!vehicleToDelete) return;
    const targetId = vehicleToDelete.id;
    const targetName = vehicleToDelete.name;
    const targetReg = vehicleToDelete.regNumber;

    const updated = vehicles.filter(v => v.id !== targetId);
    onUpdateVehicles(updated);
    addAuditLog(`Vehicle "${targetName}" (#${targetReg}) deleted from fleet by admin`, 'Fleet');
    setVehicleStatusNotice(`Removed vehicle "${targetName}" (${targetReg}) from fleet.`);
    setTimeout(() => setVehicleStatusNotice(''), 4000);

    if (editingVehicle?.id === targetId) {
      setEditingVehicle(null);
    }
    setVehicleToDelete(null);
  };

  const handleOpenCoverEditor = (pkg: TourPackage) => {
    setEditingCoverPkg(pkg);
    setCoverForm({
      image: pkg.image,
      location: pkg.location
    });
    setCoverImageModalStatus('');
  };

  const handleFetchCoverPhotoForModal = async (customQuery?: string) => {
    if (!editingCoverPkg) return;
    const query = (customQuery || coverForm.location || editingCoverPkg.title || editingCoverPkg.subtitle).trim();
    if (!query) return;

    setIsFetchingCoverImageModal(true);
    setCoverImageModalStatus(`Searching real-time picture for "${query}"...`);

    try {
      const res = await fetch('/api/admin/fetch-location-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: query,
          title: editingCoverPkg.title,
          subtitle: editingCoverPkg.subtitle
        })
      });
      const data = await res.json();
      if (data.success && data.imageUrl) {
        setCoverForm(prev => ({ ...prev, image: data.imageUrl, location: customQuery || prev.location }));
        setCoverImageModalStatus(`✨ Auto-fetched picture for "${data.query}"`);
      } else {
        setCoverImageModalStatus('Applied high-resolution travel scenery photo.');
      }
    } catch (err) {
      console.error('Fetch modal cover error:', err);
      setCoverImageModalStatus('Could not auto-fetch. You can enter or paste a custom Image URL.');
    } finally {
      setIsFetchingCoverImageModal(false);
    }
  };

  const validateCoverForm = (data: { location: string; image: string }): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!data.location.trim()) {
      errs.location = 'Destination / Location name is required';
    } else if (data.location.trim().length < 2) {
      errs.location = 'Location name must be at least 2 characters';
    }

    if (!data.image.trim()) {
      errs.image = 'Cover photo URL or base64 data is required';
    }
    return errs;
  };

  const handleSaveCoverPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoverPkg) return;

    const errs = validateCoverForm(coverForm);
    if (Object.keys(errs).length > 0) {
      setCoverErrors(errs);
      return;
    }

    const updated = packages.map(p => {
      if (p.id === editingCoverPkg.id) {
        return {
          ...p,
          image: coverForm.image.trim(),
          location: coverForm.location.trim() || p.location
        };
      }
      return p;
    });

    onUpdatePackages(updated);
    addAuditLog(`Admin cover photo update: Updated cover photo for package "${editingCoverPkg.title} ${editingCoverPkg.subtitle}" (${coverForm.location})`, 'Packages');
    setCoverErrors({});
    setEditingCoverPkg(null);
  };

  const handleOpenPriceEditor = (pkg: TourPackage) => {
    setEditingPricePkg(pkg);
    setPriceErrors({});
    setPriceForm({
      pricePerPerson: pkg.pricePerPerson,
      estimatedKilometers: pkg.estimatedKilometers || 500,
      baseRatePerKm: pkg.baseRatePerKm || 15,
      location: pkg.location,
      image: pkg.image
    });
  };

  const validatePriceFormData = (data: {
    location: string;
    estimatedKilometers: number | string;
    baseRatePerKm: number | string;
    pricePerPerson: number | string;
  }): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!data.location.trim()) {
      errs.location = 'Destination / Location name is required';
    } else if (data.location.trim().length < 2) {
      errs.location = 'Location name must be at least 2 characters';
    }

    const km = Number(data.estimatedKilometers);
    if (isNaN(km) || km < 1) {
      errs.estimatedKilometers = 'Estimated distance must be at least 1 KM';
    } else if (km > 10000) {
      errs.estimatedKilometers = 'Estimated distance cannot exceed 10,000 KM';
    }

    const rate = Number(data.baseRatePerKm);
    if (isNaN(rate) || rate < 0.5) {
      errs.baseRatePerKm = 'Base rate per KM must be at least ₹0.5';
    } else if (rate > 500) {
      errs.baseRatePerKm = 'Base rate per KM cannot exceed ₹500';
    }

    const price = Number(data.pricePerPerson);
    if (isNaN(price) || price < 100) {
      errs.pricePerPerson = 'Price per person must be at least ₹100';
    } else if (price > 2000000) {
      errs.pricePerPerson = 'Price per person cannot exceed ₹20,00,000';
    }

    return errs;
  };

  const handleSavePriceEditor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPricePkg) return;

    const errs = validatePriceFormData(priceForm);
    if (Object.keys(errs).length > 0) {
      setPriceErrors(errs);
      return;
    }

    const updated = packages.map(p => {
      if (p.id === editingPricePkg.id) {
        return {
          ...p,
          pricePerPerson: Number(priceForm.pricePerPerson),
          estimatedKilometers: Number(priceForm.estimatedKilometers),
          baseRatePerKm: Number(priceForm.baseRatePerKm),
          location: priceForm.location.trim(),
          image: priceForm.image || p.image
        };
      }
      return p;
    });

    onUpdatePackages(updated);
    addAuditLog(`Admin tariff update: Changed price for "${editingPricePkg.title} ${editingPricePkg.subtitle}" to ₹${priceForm.pricePerPerson}/person (Destination: ${priceForm.location}, Distance: ${priceForm.estimatedKilometers} km @ ₹${priceForm.baseRatePerKm}/km)`, 'Packages');
    setPriceErrors({});
    setEditingPricePkg(null);
  };

  const handleAutoCalculatePrice = () => {
    const km = Number(priceForm.estimatedKilometers) || 0;
    const rate = Number(priceForm.baseRatePerKm) || 0;
    const calc = Math.round(km * rate);
    setPriceForm(prev => ({ ...prev, pricePerPerson: calc }));
    setPriceErrors(prev => {
      const next = { ...prev };
      delete next.pricePerPerson;
      return next;
    });
  };

  // New Booking Form State
  const [newBooking, setNewBooking] = useState({
    title: '',
    dates: '',
    vehicleName: 'Luxury Force Traveler (12+1)',
    guestsCount: 1,
    totalCost: 5000,
    itinerarySummary: ''
  });

  // New Vehicle Form State
  const [newVehicle, setNewVehicle] = useState({
    regNumber: '',
    name: '',
    category: 'Force Traveler' as Vehicle['category'],
    capacity: '12+1 Seats',
    pricePerDay: 5000,
    currentDriver: '',
    location: 'Coimbatore Hub',
    image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&q=80&w=800'
  });

  // New Package Form State
  const [newPkg, setNewPkg] = useState({
    title: '',
    subtitle: '',
    location: '',
    duration: '3D/2N',
    pricePerPerson: 8500,
    highlightsStr: 'LAKE TOUR, TEA GARDENS, MOUNTAIN VIEW',
    description: '',
    image: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&q=80&w=1000'
  });

  // Real-time Cover Photo Fetching state
  const [isFetchingCoverImage, setIsFetchingCoverImage] = useState(false);
  const [coverImageStatus, setCoverImageStatus] = useState<string>('');

  const handleFetchRealTimeCoverPhoto = async (targetLocation?: string) => {
    const query = (targetLocation || newPkg.location || newPkg.subtitle || newPkg.title).trim();
    if (!query) return;

    setIsFetchingCoverImage(true);
    setCoverImageStatus(`Searching real-time destination picture for "${query}"...`);

    try {
      const res = await fetch('/api/admin/fetch-location-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: query,
          title: newPkg.title,
          subtitle: newPkg.subtitle
        })
      });
      const data = await res.json();
      if (data.success && data.imageUrl) {
        setNewPkg(prev => ({ ...prev, image: data.imageUrl }));
        setNewPkgErrors(prev => {
          const next = { ...prev };
          delete next.image;
          return next;
        });
        setCoverImageStatus(`✨ Real-time location cover photo auto-applied for "${data.query}" (${data.locationTag || 'Destination Image'})`);
      } else {
        setCoverImageStatus('Applied high-resolution travel scenery photo.');
      }
    } catch (err) {
      console.error('Real-time cover photo fetch failed:', err);
      setCoverImageStatus('Applied current preview image.');
    } finally {
      setIsFetchingCoverImage(false);
    }
  };

  // Calculation Metrics
  const totalRevenue = plannedTrips.reduce((acc, trip) => acc + (trip.status !== 'Cancelled' ? trip.totalCost : 0), 0);
  const confirmedCount = plannedTrips.filter(t => t.status === 'Confirmed').length;
  const processingCount = plannedTrips.filter(t => t.status === 'Processing').length;
  const completedCount = plannedTrips.filter(t => t.status === 'Completed').length;
  const activeVehiclesCount = vehicles.filter(v => v.status === 'ON TRIP' || v.status === 'AVAILABLE').length;

  // Handlers for Booking Actions
  const handleUpdateTripStatus = (tripId: string, newStatus: PlannedTrip['status']) => {
    const updated = plannedTrips.map(t => t.id === tripId ? { ...t, status: newStatus } : t);
    onUpdateTrips(updated);
    addAuditLog(`Booking #${tripId} status changed to ${newStatus}`, 'Bookings');
  };

  const validateBookingData = (data: typeof newBooking): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!data.title.trim()) {
      errs.title = 'Trip / Tour title is required';
    } else if (data.title.trim().length < 3) {
      errs.title = 'Trip title must be at least 3 characters long';
    } else if (data.title.trim().length > 100) {
      errs.title = 'Trip title cannot exceed 100 characters';
    }

    if (!data.dates.trim()) {
      errs.dates = 'Travel dates are required (e.g. Aug 15 - Aug 18)';
    } else if (data.dates.trim().length < 3) {
      errs.dates = 'Please enter valid travel dates';
    }

    if (!data.vehicleName.trim()) {
      errs.vehicleName = 'Please select a preferred vehicle from fleet';
    }

    const guests = Number(data.guestsCount);
    if (isNaN(guests) || guests < 1) {
      errs.guestsCount = 'Guests count must be at least 1 traveler';
    } else if (guests > 120) {
      errs.guestsCount = 'Guests count cannot exceed 120 travelers';
    }

    const cost = Number(data.totalCost);
    if (isNaN(cost) || cost < 500) {
      errs.totalCost = 'Total trip cost must be at least ₹500';
    } else if (cost > 10000000) {
      errs.totalCost = 'Total trip cost cannot exceed ₹1,00,00,000';
    }

    return errs;
  };

  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateBookingData(newBooking);
    if (Object.keys(errs).length > 0) {
      setBookingErrors(errs);
      return;
    }

    const createdTrip: PlannedTrip = {
      id: `trip-${Date.now()}`,
      title: newBooking.title.trim(),
      dates: newBooking.dates.trim(),
      status: 'Confirmed',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800',
      vehicleName: newBooking.vehicleName,
      guestsCount: Number(newBooking.guestsCount),
      totalCost: Number(newBooking.totalCost),
      itinerarySummary: newBooking.itinerarySummary.trim() || `Custom trip for ${newBooking.guestsCount} travelers.`
    };

    onUpdateTrips([createdTrip, ...plannedTrips]);
    setIsNewBookingOpen(false);
    setBookingErrors({});
    setNewBooking({ title: '', dates: '', vehicleName: 'Luxury Force Traveler (12+1)', guestsCount: 1, totalCost: 5000, itinerarySummary: '' });
    addAuditLog(`Manual booking "${createdTrip.title}" created for ₹${createdTrip.totalCost}`, 'Bookings');
  };

  // Handlers for Vehicle Actions
  const handleUpdateVehicleStatus = (vId: string, newStatus: Vehicle['status']) => {
    const targetV = vehicles.find(v => v.id === vId);
    const updated = vehicles.map(v => v.id === vId ? { ...v, status: newStatus } : v);
    onUpdateVehicles(updated);
    addAuditLog(`Vehicle #${vId} status updated to ${newStatus}`, 'Fleet');
    
    setVehicleStatusNotice(`Status for ${targetV ? targetV.name : 'Vehicle'} updated to "${newStatus}". Real-time AI Assistant now synced!`);
    setTimeout(() => {
      setVehicleStatusNotice('');
    }, 4000);
  };

  const handleCreateVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateVehicleData(newVehicle);
    if (Object.keys(errs).length > 0) {
      setNewVehicleErrors(errs);
      return;
    }

    const createdVehicle: Vehicle = {
      id: `v-${Date.now()}`,
      regNumber: newVehicle.regNumber.trim().toUpperCase(),
      name: newVehicle.name.trim(),
      category: newVehicle.category,
      capacity: newVehicle.capacity.trim(),
      amenities: ['wifi', 'ac', 'audio', 'recline'],
      status: 'AVAILABLE',
      pricePerDay: Number(newVehicle.pricePerDay),
      currentDriver: newVehicle.currentDriver.trim() || 'Unassigned Driver',
      location: newVehicle.location.trim() || 'Coimbatore Hub',
      speed: '0 km/h',
      image: newVehicle.image || 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&q=80&w=800'
    };

    onUpdateVehicles([...vehicles, createdVehicle]);
    setIsNewVehicleOpen(false);
    setNewVehicleErrors({});
    setNewVehicle({ regNumber: '', name: '', category: 'Force Traveler', capacity: '12+1 Seats', pricePerDay: 5000, currentDriver: '', location: 'Coimbatore Hub', image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&q=80&w=800' });
    addAuditLog(`New vehicle "${createdVehicle.name}" (${createdVehicle.regNumber}) added to fleet`, 'Fleet');
  };

  const validatePackageData = (data: typeof newPkg): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!data.title.trim()) {
      errs.title = 'Package title is required';
    } else if (data.title.trim().length < 3) {
      errs.title = 'Package title must be at least 3 characters';
    }

    if (!data.subtitle.trim()) {
      errs.subtitle = 'Package subtitle / location tag is required';
    } else if (data.subtitle.trim().length < 2) {
      errs.subtitle = 'Subtitle must be at least 2 characters';
    }

    if (!data.location.trim()) {
      errs.location = 'Destination location is required';
    } else if (data.location.trim().length < 2) {
      errs.location = 'Location must be at least 2 characters';
    }

    if (!data.duration.trim()) {
      errs.duration = 'Tour duration is required (e.g. 3D/2N)';
    }

    const price = Number(data.pricePerPerson);
    if (isNaN(price) || price < 100) {
      errs.pricePerPerson = 'Price per person must be at least ₹100';
    } else if (price > 2000000) {
      errs.pricePerPerson = 'Price per person cannot exceed ₹20,00,000';
    }

    if (!data.highlightsStr.trim()) {
      errs.highlightsStr = 'Please provide at least one tour highlight (comma-separated)';
    }

    if (!data.image.trim()) {
      errs.image = 'Package cover photo URL or base64 data is required';
    }

    return errs;
  };

  // Handlers for Tour Package Actions
  const handleCreatePackage = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validatePackageData(newPkg);
    if (Object.keys(errs).length > 0) {
      setNewPkgErrors(errs);
      return;
    }

    const createdPkg: TourPackage = {
      id: `pkg-${Date.now()}`,
      title: newPkg.title.trim(),
      subtitle: newPkg.subtitle.trim() || 'SPECIAL TOUR',
      location: newPkg.location.trim(),
      duration: newPkg.duration.trim(),
      pricePerPerson: Number(newPkg.pricePerPerson),
      rating: 5.0,
      image: newPkg.image.trim(),
      highlights: newPkg.highlightsStr.split(',').map(s => s.trim()).filter(Boolean),
      description: newPkg.description.trim() || `Luxury tour experience in ${newPkg.location} with HSK bus transportation included.`,
      itinerary: [
        { day: 1, title: 'Arrival & Welcome', description: 'Scenic travel in HSK luxury bus and arrival resort check-in.' },
        { day: 2, title: 'Sightseeing & Excursions', description: 'Guided visits to top local attractions and evening bonfire.' },
        { day: 3, title: 'Local Markets & Return', description: 'Souvenir shopping and comfortable return trip.' }
      ],
      includedAmenities: ['Climate AC', 'Luxury Recliners', 'High-Speed Wi-Fi', 'Professional Driver']
    };

    onUpdatePackages([...packages, createdPkg]);
    setIsNewPackageOpen(false);
    setNewPkgErrors({});
    setNewPkg({ title: '', subtitle: '', location: '', duration: '3D/2N', pricePerPerson: 8500, highlightsStr: 'LAKE TOUR, TEA GARDENS, MOUNTAIN VIEW', description: '', image: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&q=80&w=1000' });
    addAuditLog(`New Tour Package "${createdPkg.title}" added for ₹${createdPkg.pricePerPerson}/person`, 'Packages');
  };

  // CSV Export Handler
  const handleExportReport = () => {
    const headers = ['Booking ID,Trip Title,Travel Dates,Status,Guests,Total Cost (INR)\n'];
    const rows = plannedTrips.map(t => `${t.id},"${t.title}",${t.dates},${t.status},${t.guestsCount},${t.totalCost}\n`);
    const blob = new Blob([...headers, ...rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HSK_Admin_Master_Report_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    addAuditLog('Master Admin CSV Report exported', 'System');
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row text-black">
      {/* ADMIN SIDEBAR CONTROL PANEL */}
      <aside className="w-full lg:w-72 glass-dark text-black flex flex-col justify-between shrink-0 p-5 border-r border-slate-300">
        <div className="space-y-6">
          {/* Header Brand */}
          <div className="flex items-center gap-3 px-2 pb-5 border-b border-slate-300">
            <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-black shadow-md border border-amber-500">
              <Shield className="w-5 h-5 text-amber-100" />
            </div>
            <div>
              <span className="font-black text-sm tracking-wider block uppercase text-black font-['Manrope']">
                HSK Admin Hub
              </span>
              <span className="text-[10px] text-amber-800 font-black tracking-widest uppercase">
                Executive Control
              </span>
            </div>
          </div>

          {/* Navigation Menu Tabs */}
          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black transition cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-amber-600 text-white shadow-md border border-amber-700'
                  : 'text-black hover:bg-slate-200'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-amber-900" />
              <span>Executive Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('bookings')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-black transition cursor-pointer ${
                activeTab === 'bookings'
                  ? 'bg-amber-600 text-white shadow-md border border-amber-700'
                  : 'text-black hover:bg-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <CalendarCheck className="w-4 h-4 text-amber-900" />
                <span>Reservations & Trips</span>
              </div>
              <span className="bg-amber-100 text-amber-950 px-2 py-0.5 rounded-full text-[10px] font-black border border-amber-300">
                {plannedTrips.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('fleet')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-black transition cursor-pointer ${
                activeTab === 'fleet'
                  ? 'bg-amber-600 text-white shadow-md border border-amber-700'
                  : 'text-black hover:bg-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Bus className="w-4 h-4 text-indigo-900" />
                <span>Fleet & Dispatch</span>
              </div>
              <span className="bg-indigo-100 text-indigo-950 px-2 py-0.5 rounded-full text-[10px] font-black border border-indigo-300">
                {vehicles.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('packages')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-black transition cursor-pointer ${
                activeTab === 'packages'
                  ? 'bg-amber-600 text-white shadow-md border border-amber-700'
                  : 'text-black hover:bg-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Package className="w-4 h-4 text-rose-900" />
                <span>Tour Packages</span>
              </div>
              <span className="bg-rose-100 text-rose-950 px-2 py-0.5 rounded-full text-[10px] font-black border border-rose-300">
                {packages.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-black transition cursor-pointer ${
                activeTab === 'reviews'
                  ? 'bg-amber-600 text-white shadow-md border border-amber-700'
                  : 'text-black hover:bg-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4 text-emerald-900" />
                <span>Customer Feedback</span>
              </div>
              <span className="bg-emerald-100 text-emerald-950 px-2 py-0.5 rounded-full text-[10px] font-black border border-emerald-300">
                {feedbackList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black transition cursor-pointer ${
                activeTab === 'audit'
                  ? 'bg-amber-600 text-white shadow-md border border-amber-700'
                  : 'text-black hover:bg-slate-200'
              }`}
            >
              <RefreshCw className="w-4 h-4 text-cyan-900" />
              <span>System Activity Logs</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-black transition cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-amber-600 text-white shadow-md border border-amber-700'
                  : 'text-black hover:bg-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <UserCheck className="w-4 h-4 text-amber-900" />
                <span>Admin Profile</span>
              </div>
              <span className="bg-amber-100 text-amber-950 px-2 py-0.5 rounded-full text-[10px] font-black border border-amber-300">
                Edit
              </span>
            </button>
          </nav>
        </div>

        {/* Quick Operational Shortcuts */}
        <div className="pt-6 border-t border-slate-300 space-y-3">
          <button
            onClick={() => onNavigate('fleet-admin')}
            className="w-full py-2.5 px-3 bg-amber-100 hover:bg-amber-200 text-xs font-black text-amber-950 rounded-xl border border-amber-300 flex items-center justify-center gap-2 cursor-pointer transition uppercase"
          >
            <ShieldCheck className="w-4 h-4 text-amber-800" />
            <span>Open Fleet Permit Manager</span>
          </button>

          <div
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-3 p-3 rounded-2xl border transition cursor-pointer group ${
              activeTab === 'profile'
                ? 'bg-amber-100 border-amber-400 shadow-md ring-2 ring-amber-300'
                : 'bg-slate-100 hover:bg-slate-200 border-slate-300'
            }`}
            title="Click to view & edit Master Admin Profile"
          >
            <div className="w-10 h-10 rounded-full bg-amber-700 text-white flex items-center justify-center overflow-hidden shrink-0 font-black border-2 border-amber-600 shadow-sm">
              {currentAdminProfile.avatarUrl ? (
                <img src={currentAdminProfile.avatarUrl} alt={currentAdminProfile.fullName} className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5 text-amber-100" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h5 className="font-black text-xs text-black leading-tight truncate group-hover:text-amber-800 transition">
                  {currentAdminProfile.fullName}
                </h5>
                <Edit3 className="w-3 h-3 text-slate-400 group-hover:text-amber-600 shrink-0" />
              </div>
              <span className="text-[10px] text-amber-900 font-bold block truncate">
                {currentAdminProfile.roleTitle}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN ADMIN DASHBOARD CONTENT */}
      <main className="flex-1 p-4 sm:p-8 space-y-8 max-w-[1280px] overflow-x-hidden">
        {/* TOP ADMIN HEADER BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b-2 border-slate-300">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-950 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-300">
                <Shield className="w-3.5 h-3.5 text-amber-800" />
                <span>HSK Executive Management Panel</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className="inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 px-3 py-1 rounded-full text-[10px] font-black tracking-wide transition cursor-pointer"
                title="Click to view & edit Admin Profile"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>2-Step Verified via Gmail: {currentAdminProfile.email}</span>
                <Edit3 className="w-3 h-3 text-emerald-600 ml-0.5" />
              </button>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-black font-['Manrope'] tracking-tight">
              ADMINISTRATIVE DASHBOARD
            </h1>
            <p className="text-xs sm:text-sm text-black font-['Inter'] mt-1 font-bold">
              Full enterprise oversight of bookings, fleet dispatch, packages & customer satisfaction.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`font-black px-3.5 py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer border shadow-sm ${
                activeTab === 'profile'
                  ? 'bg-amber-600 text-white border-amber-700'
                  : 'bg-white hover:bg-amber-50 text-slate-900 border-slate-300'
              }`}
            >
              <UserCheck className="w-4 h-4 text-amber-600" />
              <span>Admin Profile</span>
            </button>

            {onLockSession && (
              <button
                onClick={onLockSession}
                className="bg-rose-50 hover:bg-rose-100 text-rose-800 font-black px-3.5 py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer border border-rose-300 shadow-sm"
                title="Lock admin dashboard session"
              >
                <Lock className="w-3.5 h-3.5 text-rose-700" />
                <span>Lock / Re-verify</span>
              </button>
            )}

            <button
              onClick={handleExportReport}
              className="bg-slate-200 hover:bg-slate-300 text-black font-black px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 transition cursor-pointer border border-slate-400 shadow-sm"
            >
              <Download className="w-4 h-4 text-indigo-800" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => setIsNewBookingOpen(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white font-black px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 transition cursor-pointer border border-transparent shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>New Reservation</span>
            </button>
          </div>
        </div>

        {/* 4 EXECUTIVE KPI SUMMARY CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="glass-card rounded-3xl p-6 border-l-4 border-l-amber-600 border-2 border-slate-300 shadow-md space-y-2">
            <div className="flex items-center justify-between text-black">
              <span className="text-[10px] font-black uppercase tracking-widest text-black">TOTAL BOOKINGS REVENUE</span>
              <DollarSign className="w-5 h-5 text-amber-700" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-black text-black font-['Manrope']">
                ₹{(totalRevenue / 1000).toFixed(1)}k
              </span>
              <span className="text-xs font-black text-emerald-700 flex items-center gap-0.5">
                <TrendingUp className="w-3.5 h-3.5" /> +18.4%
              </span>
            </div>
            <p className="text-[11px] text-black font-bold">From {plannedTrips.length} active customer reservations</p>
          </div>

          <div className="glass-card rounded-3xl p-6 border-l-4 border-l-indigo-600 border-2 border-slate-300 shadow-md space-y-2">
            <div className="flex items-center justify-between text-black">
              <span className="text-[10px] font-black uppercase tracking-widest text-black">CONFIRMED TRIPS</span>
              <CheckCircle2 className="w-5 h-5 text-indigo-700" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-black text-black font-['Manrope']">
                {confirmedCount} <span className="text-sm font-bold text-black">/ {plannedTrips.length}</span>
              </span>
              <span className="text-[10px] bg-indigo-100 text-indigo-950 border border-indigo-300 px-2 py-0.5 rounded-md font-black">
                {processingCount} Processing
              </span>
            </div>
            <p className="text-[11px] text-black font-bold">{completedCount} trips successfully completed</p>
          </div>

          <div className="glass-card rounded-3xl p-6 border-l-4 border-l-rose-600 border-2 border-slate-300 shadow-md space-y-2">
            <div className="flex items-center justify-between text-black">
              <span className="text-[10px] font-black uppercase tracking-widest text-black">FLEET UTILIZATION</span>
              <Bus className="w-5 h-5 text-rose-700" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-black text-black font-['Manrope']">
                {Math.round((activeVehiclesCount / vehicles.length) * 100)}%
              </span>
              <span className="text-xs font-black text-rose-900">
                {activeVehiclesCount}/{vehicles.length} Active
              </span>
            </div>
            <p className="text-[11px] text-black font-bold">Luxury buses & Force Travelers deployed</p>
          </div>

          <div className="glass-card rounded-3xl p-6 border-l-4 border-l-emerald-600 border-2 border-slate-300 shadow-md space-y-2">
            <div className="flex items-center justify-between text-black">
              <span className="text-[10px] font-black uppercase tracking-widest text-black">SATISFACTION RATING</span>
              <Star className="w-5 h-5 text-emerald-600 fill-emerald-600" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-black text-emerald-950 font-['Manrope']">
                4.9 / 5.0
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-950 border border-emerald-300 px-2 py-0.5 rounded-md font-black">
                Top Rated
              </span>
            </div>
            <p className="text-[11px] text-black font-bold">Based on verified traveler reviews</p>
          </div>
        </div>

        {/* TAB 1: EXECUTIVE OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Action Bar & Quick Modals Trigger */}
            <div className="bg-white rounded-3xl p-6 border border-slate-300 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <h3 className="text-lg font-black text-black font-['Manrope']">
                  Quick Administrative Actions
                </h3>
                <span className="text-xs text-amber-950 bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-full font-black">Master Operations</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => setIsNewBookingOpen(true)}
                  className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-300 transition flex items-center gap-3 group text-left cursor-pointer shadow-sm"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-black border border-amber-700 group-hover:scale-110 transition shadow-sm">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-black text-xs text-black">Create Manual Booking</h5>
                    <p className="text-[11px] text-slate-700 font-bold">Book on behalf of custom client</p>
                  </div>
                </button>

                <button
                  onClick={() => setIsNewVehicleOpen(true)}
                  className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-300 transition flex items-center gap-3 group text-left cursor-pointer shadow-sm"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black border border-indigo-700 group-hover:scale-110 transition shadow-sm">
                    <Bus className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-black text-xs text-black">Add Vehicle to Fleet</h5>
                    <p className="text-[11px] text-slate-700 font-bold">Register new bus or traveler</p>
                  </div>
                </button>

                <button
                  onClick={() => setIsNewPackageOpen(true)}
                  className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-300 transition flex items-center gap-3 group text-left cursor-pointer shadow-sm"
                >
                  <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-black border border-rose-700 group-hover:scale-110 transition shadow-sm">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-black text-xs text-black">Publish Tour Package</h5>
                    <p className="text-[11px] text-slate-700 font-bold">Create new destination package</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('profile')}
                  className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-300 transition flex items-center gap-3 group text-left cursor-pointer shadow-sm"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-black border border-slate-800 group-hover:scale-110 transition shadow-sm">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-black text-xs text-black">Edit Admin Profile</h5>
                    <p className="text-[11px] text-slate-700 font-bold">Designation, 2FA email & hub</p>
                  </div>
                </button>
              </div>
            </div>

            {/* TWO COLUMN GRID: RECENT BOOKINGS & FLEET DISPATCH STATUS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* RECENT BOOKINGS OVERVIEW */}
              <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-300 shadow-md space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <h3 className="text-lg font-black text-black font-['Manrope']">
                    Recent Customer Reservations
                  </h3>
                  <button
                    onClick={() => setActiveTab('bookings')}
                    className="text-xs text-amber-900 hover:text-amber-950 font-black cursor-pointer underline"
                  >
                    View All ({plannedTrips.length}) →
                  </button>
                </div>

                <div className="space-y-3">
                  {plannedTrips.slice(0, 4).map((trip) => (
                    <div key={trip.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-black text-sm">{trip.title}</span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase border ${
                            trip.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-950 border-emerald-300' :
                            trip.status === 'Processing' ? 'bg-amber-100 text-amber-950 border-amber-300' :
                            trip.status === 'Completed' ? 'bg-indigo-100 text-indigo-950 border-indigo-300' :
                            'bg-rose-100 text-rose-950 border-rose-300'
                          }`}>
                            {trip.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-800 font-bold">
                          {trip.dates} • {trip.vehicleName} • {trip.guestsCount} Guests
                        </p>
                      </div>

                      <div className="text-left sm:text-right shrink-0">
                        <span className="block font-black text-amber-950 text-sm">₹{trip.totalCost.toLocaleString()}</span>
                        <div className="flex items-center gap-1.5 mt-1">
                          <button
                            onClick={() => handleUpdateTripStatus(trip.id, 'Confirmed')}
                            className="text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-black px-2.5 py-1 rounded transition cursor-pointer shadow-sm"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleUpdateTripStatus(trip.id, 'Cancelled')}
                            className="text-[10px] bg-rose-600 hover:bg-rose-700 text-white font-black px-2.5 py-1 rounded transition cursor-pointer shadow-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* LIVE FLEET DISPATCH STATUS */}
              <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-300 shadow-md space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <h3 className="text-lg font-black text-black font-['Manrope']">
                    Fleet Dispatch Live
                  </h3>
                  <button
                    onClick={() => setActiveTab('fleet')}
                    className="text-xs text-indigo-900 hover:text-indigo-950 font-black cursor-pointer underline"
                  >
                    Manage Fleet →
                  </button>
                </div>

                <div className="space-y-3">
                  {vehicles.map((v) => (
                    <div key={v.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3 shadow-sm">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-xs text-black">{v.name}</span>
                          <span className="text-[10px] font-mono text-indigo-950 bg-indigo-100 px-1.5 py-0.5 rounded border border-indigo-300 font-bold">
                            {v.regNumber}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-800 font-bold mt-0.5">
                          Driver: {v.currentDriver || 'Unassigned'} • {v.capacity}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={v.status}
                          onChange={(e) => handleUpdateVehicleStatus(v.id, e.target.value as Vehicle['status'])}
                          className={`text-[10px] font-black uppercase rounded-lg px-2 py-1 bg-white border cursor-pointer ${
                            v.status === 'AVAILABLE' ? 'text-emerald-950 border-emerald-400 bg-emerald-50' :
                            v.status === 'ON TRIP' ? 'text-indigo-950 border-indigo-400 bg-indigo-50' :
                            v.status === 'MAINTENANCE' ? 'text-rose-950 border-rose-400 bg-rose-50' :
                            'text-slate-800 border-slate-400 bg-slate-50'
                          }`}
                        >
                          <option value="AVAILABLE">AVAILABLE</option>
                          <option value="ON TRIP">ON TRIP</option>
                          <option value="MAINTENANCE">MAINTENANCE</option>
                          <option value="IDLE">IDLE</option>
                        </select>
                        <button
                          onClick={() => handleDeleteVehicle(v.id)}
                          className="p-1.5 rounded-lg text-rose-600 hover:text-rose-800 hover:bg-rose-100 transition cursor-pointer border border-rose-200 shadow-xs"
                          title="Delete vehicle from fleet"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-700" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: RESERVATIONS & BOOKINGS MANAGER */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-300 shadow-md space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-xl font-black text-black font-['Manrope']">
                  Reservations & Customer Bookings Manager
                </h3>
                <p className="text-xs text-slate-700 font-bold">
                  Review, approve, modify, or cancel customer tour & vehicle charter reservations.
                </p>
              </div>

              <button
                onClick={() => setIsNewBookingOpen(true)}
                className="bg-amber-600 hover:bg-amber-700 text-white font-black px-4 py-2 rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 transition cursor-pointer self-start sm:self-center shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>New Booking</span>
              </button>
            </div>

            {/* Filter & Search Controls */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by trip name or vehicle..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-full pl-9 pr-4 py-2 text-xs text-black font-bold placeholder:text-slate-500 focus:outline-none focus:border-amber-600 focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
                {['all', 'Confirmed', 'Processing', 'Completed', 'Cancelled'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-full text-xs font-black capitalize cursor-pointer border transition shrink-0 ${
                      statusFilter === st
                        ? 'bg-amber-600 text-white border-amber-700 shadow-sm'
                        : 'bg-slate-100 text-slate-800 hover:bg-slate-200 border-slate-300'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Bookings Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-300 text-slate-800 font-black uppercase text-[10px] tracking-wider bg-slate-50">
                    <th className="py-3 px-3">Booking ID</th>
                    <th className="py-3 px-3">Trip Title</th>
                    <th className="py-3 px-3">Dates</th>
                    <th className="py-3 px-3">Vehicle Assigned</th>
                    <th className="py-3 px-3 text-center">Guests</th>
                    <th className="py-3 px-3 text-right">Cost (INR)</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {plannedTrips
                    .filter(t => {
                      const matchesQuery = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.vehicleName.toLowerCase().includes(searchQuery.toLowerCase());
                      const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
                      return matchesQuery && matchesStatus;
                    })
                    .map((trip) => (
                      <tr key={trip.id} className="hover:bg-slate-50 transition">
                        <td className="py-4 px-3 font-mono font-black text-amber-950 text-xs">
                          #{trip.id}
                        </td>
                        <td className="py-4 px-3 font-black text-black">
                          {trip.title}
                        </td>
                        <td className="py-4 px-3 text-slate-800 text-xs font-bold">
                          {trip.dates}
                        </td>
                        <td className="py-4 px-3 text-slate-800 text-xs font-extrabold">
                          {trip.vehicleName}
                        </td>
                        <td className="py-4 px-3 text-center font-black text-indigo-950">
                          {trip.guestsCount}
                        </td>
                        <td className="py-4 px-3 text-right font-black text-amber-950">
                          ₹{trip.totalCost.toLocaleString()}
                        </td>
                        <td className="py-4 px-3 text-center">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
                            trip.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-950 border-emerald-300' :
                            trip.status === 'Processing' ? 'bg-amber-100 text-amber-950 border-amber-300' :
                            trip.status === 'Completed' ? 'bg-indigo-100 text-indigo-950 border-indigo-300' :
                            'bg-rose-100 text-rose-950 border-rose-300'
                          }`}>
                            {trip.status}
                          </span>
                        </td>
                        <td className="py-4 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {trip.status !== 'Confirmed' && (
                              <button
                                onClick={() => handleUpdateTripStatus(trip.id, 'Confirmed')}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] rounded transition cursor-pointer shadow-sm"
                              >
                                Confirm
                              </button>
                            )}
                            {trip.status !== 'Completed' && (
                              <button
                                onClick={() => handleUpdateTripStatus(trip.id, 'Completed')}
                                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] rounded transition cursor-pointer shadow-sm"
                              >
                                Complete
                              </button>
                            )}
                            {trip.status !== 'Cancelled' && (
                              <button
                                onClick={() => handleUpdateTripStatus(trip.id, 'Cancelled')}
                                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-black text-[10px] rounded transition cursor-pointer shadow-sm"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: FLEET & DISPATCH MANAGEMENT */}
        {activeTab === 'fleet' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-300 shadow-md space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-xl font-black text-black font-['Manrope']">
                  Fleet & Vehicle Control Center
                </h3>
                <p className="text-xs text-slate-700 font-bold">
                  Manage active bus vehicles, driver assignments, daily rates & maintenance flags.
                </p>
              </div>

              <button
                onClick={() => setIsNewVehicleOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-4 py-2 rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 transition cursor-pointer self-start sm:self-center shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Add Vehicle</span>
              </button>
            </div>

            {vehicleStatusNotice && (
              <div className="bg-emerald-100 border border-emerald-300 text-emerald-950 text-xs px-4 py-3 rounded-2xl flex items-center gap-2 animate-pulse font-black shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{vehicleStatusNotice}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((v) => (
                <div key={v.id} className="bg-white rounded-3xl border border-slate-300 overflow-hidden shadow-md flex flex-col justify-between group hover:border-indigo-500 transition duration-300">
                  <div className="space-y-3">
                    {/* Vehicle Image Banner */}
                    <div className="relative h-44 w-full bg-slate-200 overflow-hidden">
                      <img
                        src={v.image || 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&q=80&w=800'}
                        alt={v.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&q=80&w=800';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                      
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                        <span className="font-mono text-xs font-black text-black bg-white px-2.5 py-1 rounded-lg border border-slate-300 shadow-md">
                          {v.regNumber}
                        </span>
                        
                        <select
                          value={v.status}
                          onChange={(e) => handleUpdateVehicleStatus(v.id, e.target.value as Vehicle['status'])}
                          className={`text-[10px] font-black uppercase rounded-lg px-2.5 py-1 bg-white border cursor-pointer shadow-md ${
                            v.status === 'AVAILABLE' ? 'text-emerald-950 border-emerald-400' :
                            v.status === 'ON TRIP' ? 'text-indigo-950 border-indigo-400' :
                            v.status === 'MAINTENANCE' ? 'text-rose-950 border-rose-400' :
                            'text-slate-800 border-slate-400'
                          }`}
                        >
                          <option value="AVAILABLE">AVAILABLE</option>
                          <option value="ON TRIP">ON TRIP</option>
                          <option value="MAINTENANCE">MAINTENANCE</option>
                          <option value="IDLE">IDLE</option>
                        </select>
                      </div>

                      <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px]">
                        <span className="bg-indigo-600 text-white font-black px-2 py-0.5 rounded-md shadow-sm">
                          {v.category}
                        </span>
                        <span className="bg-amber-100 text-amber-950 border border-amber-300 font-black px-2 py-0.5 rounded-md shadow-sm">
                          {v.capacity}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <h4 className="text-lg font-black text-black font-['Manrope']">{v.name}</h4>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-800 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
                        <div>
                          <span className="text-[10px] text-slate-500 block font-black uppercase">Driver</span>
                          <span className="text-emerald-950 font-black">{v.currentDriver || 'Unassigned'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block font-black uppercase">Base Location</span>
                          <span className="text-black font-bold">{v.location || 'Coimbatore Depot'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0 border-t border-slate-200 mt-2 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-slate-500 block font-black uppercase">Daily Rate</span>
                      <span className="text-sm font-black text-amber-950">₹{v.pricePerDay.toLocaleString()} / day</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenVehicleEditor(v)}
                        className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl transition cursor-pointer flex items-center gap-1 shadow-sm"
                        title="Edit registration number, driver, base location, category, daily rate & photo"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleDeleteVehicle(v.id)}
                        className="p-1.5 bg-rose-100 hover:bg-rose-200 text-rose-950 rounded-xl border border-rose-300 transition cursor-pointer"
                        title="Delete vehicle from fleet"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-700" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: TOUR PACKAGES MANAGER */}
        {activeTab === 'packages' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-300 shadow-md space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-black font-['Manrope']">
                    Tour Packages & Catalog Manager
                  </h3>
                  <span className="bg-amber-100 text-amber-950 border border-amber-300 text-[10px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span>Admin Control Only</span>
                  </span>
                </div>
                <p className="text-xs text-slate-700 font-bold mt-0.5">
                  Set prices per person, adjust destination distance (Kilometers), base rates, or publish new itineraries.
                </p>
              </div>

              <button
                onClick={() => setIsNewPackageOpen(true)}
                className="bg-rose-600 hover:bg-rose-700 text-white font-black px-4 py-2 rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 transition cursor-pointer self-start sm:self-center shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Package</span>
              </button>
            </div>

            {/* ADMIN PRICING CONTROL SUMMARY PANEL */}
            <div className="bg-slate-50 border border-slate-300 rounded-2xl p-4 space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                <div className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-indigo-700" />
                  <h4 className="text-sm font-black text-black font-['Manrope']">
                    Package Tariff & Distance Rate Controls
                  </h4>
                </div>
                <span className="text-[11px] text-slate-700 font-bold">
                  Total Active Packages: <strong className="text-amber-950 font-mono font-black">{packages.length}</strong>
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-800 font-black uppercase text-[10px] border-b border-slate-300 bg-white">
                      <th className="py-2 px-2">Package Name</th>
                      <th className="py-2 px-2">Destination</th>
                      <th className="py-2 px-2 text-center">Distance (KM)</th>
                      <th className="py-2 px-2 text-center">Rate / KM</th>
                      <th className="py-2 px-2 text-right">Amount / Person</th>
                      <th className="py-2 px-2 text-right">Admin Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {packages.map((pkg) => (
                      <tr key={pkg.id} className="hover:bg-slate-100 transition">
                        <td className="py-2.5 px-2 font-black text-black">
                          {pkg.title} <span className="text-rose-700 font-bold">{pkg.subtitle}</span>
                        </td>
                        <td className="py-2.5 px-2 text-slate-800 text-[11px] font-bold">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-rose-600 shrink-0" />
                            <span>{pkg.location}</span>
                          </span>
                        </td>
                        <td className="py-2.5 px-2 text-center font-mono font-black text-indigo-950">
                          {pkg.estimatedKilometers ? `${pkg.estimatedKilometers} KM` : '500 KM'}
                        </td>
                        <td className="py-2.5 px-2 text-center font-mono text-emerald-950 font-black">
                          ₹{pkg.baseRatePerKm || 15}/km
                        </td>
                        <td className="py-2.5 px-2 text-right font-black text-amber-950 font-mono text-sm">
                          ₹{pkg.pricePerPerson.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-2 text-right space-x-1.5">
                          <button
                            onClick={() => handleOpenPriceEditor(pkg)}
                            className="bg-amber-100 hover:bg-amber-200 text-amber-950 text-[11px] font-black px-2.5 py-1 rounded-lg border border-amber-300 transition cursor-pointer inline-flex items-center gap-1 shadow-sm"
                            title="Edit Rate and KM"
                          >
                            <Sliders className="w-3 h-3" />
                            <span>Rate & KM</span>
                          </button>
                          <button
                            onClick={() => handleOpenCoverEditor(pkg)}
                            className="bg-rose-100 hover:bg-rose-200 text-rose-950 text-[11px] font-black px-2.5 py-1 rounded-lg border border-rose-300 transition cursor-pointer inline-flex items-center gap-1 shadow-sm"
                            title="Edit Package Cover Photo"
                          >
                            <Camera className="w-3 h-3" />
                            <span>Edit Cover</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* CATALOG CARDS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <div key={pkg.id} className="p-5 bg-white rounded-3xl border border-slate-300 space-y-4 shadow-md flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="relative h-44 rounded-2xl overflow-hidden bg-slate-200 group">
                      <img src={pkg.image} alt={pkg.title} className="w-full h-full object-cover transition duration-300 group-hover:scale-105" />
                      <div className="absolute top-2 right-2 bg-white text-black px-3 py-1 rounded-full text-xs font-black border border-slate-300 shadow-md">
                        ₹{pkg.pricePerPerson.toLocaleString()} / person
                      </div>
                      <div className="absolute bottom-2 left-2 bg-white text-indigo-950 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-black border border-slate-300 flex items-center gap-1 shadow-md">
                        <Route className="w-3 h-3 text-indigo-600" />
                        <span>{pkg.estimatedKilometers || 500} KM</span>
                      </div>
                      {/* ADMIN QUICK COVER PHOTO BUTTON */}
                      <button
                        onClick={() => handleOpenCoverEditor(pkg)}
                        className="absolute bottom-2 right-2 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-black px-2.5 py-1 rounded-lg border border-rose-700 shadow-md transition cursor-pointer flex items-center gap-1 opacity-90 group-hover:opacity-100"
                        title="Edit Cover Photo (Admin Only)"
                      >
                        <Camera className="w-3 h-3" />
                        <span>Edit Cover</span>
                      </button>
                    </div>

                    <div>
                      <h4 className="text-base font-black text-black font-['Manrope']">
                        {pkg.title} <span className="text-rose-700">{pkg.subtitle}</span>
                      </h4>
                      <p className="text-xs text-slate-700 mt-1 font-bold line-clamp-2">
                        {pkg.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {pkg.highlights.map((h, i) => (
                        <span key={i} className="text-[9px] bg-indigo-100 text-indigo-950 px-2 py-0.5 rounded border border-indigo-300 font-black">
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-800 font-bold flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-rose-600" />
                        <span>{pkg.location}</span>
                      </span>
                      <span className="font-black text-indigo-950">{pkg.duration}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleOpenPriceEditor(pkg)}
                        className="bg-amber-100 hover:bg-amber-600 hover:text-white text-amber-950 font-black py-2 rounded-xl text-[11px] uppercase tracking-wider transition cursor-pointer border border-amber-300 flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        <span>Rate & KM</span>
                      </button>
                      <button
                        onClick={() => handleOpenCoverEditor(pkg)}
                        className="bg-rose-100 hover:bg-rose-600 hover:text-white text-rose-950 font-black py-2 rounded-xl text-[11px] uppercase tracking-wider transition cursor-pointer border border-rose-300 flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Change Cover</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: CUSTOMER REVIEWS & FEEDBACK MODERATION */}
        {activeTab === 'reviews' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-300 shadow-md space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <h3 className="text-xl font-black text-black font-['Manrope']">
                Customer Reviews & Feedback Moderation
              </h3>
              <p className="text-xs text-slate-700 font-bold">
                Review verified customer feedback from recent tours and charter trips.
              </p>
            </div>

            <div className="space-y-4">
              {feedbackList.map((fb) => (
                <div key={fb.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-black text-sm">{fb.author}</span>
                      <span className="text-[10px] text-slate-500 font-bold">{fb.timeAgo}</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-950 font-black px-2 py-0.5 rounded border border-emerald-300">
                        Verified Traveler
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(fb.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-900 italic font-bold">"{fb.comment}"</p>
                  <p className="text-[10px] text-indigo-950 font-black">Trip: {fb.tripName}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: SYSTEM AUDIT LOGS */}
        {activeTab === 'audit' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-300 shadow-md space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <h3 className="text-xl font-black text-black font-['Manrope']">
                System Audit Trail & Activity Logs
              </h3>
              <p className="text-xs text-slate-700 font-bold">
                Real-time record of executive actions, booking updates & fleet dispatches.
              </p>
            </div>

            <div className="space-y-3">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping"></span>
                    <div>
                      <h5 className="font-black text-xs text-black">{log.action}</h5>
                      <span className="text-[10px] text-slate-600 font-bold">{log.time}</span>
                    </div>
                  </div>

                  <span className="text-[10px] font-black bg-amber-100 text-amber-950 px-2.5 py-1 rounded-full border border-amber-300">
                    {log.category}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: EDITABLE ADMIN PROFILE */}
        {activeTab === 'profile' && (
          <AdminProfileSection
            profile={currentAdminProfile}
            onUpdateProfile={handleSaveAdminProfile}
            onNavigateTab={(tab) => setActiveTab(tab as any)}
            onLockSession={onLockSession}
          />
        )}
      </main>

      {/* MODAL 1: CREATE NEW RESERVATION */}
      {isNewBookingOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-white border border-slate-300 rounded-3xl p-6 relative space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-lg font-black text-black font-['Manrope'] flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-600" />
                <span>Create Manual Customer Reservation</span>
              </h3>
              <button onClick={() => { setIsNewBookingOpen(false); setBookingErrors({}); }} className="text-slate-500 hover:text-black cursor-pointer font-bold">✕</button>
            </div>

            {Object.keys(bookingErrors).length > 0 && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-800 font-bold">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-black text-rose-950">Please correct the following errors:</p>
                  <ul className="list-disc pl-4 mt-1 space-y-0.5 text-[11px]">
                    {Object.values(bookingErrors).map((msg, idx) => (
                      <li key={idx}>{msg}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <form onSubmit={handleCreateBooking} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-800 mb-1 font-black">Trip / Tour Name *</label>
                <input
                  type="text"
                  required
                  value={newBooking.title}
                  onChange={(e) => {
                    setNewBooking({ ...newBooking, title: e.target.value });
                    if (bookingErrors.title) {
                      setBookingErrors(prev => { const n = { ...prev }; delete n.title; return n; });
                    }
                  }}
                  placeholder="e.g. Corporate Ooty Retreat"
                  className={`w-full bg-slate-50 border rounded-xl px-3 py-2 text-black font-bold focus:outline-none focus:bg-white ${
                    bookingErrors.title ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300 focus:border-amber-600'
                  }`}
                />
                {bookingErrors.title && (
                  <p className="text-[11px] text-rose-600 font-bold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{bookingErrors.title}</span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-800 mb-1 font-black">Travel Dates *</label>
                  <input
                    type="text"
                    required
                    value={newBooking.dates}
                    onChange={(e) => {
                      setNewBooking({ ...newBooking, dates: e.target.value });
                      if (bookingErrors.dates) {
                        setBookingErrors(prev => { const n = { ...prev }; delete n.dates; return n; });
                      }
                    }}
                    placeholder="e.g. Aug 15 - Aug 18"
                    className={`w-full bg-slate-50 border rounded-xl px-3 py-2 text-black font-bold focus:outline-none focus:bg-white ${
                      bookingErrors.dates ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300 focus:border-amber-600'
                    }`}
                  />
                  {bookingErrors.dates && (
                    <p className="text-[11px] text-rose-600 font-bold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{bookingErrors.dates}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-slate-800 mb-1 font-black">Guests Count *</label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={newBooking.guestsCount}
                    onChange={(e) => {
                      setNewBooking({ ...newBooking, guestsCount: Number(e.target.value) });
                      if (bookingErrors.guestsCount) {
                        setBookingErrors(prev => { const n = { ...prev }; delete n.guestsCount; return n; });
                      }
                    }}
                    className={`w-full bg-slate-50 border rounded-xl px-3 py-2 text-black font-bold focus:outline-none focus:bg-white ${
                      bookingErrors.guestsCount ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300 focus:border-amber-600'
                    }`}
                  />
                  {bookingErrors.guestsCount && (
                    <p className="text-[11px] text-rose-600 font-bold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{bookingErrors.guestsCount}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-800 mb-1 font-black">Preferred Bus / Vehicle *</label>
                  <select
                    value={newBooking.vehicleName}
                    onChange={(e) => {
                      setNewBooking({ ...newBooking, vehicleName: e.target.value });
                      if (bookingErrors.vehicleName) {
                        setBookingErrors(prev => { const n = { ...prev }; delete n.vehicleName; return n; });
                      }
                    }}
                    className={`w-full bg-slate-50 border rounded-xl px-3 py-2 text-black font-bold focus:outline-none focus:bg-white ${
                      bookingErrors.vehicleName ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300 focus:border-amber-600'
                    }`}
                  >
                    {vehicles.map(v => (
                      <option key={v.id} value={`${v.name} (${v.capacity})`}>{v.name} ({v.capacity})</option>
                    ))}
                  </select>
                  {bookingErrors.vehicleName && (
                    <p className="text-[11px] text-rose-600 font-bold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{bookingErrors.vehicleName}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-slate-800 mb-1 font-black">Total Cost (INR ₹) *</label>
                  <input
                    type="number"
                    required
                    min={500}
                    value={newBooking.totalCost}
                    onChange={(e) => {
                      setNewBooking({ ...newBooking, totalCost: Number(e.target.value) });
                      if (bookingErrors.totalCost) {
                        setBookingErrors(prev => { const n = { ...prev }; delete n.totalCost; return n; });
                      }
                    }}
                    className={`w-full bg-slate-50 border rounded-xl px-3 py-2 text-black font-mono font-bold focus:outline-none focus:bg-white ${
                      bookingErrors.totalCost ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300 focus:border-amber-600'
                    }`}
                  />
                  {bookingErrors.totalCost && (
                    <p className="text-[11px] text-rose-600 font-bold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{bookingErrors.totalCost}</span>
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-slate-800 mb-1 font-black">Itinerary Summary</label>
                <textarea
                  rows={2}
                  value={newBooking.itinerarySummary}
                  onChange={(e) => setNewBooking({ ...newBooking, itinerarySummary: e.target.value })}
                  placeholder="Brief itinerary notes..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-black font-bold focus:outline-none focus:border-amber-600 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-black py-3 rounded-xl uppercase tracking-wider transition cursor-pointer shadow-md mt-2"
              >
                Confirm & Add Reservation
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD VEHICLE */}
      {isNewVehicleOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-lg bg-white border border-slate-300 rounded-3xl p-6 relative space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-lg font-black text-black font-['Manrope'] flex items-center gap-2">
                <Bus className="w-5 h-5 text-indigo-600" />
                <span>Register New Fleet Vehicle</span>
              </h3>
              <button onClick={() => { setIsNewVehicleOpen(false); setNewVehicleErrors({}); }} className="text-slate-500 hover:text-black cursor-pointer font-bold">✕</button>
            </div>

            {Object.keys(newVehicleErrors).length > 0 && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-800 font-bold">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-black text-rose-950">Please correct the vehicle form errors:</p>
                  <ul className="list-disc pl-4 mt-1 space-y-0.5 text-[11px]">
                    {Object.values(newVehicleErrors).map((msg, idx) => (
                      <li key={idx}>{msg}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <form onSubmit={handleCreateVehicle} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-800 mb-1 font-black">Registration Number *</label>
                  <input
                    type="text"
                    required
                    value={newVehicle.regNumber}
                    onChange={(e) => {
                      setNewVehicle({ ...newVehicle, regNumber: e.target.value });
                      if (newVehicleErrors.regNumber) {
                        setNewVehicleErrors(prev => { const n = { ...prev }; delete n.regNumber; return n; });
                      }
                    }}
                    placeholder="e.g. TN 38 AB 9988"
                    className={`w-full bg-slate-50 border rounded-xl px-3 py-2 text-black focus:outline-none font-mono font-bold ${
                      newVehicleErrors.regNumber ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300 focus:border-indigo-600'
                    }`}
                  />
                  {newVehicleErrors.regNumber && (
                    <p className="text-[11px] text-rose-600 font-bold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{newVehicleErrors.regNumber}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-slate-800 mb-1 font-black">Vehicle Name *</label>
                  <input
                    type="text"
                    required
                    value={newVehicle.name}
                    onChange={(e) => {
                      setNewVehicle({ ...newVehicle, name: e.target.value });
                      if (newVehicleErrors.name) {
                        setNewVehicleErrors(prev => { const n = { ...prev }; delete n.name; return n; });
                      }
                    }}
                    placeholder="e.g. Executive Volvo B11R"
                    className={`w-full bg-slate-50 border rounded-xl px-3 py-2 text-black focus:outline-none font-bold ${
                      newVehicleErrors.name ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300 focus:border-indigo-600'
                    }`}
                  />
                  {newVehicleErrors.name && (
                    <p className="text-[11px] text-rose-600 font-bold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{newVehicleErrors.name}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* ANY VEHICLE TYPE / CATEGORY SELECTION & CUSTOM INPUT */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
                <label className="block text-black font-black text-xs">Vehicle Type / Category *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-600 block mb-0.5 font-bold">Quick Select Presets:</span>
                    <select
                      value={newVehicle.category}
                      onChange={(e) => {
                        setNewVehicle({ ...newVehicle, category: e.target.value });
                        if (newVehicleErrors.category) {
                          setNewVehicleErrors(prev => { const n = { ...prev }; delete n.category; return n; });
                        }
                      }}
                      className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-black font-bold text-xs focus:outline-none focus:border-indigo-600"
                    >
                      <option value="Force Traveler">Force Traveler</option>
                      <option value="Volvo Multi-Axle">Volvo Multi-Axle</option>
                      <option value="Toyota Innova">Toyota Innova</option>
                      <option value="Scania Luxury">Scania Luxury</option>
                      <option value="Mercedes Sprinter">Mercedes Sprinter</option>
                      <option value="Mini Bus (21 Seater)">Mini Bus (21 Seater)</option>
                      <option value="AC Sleeper Coach">AC Sleeper Coach</option>
                      <option value="Luxury Urbania">Luxury Urbania</option>
                      <option value="Electric Bus">Electric Bus</option>
                    </select>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-600 block mb-0.5 font-bold">Or Type ANY Vehicle Category:</span>
                    <input
                      type="text"
                      required
                      value={newVehicle.category}
                      onChange={(e) => {
                        setNewVehicle({ ...newVehicle, category: e.target.value });
                        if (newVehicleErrors.category) {
                          setNewVehicleErrors(prev => { const n = { ...prev }; delete n.category; return n; });
                        }
                      }}
                      placeholder="e.g. 17 Seater AC Coach, Luxe Caravan..."
                      className={`w-full bg-white border rounded-xl px-2.5 py-1.5 text-black font-bold text-xs focus:outline-none ${
                        newVehicleErrors.category ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300 focus:border-indigo-600'
                      }`}
                    />
                  </div>
                </div>
                {newVehicleErrors.category && (
                  <p className="text-[11px] text-rose-600 font-bold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{newVehicleErrors.category}</span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-800 mb-1 font-black">Seating Capacity *</label>
                  <input
                    type="text"
                    required
                    value={newVehicle.capacity}
                    onChange={(e) => {
                      setNewVehicle({ ...newVehicle, capacity: e.target.value });
                      if (newVehicleErrors.capacity) {
                        setNewVehicleErrors(prev => { const n = { ...prev }; delete n.capacity; return n; });
                      }
                    }}
                    placeholder="e.g. 12+1 Seats, 45 Seats"
                    className={`w-full bg-slate-50 border rounded-xl px-3 py-2 text-black font-bold focus:outline-none ${
                      newVehicleErrors.capacity ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300 focus:border-indigo-600'
                    }`}
                  />
                  {newVehicleErrors.capacity && (
                    <p className="text-[11px] text-rose-600 font-bold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{newVehicleErrors.capacity}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-slate-800 mb-1 font-black">Daily Price Rate (INR ₹) *</label>
                  <input
                    type="number"
                    min={500}
                    required
                    value={newVehicle.pricePerDay}
                    onChange={(e) => {
                      setNewVehicle({ ...newVehicle, pricePerDay: Number(e.target.value) });
                      if (newVehicleErrors.pricePerDay) {
                        setNewVehicleErrors(prev => { const n = { ...prev }; delete n.pricePerDay; return n; });
                      }
                    }}
                    className={`w-full bg-slate-50 border rounded-xl px-3 py-2 text-amber-950 font-mono font-bold focus:outline-none ${
                      newVehicleErrors.pricePerDay ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300 focus:border-indigo-600'
                    }`}
                  />
                  {newVehicleErrors.pricePerDay && (
                    <p className="text-[11px] text-rose-600 font-bold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{newVehicleErrors.pricePerDay}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-800 mb-1 font-black">Assigned Driver</label>
                  <input
                    type="text"
                    value={newVehicle.currentDriver}
                    onChange={(e) => setNewVehicle({ ...newVehicle, currentDriver: e.target.value })}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-black font-bold focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-800 mb-1 font-black">Driver Base Location *</label>
                  <input
                    type="text"
                    value={newVehicle.location}
                    onChange={(e) => {
                      setNewVehicle({ ...newVehicle, location: e.target.value });
                      if (newVehicleErrors.location) {
                        setNewVehicleErrors(prev => { const n = { ...prev }; delete n.location; return n; });
                      }
                    }}
                    placeholder="e.g. Coimbatore Hub, Chennai Depot"
                    className={`w-full bg-slate-50 border rounded-xl px-3 py-2 text-black font-bold focus:outline-none ${
                      newVehicleErrors.location ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300 focus:border-indigo-600'
                    }`}
                  />
                  {newVehicleErrors.location && (
                    <p className="text-[11px] text-rose-600 font-bold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{newVehicleErrors.location}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* VEHICLE PHOTO / UPLOAD SECTION */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="block text-black font-black flex items-center gap-1.5 text-xs">
                    <ImageIcon className="w-4 h-4 text-indigo-600" />
                    <span>Vehicle Image / Photo *</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => newVehicleFileInputRef.current?.click()}
                    className="text-[10px] bg-indigo-600 hover:bg-indigo-700 text-white font-black px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 shadow-sm"
                    title="Upload custom vehicle photo from computer or laptop"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Upload from Laptop / PC</span>
                  </button>
                  <input
                    type="file"
                    ref={newVehicleFileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handleNewVehicleLocalFileUpload}
                  />
                </div>

                <div className="relative h-28 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 group shadow-inner">
                  <img
                    src={newVehicle.image}
                    alt="Vehicle Preview"
                    className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&q=80&w=800';
                    }}
                  />
                </div>

                <input
                  type="text"
                  value={newVehicle.image}
                  onChange={(e) => {
                    setNewVehicle({ ...newVehicle, image: e.target.value });
                    if (newVehicleErrors.image) {
                      setNewVehicleErrors(prev => { const n = { ...prev }; delete n.image; return n; });
                    }
                  }}
                  placeholder="Vehicle image URL or base64"
                  className={`w-full bg-white border rounded-xl px-2.5 py-1.5 text-black font-bold text-[10px] font-mono focus:outline-none ${
                    newVehicleErrors.image ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300 focus:border-indigo-600'
                  }`}
                />
                {newVehicleErrors.image && (
                  <p className="text-[11px] text-rose-600 font-bold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{newVehicleErrors.image}</span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 rounded-xl uppercase tracking-wider transition cursor-pointer shadow-md mt-2"
              >
                Add Vehicle To Fleet
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2B: EDIT FLEET VEHICLE (ADMIN FULL CONTROL) */}
      {editingVehicle && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-lg bg-white border border-slate-300 rounded-3xl p-6 relative space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-lg font-black text-black font-['Manrope'] flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-600" />
                <span>Edit Vehicle #{editingVehicle.regNumber}</span>
              </h3>
              <button onClick={() => { setEditingVehicle(null); setEditVehicleErrors({}); }} className="text-slate-500 hover:text-black cursor-pointer font-bold">✕</button>
            </div>

            {Object.keys(editVehicleErrors).length > 0 && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-800 font-bold">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-black text-rose-950">Please correct the vehicle form errors:</p>
                  <ul className="list-disc pl-4 mt-1 space-y-0.5 text-[11px]">
                    {Object.values(editVehicleErrors).map((msg, idx) => (
                      <li key={idx}>{msg}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <form onSubmit={handleSaveVehicleEditor} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-800 mb-1 font-black">Registration Number *</label>
                  <input
                    type="text"
                    required
                    value={editVehicleForm.regNumber}
                    onChange={(e) => {
                      setEditVehicleForm({ ...editVehicleForm, regNumber: e.target.value });
                      if (editVehicleErrors.regNumber) {
                        setEditVehicleErrors(prev => { const n = { ...prev }; delete n.regNumber; return n; });
                      }
                    }}
                    className={`w-full bg-slate-50 border rounded-xl px-3 py-2 text-black font-bold font-mono focus:outline-none ${
                      editVehicleErrors.regNumber ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300 focus:border-indigo-600'
                    }`}
                  />
                  {editVehicleErrors.regNumber && (
                    <p className="text-[11px] text-rose-600 font-bold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{editVehicleErrors.regNumber}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-slate-800 mb-1 font-black">Vehicle Name *</label>
                  <input
                    type="text"
                    required
                    value={editVehicleForm.name}
                    onChange={(e) => {
                      setEditVehicleForm({ ...editVehicleForm, name: e.target.value });
                      if (editVehicleErrors.name) {
                        setEditVehicleErrors(prev => { const n = { ...prev }; delete n.name; return n; });
                      }
                    }}
                    className={`w-full bg-slate-50 border rounded-xl px-3 py-2 text-black font-bold focus:outline-none ${
                      editVehicleErrors.name ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300 focus:border-indigo-600'
                    }`}
                  />
                  {editVehicleErrors.name && (
                    <p className="text-[11px] text-rose-600 font-bold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{editVehicleErrors.name}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* ANY VEHICLE TYPE / CATEGORY SELECTION & CUSTOM INPUT FOR EDITING */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
                <label className="block text-black font-black text-xs">Vehicle Type / Category *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-600 block mb-0.5 font-bold">Quick Select Presets:</span>
                    <select
                      value={editVehicleForm.category}
                      onChange={(e) => {
                        setEditVehicleForm({ ...editVehicleForm, category: e.target.value });
                        if (editVehicleErrors.category) {
                          setEditVehicleErrors(prev => { const n = { ...prev }; delete n.category; return n; });
                        }
                      }}
                      className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-black font-bold text-xs focus:outline-none focus:border-indigo-600"
                    >
                      <option value="Force Traveler">Force Traveler</option>
                      <option value="Volvo Multi-Axle">Volvo Multi-Axle</option>
                      <option value="Toyota Innova">Toyota Innova</option>
                      <option value="Scania Luxury">Scania Luxury</option>
                      <option value="Mercedes Sprinter">Mercedes Sprinter</option>
                      <option value="Mini Bus (21 Seater)">Mini Bus (21 Seater)</option>
                      <option value="AC Sleeper Coach">AC Sleeper Coach</option>
                      <option value="Luxury Urbania">Luxury Urbania</option>
                      <option value="Electric Bus">Electric Bus</option>
                    </select>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-600 block mb-0.5 font-bold">Or Type ANY Custom Category:</span>
                    <input
                      type="text"
                      required
                      value={editVehicleForm.category}
                      onChange={(e) => {
                        setEditVehicleForm({ ...editVehicleForm, category: e.target.value });
                        if (editVehicleErrors.category) {
                          setEditVehicleErrors(prev => { const n = { ...prev }; delete n.category; return n; });
                        }
                      }}
                      placeholder="e.g. 17 Seater AC Coach, Luxe Caravan..."
                      className={`w-full bg-white border rounded-xl px-2.5 py-1.5 text-black font-bold text-xs focus:outline-none ${
                        editVehicleErrors.category ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300 focus:border-indigo-600'
                      }`}
                    />
                  </div>
                </div>
                {editVehicleErrors.category && (
                  <p className="text-[11px] text-rose-600 font-bold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{editVehicleErrors.category}</span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-800 mb-1 font-black">Seating Capacity *</label>
                  <input
                    type="text"
                    required
                    value={editVehicleForm.capacity}
                    onChange={(e) => {
                      setEditVehicleForm({ ...editVehicleForm, capacity: e.target.value });
                      if (editVehicleErrors.capacity) {
                        setEditVehicleErrors(prev => { const n = { ...prev }; delete n.capacity; return n; });
                      }
                    }}
                    className={`w-full bg-slate-50 border rounded-xl px-3 py-2 text-black font-bold focus:outline-none ${
                      editVehicleErrors.capacity ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300 focus:border-indigo-600'
                    }`}
                  />
                  {editVehicleErrors.capacity && (
                    <p className="text-[11px] text-rose-600 font-bold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{editVehicleErrors.capacity}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-slate-800 mb-1 font-black">Daily Price Rate (INR ₹) *</label>
                  <input
                    type="number"
                    min={500}
                    required
                    value={editVehicleForm.pricePerDay}
                    onChange={(e) => {
                      setEditVehicleForm({ ...editVehicleForm, pricePerDay: Number(e.target.value) });
                      if (editVehicleErrors.pricePerDay) {
                        setEditVehicleErrors(prev => { const n = { ...prev }; delete n.pricePerDay; return n; });
                      }
                    }}
                    className={`w-full bg-slate-50 border rounded-xl px-3 py-2 text-amber-950 font-mono font-bold focus:outline-none ${
                      editVehicleErrors.pricePerDay ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300 focus:border-indigo-600'
                    }`}
                  />
                  {editVehicleErrors.pricePerDay && (
                    <p className="text-[11px] text-rose-600 font-bold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{editVehicleErrors.pricePerDay}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-800 mb-1 font-black">Assigned Driver Name</label>
                  <input
                    type="text"
                    value={editVehicleForm.currentDriver}
                    onChange={(e) => setEditVehicleForm({ ...editVehicleForm, currentDriver: e.target.value })}
                    placeholder="e.g. Rajesh Kannan"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-black font-bold focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-800 mb-1 font-black">Driver Base Location *</label>
                  <input
                    type="text"
                    value={editVehicleForm.location}
                    onChange={(e) => {
                      setEditVehicleForm({ ...editVehicleForm, location: e.target.value });
                      if (editVehicleErrors.location) {
                        setEditVehicleErrors(prev => { const n = { ...prev }; delete n.location; return n; });
                      }
                    }}
                    placeholder="e.g. Coimbatore Hub"
                    className={`w-full bg-slate-50 border rounded-xl px-3 py-2 text-black font-bold focus:outline-none ${
                      editVehicleErrors.location ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300 focus:border-indigo-600'
                    }`}
                  />
                  {editVehicleErrors.location && (
                    <p className="text-[11px] text-rose-600 font-bold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{editVehicleErrors.location}</span>
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-slate-800 mb-1 font-black">Vehicle Operational Status</label>
                <select
                  value={editVehicleForm.status}
                  onChange={(e) => setEditVehicleForm({ ...editVehicleForm, status: e.target.value as Vehicle['status'] })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-black font-bold focus:outline-none focus:border-indigo-600"
                >
                  <option value="AVAILABLE">AVAILABLE (Ready for Dispatch)</option>
                  <option value="ON TRIP">ON TRIP (En Route)</option>
                  <option value="MAINTENANCE">MAINTENANCE (Workshop Service)</option>
                  <option value="IDLE">IDLE (Parked at Depot)</option>
                </select>
              </div>

              {/* EDIT VEHICLE PHOTO / LAPTOP UPLOAD */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="block text-black font-black flex items-center gap-1.5 text-xs">
                    <ImageIcon className="w-4 h-4 text-indigo-600" />
                    <span>Vehicle Photo / Image *</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => editVehicleFileInputRef.current?.click()}
                    className="text-[10px] bg-indigo-600 hover:bg-indigo-700 text-white font-black px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 shadow-sm"
                    title="Upload photo from laptop or PC"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Upload from Laptop / PC</span>
                  </button>
                  <input
                    type="file"
                    ref={editVehicleFileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handleEditVehicleLocalFileUpload}
                  />
                </div>

                <div className="relative h-28 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 group shadow-inner">
                  <img
                    src={editVehicleForm.image}
                    alt="Vehicle Edit Preview"
                    className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&q=80&w=800';
                    }}
                  />
                </div>

                {vehicleImageNotice && (
                  <p className="text-[10px] font-mono text-emerald-950 bg-emerald-100 border border-emerald-300 px-2 py-1 rounded-lg font-black">
                    {vehicleImageNotice}
                  </p>
                )}

                <input
                  type="text"
                  value={editVehicleForm.image}
                  onChange={(e) => {
                    setEditVehicleForm({ ...editVehicleForm, image: e.target.value });
                    if (editVehicleErrors.image) {
                      setEditVehicleErrors(prev => { const n = { ...prev }; delete n.image; return n; });
                    }
                  }}
                  placeholder="Image URL or base64 data"
                  className={`w-full bg-white border rounded-xl px-2.5 py-1.5 text-black font-bold text-[10px] font-mono focus:outline-none ${
                    editVehicleErrors.image ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300 focus:border-indigo-600'
                  }`}
                />
                {editVehicleErrors.image && (
                  <p className="text-[11px] text-rose-600 font-bold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{editVehicleErrors.image}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 rounded-xl uppercase tracking-wider transition cursor-pointer shadow-md"
                >
                  Save Vehicle Details
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (editingVehicle) {
                      handleDeleteVehicle(editingVehicle);
                    }
                  }}
                  className="px-3.5 py-3 bg-rose-100 hover:bg-rose-200 text-rose-800 font-black rounded-xl transition cursor-pointer border border-rose-300 flex items-center gap-1.5"
                  title="Delete vehicle from fleet"
                >
                  <Trash2 className="w-4 h-4 text-rose-700" />
                  <span className="hidden sm:inline text-xs">Delete</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditingVehicle(null)}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black rounded-xl transition cursor-pointer border border-slate-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD TOUR PACKAGE */}
      {isNewPackageOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-white border border-slate-300 rounded-3xl p-6 relative space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-lg font-black text-black font-['Manrope'] flex items-center gap-2">
                <Package className="w-5 h-5 text-rose-600" />
                <span>Publish New Tour Package</span>
              </h3>
              <button onClick={() => { setIsNewPackageOpen(false); setNewPkgErrors({}); }} className="text-slate-500 hover:text-black cursor-pointer font-bold">✕</button>
            </div>

            {Object.keys(newPkgErrors).length > 0 && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-800 font-bold">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-black text-rose-950">Please correct the package form errors:</p>
                  <ul className="list-disc pl-4 mt-1 space-y-0.5 text-[11px]">
                    {Object.values(newPkgErrors).map((msg, idx) => (
                      <li key={idx}>{msg}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <form onSubmit={handleCreatePackage} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-800 mb-1 font-black">Package Title *</label>
                  <input
                    type="text"
                    required
                    value={newPkg.title}
                    onChange={(e) => {
                      setNewPkg({ ...newPkg, title: e.target.value });
                      if (newPkgErrors.title) {
                        setNewPkgErrors(prev => { const n = { ...prev }; delete n.title; return n; });
                      }
                    }}
                    placeholder="e.g. GREEN VALLEY:"
                    className={`w-full bg-slate-50 border rounded-xl px-3 py-2 text-black font-bold focus:outline-none ${
                      newPkgErrors.title ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300 focus:border-rose-600'
                    }`}
                  />
                  {newPkgErrors.title && (
                    <p className="text-[11px] text-rose-600 font-bold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{newPkgErrors.title}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-slate-800 mb-1 font-black">Subtitle *</label>
                  <input
                    type="text"
                    required
                    value={newPkg.subtitle}
                    onChange={(e) => {
                      setNewPkg({ ...newPkg, subtitle: e.target.value });
                      if (newPkgErrors.subtitle) {
                        setNewPkgErrors(prev => { const n = { ...prev }; delete n.subtitle; return n; });
                      }
                    }}
                    placeholder="e.g. WAYANAD"
                    className={`w-full bg-slate-50 border rounded-xl px-3 py-2 text-black font-bold focus:outline-none ${
                      newPkgErrors.subtitle ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300 focus:border-rose-600'
                    }`}
                  />
                  {newPkgErrors.subtitle && (
                    <p className="text-[11px] text-rose-600 font-bold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{newPkgErrors.subtitle}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-800 mb-1 font-black flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-600" />
                    <span>Location / Place *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newPkg.location}
                    onChange={(e) => {
                      setNewPkg({ ...newPkg, location: e.target.value });
                      if (newPkgErrors.location) {
                        setNewPkgErrors(prev => { const n = { ...prev }; delete n.location; return n; });
                      }
                    }}
                    onBlur={(e) => {
                      if (e.target.value.trim() && (!newPkg.image || newPkg.image.includes('1589182373726'))) {
                        handleFetchRealTimeCoverPhoto(e.target.value);
                      }
                    }}
                    placeholder="e.g. Wayanad, Kerala"
                    className={`w-full bg-slate-50 border rounded-xl px-3 py-2 text-black font-bold focus:outline-none ${
                      newPkgErrors.location ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300 focus:border-rose-600'
                    }`}
                  />
                  {newPkgErrors.location ? (
                    <p className="text-[11px] text-rose-600 font-bold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{newPkgErrors.location}</span>
                    </p>
                  ) : (
                    <span className="text-[10px] text-slate-500 font-bold mt-0.5 block">Auto-fetches picture on blur</span>
                  )}
                </div>

                <div>
                  <label className="block text-slate-800 mb-1 font-black">Price / Person (₹) *</label>
                  <input
                    type="number"
                    required
                    min={100}
                    value={newPkg.pricePerPerson}
                    onChange={(e) => {
                      setNewPkg({ ...newPkg, pricePerPerson: Number(e.target.value) });
                      if (newPkgErrors.pricePerPerson) {
                        setNewPkgErrors(prev => { const n = { ...prev }; delete n.pricePerPerson; return n; });
                      }
                    }}
                    className={`w-full bg-slate-50 border rounded-xl px-3 py-2 text-black font-mono font-bold focus:outline-none ${
                      newPkgErrors.pricePerPerson ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300 focus:border-rose-600'
                    }`}
                  />
                  {newPkgErrors.pricePerPerson && (
                    <p className="text-[11px] text-rose-600 font-bold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{newPkgErrors.pricePerPerson}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* REAL-TIME DESTINATION COVER PHOTO SECTION */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-2.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="block text-black font-black flex items-center gap-1.5 text-xs">
                    <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" />
                    <span>Package Front Cover Photo *</span>
                  </label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAdminGeneratorPkg({
                          id: 'new',
                          title: newPkg.title || 'Tour Package',
                          subtitle: newPkg.subtitle || '',
                          location: newPkg.location || 'Ooty',
                          duration: newPkg.duration,
                          pricePerPerson: newPkg.pricePerPerson,
                          rating: 5,
                          image: newPkg.image,
                          highlights: [],
                          description: newPkg.description,
                          itinerary: [],
                          includedAmenities: []
                        });
                        setAiImageModalTarget('new_pkg');
                        setIsAiImageModalOpen(true);
                      }}
                      className="text-[10px] bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-slate-900 font-black px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 shadow-sm border border-amber-300"
                      title="Generate real-life place photo with gemini-3.1-flash-image (1K/2K/4K)"
                    >
                      <Sparkles className="w-3 h-3 text-slate-900" />
                      <span>Generate 1K/2K/4K AI Cover</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFetchRealTimeCoverPhoto()}
                      disabled={isFetchingCoverImage}
                      className="text-[10px] bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-black px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 shadow-sm"
                      title="Fetch real-time location picture from Google / Unsplash"
                    >
                      <Wand2 className={`w-3 h-3 ${isFetchingCoverImage ? 'animate-spin' : ''}`} />
                      <span>Auto-Fetch Photo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => newPkgFileInputRef.current?.click()}
                      className="text-[10px] bg-indigo-600 hover:bg-indigo-700 text-white font-black px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 shadow-sm"
                      title="Upload custom image file from computer or laptop"
                    >
                      <Upload className="w-3 h-3" />
                      <span>Upload Local Photo</span>
                    </button>
                    <input
                      type="file"
                      ref={newPkgFileInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={handleNewPkgLocalFileUpload}
                    />
                  </div>
                </div>

                <div className="relative h-36 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 group shadow-inner">
                  <img
                    src={newPkg.image}
                    alt="Package Cover Preview"
                    className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&q=80&w=1000';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-black font-black bg-white px-2 py-0.5 rounded-md border border-slate-300 flex items-center gap-1 shadow-sm">
                        <Camera className="w-3 h-3 text-amber-600" />
                        <span>{newPkg.location || newPkg.subtitle || 'Desired Place Picture'}</span>
                      </span>
                      <span className="text-[10px] font-black text-white bg-rose-600 px-2 py-0.5 rounded-md shadow-sm">
                        ₹{newPkg.pricePerPerson.toLocaleString()}/person
                      </span>
                    </div>
                  </div>
                  {isFetchingCoverImage && (
                    <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center gap-2 text-rose-700 font-black text-xs">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Fetching Real-Time Place Picture...</span>
                    </div>
                  )}
                </div>

                {coverImageStatus && (
                  <p className="text-[10px] font-mono text-emerald-950 bg-emerald-100 border border-emerald-300 px-2 py-1 rounded-lg font-black">
                    {coverImageStatus}
                  </p>
                )}

                <div>
                  <input
                    type="text"
                    value={newPkg.image}
                    onChange={(e) => {
                      setNewPkg({ ...newPkg, image: e.target.value });
                      if (newPkgErrors.image) {
                        setNewPkgErrors(prev => { const n = { ...prev }; delete n.image; return n; });
                      }
                    }}
                    placeholder="Cover Image URL or base64 (Auto-fetched or pasted)"
                    className={`w-full bg-white border rounded-xl px-2.5 py-1.5 text-black font-bold text-[10px] font-mono focus:outline-none ${
                      newPkgErrors.image ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300 focus:border-rose-600'
                    }`}
                  />
                  {newPkgErrors.image && (
                    <p className="text-[11px] text-rose-600 font-bold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{newPkgErrors.image}</span>
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-slate-800 mb-1 font-black">Highlights (Comma Separated)</label>
                <input
                  type="text"
                  value={newPkg.highlightsStr}
                  onChange={(e) => setNewPkg({ ...newPkg, highlightsStr: e.target.value })}
                  placeholder="e.g. CAVE TOUR, WATERFALLS, TEA TREK"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-black font-bold focus:outline-none focus:border-rose-600"
                />
              </div>

              <div>
                <label className="block text-slate-800 mb-1 font-black">Description</label>
                <textarea
                  rows={2}
                  value={newPkg.description}
                  onChange={(e) => setNewPkg({ ...newPkg, description: e.target.value })}
                  placeholder="Overview of the tour experience..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-black font-bold focus:outline-none focus:border-rose-600"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-black py-3 rounded-xl uppercase tracking-wider transition cursor-pointer shadow-md mt-2"
              >
                Publish Package To Store
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: EDIT PACKAGE PRICE & KILOMETERS TARIFF */}
      {editingPricePkg && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-white border border-slate-300 rounded-3xl p-6 relative space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase bg-amber-100 text-amber-950 border border-amber-300 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Admin Tariff Override
                </span>
                <h3 className="text-lg font-black text-black font-['Manrope'] mt-1">
                  Edit Package Tariff: {editingPricePkg.title} {editingPricePkg.subtitle}
                </h3>
              </div>
              <button onClick={() => { setEditingPricePkg(null); setPriceErrors({}); }} className="text-slate-500 hover:text-black cursor-pointer text-lg font-bold">✕</button>
            </div>

            {Object.keys(priceErrors).length > 0 && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-800 font-bold">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-black text-rose-950">Please correct the tariff errors:</p>
                  <ul className="list-disc pl-4 mt-1 space-y-0.5 text-[11px]">
                    {Object.values(priceErrors).map((msg, idx) => (
                      <li key={idx}>{msg}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <form onSubmit={handleSavePriceEditor} className="space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1">
                <p className="text-[11px] text-slate-800 font-bold">
                  Admin control allowing instant modification of package location, estimated route distance in kilometers, base kilometer rate, and final price per person.
                </p>
              </div>

              <div>
                <label className="block text-slate-800 mb-1 font-black flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-600" />
                  <span>Destination / Location Name *</span>
                </label>
                <input
                  type="text"
                  required
                  value={priceForm.location}
                  onChange={(e) => {
                    setPriceForm({ ...priceForm, location: e.target.value });
                    if (priceErrors.location) {
                      setPriceErrors(prev => { const n = { ...prev }; delete n.location; return n; });
                    }
                  }}
                  placeholder="e.g. Ooty, Tamil Nadu"
                  className={`w-full bg-slate-50 border rounded-xl px-3 py-2 text-black font-bold focus:outline-none ${
                    priceErrors.location ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300 focus:border-amber-600'
                  }`}
                />
                {priceErrors.location && (
                  <p className="text-[11px] text-rose-600 font-bold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{priceErrors.location}</span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-800 mb-1 font-black flex items-center gap-1">
                    <Route className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Estimated Distance (KM) *</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={priceForm.estimatedKilometers}
                    onChange={(e) => {
                      setPriceForm({ ...priceForm, estimatedKilometers: Number(e.target.value) });
                      if (priceErrors.estimatedKilometers) {
                        setPriceErrors(prev => { const n = { ...prev }; delete n.estimatedKilometers; return n; });
                      }
                    }}
                    className={`w-full bg-slate-50 border rounded-xl px-3 py-2 text-black font-mono font-bold focus:outline-none ${
                      priceErrors.estimatedKilometers ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300 focus:border-amber-600'
                    }`}
                  />
                  {priceErrors.estimatedKilometers && (
                    <p className="text-[11px] text-rose-600 font-bold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{priceErrors.estimatedKilometers}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-slate-800 mb-1 font-black flex items-center gap-1">
                    <Gauge className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Base Rate / KM (₹) *</span>
                  </label>
                  <input
                    type="number"
                    required
                    step="0.5"
                    min={0.1}
                    value={priceForm.baseRatePerKm}
                    onChange={(e) => {
                      setPriceForm({ ...priceForm, baseRatePerKm: Number(e.target.value) });
                      if (priceErrors.baseRatePerKm) {
                        setPriceErrors(prev => { const n = { ...prev }; delete n.baseRatePerKm; return n; });
                      }
                    }}
                    className={`w-full bg-slate-50 border rounded-xl px-3 py-2 text-black font-mono font-bold focus:outline-none ${
                      priceErrors.baseRatePerKm ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300 focus:border-amber-600'
                    }`}
                  />
                  {priceErrors.baseRatePerKm && (
                    <p className="text-[11px] text-rose-600 font-bold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{priceErrors.baseRatePerKm}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-300 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-amber-950 font-black flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-amber-700" />
                    <span>Amount Per Person (₹) *</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAutoCalculatePrice}
                    className="text-[10px] bg-amber-600 hover:bg-amber-700 text-white font-black px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 shadow-sm"
                  >
                    <Calculator className="w-3 h-3" />
                    <span>Auto-Calc (KM × Rate)</span>
                  </button>
                </div>

                <input
                  type="number"
                  required
                  min={1}
                  value={priceForm.pricePerPerson}
                  onChange={(e) => {
                    setPriceForm({ ...priceForm, pricePerPerson: Number(e.target.value) });
                    if (priceErrors.pricePerPerson) {
                      setPriceErrors(prev => { const n = { ...prev }; delete n.pricePerPerson; return n; });
                    }
                  }}
                  className={`w-full bg-white border rounded-xl px-3 py-2.5 text-amber-950 font-mono font-black text-lg focus:outline-none ${
                    priceErrors.pricePerPerson ? 'border-rose-500 bg-rose-50/50' : 'border-amber-400 focus:border-amber-600'
                  }`}
                />
                {priceErrors.pricePerPerson && (
                  <p className="text-[11px] text-rose-600 font-bold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{priceErrors.pricePerPerson}</span>
                  </p>
                )}
                <p className="text-[10px] text-slate-800 font-bold">
                  Formula suggestion: {priceForm.estimatedKilometers} KM × ₹{priceForm.baseRatePerKm}/KM = ₹{(priceForm.estimatedKilometers * priceForm.baseRatePerKm).toLocaleString('en-IN')}. You may also override with a custom per-person price.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setEditingPricePkg(null); setPriceErrors({}); }}
                  className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black py-3 rounded-xl transition cursor-pointer border border-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-amber-600 hover:bg-amber-700 text-white font-black py-3 rounded-xl uppercase tracking-wider transition cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Tariff Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: EDIT PACKAGE COVER PHOTO (ADMIN CONTROL ONLY) */}
      {editingCoverPkg && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-white border border-slate-300 rounded-3xl p-6 relative space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase bg-rose-100 text-rose-950 border border-rose-300 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Admin Cover Photo Control
                </span>
                <h3 className="text-lg font-black text-black font-['Manrope'] mt-1">
                  Change Cover Photo: {editingCoverPkg.title} {editingCoverPkg.subtitle}
                </h3>
              </div>
              <button onClick={() => { setEditingCoverPkg(null); setCoverErrors({}); }} className="text-slate-500 hover:text-black cursor-pointer text-lg font-bold">✕</button>
            </div>

            {Object.keys(coverErrors).length > 0 && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-800 font-bold">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-black text-rose-950">Please correct the cover photo errors:</p>
                  <ul className="list-disc pl-4 mt-1 space-y-0.5 text-[11px]">
                    {Object.values(coverErrors).map((msg, idx) => (
                      <li key={idx}>{msg}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <form onSubmit={handleSaveCoverPhoto} className="space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1">
                <p className="text-[11px] text-slate-800 font-bold">
                  Admin authorization allows instant real-time replacement of the front cover photo displayed across customer apps and public catalog pages at any time.
                </p>
              </div>

              {/* COVER PHOTO PREVIEW */}
              <div className="space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="block text-black font-black flex items-center gap-1.5 text-xs">
                    <Camera className="w-4 h-4 text-rose-600" />
                    <span>Live Cover Photo Preview</span>
                  </label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAdminGeneratorPkg(editingCoverPkg);
                        setAiImageModalTarget('edit_cover');
                        setIsAiImageModalOpen(true);
                      }}
                      className="text-[10px] bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-slate-900 font-black px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 shadow-sm border border-amber-300"
                      title="Generate real-life cover photo with gemini-3.1-flash-image (1K/2K/4K)"
                    >
                      <Sparkles className="w-3 h-3 text-slate-900" />
                      <span>Generate 1K/2K/4K AI Cover</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFetchCoverPhotoForModal()}
                      disabled={isFetchingCoverImageModal}
                      className="text-[10px] bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-black px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 shadow-sm"
                      title="Fetch real-time location picture from Google / Unsplash"
                    >
                      <Wand2 className="w-3 h-3" />
                      <span>Auto-Fetch Photo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => editCoverFileInputRef.current?.click()}
                      className="text-[10px] bg-indigo-600 hover:bg-indigo-700 text-white font-black px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 shadow-sm"
                      title="Upload custom picture from your laptop or computer"
                    >
                      <Upload className="w-3 h-3" />
                      <span>Upload Local Photo</span>
                    </button>
                    <input
                      type="file"
                      ref={editCoverFileInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={handleEditCoverLocalFileUpload}
                    />
                  </div>
                </div>

                <div className="relative h-44 rounded-2xl overflow-hidden bg-slate-200 border border-slate-300 group shadow-inner">
                  <img
                    src={coverForm.image}
                    alt="Cover Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&q=80&w=1200';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black text-black bg-white px-2.5 py-1 rounded-lg border border-slate-300 flex items-center gap-1 shadow-md">
                        <MapPin className="w-3.5 h-3.5 text-rose-600" />
                        <span>{coverForm.location || editingCoverPkg.location}</span>
                      </span>
                      <span className="text-[10px] font-black text-emerald-950 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                        Admin Live Sync
                      </span>
                    </div>
                  </div>

                  {isFetchingCoverImageModal && (
                    <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center gap-2 text-rose-700 font-black text-xs">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Fetching Real-Time Place Picture...</span>
                    </div>
                  )}
                </div>

                {coverImageModalStatus && (
                  <p className="text-[10px] font-mono text-emerald-950 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-lg font-black">
                    {coverImageModalStatus}
                  </p>
                )}
              </div>

              {/* QUICK DESTINATION PRESET CHIPS */}
              <div className="space-y-1.5">
                <label className="block text-slate-800 font-black text-[11px]">
                  Quick Real-Time Destination Presets:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Ooty, Tamil Nadu', 'Munnar, Kerala', 'Kodaikanal, Tamil Nadu', 
                    'Coorg, Karnataka', 'Goa Beaches', 'Manali, Himachal', 
                    'Jaipur, Rajasthan', 'Alleppey, Kerala', 'Ladakh, Leh', 
                    'Taj Mahal, Agra', 'Wayanad, Kerala', 'Kashmir, Srinagar'
                  ].map((dest) => (
                    <button
                      key={dest}
                      type="button"
                      onClick={() => {
                        setCoverForm(prev => ({ ...prev, location: dest }));
                        handleFetchCoverPhotoForModal(dest);
                      }}
                      className="text-[10px] bg-slate-100 hover:bg-rose-600 hover:text-white text-slate-800 font-black px-2 py-1 rounded-lg border border-slate-300 transition cursor-pointer"
                    >
                      📍 {dest.split(',')[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-800 mb-1 font-black">Destination / Location Name *</label>
                <input
                  type="text"
                  required
                  value={coverForm.location}
                  onChange={(e) => {
                    setCoverForm({ ...coverForm, location: e.target.value });
                    if (coverErrors.location) {
                      setCoverErrors(prev => { const n = { ...prev }; delete n.location; return n; });
                    }
                  }}
                  placeholder="e.g. Ooty, Tamil Nadu"
                  className={`w-full bg-slate-50 border rounded-xl px-3 py-2 text-black font-bold focus:outline-none ${
                    coverErrors.location ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300 focus:border-rose-600'
                  }`}
                />
                {coverErrors.location && (
                  <p className="text-[11px] text-rose-600 font-bold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{coverErrors.location}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-slate-800 mb-1 font-black">Cover Photo URL *</label>
                <input
                  type="text"
                  required
                  value={coverForm.image}
                  onChange={(e) => {
                    setCoverForm({ ...coverForm, image: e.target.value });
                    if (coverErrors.image) {
                      setCoverErrors(prev => { const n = { ...prev }; delete n.image; return n; });
                    }
                  }}
                  placeholder="https://images.unsplash.com/..."
                  className={`w-full bg-slate-50 border rounded-xl px-3 py-2 text-black font-bold font-mono text-[11px] focus:outline-none ${
                    coverErrors.image ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300 focus:border-rose-600'
                  }`}
                />
                {coverErrors.image && (
                  <p className="text-[11px] text-rose-600 font-bold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{coverErrors.image}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setEditingCoverPkg(null); setCoverErrors({}); }}
                  className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black py-3 rounded-xl transition cursor-pointer border border-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-rose-600 hover:bg-rose-700 text-white font-black py-3 rounded-xl uppercase tracking-wider transition cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Update Cover Photo</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-black text-slate-900">{vehicleToDelete.name}</span>
                <span className="font-mono text-[10px] bg-indigo-100 text-indigo-950 px-2 py-0.5 rounded border border-indigo-200 font-black">
                  {vehicleToDelete.regNumber}
                </span>
              </div>
              <div className="text-[11px] text-slate-600 font-medium">
                Category: <strong className="text-slate-800">{vehicleToDelete.category}</strong> • Capacity: <strong className="text-slate-800">{vehicleToDelete.capacity}</strong>
              </div>
              {vehicleToDelete.currentDriver && (
                <div className="text-[11px] text-slate-600 font-medium">
                  Assigned Driver: <strong className="text-slate-800">{vehicleToDelete.currentDriver}</strong>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-700 font-medium">
              Are you sure you want to permanently delete this vehicle from the active HSK fleet records?
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

      {/* Real-Life AI Cover Photo Generator Modal (gemini-3.1-flash-image with 1K, 2K, 4K resolution) */}
      {isAiImageModalOpen && (
        <RealLifeImageGeneratorModal
          isOpen={isAiImageModalOpen}
          packageItem={selectedAdminGeneratorPkg}
          onClose={() => {
            setIsAiImageModalOpen(false);
            setSelectedAdminGeneratorPkg(null);
          }}
          onApplyImage={(newUrl, size, pkgId) => {
            if (aiImageModalTarget === 'new_pkg') {
              setNewPkg(prev => ({ ...prev, image: newUrl }));
              setCoverImageStatus(`✨ Generated photorealistic ${size} cover with gemini-3.1-flash-image!`);
            } else if (aiImageModalTarget === 'edit_cover') {
              setCoverForm(prev => ({ ...prev, image: newUrl }));
              setCoverImageModalStatus(`✨ Applied ${size} photorealistic cover photo!`);
              if (editingCoverPkg) {
                const updated = packages.map(p => p.id === editingCoverPkg.id ? { ...p, image: newUrl, imageSize: size, imageGeneratedByAI: true } : p);
                onUpdatePackages(updated);
              }
            } else if (pkgId) {
              const updated = packages.map(p => p.id === pkgId ? { ...p, image: newUrl, imageSize: size, imageGeneratedByAI: true } : p);
              onUpdatePackages(updated);
            }
            addAuditLog(`Generated real-life ${size} cover photo using gemini-3.1-flash-image`, 'Packages');
          }}
        />
      )}
    </div>
  );
};
