/**
 * Migration Script: Clean Old Trips with UUID IDs
 * 
 * Problema: Trips criados antes do fix tinham IDs locais (UUID) que não correspondem
 * aos IDs no Firestore. Esses precisam ser limpados.
 * 
 * Uso no console:
 * 1. Copiar e colar todo este arquivo no console do navegador
 * 2. Executar: await window.migrateOldTrips()
 */

import { db } from '../services/firebase';
import { useTripsStore } from '../store/tripsStore';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export const migrateOldTrips = async () => {
  console.log('🔄 Iniciando migração de trips antigos...\n');

  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      console.error('❌ Usuário não autenticado');
      return;
    }

    console.log(`👤 Usuário: ${user.uid}\n`);

    // 1. Detectar trips locais com UUIDs (antigos)
    const localTrips = useTripsStore.getState().trips;
    const oldTripsLocal = localTrips.filter(trip => trip.id.includes('-'));

    console.log(`📊 Trips locais com UUID encontrados: ${oldTripsLocal.length}`);
    if (oldTripsLocal.length > 0) {
      oldTripsLocal.forEach(trip => {
        console.log(`  - ❌ ${trip.id.substring(0, 8)}... : ${trip.destination}`);
      });
    }

    // 2. Verificar Firestore para trips do usuário
    console.log(`\n📚 Consultando Firestore...\n`);

    const q = query(
      collection(db, 'trips'),
      where('userId', '==', user.uid)
    );

    const snapshot = await getDocs(q);
    console.log(`📊 Trips em Firestore: ${snapshot.size}`);

    const tripSummary: any = {};
    snapshot.forEach(doc => {
      const data = doc.data();
      const tripId = doc.id;
      // ID com '-' é NOVO (após fix), sem '-' é ANTIGO (antes do fix)
      const isNew = tripId.includes('-');

      if (!tripSummary[isNew ? 'novo' : 'antigo']) {
        tripSummary[isNew ? 'novo' : 'antigo'] = [];
      }
      tripSummary[isNew ? 'novo' : 'antigo'].push({
        id: tripId.substring(0, 8),
        destination: data.destination,
      });
    });

    console.log('\n📋 Distribuição em Firestore:');
    if (tripSummary['antigo']) {
      console.log(`  ⚠️  Sem UUID (antigos/quebrados): ${tripSummary['antigo'].length}`);
      tripSummary['antigo'].forEach((t: any) => {
        console.log(`     - ${t.id}... : ${t.destination}`);
      });
    }

    if (tripSummary['novo']) {
      console.log(`  ✅ Com UUID (novos após fix): ${tripSummary['novo'].length}`);
      tripSummary['novo'].forEach((t: any) => {
        console.log(`     - ${t.id}... : ${t.destination}`);
      });
    }

    // 3. Oferecer limpeza
    console.log(`\n🧹 Opções de limpeza:\n`);
    console.log('a) Limpar trips do Firestore com IDs antigos (sem UUID):');
    console.log('   await window.deleteOldFirestoreTrips()\n');
    console.log('b) Sincronizar estado local com Firestore:');
    console.log('   await window.syncLocalWithFirestore()\n');
    console.log('c) Ambas as ações:');
    console.log('   await window.cleanupAllOldTrips()\n');

  } catch (error) {
    console.error('❌ Erro na migração:', error);
  }
};

/**
 * Delete old trips from Firestore (those without UUID in ID)
 */
export const deleteOldFirestoreTrips = async () => {
  console.log('🗑️  Deletando trips antigos do Firestore...\n');

  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      console.error('❌ Usuário não autenticado');
      return;
    }

    const q = query(
      collection(db, 'trips'),
      where('userId', '==', user.uid)
    );

    const snapshot = await getDocs(q);
    const oldTrips = [];

    for (const docSnap of snapshot.docs) {
      const tripId = docSnap.id;
      // Se o ID NÃO tem traço, é antigo (foram criados pelo Firestore antes do fix)
      // IDs novos têm '-' (são UUIDs gerados localmente)
      if (!tripId.includes('-')) {
        oldTrips.push({
          id: tripId,
          destination: docSnap.data().destination,
        });

        // Delete do Firestore
        await deleteDoc(doc(db, 'trips', tripId));
        console.log(`✅ Deletado: ${tripId.substring(0, 8)}... (${docSnap.data().destination})`);
      }
    }

    console.log(`\n📊 Total deletado do Firestore: ${oldTrips.length}`);
    if (oldTrips.length === 0) {
      console.log('ℹ️  Nenhum trip antigo encontrado. Sua base de dados está limpa!');
    }
  } catch (error) {
    console.error('❌ Erro ao deletar trips antigos:', error);
  }
};

/**
 * Sync local state with Firestore (reload all trips from Firestore)
 */
export const syncLocalWithFirestore = async () => {
  console.log('🔄 Sincronizando estado local com Firestore...\n');

  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      console.error('❌ Usuário não autenticado');
      return;
    }

    // Reload trips from Firestore
    await useTripsStore.getState().loadTrips(user.uid);

    const trips = useTripsStore.getState().trips;
    console.log(`✅ Sincronizado! ${trips.length} trips carregados do Firestore`);

    trips.forEach(trip => {
      const hasUUID = trip.id.includes('-');
      const status = hasUUID ? '⚠️ UUID' : '✅ Novo';
      console.log(`  ${status}: ${trip.id.substring(0, 8)}... (${trip.destination})`);
    });
  } catch (error) {
    console.error('❌ Erro ao sincronizar:', error);
  }
};

/**
 * Complete cleanup: delete old Firestore trips AND sync local state
 */
export const cleanupAllOldTrips = async () => {
  console.log('🧹 Executando limpeza completa...\n');

  try {
    // 1. Delete old trips from Firestore
    await deleteOldFirestoreTrips();

    // 2. Wait a bit for Firestore to sync
    console.log('\n⏳ Aguardando sincronização do Firestore...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 3. Sync local state
    console.log('\n🔄 Sincronizando estado local...');
    await syncLocalWithFirestore();

    console.log('\n✅ Limpeza completa finalizada!');
  } catch (error) {
    console.error('❌ Erro na limpeza completa:', error);
  }
};

// Expor funções no window
if (typeof window !== 'undefined') {
  (window as any).migrateOldTrips = migrateOldTrips;
  (window as any).deleteOldFirestoreTrips = deleteOldFirestoreTrips;
  (window as any).syncLocalWithFirestore = syncLocalWithFirestore;
  (window as any).cleanupAllOldTrips = cleanupAllOldTrips;
  console.log('✅ Migration script carregado. Use window.migrateOldTrips()');
}
