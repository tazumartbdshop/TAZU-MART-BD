import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FakeReport {
  id: string;
  orderId: string;
  reason: 'Wrong Phone Number' | 'Customer Not Responding' | 'Wrong Address' | 'Duplicate Order' | 'Intentional Fake Order' | 'Other';
  notes: string;
  evidenceImage?: string;
  reportedAt: number;
}

export interface AbandonedCheckout {
  id: string;
  name: string;
  phone: string;
  products: { name: string; quantity: number; price: number }[];
  timestamp: number;
  ipLog: string;
  deviceType: string;
  status: 'Pending Recovery' | 'Recovered' | 'Expired';
}

export interface CustomerRisk {
  phoneNumber: string;
  warningCount: number;
  riskScore: number; // 0 to 100
}

interface FakeOrderStore {
  fakeReports: FakeReport[];
  abandonedCheckouts: AbandonedCheckout[];
  customerRisks: Record<string, CustomerRisk>; // Key is phone number
  verifiedOrders: string[]; // Order ids that have been verified
  
  // Actions
  addFakeReport: (report: Omit<FakeReport, 'id' | 'reportedAt'>) => void;
  removeFakeReport: (orderId: string) => void;
  addOrUpdateAbandonedCheckout: (checkout: Partial<AbandonedCheckout> & { id: string }) => void;
  markCheckoutRecovered: (id: string) => void;
  updateCheckoutStatus: (id: string, status: AbandonedCheckout['status']) => void;
  verifyOrder: (orderId: string) => void;
  getRiskInfo: (phoneNumber: string) => CustomerRisk;
  resetAll: () => void;
}

// Generate some demo abandoned checkouts for dynamic preview
const demoAbandoned: AbandonedCheckout[] = [
  {
    id: "ab-1",
    name: "Rahat Alam",
    phone: "01729384729",
    products: [{ name: "Premium Leather Wallet", quantity: 1, price: 1250 }],
    timestamp: Date.now() - 3600000 * 2, // 2 hours ago
    ipLog: "103.45.122.98",
    deviceType: "Mobile (iPhone/iOS)",
    status: "Pending Recovery"
  },
  {
    id: "ab-2",
    name: "Nushrat Jahan",
    phone: "01827463524",
    products: [{ name: "Handmade Saree - Blue", quantity: 1, price: 3400 }, { name: "Pearl Earring Set", quantity: 1, price: 850 }],
    timestamp: Date.now() - 3600000 * 5, // 5 hours ago
    ipLog: "203.82.199.14",
    deviceType: "Desktop (Windows)",
    status: "Pending Recovery"
  },
  {
    id: "ab-3",
    name: "Kamrul Hasan",
    phone: "01511223344", // wrong pattern
    products: [{ name: "Wireless Bluetooth Earbuds", quantity: 2, price: 1800 }],
    timestamp: Date.now() - 3600000 * 24, // 1 day ago
    ipLog: "182.49.201.76",
    deviceType: "Mobile (Android)",
    status: "Expired"
  }
];

export const useFakeOrderStore = create<FakeOrderStore>()(
  persist(
    (set, get) => ({
      fakeReports: [],
      abandonedCheckouts: demoAbandoned,
      customerRisks: {},
      verifiedOrders: [],

      addFakeReport: (report) => set((state) => {
        const id = 'FR-' + Math.random().toString(36).substring(2, 9).toUpperCase();
        const reportedAt = Date.now();
        const newReport: FakeReport = { ...report, id, reportedAt };
        
        // Dynamic Warning Count & COD Risk calculation matching specs
        const phone = report.orderId; // Usually associated phone number or link is checked
        const currentRisk = state.customerRisks[phone] || { phoneNumber: phone, warningCount: 0, riskScore: 0 };
        
        const nextWarningCount = currentRisk.warningCount + 1;
        // Formula: Risk score starts at 0, increases by 35 per warning up to max 100
        const nextRiskScore = Math.min(100, Math.min(100, nextWarningCount * 35));

        const updatedRisks = {
          ...state.customerRisks,
          [phone]: {
            phoneNumber: phone,
            warningCount: nextWarningCount,
            riskScore: nextRiskScore
          }
        };

        return {
          fakeReports: [newReport, ...state.fakeReports],
          customerRisks: updatedRisks
        };
      }),

      removeFakeReport: (orderId) => set((state) => ({
        fakeReports: state.fakeReports.filter(r => r.orderId !== orderId)
      })),

      addOrUpdateAbandonedCheckout: (checkout) => set((state) => {
        const idx = state.abandonedCheckouts.findIndex(c => c.id === checkout.id);
        const list = [...state.abandonedCheckouts];
        const now = Date.now();

        if (idx !== -1) {
          list[idx] = {
            ...list[idx],
            ...checkout,
            timestamp: checkout.timestamp || list[idx].timestamp // preserve original or set new
          } as AbandonedCheckout;
        } else {
          list.unshift({
            name: '',
            phone: '',
            products: [],
            timestamp: now,
            ipLog: '127.0.0.1',
            deviceType: 'Desktop/Mobile',
            status: 'Pending Recovery',
            ...checkout
          } as AbandonedCheckout);
        }

        return { abandonedCheckouts: list };
      }),

      markCheckoutRecovered: (id) => set((state) => ({
        abandonedCheckouts: state.abandonedCheckouts.map(c => 
          c.id === id ? { ...c, status: 'Recovered' } : c
        )
      })),

      updateCheckoutStatus: (id, status) => set((state) => ({
        abandonedCheckouts: state.abandonedCheckouts.map(c => 
          c.id === id ? { ...c, status } : c
        )
      })),

      verifyOrder: (orderId) => set((state) => {
        // Clear any fake report if previously marked
        const filteredReports = state.fakeReports.filter(r => r.orderId !== orderId);
        
        // If already in verifiedOrders, keep it, else add it
        const nextVerified = state.verifiedOrders.includes(orderId) 
          ? state.verifiedOrders 
          : [...state.verifiedOrders, orderId];
          
        return {
          verifiedOrders: nextVerified,
          fakeReports: filteredReports
        };
      }),

      getRiskInfo: (phoneNumber) => {
        const risks = get().customerRisks;
        return risks[phoneNumber] || { phoneNumber, warningCount: 0, riskScore: 0 };
      },

      resetAll: () => set({
        fakeReports: [],
        abandonedCheckouts: demoAbandoned,
        customerRisks: {},
        verifiedOrders: []
      })
    }),
    {
      name: 'fake-order-storage'
    }
  )
);
