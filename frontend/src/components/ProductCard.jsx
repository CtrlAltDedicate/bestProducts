import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './ProductCard.css'

export default function ProductCard({ product, onEdit, onDelete }) {
  const { user } = useAuth()
  const isOwner = user?.username === product.created_by || user?.is_staff

  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`}>
        <div className="product-image">
          {product.image_url
            ? <img src={product.image_url} alt={product.title} loading="lazy" />
            : <div className="image-placeholder">No Image</div>
          }
        </div>
        <div className="product-info">
          <span className="product-category">{product.category}</span>
          <h3 className="product-title">{product.title}</h3>
          <div className="product-meta">
            <span className="product-price">£{parseFloat(product.price).toFixed(2)}</span>
            <span className="product-stock">Stock: {product.stock}</span>
          </div>
        </div>
      </Link>

      {isOwner && (
        <div className="product-actions">
          <button className="btn-ghost" onClick={() => onEdit(product)}>Edit</button>
          <button className="btn-danger" onClick={() => onDelete(product)}>Delete</button>
        </div>
      )}
    </div>
  )
}
