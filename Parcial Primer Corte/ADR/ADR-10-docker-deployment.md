# ADR-10 — Uso de contenedores Docker para el despliegue del sistema

## Estado

Propuesto

---

# Contexto

El sistema **ERP Iglesias** está compuesto por múltiples componentes tecnológicos, entre ellos:

* backend que expone la API REST
* frontend desarrollado en Angular
* base de datos para almacenamiento de información

Durante el desarrollo de aplicaciones completas es común que el sistema deba ejecutarse en distintos entornos, como:

* equipos de desarrollo
* servidores de pruebas
* entornos de producción

Sin una estrategia de empaquetado consistente, cada entorno podría requerir configuraciones diferentes, lo que puede generar errores o inconsistencias en la ejecución del sistema.

---

# Problema

Si el sistema depende de configuraciones locales en cada entorno:

* pueden existir diferencias entre entornos de desarrollo
* la instalación del sistema puede volverse compleja
* los desarrolladores deben configurar manualmente dependencias
* se incrementa el riesgo de errores al desplegar la aplicación

Esto genera **inconsistencias en la ejecución del sistema entre diferentes entornos**.

---

# Decisión Arquitectónica

Se propone utilizar **contenedores Docker** para empaquetar los componentes del sistema.

Cada componente del sistema se ejecutará dentro de un contenedor independiente.

Arquitectura propuesta:

```text
Docker
↓
Backend Container
Frontend Container
Database Container
```

Esto permite ejecutar el sistema completo mediante contenedores que incluyen todas las dependencias necesarias.

---

# Patrón de Diseño Aplicado

**Containerization Pattern**

Este patrón permite empaquetar aplicaciones y sus dependencias dentro de contenedores aislados, asegurando que el sistema se ejecute de manera consistente en cualquier entorno.

---

# Principio SOLID Aplicado

**Single Responsibility Principle (SRP)**

Cada contenedor tiene una responsabilidad específica:

* contenedor del backend → ejecutar la API del sistema
* contenedor del frontend → servir la aplicación Angular
* contenedor de base de datos → almacenar la información del sistema

Esto permite mantener una arquitectura modular y fácil de gestionar.

---

# Cambio Concreto Propuesto

Se implementará la ejecución del sistema mediante **contenedores Docker**.

Los principales componentes del sistema estarán definidos en contenedores separados:

```text
backend container
frontend container
database container
```

Para facilitar la ejecución conjunta del sistema se puede utilizar un archivo de configuración de contenedores.

---

# Ejemplo para Entenderlo

Docker empaqueta todo el sistema dentro de contenedores que incluyen:

```text
Backend
Frontend
Base de datos
Dependencias del sistema
```

De esta forma cualquier desarrollador puede ejecutar el sistema sin tener que instalar manualmente todas las dependencias.

---

# Beneficios Arquitectónicos

El uso de contenedores Docker proporciona:

* consistencia en los entornos de desarrollo y producción
* facilidad para ejecutar el sistema en cualquier computador o servidor
* aislamiento de dependencias
* despliegue más sencillo del sistema
* mejor organización de los componentes de la aplicación

---

# Impacto en el Sistema

La utilización de Docker no modifica la funcionalidad del sistema.

Sin embargo, mejora significativamente el **proceso de despliegue y ejecución del sistema en diferentes entornos**.

---

# Resultado Arquitectónico

Arquitectura de despliegue utilizando contenedores:

```text
Docker
↓
Backend Container
Frontend Container
Database Container
```

Este enfoque permite ejecutar el sistema completo de forma consistente en distintos entornos, facilitando tanto el desarrollo como el despliegue del ERP.
