# 🧭 C4 – Nivel 1: Diagrama de Contexto  
## Sistema: ERP Iglesias

---

## 📌 Propósito de esta vista

Este diagrama presenta una **visión macro del sistema ERP Iglesias**, permitiendo identificar:

- Quién interactúa con el sistema  
- Qué tipo de interacción existe  
- Qué rol cumple el sistema dentro de su entorno  

A este nivel, el sistema se analiza como una **unidad funcional completa (black box)**, sin exponer detalles internos de implementación.

---

## 🧩 Sistema bajo análisis

### ERP Iglesias

Sistema web orientado a la gestión administrativa de organizaciones religiosas. Centraliza procesos operativos como:

- Administración de usuarios  
- Gestión de cursos  
- Registro de inscripciones  
- Manejo de pagos y ofrendas  

Desde una perspectiva arquitectónica, actúa como el **núcleo digital** de la operación administrativa.

---

## 👥 Actores del sistema

### 🔹 Administrador

Actor con privilegios elevados.

**Responsabilidades:**
- Gestión de usuarios  
- Administración de cursos  
- Control de pagos y datos del sistema  

**Tipo de interacción:**
- Operativa y administrativa  
- Acceso completo a funcionalidades críticas  

---

### 🔹 Usuario del sistema

Actor con acceso restringido.

**Responsabilidades:**
- Consulta de información  
- Inscripción a cursos  
- Realización de pagos  

**Tipo de interacción:**
- Consumo de servicios  
- Acceso limitado basado en permisos  

---

## 🔗 Relaciones e interacción

Los actores interactúan directamente con el sistema mediante relaciones de tipo `Uses`.

Esto implica que:

- El sistema expone funcionalidades accesibles según el rol del usuario  
- La lógica de control de acceso y permisos está contenida dentro del ERP  
- No existen intermediarios visibles a este nivel (frontend/backend no se modelan aquí)  

---

## 🧠 Interpretación arquitectónica

Este diagrama evidencia que:

- ERP Iglesias es un **sistema centralizado**  
- Los actores dependen directamente de él para ejecutar sus procesos  
- No se identifican integraciones externas explícitas (pagos externos, APIs, etc.)  

Esto sugiere una arquitectura inicialmente **cerrada o autocontenida**, donde el sistema gestiona internamente sus capacidades.

---

## ⚖️ Alcance del modelo

### ✔ Incluye
- Actores humanos  
- Sistema principal  
- Relaciones de uso  

### ❌ No incluye
- Tecnologías (Angular, Spring Boot, PostgreSQL)  
- Componentes internos  
- Infraestructura  
- Detalles de red o protocolos  

---

## 🧪 Supuestos realizados

- No se identificaron sistemas externos integrados en el repositorio  
- Se asume que la interacción del usuario es directa con el sistema (abstracción válida en C4 Nivel 1)  
- Los roles definidos representan los perfiles mínimos necesarios para operar el sistema  

---

## 🎯 Valor de esta vista

Este diagrama permite:

- Entender rápidamente el alcance del sistema  
- Identificar actores clave  
- Servir como punto de entrada para análisis arquitectónico  
- Facilitar la comunicación con stakeholders no técnicos  

---

## 🧱 Relación con otros niveles C4

Este nivel se complementa con:

- **Nivel 2 (Contenedores):** muestra cómo está dividido tecnológicamente el sistema  
- **Nivel 3 (Componentes):** detalla la estructura interna del backend  

---

## 🏁 Conclusión

El Diagrama de Contexto posiciona a ERP Iglesias como el eje central de la gestión administrativa, con interacción directa de actores claramente definidos.

Su simplicidad no implica falta de profundidad, sino una representación intencional que permite comprender el sistema sin distraerse con detalles técnicos, preparando el camino para niveles más detallados del modelo C4.