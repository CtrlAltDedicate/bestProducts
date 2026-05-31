import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import './Auth.css'

export default function Register() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm()
  const password = watch('password')

  const onSubmit = async (data) => {
    setError('')
    try {
      const { data: res } = await api.post('/auth/register/', data)
      login({ access: res.data.access, refresh: res.data.refresh }, res.data.user)
      navigate('/dashboard')
    } catch (err) {
      const detail = err.response?.data
      if (typeof detail === 'object' && detail !== null) {
        const first = Object.values(detail)[0]
        setError(Array.isArray(first) ? first[0] : first)
      } else {
        setError('Registration failed. Please try again.')
      }
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>🛒 BestProducts</h1>
          <p>Create your account</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label>Username</label>
            <input
              {...register('username', { required: 'Username is required' })}
              placeholder="Choose a username"
              autoComplete="username"
            />
            {errors.username && <p className="error-text">{errors.username.message}</p>}
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              {...register('email', { required: 'Email is required' })}
              placeholder="your@email.com"
              autoComplete="email"
            />
            {errors.email && <p className="error-text">{errors.email.message}</p>}
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Minimum 8 characters' } })}
              placeholder="At least 8 characters"
              autoComplete="new-password"
            />
            {errors.password && <p className="error-text">{errors.password.message}</p>}
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              {...register('password2', {
                required: 'Please confirm your password',
                validate: (val) => val === password || 'Passwords do not match',
              })}
              placeholder="Repeat your password"
              autoComplete="new-password"
            />
            {errors.password2 && <p className="error-text">{errors.password2.message}</p>}
          </div>

          <button type="submit" className="btn-primary auth-submit" disabled={isSubmitting}>
            {isSubmitting && <span className="spinner" />}
            Create Account
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
