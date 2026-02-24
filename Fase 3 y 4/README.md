# 🚀 Fase 3 -- Transformación del Sistema

**Autores:**\
María Fernanda Robayo Laguna\
Laura Sofía Cangrejo

------------------------------------------------------------------------

## 🧩 ¿Qué se realizó en esta fase?

Se trabajó en tres niveles fundamentales:

-   🔧 Refactorización estructural del código\
-   🧼 Aplicación de principios Clean Code\
-   🏗 Propuesta de arquitectura basada en microservicios

------------------------------------------------------------------------

# 3.1 Refactorización con Patrones de Diseño

## ❌ Antes

-   Controllers con múltiples responsabilidades\
-   SQL concatenado directamente\
-   Lógica HTTP en componentes Angular\
-   Manejo inadecuado de excepciones

## ✅ Después

-   Arquitectura por capas (Controller → Service → Repository)\
-   Uso de DTOs para validación\
-   Service Layer en Angular\
-   Global Exception Handler

📌 Resultado: estructura organizada y menor acoplamiento.

------------------------------------------------------------------------

# 3.2 Aplicación de Principios Clean Code

## 🔎 Se corrigió

-   Nombres poco descriptivos\
-   Métodos demasiado grandes\
-   Validaciones repetidas (DRY)\
-   Uso de `printStackTrace()` y `return null`\
-   Comentarios innecesarios

## 💡 Se implementó

-   Nombres significativos\
-   Funciones pequeñas\
-   Responsabilidad única\
-   Validaciones declarativas\
-   Excepciones personalizadas

📌 Resultado: código más claro, mantenible y coherente.

------------------------------------------------------------------------

# 3.3 Propuesta de Arquitectura de Microservicios

## 🏢 Arquitectura Actual

Angular → Spring Boot → PostgreSQL (Monolito)

## 🏗 Arquitectura Propuesta

Angular\
↓\
API Gateway\
↓\
- survey-service\
- voting-service\
↓\
Bases de datos independientes

🚀 Beneficios: - Escalabilidad independiente\
- Desacoplamiento por dominio\
- Mejor mantenibilidad\
- Preparación para despliegue distribuido

------------------------------------------------------------------------

# 🎯 Impacto Global

La Fase 3 permitió transformar el sistema hacia una solución:

-   Más modular\
-   Más limpia\
-   Más escalable\
-   Preparada para crecimiento futuro
