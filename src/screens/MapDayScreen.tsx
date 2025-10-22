/**
 * MapDayScreen.tsx - Map view for a specific day of the trip
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useTripStore } from '../store/tripStore';
import { MapViewer } from '../components/MapViewer';
import { Attraction } from '../types';

export const MapDayScreen: React.FC = () => {
  const route = useRoute();
  const params = route.params as { day: number } | undefined;
  const day = params?.day || 1;
  const { currentTrip } = useTripStore();
  const [dayAttractions, setDayAttractions] = useState<Attraction[]>([]);

  useEffect(() => {
    if (currentTrip) {
      const attractions = currentTrip.attractions
        .filter((a) => a.day === day)
        .sort((a, b) => a.time.localeCompare(b.time));
      setDayAttractions(attractions);
    }
  }, [currentTrip, day]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>� Dia {day}</Text>
        <Text style={styles.subtitle}>
          {dayAttractions.length} {dayAttractions.length === 1 ? 'atração' : 'atrações'}
        </Text>
      </View>

      <MapViewer attractions={dayAttractions} day={day} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
});
