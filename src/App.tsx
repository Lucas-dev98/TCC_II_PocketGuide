/**
 * App.tsx - Root component of Pocket Guide
 * Sets up navigation, authentication flow, and global providers
 */

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "./hooks/useAuth";
import { LoadingSpinner } from "./components/LoadingSpinner";

// Screens
import { LoginScreen } from "./screens/LoginScreen";
import { OnboardingQuiz } from "./screens/OnboardingQuiz";
import { HomeScreen } from "./screens/HomeScreen";
import { CreateTripScreen } from "./screens/CreateTripScreen";
import { TripDetailScreen } from "./screens/TripDetailScreen";
import { MapDayScreen } from "./screens/MapDayScreen";

const Stack = createNativeStackNavigator();

export const App: React.FC = () => {
  const { user, loading: authLoading } = useAuth();

  // Determine which screen to show based on auth state
  if (authLoading) {
    return (
      <LoadingSpinner
        message="Loading..."
        fullScreen
      />
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          // Unauthenticated stack
          <Stack.Group>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Onboarding" component={OnboardingQuiz} />
          </Stack.Group>
        ) : (
          // Authenticated stack
          <Stack.Group>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="CreateTrip" component={CreateTripScreen} />
            <Stack.Screen name="TripDetail" component={TripDetailScreen} />
            <Stack.Screen name="MapDay" component={MapDayScreen} />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
