# ADR-09 — Documentación de la API mediante Postman

## Estado

Propuesto

---

# Contexto

El sistema **ERP Iglesias** expone una **API REST** que es consumida por el frontend desarrollado en **Angular**.

La API incluye múltiples endpoints para gestionar diferentes recursos del sistema, como:

* autenticación de usuarios
* gestión de personas
* cursos
* inscripciones
* pagos

Cuando una API crece en funcionalidad, es necesario contar con una forma clara de **documentar y probar los endpoints disponibles**.

Sin una documentación organizada, los desarrolladores pueden tener dificultades para entender cómo interactuar con la API.

---

# Problema

Si la API REST no cuenta con documentación clara:

* los desarrolladores no conocen fácilmente los endpoints disponibles
* se dificulta probar las funcionalidades del backend
* los equipos de desarrollo tienen problemas para integrarse con la API
* la validación de endpoints se vuelve más compleja

Esto genera **falta de claridad en la comunicación entre el backend y los consumidores de la API**.

---

# Decisión Arquitectónica

Se propone utilizar **Postman** como herramienta para documentar y organizar los endpoints de la API mediante **colecciones de requests**.

Las colecciones permitirán agrupar los endpoints por funcionalidad y facilitar su prueba y documentación.

Arquitectura propuesta:

```text
Backend API
↓
Colección Postman
↓
Documentación de endpoints
↓
Pruebas de integración
```

---

# Patrón de Diseño Aplicado

**Documentation Pattern**

Este enfoque organiza la información técnica del sistema en un formato estructurado, reutilizable y comprensible para otros desarrolladores.

En este caso, la colección de Postman funciona como un artefacto de documentación y prueba de la API.

---

# Principio SOLID Aplicado

**Single Responsibility Principle (SRP)**

Cada elemento cumple una función específica:

* Backend API → exponer la lógica del sistema mediante endpoints
* Postman Collection → documentar y probar los endpoints
* Frontend / desarrolladores → consumir la API

De esta forma, la documentación y prueba de la API no se mezclan con la lógica del backend.

---

# Cambio Concreto Propuesto

Se creará una **colección de Postman** que incluya los endpoints principales del sistema.

Esta colección permitirá:

* probar los endpoints del backend
* documentar las solicitudes HTTP
* registrar ejemplos de uso de la API
* compartir la documentación con otros desarrolladores

---

# Ejemplo para Entenderlo

Ejemplo de colección en Postman:

```text
POST /api/auth/login
GET  /api/people
POST /api/people
GET  /api/courses
GET  /api/payment
```

Cada request dentro de la colección puede incluir:

* parámetros de la solicitud
* headers necesarios
* body de ejemplo
* respuesta esperada

---

# Beneficios Arquitectónicos

El uso de Postman para documentar la API proporciona:

* mejor comprensión de los endpoints disponibles
* facilidad para probar las funcionalidades del backend
* documentación compartida entre desarrolladores
* soporte para pruebas manuales de integración
* mejor organización de la API durante el desarrollo

---

# Impacto en el Sistema

La utilización de Postman no modifica el funcionamiento del sistema.

Sin embargo, mejora la **documentación, pruebas y mantenimiento de la API**.

---

# Resultado Arquitectónico

Flujo de documentación y prueba de la API:

```text
Backend API
↓
Colección Postman
↓
Documentación de endpoints
↓
Pruebas de integración
```

Esto permite mantener una documentación clara y accesible para los desarrolladores que trabajen con la API del sistema.
