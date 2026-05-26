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
import { 
  getAuth, 
  GoogleAuthProvider,
  browserLocalPersistence,
  setPersistence,
  signInWithPopup,
  signInWithRedirect,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const fallbackFirebaseConfig = {
  apiKey: 'dev-api-key',
  authDomain: 'localhost',
  projectId: 'pocket-guide-dev',
  storageBucket: 'pocket-guide-dev.appspot.com',
  messagingSenderId: '000000000000',
  appId: '1:000000000000:web:dev',
  measurementId: '',
};

/**
 * Validate Firebase configuration at startup
 */
const validateFirebaseConfig = (): boolean => {
  const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'appId'] as const;
  const missingKeys = requiredKeys.filter(key => !firebaseConfig[key]);
  
  if (missingKeys.length > 0) {
    console.warn('⚠️ Missing Firebase config keys, using local fallback mode:', missingKeys);
    return false;
  }
  
  console.info('✅ Firebase config validated successfully');
  return true;
};

const hasValidFirebaseConfig = validateFirebaseConfig();
const resolvedFirebaseConfig = hasValidFirebaseConfig ? firebaseConfig : fallbackFirebaseConfig;

const getRuntimeHost = (): string => {
  if (typeof window === 'undefined') {
    return 'server'
  }
  return window.location.host
}

const logFirebaseRuntimeDiagnostics = (): void => {
  console.info('Firebase runtime diagnostics', {
    host: getRuntimeHost(),
    projectId: resolvedFirebaseConfig.projectId,
    authDomain: resolvedFirebaseConfig.authDomain,
    apiKeyPrefix: resolvedFirebaseConfig.apiKey?.slice(0, 8),
    usingFallbackConfig: !hasValidFirebaseConfig,
  })
}

// Initialize Firebase
let app;
try {
  app = initializeApp(resolvedFirebaseConfig);
  console.info(hasValidFirebaseConfig ? '🔥 Firebase initialized successfully' : 'ℹ️ Firebase initialized in fallback mode');
  logFirebaseRuntimeDiagnostics()
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  throw new Error('Failed to initialize Firebase');
}

/**
 * Initialize Analytics (web only)
 */
const initAnalytics = () => {
  console.info('ℹ️ Firebase Analytics disabled in local development')
};

initAnalytics();

// Initialize Authentication
export const isFirebaseConfigured = hasValidFirebaseConfig;
export const auth = isFirebaseConfigured ? getAuth(app) : ({ currentUser: null } as any);

if (isFirebaseConfigured) {
  // Keep session across reloads and redirect-based sign-in flows.
  setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.warn('⚠️ Failed to set Firebase auth persistence:', error)
  })
}

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
    const host = typeof window !== 'undefined' ? window.location.hostname : '';
    const unauthorizedDomainMessage = host
      ? `Domínio não autorizado no Firebase Auth (${host}). Adicione este domínio em Authentication > Settings > Authorized domains.`
      : 'Domínio não autorizado no Firebase Auth. Adicione este domínio em Authentication > Settings > Authorized domains.';

    const errorMap: Record<string, string> = {
      'auth/popup-blocked': 'Pop-up foi bloqueado. Permita pop-ups no navegador.',
      'auth/popup-closed-by-user': 'Pop-up foi fechado.',
      'auth/cancelled-popup-request': 'Autenticação foi cancelada.',
      'auth/unauthorized-domain': unauthorizedDomainMessage,
      'auth/operation-not-supported-in-this-environment': 'Método de autenticação não suportado neste ambiente.',
      'auth/multi-factor-auth-required': 'Sua conta exige autenticação multifator. Conclua o segundo fator para continuar o login.',
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

/**
 * Google Sign-In Function
 */
export const signInWithGoogle = async () => {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase não configurado. Configure as variáveis VITE_FIREBASE_* no .env.local.');
  }

  try {
    // Prefer popup on web: more reliable for local dev and MFA account challenges.
    const result = await signInWithPopup(auth, googleProvider)
    return result.user
  } catch (error) {
    const code = error && typeof error === 'object' && 'code' in error
      ? (error as { code?: string }).code
      : undefined

    const shouldFallbackToRedirect =
      code === 'auth/popup-blocked' ||
      code === 'auth/operation-not-supported-in-this-environment'

    if (
      shouldFallbackToRedirect
    ) {
      await signInWithRedirect(auth, googleProvider)
      return null
    }

    const errorMessage = handleAuthError(error);
    console.error('❌ Google sign-in failed:', {
      message: errorMessage,
      host: getRuntimeHost(),
      projectId: resolvedFirebaseConfig.projectId,
      authDomain: resolvedFirebaseConfig.authDomain,
    });
    throw new Error(errorMessage);
  }
};

/**
 * Sign Out Function
 */
export const signOut = async () => {
  if (!isFirebaseConfigured) {
    console.info('ℹ️ Firebase não configurado, logout local concluído');
    return;
  }

  try {
    await firebaseSignOut(auth);
    console.info('✅ Sign out successful');
  } catch (error) {
    const errorMessage = handleAuthError(error);
    console.error('❌ Sign out failed:', errorMessage);
    throw new Error(errorMessage);
  }
};

export default app;
