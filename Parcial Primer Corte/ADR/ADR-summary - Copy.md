# Resumen de Architecture Decision Records (ADR)
## Proyecto: ERP Iglesias
### Parcial – Patrones de Diseño (Creacionales y Estructurales)

Este documento resume los **Architecture Decision Records (ADR)** propuestos para mejorar la arquitectura del sistema **ERP Iglesias**, aplicando **patrones de diseño creacionales** y **principios SOLID** con el objetivo de aumentar la **mantenibilidad, escalabilidad y claridad del código**.

Cada ADR describe un cambio arquitectónico concreto en el sistema.

---

# Resumen General de Cambios Arquitectónicos

| ADR | Patrón | Problema | Solución Propuesta |
|----|----|----|----|
| ADR-01 | Singleton | Configuración dispersa del sistema | Centralizar configuración en una única instancia |
| ADR-02 | Factory | Creación rígida de pagos | Fábrica de objetos Payment |
| ADR-03 | Builder | Construcción compleja de inscripciones | Builder para Enrollment |
| ADR-04 | Prototype | Creación repetitiva de cursos | Clonación de Course |
| ADR-05 | Factory | Respuestas de error inconsistentes | Factory para ErrorResponse |
| ADR-06 | Builder | Creación compleja de ofrendas | Builder para Offering |
| ADR-07 | Prototype | Copia manual de personas | Clonación controlada de Person |
| ADR-08 | Singleton | Configuración DB dispersa | Singleton DatabaseSettings |
| ADR-09 | Factory | Conversión Entity → DTO duplicada | DTOFactory |
| ADR-10 | Factory | Creación inconsistente de pagos | PaymentFactory |

---

# ADR-01 — Singleton para Configuración Global

## Contexto
El sistema utiliza múltiples clases que acceden directamente a configuraciones del sistema.  
Esto provoca **duplicación de acceso a configuraciones y falta de centralización**.

## Problema
La configuración del sistema puede encontrarse distribuida en diferentes servicios, dificultando su mantenimiento.

## Decisión
Se implementa el patrón **Singleton** para centralizar la configuración del sistema en una única clase accesible globalmente.

## Patrón Aplicado
Singleton

## Principios SOLID
- **SRP**: una clase responsable de gestionar la configuración.

## Beneficios
- Configuración centralizada
- Consistencia en parámetros
- Mantenimiento más sencillo

---

# ADR-02 — Factory para Creación de Pagos

## Contexto
Los pagos se crean directamente dentro de los servicios.

## Problema
La lógica de creación se repite en múltiples partes del sistema.

## Decisión
Implementar una **PaymentFactory** que centralice la creación de pagos.

## Patrón Aplicado
Factory

## Principios SOLID
- **SRP**
- **OCP**

## Beneficios
- Evita duplicación de código
- Facilita agregar nuevos tipos de pago

---

# ADR-03 — Builder para Construcción de Inscripciones

## Contexto
Las inscripciones (`Enrollment`) requieren múltiples pasos de inicialización.

## Problema
La construcción se realiza directamente en los controladores, generando código complejo.

## Decisión
Implementar un **EnrollmentBuilder** para construir el objeto paso a paso.

## Patrón Aplicado
Builder

## Principios SOLID
- **SRP**

## Beneficios
- Construcción controlada
- Código más legible
- Evita errores de inicialización

---

# ADR-04 — Prototype para Creación de Cursos

## Contexto
Algunos cursos comparten configuraciones similares.

## Problema
Crear nuevos cursos requiere repetir configuraciones.

## Decisión
Implementar **Prototype Pattern** para clonar cursos existentes.

## Patrón Aplicado
Prototype

## Principios SOLID
- **SRP**

## Beneficios
- Creación rápida de cursos
- Reutilización de configuraciones

---

# ADR-05 — Factory para Respuestas de Error

## Contexto
Los controladores generan respuestas de error de manera manual.

## Problema
Las respuestas de error no son consistentes en toda la API.

## Decisión
Crear una **ErrorResponseFactory** que genere respuestas estándar.

## Patrón Aplicado
Factory

## Principios SOLID
- **OCP**

## Beneficios
- Respuestas consistentes
- Mantenimiento simplificado

---

# ADR-06 — Builder para Construcción de Ofrendas

## Contexto
La creación de ofrendas implica varios pasos de inicialización y validación.

## Problema
El código de construcción se encuentra dentro del controlador, mezclando responsabilidades. :contentReference[oaicite:0]{index=0}

## Decisión
Implementar **OfferingBuilder** para construir ofrendas paso a paso.

## Patrón Aplicado
Builder

## Principios SOLID
- **SRP**

## Beneficios
- Separación de responsabilidades
- Código más claro
- Validaciones centralizadas

---

# ADR-07 — Prototype para Clonación de Personas

## Contexto
En el sistema ERP Iglesias es común crear nuevas personas con configuraciones similares a otras. :contentReference[oaicite:1]{index=1}

## Problema
La copia manual de atributos genera duplicación de código.

## Decisión
Implementar **Prototype Pattern** en la entidad `Person`.

## Patrón Aplicado
Prototype

## Principios SOLID
- **SRP**
- **OCP**

## Beneficios
- Copia controlada de objetos
- Menos duplicación
- Mayor consistencia

---

# ADR-08 — Singleton para Configuración de Persistencia

## Contexto
Los parámetros de conexión a base de datos se leen en múltiples clases. :contentReference[oaicite:2]{index=2}

## Problema
La configuración queda dispersa en el sistema.

## Decisión
Crear una clase **DatabaseSettings** implementando Singleton.

## Patrón Aplicado
Singleton

## Principios SOLID
- **SRP**
- **DIP**

## Beneficios
- Punto único de configuración
- Mayor control sobre parámetros de infraestructura

---

# ADR-09 — Factory para Creación de DTOs

## Contexto
Los controladores convierten entidades a DTO manualmente. :contentReference[oaicite:3]{index=3}

## Problema
La conversión se repite en múltiples controladores.

## Decisión
Implementar **DTOFactory** para centralizar la conversión.

## Patrón Aplicado
Factory

## Principios SOLID
- **SRP**
- **OCP**

## Beneficios
- Conversión centralizada
- Eliminación de duplicación
- Mayor consistencia en respuestas

---

# ADR-10 — Factory para Creación de Pagos

## Contexto
La inicialización de pagos ocurre directamente en los servicios. :contentReference[oaicite:4]{index=4}

## Problema
La lógica de creación está duplicada.

## Decisión
Crear **PaymentFactory** para generar pagos correctamente inicializados.

## Patrón Aplicado
Factory

## Principios SOLID
- **SRP**
- **OCP**

## Beneficios
- Creación estandarizada
- Mayor mantenibilidad

---

# Distribución de Patrones Aplicados

| Patrón | ADR | Complejidad |
|----|----|----|
| Singleton | ADR-01, ADR-08 | ⭐ |
| Factory | ADR-02, ADR-05, ADR-09, ADR-11 | ⭐⭐ |
| Builder | ADR-03, ADR-06 | ⭐⭐⭐ |
| Prototype | ADR-04, ADR-07 | ⭐⭐⭐ |

---

# Conclusión Arquitectónica

La implementación de estos **10 ADR** introduce mejoras significativas en la arquitectura del sistema ERP Iglesias:

- Reducción de duplicación de código
- Mejor separación de responsabilidades
- Mayor mantenibilidad del sistema
- Aplicación correcta de **patrones creacionales**
- Cumplimiento de **principios SOLID**

Estas decisiones arquitectónicas fortalecen la calidad del software y facilitan la evolución futura del sistema.