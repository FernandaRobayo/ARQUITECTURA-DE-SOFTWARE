# ADR-08 — Implementación de Singleton Pattern para configuración centralizada de persistencia

## Estado

Propuesto

---

# Contexto

Durante el análisis del sistema **ERP Iglesias** se identificó que varios componentes del sistema requieren acceder a configuraciones relacionadas con la infraestructura de persistencia, tales como:

* URL de conexión a base de datos
* parámetros del pool de conexiones
* timeouts de conexión
* parámetros de monitoreo o diagnóstico

Actualmente estos valores se obtienen directamente desde `application.properties` utilizando anotaciones `@Value` en diferentes clases.

Ejemplo:

```java
@Service
public class HealthService {

    @Value("${spring.datasource.url}")
    private String databaseUrl;

}
```

Este enfoque hace que la configuración técnica de persistencia quede **dispersa en múltiples componentes del sistema**.

---

# Problema

Cuando los parámetros de infraestructura se leen de forma independiente en cada clase:

* no existe un **punto único de acceso a la configuración**
* los valores pueden terminar **duplicados o inconsistentes**
* se dificulta **auditar configuraciones críticas**
* la lógica de acceso a parámetros técnicos queda **dispersa**

Ejemplo del problema:

```java
// Clase A
@Value("${spring.datasource.url}")
String dbUrl;

// Clase B
@Value("${spring.datasource.url}")
String databaseUrl;

// Clase C
@Value("${spring.datasource.url}")
String connectionUrl;
```

Aunque el valor proviene del mismo archivo de configuración, el acceso queda fragmentado en múltiples clases.

Esto dificulta:

* documentar configuraciones
* centralizar cambios
* exponer información técnica para diagnóstico o monitoreo.

---

# Decisión Arquitectónica

Se propone implementar el **patrón Singleton** mediante una clase `DatabaseSettings` que centralice la configuración técnica de persistencia.

En el contexto de **Spring Boot**, los componentes `@Component` se gestionan con **scope singleton por defecto**, lo que permite materializar el patrón Singleton a través del contenedor de inversión de control.

Arquitectura propuesta:

```
application.properties
        ↓
DatabaseSettings (SINGLETON)
        ↓
┌────────────────────────────────────┐
│ HealthService │ Repository │ ...  │
└────────────────────────────────────┘
```

Esta clase actuará como **punto único de acceso a configuraciones relacionadas con la base de datos**.

---

# Patrón de Diseño Aplicado

**Singleton (Patrón Creacional GoF)**

| Patrón    | Propósito                      | Problema que Resuelve  | Complejidad |
| --------- | ------------------------------ | ---------------------- | ----------- |
| Singleton | Garantizar una única instancia | Configuración dispersa | ⭐           |

El patrón Singleton asegura que una clase tenga **una única instancia accesible globalmente** dentro del sistema.

En este caso, el contenedor de Spring se encarga de gestionar dicha instancia única.

---

# Principio SOLID Aplicado

**Single Responsibility Principle (SRP)**

* `DatabaseSettings` tiene la única responsabilidad de gestionar parámetros de persistencia.

**Dependency Inversion Principle (DIP)**

* Los servicios dependen de la abstracción `DatabaseSettings` en lugar de acceder directamente a configuraciones dispersas.

---

# Código Actual (ANTES)

Configuración leída directamente desde múltiples clases:

```java
@Service
public class HealthService {

    @Value("${spring.datasource.url}")
    private String dbUrl;

}

@Service
public class MonitoringService {

    @Value("${spring.datasource.url}")
    private String databaseUrl;

}
```

Esto genera múltiples puntos de acceso a la misma configuración.

---

# Mejora Propuesta (DESPUÉS)

Se introduce una clase `DatabaseSettings` que centraliza todos los parámetros relacionados con persistencia.

## DatabaseSettings (Singleton)

```java
package com.iglesia.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Singleton que centraliza configuraciones de persistencia.
 * Spring garantiza una única instancia (scope singleton).
 */
@Component
public class DatabaseSettings {

    private static DatabaseSettings instance;

    private final String databaseUrl;
    private final String username;
    private final int connectionTimeout;

    public DatabaseSettings(
            @Value("${spring.datasource.url}") String databaseUrl,
            @Value("${spring.datasource.username}") String username,
            @Value("${spring.datasource.hikari.connection-timeout:30000}") int connectionTimeout) {

        this.databaseUrl = databaseUrl;
        this.username = username;
        this.connectionTimeout = connectionTimeout;

        instance = this;
    }

    public static DatabaseSettings getInstance() {
        return instance;
    }

    public String getDatabaseUrl() {
        return databaseUrl;
    }

    public String getUsername() {
        return username;
    }

    public int getConnectionTimeout() {
        return connectionTimeout;
    }
}
```

---

## Uso en servicios

```java
@Service
public class HealthService {

    private final DatabaseSettings databaseSettings;

    public HealthService(DatabaseSettings databaseSettings) {
        this.databaseSettings = databaseSettings;
    }

    public String databaseInfo() {

        return "DB URL: " + databaseSettings.getDatabaseUrl();
    }
}
```

---

# Diagrama del Patrón Singleton

```
┌───────────────────────────────────────────────┐
│             application.properties             │
│                                               │
│ spring.datasource.url=jdbc:postgresql://...  │
│ spring.datasource.username=postgres           │
│ spring.datasource.hikari.connection-timeout   │
└───────────────────────┬───────────────────────┘
                        │
                        ▼
            ┌───────────────────────────┐
            │      DatabaseSettings     │
            │        (SINGLETON)        │
            │                           │
            │  - databaseUrl            │
            │  - username               │
            │  - connectionTimeout      │
            │                           │
            │  + getDatabaseUrl()       │
            │  + getUsername()          │
            │  + getConnectionTimeout() │
            └─────────────┬─────────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
          ▼               ▼               ▼
   HealthService    RepositoryLayer   Monitoring
```

---

# Beneficios Arquitectónicos

La implementación del patrón Singleton proporciona:

* **centralización de configuraciones técnicas**
* **un punto único de acceso a parámetros de persistencia**
* mayor facilidad para **auditoría de configuración**
* reducción de duplicación de acceso a properties
* mejor organización del código

---

# Trade-offs

| Ventaja                         | Desventaja                                |
| ------------------------------- | ----------------------------------------- |
| Configuración centralizada      | Clase puede crecer con el tiempo          |
| Acceso consistente a parámetros | Dependencia común en servicios            |
| Facilita diagnóstico            | Requiere refactorizar acceso a properties |
| Mejora mantenibilidad           | Mayor complejidad inicial                 |

---

# Impacto en el Sistema

El cambio no modifica la lógica funcional del sistema.

La infraestructura de persistencia sigue siendo gestionada por Spring Boot, pero ahora los parámetros técnicos relacionados se encuentran centralizados en una única instancia.

---

# Resultado Arquitectónico

Arquitectura aplicando Singleton Pattern:

```
application.properties
        ↓
DatabaseSettings (SINGLETON)
        ↓
Servicios del sistema
```

Esta estructura implementa el **patrón Singleton (GoF Creacional)** para centralizar configuraciones relacionadas con la infraestructura de persistencia.
