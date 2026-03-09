# ADR-09 — Implementación de Factory Pattern para creación de DTOs

## Estado

Propuesto

---

# Contexto

Durante el análisis del sistema **ERP Iglesias** se identificó que los controladores tienen clases internas `record` para las respuestas:

```java
// En PersonController
public record PersonResponse(
    Long id,
    String firstName,
    String lastName,
    String document,
    String phone,
    String email
) {
    public static PersonResponse from(Person person) {
        return new PersonResponse(
            person.getId(),
            person.getFirstName(),
            person.getLastName(),
            person.getDocument(),
            person.getPhone(),
            person.getEmail()
        );
    }
}
```

Este patrón se repite en cada controlador:

* `PersonController.PersonResponse`
* `CourseController.CourseResponse`
* `PaymentController.PaymentResponse`
* `EnrollmentController.EnrollmentResponse`
* `OfferingController.OfferingResponse`

---

# Problema

Cuando la conversión Entity → DTO está dispersa en cada controlador:

* **código duplicado** del patrón de conversión
* no hay un lugar centralizado para crear DTOs
* es difícil agregar lógica común (formateo, validación)
* si cambia la estructura, hay que modificar múltiples lugares

Ejemplo de **código rígido con if-else** implícito en la conversión:

```java
// En cada controller, mismo patrón repetido:
public static XxxResponse from(Xxx entity) {
    return new XxxResponse(
        entity.getId(),
        entity.getAttr1(),
        entity.getAttr2(),
        // ... misma estructura
    );
}
```

---

# Decisión Arquitectónica

Se propone implementar el **patrón Factory** para centralizar la creación de DTOs.

Una clase `DTOFactory` será responsable de crear todos los objetos de respuesta.

Arquitectura propuesta:

```
Entity
    ↓
DTOFactory (FACTORY)
    ↓
DTO (Producto)
```

---

# Patrón de Diseño Aplicado

**Factory (Patrón Creacional GoF)**

| Patrón | Propósito | Problema que Resuelve | Complejidad |
|--------|-----------|----------------------|-------------|
| Factory | Crear sin acoplamiento | Código rígido con if-else | ⭐⭐ |

---

# Principio SOLID Aplicado

**Single Responsibility Principle (SRP)**

* `DTOFactory` tiene la única responsabilidad de crear DTOs
* Los controladores no se preocupan por la conversión

**Open/Closed Principle (OCP)**

* Se pueden añadir nuevos DTOs sin modificar controladores

---

# Código Actual (ANTES)

Conversión dispersa en cada controlador:

```java
// PersonController.java
public record PersonResponse(...) {
    public static PersonResponse from(Person p) { ... }
}

// CourseController.java
public record CourseResponse(...) {
    public static CourseResponse from(Course c) { ... }
}

// PaymentController.java
public record PaymentResponse(...) {
    public static PaymentResponse from(Payment p) { ... }
}
```

---

# Mejora Propuesta (DESPUÉS)

## DTOFactory (Factory)

```java
package com.iglesia.factory;

import com.iglesia.*;
import com.iglesia.dto.*;
import org.springframework.stereotype.Component;

/**
 * Factory para crear todos los DTOs del sistema.
 * Centraliza la lógica de conversión Entity → DTO.
 */
@Component
public class DTOFactory {

    /**
     * Crea DTO de Person
     */
    public PersonDTO createPersonDTO(Person person) {
        return new PersonDTO(
            person.getId(),
            person.getFirstName(),
            person.getLastName(),
            person.getDocument(),
            person.getPhone(),
            person.getEmail()
        );
    }

    /**
     * Crea DTO de Course
     */
    public CourseDTO createCourseDTO(Course course) {
        return new CourseDTO(
            course.getId(),
            course.getName(),
            course.getDescription(),
            course.getPrice(),
            course.isActive()
        );
    }

    /**
     * Crea DTO de Payment
     */
    public PaymentDTO createPaymentDTO(Payment payment) {
        return new PaymentDTO(
            payment.getId(),
            payment.getType().name(),
            payment.getStatus().name(),
            payment.getAmount().toPlainString(),
            payment.getAttempts(),
            payment.getReferenceId()
        );
    }

    /**
     * Crea DTO de Enrollment con Payment
     */
    public EnrollmentDTO createEnrollmentDTO(Enrollment enrollment, Payment payment) {
        String personName = enrollment.getPerson().getFirstName() 
                          + " " 
                          + enrollment.getPerson().getLastName();
        String paymentStatus = payment != null ? payment.getStatus().name() : null;
        
        return new EnrollmentDTO(
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

    /**
     * Crea DTO de Offering con Payment
     */
    public OfferingDTO createOfferingDTO(Offering offering, Payment payment) {
        String personName = offering.getPerson().getFirstName() 
                          + " " 
                          + offering.getPerson().getLastName();
        String paymentStatus = payment != null ? payment.getStatus().name() : null;
        
        return new OfferingDTO(
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

## DTOs como records

```java
package com.iglesia.dto;

public record PersonDTO(
    Long id,
    String firstName,
    String lastName,
    String document,
    String phone,
    String email
) {}

public record CourseDTO(
    Long id,
    String name,
    String description,
    BigDecimal price,
    boolean active
) {}

public record PaymentDTO(
    Long id,
    String type,
    String status,
    String amount,
    int attempts,
    Long referenceId
) {}
```

## Controller utilizando Factory

```java
@RestController
@RequestMapping("/api/people")
public class PersonController {

    private final PersonRepository personRepository;
    private final DTOFactory dtoFactory;  // Inyecta Factory

    public PersonController(PersonRepository personRepository, DTOFactory dtoFactory) {
        this.personRepository = personRepository;
        this.dtoFactory = dtoFactory;
    }

    @GetMapping
    public List<PersonDTO> list() {
        return personRepository.findAll()
            .stream()
            .map(dtoFactory::createPersonDTO)  // Usa Factory
            .toList();
    }

    @GetMapping("/{id}")
    public PersonDTO findById(@PathVariable Long id) {
        Person person = personRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("No encontrado"));
        
        return dtoFactory.createPersonDTO(person);  // Usa Factory
    }
}
```

---

# Diagrama del Patrón Factory

```
┌─────────────────────────────────────────────────────────────┐
│                       Controllers                           │
│                                                             │
│  PersonController   CourseController   PaymentController    │
│          │                 │                  │             │
│          └─────────────────┼──────────────────┘             │
│                            │                                │
│             dtoFactory.createXxxDTO(entity)                 │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
                ┌────────────────────────┐
                │      DTOFactory        │
                │       (FACTORY)        │
                │                        │
                │ + createPersonDTO()    │
                │ + createCourseDTO()    │
                │ + createPaymentDTO()   │
                │ + createEnrollmentDTO()│
                │ + createOfferingDTO()  │
                └───────────┬────────────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
            ▼               ▼               ▼
       PersonDTO       CourseDTO       PaymentDTO
       (Producto)      (Producto)      (Producto)
```

---

# Beneficios Arquitectónicos

* **centralización** de la lógica de conversión
* **código DRY** (Don't Repeat Yourself)
* **fácil mantenimiento** cuando cambian las entidades
* **lógica común** en un solo lugar
* **testing simplificado** de la conversión

---

# Trade-offs

| Ventaja | Desventaja |
|---------|------------|
| Conversión centralizada | Una clase Factory puede crecer |
| Elimina duplicación | Indirección adicional |
| Fácil modificar formato | Dependencia de Factory |
| Testing de conversión | Curva de aprendizaje |

---

# Resultado Arquitectónico

```
Entity
    ↓
DTOFactory (FACTORY)
    ↓
DTO (Producto)
    ↓
Response HTTP
```

Esta estructura implementa el **patrón Factory (GoF Creacional)** para la creación de DTOs.
