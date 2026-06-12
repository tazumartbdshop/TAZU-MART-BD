import { create } from 'zustand';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

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
  isLoaded: boolean;
  subscribe: () => () => void;
  updateCourierApi: (id: string, updates: Partial<CourierAPI>) => void;
  updateDivisionCharge: (id: string, charge: number) => void;
  getActiveCourier: () => CourierAPI | undefined;
  getChargeByDivision: (divisionName: string) => number;
}

const defaultState: { courierApis: CourierAPI[]; divisionCharges: DivisionCharge[] } = {
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
};

export const useDeliveryStore = create<DeliveryStore>((set, get) => ({
  ...defaultState,
  isLoaded: false,

  subscribe: () => {
    const docRef = doc(db, 'settings', 'delivery');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        set({
          courierApis: data.courierApis ?? defaultState.courierApis,
          divisionCharges: data.divisionCharges ?? defaultState.divisionCharges,
          isLoaded: true
        });
      } else {
        setDoc(docRef, defaultState).then(() => {
          set({ ...defaultState, isLoaded: true });
        }).catch(err => console.error("Initial delivery seed failed:", err));
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/delivery');
    });
    return unsubscribe;
  },

  updateCourierApi: (id, updates) => {
    const nextCourierApis = get().courierApis.map((api) => {
      if (api.id === id) {
        return { ...api, ...updates };
      }
      return updates.status === 'active' ? { ...api, status: 'inactive' as const } : api;
    });

    set({ courierApis: nextCourierApis });
    setDoc(doc(db, 'settings', 'delivery'), { courierApis: nextCourierApis }, { merge: true })
      .catch((err) => handleFirestoreError(err, OperationType.WRITE, 'settings/delivery'));
  },

  updateDivisionCharge: (id, charge) => {
    const nextDivisionCharges = get().divisionCharges.map((div) => 
      div.id === id ? { ...div, charge } : div
    );

    set({ divisionCharges: nextDivisionCharges });
    setDoc(doc(db, 'settings', 'delivery'), { divisionCharges: nextDivisionCharges }, { merge: true })
      .catch((err) => handleFirestoreError(err, OperationType.WRITE, 'settings/delivery'));
  },

  getActiveCourier: () => get().courierApis.find(api => api.status === 'active'),
  
  getChargeByDivision: (divisionName) => {
    const div = get().divisionCharges.find(d => d.name === divisionName);
    return div ? div.charge : 0;
  }
}));
