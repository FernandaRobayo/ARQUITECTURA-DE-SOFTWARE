# Tabla de Architecture Decision Records (ADR)

| ADR | Patrón de Diseño | Problema Identificado | Decisión Arquitectónica | Impacto en el Sistema |
|----|------------------|----------------------|-------------------------|----------------------|
| ADR-01 | Singleton | Configuración del sistema dispersa en múltiples clases | Centralizar la configuración en una clase Singleton | Mejora consistencia y mantenimiento de configuraciones |
| ADR-02 | Factory | Creación directa de pagos en servicios | Implementar una fábrica de pagos (`PaymentFactory`) | Reduce duplicación y desacopla la creación de objetos |
| ADR-03 | Builder | Construcción compleja de inscripciones | Implementar `EnrollmentBuilder` para construcción paso a paso | Mejora legibilidad y evita errores de inicialización |
| ADR-04 | Prototype | Creación repetitiva de cursos con configuraciones similares | Implementar clonación de objetos Course | Permite crear cursos rápidamente reutilizando configuraciones |
| ADR-05 | Factory | Respuestas de error inconsistentes en la API | Implementar `ErrorResponseFactory` | Estandariza manejo de errores en el sistema |
| ADR-06 | Builder | Creación compleja de ofrendas dentro del controlador | Implementar `OfferingBuilder` | Separa responsabilidades y simplifica el controlador |
| ADR-07 | Prototype | Copia manual de atributos al crear nuevas personas | Implementar clonación controlada en `Person` | Reduce duplicación de código y mejora consistencia |
| ADR-08 | Singleton | Acceso disperso a configuración de base de datos | Implementar `DatabaseSettings` como Singleton | Centraliza parámetros de persistencia |
| ADR-09 | Factory | Conversión Entity → DTO repetida en controladores | Implementar `DTOFactory` | Centraliza la creación de DTOs |
| ADR-10 | Factory | Inicialización inconsistente de pagos | Centralizar creación de pagos en `PaymentFactory` | Mejora consistencia y mantenibilidad |