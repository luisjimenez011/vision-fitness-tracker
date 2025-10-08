# AGENTE DE DESARROLLO PRINCIPAL: ARQUITECTO DE SOFTWARE SENIOR

Este documento define el **contrato de calidad y las restricciones arquitectónicas** para toda generación de código. El objetivo es un producto escalable, seguro y fácil de mantener.

---

## 1. Reglas de Oro y Estándares de Codificación

Cualquier fragmento de código, configuración o documentación generada debe adherirse estrictamente a estas reglas:

### 1.1. Calidad del Código y Estilo
* **Lenguaje Base:** El código de Backend es **Node.js (JavaScript/CommonJS)**.
* **Tipado:** Utilizar la convención **JSDoc** para tipar explícitamente las entradas, salidas, y tipos de las funciones, clases y métodos.
* **Formato:** Adherirse a las reglas definidas en **`.eslintrc`** y **`.prettierrc`** (comillas simples, sangría de 2 espacios).
* **Principios:** Seguir el **Principio de Responsabilidad Única (SRP)**. Cada módulo debe hacer solo una cosa.

### 1.2. Seguridad
* **SQL Injection:** Todas las consultas a la base de datos PostgreSQL deben utilizar **sentencias parametrizadas** (`$1`, `$2`, etc.) a través de la librería `pg`.
* **Contraseñas:** El almacenamiento debe usar **`bcrypt`** con un factor de trabajo (salt) alto (mínimo 10 rondas).
* **API Keys:** Las claves sensibles (Gemini, etc.) deben ser cargadas **exclusivamente** desde variables de entorno (`process.env.VARIABLE_NAME`).

---

## 2. Arquitectura de Capas (Backend - Node.js/Express)

La aplicación sigue el patrón de **Capas Separadas**. Ninguna capa debe comunicarse directamente con una capa no adyacente (ej., un Controller nunca llama a un Repository).

### 2.1. Capa de Repositorios (`/src/repositories`)
* **Propósito:** Acceso exclusivo a la DB (consultas CRUD).
* **Restricción Clave:** Nunca debe contener lógica de negocio, validaciones, ni código de `req`/`res`.
* **Tecnología:** Utiliza la librería `pg`.

### 2.2. Capa de Servicios (`/src/services`)
* **Propósito:** Contiene toda la **Lógica de Negocio** (hashing, lógica de IA, cálculos).
* **Interacción:** Llama a funciones de los Repositories y a la API de **Gemini**.
* **Restricción Clave:** No maneja objetos `req` o `res` de Express. Solo recibe datos purificados.

### 2.3. Capa de Controladores (`/src/controllers`)
* **Propósito:** Interfaz entre Express y la lógica.
* **Tareas:** Maneja `req` y `res`, realiza la **validación de entrada (con Joi)** y gestiona las respuestas HTTP (200, 201, 400, 500).
* **Restricción Clave:** Llama directamente a la Capa de Servicios.

---

## 3. Contratos de Datos y IA

### 3.1. Validación de Entrada
* Toda entrada del usuario (`req.body`, `req.query`, `req.params`) en los **Controladores** debe ser validada usando la librería **Joi** antes de pasarla a la Capa de Servicios.

### 3.2. Integración de la IA (Gemini)
* La IA debe ser utilizada para generar **JSON Estructurado**.
* El código de la Capa de Servicios que llama a Gemini debe forzar el output a seguir la interfaz definida en `/context/routine_json_interface.ts`.

---

## 4. Estructura de Proyecto y Referencias

* **Rutas:** Todas las rutas de la API deben comenzar con `/api/` (ej. `POST /api/auth/register`).
* **Contexto:** Para obtener detalles sobre la estructura de la base de datos y tipados, la IA debe consultar los archivos en la carpeta `/context/`.

---