import { useState } from 'react'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import './ImportProducts.css'

export default function ImportProducts() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const handleImport = async () => {
    setLoading(true)
    setResult(null)
    setError('')

    try {
      const { data } = await api.post('/products/import_from_fakestore/')
      setResult(data)
    } catch (err) {
      setError(err.response?.data?.message || 'Import failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="page-container">
        <div className="import-container card">
          <div className="import-header">
            <span className="import-icon">📥</span>
            <h1>Import from Fakestore API</h1>
          </div>

          <div className="import-description">
            <p>
              The <strong>Fakestore API</strong> (fakestoreapi.com) is a free, open REST API
              that provides 20 sample retail products across categories like electronics,
              jewellery, and clothing. It requires no authentication and is commonly used
              for prototyping and demo applications.
            </p>
            <p>
              Clicking the button below will fetch all products from the Fakestore API and
              save them to your BestProducts catalogue. Products that have already been
              imported will be skipped automatically — so it's safe to run more than once.
            </p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          {result && (
            <div className="alert alert-success">
              ✅ Import complete — <strong>{result.data.imported}</strong> product(s) added,{' '}
              <strong>{result.data.skipped}</strong> already existed.
            </div>
          )}

          <button
            className="btn-primary import-btn"
            onClick={handleImport}
            disabled={loading}
          >
            {loading ? (
              <><span className="spinner" />Importing products...</>
            ) : (
              '🚀 Import from Fakestore API'
            )}
          </button>

          <p className="import-note">
            Source: <code>GET https://fakestoreapi.com/products</code> — no API key required.
          </p>
        </div>
      </main>
    </>
  )
}
