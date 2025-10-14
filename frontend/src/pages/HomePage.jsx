import React, { useState } from 'react';
import apiClient from '../api/apiClient.js';
import RoutineDisplay from '../components/RoutineDisplay.jsx';

function HomePage() {
  const [userProfile, setUserProfile] = useState({
    age: '',
    gender: '',
    weight_kg: '',
    height_cm: '',
    fitness_level: '',
    available_days: 4,
  });
  const [goal, setGoal] = useState('');
  const [routine, setRoutine] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = e => {
    const { name, value } = e.target;
    setUserProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setRoutine(null);
    setSuccessMessage('');
    try {
      const response = await apiClient.post('/routine/generate', {
        userProfile: {
          ...userProfile,
          age: Number(userProfile.age),
          weight_kg: Number(userProfile.weight_kg),
          height_cm: Number(userProfile.height_cm),
          available_days: Number(userProfile.available_days),
        },
        goal,
      });
      setRoutine(response.data);
    } catch (err) {
      setError('Error al generar rutina');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRoutine = async (routineToSave) => {
    setLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      const response = await apiClient.post('/routine/save', routineToSave);
      setSuccessMessage(response.data.message);
    } catch (err) {
      setError('Error al guardar la rutina');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateNew = () => {
    setRoutine(null);
    setGoal('');
    setUserProfile({
      age: '',
      gender: '',
      weight_kg: '',
      height_cm: '',
      fitness_level: '',
      available_days: 4,
    });
  };

  return (
    <div>
      <h1>Generación de Rutina con IA</h1>
      {!routine ? (
        <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
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
            <input type="text" value={goal} onChange={e => setGoal(e.target.value)} placeholder="Ej: Perder peso, ganar músculo" required />
          </div>
          <button type="submit" disabled={loading}>Generar rutina</button>
        </form>
      ) : (
        <div style={{ marginTop: 20 }}>
          <h3>Rutina generada:</h3>
          <RoutineDisplay routineData={routine} onSave={handleSaveRoutine} onGenerateNew={handleGenerateNew} />
        </div>
      )}
      {loading && <p>Generando...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
    </div>
  );
}

export default HomePage;