import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'

// Screens
import LoginScreen from './screens/LoginScreen'
import HomeScreen from './screens/HomeScreen'
import CreateTripScreen from './screens/CreateTripScreen'
import TripDetailScreen from './screens/TripDetailScreen'

/**
 * App.tsx - Aplicação principal com routing
 * 
 * Estrutura:
 * - /login ........................... LoginScreen (público)
 * - /home ............................ HomeScreen (protegido)
 * - /create-trip .................... CreateTripScreen (protegido)
 * - /trip/:id ....................... TripDetailScreen (protegido)
 * - / (raiz) ......................... Redireciona para /home ou /login
 */
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
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
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
