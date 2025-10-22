/**
 * Firebase Configuration and Services
 * This will handle authentication, Firestore operations, and offline sync
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

// Validate Firebase config
console.warn('🔧 Firebase Config Keys:', {
  apiKey: firebaseConfig.apiKey ? '✅ Present' : '❌ Missing',
  authDomain: firebaseConfig.authDomain ? '✅ Present' : '❌ Missing',
  projectId: firebaseConfig.projectId ? '✅ Present' : '❌ Missing',
  measurementId: firebaseConfig.measurementId ? '✅ Present' : '❌ Missing',
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (for web tracking - optional for mobile)
if (typeof window !== 'undefined') {
  try {
    getAnalytics(app);
  } catch (error) {
    // Analytics might not be available in all environments
    console.debug('Analytics not available:', error);
  }
}

// Initialize Authentication
export const auth = getAuth(app);

// Initialize Google Provider
export const googleProvider = new GoogleAuthProvider();

// Initialize Firestore
export const db = getFirestore(app);

export default app;
