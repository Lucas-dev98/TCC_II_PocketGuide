/**
 * Firestore Diagnostics Utility
 * 
 * Use this in the browser console to diagnose Firestore issues
 * 
 * Example:
 * window.firebaseDiagnostics.checkFirestoreCache()
 * window.firebaseDiagnostics.verifyDeletion('trip-id-here')
 */

import { db } from '../services/firebase';
import { getDoc, doc, collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export const firebaseDiagnostics = {
  /**
   * Check if a specific document exists in Firestore
   */
  async checkDocument(tripId: string) {
    console.log(`\n🔍 Checking document: trips/${tripId}`);
    try {
      const docRef = doc(db, 'trips', tripId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        console.log('✅ Document EXISTS:');
        console.log(docSnap.data());
        return docSnap.data();
      } else {
        console.log('❌ Document DOES NOT EXIST');
        return null;
      }
    } catch (error) {
      console.error('Error checking document:', error);
    }
  },

  /**
   * List all trips for current user
   */
  async listUserTrips() {
    console.log('\n📋 Listing all trips for current user');
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        console.error('❌ Not authenticated');
        return [];
      }

      console.log('👤 Current user:', user.uid);

      const q = query(
        collection(db, 'trips'),
        where('userId', '==', user.uid)
      );

      const snapshot = await getDocs(q);
      console.log(`📚 Found ${snapshot.size} trips`);

      const trips: any[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`  - [${doc.id}] ${data.destination}`);
        trips.push({ id: doc.id, ...data });
      });

      return trips;
    } catch (error) {
      console.error('Error listing trips:', error);
      return [];
    }
  },

  /**
   * Check Firestore cache status
   */
  async checkFirestoreCache() {
    console.log('\n💾 Checking Firestore Cache Status');
    try {
      // List current trips to verify cache state
      const trips = await this.listUserTrips();
      return trips;
    } catch (error) {
      console.error('Error checking cache:', error);
    }
  },

  /**
   * Verify a trip was actually deleted
   */
  async verifyDeletion(tripId: string) {
    console.log(`\n🔎 Verifying deletion for trip: ${tripId}`);
    
    // Check immediately
    console.log('Checking immediately...');
    let result1 = await this.checkDocument(tripId);
    
    // Check after 1 second
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('\nChecking after 1 second...');
    let result2 = await this.checkDocument(tripId);
    
    // Check after 3 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('\nChecking after 3 seconds...');
    let result3 = await this.checkDocument(tripId);
    
    console.log('\n📊 Deletion Verification Summary:');
    console.log('  Immediate:', result1 ? '❌ Still exists' : '✅ Deleted');
    console.log('  After 1s: ', result2 ? '❌ Still exists' : '✅ Deleted');
    console.log('  After 3s: ', result3 ? '❌ Still exists' : '✅ Deleted');
    
    return {
      immediate: result1 ? false : true,
      after1s: result2 ? false : true,
      after3s: result3 ? false : true,
    };
  },

  /**
   * Full system diagnostic
   */
  async fullDiagnostic() {
    console.clear();
    console.log('🔍 FIRESTORE FULL DIAGNOSTIC');
    console.log('================================\n');
    
    // 1. Check authentication
    const auth = getAuth();
    const user = auth.currentUser;
    console.log('👤 Authentication Status:');
    if (user) {
      console.log('  ✅ User is logged in');
      console.log('  UID:', user.uid);
      console.log('  Email:', user.email);
    } else {
      console.log('  ❌ No user logged in');
      return;
    }

    // 2. List all trips
    console.log('\n📋 Current Trips in Firestore:');
    await this.listUserTrips();
    
    console.log('\n✅ Diagnostic complete. Check console for details.');
  },
};

// Expose to window for console access
declare global {
  interface Window {
    firebaseDiagnostics: typeof firebaseDiagnostics;
  }
}

if (typeof window !== 'undefined') {
  (window as any).firebaseDiagnostics = firebaseDiagnostics;
}
