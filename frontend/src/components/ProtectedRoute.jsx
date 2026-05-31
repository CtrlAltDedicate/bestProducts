import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <span className="spinner" style={{ borderTopColor: '#1a2744', borderColor: 'rgba(26,39,68,0.2)' }} />
      </div>
    )
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />
}
