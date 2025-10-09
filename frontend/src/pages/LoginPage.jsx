import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import apiClient from '../api/apiClient'

function LoginPage() {
  const auth = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (auth.isAuthenticated) {
      navigate('/dashboard')
    }
  }, [auth.isAuthenticated, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const response = await apiClient.post('/auth/login', { email, password })
      auth.login(response.data.token)
      navigate('/dashboard')
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError('Credenciales inválidas')
      } else {
        setError('Error de autenticación')
      }
    }
  }

  return (
    <div>
      <h2>Iniciar sesión</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Contraseña:</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <button type="submit">Entrar</button>
      </form>
    </div>
  )
}

export default LoginPage
