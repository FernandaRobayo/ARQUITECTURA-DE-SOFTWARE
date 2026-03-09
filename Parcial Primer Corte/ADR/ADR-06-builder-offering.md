# ADR-06 — Implementación de Builder Pattern para construcción de ofrendas

## Estado

Propuesto

---

# Contexto

Durante el análisis del sistema **ERP Iglesias** se identificó que la creación de ofrendas (`Offering`) también es un proceso complejo similar al de inscripciones.

En `OfferingController`:

```java
@PostMapping
public OfferingResponse create(@RequestBody OfferingRequest request) {
    Church church = requireChurch();
    Person person = personRepository.findById(request.personId())
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Persona no encontrada"));

    if (!person.getChurch().getId().equals(church.getId())) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Persona no pertenece a la iglesia");
    }

    Offering offering = new Offering();
    offering.setPerson(person);
    offering.setAmount(request.amount());
    offering.setConcept(request.concept());
    offering.setStatus(OfferingStatus.PENDIENTE);
    offeringRepository.save(offering);

    Payment payment = new Payment();
    payment.setType(PaymentType.OFRENDA);
    payment.setAmount(request.amount());
    payment.setReferenceId(offering.getId());
    paymentRepository.save(payment);

    offering.setPaymentId(payment.getId());
    offeringRepository.save(offering);

    return OfferingResponse.from(offering, payment);
}
```

Este código tiene **constructores complejos** que deben configurar múltiples atributos en un orden específico.

---

# Problema

La creación de ofrendas presenta los mismos problemas que las inscripciones:

* múltiples pasos de configuración en el controlador
* validaciones mezcladas con construcción
* código difícil de leer y mantener
* es fácil olvidar un paso
* lógica duplicada con Enrollment

Comparación:

```java
// En OfferingController - pasos similares
Offering offering = new Offering();
offering.setPerson(person);
offering.setAmount(request.amount());
offering.setConcept(request.concept());
offering.setStatus(OfferingStatus.PENDIENTE);

Payment payment = new Payment();
payment.setType(PaymentType.OFRENDA);
// ...

// En EnrollmentController - misma estructura
Enrollment enrollment = new Enrollment();
enrollment.setPerson(person);
enrollment.setCourse(course);
enrollment.setStatus(EnrollmentStatus.PENDIENTE);

Payment payment = new Payment();
payment.setType(PaymentType.INSCRIPCION_CURSO);
// ...
```

---

# Decisión Arquitectónica

Se propone implementar el **patrón Builder** para construir objetos `Offering` paso a paso.

El Builder proporcionará una interfaz fluida similar a la de `EnrollmentBuilder`.

Arquitectura propuesta:

```
Controller
    ↓
OfferingBuilder (BUILDER)
    ↓
┌─────────────────────┐
│ Offering + Payment  │
└─────────────────────┘
```

---

# Patrón de Diseño Aplicado

**Builder (Patrón Creacional GoF)**

| Patrón | Propósito | Problema que Resuelve | Complejidad |
|--------|-----------|----------------------|-------------|
| Builder | Construir paso a paso | Constructores complejos | ⭐⭐⭐ |

---

# Principio SOLID Aplicado

**Single Responsibility Principle (SRP)**

* `OfferingBuilder` tiene la única responsabilidad de construir ofrendas
* El controlador solo maneja HTTP

**Don't Repeat Yourself (DRY)**

* La lógica de construcción está centralizada, evitando duplicación

---

# Código Actual (ANTES)

Construcción compleja en el controlador:

```java
@PostMapping
public OfferingResponse create(@RequestBody OfferingRequest request) {
    Church church = requireChurch();
    
    // Paso 1: Buscar persona
    Person person = personRepository.findById(request.personId())
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Persona no encontrada"));

    // Paso 2: Validar pertenencia
    if (!person.getChurch().getId().equals(church.getId())) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Persona no pertenece a la iglesia");
    }

    // Paso 3: Construir Offering
    Offering offering = new Offering();
    offering.setPerson(person);
    offering.setAmount(request.amount());
    offering.setConcept(request.concept());
    offering.setStatus(OfferingStatus.PENDIENTE);
    offeringRepository.save(offering);

    // Paso 4: Construir Payment
    Payment payment = new Payment();
    payment.setType(PaymentType.OFRENDA);
    payment.setAmount(request.amount());
    payment.setReferenceId(offering.getId());
    paymentRepository.save(payment);

    // Paso 5: Vincular
    offering.setPaymentId(payment.getId());
    offeringRepository.save(offering);

    return OfferingResponse.from(offering, payment);
}
```

---

# Mejora Propuesta (DESPUÉS)

Se implementa Builder para construcción paso a paso:

## OfferingBuilder

```java
package com.iglesia.builder;

import com.iglesia.*;
import java.math.BigDecimal;

/**
 * Builder para construir Offering con su Payment asociado.
 * Proporciona una interfaz fluida para construcción paso a paso.
 */
public class OfferingBuilder {

    private Person person;
    private Church church;
    private BigDecimal amount;
    private String concept;
    private OfferingStatus status = OfferingStatus.PENDIENTE;
    
    // Productos construidos
    private Offering offering;
    private Payment payment;

    /**
     * Paso 1: Establecer persona que hace la ofrenda
     */
    public OfferingBuilder withPerson(Person person) {
        this.person = person;
        return this;
    }

    /**
     * Paso 2: Establecer iglesia (para validación)
     */
    public OfferingBuilder withChurch(Church church) {
        this.church = church;
        return this;
    }

    /**
     * Paso 3: Establecer monto de la ofrenda
     */
    public OfferingBuilder withAmount(BigDecimal amount) {
        this.amount = amount;
        return this;
    }

    /**
     * Paso 4: Establecer concepto de la ofrenda
     */
    public OfferingBuilder withConcept(String concept) {
        this.concept = concept;
        return this;
    }

    /**
     * Paso opcional: Establecer estado inicial
     */
    public OfferingBuilder withStatus(OfferingStatus status) {
        this.status = status;
        return this;
    }

    /**
     * Paso 5: Validar datos antes de construir
     */
    public OfferingBuilder validate() {
        if (person == null) {
            throw new IllegalStateException("Person es requerido");
        }
        if (church == null) {
            throw new IllegalStateException("Church es requerido");
        }
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalStateException("Amount debe ser mayor a cero");
        }
        if (concept == null || concept.isBlank()) {
            throw new IllegalStateException("Concept es requerido");
        }
        
        // Validar pertenencia a la iglesia
        if (!person.getChurch().getId().equals(church.getId())) {
            throw new IllegalArgumentException("Persona no pertenece a la iglesia");
        }
        
        return this;
    }

    /**
     * Paso 6: Construir el Offering
     */
    public OfferingBuilder buildOffering() {
        this.offering = new Offering();
        this.offering.setPerson(person);
        this.offering.setAmount(amount);
        this.offering.setConcept(concept);
        this.offering.setStatus(status);
        return this;
    }

    /**
     * Paso 7: Construir el Payment asociado
     */
    public OfferingBuilder buildPayment() {
        if (offering == null) {
            throw new IllegalStateException("Debe llamar buildOffering() primero");
        }
        
        this.payment = new Payment();
        this.payment.setType(PaymentType.OFRENDA);
        this.payment.setAmount(amount);
        this.payment.setStatus(PaymentStatus.INICIADO);
        return this;
    }

    /**
     * Paso final: Obtener el resultado
     */
    public OfferingResult build() {
        return new OfferingResult(offering, payment);
    }

    /**
     * Clase que encapsula el resultado de la construcción
     */
    public static class OfferingResult {
        private final Offering offering;
        private final Payment payment;

        public OfferingResult(Offering offering, Payment payment) {
            this.offering = offering;
            this.payment = payment;
        }

        public Offering getOffering() {
            return offering;
        }

        public Payment getPayment() {
            return payment;
        }
    }
}
```

## OfferingService utilizando Builder

```java
@Service
public class OfferingService {

    private final OfferingRepository offeringRepository;
    private final PersonRepository personRepository;
    private final PaymentRepository paymentRepository;
    private final ChurchRepository churchRepository;

    public OfferingService(/* inyección de dependencias */) {
        // ...
    }

    @Transactional
    public OfferingBuilder.OfferingResult createOffering(
            Long personId, 
            BigDecimal amount, 
            String concept) {
        
        Church church = requireChurch();
        Person person = personRepository.findById(personId)
            .orElseThrow(() -> new RuntimeException("Persona no encontrada"));

        // Uso del Builder - interfaz fluida
        OfferingBuilder.OfferingResult result = new OfferingBuilder()
            .withPerson(person)          // Paso 1
            .withChurch(church)          // Paso 2
            .withAmount(amount)          // Paso 3
            .withConcept(concept)        // Paso 4
            .validate()                   // Paso 5: Validar
            .buildOffering()             // Paso 6: Construir Offering
            .buildPayment()              // Paso 7: Construir Payment
            .build();                    // Obtener resultado

        // Persistir
        Offering offering = result.getOffering();
        offeringRepository.save(offering);

        Payment payment = result.getPayment();
        payment.setReferenceId(offering.getId());
        paymentRepository.save(payment);

        offering.setPaymentId(payment.getId());
        offeringRepository.save(offering);

        return result;
    }

    private Church requireChurch() {
        return churchRepository.findAll().stream().findFirst()
            .orElseThrow(() -> new RuntimeException("Debe registrar una iglesia primero"));
    }
}
```

## Controller simplificado

```java
@RestController
@RequestMapping("/api/offerings")
public class OfferingController {

    private final OfferingService offeringService;

    public OfferingController(OfferingService offeringService) {
        this.offeringService = offeringService;
    }

    @PostMapping
    public OfferingResponse create(@RequestBody OfferingRequest request) {
        // Controlador simplificado - delega al servicio
        OfferingBuilder.OfferingResult result = offeringService.createOffering(
            request.personId(),
            request.amount(),
            request.concept()
        );

        return OfferingResponse.from(
            result.getOffering(), 
            result.getPayment()
        );
    }
}
```

---

# Diagrama del Patrón Builder

```
┌─────────────────────────────────────────────────────────────┐
│                     OfferingService                         │
│                                                             │
│   new OfferingBuilder()                                     │
│       .withPerson(person)       // Paso 1                   │
│       .withChurch(church)       // Paso 2                   │
│       .withAmount(amount)       // Paso 3                   │
│       .withConcept(concept)     // Paso 4                   │
│       .validate()               // Paso 5                   │
│       .buildOffering()          // Paso 6                   │
│       .buildPayment()           // Paso 7                   │
│       .build()                  // Resultado                │
│                                                             │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │    OfferingBuilder     │
              │       (BUILDER)        │
              │                        │
              │  - person              │
              │  - church              │
              │  - amount              │
              │  - concept             │
              │  - offering            │
              │  - payment             │
              │                        │
              │  + withPerson()        │
              │  + withAmount()        │
              │  + validate()          │
              │  + buildOffering()     │
              │  + buildPayment()      │
              │  + build()             │
              └───────────┬────────────┘
                          │
                          ▼
              ┌────────────────────────┐
              │    OfferingResult      │
              │      (Producto)        │
              │                        │
              │  - Offering            │
              │  - Payment             │
              └────────────────────────┘
```

---

# Comparación con EnrollmentBuilder

Ambos builders siguen el mismo patrón pero para diferentes entidades:

```java
// EnrollmentBuilder
new EnrollmentBuilder()
    .withPerson(person)
    .withCourse(course)      // Específico de Enrollment
    .withChurch(church)
    .validate()
    .buildEnrollment()
    .buildPayment()
    .build();

// OfferingBuilder
new OfferingBuilder()
    .withPerson(person)
    .withAmount(amount)      // Específico de Offering
    .withConcept(concept)    // Específico de Offering
    .withChurch(church)
    .validate()
    .buildOffering()
    .buildPayment()
    .build();
```

---

# Beneficios Arquitectónicos

La implementación del patrón Builder proporciona:

* **interfaz fluida** consistente con EnrollmentBuilder
* **proceso de construcción claro** y autodocumentado
* **validación integrada** antes de construir
* **código reutilizable** y mantenible
* **controladores simplificados**

---

# Trade-offs

| Ventaja | Desventaja |
|---------|------------|
| Código legible | Más clases |
| Proceso paso a paso | Mayor complejidad inicial |
| Validaciones claras | Curva de aprendizaje |
| Consistencia con Enrollment | Puede ser excesivo para casos simples |

---

# Impacto en el Sistema

El cambio no afecta el comportamiento funcional del sistema.

Las ofrendas se crean igual, pero con un proceso más claro y mantenible.

---

# Resultado Arquitectónico

Arquitectura aplicando Builder Pattern:

```
Controller
    ↓
Service
    ↓
OfferingBuilder (BUILDER)
    ↓
OfferingResult
    ├── Offering
    └── Payment
```

Esta estructura implementa correctamente el **patrón Builder (GoF Creacional)** para la construcción de ofrendas.
