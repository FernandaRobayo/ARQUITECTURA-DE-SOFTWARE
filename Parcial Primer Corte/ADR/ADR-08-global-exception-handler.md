# ADR-08 — Manejo global de errores en el backend

## Estado

Propuesto

---

# Contexto

El sistema **ERP Iglesias** expone una **API REST** desarrollada en el backend.

Durante el desarrollo de aplicaciones backend es común que diferentes controladores gestionen errores directamente dentro de sus métodos.

Por ejemplo, situaciones como:

* un recurso que no existe
* errores de validación
* excepciones inesperadas del sistema

pueden ser manejadas de forma distinta en cada controlador.

Cuando esto ocurre, las respuestas de error de la API pueden volverse **inconsistentes y difíciles de mantener**.

---

# Problema

Si el manejo de errores se encuentra distribuido entre múltiples controladores:

* cada controlador implementa su propio manejo de excepciones
* las respuestas de error pueden tener diferentes formatos
* el código se vuelve repetitivo
* es más difícil mantener y extender el sistema

Esto genera **duplicación de lógica y falta de consistencia en las respuestas de la API**.

---

# Decisión Arquitectónica

Se propone implementar un **manejador global de excepciones** utilizando la anotación:

```
@ControllerAdvice
```

Este componente interceptará las excepciones generadas en los controladores y enviará una respuesta uniforme al cliente.

Arquitectura propuesta:

```
Controller
↓
Excepción generada
↓
Global Exception Handler
↓
Respuesta de error estructurada
```

---

# Patrón de Diseño Aplicado

**Exception Handling Pattern**

Este patrón centraliza el manejo de errores en un único componente encargado de capturar y procesar excepciones del sistema.

---

# Principio SOLID Aplicado

**Single Responsibility Principle (SRP)**

Cada componente tiene una responsabilidad clara:

* Controller → manejar solicitudes HTTP
* Service → lógica de negocio
* GlobalExceptionHandler → manejo de errores del sistema

---

# Cambio Concreto Propuesto

Se implementará un manejador global de excepciones en el backend.

Archivo propuesto:

```
GlobalExceptionHandler
```

Este componente se encargará de capturar excepciones y generar respuestas de error consistentes.

---

# Ejemplo de Implementación

Ejemplo de clase para manejar excepciones globalmente:

```java
@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleException(Exception ex) {
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Ha ocurrido un error en el sistema");
    }

}
```

---

# Ejemplo para Entenderlo

Flujo de error en el sistema:

```
Frontend solicita un usuario
↓
Backend intenta buscar el usuario
↓
El usuario no existe
↓
Se genera una excepción
↓
GlobalExceptionHandler captura el error
↓
API responde con un mensaje claro
```

---

# Beneficios Arquitectónicos

El manejo global de errores proporciona:

* centralización del manejo de excepciones
* respuestas de error consistentes en la API
* reducción de código repetido en los controladores
* mayor claridad en la arquitectura del backend
* facilidad para extender el manejo de errores

---

# Impacto en el Sistema

La implementación de un manejador global de errores no modifica la lógica de negocio del sistema.

Sin embargo, mejora la consistencia de las respuestas de la API y simplifica el mantenimiento del código.

---

# Resultado Arquitectónico

Arquitectura final propuesta:

```
Controller
↓
Exception
↓
GlobalExceptionHandler
↓
Respuesta estructurada al cliente
```

Este enfoque permite manejar errores de manera centralizada, manteniendo una API más consistente y fácil de mantener.
