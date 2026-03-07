# 🛡️ NEXUS Intranet | Enterprise Identity & Resource Management

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" />
  <img src="https://img.shields.io/badge/NestJS-10-red?style=for-the-badge&logo=nestjs" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
</div>

---

## 📖 Descripción General

**NEXUS** es una solución **FullStack** de grado empresarial para la gestión de capital humano y recursos digitales. El sistema permite la administración centralizada de colaboradores, segmentación por departamentos dinámicos y un control de acceso basado en roles (**RBAC**).



## 🏗️ Arquitectura del Sistema (Monorepo)

El proyecto implementa una separación estricta de responsabilidades, garantizando escalabilidad y mantenibilidad.

### 🔐 Backend: El Núcleo de Seguridad (NestJS)
Diseñado con un flujo de autenticación por capas para proteger la integridad de los datos.

* **Auth Layer:** Implementación de `Passport.js` + `JWT` para sesiones seguras.
* **Guards & Decorators:** Control de acceso granular con `@Roles('admin')`.
* **Persistence:** `TypeORM` con PostgreSQL, gestionando relaciones `ManyToOne` (User ↔ Area).
* **Validation:** Uso de `DTOs` con `class-validator` para sanitización de entradas.



### 🎨 Frontend: Experiencia de Usuario (Next.js)
Interfaz reactiva enfocada en la velocidad y la accesibilidad.

* **State Management:** `Zustand` con persistencia para un manejo ligero de la sesión.
* **UI/UX:** Componentes modulares responsivos y Skeletons de carga personalizados.
* **API Client:** Instancia centralizada de `Axios` con interceptores de Token.

---

## 🛠️ Stack Tecnológico Detallado

| Componente | Tecnología | Propósito |
| :--- | :--- | :--- |
| **Runtime** | Node.js v20+ | Entorno de ejecución de alto rendimiento. |
| **Frontend** | Next.js 14 (App Router) | Renderizado optimizado y SEO interno. |
| **Backend** | NestJS | Framework modular para APIs escalables. |
| **Base de Datos** | PostgreSQL | Almacenamiento relacional de alta integridad. |
| **Estilos** | Tailwind CSS | Diseño responsivo basado en utilidades. |
| **Iconografía** | Lucide React | Set de iconos minimalistas y consistentes. |

---

## ⚙️ Guía de Instalación Rápida

### 1️⃣ Clonación y Dependencias
```bash
git clone [https://github.com/TU_USUARIO/nexus-intranet.git](https://github.com/TU_USUARIO/nexus-intranet.git)
cd nexus-intranet