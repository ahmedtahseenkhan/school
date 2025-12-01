# Project Rules & Architectural Guidelines

This document outlines the architectural standards and modularity rules for the School Management System. All new development must adhere to these guidelines to ensure maintainability and scalability.

## 1. General Principles
- **Modularity**: Code should be organized by **feature** (domain), not just by technical layer (controller/service/view).
- **Separation of Concerns**: Keep business logic, data access, and presentation layers distinct.
- **DRY (Don't Repeat Yourself)**: Use shared utilities and components for common functionality.

---

## 2. Backend Architecture (`backend/src`)

### Folder Structure
The backend follows a **Modular Monolith** approach.

```
backend/src/
├── modules/           # FEATURE-BASED MODULES (Preferred for new features)
│   ├── hr/            # Example: HR Module
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── routes.js  # Module-specific routes
│   │   └── index.js   # Module entry point
│   └── [feature]/
├── controllers/       # Legacy/Shared Controllers (Avoid for new features)
├── services/          # Shared Services (Email, Auth, etc.)
├── routes/            # Main Route Definitions
├── middleware/        # Shared Middleware
└── utils/             # Shared Utilities
```

### Rules
1.  **New Features**: MUST be implemented as a self-contained folder within `src/modules/`.
2.  **Module Structure**: Each module should contain its own:
    -   `controllers/`: Request handlers.
    -   `services/`: Business logic.
    -   `routes.js`: Route definitions for that module.
3.  **Routing**:
    -   Module routes should be exported from `src/modules/[feature]/routes.js`.
    -   Import and mount these module routes in the main `src/routes/` files or a central registry.
4.  **Database**:
    -   Migrations should still reside in `src/utils/database/migrations` for centralized management, but clearly named with the feature prefix (e.g., `028_create_hr_tables.sql`).

---

## 3. Frontend Architecture (`frontend/src`)

### Folder Structure
The frontend uses a **Feature-Based** architecture.

```
frontend/src/
├── features/          # FEATURE-BASED CODE (Preferred for new features)
│   ├── hr/            # Example: HR Feature
│   │   ├── components/# Feature-specific components
│   │   ├── pages/     # Feature pages/views
│   │   ├── services/  # Feature-specific API calls
│   │   └── routes.jsx # Feature route definitions
│   └── [feature]/
├── components/        # Shared UI Components (Buttons, Inputs, etc.)
│   ├── ui/            # Generic UI elements
│   └── layout/        # Layout components
├── services/          # Shared/Global Services (Auth, Axios setup)
├── contexts/          # Global Contexts
└── utils/             # Shared Utilities
```

### Rules
1.  **New Features**: MUST be implemented within `src/features/`.
2.  **Feature Isolation**: A feature should contain everything it needs to render and function, except for shared UI components and global contexts.
3.  **Shared Components**: Only truly generic components (Buttons, Cards, Modals) should go in `src/components/ui`. Feature-specific components belong in `src/features/[feature]/components`.
4.  **API Services**:
    -   Feature-specific API calls should be in `src/features/[feature]/services` (or `src/services/[feature].service.js` if preferred, but consistency is key).
    -   Currently, many services are in `src/services/`. For new modules, prefer keeping them inside the feature folder if they are not used elsewhere.

---

## 4. Naming Conventions

-   **Files**: `kebab-case` (e.g., `user-profile.jsx`, `auth.controller.js`).
-   **Classes/Components**: `PascalCase` (e.g., `UserProfile`, `AuthController`).
-   **Functions/Variables**: `camelCase` (e.g., `getUserProfile`, `isLoggedIn`).
-   **Constants**: `UPPER_SNAKE_CASE` (e.g., `MAX_RETRY_COUNT`).
-   **Database Tables**: `snake_case` (e.g., `user_profiles`, `hr_employees`).

## 5. Coding Standards

-   **Async/Await**: Always use `async/await` over raw Promises.
-   **Error Handling**: Use `try/catch` blocks in controllers and services. Pass errors to the global error handler.
-   **Validation**:
    -   **Backend**: Use validation middleware (e.g., Joi, Zod, or custom validators) before processing requests.
    -   **Frontend**: Use form validation libraries (e.g., React Hook Form + Zod).
