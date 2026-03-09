# ADR-07 — Implementación de Prototype Pattern para creación derivada de personas

## Estado

Propuesto

---

# Contexto

Durante el análisis del sistema **ERP Iglesias** se identificó que la entidad `Person` contiene múltiples atributos necesarios para registrar miembros dentro de una iglesia.

Ejemplo simplificado de la entidad:

```java
@Entity
public class Person {

    private Long id;
    private String firstName;
    private String lastName;
    private String document;
    private String phone;
    private String email;

    @ManyToOne
    private Church church;
}
```

Registrar una nueva persona requiere inicializar múltiples atributos.

En contextos organizacionales como iglesias es común que nuevos registros compartan **configuraciones base similares**, por ejemplo:

* pertenecer a la misma iglesia
* compartir datos de contacto familiares
* reutilizar una estructura base de registro

Actualmente, cuando se requiere crear una nueva persona basada en otra existente, los atributos deben copiarse manualmente.

---

# Problema

Cuando se necesita crear un nuevo objeto `Person` tomando como base otro existente:

* la copia de atributos se realiza manualmente
* existe riesgo de **olvidar copiar campos importantes**
* la lógica de copia queda **dispersa en distintos servicios**
* no existe control centralizado sobre **qué atributos deben heredarse**

Ejemplo del problema actual:

```java
Person original = personRepository.findById(1L).get();

Person nuevaPersona = new Person();
nuevaPersona.setFirstName("Maria");
nuevaPersona.setLastName(original.getLastName());
nuevaPersona.setPhone(original.getPhone());
nuevaPersona.setChurch(original.getChurch());
```

Este enfoque presenta varios inconvenientes:

* duplicación de lógica en múltiples clases
* posibles inconsistencias en la inicialización
* mayor dificultad de mantenimiento si la entidad evoluciona

Además, algunos atributos **no deben heredarse** al crear una nueva persona, por ejemplo:

* `id`
* `document`
* `email`

ya que deben ser únicos dentro del sistema.

---

# Decisión Arquitectónica

Se propone implementar el **patrón Prototype** en la entidad `Person` para permitir la creación de nuevas instancias basadas en una configuración existente.

La lógica de clonación permitirá:

* copiar únicamente los atributos válidos
* reinicializar los campos que deben ser únicos
* centralizar la lógica de creación derivada

Arquitectura propuesta:

```
Person (PROTOTYPE)
      ↓ clone()
Person (Nueva instancia derivada)
```

---

# Patrón de Diseño Aplicado

**Prototype (Patrón Creacional GoF)**

| Patrón    | Propósito                                      | Problema que Resuelve               | Complejidad |
| --------- | ---------------------------------------------- | ----------------------------------- | ----------- |
| Prototype | Crear nuevos objetos a partir de uno existente | Copia manual de múltiples atributos | ⭐⭐⭐         |

Este patrón permite crear nuevos objetos copiando una instancia existente en lugar de construirlos desde cero.

---

# Principio SOLID Aplicado

**Single Responsibility Principle (SRP)**

* La entidad `Person` define cómo debe clonarse correctamente
* Los servicios no necesitan conocer la lógica de copia de atributos

**Open/Closed Principle (OCP)**

* Si se agregan nuevos atributos a `Person`, la lógica de clonación puede extenderse sin modificar los servicios que la utilizan.

---

# Código Actual (ANTES)

Creación manual de personas derivadas:

```java
Person original = personRepository.findById(id).get();

Person nuevaPersona = new Person();
nuevaPersona.setFirstName("Maria");
nuevaPersona.setLastName(original.getLastName());
nuevaPersona.setPhone(original.getPhone());
nuevaPersona.setChurch(original.getChurch());
```

Problemas del enfoque actual:

* lógica de copia duplicada
* falta de control sobre atributos heredados
* mayor probabilidad de errores humanos

---

# Mejora Propuesta (DESPUÉS)

Se implementa el patrón **Prototype** para permitir clonación controlada de objetos `Person`.

## Person implementando Prototype

```java
@Entity
public class Person implements Cloneable {

    private Long id;
    private String firstName;
    private String lastName;
    private String document;
    private String phone;
    private String email;

    @ManyToOne
    private Church church;

    @Override
    public Person clone() {
        try {

            Person cloned = (Person) super.clone();

            // Reiniciar atributos únicos
            cloned.id = null;
            cloned.document = null;
            cloned.email = null;

            return cloned;

        } catch (CloneNotSupportedException e) {
            throw new RuntimeException("Error al clonar Person", e);
        }
    }

    public Person cloneWithNewName(String firstName) {

        Person cloned = this.clone();
        cloned.setFirstName(firstName);

        return cloned;
    }
}
```

---

## PersonService utilizando Prototype

```java
@Service
public class PersonService {

    private final PersonRepository personRepository;

    public PersonService(PersonRepository personRepository) {
        this.personRepository = personRepository;
    }

    public Person createDerivedPerson(Long basePersonId, String newName) {

        Person base = personRepository.findById(basePersonId)
                .orElseThrow(() -> new RuntimeException("Persona no encontrada"));

        Person nuevaPersona = base.cloneWithNewName(newName);

        return personRepository.save(nuevaPersona);
    }
}
```

---

# Diagrama del Patrón Prototype

```
┌──────────────────────────────┐
│           Person             │
│          (PROTOTYPE)         │
│                              │
│ id: 1                        │
│ firstName: "Juan"            │
│ lastName: "Perez"            │
│ phone: "3001234567"          │
│ church: Iglesia Central      │
│                              │
│ + clone()                    │
└───────────────┬──────────────┘
                │
                ▼
┌──────────────────────────────┐
│        Person (Nueva)        │
│                              │
│ id: null                     │
│ firstName: "Maria"           │
│ lastName: "Perez"            │
│ phone: "3001234567"          │
│ church: Iglesia Central      │
└──────────────────────────────┘
```

---

# Beneficios Arquitectónicos

La implementación del patrón Prototype proporciona:

* **centralización de la lógica de copia**
* reducción de duplicación de código
* control explícito sobre atributos heredables
* mayor consistencia en la creación de objetos
* facilidad para generar nuevas variantes de entidades

---

# Trade-offs

| Ventaja                     | Desventaja                                     |
| --------------------------- | ---------------------------------------------- |
| Copia rápida de objetos     | Riesgo de copiar referencias si no se controla |
| Lógica centralizada         | Requiere implementar Cloneable                 |
| Menos duplicación de código | Necesidad de reinicializar campos únicos       |
| Mayor mantenibilidad        | Complejidad inicial ligeramente mayor          |

---

# Impacto en el Sistema

El cambio no altera el comportamiento funcional del sistema.

Se introduce un mecanismo estandarizado para crear nuevas instancias derivadas de `Person`, reduciendo duplicación de lógica y mejorando la mantenibilidad del código.

---

# Resultado Arquitectónico

Arquitectura aplicando Prototype Pattern:

```
Person (Prototype)
      ↓ clone()
Nueva instancia derivada de Person
```

Esta estructura implementa correctamente el **patrón Prototype (GoF Creacional)** para la creación derivada de objetos `Person`.
