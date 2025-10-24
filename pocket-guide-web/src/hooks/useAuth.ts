/**
 * useAuth Hook - Manages user authentication state and operations
 * 
 * Features:
 * - Login with Google (with Firebase error handling)
 * - Logout with proper cleanup
 * - User profile management
 * - Automatic auth state sync
 * - Type-safe operations
 */

import { useState, useEffect, useCallback } from "react";
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { doc, setDoc, getDoc, Timestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "../services/firebase";
import { AuthUser, AuthError } from "../types";

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  /**
   * Parse Firebase auth error into structured error
   */
  const parseAuthError = (error: unknown): AuthError => {
    if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
      // Firebase error object
      const fbError = error as { code: string; message: string };
      return {
        code: fbError.code,
        message: getFirebaseErrorMessage(fbError.code),
        timestamp: new Date(),
      };
    }
    return {
      code: "UNKNOWN_ERROR",
      message: error instanceof Error ? error.message : "An unknown error occurred",
      timestamp: new Date(),
    };
  };

  /**
   * Get user-friendly error message for Firebase error codes
   */
  const getFirebaseErrorMessage = (code: string): string => {
    const errorMap: Record<string, string> = {
      "auth/popup-blocked": "Pop-up foi bloqueado. Por favor, permita pop-ups no seu navegador.",
      "auth/popup-closed-by-user": "Janela de autenticação foi fechada.",
      "auth/cancelled-popup-request": "Autenticação foi cancelada.",
      "auth/operation-not-allowed": "Operação não permitida.",
      "auth/network-request-failed": "Erro de conexão. Verifique sua internet.",
      "auth/account-exists-with-different-credential": "Essa conta já existe com um provedor diferente.",
      "auth/invalid-email": "Email inválido.",
      "auth/user-disabled": "Usuário desabilitado.",
      "auth/user-not-found": "Usuário não encontrado.",
      "auth/wrong-password": "Senha incorreta.",
      "auth/too-many-requests": "Muitas tentativas. Tente novamente mais tarde.",
    };
    return errorMap[code] || "Erro na autenticação. Tente novamente.";
  };

  /**
   * Create user profile in Firestore
   */
  const createUserProfile = async (fbUser: FirebaseUser): Promise<AuthUser> => {
    const userRef = doc(db, "users", fbUser.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      // First time login - create user profile
      const newUser: AuthUser = {
        uid: fbUser.uid,
        email: fbUser.email,
        name: fbUser.displayName || "User",
        photoURL: fbUser.photoURL,
        tags: [],
        createdAt: new Date(),
        lastSignIn: new Date(),
      };

      await setDoc(userRef, {
        uid: fbUser.uid,
        email: fbUser.email,
        name: fbUser.displayName || "User",
        photoURL: fbUser.photoURL || "",
        tags: [],
        createdAt: Timestamp.now(),
        lastSignIn: Timestamp.now(),
      });

      return newUser;
    }

    // Existing user - return from Firestore
    const userData = userDoc.data();
    return {
      uid: fbUser.uid,
      email: fbUser.email,
      name: fbUser.displayName || userData?.name || "User",
      photoURL: fbUser.photoURL,
      tags: userData?.tags || [],
      createdAt: userData?.createdAt?.toDate?.() || new Date(),
      lastSignIn: new Date(),
    };
  };
  /**
   * Login with Google - with comprehensive error handling
   */
  const loginWithGoogle = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;

      if (!fbUser) {
        throw new Error("No user returned from Google sign-in");
      }

      // Create or fetch user profile
      const userProfile = await createUserProfile(fbUser);

      setFirebaseUser(fbUser);
      setUser(userProfile);
    } catch (err) {
      const parsedError = parseAuthError(err);
      setError(parsedError);
      throw parsedError;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Logout - with proper cleanup
   */
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await signOut(auth);
      setUser(null);
      setFirebaseUser(null);
    } catch (err) {
      const parsedError = parseAuthError(err);
      setError(parsedError);
      throw parsedError;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update user profile tags (preferences)
   */
  const updateUserTags = useCallback(
    async (tags: string[]) => {
      try {
        setLoading(true);
        setError(null);

        if (!firebaseUser) {
          throw new Error("No user authenticated");
        }

        const userRef = doc(db, "users", firebaseUser.uid);
        await setDoc(
          userRef,
          {
            tags,
            lastSignIn: Timestamp.now(),
          },
          { merge: true }
        );

        // Update local state
        if (user) {
          setUser({ ...user, tags });
        }
      } catch (err) {
        const parsedError = parseAuthError(err);
        setError(parsedError);
        throw parsedError;
      } finally {
        setLoading(false);
      }
    },
    [firebaseUser, user]
  );

  /**
   * Check authentication status on mount and listen for changes
   */
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    try {
      unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        try {
          if (fbUser) {
            setFirebaseUser(fbUser);

            // Fetch user data from Firestore
            const userRef = doc(db, "users", fbUser.uid);
            const userDoc = await getDoc(userRef);

            if (userDoc.exists()) {
              const userData = userDoc.data();
              const authUser: AuthUser = {
                uid: fbUser.uid,
                email: fbUser.email,
                name: fbUser.displayName || userData?.name || "User",
                photoURL: fbUser.photoURL,
                tags: userData?.tags || [],
                createdAt: userData?.createdAt?.toDate?.() || new Date(),
                lastSignIn: new Date(),
              };
              setUser(authUser);
            } else {
              // User not in Firestore yet
              const authUser: AuthUser = {
                uid: fbUser.uid,
                email: fbUser.email,
                name: fbUser.displayName || "User",
                photoURL: fbUser.photoURL,
                tags: [],
                createdAt: new Date(),
                lastSignIn: new Date(),
              };
              setUser(authUser);
            }
          } else {
            setUser(null);
            setFirebaseUser(null);
          }
        } catch (err) {
          const parsedError = parseAuthError(err);
          setError(parsedError);
        } finally {
          setLoading(false);
        }
      });
    } catch (err: unknown) {
      // Handle Firebase initialization errors (e.g., in Expo Go)
      if (err instanceof Error && err.message.includes("Component auth has not been registered")) {
        console.warn("⚠️ Firebase Auth not available (Expo Go limitation)");
        console.warn("💡 Tip: Use 'npm run web' for Firebase Auth support");
      }
      const parsedError = parseAuthError(err);
      setError(parsedError);
      setLoading(false);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return {
    user,
    firebaseUser,
    loading,
    error,
    loginWithGoogle,
    logout,
    updateUserTags,
  };
};
