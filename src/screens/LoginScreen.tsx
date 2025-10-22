/**
 * LoginScreen - Initial login screen with Google Sign-In
 * User logs in with their Google account
 * Falls back to demo mode if Firebase Auth fails (e.g., Expo Go)
 */

import React, { useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  SafeAreaView,
  Platform,
} from "react-native";
import { useAuth } from "../hooks/useAuth";
import { useDemoAuth } from "../hooks/useDemoAuth";

export const LoginScreen: React.FC = () => {
  const { loginWithGoogle, loading } = useAuth();
  const { loginWithGoogle: demoLogin, loading: demoLoading } = useDemoAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showDemoButton, setShowDemoButton] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setErrorMessage(null);
      await loginWithGoogle();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Login failed";
      setErrorMessage(errorMsg);
      
      // Show demo mode button if Firebase Auth fails on mobile
      if (
        (errorMsg.includes("Component auth") || 
         errorMsg.includes("runtime not ready") ||
         errorMsg.includes("auth")) &&
        Platform.OS !== "web"
      ) {
        setShowDemoButton(true);
      }
    }
  };

  const handleDemoLogin = async () => {
    try {
      setErrorMessage(null);
      await demoLogin();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Demo login failed");
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

        {/* Demo Mode Button for Mobile (when Firebase fails) */}
        {showDemoButton && (
          <TouchableOpacity
            style={[styles.demoButton, demoLoading && styles.buttonDisabled]}
            onPress={handleDemoLogin}
            disabled={demoLoading}
          >
            <Text style={styles.demoButtonText}>
              {demoLoading ? "Loading..." : "📱 Try Demo Mode"}
            </Text>
          </TouchableOpacity>
        )}

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
  demoButton: {
    backgroundColor: "#10B981",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#059669",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  googleButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  demoButtonText: {
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
