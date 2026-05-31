import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import './Auth.css'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()

  const onSubmit = async (data) => {
    setError('')
    try {
      const { data: res } = await api.post('/auth/login/', data)
      login({ access: res.data.access, refresh: res.data.refresh }, res.data.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>🛒 BestProducts</h1>
          <p>Sign in to manage your products</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label>Username</label>
            <input
              {...register('username', { required: 'Username is required' })}
              placeholder="Enter your username"
              autoComplete="username"
            />
            {errors.username && <p className="error-text">{errors.username.message}</p>}
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              {...register('password', { required: 'Password is required' })}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
            {errors.password && <p className="error-text">{errors.password.message}</p>}
          </div>

          <button type="submit" className="btn-primary auth-submit" disabled={isSubmitting}>
            {isSubmitting && <span className="spinner" />}
            Sign In
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  )
}
