# ADR-10 — Implementación de Factory Pattern para creación de pagos

## Estado

Propuesto

---

# Contexto

Durante el análisis del sistema **ERP Iglesias** se identificó que la entidad `Payment` representa diferentes tipos de pagos realizados dentro del sistema.

Ejemplo simplificado de la entidad:

```java
@Entity
public class Payment {

    private Long id;
    private PaymentType type;
    private PaymentStatus status;
    private BigDecimal amount;
    private int attempts;
    private Long referenceId;

}
```

Dentro del sistema pueden existir distintos **tipos de pago**, por ejemplo:

* pagos de matrícula de cursos
* ofrendas realizadas por miembros
* pagos asociados a otros procesos administrativos

Actualmente la creación de pagos puede realizarse directamente mediante constructores o inicialización manual.

Ejemplo:

```java
Payment payment = new Payment();
payment.setType(PaymentType.OFFERING);
payment.setStatus(PaymentStatus.INICIADO);
payment.setAmount(amount);
payment.setAttempts(0);
payment.setReferenceId(offeringId);
```

Este enfoque distribuye la lógica de creación de pagos en distintos servicios.

---

# Problema

Cuando los objetos `Payment` se crean directamente en múltiples servicios:

* la lógica de inicialización queda **duplicada**
* se pueden crear pagos con **configuración inconsistente**
* no existe un **punto central de creación**
* los cambios en la inicialización deben replicarse en múltiples lugares

Ejemplo del problema:

```java
// En OfferingService
Payment payment = new Payment();
payment.setType(PaymentType.OFFERING);
payment.setStatus(PaymentStatus.INICIADO);

// En EnrollmentService
Payment payment = new Payment();
payment.setType(PaymentType.ENROLLMENT);
payment.setStatus(PaymentStatus.INICIADO);
```

Esto genera **duplicación de lógica y mayor riesgo de errores**.

---

# Decisión Arquitectónica

Se propone implementar el **patrón Factory** mediante una clase `PaymentFactory` que centralice la creación de objetos `Payment`.

La fábrica será responsable de:

* crear pagos según el tipo de operación
* inicializar correctamente los valores por defecto
* evitar duplicación de lógica de creación

Arquitectura propuesta:

```id="s1o3e9"
Service
   ↓
PaymentFactory (FACTORY)
   ↓
Payment (Producto)
```

---

# Patrón de Diseño Aplicado

**Factory (Patrón Creacional GoF)**

| Patrón  | Propósito                                           | Problema que Resuelve         | Complejidad |
| ------- | --------------------------------------------------- | ----------------------------- | ----------- |
| Factory | Crear objetos sin exponer su lógica de construcción | Creación duplicada de objetos | ⭐⭐          |

Este patrón encapsula la lógica de creación de objetos y proporciona un punto único para generarlos.

---

# Principio SOLID Aplicado

**Single Responsibility Principle (SRP)**

* `PaymentFactory` tiene la única responsabilidad de crear objetos `Payment`.

**Open/Closed Principle (OCP)**

* Nuevos tipos de pago pueden agregarse sin modificar los servicios existentes.

---

# Código Actual (ANTES)

Creación directa de pagos en servicios:

```java
Payment payment = new Payment();

payment.setType(PaymentType.OFFERING);
payment.setStatus(PaymentStatus.INICIADO);
payment.setAmount(amount);
payment.setAttempts(0);
payment.setReferenceId(offeringId);
```

La lógica de creación queda distribuida en múltiples servicios.

---

# Mejora Propuesta (DESPUÉS)

Se introduce una fábrica que centraliza la creación de pagos.

## PaymentFactory (Factory)

```java
@Component
public class PaymentFactory {

    public Payment createOfferingPayment(BigDecimal amount, Long offeringId) {

        Payment payment = new Payment();

        payment.setType(PaymentType.OFFERING);
        payment.setStatus(PaymentStatus.INICIADO);
        payment.setAmount(amount);
        payment.setAttempts(0);
        payment.setReferenceId(offeringId);

        return payment;
    }

    public Payment createEnrollmentPayment(BigDecimal amount, Long enrollmentId) {

        Payment payment = new Payment();

        payment.setType(PaymentType.ENROLLMENT);
        payment.setStatus(PaymentStatus.INICIADO);
        payment.setAmount(amount);
        payment.setAttempts(0);
        payment.setReferenceId(enrollmentId);

        return payment;
    }
}
```

---

## Uso en servicios

```java
@Service
public class OfferingService {

    private final PaymentFactory paymentFactory;

    public OfferingService(PaymentFactory paymentFactory) {
        this.paymentFactory = paymentFactory;
    }

    public Payment createOfferingPayment(BigDecimal amount, Long offeringId) {

        return paymentFactory.createOfferingPayment(amount, offeringId);
    }
}
```

---

# Diagrama del Patrón Factory

```id="6r4mpb"
┌──────────────────────────────┐
│           Service            │
│ (OfferingService / Course)   │
└───────────────┬──────────────┘
                │
                ▼
┌──────────────────────────────┐
│        PaymentFactory        │
│           (FACTORY)          │
│                              │
│ + createOfferingPayment()    │
│ + createEnrollmentPayment()  │
└───────────────┬──────────────┘
                │
                ▼
┌──────────────────────────────┐
│            Payment           │
│           (Producto)         │
└──────────────────────────────┘
```

---

# Beneficios Arquitectónicos

La implementación del patrón Factory proporciona:

* **centralización de la creación de pagos**
* reducción de duplicación de código
* mayor consistencia en la inicialización
* facilidad para agregar nuevos tipos de pago
* mejor mantenibilidad del sistema

---

# Trade-offs

| Ventaja                          | Desventaja                       |
| -------------------------------- | -------------------------------- |
| Creación centralizada de objetos | Introduce una capa adicional     |
| Reduce duplicación de código     | Puede crecer si hay muchos tipos |
| Facilita extensión del sistema   | Dependencia de la fábrica        |
| Mejora mantenibilidad            | Requiere refactorización inicial |

---

# Impacto en el Sistema

El cambio no altera el comportamiento funcional del sistema.

La lógica de creación de pagos ahora se encuentra centralizada en una única clase, lo que mejora la mantenibilidad y consistencia del código.

---

# Resultado Arquitectónico

Arquitectura aplicando Factory Pattern:

```id="9if5te"
Service
   ↓
PaymentFactory (FACTORY)
   ↓
Payment
```

Esta estructura implementa correctamente el **patrón Factory (GoF Creacional)** para la creación centralizada de objetos `Payment`.
