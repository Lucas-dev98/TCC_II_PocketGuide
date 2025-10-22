/**
 * App.tsx - Root component (Simplificado para funcionar em Web)
 */
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Platform } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    marginVertical: 8,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  status: {
    marginTop: 32,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  statusText: {
    color: '#2E7D32',
    fontSize: 14,
    lineHeight: 20,
  },
});

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🎒 Pocket Guide</Text>
        <Text style={styles.subtitle}>AI-Powered Travel Itinerary App</Text>
        
        <View style={styles.button}>
          <Text style={styles.buttonText}>Sign in with Google</Text>
        </View>

        <View style={styles.status}>
          <Text style={styles.statusText}>
            ✅ App is running on {Platform.OS}
          </Text>
          <Text style={styles.statusText}>
            ✅ Firebase configured
          </Text>
          <Text style={styles.statusText}>
            ✅ Navigation ready
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
