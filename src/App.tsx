/**
 * App.tsx - Root component with Authentication, Navigation, and Error Handling
 */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from './hooks/useAuth';
import { ErrorBoundary } from './components/ErrorBoundary';

// Screens
import { LoginScreen } from './screens/LoginScreen';
import { OnboardingQuiz } from './screens/OnboardingQuiz';
import { HomeScreen } from './screens/HomeScreen';
import { CreateTripScreen } from './screens/CreateTripScreen';
import { TripDetailScreen } from './screens/TripDetailScreen';
import { MapDayScreen } from './screens/MapDayScreen';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          // Unauthenticated stack
          <Stack.Group>
            <Stack.Screen name="Login" component={LoginScreen} />
          </Stack.Group>
        ) : (
          // Authenticated stack
          <Stack.Group>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Onboarding" component={OnboardingQuiz} />
            <Stack.Screen name="CreateTrip" component={CreateTripScreen} />
            <Stack.Screen name="TripDetail" component={TripDetailScreen} />
            <Stack.Screen name="MapDay" component={MapDayScreen} />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Log to external service if available (e.g., Sentry)
        console.error('App Error Boundary:', error, errorInfo);
      }}
    >
      <AppNavigator />
    </ErrorBoundary>
  );
}
