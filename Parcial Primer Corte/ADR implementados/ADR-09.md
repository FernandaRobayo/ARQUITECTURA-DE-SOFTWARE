# ADR-09 — Centralización de conversión de entidades a DTO mediante DTOFactory

## Información general

| Campo           | Valor                              |
| --------------- | ---------------------------------- |
| ADR             | ADR-09                             |
| Título          | Centralización de conversión a DTO |
| Tipo            | Backend                            |
| Patrón aplicado | Factory                            |
| Estado          | Implementado                       |
| Proyecto        | ERP Iglesias                       |
| Lenguaje        | Java + Spring Boot                 |

---

# Contexto del sistema

El sistema ERP de iglesias está desarrollado utilizando **Spring Boot** como backend y expone múltiples **API REST** que son consumidas por el frontend del sistema.

Dentro del backend existen diferentes entidades del dominio que representan los datos almacenados en la base de datos, por ejemplo:

* `Enrollment`
* `Offering`
* `Person`
* `Payment`
* `Course`

Sin embargo, estas entidades **no deben ser expuestas directamente en las respuestas de la API**.

Por esta razón se utilizan **DTO (Data Transfer Objects)** para enviar la información al cliente.

En el sistema existen DTO como:

* `EnrollmentResponse`
* `OfferingResponse`

Estos objetos contienen únicamente la información necesaria para la respuesta de la API.

---

# Problema identificado

Durante el desarrollo del sistema se observó que la conversión entre **entidades del dominio y DTO** podía quedar distribuida en múltiples partes del sistema.

Esto genera varios problemas arquitectónicos.

## Duplicación de lógica de conversión

Si cada controlador o servicio realiza la conversión manualmente, la lógica de mapeo se repite.

---

## Falta de centralización

La conversión entre entidades y DTO debería estar centralizada en una única capa o componente.

---

## Bajo control de transformación de datos

Si cada parte del sistema realiza sus propias conversiones, se pierde control sobre la forma en que los datos se transforman.

---

# Decisión arquitectónica

Para resolver este problema se decidió implementar una **fábrica de DTO**.

Se creó la clase:

```text id="dtofactory-class"
DTOFactory
```

Esta clase tiene como responsabilidad:

* convertir entidades del dominio en DTO
* centralizar la lógica de transformación de datos
* evitar duplicación de código
* desacoplar los controladores de la lógica de conversión

La fábrica proporciona métodos estáticos que permiten convertir entidades en DTO.

---

# Implementación

Se creó el archivo:

```text id="dtofactory-path"
backend/src/main/java/com/iglesia/DTOFactory.java
```

Implementación de la fábrica:

```java id="dtofactory-code"
package com.iglesia;

public class DTOFactory {

    private DTOFactory() {
    }

    public static EnrollmentController.EnrollmentResponse enrollmentDTO(
            Enrollment enrollment,
            Payment payment
    ) {

        String personName =
                enrollment.getPerson().getFirstName()
                        + " "
                        + enrollment.getPerson().getLastName();

        String paymentStatus =
                payment == null ? null : payment.getStatus().name();

        return new EnrollmentController.EnrollmentResponse(
                enrollment.getId(),
                enrollment.getPerson().getId(),
                personName,
                enrollment.getCourse().getId(),
                enrollment.getCourse().getName(),
                enrollment.getStatus().name(),
                enrollment.getPaymentId(),
                paymentStatus
        );
    }

    public static OfferingController.OfferingResponse offeringDTO(
            Offering offering,
            Payment payment
    ) {

        String personName =
                offering.getPerson().getFirstName()
                        + " "
                        + offering.getPerson().getLastName();

        String paymentStatus =
                payment == null ? null : payment.getStatus().name();

        return new OfferingController.OfferingResponse(
                offering.getId(),
                offering.getPerson().getId(),
                personName,
                offering.getConcept(),
                offering.getAmount().toPlainString(),
                offering.getStatus().name(),
                offering.getPaymentId(),
                paymentStatus
        );
    }
}
```

---

# Función de la fábrica

La clase `DTOFactory` centraliza la conversión entre entidades y DTO.

Arquitectura conceptual:

```
Entidad (Enrollment / Offering)
        ↓
     DTOFactory
        ↓
DTO (EnrollmentResponse / OfferingResponse)
```

---

# Arquitectura antes del cambio

Antes del ADR-09, cada componente del sistema podía convertir entidades a DTO de forma independiente.

```
Controller
   ↓
Conversión manual
   ↓
DTO
```

Esto generaba riesgo de duplicación de lógica.

---

# Arquitectura después del cambio

Después de implementar `DTOFactory`, la conversión se centraliza.

```
Controller
   ↓
DTOFactory
   ↓
DTO
```

Esto permite mantener una única fuente de transformación de datos.

---

# Beneficios obtenidos

La implementación de `DTOFactory` aporta varias mejoras al sistema.

## Centralización de conversión

Toda la lógica de transformación entre entidades y DTO se encuentra en una sola clase.

---

## Reducción de duplicación de código

Se evita repetir lógica de mapeo en diferentes partes del sistema.

---

## Mejor mantenibilidad

Si se modifica la estructura de un DTO, solo se actualiza la fábrica.

---

## Mayor control de datos expuestos

La fábrica permite controlar qué datos se exponen en las respuestas de la API.

---

# Relación con principios SOLID

La implementación de este ADR contribuye al cumplimiento de principios de diseño.

## Single Responsibility Principle (SRP)

La clase `DTOFactory` tiene una única responsabilidad: convertir entidades en DTO.

---

## Open Closed Principle (OCP)

Se pueden agregar nuevos métodos de conversión sin modificar los controladores.

---

# Evidencia de implementación

La implementación del ADR-09 se evidencia mediante:

* creación del archivo `DTOFactory.java`
* métodos estáticos de conversión
* centralización de la lógica de transformación

Archivo agregado al proyecto:

```
backend/src/main/java/com/iglesia/DTOFactory.java
```

---

# Estado del proyecto respecto a los ADR

| ADR    | Implementación               |
| ------ | ---------------------------- |
| ADR-02 | PaymentFactory               |
| ADR-05 | ErrorResponseFactory         |
| ADR-08 | DatabaseSettings (Singleton) |
| ADR-09 | DTOFactory                   |
| ADR-01 | AppConfig                    |

---

# Conclusión

La implementación del ADR-09 permitió centralizar la conversión entre entidades del dominio y DTO dentro del sistema.

La creación de `DTOFactory` proporciona:

* una única capa de transformación de datos
* reducción de duplicación de lógica
* mejor mantenibilidad
* mayor control sobre los datos expuestos en la API

Este cambio mejora la arquitectura del backend al aplicar un patrón creacional adecuado para la creación de DTO.
