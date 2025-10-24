import { Timestamp } from "firebase/firestore";

/**
 * Firestore Document Types (Mirrors the interface types but with Firestore timestamps)
 */

export interface FirestoreUser {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  tags: string[];
  createdAt: Timestamp;
}

export interface FirestoreTrip {
  id: string;
  userId: string;
  destination: string;
  startDate: Timestamp;
  endDate: Timestamp;
  attractions: FirestoreAttraction[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FirestoreAttraction {
  id: string;
  day: number;
  time: string;
  name: string;
  duration: number;
  reason: string;
  tip?: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  order?: number;
}
