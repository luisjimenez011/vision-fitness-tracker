import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'
import apiClient from '../api/apiClient.js'

function DashboardPage() {
  const auth = useAuth()
  const navigate = useNavigate()

  const [userProfile, setUserProfile] = useState({
    age: '',
    gender: '',
    weight_kg: '',
    height_cm: '',
    fitness_level: '',
    available_days: 4
  })
  const [goal, setGoal] = useState('')
  const [routine, setRoutine] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = e => {
    const { name, value } = e.target
    setUserProfile(prev => ({ ...prev, [name]: value }))
  }

  const handleGenerateRoutine = async e => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setRoutine(null)
    try {
      const response = await apiClient.post('/routine/generate-routine', {
        userProfile: {
          ...userProfile,
          age: Number(userProfile.age),
          weight_kg: Number(userProfile.weight_kg),
          height_cm: Number(userProfile.height_cm),
          available_days: Number(userProfile.available_days)
        },
        goal
      })
      setRoutine(response.data)
    } catch (err) {
      setError('Error al generar rutina')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    auth.logout()
    navigate('/login')
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <button onClick={handleLogout}>Cerrar Sesión</button>
      <form onSubmit={handleGenerateRoutine} style={{ marginTop: 20 }}>
        <div>
          <label>Edad:</label>
          <input type="number" name="age" value={userProfile.age} onChange={handleChange} required />
        </div>
        <div>
          <label>Género:</label>
          <select name="gender" value={userProfile.gender} onChange={handleChange} required>
            <option value="">Selecciona</option>
            <option value="male">Masculino</option>
            <option value="female">Femenino</option>
            <option value="other">Otro</option>
          </select>
        </div>
        <div>
          <label>Peso (kg):</label>
          <input type="number" name="weight_kg" value={userProfile.weight_kg} onChange={handleChange} required />
        </div>
        <div>
          <label>Altura (cm):</label>
          <input type="number" name="height_cm" value={userProfile.height_cm} onChange={handleChange} required />
        </div>
        <div>
          <label>Nivel de fitness:</label>
          <select name="fitness_level" value={userProfile.fitness_level} onChange={handleChange} required>
            <option value="">Selecciona</option>
            <option value="beginner">Principiante</option>
            <option value="intermediate">Intermedio</option>
            <option value="advanced">Avanzado</option>
          </select>
        </div>
        <div>
          <label>Días disponibles por semana:</label>
          <input type="number" name="available_days" value={userProfile.available_days} onChange={handleChange} min={1} max={7} required />
        </div>
        <div>
          <label>Objetivo:</label>
          <input type="text" value={goal} onChange={e => setGoal(e.target.value)} required />
        </div>
        <button type="submit" disabled={loading}>Generar rutina</button>
      </form>
      {loading && <p>Generando rutina...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {routine && (
        <div style={{ marginTop: 20 }}>
          <h3>Rutina generada:</h3>
          <pre>{JSON.stringify(routine, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}

export default DashboardPage
