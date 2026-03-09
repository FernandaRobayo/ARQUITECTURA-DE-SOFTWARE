# ADR-08 — Centralización de configuración de base de datos mediante Singleton

## Información general

| Campo           | Valor                                            |
| --------------- | ------------------------------------------------ |
| ADR             | ADR-08                                           |
| Título          | Centralización de configuración de base de datos |
| Tipo            | Backend                                          |
| Patrón aplicado | Singleton                                        |
| Estado          | Implementado                                     |
| Proyecto        | ERP Iglesias                                     |
| Lenguaje        | Java + Spring Boot                               |

---

# Contexto del sistema

El sistema ERP de iglesias está desarrollado utilizando **Spring Boot** como framework backend y utiliza **PostgreSQL** como base de datos.

Durante el desarrollo del sistema se identificó que la configuración de conexión a base de datos puede ser utilizada por diferentes componentes del sistema, tales como:

* servicios
* repositorios
* utilidades de base de datos
* módulos de infraestructura

Si cada componente gestiona su propia configuración de conexión, se generan problemas de mantenimiento y duplicación de información.

---

# Problema identificado

La gestión distribuida de la configuración de base de datos genera varios problemas arquitectónicos.

## Duplicación de configuración

Si múltiples clases almacenan información de conexión a la base de datos, la configuración queda duplicada en distintos lugares del sistema.

---

## Riesgo de inconsistencias

Si se modifica la configuración de la base de datos, puede ser necesario actualizar múltiples clases del sistema.

Esto aumenta el riesgo de inconsistencias.

---

## Falta de centralización

La configuración de infraestructura debería estar centralizada en un único punto del sistema.

---

# Decisión arquitectónica

Para resolver este problema se decidió aplicar el **patrón de diseño creacional Singleton**.

El patrón Singleton garantiza que:

* solo exista **una única instancia** de una clase en toda la aplicación
* dicha instancia pueda ser **accedida globalmente**

Se creó la clase:

```text
DatabaseSettings
```

Esta clase se encarga de:

* almacenar la configuración de conexión a base de datos
* centralizar el acceso a estos parámetros
* evitar múltiples instancias de configuración

---

# Implementación

Se creó el archivo:

```text
backend/src/main/java/com/iglesia/DatabaseSettings.java
```

Implementación del Singleton:

```java
package com.iglesia;

public class DatabaseSettings {

    private static DatabaseSettings instance;

    private String url;
    private String username;
    private String password;

    private DatabaseSettings() {
        this.url = "jdbc:postgresql://localhost:5432/iglesia";
        this.username = "postgres";
        this.password = "postgres";
    }

    public static DatabaseSettings getInstance() {
        if (instance == null) {
            instance = new DatabaseSettings();
        }
        return instance;
    }

    public String getUrl() {
        return url;
    }

    public String getUsername() {
        return username;
    }

    public String getPassword() {
        return password;
    }
}
```

---

# Características del patrón Singleton implementado

La implementación cumple con las características fundamentales del patrón Singleton.

## Constructor privado

El constructor se declara como privado para evitar que otras clases puedan crear nuevas instancias.

```java
private DatabaseSettings()
```

Esto garantiza que la clase no pueda ser instanciada mediante `new`.

---

## Instancia única

Se define una variable estática que almacena la única instancia del objeto.

```java
private static DatabaseSettings instance;
```

---

## Método de acceso global

Se proporciona un método público para acceder a la instancia única.

```java
DatabaseSettings.getInstance()
```

Este método crea la instancia únicamente si aún no existe.

---

# Ejemplo de uso

Cualquier componente del sistema puede acceder a la configuración de base de datos mediante el método `getInstance()`.

Ejemplo:

```java
DatabaseSettings settings = DatabaseSettings.getInstance();

String url = settings.getUrl();
String user = settings.getUsername();
```

Esto garantiza que todos los componentes utilicen la misma configuración.

---

# Arquitectura antes del cambio

Antes del ADR-08, cada componente podría gestionar su propia configuración de base de datos.

```
Servicio A → Configuración DB
Servicio B → Configuración DB
Servicio C → Configuración DB
```

Esto generaba duplicación de configuración.

---

# Arquitectura después del cambio

Después de aplicar el patrón Singleton, la configuración se centraliza en una única clase.

```
Servicio A
Servicio B
Servicio C
     ↓
DatabaseSettings (Singleton)
     ↓
Configuración DB única
```

Esto asegura consistencia en toda la aplicación.

---

# Beneficios obtenidos

La implementación del patrón Singleton aporta varias mejoras al sistema.

## Centralización de configuración

La configuración de base de datos se encuentra en una sola clase.

---

## Consistencia en el sistema

Todos los componentes utilizan la misma configuración.

---

## Reducción de duplicación

Se evita almacenar configuraciones de base de datos en múltiples clases.

---

## Facilidad de mantenimiento

Si la configuración cambia, solo se modifica una clase.

---

# Relación con principios SOLID

## Single Responsibility Principle (SRP)

La clase `DatabaseSettings` tiene una única responsabilidad: gestionar la configuración de base de datos.

---

## Control de instancias

El patrón Singleton evita la creación de múltiples instancias innecesarias.

---

# Evidencia de implementación

La implementación del ADR-08 se evidencia mediante:

* creación del archivo `DatabaseSettings.java`
* uso del patrón Singleton
* constructor privado
* método estático `getInstance()`

---

# Conclusión

La aplicación del patrón Singleton permitió centralizar la configuración de base de datos en una única clase dentro del sistema.

Esto proporciona:

* una única instancia de configuración
* mayor consistencia en la aplicación
* reducción de duplicación
* mejor mantenibilidad

El ADR-08 mejora la arquitectura del sistema al aplicar un patrón creacional adecuado para la gestión de configuraciones globales.
