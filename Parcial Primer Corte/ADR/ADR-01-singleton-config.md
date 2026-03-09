# ADR-01 — Implementación de Singleton Pattern para configuración centralizada

## Estado

Propuesto

---

# Contexto

Durante el análisis del sistema **ERP Iglesias** se identificó que la configuración de JWT se encuentra en `JwtService`:

```java
@Component
public class JwtService {
    private final Key key;
    private final int expirationMinutes;

    public JwtService(@Value("${app.jwt.secret}") String secret,
                      @Value("${app.jwt.expiration-minutes}") int expirationMinutes) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMinutes = expirationMinutes;
    }
}
```

Actualmente las configuraciones están dispersas en múltiples clases usando `@Value`, lo que dificulta:

* tener una visión global de los parámetros del sistema
* garantizar que solo exista una instancia de configuración
* documentar y auditar los valores configurados

---

# Problema

Cuando las configuraciones se leen de forma independiente en cada clase:

* se pueden crear múltiples instancias con valores diferentes
* no existe un punto único de acceso a la configuración
* es difícil verificar la consistencia de los parámetros
* los valores por defecto están duplicados

Ejemplo de configuración dispersa:

```java
// En JwtService
@Value("${app.jwt.secret}") String secret;

// En otro servicio
@Value("${app.payment.max-retries:3}") int maxRetries;

// En otro lugar, posiblemente con valor diferente
@Value("${app.payment.max-retries:5}") int maxRetries;  // ¡Inconsistente!
```

Esto viola el **principio de responsabilidad única (SRP)** ya que cada clase debe preocuparse por leer su configuración.

---

# Decisión Arquitectónica

Se propone implementar el **patrón Singleton** mediante una clase `AppConfig` que centralice todas las configuraciones del sistema.

Esta clase garantizará:

* una única instancia de configuración
* punto de acceso global a los parámetros
* consistencia en los valores por defecto

Arquitectura propuesta:

```
application.properties
        ↓
AppConfig (SINGLETON)
        ↓
┌────────────────────────────────────┐
│ JwtService │ PaymentService │ ... │
└────────────────────────────────────┘
```

---

# Patrón de Diseño Aplicado

**Singleton (Patrón Creacional GoF)**

| Patrón | Propósito | Problema que Resuelve | Complejidad |
|--------|-----------|----------------------|-------------|
| Singleton | Una única instancia | Múltiples instancias inconsistentes | ⭐ |

Este patrón asegura que una clase tenga **una única instancia** y proporciona un **punto de acceso global** a ella.

---

# Principio SOLID Aplicado

**Single Responsibility Principle (SRP)**

* `AppConfig` tiene la única responsabilidad de gestionar configuraciones
* Los servicios ya no se preocupan por leer valores de properties

**Dependency Inversion Principle (DIP)**

* Los servicios dependen de la abstracción `AppConfig`, no de valores `@Value` dispersos

---

# Código Actual (ANTES)

Configuración dispersa en múltiples clases:

```java
// JwtService.java - lee su propia configuración
@Component
public class JwtService {
    @Value("${app.jwt.secret}")
    private String secret;
    
    @Value("${app.jwt.expiration-minutes}")
    private int expirationMinutes;
}

// PaymentController.java - valor hardcodeado
@RestController
public class PaymentController {
    // No es configurable, hardcodeado
    private static final int MAX_PAYMENT_ATTEMPTS = 3;
    
    if (payment.getAttempts() >= 3) {  // Hardcodeado aquí también
        throw new ResponseStatusException(...);
    }
}
```

---

# Mejora Propuesta (DESPUÉS)

Se implementa Singleton para centralizar configuraciones:

## AppConfig (Singleton)

```java
package com.iglesia.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Singleton que centraliza TODAS las configuraciones del sistema.
 * Spring garantiza una única instancia (scope singleton por defecto).
 */
@Component
public class AppConfig {

    // Instancia única gestionada por Spring
    private static AppConfig instance;

    // ==================== JWT Configuration ====================
    private final String jwtSecret;
    private final int jwtExpirationMinutes;

    // ==================== Payment Configuration ====================
    private final int paymentMaxRetries;

    /**
     * Constructor único - garantiza una sola instancia
     */
    public AppConfig(
            @Value("${app.jwt.secret}") String jwtSecret,
            @Value("${app.jwt.expiration-minutes:60}") int jwtExpirationMinutes,
            @Value("${app.payment.max-retries:3}") int paymentMaxRetries) {

        this.jwtSecret = jwtSecret;
        this.jwtExpirationMinutes = jwtExpirationMinutes;
        this.paymentMaxRetries = paymentMaxRetries;
        
        instance = this;
    }

    /**
     * Punto de acceso global (para contextos donde no hay inyección)
     */
    public static AppConfig getInstance() {
        return instance;
    }

    // ==================== Getters ====================
    public String getJwtSecret() {
        return jwtSecret;
    }

    public int getJwtExpirationMinutes() {
        return jwtExpirationMinutes;
    }

    public int getPaymentMaxRetries() {
        return paymentMaxRetries;
    }
}
```

## JwtService utilizando Singleton

```java
@Component
public class JwtService {

    private final Key key;
    private final AppConfig appConfig;  // Usa el Singleton

    public JwtService(AppConfig appConfig) {
        this.appConfig = appConfig;
        this.key = Keys.hmacShaKeyFor(
            appConfig.getJwtSecret().getBytes(StandardCharsets.UTF_8)
        );
    }

    public String generateToken(AppUser user) {
        Instant now = Instant.now();
        return Jwts.builder()
            .setSubject(user.getEmail())
            .setExpiration(Date.from(
                now.plus(appConfig.getJwtExpirationMinutes(), ChronoUnit.MINUTES)
            ))
            .signWith(key, SignatureAlgorithm.HS256)
            .compact();
    }
}
```

## PaymentService utilizando Singleton

```java
@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final AppConfig appConfig;  // Usa el Singleton

    public PaymentService(PaymentRepository paymentRepository, AppConfig appConfig) {
        this.paymentRepository = paymentRepository;
        this.appConfig = appConfig;
    }

    public Payment retryPayment(Long id) {
        Payment payment = paymentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Pago no encontrado"));

        // Usa configuración centralizada en lugar de hardcodear
        if (payment.getAttempts() >= appConfig.getPaymentMaxRetries()) {
            throw new RuntimeException("Se superó el máximo de reintentos");
        }

        payment.setStatus(PaymentStatus.INICIADO);
        return paymentRepository.save(payment);
    }
}
```

---

# Diagrama del Patrón Singleton

```
┌─────────────────────────────────────────────────────────────┐
│                   application.properties                    │
│                                                             │
│  app.jwt.secret=mi-clave-secreta                           │
│  app.jwt.expiration-minutes=60                             │
│  app.payment.max-retries=3                                 │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │       AppConfig        │
              │      (SINGLETON)       │
              │                        │
              │  - jwtSecret           │
              │  - jwtExpirationMin    │
              │  - paymentMaxRetries   │
              │                        │
              │  + getInstance()       │
              │  + getJwtSecret()      │
              │  + getPaymentMax...()  │
              └───────────┬────────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
          ▼               ▼               ▼
   ┌────────────┐  ┌────────────┐  ┌────────────┐
   │ JwtService │  │ PaymentSvc │  │  OtherSvc  │
   └────────────┘  └────────────┘  └────────────┘
```

---

# Beneficios Arquitectónicos

La implementación del patrón Singleton proporciona:

* **una única instancia** de configuración en todo el sistema
* **punto de acceso global** para todos los servicios
* **consistencia** en los valores configurados
* **valores por defecto centralizados**
* **facilidad de testing** mediante inyección de mock

---

# Trade-offs

| Ventaja | Desventaja |
|---------|------------|
| Configuración centralizada | Una clase puede crecer mucho |
| Garantiza una sola instancia | Puede dificultar testing si se usa getInstance() |
| Fácil de documentar | Todos los servicios dependen de ella |
| Valores consistentes | Requiere refactoring inicial |

---

# Impacto en el Sistema

El cambio no afecta el comportamiento funcional del sistema.

Las configuraciones ahora están centralizadas en una única instancia, eliminando inconsistencias.

---

# Resultado Arquitectónico

Arquitectura aplicando Singleton Pattern:

```
application.properties
        ↓
AppConfig (SINGLETON) ← única instancia
        ↓
Todos los servicios
```

Esta estructura implementa correctamente el **patrón Singleton (GoF Creacional)** para la gestión centralizada de configuraciones.
