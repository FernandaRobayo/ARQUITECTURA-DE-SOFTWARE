# ADR-05 — Centralización de respuestas de error mediante ErrorResponseFactory

## Información general

| Campo    | Valor                                 |
| -------- | ------------------------------------- |
| ADR      | ADR-05                                |
| Título   | Centralización de respuestas de error |
| Tipo     | Backend                               |
| Estado   | Implementado                          |
| Proyecto | ERP Iglesias                          |
| Lenguaje | Java + Spring Boot                    |

---

# Contexto del sistema

El sistema ERP de iglesias está construido utilizando **Spring Boot** como backend y expone múltiples **API REST** que son consumidas por el frontend del sistema.

Dentro del backend existen varios controladores que gestionan las operaciones del sistema, entre ellos:

* `EnrollmentController`
* `OfferingController`
* `CourseController`
* `PersonController`

Durante el desarrollo del sistema se observó que muchos controladores generaban errores utilizando directamente la clase:

```java
ResponseStatusException
```

Ejemplo de implementación encontrada en el sistema:

```java
throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Persona no encontrada");
```

Este patrón se repetía en múltiples controladores.

---

# Problema identificado

La creación directa de excepciones dentro de los controladores generaba varios problemas de diseño arquitectónico.

## Duplicación de código

Cada controlador generaba errores manualmente.

Esto producía repetición de código en distintas partes del backend.

---

## Alto acoplamiento

Los controladores dependían directamente de la creación de objetos `ResponseStatusException`.

Esto generaba un fuerte acoplamiento entre los controladores y la lógica de manejo de errores.

---

## Baja mantenibilidad

Si en el futuro se requiere modificar la forma en que se construyen los errores HTTP, sería necesario modificar múltiples controladores.

---

## Violación de principios SOLID

Particularmente se estaba violando el principio:

**Single Responsibility Principle (SRP)**

Los controladores estaban realizando múltiples responsabilidades:

* gestionar peticiones HTTP
* validar lógica de negocio
* construir errores HTTP

---

# Decisión arquitectónica

Para resolver este problema se decidió centralizar la creación de respuestas de error utilizando una **fábrica de errores**.

Se creó la clase:

```
ErrorResponseFactory
```

Esta clase tiene como responsabilidad:

* construir respuestas de error HTTP
* centralizar la creación de excepciones
* evitar duplicación de código
* desacoplar los controladores del mecanismo de error

Los controladores ahora delegan la creación de errores a esta fábrica.

---

# Implementación

Se creó el archivo:

```
backend/src/main/java/com/iglesia/ErrorResponseFactory.java
```

Implementación de la fábrica:

```java
package com.iglesia;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public class ErrorResponseFactory {

    private ErrorResponseFactory() {
    }

    public static ResponseStatusException notFound(String message) {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, message);
    }

    public static ResponseStatusException badRequest(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }

    public static ResponseStatusException internalError(String message) {
        return new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, message);
    }
}
```

Esta clase permite centralizar la creación de errores HTTP.

---

# Cambios realizados en el sistema

Se modificaron los controladores que generaban errores manualmente.

Controladores modificados:

* `EnrollmentController`
* `OfferingController`

---

# Ejemplo de cambio aplicado

## Antes

```java
throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Persona no encontrada");
```

## Después

```java
throw ErrorResponseFactory.notFound("Persona no encontrada");
```

---

## Otro ejemplo

Antes:

```java
throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Persona no pertenece a la iglesia");
```

Después:

```java
throw ErrorResponseFactory.badRequest("Persona no pertenece a la iglesia");
```

---

# Arquitectura antes del cambio

Antes del ADR-05 los controladores creaban directamente los errores.

```
Controller
   ↓
new ResponseStatusException
   ↓
HTTP Error Response
```

Esto generaba duplicación de código.

---

# Arquitectura después del cambio

Después de implementar `ErrorResponseFactory`, los controladores delegan la creación de errores.

```
Controller
   ↓
ErrorResponseFactory
   ↓
ResponseStatusException
   ↓
HTTP Error Response
```

Esto centraliza la lógica de errores.

---

# Beneficios obtenidos

La implementación de `ErrorResponseFactory` aporta varias mejoras al sistema.

## Reducción de duplicación de código

Los controladores ya no repiten la lógica de creación de errores.

---

## Centralización de la lógica

Toda la creación de errores se gestiona en una sola clase.

---

## Mejor mantenibilidad

Si se requiere modificar el comportamiento de los errores, solo se modifica la fábrica.

---

## Mayor consistencia en la API

Todas las respuestas de error siguen el mismo patrón.

---

# Relación con principios SOLID

La implementación de este ADR mejora el cumplimiento de principios de diseño.

## Single Responsibility Principle (SRP)

Los controladores ahora se encargan únicamente de manejar peticiones HTTP.

La creación de errores se delega a una clase especializada.

---

## Open Closed Principle (OCP)

Se pueden agregar nuevos tipos de errores dentro de la fábrica sin modificar los controladores.

---

# Pruebas realizadas

Se realizaron pruebas funcionales para verificar que el sistema continúa funcionando correctamente.

---

## Prueba 1 — Persona inexistente

Endpoint probado:

```
POST /api/enrollments
```

Se envió una solicitud con un `personId` inexistente.

Resultado esperado:

* respuesta HTTP 404
* mensaje "Persona no encontrada"

Resultado obtenido:

El sistema generó el error utilizando `ErrorResponseFactory`.

---

## Prueba 2 — Persona de otra iglesia

Endpoint probado:

```
POST /api/offerings
```

Resultado esperado:

* respuesta HTTP 400
* mensaje "Persona no pertenece a la iglesia"

Resultado obtenido:

El error fue generado correctamente mediante la fábrica.

---

# Evidencia del funcionamiento

Durante las pruebas se verificó que:

* los controladores utilizan `ErrorResponseFactory`
* los errores se generan correctamente
* la funcionalidad del sistema no se ve afectada
* la API mantiene respuestas consistentes

---

# Conclusión

La implementación del ADR-05 permitió mejorar la arquitectura del backend al centralizar la creación de respuestas de error.

Este cambio permitió:

* reducir duplicación de código
* mejorar la mantenibilidad del sistema
* reducir el acoplamiento entre controladores y manejo de errores
* mejorar la consistencia de las respuestas de la API

El sistema continúa funcionando correctamente después de aplicar esta mejora arquitectónica.
