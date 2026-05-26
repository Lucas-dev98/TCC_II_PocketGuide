import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense, useEffect } from 'react'
import { ThemeProvider } from './contexts/ThemeContext'
import { I18nProvider } from './i18n/I18nContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { RouteLoadingFallback } from './components/RouteLoadingFallback'
import { OfflineIndicator } from './components/OfflineIndicator'
import { WebVitalsDebugger } from './components/WebVitalsDebugger'
import { ErrorBoundary } from './components/ErrorBoundary'
import { cleanupInvalidStorage, logStorageState } from './utils/storageCleanup'
// Import diagnostics for browser console access
import './utils/firestoreDiagnostics'
import './utils/debugPersistence'
import './utils/migrationCleanup'

// Lazy loaded screens for code-splitting
const LoginScreen = lazy(() => import('./screens/LoginScreen'))
const HomeScreen = lazy(() => import('./screens/HomeScreen'))
const CreateTripScreen = lazy(() => import('./screens/CreateTripScreen'))
const TripDetailScreen = lazy(() => import('./screens/TripDetailScreen'))
const DayDetailScreen = lazy(() => import('./screens/DayDetailScreen'))
const SearchResultsScreen = lazy(() => import('./screens/SearchResultsScreen'))
const FavoritesScreen = lazy(() => import('./screens/FavoritesScreen'))
const SecuritySettingsScreen = lazy(() => import('./screens/SecuritySettingsScreen'))

// Import SharedTripView component (non-lazy, shared component)
import { SharedTripView } from './components/SharedTripView'
import { BottomNavigation } from './components/BottomNavigation'

/**
 * App.tsx - Aplicação principal com routing
 * 
 * Estrutura:
 * - /login ........................... LoginScreen (público)
 * - /home ............................ HomeScreen (protegido)
 * - /create-trip .................... CreateTripScreen (protegido)
 * - /trip/:id ....................... TripDetailScreen (protegido)
 * - /trip/:tripId/day/:dayNumber ... DayDetailScreen (protegido)
 * - /search .......................... SearchResultsScreen (protegido)
 * - /favorites ....................... FavoritesScreen (protegido)
 * - /share/:shareId .................. SharedTripView (público)
 * - / (raiz) ......................... Redireciona para /home ou /login
 */
function App() {
  // Cleanup invalid localStorage data on app initialization
  useEffect(() => {
    const storageCleanupFlag = '__PG_STORAGE_CLEANUP_DONE__'
    if ((window as any)[storageCleanupFlag]) {
      return
    }

    ;(window as any)[storageCleanupFlag] = true
    cleanupInvalidStorage()
    logStorageState()
  }, [])

  return (
    <ErrorBoundary>
      <I18nProvider>
        <ThemeProvider>
          <Router
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <OfflineIndicator />
            <WebVitalsDebugger />
            <Suspense fallback={<RouteLoadingFallback />}>
            <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginScreen />} />

            {/* Protected routes */}
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <HomeScreen />
                </ProtectedRoute>
              }
            />

            <Route
              path="/create-trip"
              element={
                <ProtectedRoute>
                  <CreateTripScreen />
                </ProtectedRoute>
              }
            />

            <Route
              path="/trip/:id"
              element={
                <ProtectedRoute>
                  <TripDetailScreen />
                </ProtectedRoute>
              }
            />

            <Route
              path="/trip/:tripId/day/:dayNumber"
              element={
                <ProtectedRoute>
                  <DayDetailScreen />
                </ProtectedRoute>
              }
            />

            <Route
              path="/search"
              element={
                <ProtectedRoute>
                  <SearchResultsScreen />
                </ProtectedRoute>
              }
            />

            <Route
              path="/favorites"
              element={
                <ProtectedRoute>
                  <FavoritesScreen />
                </ProtectedRoute>
              }
            />

            <Route
              path="/security"
              element={
                <ProtectedRoute>
                  <SecuritySettingsScreen />
                </ProtectedRoute>
              }
            />

            {/* Public shared trip view */}
            <Route
              path="/share/:shareId"
              element={<SharedTripView />}
            />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/home" replace />} />

            {/* 404 */}
            <Route
              path="*"
              element={
                <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                      404
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      Página não encontrada
                    </p>
                    <a
                      href="/home"
                      className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Voltar para Home
                    </a>
                  </div>
                </div>
              }
            />
          </Routes>
          <BottomNavigation />
          </Suspense>
        </Router>
      </ThemeProvider>
      </I18nProvider>
    </ErrorBoundary>
  )
}

export default App
