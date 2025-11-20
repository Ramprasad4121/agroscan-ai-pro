
export type UserRole = 'farmer' | 'consumer' | 'govt' | 'bank' | 'company' | 'insurance' | 'service_provider' | 'admin' | 'fpo';

export interface User {
  id?: string;
  email?: string;
  phone?: string;
  name: string;
  role: UserRole;
  location?: string;
  avatar?: string;
  
  // Role Specific Data
  landSize?: string; // Farmer
  mainCrops?: string[]; // Farmer
  orgName?: string; // Corporate
  orgId?: string; // Corporate
  designation?: string; // Corporate
  kycStatus?: 'Verified' | 'Pending' | 'Failed';
  
  // Consent Framework
  permissions?: {
    location: boolean;
    camera: boolean;
    dataSharing: boolean; // "I agree to share my data with banks/govt"
    notifications: boolean;
  };
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'alert' | 'info' | 'success';
  timestamp: Date;
  read: boolean;
}

// Offline Sync Types
export interface SyncQueueItem {
  id: string;
  type: 'listing' | 'loan' | 'claim' | 'diagnosis';
  endpoint: string;
  data: any;
  timestamp: number;
  status: 'pending' | 'synced' | 'error';
}

export interface PlantDiagnosis {
  plantName: string;
  isHealthy: boolean;
  diseaseName?: string;
  issueType?: 'Disease' | 'Pest' | 'Deficiency' | 'Other' | 'Healthy';
  confidence: number;
  symptoms: string[];
  treatments: string[];
  preventiveMeasures: string[];
  expertAdvice: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
  groundingMetadata?: any; // For search citations
}

export interface GroundingResult {
  text: string;
  chunks: any[]; // Flexible for map/search chunks
}

export interface CalendarEvent {
  date: string;
  activity: string;
  description: string;
  type: 'sowing' | 'fertilizer' | 'irrigation' | 'harvest' | 'general';
}

export interface CropRecommendation {
  cropName: string;
  suitabilityScore: number;
  reason: string;
  season: string;
  requirements: string;
}

export interface WaterStressAnalysis {
  soilMoistureLevel: number; // 0-100
  status: 'Critical' | 'Low' | 'Good' | 'Saturated';
  irrigationToday: boolean;
  amount: string; // e.g. "15mm"
  reason: string;
  weeklyForecast: {
    day: string;
    waterMm: number;
    condition: string;
  }[];
}

export interface YieldPrediction {
  expectedYield: string; // e.g. "45-50 Quintals"
  revenueEstimate: string;
  costOfCultivation?: string; // New
  netProfit?: string; // New
  confidenceScore: number;
  factors: string[]; // Positive/Negative factors
  riskAssessment: string; // Weather risks
  storageAdvice: string;
}

export interface FertilizerPlan {
  cropStage: string;
  recommendations: {
    product: string; // Urea, DAP, etc.
    dosagePerAcre: string;
    method: string; // Basal, Spray
    costEstimate: string;
  }[];
  totalCost: string;
  organicAlternatives: string[];
  roiTips: string;
}

export interface PesticideGuidance {
  chemicalName: string;
  dosage: string;
  waterVolume?: string; // New
  mixingOrder: string[]; // Sequence of mixing
  safetyGear: string[]; // Mask, Gloves etc.
  waitingPeriod: string; // Pre-harvest interval
  compatibility: string; // What not to mix with
}

export interface StorageAdvice {
  optimalConditions: {
    temperature: string;
    humidity: string;
    moistureContent: string;
    shelfLife: string;
  };
  marketAnalysis: {
    trend: 'RISING' | 'FALLING' | 'STABLE';
    recommendation: 'SELL' | 'STORE' | 'HOLD';
    reason: string;
  };
  tips: string[];
}

// NEW: Market Forecast Types
export interface MarketForecast {
  crop: string;
  currentPrice: string;
  forecast: { 
    week: string; 
    price: number; 
    trend: 'up' | 'down' | 'stable';
    label: string; // e.g. "Next Week"
  }[];
  decision: 'SELL' | 'STORE' | 'HOLD';
  decisionReason: string;
  bestMandis: { name: string; distance: string; price: string }[];
  factors: string[]; // e.g. "Upcoming Diwali Demand", "Rain Damage in Nashik"
}

// NEW: Marketplace Types
export interface MarketListing {
  id: string;
  crop: string;
  variety: string;
  quantity: string;
  price: string;
  date: Date;
  status: 'Active' | 'Sold';
  sellerName?: string;
  location?: string;
  image?: string;
}

export interface BuyerProfile {
  name: string;
  type: 'Trader' | 'FPO' | 'Company' | 'Bulk Buyer';
  distance: string;
  priceOffer: string;
  contactInfo: string;
  confidence: 'Verified' | 'Potential';
  notes: string;
}

// NEW: Profit Calculator Types
export interface CostBreakdown {
  seeds: number;
  fertilizers: number;
  pesticides: number;
  labor: number;
  irrigation: number;
  transport: number;
  machinery: number;
  other: number;
  total: number;
}

export interface ProfitAnalysis {
  totalRevenue: string;
  netProfit: string;
  roi: string; // Return on Investment %
  marketPriceUsed: string; // e.g. "2400/Quintal"
  yieldUsed: string; // e.g. "20 Quintals"
  costAssessment: string; // AI analysis of costs (e.g. "Labor cost is higher than regional average")
  optimizationTips: string[];
}

// NEW: Scheme Assistance Types
export interface SchemeGuide {
  schemeName: string;
  steps: {
    stepNumber: number;
    title: string;
    description: string;
  }[];
  requiredDocuments: string[];
  tips: string[]; // "Hacks" to avoid rejection
  eligibility: string[];
}

// NEW: Power Schedule Types
export interface PowerSchedule {
  location: string;
  currentStatus: '3-Phase' | 'Single Phase' | 'No Power';
  nextPowerSlot: string; // e.g. "2:30 AM Tomorrow"
  duration: string; // e.g. "6 Hours"
  schedule: {
    startTime: string;
    endTime: string;
    phase: '3-Phase' | 'Single Phase';
  }[];
  alertMessage: string; // e.g. "Power will come at 2:30 AM, get ready."
  source: string; // e.g. "TSSPDCL Group A Roster"
}

// NEW: Agri Passport Data Types
export interface LandParcel {
  surveyNumber: string;
  area: string;
  type: 'Irrigated' | 'Rainfed';
  ownership: 'Sole' | 'Joint';
  geoBoundary?: string; // Simplified for mock
  status: 'Verified' | 'Pending';
}

export interface SoilReport {
  date: string;
  nitrogen: 'Low' | 'Medium' | 'High';
  phosphorus: 'Low' | 'Medium' | 'High';
  potassium: 'Low' | 'Medium' | 'High';
  ph: number;
  organicCarbon: string;
  recommendation: string;
}

export interface AgriPassportData {
  farmerId: string;
  name: string;
  fatherName: string;
  dob: string;
  aadharHash: string; // Masked
  address: string;
  landParcels: LandParcel[];
  cropsHistory: { year: string; season: string; crop: string; yield: string }[];
  soilHealth: SoilReport;
  financials: {
    creditScore: number;
    activeLoans: number; // Count
    insuranceCoverage: boolean;
    kccLimit: string;
  };
  compliance: {
    soilTested: boolean;
    advisoryFollowed: number; // Percentage
    sustainablePractices: boolean;
  };
}

// NEW: Community & Social Types
export interface CommunityPost {
  id: string;
  author: string;
  role: 'Farmer' | 'Expert' | 'Admin';
  content: string;
  image?: string;
  likes: number;
  comments: number;
  timestamp: string;
  isExpertVerified?: boolean;
  replies?: { author: string; text: string; isExpert: boolean }[];
}

export interface ShopListing {
  id: string;
  name: string;
  type: string; // Seeds, Machinery, Fertilizers
  rating: number;
  reviewCount: number;
  location: string;
  distance: string;
  contact: string;
  isOpen: boolean;
}

export interface WorkerProfile {
  id: string;
  name: string;
  skills: string[]; // Harvesting, Spraying, Plowing
  rate: string; // ₹500/day
  availability: 'Available' | 'Busy';
  location: string;
  phone: string;
  rating: number;
}

// NEW: Drone Services Types
export interface DroneService {
  id: string;
  title: string;
  description: string;
  costPerAcre: string;
  iconType: 'spray' | 'scan' | 'map' | 'seed';
  benefits: string[];
}

export interface DronePilot {
  id: string;
  name: string;
  droneModel: string;
  rating: number;
  distance: string;
  completedJobs: number;
  isVerified: boolean;
}

// NEW: Heatmap & Risk Intelligence Types
export interface RiskSector {
  id: string;
  location: string; // e.g., "Sector A - North Dindori"
  riskLevel: 'Critical' | 'High' | 'Moderate' | 'Low';
  issueType: 'Disease' | 'Pest' | 'Water Stress';
  affectedCrop: string;
  affectedAcres: number;
  reportCount: number; // Number of farmers reporting via scans
  trend: 'Rising' | 'Stable' | 'Falling';
}

export interface RiskReport {
  id: string;
  timestamp: string;
  village: string;
  issue: string;
  severity: 'High' | 'Medium' | 'Low';
  source: 'Satellite' | 'Crowd (Scan)';
}

// NEW: FPO Management Types
export interface FPOMember {
  id: string;
  name: string;
  village: string;
  landSize: string;
  primaryCrop: string;
  status: 'Active' | 'Pending';
  balance: string; // Pending payment to farmer
}

export interface FPOBatch {
  id: string;
  type: 'Input' | 'Output';
  item: string;
  quantity: string;
  status: 'Collecting' | 'Processing' | 'Completed';
  participants: number;
  value: string;
}

// Bridge Data Types (Shared between roles)
export interface LoanApplication {
  id: string;
  farmerName: string;
  amount: string;
  purpose: string;
  riskScore: 'Low' | 'Medium' | 'High';
  status: 'Pending' | 'Approved' | 'Rejected';
  date: string;
}

export interface InsuranceClaim {
  id: string;
  farmerName: string;
  crop: string;
  damageType: string; // Flood, Pest, Drought
  lossEstimate: string;
  status: 'Verification' | 'Approved';
  image?: string;
}

export enum DiagnosisStatus {
  IDLE = 'IDLE',
  SCANNING = 'SCANNING',
  ANALYZING = 'ANALYZING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export type ViewState = 'login' | 'home' | 'passport' | 'whatsapp' | 'community' | 'drones' | 'scan' | 'result' | 'visualize' | 'video' | 'audio' | 'market' | 'live' | 'schemes' | 'calendar' | 'recommend' | 'water' | 'yield' | 'fertilizer' | 'pesticide' | 'storage' | 'marketplace' | 'profit' | 'electricity';
