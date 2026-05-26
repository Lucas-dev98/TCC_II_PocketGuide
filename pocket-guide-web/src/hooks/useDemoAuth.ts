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
  photoURL: "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%231e293b'/%3E%3Cstop offset='100%25' stop-color='%23334155'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='150' height='150' rx='75' fill='url(%23g)'/%3E%3Ctext x='75' y='86' text-anchor='middle' font-size='54' fill='%23f8fafc' font-family='Arial,sans-serif'%3ED%3C/text%3E%3C/svg%3E",
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
