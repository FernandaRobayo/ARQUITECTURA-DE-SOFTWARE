# ADR-02 — Implementación del patrón Factory para la creación de pagos

## Información general

| Campo | Valor |
|------|------|
| ID | ADR-02 |
| Título | Implementación del patrón Factory para la creación de pagos |
| Tipo | Backend |
| Estado | Aceptado |
| Fecha | 2026 |
| Proyecto | ERP Iglesias |

---

# Contexto

El sistema ERP desarrollado para la gestión administrativa de iglesias permite manejar diferentes procesos del dominio del negocio, entre ellos:

- gestión de iglesias  
- gestión de personas  
- gestión de cursos  
- inscripción de personas a cursos  
- registro de ofrendas  
- gestión de pagos  

Dentro del sistema, la entidad **Payment** representa las transacciones económicas generadas por las operaciones del sistema.

Estas transacciones se producen principalmente cuando ocurren dos procesos:

- inscripción a cursos  
- registro de ofrendas  

Inicialmente, los pagos eran creados directamente dentro de los controladores del backend.

Los controladores involucrados eran:

- `EnrollmentController`
- `OfferingController`

La creación de pagos se realizaba de forma directa mediante instrucciones como:

```java
Payment payment = new Payment();
payment.setType(...);
payment.setAmount(...);
payment.setReferenceId(...);
payment.setStatus(...);
payment.setAttempts(...);
```

Esta lógica estaba duplicada en múltiples controladores del sistema.

---

# Problema identificado

La creación directa de objetos **Payment** dentro de los controladores generaba varios problemas de diseño arquitectónico.

## Duplicación de código

Cada controlador implementaba su propia lógica para crear pagos, generando repetición de código en diferentes partes del sistema.

## Alto acoplamiento

Los controladores dependían directamente de la construcción de la entidad **Payment**, generando un fuerte acoplamiento entre los controladores y el modelo de dominio.

## Dificultad de mantenimiento

Si se requería modificar la forma en que se crean los pagos, era necesario modificar múltiples controladores.

## Violación de principios SOLID

Principalmente se estaba violando el principio:

**Single Responsibility Principle (SRP)**

Los controladores estaban realizando múltiples responsabilidades:

- gestionar peticiones HTTP  
- crear objetos de dominio  

---

# Decisión arquitectónica

Para resolver este problema se decidió aplicar el **patrón de diseño creacional Factory**.

El patrón **Factory** permite encapsular la creación de objetos dentro de una clase especializada.

En lugar de que los controladores creen directamente los objetos **Payment**, delegan esta responsabilidad a una fábrica.

Se creó la clase:

**PaymentFactory**

Esta clase se encarga de:

- construir objetos **Payment**
- inicializar correctamente sus atributos
- centralizar la lógica de creación de pagos

---

# Implementación

Se creó el archivo:

```
backend/src/main/java/com/iglesia/PaymentFactory.java
```

Implementación de la fábrica:

```java
package com.iglesia;

import org.springframework.stereotype.Component;
import java.math.BigDecimal;

@Component
public class PaymentFactory {

    public Payment createEnrollmentPayment(Long enrollmentId, BigDecimal amount) {

        Payment payment = new Payment();
        payment.setType(PaymentType.INSCRIPCION_CURSO);
        payment.setAmount(amount);
        payment.setReferenceId(enrollmentId);
        payment.setStatus(PaymentStatus.INICIADO);
        payment.setAttempts(0);

        return payment;
    }

    public Payment createOfferingPayment(Long offeringId, BigDecimal amount) {

        Payment payment = new Payment();
        payment.setType(PaymentType.OFRENDA);
        payment.setAmount(amount);
        payment.setReferenceId(offeringId);
        payment.setStatus(PaymentStatus.INICIADO);
        payment.setAttempts(0);

        return payment;
    }
}
```

Esta clase permite crear distintos tipos de pagos dependiendo del contexto del sistema.

---

# Cambios realizados en el sistema

Para utilizar la fábrica se modificaron los siguientes controladores:

- `EnrollmentController`
- `OfferingController`

Antes los controladores creaban directamente los pagos.

Ejemplo antes del cambio:

```java
Payment payment = new Payment();
payment.setType(PaymentType.INSCRIPCION_CURSO);
payment.setAmount(course.getPrice());
```

Después del cambio los controladores utilizan la fábrica:

```java
Payment payment = paymentFactory.createEnrollmentPayment(
    enrollment.getId(),
    course.getPrice()
);
```

De esta manera la lógica de creación queda centralizada en una única clase.

---

# Arquitectura antes del cambio

Antes de aplicar el patrón Factory, cada controlador creaba directamente los pagos.

```
EnrollmentController
        ↓
     new Payment()

OfferingController
        ↓
     new Payment()
```

Esto producía duplicación de código y mayor acoplamiento.

---

# Arquitectura después del cambio

Después de aplicar el patrón Factory, la creación de pagos se centraliza en la fábrica.

```
EnrollmentController
OfferingController
        ↓
    PaymentFactory
        ↓
       Payment
```

Los controladores delegan la responsabilidad de creación de objetos.

---

# Beneficios obtenidos

La implementación del patrón Factory permitió mejorar la arquitectura del sistema.

## Centralización de la creación de objetos

Toda la lógica de creación de pagos se encuentra en una sola clase.

## Reducción de duplicación de código

Los controladores ya no repiten la lógica de creación.

## Mejor mantenibilidad

Si se requiere modificar la forma de crear pagos, solo se modifica la fábrica.

## Mayor extensibilidad

Si se agregan nuevos tipos de pagos, estos pueden implementarse dentro de la fábrica sin modificar los controladores.

---

# Relación con principios SOLID

La implementación del patrón Factory contribuye al cumplimiento de principios de diseño.

## Single Responsibility Principle (SRP)

La responsabilidad de crear pagos se delega a una clase especializada (**PaymentFactory**).

Los controladores se enfocan únicamente en manejar las peticiones HTTP.

## Open Closed Principle (OCP)

La lógica de creación de pagos puede extenderse dentro de la fábrica sin modificar los controladores.

---

# Pruebas realizadas

Para verificar que la implementación no afectara el funcionamiento del sistema se realizaron pruebas funcionales utilizando los endpoints del backend.

## Prueba 1 — Inscripción a curso

Endpoint utilizado:

```
POST /api/enrollments
```

Resultado esperado:

- se crea la inscripción  
- se genera un registro en **Payment**  
- el **paymentId** queda asociado a la inscripción  

Resultado obtenido:

La inscripción se creó correctamente y el pago fue registrado en el sistema.

---

## Prueba 2 — Registro de ofrenda

Endpoint utilizado:

```
POST /api/offerings
```

Resultado esperado:

- se registra la ofrenda  
- se genera un pago asociado  

Resultado obtenido:

El pago fue creado correctamente y almacenado en la base de datos.

---

# Evidencia del funcionamiento

Durante las pruebas se verificó que:

- los controladores utilizan **PaymentFactory**
- los pagos se crean correctamente
- la funcionalidad del sistema se mantiene intacta
- no se generaron errores en el flujo de pagos

---

# Conclusión

La aplicación del patrón **Factory** permitió mejorar la arquitectura del sistema al centralizar la creación de objetos **Payment**.

Este cambio permite:

- reducir duplicación de código
- mejorar la mantenibilidad del sistema
- reducir el acoplamiento entre componentes
- facilitar la extensión futura del sistema

El sistema continúa funcionando correctamente después de aplicar esta mejora arquitectónica.