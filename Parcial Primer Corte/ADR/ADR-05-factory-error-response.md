# ADR-05 — Implementación de Factory Pattern para respuestas de error

## Estado

Propuesto

---

# Contexto

Durante el análisis del sistema **ERP Iglesias** se identificó que los controladores lanzan excepciones de diferentes formas:

```java
// En PaymentController
throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Pago no encontrado");
throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El pago ya fue confirmado");

// En EnrollmentController
throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Persona no encontrada");
throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Datos no pertenecen a la iglesia");
```

Actualmente no existe un formato estándar para las respuestas de error. Cada controlador crea sus propios mensajes sin estructura común.

---

# Problema

Cuando las respuestas de error se crean de forma dispersa:

* no hay **formato consistente** en la API
* el **código está duplicado** en cada controlador
* es difícil agregar información adicional (códigos de error, timestamps)
* el frontend debe manejar **múltiples formatos** de error

Ejemplo de inconsistencia:

```json
// Un error puede verse así
{
  "status": 404,
  "message": "Pago no encontrado"
}

// Otro error puede verse diferente
{
  "error": "Bad Request",
  "message": "El pago ya fue confirmado",
  "timestamp": "2024-01-15"
}
```

Esto genera **código rígido con if-else** implícitos en el frontend para manejar diferentes formatos.

---

# Decisión Arquitectónica

Se propone implementar el **patrón Factory** para crear respuestas de error estandarizadas.

Una clase `ErrorResponseFactory` será responsable de crear objetos `ErrorResponse` con formato consistente.

Arquitectura propuesta:

```
Exception lanzada
        ↓
GlobalExceptionHandler
        ↓
ErrorResponseFactory (FACTORY)
        ↓
ErrorResponse (Producto)
```

---

# Patrón de Diseño Aplicado

**Factory (Patrón Creacional GoF)**

| Patrón | Propósito | Problema que Resuelve | Complejidad |
|--------|-----------|----------------------|-------------|
| Factory | Crear sin acoplamiento | Código rígido con if-else | ⭐⭐ |

Este patrón encapsula la lógica de creación de objetos en un solo lugar.

---

# Principio SOLID Aplicado

**Single Responsibility Principle (SRP)**

* `ErrorResponseFactory` tiene la única responsabilidad de crear respuestas de error
* Los controladores no se preocupan por el formato de errores

**Open/Closed Principle (OCP)**

* Se pueden añadir nuevos tipos de error sin modificar el código existente
* Solo se extiende la fábrica

---

# Código Actual (ANTES)

Errores lanzados sin formato estándar:

```java
// PaymentController.java
@PostMapping("/{id}/confirm")
public PaymentResponse confirm(@PathVariable Long id) {
    Payment payment = paymentRepository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND, 
            "Pago no encontrado"
        ));

    if (payment.getStatus() == PaymentStatus.CONFIRMADO) {
        throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST, 
            "El pago ya fue confirmado"
        );
    }
    // ...
}
```

Respuesta sin estructura:
```json
{
  "timestamp": "2024-01-15T10:30:00.000+00:00",
  "status": 404,
  "error": "Not Found",
  "message": "Pago no encontrado",
  "path": "/api/payments/999"
}
```

---

# Mejora Propuesta (DESPUÉS)

Se implementa Factory para crear respuestas estructuradas:

## ErrorResponse (Producto)

```java
package com.iglesia.exception;

import java.time.LocalDateTime;

/**
 * Estructura estándar para todas las respuestas de error.
 */
public class ErrorResponse {

    private LocalDateTime timestamp;
    private int status;
    private String error;
    private String message;
    private String code;
    private String path;

    public ErrorResponse(int status, String error, String message, String code, String path) {
        this.timestamp = LocalDateTime.now();
        this.status = status;
        this.error = error;
        this.message = message;
        this.code = code;
        this.path = path;
    }

    // Getters
    public LocalDateTime getTimestamp() { return timestamp; }
    public int getStatus() { return status; }
    public String getError() { return error; }
    public String getMessage() { return message; }
    public String getCode() { return code; }
    public String getPath() { return path; }
}
```

## ErrorResponseFactory (Factory)

```java
package com.iglesia.exception;

/**
 * Factory para crear respuestas de error estandarizadas.
 * Centraliza la creación y garantiza formato consistente.
 */
public class ErrorResponseFactory {

    /**
     * Crea respuesta para recurso no encontrado (404)
     */
    public static ErrorResponse notFound(String message, String path) {
        return new ErrorResponse(
            404,
            "Not Found",
            message,
            "ERR_NOT_FOUND",
            path
        );
    }

    /**
     * Crea respuesta para solicitud inválida (400)
     */
    public static ErrorResponse badRequest(String message, String path) {
        return new ErrorResponse(
            400,
            "Bad Request",
            message,
            "ERR_BAD_REQUEST",
            path
        );
    }

    /**
     * Crea respuesta para error de validación (400)
     */
    public static ErrorResponse validation(String message, String path) {
        return new ErrorResponse(
            400,
            "Validation Error",
            message,
            "ERR_VALIDATION",
            path
        );
    }

    /**
     * Crea respuesta para acceso denegado (403)
     */
    public static ErrorResponse forbidden(String message, String path) {
        return new ErrorResponse(
            403,
            "Forbidden",
            message,
            "ERR_FORBIDDEN",
            path
        );
    }

    /**
     * Crea respuesta para error interno (500)
     */
    public static ErrorResponse internal(String message, String path) {
        return new ErrorResponse(
            500,
            "Internal Server Error",
            message,
            "ERR_INTERNAL",
            path
        );
    }

    /**
     * Crea respuesta para error de negocio con código personalizado
     */
    public static ErrorResponse business(String message, String code, String path) {
        return new ErrorResponse(
            400,
            "Business Error",
            message,
            code,
            path
        );
    }
}
```

## Excepciones personalizadas

```java
package com.iglesia.exception;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}

public class BusinessException extends RuntimeException {
    private final String code;

    public BusinessException(String message, String code) {
        super(message);
        this.code = code;
    }

    public String getCode() { return code; }
}
```

## GlobalExceptionHandler usando Factory

```java
package com.iglesia.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(
            ResourceNotFoundException ex, 
            HttpServletRequest request) {
        
        // Usa la Factory para crear la respuesta
        ErrorResponse error = ErrorResponseFactory.notFound(
            ex.getMessage(), 
            request.getRequestURI()
        );
        
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusiness(
            BusinessException ex, 
            HttpServletRequest request) {
        
        // Usa la Factory con código personalizado
        ErrorResponse error = ErrorResponseFactory.business(
            ex.getMessage(),
            ex.getCode(),
            request.getRequestURI()
        );
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(
            Exception ex, 
            HttpServletRequest request) {
        
        // Usa la Factory para errores genéricos
        ErrorResponse error = ErrorResponseFactory.internal(
            "Ha ocurrido un error inesperado",
            request.getRequestURI()
        );
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
```

## Uso en Controller

```java
@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @PostMapping("/{id}/confirm")
    public PaymentResponse confirm(@PathVariable Long id) {
        Payment payment = paymentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Pago no encontrado con ID: " + id
            ));

        if (payment.getStatus() == PaymentStatus.CONFIRMADO) {
            throw new BusinessException(
                "El pago ya fue confirmado",
                "ERR_PAYMENT_ALREADY_CONFIRMED"
            );
        }
        
        // ...
    }
}
```

---

# Diagrama del Patrón Factory

```
┌─────────────────────────────────────────────────────────────┐
│                   Controller                                │
│                                                             │
│  throw new ResourceNotFoundException("Pago no encontrado"); │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
         ┌─────────────────────────────────┐
         │     GlobalExceptionHandler      │
         │                                 │
         │   ErrorResponseFactory.notFound │
         │       (message, path)           │
         └────────────────┬────────────────┘
                          │
                          ▼
         ┌─────────────────────────────────┐
         │     ErrorResponseFactory        │
         │          (FACTORY)              │
         │                                 │
         │  + notFound()                   │
         │  + badRequest()                 │
         │  + validation()                 │
         │  + forbidden()                  │
         │  + internal()                   │
         │  + business()                   │
         └────────────────┬────────────────┘
                          │
                          ▼
         ┌─────────────────────────────────┐
         │       ErrorResponse             │
         │        (Producto)               │
         │                                 │
         │  - timestamp                    │
         │  - status: 404                  │
         │  - error: "Not Found"           │
         │  - message: "Pago no..."        │
         │  - code: "ERR_NOT_FOUND"        │
         │  - path: "/api/payments/999"    │
         └─────────────────────────────────┘
```

---

# Respuesta Estandarizada

```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 404,
  "error": "Not Found",
  "message": "Pago no encontrado con ID: 999",
  "code": "ERR_NOT_FOUND",
  "path": "/api/payments/999"
}
```

Todos los errores tienen el **mismo formato**, facilitando el manejo en el frontend.

---

# Beneficios Arquitectónicos

La implementación del patrón Factory proporciona:

* **formato consistente** en todas las respuestas de error
* **centralización** de la lógica de creación
* **códigos de error** estándar para el frontend
* **extensibilidad** para nuevos tipos de error
* **facilidad de testing** de respuestas

---

# Trade-offs

| Ventaja | Desventaja |
|---------|------------|
| Errores consistentes | Más clases (Factory, ErrorResponse) |
| Códigos estándar | Requiere migrar excepciones existentes |
| Fácil agregar nuevos tipos | Indirección adicional |
| Frontend simplificado | Curva de aprendizaje |

---

# Impacto en el Sistema

El cambio no afecta el comportamiento funcional del sistema.

Las respuestas de error ahora tienen un formato estándar que facilita el manejo en el frontend.

---

# Resultado Arquitectónico

Arquitectura aplicando Factory Pattern:

```
Exception
    ↓
GlobalExceptionHandler
    ↓
ErrorResponseFactory (FACTORY)
    ↓
ErrorResponse (Producto estandarizado)
```

Esta estructura implementa correctamente el **patrón Factory (GoF Creacional)** para la creación de respuestas de error.
