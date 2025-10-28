
  # 🌟 Vision Fitness Tracker  
  **Aplicación de Creación y Seguimiento de Rutinas con IA**

  > Una aplicación **full-stack moderna** que permite a los usuarios **crear, guardar y seguir rutinas de entrenamiento** de forma eficiente, con comentarios y recomendaciones personalizadas generadas por **Inteligencia Artificial (Gemini)**.

  ---

  ## 🎯 Demo y Acceso Rápido

  🚀 **Aplicación Desplegada en la Nube**  
  - 🌐 **Frontend:** [https://vision-fitness-tracker-frontend.onrender.com](https://vision-fitness-tracker-frontend.onrender.com)  
  - ⚙️ **API Backend:** [https://vision-fitness-tracker-api.onrender.com](https://vision-fitness-tracker-api.onrender.com)

  🔐 **Credenciales de Prueba**
    Correo: prueba@gmail.com
    Contraseña: 12345678

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
| ☁️ **Despliegue** | Render | Hosting gratuito para el frontend y backend. |

---

## ⚙️ Arquitectura y Despliegue

📦 **Monorepo Estructurado** con dos servicios independientes:

| Servicio | Tipo | Carpeta | Descripción |
|-----------|------|----------|-------------|
| 🧩 **Frontend** | Static Site | `/frontend` | Compilado con Vite, interfaz React. |
| ⚙️ **Backend** | Web Service | `/backend` | Servidor Express, autenticación JWT y conexión a Supabase. |

---

## ⚠️ Nota sobre el Despliegue Gratuito

> El backend está alojado en el **plan gratuito de Render**.

🕒 **Modo Sleep:**  
El servidor entra en reposo tras 15 minutos sin tráfico.  
➡️ **Impacto:** La primera petición tras ese tiempo puede tardar **30-60 segundos**.  

💡 **Propósito:** Demuestra la comprensión de las **limitaciones de infraestructura cloud** y la toma de decisiones **costo-efectivas** en proyectos de portfolio.

---

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
