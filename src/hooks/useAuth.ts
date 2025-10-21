/**
 * useAuth Hook - Manages user authentication state and operations
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
import { User } from "../types";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Login with Google
   */
  const loginWithGoogle = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;

      // Create or update user in Firestore
      const userRef = doc(db, "users", fbUser.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        // First time login - create user profile
        await setDoc(userRef, {
          uid: fbUser.uid,
          email: fbUser.email,
          name: fbUser.displayName || "User",
          photoURL: fbUser.photoURL || "",
          tags: [],
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
      }

      // Update local state
      setFirebaseUser(fbUser);
      setUser({
        uid: fbUser.uid,
        email: fbUser.email || "",
        name: fbUser.displayName || "User",
        photoURL: fbUser.photoURL || "",
        tags: userDoc.exists() ? (userDoc.data().tags || []) : [],
        createdAt: new Date(),
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Login failed";
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Logout
   */
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await signOut(auth);
      setUser(null);
      setFirebaseUser(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Logout failed";
      setError(errorMsg);
      throw err;
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
        if (firebaseUser) {
          const userRef = doc(db, "users", firebaseUser.uid);
          await setDoc(
            userRef,
            {
              tags,
              updatedAt: Timestamp.now(),
            },
            { merge: true }
          );

          // Update local state
          if (user) {
            setUser({ ...user, tags });
          }
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to update tags";
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [firebaseUser, user]
  );

  /**
   * Check authentication status on mount
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      try {
        if (fbUser) {
          setFirebaseUser(fbUser);

          // Fetch user data from Firestore
          const userRef = doc(db, "users", fbUser.uid);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              uid: fbUser.uid,
              email: fbUser.email || "",
              name: fbUser.displayName || userData.name || "User",
              photoURL: fbUser.photoURL || userData.photoURL || "",
              tags: userData.tags || [],
              createdAt: userData.createdAt ? userData.createdAt.toDate() : new Date(),
            });
          } else {
            // User not in Firestore yet (shouldn't happen after login)
            setUser({
              uid: fbUser.uid,
              email: fbUser.email || "",
              name: fbUser.displayName || "User",
              photoURL: fbUser.photoURL || "",
              tags: [],
              createdAt: new Date(),
            });
          }
        } else {
          setUser(null);
          setFirebaseUser(null);
        }
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Failed to check auth status";
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
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
