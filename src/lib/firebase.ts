import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import firebaseConfig from "../../firebase-applet-config.json";

// Dynamically read VITE_ environment variables to enable custom production configurations on live domains
const metaEnv = (import.meta as any).env || {};
const envConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY,
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID,
  appId: metaEnv.VITE_FIREBASE_APP_ID,
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID,
  firestoreDatabaseId: metaEnv.VITE_FIREBASE_FIRESTORE_DATABASE_ID || metaEnv.VITE_FIREBASE_DB_ID
};

const finalConfig = {
  apiKey: envConfig.apiKey || firebaseConfig.apiKey,
  authDomain: envConfig.authDomain || firebaseConfig.authDomain,
  projectId: envConfig.projectId || firebaseConfig.projectId,
  appId: envConfig.appId || firebaseConfig.appId,
  storageBucket: envConfig.storageBucket || firebaseConfig.storageBucket,
  messagingSenderId: envConfig.messagingSenderId || firebaseConfig.messagingSenderId,
  firestoreDatabaseId: envConfig.firestoreDatabaseId || (firebaseConfig as any).firestoreDatabaseId
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
    // throw new Error(errorMsg);
  }
}
