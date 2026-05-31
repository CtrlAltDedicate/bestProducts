import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import './Dashboard.css'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ total: 0, stockValue: 0, categories: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/products/')
      .then(({ data }) => {
        const products = data.data
        const total = products.length
        const stockValue = products.reduce(
          (sum, p) => sum + parseFloat(p.price) * p.stock, 0
        )
        const categories = new Set(products.map((p) => p.category)).size
        setStats({ total, stockValue, categories })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <Navbar />
      <main className="page-container">
        <div className="dashboard-welcome">
          <h1>Welcome back, <span>{user?.username}</span> 👋</h1>
          <p>Here's an overview of your product catalogue.</p>
        </div>

        {loading ? (
          <div className="loading-row"><span className="spinner" style={{ borderTopColor: '#1a2744', borderColor: 'rgba(26,39,68,0.2)' }} /></div>
        ) : (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📦</div>
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total Products</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💷</div>
              <div className="stat-value">£{stats.stockValue.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <div className="stat-label">Total Stock Value</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🏷️</div>
              <div className="stat-value">{stats.categories}</div>
              <div className="stat-label">Categories</div>
            </div>
          </div>
        )}

        <div className="quick-links">
          <h2>Quick Actions</h2>
          <div className="quick-links-grid">
            <Link to="/products" className="quick-link-card">
              <span className="quick-icon">🛍️</span>
              <strong>Browse Products</strong>
              <p>View, search, edit and manage your product catalogue</p>
            </Link>
            <Link to="/import" className="quick-link-card">
              <span className="quick-icon">📥</span>
              <strong>Import Products</strong>
              <p>Fetch products from the Fakestore API in one click</p>
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
