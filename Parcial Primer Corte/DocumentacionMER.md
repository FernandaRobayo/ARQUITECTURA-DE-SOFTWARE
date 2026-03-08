Autores:  
Maria Fernanda Robayo Laguna  
Laura Sofia Cangrejo  

---

# Modelo Entidad–Relación (MER)
## Sistema: ERP Iglesias

## 1. Descripción

El sistema **ERP Iglesias** permite gestionar iglesias, miembros, cursos, inscripciones, ofrendas y pagos.  
El modelo entidad–relación (MER) se construyó a partir de las **entidades del backend (JPA)** y describe cómo se organizan los datos dentro del sistema.

---

# 2. Entidades

## Church
Representa una iglesia registrada en el sistema.

| Campo | Tipo |
|------|------|
| id | Long (PK) |
| name | String |
| address | String |
| createdAt | LocalDateTime |

---

## Person
Representa una persona o miembro de una iglesia.

| Campo | Tipo |
|------|------|
| id | Long (PK) |
| firstName | String |
| lastName | String |
| document | String |
| phone | String |
| email | String |
| church_id | Long (FK) |
| createdAt | LocalDateTime |

---

## Course
Representa un curso ofrecido por una iglesia.

| Campo | Tipo |
|------|------|
| id | Long (PK) |
| name | String |
| description | String |
| price | BigDecimal |
| active | boolean |
| church_id | Long (FK) |
| createdAt | LocalDateTime |

---

## Enrollment
Representa la inscripción de una persona en un curso.

| Campo | Tipo |
|------|------|
| id | Long (PK) |
| person_id | Long (FK) |
| course_id | Long (FK) |
| status | String |
| paymentId | Long |
| createdAt | LocalDateTime |

---

## Offering
Representa una ofrenda realizada por una persona.

| Campo | Tipo |
|------|------|
| id | Long (PK) |
| person_id | Long (FK) |
| amount | BigDecimal |
| concept | String |
| status | String |
| paymentId | Long |
| createdAt | LocalDateTime |

---

## Payment
Gestiona los pagos del sistema.

| Campo | Tipo |
|------|------|
| id | Long (PK) |
| type | String |
| status | String |
| amount | BigDecimal |
| attempts | int |
| referenceId | Long |
| createdAt | LocalDateTime |
| updatedAt | LocalDateTime |

---

## AppUser
Entidad utilizada para la autenticación de usuarios del sistema.

| Campo | Tipo |
|------|------|
| id | Long (PK) |
| email | String |
| passwordHash | String |
| role | String |
| active | boolean |
| createdAt | LocalDateTime |

---

# 3. Relaciones del Modelo

Las relaciones principales entre entidades son:

| Relación | Descripción |
|--------|-------------|
| Church 1:N Person | Una iglesia puede tener muchas personas registradas |
| Church 1:N Course | Una iglesia puede ofrecer múltiples cursos |
| Person 1:N Enrollment | Una persona puede inscribirse en varios cursos |
| Course 1:N Enrollment | Un curso puede tener múltiples inscripciones |
| Person 1:N Offering | Una persona puede realizar múltiples ofrendas |

Relaciones con pagos:

| Relación | Descripción |
|--------|-------------|
| Enrollment.paymentId → Payment.id | La inscripción puede estar asociada a un pago |
| Offering.paymentId → Payment.id | La ofrenda puede estar asociada a un pago |

La entidad **AppUser** es independiente y se utiliza únicamente para la autenticación del sistema.

---

# 4. Resumen

El modelo entidad–relación del sistema ERP Iglesias permite estructurar la información necesaria para administrar iglesias, registrar miembros, gestionar cursos y sus inscripciones, así como registrar ofrendas y asociar pagos a estas operaciones.  
La entidad **AppUser** se utiliza para la gestión de usuarios y control de acceso dentro del sistema.