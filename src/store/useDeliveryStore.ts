import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CourierAPI {
  id: string;
  name: string;
  apiUrl: string;
  apiKey: string;
  secretKey: string;
  clientId: string;
  storeId: string;
  username: string;
  password: string;
  status: 'active' | 'inactive';
}

export interface DivisionCharge {
  id: string;
  name: string;
  charge: number;
}

interface DeliveryStore {
  courierApis: CourierAPI[];
  divisionCharges: DivisionCharge[];
  
  updateCourierApi: (id: string, updates: Partial<CourierAPI>) => void;
  updateDivisionCharge: (id: string, charge: number) => void;
  getActiveCourier: () => CourierAPI | undefined;
  getChargeByDivision: (divisionName: string) => number;
}

export const useDeliveryStore = create<DeliveryStore>()(
  persist(
    (set, get) => ({
      courierApis: [
        { id: 'pathao', name: 'Pathao Courier', apiUrl: '', apiKey: '', secretKey: '', clientId: '', storeId: '', username: '', password: '', status: 'inactive' },
        { id: 'steadfast', name: 'SteadFast', apiUrl: '', apiKey: '', secretKey: '', clientId: '', storeId: '', username: '', password: '', status: 'inactive' },
        { id: 'redx', name: 'RedX', apiUrl: '', apiKey: '', secretKey: '', clientId: '', storeId: '', username: '', password: '', status: 'inactive' },
        { id: 'sundarban', name: 'Sundarban', apiUrl: '', apiKey: '', secretKey: '', clientId: '', storeId: '', username: '', password: '', status: 'active' },
        { id: 'ecourier', name: 'eCourier', apiUrl: '', apiKey: '', secretKey: '', clientId: '', storeId: '', username: '', password: '', status: 'inactive' },
        { id: 'paperfly', name: 'Paperfly', apiUrl: '', apiKey: '', secretKey: '', clientId: '', storeId: '', username: '', password: '', status: 'inactive' },
      ],
      divisionCharges: [
        { id: '1', name: 'Dhaka', charge: 80 },
        { id: '2', name: 'Chattogram', charge: 120 },
        { id: '3', name: 'Rajshahi', charge: 150 },
        { id: '4', name: 'Khulna', charge: 150 },
        { id: '5', name: 'Barishal', charge: 150 },
        { id: '6', name: 'Sylhet', charge: 150 },
        { id: '7', name: 'Rangpur', charge: 150 },
        { id: '8', name: 'Mymensingh', charge: 150 },
      ],

      updateCourierApi: (id, updates) => set((state) => ({
        courierApis: state.courierApis.map((api) => 
          api.id === id ? { ...api, ...updates } : updates.status === 'active' ? { ...api, status: 'inactive' } : api
        )
      })),

      updateDivisionCharge: (id, charge) => set((state) => ({
        divisionCharges: state.divisionCharges.map((div) => 
          div.id === id ? { ...div, charge } : div
        )
      })),

      getActiveCourier: () => get().courierApis.find(api => api.status === 'active'),
      
      getChargeByDivision: (divisionName) => {
        const div = get().divisionCharges.find(d => d.name === divisionName);
        return div ? div.charge : 0;
      }
    }),
    { name: 'tazu-delivery-storage' }
  )
);
