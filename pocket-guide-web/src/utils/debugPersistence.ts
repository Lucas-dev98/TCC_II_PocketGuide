/**
 * Debug script to check all data persistence
 * Run this in browser console to debug data persistence issues
 */

export const debugDataPersistence = {
  // Check localStorage
  checkLocalStorage: () => {
    console.group('📊 LocalStorage Check');
    const keys = Object.keys(localStorage);
    console.log('Total keys:', keys.length);
    keys.forEach(key => {
      try {
        const value = localStorage.getItem(key);
        const size = new Blob([value || '']).size;
        console.log(`  ${key}: ${size} bytes`);
        if (key.includes('trip')) {
          console.log(`    Content preview:`, value?.substring(0, 100));
        }
      } catch (e) {
        console.log(`  ${key}: [Error reading]`);
      }
    });
    console.groupEnd();
  },

  // Check sessionStorage
  checkSessionStorage: () => {
    console.group('📊 SessionStorage Check');
    const keys = Object.keys(sessionStorage);
    console.log('Total keys:', keys.length);
    keys.forEach(key => {
      const value = sessionStorage.getItem(key);
      const size = new Blob([value || '']).size;
      console.log(`  ${key}: ${size} bytes`);
    });
    console.groupEnd();
  },

  // Check IndexedDB
  checkIndexedDB: async () => {
    console.group('📊 IndexedDB Check');
    try {
      const databases = await (window.indexedDB as any).databases?.();
      if (databases) {
        console.log('Databases:', databases);
        for (const db of databases) {
          console.log(`  - ${db.name}`);
        }
      } else {
        console.log('indexedDB.databases() not supported');
      }
    } catch (e) {
      console.error('Error checking IndexedDB:', e);
    }
    console.groupEnd();
  },

  // Check Zustand store state
  checkZustandState: (storeName: string) => {
    console.group(`📊 Zustand Store: ${storeName}`);
    // This would need the store to be exported
    console.log('(Check in React DevTools or store directly)');
    console.groupEnd();
  },

  // Full diagnosis
  fullDiagnosis: async function() {
    console.clear();
    console.log('🔍 FULL DATA PERSISTENCE DIAGNOSIS');
    console.log('================================\n');
    
    this.checkLocalStorage();
    console.log('\n');
    
    this.checkSessionStorage();
    console.log('\n');
    
    await this.checkIndexedDB();
    console.log('\n');
    
    console.log('📋 Summary:');
    console.log('  - Check browser DevTools → Application tab');
    console.log('  - Check Network tab for Firestore requests');
    console.log('  - Check Console for error logs');
  }
};

// Export for console access
(window as any).debugPersistence = debugDataPersistence;

console.log('✅ Debug persistence script loaded. Use window.debugPersistence.fullDiagnosis()');
