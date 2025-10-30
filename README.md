  # 🌟 Vision Fitness Tracker  
  **Aplicación de Creación y Seguimiento de Rutinas con IA**

  > Una aplicación **full-stack moderna** que permite a los usuarios **crear, guardar y seguir rutinas de entrenamiento** de forma eficiente, con comentarios y recomendaciones personalizadas generadas por **Inteligencia Artificial (Gemini)**.

  ---

  ## 🎯 Demo y Acceso Rápido

  🚀 **Aplicación Desplegada en la Nube**  
  - 🌐 **Frontend:** [https://vision-fitness-tracker.vercel.app](vision-fitness-tracker.vercel.app)  
  - ⚙️ **API Backend:** [https://vision-fitness-tracker-api.vercel.app](vision-fitness-tracker-api.vercel.app)

  🔐 **Credenciales de Prueba**
    Correo: prueba@gmail.com
    Contraseña: 12345678

---
## ⚠️ Advertencia sobre la Estabilidad del Servicio de IA
La funcionalidad principal de la aplicación depende de la API de Gemini (Google) para la generación de rutinas y el análisis avanzado de datos.

Inestabilidad Observada: En ocasiones, la API de Gemini puede responder con errores de sobrecarga de servicio (503 UNAVAILABLE).

➡️ Impacto: Durante estos periodos, las siguientes funciones se verán afectadas temporalmente:
Generación de Rutinas con IA y Análisis avanzado.

---

## 💡 Características Principales

✅ **Autenticación Segura (JWT)**  
Gestión completa de usuarios (registro, login) y protección de rutas mediante **JSON Web Tokens**.

✅ **Creación Dinámica de Rutinas**  
Interfaz intuitiva para nombrar rutinas y añadir ejercicios con series, repeticiones y peso.

✅ **Gestión de Datos Persistente**  
Rutinas y usuarios almacenados en **PostgreSQL (Supabase)**.

✅ **Componentes Avanzados de UI**  
Uso de **Material-UI (MUI)** y **@mui/x-date-pickers** para un diseño moderno y responsivo.

✅ **Arquitectura Desacoplada**  
Frontend y backend desplegados como **servicios independientes** que se comunican mediante **API RESTful**.

✅ **Inteligencia Artificial Integrada (Gemini)**  
Genera recomendaciones personalizadas y rutinas según los objetivos del usuario.

✅ **Visualización de Datos**  
Integración de **Recharts** para mostrar el progreso, volumen de entrenamiento y consistencia.

✅ **Manejo de Estructuras JSON Complejas**  
Rutinas almacenadas como objetos JSON para mayor flexibilidad y escalabilidad.

---

## 💻 Stack Tecnológico

| Área | Tecnología | Descripción |
|------|-------------|-------------|
| 🖥️ **Frontend** | React (Vite) | Interfaz rápida, moderna y optimizada. |
| 🎨 **Estilos** | Material-UI (MUI) | Sistema de diseño profesional y responsive. |
| ⚙️ **Backend (API)** | Node.js + Express | Lógica de negocio, autenticación y conexión a la BD. |
| 🗄️ **Base de Datos** | Supabase (PostgreSQL) | Almacenamiento relacional y escalable. |
| 🔗 **HTTP Client** | Axios | Peticiones HTTP con interceptores de JWT. |
| ☁️ **Despliegue** | Vercel | Hosting Serverless para el frontend y backend. |

---

## ⚙️ Arquitectura y Despliegue

📦 **Monorepo Estructurado** con dos servicios independientes:

| Servicio | Tipo | Carpeta | Descripción |
|-----------|------|----------|-------------|
| 🧩 **Frontend** | Static Site | `/frontend` | Compilado con Vite, interfaz React. |
| ⚙️ **Backend** | Web Service | `/backend` | Servidor Express, autenticación JWT y conexión a Supabase. |

---

## ⚠️ Nota sobre la Arquitectura Serverless (Vercel)

> El backend está desplegado como una **Serverless Function** en el plan gratuito de Vercel.

🕒 **Arranque en Frío (*Cold Start*):** La función Serverless se desactiva tras periodos de inactividad para ahorrar recursos.  
➡️ **Impacto:** La primera petición al backend (`/api/...`) tras un tiempo sin uso experimentará un **"Cold Start"**, lo que puede añadir **2-5 segundos** de latencia a la respuesta inicial.

💡 **Propósito:** Demuestra la comprensión de la **arquitectura Serverless** y el manejo de sus implicaciones (costo-efectividad vs. latencia).

## 🛠️ Cómo Iniciar el Proyecto Localmente

Sigue estos pasos para ejecutar el proyecto en tu entorno local 👇

### 1️⃣ Clonar el Repositorio
git clone https://github.com/luisjimenez011/vision-fitness-tracker
cd vision-fitness-tracker
### 2️⃣ Configurar el Backend (Express)
cd backend/
npm install
npm start
### 3️⃣ Configurar el Frontend (React)
cd ../frontend/
npm install
npm run dev


Desarrollado por Luis Jiménez
