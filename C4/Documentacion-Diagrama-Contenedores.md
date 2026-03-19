# 🧱 C4 – Nivel 2: Diagrama de Contenedores  
## Sistema: ERP Iglesias

---

## 📌 Propósito de esta vista

El Diagrama de Contenedores describe cómo está estructurado el sistema ERP Iglesias a nivel tecnológico, identificando los principales bloques ejecutables (contenedores) y las interacciones entre ellos.

Esta vista permite responder:

- ¿Cómo está dividido el sistema internamente?
- ¿Qué tecnologías utiliza cada parte?
- ¿Cómo fluye la información dentro del sistema?

---

## 🧩 Visión general de la arquitectura

ERP Iglesias sigue una arquitectura **cliente-servidor distribuida**, organizada en tres capas principales:


Esta separación permite desacoplar responsabilidades y facilita la escalabilidad y mantenibilidad del sistema.

---

## 📦 Contenedores identificados

### 🔹 Single-Page Application (Frontend)

**Tecnología:** Angular, TypeScript  
**Ejecución:** Navegador del usuario  

**Responsabilidad:**
- Interfaz de usuario del sistema  
- Gestión de autenticación  
- Visualización de información  
- Interacción con el backend  

**Comunicación:**
- Consume la API mediante HTTP/HTTPS  
- Intercambio de datos en formato JSON  

---

### 🔹 API Application (Backend)

**Tecnología:** Java, Spring Boot  
**Tipo:** REST API  

**Responsabilidad:**
- Exposición de servicios REST  
- Implementación de lógica de negocio  
- Gestión de usuarios, cursos, inscripciones y pagos  
- Autenticación mediante JWT  

**Comunicación:**
- Recibe solicitudes del frontend  
- Interactúa con la base de datos mediante JDBC  

---

### 🔹 Database

**Tecnología:** PostgreSQL  

**Responsabilidad:**
- Persistencia de datos del sistema  
- Almacenamiento de:
  - Usuarios  
  - Iglesias  
  - Cursos  
  - Inscripciones  
  - Pagos y ofrendas  

**Acceso:**
- Exclusivo desde el backend  

---

### 🔹 Web Server (Validación requerida)

**Tecnología:** Nginx  

**Responsabilidad:**
- Servir archivos estáticos del frontend (HTML, CSS, JS)  
- Actuar como punto de entrada para la SPA  

⚠️ **Nota:**
Este contenedor solo debe considerarse si está explícitamente definido en el entorno (por ejemplo, en `docker-compose`). De lo contrario, puede omitirse del modelo.

---

## 🔗 Relaciones entre contenedores

El flujo de interacción entre los contenedores es:

1. El usuario accede al sistema a través del navegador.  
2. El frontend (SPA) es cargado y ejecutado en el cliente.  
3. La SPA envía solicitudes al backend mediante HTTP/HTTPS.  
4. El backend procesa la lógica de negocio.  
5. El backend accede a la base de datos para lectura/escritura.  
6. La respuesta retorna al frontend y se presenta al usuario.  

---

## 🧠 Análisis arquitectónico

Este diseño evidencia:

### ✔ Separación de responsabilidades
- UI desacoplada del backend  
- Backend independiente de la base de datos  

### ✔ Arquitectura escalable
- Cada contenedor puede escalar de forma independiente  
- Posibilidad de despliegue distribuido  

### ✔ Bajo acoplamiento
- Comunicación basada en HTTP/JSON  
- Interacciones bien definidas entre capas  

---

## ⚖️ Alcance del modelo

### ✔ Incluye
- Contenedores principales del sistema  
- Tecnologías utilizadas  
- Relaciones entre contenedores  

### ❌ No incluye
- Clases o componentes internos  
- Detalles de implementación  
- Configuración de infraestructura  

---

## 🧪 Supuestos realizados

- La SPA se comunica exclusivamente con la API backend  
- La base de datos no es accedida directamente por el frontend  
- El backend centraliza toda la lógica de negocio  
- El uso de Nginx depende de la configuración real del entorno  

---

## 🧱 Relación con otros niveles C4

- **Nivel 1 (Contexto):** define actores y sistema  
- **Nivel 2 (Contenedores):** define arquitectura tecnológica ← *este nivel*  
- **Nivel 3 (Componentes):** detalla la estructura interna del backend  

---

## 🎯 Conclusión

El Diagrama de Contenedores evidencia una arquitectura bien estructurada, basada en principios de separación de responsabilidades y desacoplamiento entre capas.

Este enfoque permite que ERP Iglesias sea mantenible, escalable y adaptable a futuros cambios tecnológicos, garantizando una base sólida para su evolución.