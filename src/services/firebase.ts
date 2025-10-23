/**
 * Firebase Configuration and Services
 * 
 * Features:
 * - Initialization with validation
 * - Authentication setup with Google provider
 * - Firestore database configuration
 * - Analytics tracking (web only)
 * - Comprehensive error handling
 */

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

/**
 * Validate Firebase configuration at startup
 */
const validateFirebaseConfig = (): boolean => {
  const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'appId'] as const;
  const missingKeys = requiredKeys.filter(key => !firebaseConfig[key]);
  
  if (missingKeys.length > 0) {
    console.error('❌ Missing Firebase config keys:', missingKeys);
    return false;
  }
  
  console.info('✅ Firebase config validated successfully');
  return true;
};

// Validate before initialization
validateFirebaseConfig();

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
  console.info('🔥 Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  throw new Error('Failed to initialize Firebase');
}

/**
 * Initialize Analytics (web only)
 */
const initAnalytics = () => {
  try {
    if (typeof window !== 'undefined') {
      getAnalytics(app);
      console.info('📊 Firebase Analytics initialized');
    }
  } catch (error) {
    console.debug('ℹ️ Analytics not available:', error);
  }
};

initAnalytics();

// Initialize Authentication
export const auth = getAuth(app);

/**
 * Configure Google Auth Provider
 */
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Initialize Firestore
export const db = getFirestore(app);

/**
 * Helper function to handle Firestore errors
 */
export const handleFirestoreError = (error: unknown): string => {
  if (error && typeof error === 'object' && 'code' in error) {
    const fbError = error as { code: string; message?: string };
    const errorMap: Record<string, string> = {
      'permission-denied': 'Você não tem permissão para acessar isso.',
      'not-found': 'Documento não encontrado.',
      'already-exists': 'Este documento já existe.',
      'resource-exhausted': 'Limite de requisições excedido.',
      'failed-precondition': 'Pré-condição falhou.',
      'unavailable': 'Serviço indisponível no momento.',
      'internal': 'Erro interno do servidor.',
      'unauthenticated': 'Você precisa estar autenticado.',
    };
    return errorMap[fbError.code] || fbError.message || 'Erro ao acessar dados';
  }
  return error instanceof Error ? error.message : 'Erro desconhecido';
};

/**
 * Helper function to handle Auth errors
 */
export const handleAuthError = (error: unknown): string => {
  if (error && typeof error === 'object' && 'code' in error) {
    const authError = error as { code: string; message?: string };
    const errorMap: Record<string, string> = {
      'auth/popup-blocked': 'Pop-up foi bloqueado. Permita pop-ups no navegador.',
      'auth/popup-closed-by-user': 'Pop-up foi fechado.',
      'auth/cancelled-popup-request': 'Autenticação foi cancelada.',
      'auth/operation-not-allowed': 'Operação não permitida.',
      'auth/network-request-failed': 'Erro de rede. Verifique sua conexão.',
      'auth/account-exists-with-different-credential': 'Conta já existe com outro provedor.',
      'auth/invalid-email': 'Email inválido.',
      'auth/user-disabled': 'Usuário desabilitado.',
      'auth/user-not-found': 'Usuário não encontrado.',
      'auth/wrong-password': 'Senha incorreta.',
      'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
    };
    return errorMap[authError.code] || authError.message || 'Erro na autenticação';
  }
  return error instanceof Error ? error.message : 'Erro desconhecido';
};

export default app;
