# 🧩 C4 – Nivel 3: Diagrama de Componentes  
## Sistema: ERP Iglesias (Backend)

---

## 📌 Propósito de esta vista

El Diagrama de Componentes describe la estructura interna del contenedor Backend del sistema ERP Iglesias, permitiendo identificar cómo se organizan las responsabilidades y cómo interactúan los diferentes componentes del sistema.

Esta vista responde:

- ¿Cómo está estructurada internamente la API?
- ¿Cómo fluye una solicitud dentro del backend?
- ¿Cómo se distribuye la lógica de negocio?

---

## 🧩 Visión general del backend

El backend sigue una arquitectura en capas, organizada de la siguiente manera:
Controller → Service → Repository → Database


Esta estructura permite separar responsabilidades y mantener un bajo acoplamiento entre los componentes.

---

## 🧱 Componentes identificados

### 🔹 Controllers (Capa de presentación)

Componentes responsables de exponer los endpoints REST y recibir solicitudes HTTP.

- **Auth Controller**
  - Maneja autenticación de usuarios
  - Genera tokens JWT

- **User Controller**
  - Gestiona operaciones CRUD de usuarios

- **Course Controller**
  - Gestiona cursos e inscripciones

- **Payment Controller**
  - Gestiona pagos y ofrendas

📌 Función clave:
Actuar como punto de entrada al sistema.

---

### 🔹 Services (Capa de negocio)

Contienen la lógica de negocio del sistema.

- **Auth Service**
  - Validación de credenciales
  - Generación de tokens

- **User Service**
  - Reglas de negocio de usuarios
  - Validaciones

- **Course Service**
  - Lógica de cursos e inscripciones

- **Payment Service**
  - Procesamiento de pagos

📌 Función clave:
Coordinar operaciones y aplicar reglas del dominio.

---

### 🔹 Repository Layer (Capa de persistencia)

Encapsula el acceso a la base de datos mediante JPA.

📌 Responsabilidades:
- Lectura de datos
- Escritura de datos
- Abstracción de la persistencia

---

### 🔹 Database

Sistema de almacenamiento PostgreSQL.

📌 Contiene:
- Usuarios  
- Iglesias  
- Cursos  
- Inscripciones  
- Pagos y ofrendas  

---

### 🔹 Frontend (SPA)

Aplicación Angular que consume la API.

📌 Función:
- Enviar solicitudes HTTP
- Mostrar resultados al usuario

---

## 🔗 Flujo de interacción

El flujo de ejecución dentro del sistema es:

1. El frontend envía una solicitud HTTP al backend  
2. El Controller correspondiente recibe la solicitud  
3. El Controller delega la operación al Service  
4. El Service ejecuta la lógica de negocio  
5. El Service accede al Repository  
6. El Repository interactúa con la base de datos  
7. La respuesta retorna en sentido inverso  

---

## 🧠 Análisis arquitectónico

Este diseño evidencia:

### ✔ Separación de responsabilidades
Cada capa tiene una función claramente definida.

### ✔ Bajo acoplamiento
Los componentes se comunican mediante interfaces bien definidas.

### ✔ Alta cohesión
Cada componente está enfocado en una responsabilidad específica.

### ✔ Escalabilidad
Permite evolucionar cada capa sin afectar las demás.

---

## ⚖️ Alcance del modelo

### ✔ Incluye
- Componentes del backend  
- Relaciones entre capas  
- Flujo de ejecución  

### ❌ No incluye
- Clases específicas  
- Métodos o atributos  
- Detalles de implementación  

---

## 🧪 Supuestos realizados

- Cada dominio (auth, user, course, payment) sigue el mismo patrón de capas  
- La base de datos es accedida únicamente mediante repositorios  
- El frontend no accede directamente a la base de datos  
- La lógica de negocio reside exclusivamente en los servicios  

---

## 🧱 Relación con otros niveles C4

- Nivel 1 (Contexto): Actores y sistema  
- Nivel 2 (Contenedores): Estructura tecnológica  
- Nivel 3 (Componentes): Estructura interna del backend ← *este nivel*  

---

## 🎯 Conclusión

El Diagrama de Componentes evidencia una arquitectura limpia y bien estructurada, basada en principios de separación de responsabilidades y diseño en capas.

Este enfoque permite mantener el sistema organizado, facilitar su evolución y asegurar que cada componente cumpla un rol específico dentro del backend.