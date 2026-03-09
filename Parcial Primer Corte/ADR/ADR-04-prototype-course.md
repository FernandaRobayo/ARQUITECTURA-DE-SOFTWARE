# ADR-04 — Implementación de Prototype Pattern para clonación de cursos

## Estado

Propuesto

---

# Contexto

Durante el análisis del sistema **ERP Iglesias** se identificó que la entidad `Course` tiene múltiples atributos que deben configurarse al crear un nuevo curso:

```java
@Entity
@Table(name = "courses")
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    private boolean active = true;

    @ManyToOne
    @JoinColumn(name = "church_id", nullable = false)
    private Church church;
}
```

En el contexto de una iglesia, es común que se repitan cursos periódicamente con configuraciones similares (mismo precio, misma descripción base, etc.). Por ejemplo:

* "Curso Bíblico - Nivel 1" se repite cada semestre
* "Preparación Matrimonial" se ofrece varias veces al año

Actualmente, crear un curso similar requiere configurar todos los atributos desde cero:

```java
Course newCourse = new Course();
newCourse.setName("Curso Bíblico - Nivel 1 (2024-2)");
newCourse.setDescription(existingCourse.getDescription());
newCourse.setPrice(existingCourse.getPrice());
newCourse.setChurch(existingCourse.getChurch());
newCourse.setActive(true);
```

---

# Problema

Cuando se necesitan crear objetos similares a uno existente:

* la **creación es lenta** si hay que configurar muchos atributos
* se puede **olvidar copiar algún atributo**
* el código de **copia está disperso** en múltiples lugares
* no existe un mecanismo estándar para **duplicar objetos**

Ejemplo del problema:

```java
// Para crear una nueva edición de un curso existente:
Course original = courseRepository.findById(1L).get();

// Copia manual - ¡propenso a errores!
Course copia = new Course();
copia.setName(original.getName() + " - Nueva Edición");
copia.setDescription(original.getDescription());
copia.setPrice(original.getPrice());
// ¿Se olvidó copiar church?
// ¿Se olvidó copiar active?
```

Esto es especialmente problemático cuando:
* La clase tiene muchos atributos
* Se agregan nuevos atributos y se olvida actualizarlos

---

# Decisión Arquitectónica

Se propone implementar el **patrón Prototype** para permitir clonar objetos `Course` de forma eficiente.

La entidad `Course` implementará un método `clone()` que crea una copia del objeto.

Arquitectura propuesta:

```
Course (Prototype)
    ↓ clone()
Course (Copia)
```

---

# Patrón de Diseño Aplicado

**Prototype (Patrón Creacional GoF)**

| Patrón | Propósito | Problema que Resuelve | Complejidad |
|--------|-----------|----------------------|-------------|
| Prototype | Clonar eficientemente | Creación muy lenta | ⭐⭐⭐ |

Este patrón especifica los tipos de objetos a crear usando una instancia prototípica, y crea nuevos objetos copiando este prototipo.

---

# Principio SOLID Aplicado

**Single Responsibility Principle (SRP)**

* La lógica de clonación está encapsulada en la propia clase `Course`
* Los servicios no necesitan conocer los detalles de cómo copiar cada atributo

**Open/Closed Principle (OCP)**

* Si se agregan nuevos atributos a `Course`, solo se modifica el método `clone()`
* El código cliente no cambia

---

# Código Actual (ANTES)

Copia manual dispersa en el código:

```java
// En algún servicio o controlador
public Course duplicateCourse(Long courseId, String newName) {
    Course original = courseRepository.findById(courseId)
        .orElseThrow(() -> new RuntimeException("Curso no encontrado"));
    
    // Copia manual de cada atributo
    Course copy = new Course();
    copy.setName(newName);
    copy.setDescription(original.getDescription());
    copy.setPrice(original.getPrice());
    copy.setActive(original.isActive());
    copy.setChurch(original.getChurch());
    // Si se agrega un nuevo campo, ¿se recordará agregarlo aquí?
    
    return courseRepository.save(copy);
}
```

Problema: Si `Course` tiene 10 atributos, hay que copiar los 10 manualmente.

---

# Mejora Propuesta (DESPUÉS)

Se implementa Prototype en la entidad `Course`:

## Course con Prototype

```java
package com.iglesia;

import jakarta.persistence.*;
import java.math.BigDecimal;

/**
 * Entidad Course que implementa el patrón Prototype.
 * Permite clonar cursos para crear nuevas ediciones.
 */
@Entity
@Table(name = "courses")
public class Course implements Cloneable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    private boolean active = true;

    @ManyToOne
    @JoinColumn(name = "church_id", nullable = false)
    private Church church;

    /**
     * Implementación del patrón Prototype.
     * Crea una copia del curso con todos sus atributos.
     * El ID se establece como null para que JPA genere uno nuevo.
     */
    @Override
    public Course clone() {
        try {
            Course cloned = (Course) super.clone();
            cloned.id = null;  // Nueva entidad, necesita nuevo ID
            return cloned;
        } catch (CloneNotSupportedException e) {
            // No debería ocurrir ya que implementamos Cloneable
            throw new RuntimeException("Error al clonar Course", e);
        }
    }

    /**
     * Clona el curso con un nuevo nombre.
     * Útil para crear nuevas ediciones.
     */
    public Course cloneWithName(String newName) {
        Course cloned = this.clone();
        cloned.setName(newName);
        return cloned;
    }

    /**
     * Clona el curso con nuevo nombre y precio.
     * Útil cuando hay actualización de precios.
     */
    public Course cloneWithNameAndPrice(String newName, BigDecimal newPrice) {
        Course cloned = this.clone();
        cloned.setName(newName);
        cloned.setPrice(newPrice);
        return cloned;
    }

    // Getters y Setters
    public Long getId() { return id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    
    public Church getChurch() { return church; }
    public void setChurch(Church church) { this.church = church; }
}
```

## CourseService utilizando Prototype

```java
@Service
public class CourseService {

    private final CourseRepository courseRepository;

    public CourseService(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    /**
     * Crea una nueva edición de un curso existente usando Prototype.
     */
    public Course createNewEdition(Long courseId, String newName) {
        Course original = courseRepository.findById(courseId)
            .orElseThrow(() -> new RuntimeException("Curso no encontrado"));
        
        // Usa el patrón Prototype para clonar
        Course newEdition = original.cloneWithName(newName);
        
        return courseRepository.save(newEdition);
    }

    /**
     * Crea una nueva edición con precio actualizado.
     */
    public Course createNewEditionWithNewPrice(Long courseId, String newName, BigDecimal newPrice) {
        Course original = courseRepository.findById(courseId)
            .orElseThrow(() -> new RuntimeException("Curso no encontrado"));
        
        // Usa variante del Prototype
        Course newEdition = original.cloneWithNameAndPrice(newName, newPrice);
        
        return courseRepository.save(newEdition);
    }

    /**
     * Clona un curso para otra iglesia (copia profunda modificada).
     */
    public Course cloneForChurch(Long courseId, Church targetChurch) {
        Course original = courseRepository.findById(courseId)
            .orElseThrow(() -> new RuntimeException("Curso no encontrado"));
        
        Course cloned = original.clone();
        cloned.setChurch(targetChurch);  // Asignar a otra iglesia
        
        return courseRepository.save(cloned);
    }
}
```

## Uso en Controller

```java
@RestController
@RequestMapping("/api/courses")
public class CourseController {

    private final CourseService courseService;

    @PostMapping("/{id}/clone")
    public CourseResponse cloneCourse(
            @PathVariable Long id, 
            @RequestParam String newName) {
        
        Course newEdition = courseService.createNewEdition(id, newName);
        return CourseResponse.from(newEdition);
    }

    @PostMapping("/{id}/new-edition")
    public CourseResponse createNewEdition(
            @PathVariable Long id,
            @RequestBody NewEditionRequest request) {
        
        Course newEdition = courseService.createNewEditionWithNewPrice(
            id, 
            request.name(), 
            request.price()
        );
        return CourseResponse.from(newEdition);
    }
}
```

---

# Diagrama del Patrón Prototype

```
┌─────────────────────────────────────────────────────────────┐
│                     CourseService                           │
│                                                             │
│   Course original = courseRepository.findById(id);          │
│   Course copy = original.clone();  // PROTOTYPE             │
│   copy.setName("Nueva Edición");                            │
│   courseRepository.save(copy);                              │
│                                                             │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
         ┌─────────────────────────────────┐
         │         Course                  │
         │       (PROTOTYPE)               │
         │                                 │
         │  - id: 1                        │
         │  - name: "Curso Bíblico"        │
         │  - price: 150.00                │
         │  - description: "..."           │
         │  - church: Iglesia Central      │
         │                                 │
         │  + clone()                      │
         │  + cloneWithName()              │
         └────────────┬────────────────────┘
                      │ clone()
                      ▼
         ┌─────────────────────────────────┐
         │         Course                  │
         │         (COPIA)                 │
         │                                 │
         │  - id: null (nuevo)             │
         │  - name: "Curso Bíblico 2024"   │
         │  - price: 150.00 (heredado)     │
         │  - description: "..." (heredado)│
         │  - church: Iglesia Central      │
         └─────────────────────────────────┘
```

---

# Casos de Uso del Prototype

```java
// Caso 1: Nueva edición del mismo curso
Course biblico2024_1 = courseRepository.findById(1L).get();
Course biblico2024_2 = biblico2024_1.cloneWithName("Curso Bíblico 2024-2");

// Caso 2: Mismo curso con precio actualizado
Course matrimonio2023 = courseRepository.findById(2L).get();
Course matrimonio2024 = matrimonio2023.cloneWithNameAndPrice(
    "Preparación Matrimonial 2024", 
    new BigDecimal("200.00")
);

// Caso 3: Copiar un curso plantilla
Course plantilla = courseRepository.findById(3L).get();
Course nuevo1 = plantilla.clone();
Course nuevo2 = plantilla.clone();
Course nuevo3 = plantilla.clone();
// Todos tienen la misma configuración base
```

---

# Beneficios Arquitectónicos

La implementación del patrón Prototype proporciona:

* **clonación eficiente** de objetos complejos
* **evita olvidar atributos** al copiar
* **código centralizado** de clonación en la entidad
* **métodos de conveniencia** para casos comunes
* **fácil mantenimiento** cuando se agregan nuevos atributos

---

# Trade-offs

| Ventaja | Desventaja |
|---------|------------|
| Clonación en una línea | Cuidado con referencias profundas |
| No se olvidan atributos | Implementar Cloneable correctamente |
| Fácil crear variantes | ID debe resetearse para JPA |
| Código mantenible | Necesita actualizar clone() si hay objetos anidados |

---

# Consideraciones de Copia Profunda

Para relaciones `@ManyToOne` como `church`, la copia superficial es suficiente (ambos cursos pertenecen a la misma iglesia).

Si hubiera colecciones (ej: `List<Lesson>`), se necesitaría **copia profunda**:

```java
@Override
public Course clone() {
    try {
        Course cloned = (Course) super.clone();
        cloned.id = null;
        
        // Copia profunda de colecciones si existieran
        // cloned.lessons = new ArrayList<>(this.lessons);
        
        return cloned;
    } catch (CloneNotSupportedException e) {
        throw new RuntimeException(e);
    }
}
```

---

# Impacto en el Sistema

El cambio no afecta el comportamiento funcional actual.

Añade la capacidad de clonar cursos fácilmente para crear nuevas ediciones.

---

# Resultado Arquitectónico

Arquitectura aplicando Prototype Pattern:

```
Course original
    ↓ clone()
Course copia (nuevo ID, mismos atributos)
```

Esta estructura implementa correctamente el **patrón Prototype (GoF Creacional)** para la clonación eficiente de objetos.
