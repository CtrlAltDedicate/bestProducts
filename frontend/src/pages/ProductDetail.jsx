import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import ProductForm from '../components/ProductForm'
import './ProductDetail.css'

export default function ProductDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showEdit, setShowEdit] = useState(false)

  const fetchProduct = () => {
    api.get(`/products/${id}/`)
      .then(({ data }) => setProduct(data.data))
      .catch(() => navigate('/products'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchProduct() }, [id])

  const isOwner = user?.username === product?.created_by || user?.is_staff

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${product.title}"?`)) return
    try {
      await api.delete(`/products/${id}/`)
      navigate('/products')
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed.')
    }
  }

  if (loading) return (
    <>
      <Navbar />
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <span className="spinner" style={{ borderTopColor: '#1a2744', borderColor: 'rgba(26,39,68,0.2)', width: '2rem', height: '2rem' }} />
      </div>
    </>
  )

  return (
    <>
      <Navbar />
      <main className="page-container">
        <button className="btn-ghost back-btn" onClick={() => navigate('/products')}>← Back to Products</button>

        <div className="detail-card card">
          <div className="detail-image">
            {product.image_url
              ? <img src={product.image_url} alt={product.title} />
              : <div className="image-placeholder">No Image</div>
            }
          </div>

          <div className="detail-info">
            <span className="product-category">{product.category}</span>
            <h1>{product.title}</h1>
            <p className="detail-price">£{parseFloat(product.price).toFixed(2)}</p>
            <p className="detail-description">{product.description || 'No description provided.'}</p>

            <div className="detail-meta">
              <div><span>Stock</span><strong>{product.stock} units</strong></div>
              <div><span>Added by</span><strong>{product.created_by}</strong></div>
              <div><span>Created</span><strong>{new Date(product.created_at).toLocaleDateString()}</strong></div>
              {product.fakestore_id && <div><span>Source</span><strong>Fakestore API (#{product.fakestore_id})</strong></div>}
            </div>

            {isOwner && (
              <div className="detail-actions">
                <button className="btn-secondary" onClick={() => setShowEdit(true)}>Edit Product</button>
                <button className="btn-danger" onClick={handleDelete}>Delete</button>
              </div>
            )}
          </div>
        </div>
      </main>

      {showEdit && (
        <ProductForm
          product={product}
          onSuccess={fetchProduct}
          onClose={() => setShowEdit(false)}
        />
      )}
    </>
  )
}
