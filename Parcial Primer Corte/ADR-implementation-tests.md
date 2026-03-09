# Implementación de Cambios Arquitectónicos y Pruebas Funcionales
## Sistema: ERP Iglesias

En el proceso de análisis arquitectónico del sistema ERP Iglesias se propusieron **10 Architecture Decision Records (ADR)** orientados a mejorar la mantenibilidad, escalabilidad y organización del código mediante la aplicación de **patrones de diseño y principios SOLID**.

Sin embargo, el alcance del ejercicio establece que se deben **implementar únicamente 5 de los 10 cambios propuestos**, acompañados de pruebas funcionales que demuestren que el sistema continúa funcionando correctamente.

Por esta razón, se seleccionaron los cambios que:

- pueden implementarse sin alterar la lógica principal del sistema
- aportan mejoras arquitectónicas claras
- permiten validarse fácilmente mediante pruebas funcionales

---

# ADR propuestos inicialmente

| ADR | Patrón | Cambio Arquitectónico |
|----|----|----|
| ADR-01 | Singleton | Configuración centralizada del sistema |
| ADR-02 | Factory | Creación desacoplada de pagos |
| ADR-03 | Builder | Construcción paso a paso de inscripciones |
| ADR-04 | Prototype | Clonación de cursos |
| ADR-05 | Factory | Manejo estandarizado de errores |
| ADR-06 | Builder | Construcción controlada de ofrendas |
| ADR-07 | Prototype | Clonación de personas |
| ADR-08 | Singleton | Configuración centralizada de base de datos |
| ADR-09 | Factory | Creación centralizada de DTOs |
| ADR-11 | Factory | Creación centralizada de pagos |

---

# Cambios seleccionados para implementación

De los 10 ADR propuestos, se seleccionaron los siguientes **5 cambios para su implementación**:

| ADR | Patrón | Motivo de selección |
|----|----|----|
| ADR-02 | Factory | Reduce duplicación en creación de pagos |
| ADR-05 | Factory | Permite estandarizar respuestas de error |
| ADR-08 | Singleton | Centraliza configuración de base de datos |
| ADR-09 | Factory | Elimina duplicación en conversión Entity → DTO |
| ADR-01 | Singleton | Mejora organización de configuración del sistema |

Estos cambios fueron seleccionados debido a que:

- requieren **mínimo refactor del sistema**
- mejoran la arquitectura del código
- son fáciles de validar mediante pruebas funcionales
- no afectan el comportamiento del sistema existente

---

# Implementación de los cambios

| ADR | Archivo / Clase | Descripción |
|----|-----------------|-------------|
| ADR-02 | PaymentFactory.java | Se implementó una fábrica para centralizar la creación de pagos |
| ADR-05 | ErrorResponseFactory.java | Se centralizó la creación de respuestas de error |
| ADR-08 | DatabaseSettings.java | Se creó un Singleton para centralizar configuración de base de datos |
| ADR-09 | DTOFactory.java | Se creó una fábrica para convertir entidades a DTO |
| ADR-01 | AppConfig.java | Se centralizó la configuración global del sistema |

---

# Pruebas funcionales realizadas

Las pruebas funcionales se realizaron utilizando **Postman y el frontend del sistema**, verificando que los cambios implementados no afectaran el comportamiento del sistema.

| Prueba | Endpoint | Resultado esperado | Resultado obtenido |
|------|------|------|------|
| Crear persona | POST /api/people | Persona registrada | ✔ Correcto |
| Consultar personas | GET /api/people | Lista de personas | ✔ Correcto |
| Crear curso | POST /api/courses | Curso registrado | ✔ Correcto |
| Registrar inscripción | POST /api/enrollments | Inscripción creada | ✔ Correcto |
| Registrar ofrenda | POST /api/offerings | Ofrenda registrada | ✔ Correcto |

---

# Conclusión

La implementación de los 5 cambios arquitectónicos seleccionados demuestra que es posible mejorar la organización del sistema aplicando patrones de diseño sin afectar su funcionamiento.

Las pruebas funcionales realizadas confirman que el sistema ERP Iglesias mantiene su funcionalidad original mientras se introducen mejoras en la arquitectura del código.