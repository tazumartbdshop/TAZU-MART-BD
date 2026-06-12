import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import firebaseConfig from "../../firebase-applet-config.json";

// Dynamically read VITE_ environment variables to enable custom production configurations on live domains
// We use direct static references to import.meta.env so that Vite's compiler can statically replace them during build time
// @ts-ignore
const envApiKey = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_FIREBASE_API_KEY : undefined;
// @ts-ignore
const envAuthDomain = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_FIREBASE_AUTH_DOMAIN : undefined;
// @ts-ignore
const envProjectId = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_FIREBASE_PROJECT_ID : undefined;
// @ts-ignore
const envAppId = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_FIREBASE_APP_ID : undefined;
// @ts-ignore
const envStorageBucket = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_FIREBASE_STORAGE_BUCKET : undefined;
// @ts-ignore
const envMessagingSenderId = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID : undefined;
// @ts-ignore
const envFirestoreDatabaseId = typeof import.meta !== 'undefined' && import.meta.env ? (import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || import.meta.env.VITE_FIREBASE_DB_ID) : undefined;

const envConfig = {
  apiKey: envApiKey,
  authDomain: envAuthDomain,
  projectId: envProjectId,
  appId: envAppId,
  storageBucket: envStorageBucket,
  messagingSenderId: envMessagingSenderId,
  firestoreDatabaseId: envFirestoreDatabaseId
};

const windowConfig = typeof window !== 'undefined' ? ((window as any).__FIREBASE_CONFIG__ || {}) : {};

// Support local storage overrides for the Firebase Configuration Audit feature
const storageConfigStr = typeof window !== 'undefined' ? localStorage.getItem('__FIREBASE_CONFIG_OVERRIDE__') : null;
const storageConfig = storageConfigStr ? JSON.parse(storageConfigStr) : {};

const isLiveDomain = typeof window !== 'undefined' && (
  window.location.hostname === 'tazumartbd.com' || 
  window.location.hostname === 'www.tazumartbd.com' ||
  window.location.hostname.endsWith('.tazumartbd.com')
);

const finalProjectId = storageConfig.projectId || windowConfig.projectId || envConfig.projectId || (isLiveDomain ? "tazu-mart-bd-dfcda" : firebaseConfig.projectId);

const finalConfig = {
  apiKey: storageConfig.apiKey || windowConfig.apiKey || envConfig.apiKey || firebaseConfig.apiKey,
  // Ensure authDomain is exactly <project-id>.firebaseapp.com if using custom auth configs
  authDomain: storageConfig.authDomain || windowConfig.authDomain || envConfig.authDomain || (isLiveDomain ? "tazu-mart-bd-dfcda.firebaseapp.com" : (finalProjectId ? `${finalProjectId}.firebaseapp.com` : firebaseConfig.authDomain)),
  projectId: finalProjectId,
  appId: storageConfig.appId || windowConfig.appId || envConfig.appId || firebaseConfig.appId,
  storageBucket: storageConfig.storageBucket || windowConfig.storageBucket || envConfig.storageBucket || (isLiveDomain ? "tazu-mart-bd-dfcda.firebasestorage.app" : firebaseConfig.storageBucket),
  messagingSenderId: storageConfig.messagingSenderId || windowConfig.messagingSenderId || envConfig.messagingSenderId || firebaseConfig.messagingSenderId,
  firestoreDatabaseId: storageConfig.firestoreDatabaseId || windowConfig.firestoreDatabaseId || envConfig.firestoreDatabaseId || (firebaseConfig as any).firestoreDatabaseId
};

const app = initializeApp(finalConfig);

export const db = finalConfig.firestoreDatabaseId 
  ? getFirestore(app, finalConfig.firestoreDatabaseId)
  : getFirestore(app);

export const auth = getAuth(app);

export const storage = getStorage(app);
storage.maxUploadRetryTime = 4000;
storage.maxOperationRetryTime = 4000;

export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): void {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  
  const errorMsg = JSON.stringify(errInfo);
  if (errInfo.error.includes('Quota limit exceeded')) {
    console.warn("Firestore Quota Exceeded. Some data may not load.");
  } else {
    console.error('Firestore Error: ', errorMsg);
  }
}
