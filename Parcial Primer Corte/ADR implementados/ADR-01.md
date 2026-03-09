# ADR-01 — Centralización de configuración global mediante AppConfig

## Información general

| Campo           | Valor                                              |
| --------------- | -------------------------------------------------- |
| ADR             | ADR-01                                             |
| Título          | Centralización de configuración global del sistema |
| Tipo            | Backend                                            |
| Patrón aplicado | Configuración centralizada                         |
| Estado          | Implementado                                       |
| Proyecto        | ERP Iglesias                                       |
| Lenguaje        | Java + Spring Boot                                 |

---

# Contexto del sistema

El sistema ERP de iglesias está construido utilizando **Spring Boot** como framework backend.
Este framework permite definir configuraciones globales de la aplicación mediante clases anotadas con:

```java
@Configuration
```

Estas clases permiten registrar **Beans de Spring**, centralizar configuraciones y definir componentes que pueden ser utilizados en toda la aplicación.

Durante el desarrollo del sistema se identificó que ciertas configuraciones del sistema debían estar disponibles globalmente, tales como:

* configuración de base de datos
* configuraciones compartidas
* componentes reutilizables del sistema

Por esta razón se decidió centralizar la configuración global en una clase dedicada.

---

# Problema identificado

Antes de aplicar esta decisión arquitectónica, la configuración del sistema podía quedar distribuida en múltiples lugares del proyecto.

Esto genera varios problemas.

## Configuración dispersa

Si cada componente define su propia configuración, se pierde control sobre la arquitectura global del sistema.

---

## Dificultad de mantenimiento

Si una configuración debe modificarse, puede ser necesario buscar múltiples lugares del proyecto.

---

## Falta de centralización

Las configuraciones de infraestructura deberían definirse en un punto central del sistema.

---

# Decisión arquitectónica

Para resolver este problema se decidió crear una clase de configuración global llamada:

```text
AppConfig
```

Esta clase utiliza la anotación:

```java
@Configuration
```

para indicar a Spring Boot que contiene configuraciones del sistema.

Dentro de esta clase se registran **Beans globales** que pueden ser utilizados por cualquier componente de la aplicación.

En este caso se registró la configuración de base de datos representada por la clase:

```
DatabaseSettings
```

---

# Implementación

Se creó el archivo:

```
backend/src/main/java/com/iglesia/AppConfig.java
```

Implementación:

```java
package com.iglesia;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AppConfig {

    @Bean
    public DatabaseSettings databaseSettings() {
        return DatabaseSettings.getInstance();
    }

}
```

---

# Funcionamiento

La anotación:

```java
@Configuration
```

indica a Spring que esta clase contiene configuraciones del sistema.

El método anotado con:

```java
@Bean
```

registra un componente administrado por el contenedor de Spring.

En este caso se expone el objeto:

```
DatabaseSettings
```

como un Bean disponible globalmente.

---

# Arquitectura antes del cambio

Antes del ADR-01 la configuración del sistema podía quedar distribuida en múltiples partes del proyecto.

```
Clases del sistema
      ↓
Configuraciones dispersas
```

Esto dificultaba el control de la arquitectura.

---

# Arquitectura después del cambio

Después de aplicar el ADR-01 la configuración se centraliza.

```
Aplicación
      ↓
   AppConfig
      ↓
Configuración global
      ↓
Componentes del sistema
```

Esto permite gestionar la configuración desde un único punto.

---

# Beneficios obtenidos

La implementación de `AppConfig` aporta varias mejoras al sistema.

## Centralización de configuración

Todas las configuraciones globales pueden definirse en una única clase.

---

## Mejor organización del proyecto

Se establece una capa clara de configuración dentro de la arquitectura.

---

## Mayor mantenibilidad

Si se requiere modificar o agregar configuraciones globales, se realiza en un único archivo.

---

## Integración con Spring Boot

Spring Boot detecta automáticamente las clases anotadas con `@Configuration` y registra sus beans en el contenedor de la aplicación.

---

# Relación con principios SOLID

## Single Responsibility Principle (SRP)

La clase `AppConfig` tiene una única responsabilidad: gestionar configuraciones globales del sistema.

---

## Bajo acoplamiento

Los componentes del sistema obtienen configuraciones desde el contenedor de Spring sin depender directamente de su implementación.

---

# Evidencia de implementación

La implementación del ADR-01 se evidencia mediante:

* creación del archivo `AppConfig.java`
* uso de la anotación `@Configuration`
* registro de beans mediante `@Bean`

Archivo agregado al proyecto:

```
backend/src/main/java/com/iglesia/AppConfig.java
```

---

# Estado del proyecto respecto a los ADR

| ADR    | Implementación               |
| ------ | ---------------------------- |
| ADR-01 | AppConfig                    |
| ADR-02 | PaymentFactory               |
| ADR-05 | ErrorResponseFactory         |
| ADR-08 | DatabaseSettings (Singleton) |
| ADR-09 | DTOFactory                   |

---

# Conclusión

La implementación del ADR-01 permitió centralizar la configuración global del sistema utilizando una clase dedicada de configuración.

La creación de `AppConfig` proporciona:

* un punto único de configuración
* mejor organización arquitectónica
* integración adecuada con el contenedor de Spring Boot

Este cambio mejora la mantenibilidad y estructura del backend al establecer una capa clara de configuración dentro del sistema.
