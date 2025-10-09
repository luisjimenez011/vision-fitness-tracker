import axios from 'axios';

// 1. Configurar la URL base de tu backend
const apiClient = axios.create({
  baseURL: 'http://localhost:3001/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Interceptor de Solicitud para adjuntar el Token JWT
apiClient.interceptors.request.use(
  (config) => {
    // Obtener el token del localStorage
    const token = localStorage.getItem('token');

    // Si el token existe, lo adjuntamos al header 'Authorization'
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;