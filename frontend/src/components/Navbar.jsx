import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path ? 'active' : ''

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/dashboard">
          <span className="brand-icon">🛒</span>
          <span className="brand-name">BestProducts</span>
        </Link>
      </div>

      <div className="navbar-links">
        <Link to="/dashboard" className={isActive('/dashboard')}>Dashboard</Link>
        <Link to="/products" className={isActive('/products')}>Products</Link>
        <Link to="/import" className={isActive('/import')}>Import</Link>
      </div>

      <div className="navbar-user">
        <span className="username">👤 {user?.username}</span>
        <button className="btn-ghost" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  )
}
