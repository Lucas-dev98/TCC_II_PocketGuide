/**
 * useDemoAuth.ts - Demo authentication for Expo Go testing
 * Allows testing without Firebase Auth native modules
 */

import { useState, useCallback } from "react";
import { AuthUser } from "../types";

const DEMO_USER: AuthUser = {
  uid: "demo-user-123",
  email: "demo@pocketguide.app",
  name: "Demo User",
  photoURL: "https://via.placeholder.com/150?text=Demo",
  tags: ["culture", "gastronomy", "adventure"],
  createdAt: new Date(),
  lastSignIn: new Date(),
};

export const useDemoAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(DEMO_USER);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginWithGoogle = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUser(DEMO_USER);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Login failed";
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setUser(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Logout failed";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUserTags = useCallback(async (tags: string[]) => {
    setLoading(true);
    setError(null);
    try {
      if (user) {
        const updatedUser = { ...user, tags };
        setUser(updatedUser);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to update tags";
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    user,
    firebaseUser: null,
    loading,
    error,
    loginWithGoogle,
    logout,
    updateUserTags,
    isAuthenticated: !!user,
  };
};
