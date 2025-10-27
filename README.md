🌟 Vision Fitness Tracker | Aplicación de Creación y Seguimiento de Rutinas
Vision Fitness Tracker es una aplicación full-stack moderna diseñada para que los usuarios puedan crear, guardar y seguir sus rutinas de entrenamiento de forma eficiente además de que la IA haga comentarios y recomendaciones en función del Usuario.
Esta solución demuestra habilidades completas de desarrollo web, desde el frontend interactivo hasta el backend robusto con autenticación y gestión de bases de datos.

🎯 Demo y Acceso Rápido
La aplicación está desplegada en la nube y es totalmente funcional.
Aplicación Web (Frontend). https://vision-fitness-tracker-frontend.onrender.com
API Backend (Servidor). https://vision-fitness-tracker-api.onrender.com

Credenciales de Prueba (Para una revisión inmediata)
Para que los revisores prueben la funcionalidad completa de la creación y gestión de rutinas:
prueba@gmail.com
12345678

💡 Características Principales
  -Este proyecto se enfoca en demostrar las siguientes funcionalidades y capacidades de desarrollo:
  -Autenticación Segura (JWT): Gestión completa de usuarios (Registro/Login) y protección de rutas del backend mediante JSON Web Tokens.
  -Creación Dinámica de Rutinas: Interfaz intuitiva para nombrar rutinas y añadir ejercicios con series, repeticiones y peso.
  -Gestión de Datos Persistente: Las rutinas y los datos de usuario se almacenan en una base de datos PostgreSQL alojada en Supabase.
  -Componentes Avanzados de UI: Uso de selectores de fecha (@mui/x-date-pickers) y organización de la interfaz con Material-UI (MUI).
  -Arquitectura Desacoplada: El frontend y el backend están desplegados como servicios independientes, comunicándose mediante una API RESTful.
  -Inteligencia Artificial Integrada : Capacidad para utilizar un modelo de IA (integración con Gemini) para generar recomendaciones de entrenamiento personalizadas o crear rutinas basadas en los objetivos del usuario.
  -Visualización de Datos con Gráficos: Integración de librerías de gráficos (ej., Recharts) para visualizar el progreso del usuario, el volumen de entrenamiento o la consistencia, mejorando el seguimiento y la toma de decisiones.
  -Manejo de Estructuras de Datos JSON : Almacenamiento y manipulación de las rutinas de ejercicio como objetos JSON complejos en la base de datos, permitiendo flexibilidad y escalabilidad en la estructura de los entrenamientos (series, repeticiones, peso, etc.).

💻 Stack Tecnológico (Habilidades Clave)
Área    	        Tecnología	                        Propósito y Juicio de Ingeniería
Frontend	        React (Vite)	                      Construcción de la interfaz de usuario con un build rápido y alto rendimiento.
Frontend          Styling	                            Material-UI (MUI)	Sistema de diseño profesional para asegurar consistencia y diseño responsive.
Backend (API)     Node.js con Express	Servidor        API RESTful para manejar la lógica de negocio, autenticación y comunicación con la DB.
Base de Datos	    Supabase (PostgreSQL)            	  Almacenamiento relacional de datos de rutinas y usuarios, por su robustez y escalabilidad.
HTTP Client      	Axios	                              Cliente HTTP moderno para manejo de peticiones y interceptores de tokens JWT.
Despliegue	      Render	                            Alojamiento en la nube de forma gratuita, gestionando el Static Site y el Web Service (Express).

⚙️ Arquitectura y Despliegue
El proyecto se gestiona como un repositorio único (monorepo) que aloja dos servicios independientes en Render:
Frontend	 Static Site	frontend/	Compilado por Vite; sirve la interfaz React.
Backend    Web Service	backend/	Servidor Express que gestiona la lógica, JWT y la conexión a Supabase.

⚠️ Nota sobre el Despliegue Gratuito (Conciencia de Costos)
El servicio de Backend está alojado en el plan gratuito de Render. Como resultado, el servidor de la API entrará en modo de inactividad (sleep) después de 15 minutos sin tráfico.
Impacto: La primera solicitud HTTP después de este tiempo puede tardar 30 a 60 segundos mientras el servidor se reinicia.
Demostración: Esto demuestra la comprensión de las limitaciones de la infraestructura en la nube y la toma de decisiones costo-efectivas para proyectos de portfolio.




🛠️ Cómo Iniciar el Proyecto Localmente
Para ejecutar y contribuir al proyecto en tu máquina local:
1.Clonar el Repositorio:
git clone https://github.com/luisjimenez011/vision-fitness-tracker
cd vision-fitness-tracker

2.Configurar Backend (Servidor Express):
cd backend/
npm install
npm start

3.Configurar Frontend (React):
cd ../frontend/
npm install
npm run dev
