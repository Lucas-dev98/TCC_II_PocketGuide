/**
 * LoadingSpinner Component - Shows a loading indicator
 * Used throughout the app when data is being fetched
 */

import React from "react";
import {
  StyleSheet,
  ActivityIndicator,
  View,
  Text,
  ViewStyle,
} from "react-native";

interface LoadingSpinnerProps {
  size?: "small" | "large";
  message?: string;
  containerStyle?: ViewStyle;
  fullScreen?: boolean;
}

const LoadingSpinnerComponent: React.FC<LoadingSpinnerProps> = ({
  size = "large",
  message,
  containerStyle,
  fullScreen = false,
}) => {
  const containerStyles = [
    styles.container,
    fullScreen && styles.fullScreen,
    containerStyle,
  ];

  return (
    <View
      style={containerStyles}
      accessibilityLabel="Loading"
      accessibilityRole="progressbar"
      accessibilityLiveRegion="polite"
    >
      <ActivityIndicator
        size={size}
        color="#3B82F6"
        style={styles.spinner}
      />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

const arePropsEqual = (
  prevProps: LoadingSpinnerProps,
  nextProps: LoadingSpinnerProps
) => {
  return (
    prevProps.size === nextProps.size &&
    prevProps.message === nextProps.message &&
    prevProps.fullScreen === nextProps.fullScreen
  );
};

export const LoadingSpinner = React.memo(
  LoadingSpinnerComponent,
  arePropsEqual
);

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 32,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  spinner: {
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 8,
    textAlign: "center",
  },
});
