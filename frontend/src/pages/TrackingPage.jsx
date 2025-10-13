import React from 'react';
import { useParams } from 'react-router-dom';

const TrackingPage = () => {
  const { routineId } = useParams();

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ textAlign: 'center' }}>Seguimiento de Rutina</h1>
      <p style={{ textAlign: 'center' }}>
        Estás siguiendo la rutina con ID: <strong>{routineId}</strong>
      </p>
      <p style={{ textAlign: 'center', marginTop: '20px', fontStyle: 'italic' }}>
        (Funcionalidad de seguimiento en construcción)
      </p>
    </div>
  );
};

export default TrackingPage;
