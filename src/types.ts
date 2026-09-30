export type ViewMode = 'home' | 'packages' | 'ai-planner' | 'dashboard' | 'admin' | 'fleet-admin';
export type UserRole = 'customer' | 'admin';

export interface TourPackage {
  id: string;
  title: string;
  subtitle: string;
  location: string;
  duration: string;
  pricePerPerson: number;
  estimatedKilometers?: number;
  baseRatePerKm?: number;
  rating: number;
  image: string;
  imageSize?: '1K' | '2K' | '4K';
  imageGeneratedByAI?: boolean;
  highlights: string[];
  description: string;
  itinerary: {
    day: number;
    title: string;
    description: string;
  }[];
  includedAmenities: string[];
}

export interface Vehicle {
  id: string;
  regNumber: string;
  name: string;
  category: string;
  capacity: string;
  amenities: ('wifi' | 'audio' | 'ac' | 'recline' | 'tv')[];
  status: 'AVAILABLE' | 'ON TRIP' | 'MAINTENANCE' | 'IDLE';
  currentDriver?: string;
  location?: string;
  speed?: string;
  pricePerDay: number;
  image?: string;
}

export interface PlannedTrip {
  id: string;
  title: string;
  dates: string;
  status: 'Processing' | 'Confirmed' | 'Completed' | 'Cancelled';
  image: string;
  vehicleName: string;
  guestsCount: number;
  totalCost: number;
  itinerarySummary: string;
  paymentStatus?: 'Paid' | 'Advance Paid' | 'Unpaid' | 'Pending';
  paymentMethod?: string;
  transactionId?: string;
  paidAmount?: number;
  paymentDate?: string;
}

export type PaymentMode = 'upi' | 'card' | 'netbanking' | 'wallet' | 'bank_transfer';

export interface PaymentRecord {
  id: string;
  tripId: string;
  tripTitle: string;
  amount: number;
  paymentMode: PaymentMode;
  platform: string;
  transactionId: string;
  date: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  paymentType: 'full' | 'advance';
  customerName?: string;
  customerPhone?: string;
  receiptNumber?: string;
  gstAmount?: number;
  discountApplied?: number;
}


export interface FleetStat {
  ongoingTrips: number;
  completedToday: number;
  bookedCount: number;
  totalVehicles: number;
  maintenanceAlerts: number;
}

export interface MaintenanceAlert {
  id: string;
  title: string;
  vehicleReg: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  time: string;
}

export interface TripFeedback {
  id: string;
  author: string;
  timeAgo: string;
  rating: number;
  comment: string;
  tripName: string;
  avatar?: string;
}

export interface MapPlace {
  title: string;
  uri: string;
  address?: string;
  snippet?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  weatherData?: {
    cityName: string;
    temperature: string;
    feelsLike: string;
    condition: string;
    icon: string;
    humidity: string;
    windSpeed: string;
    rainProb: string;
    tempMax: string;
    tempMin: string;
    travelAdvice: string;
    updatedAt: string;
  };
  card?: {
    title: string;
    days: string[];
    recommendedVehicle: string;
    estPrice: string;
    origin?: string;
    destination?: string;
  };
  routeData?: {
    origin: string;
    destination: string;
    distance?: string;
    duration?: string;
    avoidTolls?: boolean;
    avoidHighways?: boolean;
  };
  sources?: Array<{ title: string; uri: string }>;
  mapPlaces?: MapPlace[];
}

export interface CustomQrCode {
  id: string;
  title: string;
  upiId: string;
  payeeName: string;
  bankName?: string;
  qrImageUrl?: string;
  isDefault?: boolean;
  notes?: string;
  createdDate?: string;
}

export interface CustomerProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  avatarUrl: string;
  memberId: string;
  tier: 'Silver Voyager' | 'Gold Voyager' | 'Platinum Royal';
  loyaltyPoints: number;
  joinDate: string;
  // Address & Location
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  // Travel Preferences
  preferredSeat: 'Window' | 'Aisle' | 'Lower Berth' | 'Sleeper Upper' | 'Any';
  preferredCoachType: string;
  mealPreference: 'Pure Vegetarian' | 'Jain Food' | 'Non-Vegetarian' | 'No Preference';
  preferredLanguage: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  // Notifications
  notifyWhatsApp: boolean;
  notifySms: boolean;
  notifyEmailInvoice: boolean;
}

export interface AdminProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  roleTitle: string;
  department: string;
  employeeId: string;
  baseHub: string;
  avatarUrl: string;
  bio: string;
  emergencyContact: string;
  digitalSignatureName: string;
  // Operational notification settings
  notifyNewBookings: boolean;
  notifyFleetMaintenance: boolean;
  notifyFeedbackAlerts: boolean;
  notifyHighValueTrips: boolean;
  sessionTimeoutMinutes: number;
  lastUpdated?: string;
}
