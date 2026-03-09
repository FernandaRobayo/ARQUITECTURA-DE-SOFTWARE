# ADR-02 — Implementación de Factory Pattern para creación de pagos

## Estado

Propuesto

---

# Contexto

Durante el análisis del sistema **ERP Iglesias** se identificó que la creación de pagos se realiza de forma directa en los controladores.

En `EnrollmentController`:

```java
Payment payment = new Payment();
payment.setType(PaymentType.INSCRIPCION_CURSO);
payment.setAmount(course.getPrice());
payment.setReferenceId(enrollment.getId());
paymentRepository.save(payment);
```

En `OfferingController`:

```java
Payment payment = new Payment();
payment.setType(PaymentType.OFRENDA);
payment.setAmount(request.amount());
payment.setReferenceId(offering.getId());
paymentRepository.save(payment);
```

El sistema maneja dos tipos de pagos:

```java
public enum PaymentType {
    INSCRIPCION_CURSO,
    OFRENDA
}
```

Actualmente, cada controlador crea pagos directamente usando `new Payment()`, lo que genera **código rígido con if-else** implícitos en diferentes lugares.

---

# Problema

Cuando la creación de objetos se realiza directamente con `new`:

* el código está **acoplado** a la clase concreta `Payment`
* si cambia la forma de crear un pago, hay que modificar múltiples lugares
* no existe un punto centralizado para la creación
* agregar un nuevo tipo de pago requiere modificar múltiples controladores
* la lógica de inicialización está duplicada

Ejemplo del problema:

```java
// En EnrollmentController - lógica de creación
Payment payment = new Payment();
payment.setType(PaymentType.INSCRIPCION_CURSO);
payment.setAmount(course.getPrice());
payment.setReferenceId(enrollment.getId());
payment.setStatus(PaymentStatus.INICIADO);  // ¿Se olvida?

// En OfferingController - misma lógica duplicada
Payment payment = new Payment();
payment.setType(PaymentType.OFRENDA);
payment.setAmount(request.amount());
payment.setReferenceId(offering.getId());
// ¡Falta setStatus! Inconsistencia
```

Esto viola el **principio de responsabilidad única (SRP)** ya que los controladores deben manejar HTTP, no la lógica de creación de objetos.

---

# Decisión Arquitectónica

Se propone implementar el **patrón Factory** para centralizar la creación de objetos `Payment`.

Una clase `PaymentFactory` será responsable de crear pagos según el tipo requerido.

Arquitectura propuesta:

```
Controller
    ↓
PaymentFactory (FACTORY)
    ↓
Payment (Producto)
```

---

# Patrón de Diseño Aplicado

**Factory (Patrón Creacional GoF)**

| Patrón | Propósito | Problema que Resuelve | Complejidad |
|--------|-----------|----------------------|-------------|
| Factory | Crear sin acoplamiento | Código rígido con if-else | ⭐⭐ |

Este patrón define una interfaz para crear objetos, pero permite que la fábrica decida qué clase instanciar.

---

# Principio SOLID Aplicado

**Single Responsibility Principle (SRP)**

* `PaymentFactory` tiene la única responsabilidad de crear pagos
* Los controladores ya no se preocupan por la lógica de construcción

**Open/Closed Principle (OCP)**

* Se pueden añadir nuevos tipos de pago sin modificar los controladores
* Solo se modifica o extiende la fábrica

---

# Código Actual (ANTES)

Creación directa en los controladores:

```java
// EnrollmentController.java
@PostMapping
public EnrollmentResponse create(@RequestBody EnrollmentRequest request) {
    // ... validaciones ...
    
    Enrollment enrollment = new Enrollment();
    enrollment.setPerson(person);
    enrollment.setCourse(course);
    enrollment.setStatus(EnrollmentStatus.PENDIENTE);
    enrollmentRepository.save(enrollment);

    // Creación directa de Payment - ACOPLAMIENTO
    Payment payment = new Payment();
    payment.setType(PaymentType.INSCRIPCION_CURSO);
    payment.setAmount(course.getPrice());
    payment.setReferenceId(enrollment.getId());
    paymentRepository.save(payment);

    enrollment.setPaymentId(payment.getId());
    enrollmentRepository.save(enrollment);

    return EnrollmentResponse.from(enrollment, payment);
}
```

```java
// OfferingController.java
@PostMapping
public OfferingResponse create(@RequestBody OfferingRequest request) {
    // ... validaciones ...
    
    Offering offering = new Offering();
    // ... configuración ...
    offeringRepository.save(offering);

    // Creación directa de Payment - CÓDIGO DUPLICADO
    Payment payment = new Payment();
    payment.setType(PaymentType.OFRENDA);
    payment.setAmount(request.amount());
    payment.setReferenceId(offering.getId());
    paymentRepository.save(payment);

    // ...
}
```

---

# Mejora Propuesta (DESPUÉS)

Se implementa Factory para centralizar la creación:

## PaymentFactory

```java
package com.iglesia.factory;

import com.iglesia.*;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;

/**
 * Factory para crear objetos Payment según el tipo requerido.
 * Centraliza la lógica de creación y garantiza consistencia.
 */
@Component
public class PaymentFactory {

    /**
     * Crea un pago para inscripción a curso
     */
    public Payment createEnrollmentPayment(Long enrollmentId, BigDecimal amount) {
        Payment payment = new Payment();
        payment.setType(PaymentType.INSCRIPCION_CURSO);
        payment.setAmount(amount);
        payment.setReferenceId(enrollmentId);
        payment.setStatus(PaymentStatus.INICIADO);
        payment.setAttempts(0);
        return payment;
    }

    /**
     * Crea un pago para ofrenda
     */
    public Payment createOfferingPayment(Long offeringId, BigDecimal amount) {
        Payment payment = new Payment();
        payment.setType(PaymentType.OFRENDA);
        payment.setAmount(amount);
        payment.setReferenceId(offeringId);
        payment.setStatus(PaymentStatus.INICIADO);
        payment.setAttempts(0);
        return payment;
    }

    /**
     * Factory Method genérico basado en tipo
     */
    public Payment createPayment(PaymentType type, Long referenceId, BigDecimal amount) {
        return switch (type) {
            case INSCRIPCION_CURSO -> createEnrollmentPayment(referenceId, amount);
            case OFRENDA -> createOfferingPayment(referenceId, amount);
        };
    }
}
```

## EnrollmentController utilizando Factory

```java
@RestController
@RequestMapping("/api/enrollments")
public class EnrollmentController {

    private final EnrollmentRepository enrollmentRepository;
    private final PaymentRepository paymentRepository;
    private final PaymentFactory paymentFactory;  // Inyecta Factory
    // ... otros repositorios

    public EnrollmentController(EnrollmentRepository enrollmentRepository,
                                PaymentRepository paymentRepository,
                                PaymentFactory paymentFactory,
                                /* ... */) {
        this.enrollmentRepository = enrollmentRepository;
        this.paymentRepository = paymentRepository;
        this.paymentFactory = paymentFactory;
    }

    @PostMapping
    public EnrollmentResponse create(@RequestBody EnrollmentRequest request) {
        // ... validaciones ...
        
        Enrollment enrollment = new Enrollment();
        enrollment.setPerson(person);
        enrollment.setCourse(course);
        enrollment.setStatus(EnrollmentStatus.PENDIENTE);
        enrollmentRepository.save(enrollment);

        // Usa Factory en lugar de crear directamente
        Payment payment = paymentFactory.createEnrollmentPayment(
            enrollment.getId(), 
            course.getPrice()
        );
        paymentRepository.save(payment);

        enrollment.setPaymentId(payment.getId());
        enrollmentRepository.save(enrollment);

        return EnrollmentResponse.from(enrollment, payment);
    }
}
```

## OfferingController utilizando Factory

```java
@RestController
@RequestMapping("/api/offerings")
public class OfferingController {

    private final OfferingRepository offeringRepository;
    private final PaymentRepository paymentRepository;
    private final PaymentFactory paymentFactory;  // Inyecta Factory
    // ...

    @PostMapping
    public OfferingResponse create(@RequestBody OfferingRequest request) {
        // ... validaciones ...
        
        Offering offering = new Offering();
        // ... configuración ...
        offeringRepository.save(offering);

        // Usa Factory en lugar de crear directamente
        Payment payment = paymentFactory.createOfferingPayment(
            offering.getId(), 
            request.amount()
        );
        paymentRepository.save(payment);

        offering.setPaymentId(payment.getId());
        offeringRepository.save(offering);

        return OfferingResponse.from(offering, payment);
    }
}
```

---

# Diagrama del Patrón Factory

```
┌─────────────────────────────────────────────────────────────┐
│                       Controllers                           │
│                                                             │
│  EnrollmentController         OfferingController            │
│          │                           │                      │
│          └───────────┬───────────────┘                      │
│                      │                                      │
│          paymentFactory.create...()                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
          ┌────────────────────────┐
          │    PaymentFactory      │
          │       (FACTORY)        │
          │                        │
          │ + createEnrollment...()│
          │ + createOffering...()  │
          │ + createPayment()      │
          └───────────┬────────────┘
                      │
                      ▼
          ┌────────────────────────┐
          │       Payment          │
          │      (Producto)        │
          │                        │
          │  - type                │
          │  - amount              │
          │  - status = INICIADO   │
          │  - attempts = 0        │
          └────────────────────────┘
```

---

# Extensibilidad

Si se agrega un nuevo tipo de pago (ejemplo: `DIEZMO`), solo se modifica la fábrica:

```java
// En PaymentType.java
public enum PaymentType {
    INSCRIPCION_CURSO,
    OFRENDA,
    DIEZMO  // Nuevo tipo
}

// En PaymentFactory.java - solo aquí se agrega
public Payment createTithePayment(Long personId, BigDecimal amount) {
    Payment payment = new Payment();
    payment.setType(PaymentType.DIEZMO);
    payment.setAmount(amount);
    payment.setReferenceId(personId);
    payment.setStatus(PaymentStatus.INICIADO);
    return payment;
}
```

**Los controladores existentes NO se modifican.**

---

# Beneficios Arquitectónicos

La implementación del patrón Factory proporciona:

* **desacoplamiento** entre controladores y creación de pagos
* **centralización** de la lógica de construcción
* **consistencia** en la inicialización de objetos
* **extensibilidad** para nuevos tipos de pago
* **facilidad de testing** mediante mock de la fábrica

---

# Trade-offs

| Ventaja | Desventaja |
|---------|------------|
| Creación centralizada | Una clase adicional (Factory) |
| Elimina código duplicado | Indirección en la creación |
| Fácil agregar nuevos tipos | Requiere inyección de dependencia |
| Controladores más simples | Aprender el patrón |

---

# Impacto en el Sistema

El cambio no afecta el comportamiento funcional del sistema.

Los pagos se crean igual, pero ahora la lógica está centralizada en la fábrica.

---

# Resultado Arquitectónico

Arquitectura aplicando Factory Pattern:

```
Controllers
    ↓
PaymentFactory (FACTORY)
    ↓
Payment (Producto)
```

Esta estructura implementa correctamente el **patrón Factory (GoF Creacional)** para la creación desacoplada de pagos.
