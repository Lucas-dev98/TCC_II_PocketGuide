/**
 * LoginScreen - Initial login screen with Google Sign-In
 * User logs in with their Google account
 */

import React, { useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  SafeAreaView,
} from "react-native";
import { useAuth } from "../hooks/useAuth";

export const LoginScreen: React.FC = () => {
  const { loginWithGoogle, loading } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    try {
      setErrorMessage(null);
      await loginWithGoogle();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Login failed");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo and Title */}
        <View style={styles.header}>
          <Text style={styles.appName}>🎒 Pocket Guide</Text>
          <Text style={styles.tagline}>Your journey. Your way.</Text>
        </View>

        {/* Features List */}
        <View style={styles.featuresContainer}>
          <Text style={styles.sectionTitle}>Create your travel itinerary in 3 minutes</Text>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>⚡</Text>
            <Text style={styles.featureText}>AI-powered personalized routes</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>✏️</Text>
            <Text style={styles.featureText}>Edit manually as you like</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>📍</Text>
            <Text style={styles.featureText}>100% offline functionality</Text>
          </View>
        </View>

        {/* Error Message */}
        {errorMessage && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        {/* Google Sign-In Button */}
        <TouchableOpacity
          style={[styles.googleButton, loading && styles.buttonDisabled]}
          onPress={handleGoogleLogin}
          disabled={loading}
        >
          <Text style={styles.googleButtonText}>
            {loading ? "Signing in..." : "Sign in with Google"}
          </Text>
        </TouchableOpacity>

        {/* Terms and Privacy */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our{" "}
            <Text style={styles.footerLink}>Terms of Service</Text> and{" "}
            <Text style={styles.footerLink}>Privacy Policy</Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
    paddingVertical: 40,
  },
  header: {
    alignItems: "center",
    marginTop: 20,
  },
  appName: {
    fontSize: 36,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: "#6B7280",
  },
  featuresContainer: {
    marginVertical: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 20,
    textAlign: "center",
  },
  feature: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  featureText: {
    fontSize: 15,
    color: "#4B5563",
    flex: 1,
  },
  errorContainer: {
    backgroundColor: "#FEE2E2",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 13,
  },
  googleButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginVertical: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  googleButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    marginTop: 20,
  },
  footerText: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 18,
  },
  footerLink: {
    color: "#3B82F6",
    fontWeight: "600",
  },
});
