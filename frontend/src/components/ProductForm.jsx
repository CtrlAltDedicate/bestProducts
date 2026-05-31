import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import api from '../api/axios'

export default function ProductForm({ product, onSuccess, onClose }) {
  const isEdit = !!product

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: product || {},
  })

  useEffect(() => {
    reset(product || {})
  }, [product, reset])

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await api.put(`/products/${product.id}/`, data)
      } else {
        await api.post('/products/', data)
      }
      onSuccess()
      onClose()
    } catch (err) {
      alert(err.response?.data?.message || 'Something went wrong.')
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEdit ? 'Edit Product' : 'Add Product'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label>Title *</label>
            <input
              {...register('title', { required: 'Title is required' })}
              placeholder="Product title"
            />
            {errors.title && <p className="error-text">{errors.title.message}</p>}
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="Product description"
            />
          </div>

          <div className="form-group">
            <label>Price (£) *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              {...register('price', { required: 'Price is required', min: 0 })}
              placeholder="0.00"
            />
            {errors.price && <p className="error-text">{errors.price.message}</p>}
          </div>

          <div className="form-group">
            <label>Category *</label>
            <input
              {...register('category', { required: 'Category is required' })}
              placeholder="e.g. electronics"
            />
            {errors.category && <p className="error-text">{errors.category.message}</p>}
          </div>

          <div className="form-group">
            <label>Stock</label>
            <input
              type="number"
              min="0"
              {...register('stock')}
              placeholder="0"
            />
          </div>

          <div className="form-group">
            <label>Image URL</label>
            <input
              {...register('image_url')}
              placeholder="https://..."
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting && <span className="spinner" />}
              {isEdit ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
