import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'

// Screens (a serem importados)
const LoginScreen = () => <div className="flex items-center justify-center min-h-screen">Loading LoginScreen...</div>
const HomeScreen = () => <div className="flex items-center justify-center min-h-screen">Loading HomeScreen...</div>

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/home" element={<HomeScreen />} />
            <Route path="/" element={<Navigate to="/home" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
