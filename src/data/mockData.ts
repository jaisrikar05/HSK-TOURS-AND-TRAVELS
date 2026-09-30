import { TourPackage, Vehicle, PlannedTrip, MaintenanceAlert, TripFeedback, PaymentRecord, CustomQrCode, CustomerProfile, AdminProfile } from '../types';

export const initialPackages: TourPackage[] = [
  {
    id: 'ooty-01',
    title: 'THE BLUE HILLS:',
    subtitle: 'OOTY',
    location: 'Ooty, Tamil Nadu',
    duration: '3D/2N',
    pricePerPerson: 8500,
    estimatedKilometers: 580,
    baseRatePerKm: 15,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&q=80&w=1200',
    highlights: ['TEA GARDENS', 'LAKE BOATING', 'DODDABETTA PEAK'],
    description: 'Discover the charm of the Nilgiris with boat rides, lush tea gardens, and crisp botanical walks in luxury comfort.',
    itinerary: [
      { day: 1, title: 'Arrival & Ooty Lake', description: 'Scenic drive from Coimbatore/Bangalore in HSK Executive Coach. Afternoon boat ride at Ooty Lake & Botanical Garden stroll.' },
      { day: 2, title: 'Doddabetta & Tea Factory Tour', description: 'Panoramas from Doddabetta Peak, estate walk through tea fields, and private evening campfire.' },
      { day: 3, title: 'Pykara Waterfalls & Return', description: 'Morning boat ride at Pykara Lake, waterfall photo stops, and comfortable return journey.' }
    ],
    includedAmenities: ['Luxury Recliner Seats', 'High-Speed Wi-Fi', 'On-board Refreshments', 'Speed Governor Safety']
  },
  {
    id: 'munnar-02',
    title: 'MIST & TEA:',
    subtitle: 'MUNNAR',
    location: 'Munnar, Kerala',
    duration: '4D/3N',
    pricePerPerson: 9200,
    estimatedKilometers: 650,
    baseRatePerKm: 14,
    rating: 4.95,
    image: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&q=80&w=1200',
    highlights: ['WATERFALL TOUR', 'SPICE GARDEN', 'TEA MUSEUM'],
    description: 'Escape to mist-covered slopes of Kerala\'s most iconic hill station in our air-conditioned air-suspension coaches.',
    itinerary: [
      { day: 1, title: 'Welcome to Munnar', description: 'Scenic mountain climb via Cheeyappara Waterfalls with stopping points.' },
      { day: 2, title: 'Eravikulam & Tea Estates', description: 'Spot Nilgiri Tahr at Eravikulam National Park and visit Lockhart Tea Factory.' },
      { day: 3, title: 'Mattupetty Dam & Spice Gardens', description: 'Eco Point speed boating, Mattupetty Dam, and guided organic spice plantation walk.' },
      { day: 4, title: 'Souvenir Shopping & Return', description: 'Local spice shopping and relaxing return journey.' }
    ],
    includedAmenities: ['Climate Control AC', 'Premium Surround Sound', 'First Aid & Safety Kit', 'Expert Driver & Guide']
  },
  {
    id: 'kodai-03',
    title: 'PRINCESS OF HILLS:',
    subtitle: 'KODAIKANAL',
    location: 'Kodaikanal, Tamil Nadu',
    duration: '3D/2N',
    pricePerPerson: 7800,
    estimatedKilometers: 520,
    baseRatePerKm: 15,
    rating: 4.88,
    image: 'https://images.unsplash.com/photo-1626014903708-691955774b14?auto=format&fit=crop&q=80&w=1200',
    highlights: ['PINE FOREST WALK', 'COAKER\'S WALK', 'KODAI LAKE'],
    description: 'Scenic viewpoints, dense pine forests, and the tranquil Kodai lake await you on a curated HSK private trip.',
    itinerary: [
      { day: 1, title: 'Kodai Arrival & Bryant Park', description: 'Check-in to resort, afternoon row boating on Kodaikanal Lake, evening stroll at Bryant Park.' },
      { day: 2, title: 'Pillar Rocks & Pine Forest', description: 'Excursion to Pillar Rocks, Coaker\'s Walk, and filming spots in Pine Forest.' },
      { day: 3, title: 'Silver Cascade & Departure', description: 'Morning view of Silver Cascade Falls and relaxed departure trip.' }
    ],
    includedAmenities: ['Wi-Fi', 'Reclining Comfort Seats', 'Dedicated Trip Coordinator', 'Mobile Charging Ports']
  },
  {
    id: 'coorg-04',
    title: 'COFFEE LAND:',
    subtitle: 'COORG',
    location: 'Coorg, Karnataka',
    duration: '3D/2N',
    pricePerPerson: 8900,
    estimatedKilometers: 620,
    baseRatePerKm: 14.5,
    rating: 4.85,
    image: 'https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?auto=format&fit=crop&q=80&w=1200',
    highlights: ['COFFEE PLANTATION', 'ABBEY FALLS', 'NAMDROLING MONASTERY'],
    description: 'Immerse in lush coffee aroma, mist-laden valleys, and Tibetan cultural heritage with corporate luxury travel.',
    itinerary: [
      { day: 1, title: 'Bylakuppe & Madikeri Fort', description: 'Visit Golden Temple Tibetan Monastery followed by sunset at Raja\'s Seat.' },
      { day: 2, title: 'Abbey Falls & Coffee Estate', description: 'Morning walk in private coffee plantation, cupping session, and Abbey Falls.' },
      { day: 3, title: 'Dubare Elephant Camp & Return', description: 'Interactive elephant camp visit and return journey.' }
    ],
    includedAmenities: ['Wi-Fi', 'Climate AC', 'Recliners', 'Complimentary Water']
  },
  {
    id: 'goa-05',
    title: 'SUNSET & COAST:',
    subtitle: 'GOA',
    location: 'Goa Beaches & Old Forts',
    duration: '4D/3N',
    pricePerPerson: 10500,
    estimatedKilometers: 1100,
    baseRatePerKm: 9.5,
    rating: 4.92,
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&q=80&w=1200',
    highlights: ['BAGA BEACH', 'AGUADA FORT', 'MANDOVI CRUISE'],
    description: 'Golden beaches, historic Portuguese churches, and sunset river cruises with HSK luxury coach transport.',
    itinerary: [
      { day: 1, title: 'North Goa Arrival', description: 'Resort check-in, sunset at Baga Beach & Calangute promenade.' },
      { day: 2, title: 'Aguada Fort & Water Sports', description: 'Explore 17th-century Fort Aguada, lighthouse panoramas, and beach activities.' },
      { day: 3, title: 'Old Goa & Mandovi Cruise', description: 'Visit Basilica of Bom Jesus and evening music cruise on Mandovi River.' },
      { day: 4, title: 'Panjim Market & Return', description: 'Souvenir shopping in Panjim and comfortable return trip.' }
    ],
    includedAmenities: ['Recliner Seats', 'High-Speed Wi-Fi', 'AC Comfort', 'Onboard Refreshments']
  },
  {
    id: 'manali-06',
    title: 'SNOWY PEAKS:',
    subtitle: 'MANALI',
    location: 'Manali, Himachal Pradesh',
    duration: '5D/4N',
    pricePerPerson: 12800,
    estimatedKilometers: 1150,
    baseRatePerKm: 11,
    rating: 4.97,
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&q=80&w=1200',
    highlights: ['SOLANG VALLEY', 'ATAL TUNNEL', 'HADIMBA TEMPLE'],
    description: 'Experience Himalayan snow valleys, pine pine forest walks, and Solang adventure sports in luxury comfort.',
    itinerary: [
      { day: 1, title: 'Arrival & Mall Road Walk', description: 'Welcome to Manali, resort check-in, and evening stroll at Mall Road.' },
      { day: 2, title: 'Solang Valley & Atal Tunnel', description: 'Ropeway rides, snow activities at Solang Valley and drive through Atal Tunnel.' },
      { day: 3, title: 'Hadimba & Vashisht Hot Springs', description: 'Visit ancient Hadimba Devi Temple and natural thermal springs at Vashisht.' },
      { day: 4, title: 'Kasol & Manikaran Excursion', description: 'Day tour to Parvati Valley, Kasol market, and Manikaran Sahib.' },
      { day: 5, title: 'Return Journey', description: 'Scenic drive down the Beas River valley in HSK Multi-Axle Volvo.' }
    ],
    includedAmenities: ['Air Suspension Volvo', 'Heated Blanket Options', 'Wi-Fi', 'Professional Mountain Driver']
  },
  {
    id: 'jaipur-07',
    title: 'THE PINK CITY:',
    subtitle: 'JAIPUR',
    location: 'Jaipur, Rajasthan',
    duration: '3D/2N',
    pricePerPerson: 8200,
    estimatedKilometers: 750,
    baseRatePerKm: 11,
    rating: 4.89,
    image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&q=80&w=1200',
    highlights: ['HAWA MAHAL', 'AMER FORT', 'CITY PALACE'],
    description: 'Immerse in royal Rajasthani grandeur, majestic hilltop forts, and vibrant bazaars in luxury charter coaches.',
    itinerary: [
      { day: 1, title: 'Hawa Mahal & City Palace', description: 'Arrival in Pink City, visit iconic Hawa Mahal facade and royal City Palace museum.' },
      { day: 2, title: 'Amer Fort & Jal Mahal', description: 'Elephant/jeep ride up to Amer Fort, Nahargarh sunset view, and photo stop at Jal Mahal.' },
      { day: 3, title: 'Johari Bazaar & Departure', description: 'Handicraft & gem shopping at Johari Bazaar before return trip.' }
    ],
    includedAmenities: ['Climate Control AC', 'Recliners', 'Onboard Audio Tour Guide', 'Wi-Fi']
  },
  {
    id: 'kerala-08',
    title: 'BACKWATER LAGOONS:',
    subtitle: 'ALLEPPEY',
    location: 'Alleppey, Kerala',
    duration: '3D/2N',
    pricePerPerson: 9500,
    estimatedKilometers: 680,
    baseRatePerKm: 14,
    rating: 4.94,
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&q=80&w=1200',
    highlights: ['HOUSEBOAT CRUISE', 'PADDY FIELDS', 'COCONUT LAGOONS'],
    description: 'Unwind amidst tranquil backwater canals, traditional Kettuvallam houseboats, and lush coconut palm groves.',
    itinerary: [
      { day: 1, title: 'Houseboat Boarding', description: 'Board private luxury houseboat at Alleppey jetty, traditional Kerala lunch onboard.' },
      { day: 2, title: 'Vembanad Lake & Village Walk', description: 'Cruise past paddy fields, visit village coir making, and sunset over Vembanad Lake.' },
      { day: 3, title: 'Marari Beach & Return', description: 'Morning visit to serene Marari Beach before comfortable return journey.' }
    ],
    includedAmenities: ['AC Luxury Transport', 'Onboard Refreshments', 'Wi-Fi', 'Speed Governor Safety']
  }
];

export const initialVehicles: Vehicle[] = [];

export const initialPlannedTrips: PlannedTrip[] = [
  {
    id: 'trip-101',
    title: 'Ooty Summer Getaway',
    dates: 'May 12 - May 15',
    status: 'Processing',
    image: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&q=80&w=800',
    vehicleName: 'Luxury Force Traveler (12+1)',
    guestsCount: 10,
    totalCost: 18500,
    itinerarySummary: '3-Day Ooty trip with Botanical Gardens, Doddabetta Peak & Tea Factory.',
    paymentStatus: 'Pending',
    paidAmount: 0
  },
  {
    id: 'trip-102',
    title: 'Coastal Luxury Tour',
    dates: 'June 20 - June 28',
    status: 'Confirmed',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800',
    vehicleName: 'Premium Volvo Multi-Axle (45 Seats)',
    guestsCount: 38,
    totalCost: 72000,
    itinerarySummary: '8-Day Southern Coastal resort retreat & heritage sites.',
    paymentStatus: 'Paid',
    paidAmount: 72000,
    paymentMethod: 'Google Pay UPI',
    transactionId: 'TXN-HSK-983102-UPI',
    paymentDate: '2026-06-10 14:32'
  }
];

export const initialPaymentRecords: PaymentRecord[] = [
  {
    id: 'pay-101',
    tripId: 'trip-102',
    tripTitle: 'Coastal Luxury Tour',
    amount: 72000,
    paymentMode: 'upi',
    platform: 'Google Pay (UPI)',
    transactionId: 'TXN-HSK-983102-UPI',
    date: '2026-06-10 14:32',
    status: 'SUCCESS',
    paymentType: 'full',
    customerName: 'Suresh Kumar',
    customerPhone: '+91 98450 11234',
    receiptNumber: 'HSK-INV-2026-0814',
    gstAmount: 3600,
    discountApplied: 1000
  }
];

export const initialQrCodes: CustomQrCode[] = [
  {
    id: 'qr-official-sbi',
    title: 'HSK Official Verified Merchant QR',
    upiId: 'hsktours@oksbi',
    payeeName: 'HSK Tours & Travels Pvt Ltd',
    bankName: 'State Bank of India',
    isDefault: true,
    notes: 'Official primary collection account with 0% surcharge and instant payment acknowledgment.',
    createdDate: '2026-01-01'
  },
  {
    id: 'qr-fast-icici',
    title: 'HSK Fleet Desk Instant UPI',
    upiId: 'hsktours@icici',
    payeeName: 'HSK Tours & Travels',
    bankName: 'ICICI Bank',
    isDefault: false,
    notes: 'Direct branch counter UPI QR for quick advance tokens and spot charter dispatch.',
    createdDate: '2026-02-15'
  },
  {
    id: 'qr-driver-ops',
    title: 'Operations & Toll / Driver Batta QR',
    upiId: 'hskfleet@hdfcbank',
    payeeName: 'HSK Operations Desk',
    bankName: 'HDFC Bank',
    isDefault: false,
    notes: 'Used for route extensions, interstate permit charges, and extra kilometer settlements.',
    createdDate: '2026-03-01'
  }
];


export const initialMaintenanceAlerts: MaintenanceAlert[] = [
  {
    id: 'alt-1',
    title: 'Engine Check Required',
    vehicleReg: 'HSK-MER-8810',
    description: 'Vehicle HSK-MER-8810 has reported low oil pressure on sensors.',
    severity: 'high',
    time: '10 mins ago'
  },
  {
    id: 'alt-2',
    title: 'Service Scheduled',
    vehicleReg: 'HSK-VOL-1102',
    description: 'Vehicle HSK-VOL-1102 scheduled for periodic maintenance tomorrow at 08:00 AM.',
    severity: 'medium',
    time: '1 hour ago'
  }
];

export const initialFeedback: TripFeedback[] = [
  {
    id: 'fb-1',
    author: 'Ananya R.',
    timeAgo: '2 days ago',
    rating: 5,
    comment: 'The AI itinerary for our Munnar trip was spot on! The driver was professional and the bus was super clean. 5/5!',
    tripName: 'Munnar Tea Estates Escape'
  },
  {
    id: 'fb-2',
    author: 'Vikram S.',
    timeAgo: '1 week ago',
    rating: 5,
    comment: 'Excellent fleet management. Booking via the dashboard is seamless. Highly recommended for corporate outings.',
    tripName: 'Corporate Retreat Kodaikanal'
  }
];

export const initialCustomerProfile: CustomerProfile = {
  id: 'cust-hsk-8942',
  fullName: 'Rajesh K. Sharma',
  email: 'rajesh.sharma@traveler.in',
  phone: '+91 98450 11234',
  alternatePhone: '+91 94480 22334',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
  memberId: 'HSK-TRV-8942',
  tier: 'Gold Voyager',
  loyaltyPoints: 4850,
  joinDate: '15 Jan 2024',
  addressLine: 'Flat 402, Royal Palms Residency, 12th Main, Indiranagar',
  city: 'Bengaluru',
  state: 'Karnataka',
  pincode: '560038',
  preferredSeat: 'Window',
  preferredCoachType: 'BharatBenz AC Sleeper (Luxury 2+1)',
  mealPreference: 'Pure Vegetarian',
  preferredLanguage: 'English / Kannada',
  emergencyContactName: 'Priya R. Sharma',
  emergencyContactPhone: '+91 98450 99887',
  emergencyContactRelation: 'Spouse',
  notifyWhatsApp: true,
  notifySms: true,
  notifyEmailInvoice: true,
};

export const initialAdminProfile: AdminProfile = {
  id: 'admin-hsk-001',
  fullName: 'Srikar G. K.',
  email: '9158.jaisrikargkky@gmail.com',
  phone: '+91 98450 11234',
  alternatePhone: '+91 80 2345 6789',
  roleTitle: 'Chief Operations Officer & Master Controller',
  department: 'HSK Central Operations & Fleet Logistics',
  employeeId: 'HSK-ADM-001',
  baseHub: 'Coimbatore Central Fleet Terminal',
  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
  bio: 'Lead administrative controller for HSK Tours & Travels. Overseeing Tamil Nadu, Kerala, and Karnataka luxury coach charters, route permits, driver roster dispatch, and executive operations.',
  emergencyContact: '+91 94433 22110 (24/7 Breakdown & Recovery Desk)',
  digitalSignatureName: 'Srikar G.K. [Chief Dispatch Controller]',
  notifyNewBookings: true,
  notifyFleetMaintenance: true,
  notifyFeedbackAlerts: true,
  notifyHighValueTrips: true,
  sessionTimeoutMinutes: 30,
  lastUpdated: 'Today at 09:30 AM'
};
