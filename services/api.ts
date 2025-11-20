
import { User, UserRole } from '../types';
import { offlineService } from './offline';

// --- API ARCHITECTURE & KEY MAPPING ---
export const API_CONFIG = {
  gemini: process.env.GEMINI_API_KEY,
  vision: process.env.VISION_API_KEY,
  diseaseModel: process.env.DISEASE_MODEL_KEY,
  satellite: process.env.SATELLITE_API_KEY,
  weather: process.env.WEATHER_API_KEY,
  maps: process.env.MAPS_API_KEY,
  sms: process.env.SMS_API_KEY,
  whatsapp: process.env.WHATSAPP_API_KEY,
  payment: process.env.PAYMENT_GATEWAY_KEY,
  kyc: process.env.KYC_PROVIDER_KEY,
  analytics: process.env.ANALYTICS_KEY,
};

const NETWORK_DELAY = 1000;

// --- API GATEWAY SIMULATION ---
export const authService = {
  login: async (identifier: string, role: UserRole, password?: string): Promise<User> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockUser: User = {
          id: `user_${Date.now()}`,
          name: getNameForRole(role),
          email: identifier.includes('@') ? identifier : undefined,
          phone: identifier.includes('@') ? undefined : identifier,
          role: role,
          location: getLocationForRole(role),
          orgName: getOrgName(role),
          kycStatus: 'Verified',
          permissions: {
            location: true,
            camera: true,
            dataSharing: true,
            notifications: true
          }
        };
        resolve(mockUser);
      }, NETWORK_DELAY);
    });
  },

  signup: async (userData: Partial<User>): Promise<User> => {
     return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          ...userData,
          id: `user_${Date.now()}`,
          kycStatus: 'Pending',
          permissions: {
            location: true,
            camera: true,
            dataSharing: true,
            notifications: true
          }
        } as User);
      }, NETWORK_DELAY);
    });
  }
};

export const farmerService = {
  getDashboardData: async (farmerId: string) => {
    return {
      crops: ['Wheat', 'Onion'],
      landSize: '2.5 Acres',
      soilHealth: 'Good',
      nextActivity: 'Fertilizer Application'
    };
  }
};

export const detectionService = {
  scanImage: async (imageData: string) => {
    // OFFLINE STRATEGY: Lightweight model check or queue?
    // For diagnosis, we usually need immediate feedback, but if offline we can't hit the heavy model.
    if (!navigator.onLine) {
        // Simulate "Lightweight On-Device" check (Rule based or small TFLite stub)
        // In a real PWA, this would be a small .tflite model loaded in browser
        return {
            prediction: "Pending Cloud Analysis", 
            confidence: 0.0, 
            advisory: "Internet unavailable. Image saved to Sync Queue. Basic check: Leaves look discolored."
        };
    }
    
    // Online: Call Full Disease Model
    console.log("Calling ML Inference Cluster...");
    return { prediction: "Early Blight", confidence: 0.95 };
  }
};

export const marketplaceService = {
  createListing: async (data: any) => {
    // OFFLINE HANDLER
    if (!navigator.onLine) {
        offlineService.addToQueue('listing', '/marketplace/listing', data);
        return { success: true, id: `temp_${Date.now()}`, offline: true };
    }

    console.log("Creating listing in Marketplace Service...");
    return { success: true, id: `listing_${Date.now()}` };
  }
};

export const paymentsService = {
  createOrder: async (amount: number) => {
    if (!navigator.onLine) {
        throw new Error("Internet required for payments.");
    }
    console.log("Initiating transaction via Payment Gateway...");
    return { success: true, orderId: `ord_${Date.now()}` };
  }
};

export const financeService = {
  applyLoan: async (data: any) => {
    // OFFLINE HANDLER
    if (!navigator.onLine) {
        offlineService.addToQueue('loan', '/bank/loan-apply', data);
        return { success: true, applicationId: `temp_loan_${Date.now()}`, offline: true };
    }

    console.log("Submitting to Loan Workflow Engine...");
    return { success: true, applicationId: `loan_${Date.now()}` };
  }
};

export const govtService = {
  checkEligibility: async (farmerId: string) => {
    return ['PM-KISAN', 'KCC'];
  }
};

// --- MOCK DATA GENERATORS ---
function getNameForRole(role: UserRole): string {
  switch(role) {
    case 'farmer': return 'Ram Kishan';
    case 'consumer': return 'Priya Sharma';
    case 'bank': return 'Vikram Singh (HDFC)';
    case 'govt': return 'Rajesh Kumar (Dist. Officer)';
    case 'company': return 'Mahindra Agri Solutions';
    case 'insurance': return 'AIC of India';
    case 'service_provider': return 'Ravi Logistics';
    default: return 'AgroScan Admin';
  }
}

function getLocationForRole(role: UserRole): string {
  switch(role) {
    case 'farmer': return 'Nashik, Maharashtra';
    case 'consumer': return 'Mumbai, Maharashtra';
    case 'govt': return 'New Delhi, India';
    default: return 'Mumbai, India';
  }
}

function getOrgName(role: UserRole): string | undefined {
  if (role === 'bank') return 'HDFC Bank';
  if (role === 'govt') return 'Dept of Agriculture';
  if (role === 'company') return 'Mahindra Agri';
  return undefined;
}
