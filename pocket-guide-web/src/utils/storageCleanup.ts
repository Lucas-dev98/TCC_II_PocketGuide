/**
 * Storage Cleanup Utility
 * 
 * Removes invalid data from localStorage that may cause persistence issues
 * This should be called once on app initialization
 */

/**
 * Limpa dados inválidos do localStorage
 * - Remove 'trips' que não deveria estar persistido
 * - Mantém dados válidos como auth tokens, favorites, etc
 */
export const cleanupInvalidStorage = (): void => {
  try {
    // Remove trips data if it exists - trips should always come from Firestore
    if (localStorage.getItem('trips')) {
      console.warn('⚠️ Removendo dados de trips do localStorage (devem vir do Firestore)')
      localStorage.removeItem('trips')
    }

    // Verifica se há dados corrompidos no trips-store
    const tripsStoreData = localStorage.getItem('trips-store')
    if (tripsStoreData) {
      try {
        const parsed = JSON.parse(tripsStoreData)
        // Se trips-store contém trips no estado persistido, remove
        if (parsed.state && parsed.state.trips && Array.isArray(parsed.state.trips) && parsed.state.trips.length > 0) {
          console.warn('⚠️ Removendo trips persistidas inválidas de trips-store')
          localStorage.removeItem('trips-store')
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
  } catch (error) {
    console.error('❌ Erro ao limpar localStorage:', error)
  }
}

/**
 * Log do estado do localStorage para debug
 */
export const logStorageState = (): void => {
  try {
    console.log('📊 Storage State:')
    console.log('- trips:', localStorage.getItem('trips') ? 'present' : 'absent')
    console.log('- trips-store:', localStorage.getItem('trips-store') ? 'present' : 'absent')
    console.log('- favorites-storage:', localStorage.getItem('favorites-storage') ? 'present' : 'absent')
    console.log('- auth_token:', localStorage.getItem('auth_token') ? 'present' : 'absent')
  } catch (error) {
    console.error('❌ Erro ao verificar localStorage:', error)
  }
}
