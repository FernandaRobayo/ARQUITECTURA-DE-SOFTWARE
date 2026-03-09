# ADR-03 — Implementación de Builder Pattern para construcción de inscripciones

## Estado

Propuesto

---

# Contexto

Durante el análisis del sistema **ERP Iglesias** se identificó que la creación de inscripciones (`Enrollment`) es un proceso complejo que requiere múltiples pasos.

En `EnrollmentController`:

```java
@PostMapping
public EnrollmentResponse create(@RequestBody EnrollmentRequest request) {
    Church church = requireChurch();
    Person person = personRepository.findById(request.personId())
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Persona no encontrada"));
    Course course = courseRepository.findById(request.courseId())
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Curso no encontrado"));

    if (!person.getChurch().getId().equals(church.getId())
        || !course.getChurch().getId().equals(church.getId())) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Datos no pertenecen a la iglesia");
    }

    Enrollment enrollment = new Enrollment();
    enrollment.setPerson(person);
    enrollment.setCourse(course);
    enrollment.setStatus(EnrollmentStatus.PENDIENTE);
    enrollmentRepository.save(enrollment);

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

Este código tiene **constructores complejos** donde se deben configurar múltiples atributos en un orden específico.

---

# Problema

Cuando la construcción de objetos complejos se realiza paso a paso en el controlador:

* el código es difícil de leer y mantener
* es fácil olvidar un paso de configuración
* las validaciones están mezcladas con la construcción
* no existe un proceso de construcción claro y autodocumentado
* es difícil reutilizar la lógica en otros contextos

Problemas específicos:

```java
// ¿Cuál es el orden correcto?
enrollment.setPerson(person);    // ¿Primero?
enrollment.setCourse(course);    // ¿Segundo?
enrollment.setStatus(...);       // ¿Cuándo?

// ¿Se hizo la validación antes de construir?
// ¿Se guardó el enrollment antes de crear el payment?
// ¿Se vinculó el payment al enrollment?
```

Esto genera **constructores complejos** que violan el **principio de responsabilidad única (SRP)**.

---

# Decisión Arquitectónica

Se propone implementar el **patrón Builder** para construir objetos `Enrollment` paso a paso de forma fluida.

El Builder guiará el proceso de construcción asegurando que todos los pasos se ejecuten correctamente.

Arquitectura propuesta:

```
Controller
    ↓
EnrollmentBuilder (BUILDER)
    ↓
┌─────────────────────┐
│ Enrollment + Payment│
└─────────────────────┘
```

---

# Patrón de Diseño Aplicado

**Builder (Patrón Creacional GoF)**

| Patrón | Propósito | Problema que Resuelve | Complejidad |
|--------|-----------|----------------------|-------------|
| Builder | Construir paso a paso | Constructores complejos | ⭐⭐⭐ |

Este patrón separa la construcción de un objeto complejo de su representación, permitiendo crear diferentes configuraciones con el mismo proceso.

---

# Principio SOLID Aplicado

**Single Responsibility Principle (SRP)**

* `EnrollmentBuilder` tiene la única responsabilidad de construir inscripciones
* El controlador ya no maneja la lógica de construcción

**Open/Closed Principle (OCP)**

* Se pueden añadir nuevos pasos de construcción sin modificar el código existente

---

# Código Actual (ANTES)

Construcción compleja directamente en el controlador:

```java
@PostMapping
public EnrollmentResponse create(@RequestBody EnrollmentRequest request) {
    Church church = requireChurch();
    
    // Paso 1: Buscar persona
    Person person = personRepository.findById(request.personId())
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Persona no encontrada"));
    
    // Paso 2: Buscar curso
    Course course = courseRepository.findById(request.courseId())
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Curso no encontrado"));

    // Paso 3: Validar pertenencia
    if (!person.getChurch().getId().equals(church.getId())
        || !course.getChurch().getId().equals(church.getId())) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Datos no pertenecen a la iglesia");
    }

    // Paso 4: Construir Enrollment
    Enrollment enrollment = new Enrollment();
    enrollment.setPerson(person);
    enrollment.setCourse(course);
    enrollment.setStatus(EnrollmentStatus.PENDIENTE);
    enrollmentRepository.save(enrollment);

    // Paso 5: Construir Payment
    Payment payment = new Payment();
    payment.setType(PaymentType.INSCRIPCION_CURSO);
    payment.setAmount(course.getPrice());
    payment.setReferenceId(enrollment.getId());
    paymentRepository.save(payment);

    // Paso 6: Vincular
    enrollment.setPaymentId(payment.getId());
    enrollmentRepository.save(enrollment);

    return EnrollmentResponse.from(enrollment, payment);
}
```

---

# Mejora Propuesta (DESPUÉS)

Se implementa Builder para construcción paso a paso:

## EnrollmentBuilder

```java
package com.iglesia.builder;

import com.iglesia.*;
import java.math.BigDecimal;

/**
 * Builder para construir Enrollment con su Payment asociado.
 * Proporciona una interfaz fluida para construcción paso a paso.
 */
public class EnrollmentBuilder {

    private Person person;
    private Course course;
    private Church church;
    private EnrollmentStatus status = EnrollmentStatus.PENDIENTE;
    
    // Productos construidos
    private Enrollment enrollment;
    private Payment payment;

    /**
     * Paso 1: Establecer persona
     */
    public EnrollmentBuilder withPerson(Person person) {
        this.person = person;
        return this;
    }

    /**
     * Paso 2: Establecer curso
     */
    public EnrollmentBuilder withCourse(Course course) {
        this.course = course;
        return this;
    }

    /**
     * Paso 3: Establecer iglesia (para validación)
     */
    public EnrollmentBuilder withChurch(Church church) {
        this.church = church;
        return this;
    }

    /**
     * Paso opcional: Establecer estado inicial
     */
    public EnrollmentBuilder withStatus(EnrollmentStatus status) {
        this.status = status;
        return this;
    }

    /**
     * Paso 4: Validar datos antes de construir
     */
    public EnrollmentBuilder validate() {
        if (person == null) {
            throw new IllegalStateException("Person es requerido");
        }
        if (course == null) {
            throw new IllegalStateException("Course es requerido");
        }
        if (church == null) {
            throw new IllegalStateException("Church es requerido");
        }
        
        // Validar pertenencia a la iglesia
        if (!person.getChurch().getId().equals(church.getId())) {
            throw new IllegalArgumentException("Persona no pertenece a la iglesia");
        }
        if (!course.getChurch().getId().equals(church.getId())) {
            throw new IllegalArgumentException("Curso no pertenece a la iglesia");
        }
        
        return this;
    }

    /**
     * Paso 5: Construir el Enrollment
     */
    public EnrollmentBuilder buildEnrollment() {
        this.enrollment = new Enrollment();
        this.enrollment.setPerson(person);
        this.enrollment.setCourse(course);
        this.enrollment.setStatus(status);
        return this;
    }

    /**
     * Paso 6: Construir el Payment asociado
     */
    public EnrollmentBuilder buildPayment() {
        if (enrollment == null) {
            throw new IllegalStateException("Debe llamar buildEnrollment() primero");
        }
        
        this.payment = new Payment();
        this.payment.setType(PaymentType.INSCRIPCION_CURSO);
        this.payment.setAmount(course.getPrice());
        this.payment.setStatus(PaymentStatus.INICIADO);
        return this;
    }

    /**
     * Paso final: Obtener el resultado
     */
    public EnrollmentResult build() {
        return new EnrollmentResult(enrollment, payment);
    }

    /**
     * Clase que encapsula el resultado de la construcción
     */
    public static class EnrollmentResult {
        private final Enrollment enrollment;
        private final Payment payment;

        public EnrollmentResult(Enrollment enrollment, Payment payment) {
            this.enrollment = enrollment;
            this.payment = payment;
        }

        public Enrollment getEnrollment() {
            return enrollment;
        }

        public Payment getPayment() {
            return payment;
        }
    }
}
```

## EnrollmentService utilizando Builder

```java
@Service
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final PersonRepository personRepository;
    private final CourseRepository courseRepository;
    private final PaymentRepository paymentRepository;
    private final ChurchRepository churchRepository;

    public EnrollmentService(/* inyección de dependencias */) {
        // ...
    }

    @Transactional
    public EnrollmentBuilder.EnrollmentResult createEnrollment(Long personId, Long courseId) {
        
        Church church = requireChurch();
        Person person = personRepository.findById(personId)
            .orElseThrow(() -> new RuntimeException("Persona no encontrada"));
        Course course = courseRepository.findById(courseId)
            .orElseThrow(() -> new RuntimeException("Curso no encontrado"));

        // Uso del Builder - interfaz fluida, paso a paso
        EnrollmentBuilder.EnrollmentResult result = new EnrollmentBuilder()
            .withPerson(person)          // Paso 1
            .withCourse(course)          // Paso 2
            .withChurch(church)          // Paso 3
            .validate()                   // Paso 4: Validar
            .buildEnrollment()           // Paso 5: Construir Enrollment
            .buildPayment()              // Paso 6: Construir Payment
            .build();                    // Obtener resultado

        // Persistir
        Enrollment enrollment = result.getEnrollment();
        enrollmentRepository.save(enrollment);

        Payment payment = result.getPayment();
        payment.setReferenceId(enrollment.getId());
        paymentRepository.save(payment);

        enrollment.setPaymentId(payment.getId());
        enrollmentRepository.save(enrollment);

        return result;
    }

    private Church requireChurch() {
        return churchRepository.findAll().stream().findFirst()
            .orElseThrow(() -> new RuntimeException("Debe registrar una iglesia primero"));
    }
}
```

## Controller después del cambio

```java
@RestController
@RequestMapping("/api/enrollments")
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    public EnrollmentController(EnrollmentService enrollmentService) {
        this.enrollmentService = enrollmentService;
    }

    @PostMapping
    public EnrollmentResponse create(@RequestBody EnrollmentRequest request) {
        // Controlador simplificado - delega al servicio
        EnrollmentBuilder.EnrollmentResult result = 
            enrollmentService.createEnrollment(request.personId(), request.courseId());

        return EnrollmentResponse.from(
            result.getEnrollment(), 
            result.getPayment()
        );
    }
}
```

---

# Diagrama del Patrón Builder

```
┌─────────────────────────────────────────────────────────────┐
│                    EnrollmentService                        │
│                                                             │
│   new EnrollmentBuilder()                                   │
│       .withPerson(person)       // Paso 1                   │
│       .withCourse(course)       // Paso 2                   │
│       .withChurch(church)       // Paso 3                   │
│       .validate()               // Paso 4                   │
│       .buildEnrollment()        // Paso 5                   │
│       .buildPayment()           // Paso 6                   │
│       .build()                  // Resultado                │
│                                                             │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │   EnrollmentBuilder    │
              │       (BUILDER)        │
              │                        │
              │  - person              │
              │  - course              │
              │  - church              │
              │  - enrollment          │
              │  - payment             │
              │                        │
              │  + withPerson()        │
              │  + withCourse()        │
              │  + validate()          │
              │  + buildEnrollment()   │
              │  + buildPayment()      │
              │  + build()             │
              └───────────┬────────────┘
                          │
                          ▼
              ┌────────────────────────┐
              │   EnrollmentResult     │
              │      (Producto)        │
              │                        │
              │  - Enrollment          │
              │  - Payment             │
              └────────────────────────┘
```

---

# Interfaz Fluida

El Builder proporciona una **interfaz fluida** que hace el código autodocumentado:

```java
// Se lee como instrucciones paso a paso
EnrollmentResult result = new EnrollmentBuilder()
    .withPerson(person)       // "con esta persona"
    .withCourse(course)       // "para este curso"
    .withChurch(church)       // "en esta iglesia"
    .validate()               // "validar los datos"
    .buildEnrollment()        // "construir la inscripción"
    .buildPayment()           // "construir el pago"
    .build();                 // "obtener el resultado"
```

---

# Beneficios Arquitectónicos

La implementación del patrón Builder proporciona:

* **interfaz fluida** que hace el código legible
* **proceso de construcción explícito** y autodocumentado
* **validación integrada** antes de construir
* **separación** entre configuración y construcción
* **reutilización** del builder en diferentes contextos

---

# Trade-offs

| Ventaja | Desventaja |
|---------|------------|
| Código más legible | Más clases (Builder, Result) |
| Proceso explícito paso a paso | Mayor complejidad inicial |
| Validaciones centralizadas | Puede ser excesivo para objetos simples |
| Fácil de extender | Requiere entender el patrón |

---

# Impacto en el Sistema

El cambio no afecta el comportamiento funcional del sistema.

Las inscripciones se crean igual, pero el proceso está encapsulado en un Builder reutilizable y mantenible.

---

# Resultado Arquitectónico

Arquitectura aplicando Builder Pattern:

```
Controller
    ↓
Service
    ↓
EnrollmentBuilder (BUILDER)
    ↓
EnrollmentResult
    ├── Enrollment
    └── Payment
```

Esta estructura implementa correctamente el **patrón Builder (GoF Creacional)** para la construcción de objetos complejos paso a paso.
