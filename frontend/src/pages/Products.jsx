import { useEffect, useState } from 'react'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import ProductCard from '../components/ProductCard'
import ProductForm from '../components/ProductForm'
import './Products.css'

export default function Products() {
  const [products, setProducts] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editProduct, setEditProduct] = useState(null)

  const fetchProducts = () => {
    api.get('/products/')
      .then(({ data }) => {
        setProducts(data.data)
        setFiltered(data.data)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchProducts() }, [])

  // Client-side search filter
  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(
      products.filter(
        (p) => p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
      )
    )
  }, [search, products])

  const handleEdit = (product) => {
    setEditProduct(product)
    setShowForm(true)
  }

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.title}"? This cannot be undone.`)) return
    try {
      await api.delete(`/products/${product.id}/`)
      fetchProducts()
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed.')
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditProduct(null)
  }

  return (
    <>
      <Navbar />
      <main className="page-container">
        <div className="products-header">
          <h1>Products</h1>
          <button className="btn-primary" onClick={() => setShowForm(true)}>+ Add Product</button>
        </div>

        <div className="search-bar">
          <input
            type="search"
            placeholder="Search by title or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <span className="spinner" style={{ borderTopColor: '#1a2744', borderColor: 'rgba(26,39,68,0.2)', width: '2rem', height: '2rem' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <p>{search ? 'No products match your search.' : 'No products yet. Add one or import from Fakestore!'}</p>
          </div>
        ) : (
          <div className="products-grid">
            {filtered.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

      {showForm && (
        <ProductForm
          product={editProduct}
          onSuccess={fetchProducts}
          onClose={handleFormClose}
        />
      )}
    </>
  )
}
