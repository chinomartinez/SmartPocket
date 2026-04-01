---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - "_docs/planning/prd.md"
  - "_docs/planning/product-brief-SmartPocket-2026-02-28.md"
  - "_docs/planning/ux-design-specification.md"
  - "_docs/project-context.md"
workflowType: "architecture"
project_name: "SmartPocket"
user_name: "Chino"
date: "2026-03-01"
lastStep: 8
status: "complete"
completedAt: "2026-03-01"
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
46 requerimientos funcionales organizados en 8 dominios:

- **Gestión de Cuentas (FR1-FR5):** CRUD completo, múltiples monedas, soft delete, balance auto-calculado desde transacciones/transferencias. Ya implementado al 100%.
- **Gestión de Categorías (FR6-FR10b):** CRUD con tipo ingreso/gasto, color/ícono, reordenamiento manual. Validación de categorías asociadas antes de eliminar.
- **Gestión de Transacciones (FR11-FR17):** CRUD con tags, calculadora integrada, filtros avanzados (fecha, categoría, cuenta, tipo), búsqueda en tiempo real debounced. Módulo con mayor complejidad funcional.
- **Gestión de Transferencias (FR18-FR23):** CRUD completo (crear, editar, eliminar), operación atómica dual (egreso + ingreso), validación de saldo suficiente, actualización automática de balances en ambas cuentas. Editar = revertir operación original + aplicar nueva, todo en una transacción.
- **Pagos Recurrentes (FR24-FR30):** CRUD con patrones de recurrencia (diario/semanal/mensual/anual), conversión a transacción al marcar como pagado, generación automática de siguiente instancia.
- **Dashboard Financiero (FR31-FR34):** Tarjetas de resumen (balance total, ingresos, gastos, ahorro), transacciones recientes, próximos pagos pendientes.
- **Visualización de Datos (FR35-FR37):** Gráficos de torta/donut (gastos por categoría) y barras/líneas (evolución temporal), selección de períodos.
- **Multi-Dispositivo (FR42-FR46):** Responsive completo sin disparidad funcional. Online-only en MVP.

**Non-Functional Requirements:**

- **Performance:** Carga <2s, API <500ms, TTI <3s, LCP <2.5s, UI <100ms, 60FPS scroll
- **Integridad de Datos:** Operaciones financieras ACID, balances 100% precisos, soft delete preservando integridad referencial
- **Calidad de Código:** Testing >60% (frontend + backend), TypeScript strict 100%, 0 errores linting, Clean Architecture + CQRS documentada
- **Seguridad (MVP):** HTTPS en producción, validación y sanitización de inputs, datos protegidos contra acceso no autorizado
- **Deployment:** Aplicación desplegada 24/7, CI/CD automatizado, SQLite en producción (con posible migración a PostgreSQL)
- **Usabilidad:** Navegación completa por teclado, focus visible, labels en inputs, responsive en desktop/tablet/mobile

**Scale & Complexity:**

- Primary domain: Full-stack web application (SPA + REST API)
- Complexity level: Medium
- Estimated architectural components: ~15 (8 feature modules + shared kernel + persistence + API layer + frontend layout + routing + state management + design system)

### Technical Constraints & Dependencies

**Stack fijo (brownfield):**

- Frontend: React 19 + TypeScript strict + Vite 7 + Tailwind CSS v4 + shadcn/ui + TanStack Query + React Hook Form + Zod
- Backend: .NET 9 + EF Core + FluentValidation + Clean Architecture + CQRS (sin MediatR)
- Persistencia: SQLite (actual) → PostgreSQL (migración probable). EF Core abstrae DB provider.
- Monorepo: webapp/ + backend/ sin workspace manager

**Patrones establecidos (no negociables):**

- Named exports only, no default exports
- No `any` en TypeScript — prohibido
- Feature-first organization (vertical slices)
- Handlers manuales con IHandler marker interface
- Result pattern (Result<T>, ResultWithErrors<T>) en frontera controllers-handlers
- FluentValidation para validación de entrada
- TanStack Query como capa de data fetching (nunca useEffect + axios)
- Query key factory pattern

**Decisión de persistencia pendiente:**

- SQLite funciona para MVP single-user
- PostgreSQL como candidato probable por escalabilidad futura
- EF Core facilita migración (cambio de provider + connection string)
- Restricción: no usar features SQLite-específicas que no existan en PostgreSQL

### Cross-Cutting Concerns Identified

1. **Consistencia de Balances:** Transacciones, transferencias, pagos recurrentes y soft delete — todos impactan balances de cuenta. Necesita estrategia centralizada de recálculo atómico.

2. **Soft Delete Universal:** Cuentas, categorías y transacciones usan soft delete con preservación de datos. Necesita filtrado automático en queries (excluir soft-deleted por defecto).

3. **Cache Invalidation Frontend:** Crear/editar/eliminar transacciones debe invalidar queries de cuentas (balance), dashboard (métricas), y transacciones recientes. Estrategia de invalidación cross-module.

4. **Validación Dual Sincronizada:** Zod (frontend) + FluentValidation (backend) deben mantener reglas equivalentes. Fuente de verdad: backend. Frontend como validación optimista.

5. **Error Handling Pipeline:** Backend (Result pattern) → Controller (HTTP status) → Axios interceptor (ApiError) → TanStack Query (toast automático) → UI (inline errors por campo). Pipeline uniforme end-to-end.

6. **Transaccionalidad Multi-Entidad:** Transferencias (2 transacciones + 2 updates de balance) y pagos recurrentes (crear transacción + generar próxima instancia) requieren transacciones de base de datos explícitas.

7. **Ordenamiento Personalizable:** Cuentas y categorías permiten reordenamiento manual por el usuario. Necesita campo `SortOrder` persistido y lógica de reordenamiento.

## Starter Template Evaluation

### Primary Technology Domain

Full-stack web application (SPA + REST API) — proyecto brownfield con fundación técnica ya establecida y validada.

### Starter Options Considered

**No aplica — Proyecto Brownfield**

SmartPocket es un proyecto existente (Fase 3, 12% completado) con módulo de Gestión de Cuentas implementado al 100%. El stack técnico, la estructura del proyecto, los patrones de arquitectura y las herramientas de desarrollo ya están configuradas, funcionando y documentadas en 27 patrones del project-context.

No se evalúan starters nuevos porque:

1. El stack está elegido e implementado (React 19 + .NET 9)
2. La arquitectura está validada (Clean Architecture + CQRS funcionando)
3. Los patrones están establecidos y documentados (feature-first, vertical slices, Result pattern)
4. Las herramientas de build/test/lint están configuradas (Vite 7, Vitest, ESLint 9, xUnit)

### Fundación Existente (Selected "Starter")

**Rationale:** El proyecto existente ES la fundación. Cambiar stack o estructura implicaría reescribir código funcional sin beneficio.

**Architectural Decisions Already Established:**

**Language & Runtime:**

- Frontend: TypeScript 5.8.3 strict mode (ES2022 target, ESNext modules, verbatimModuleSyntax)
- Backend: C# .NET 9.0 (nullable enabled, implicit usings)
- Posibles actualizaciones de paquetes (EF Core, etc.) a considerar — se documentarán si ocurren

**Styling Solution:**

- Tailwind CSS v4 con `@theme` directive y formato `oklch()` (incompatible con v3)
- shadcn/ui + Radix UI para componentes accesibles
- Dark mode glassmorphism como tema visual base

**Build Tooling:**

- Frontend: Vite 7.1.2 con @vitejs/plugin-react
- Backend: dotnet CLI estándar
- Proxy: Vite `/api` → `http://localhost:5000/api`

**Testing Framework:**

- Frontend: Vitest 4.0.15 (environment: node, funciones puras)
- Backend: xUnit (unitarios + integración con SQLite in-memory via `IntegrationTestFixture`)
  - SQLite connection `Data Source=:memory:;Foreign Keys=True` para tests de integración
  - Si se migra a PostgreSQL: Testcontainers como estrategia probable para tests de integración
- Coverage target: >60% ambos lados

**Code Organization:**

- Monorepo: `webapp/` (frontend) + `backend/` (backend)
- Frontend: feature-first (`src/features/{feature}/`) + shared (`src/components/`, `src/hooks/`, `src/utils/`)
- Backend: Clean Architecture en 4 capas (`Domain`, `Features`, `Persistence`, `WebApi`) + `BuildingBlocks` (SharedKernel, Features.Abstractions)
- Feature-based vertical slices: `Features/{Entity}/{Operation}/`

**Development Experience:**

- Hot reload: Vite HMR (frontend) + dotnet watch (backend)
- Linting: ESLint 9 flat config + .NET Analyzers
- Path aliases: `@/` para cross-feature imports
- Environment: `.env.local` (VITE_API_BASE_URL) + `appsettings.Development.json` + user secrets para datos sensibles

**Persistencia:**

- SQLite (actual) vía EF Core 9.0.11
- PostgreSQL como migración probable — EF Core abstrae el provider
- Restricción: evitar features SQLite-específicas que no existan en PostgreSQL
- Migrations en `SmartPocket.Persistence/Migrations/`

**Note:** No se requiere story de inicialización — el proyecto ya está inicializado y operativo.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**

- Balance calculation strategy: SUM on-the-fly (Opción A)
- Soft delete: `IsDeleted` bool + `HasQueryFilter` global (ya implementado)
- Error responses: ProblemDetails / ApiProblemDetails (ya implementado)
- API conventions: REST plural, query string filters, paginación flexible
- Auth: sin autenticación en MVP

**Important Decisions (Shape Architecture):**

- Cache invalidation: estrategia mixta (prefijo + explícito cross-feature)
- Importación de datos: feature frontend + API backend para upload de archivo

**Deferred Decisions (Post-MVP):**

- Librería de gráficos: se decide al implementar módulo de visualización
- Hosting y deployment: próximamente
- CI/CD pipeline: próximamente
- Migración SQLite → PostgreSQL: pendiente de decisión final

### Data Architecture

**Balance Calculation: SUM On-The-Fly (Opción A)**

- Balance de cuenta = `InitialBalance` + SUM(transacciones de ingreso) - SUM(transacciones de egreso) + ajustes + transferencias
- No se almacena balance calculado en Account — se computa desde transacciones
- `InitialBalance` en Account es solo el valor de inicio, no se actualiza
- Si en el futuro la performance lo requiere, se evaluará un stored/cached balance como optimización
- Rationale: simplicidad, precisión garantizada, volumen manejable (1-2000 transacciones)

**Soft Delete: IsDeleted + HasQueryFilter (ya implementado)**

- Campo `IsDeleted` (bool) en `BaseAuditEntity` via interfaz `IDeletable`
- `SoftDeleteSaveChangesInterceptor` intercepta deletes y setea `IsDeleted = true`
- `HasQueryFilter(x => !x.IsDeleted)` en `CommonEntityConfiguration` filtra automáticamente todas las queries
- Para queries que necesiten incluir eliminados: usar `.IgnoreQueryFilters()`

**Importación de Datos (Excel → SmartPocket)**

- Feature dedicada: UI de upload en frontend + endpoint API que recibe archivo
- Backend procesa el archivo y crea transacciones en batch
- Validación de datos durante importación
- Timing: evaluar como último feature del MVP o post-MVP

### Authentication & Security

**MVP: Sin Autenticación**

- No hay auth middleware ni login
- API abierta — single-user, acceso desde localhost o servidor propio
- CORS configurado solo para orígenes conocidos (`AllowedOrigins` en appsettings)
- Decisión de auth (JWT, OAuth, etc.) diferida completamente a post-MVP
- Nota: existe `HasQueryFilter` para `UserId` en `CommonEntityConfiguration` — preparación para futuro multi-tenant

### API & Communication Patterns

**REST Conventions (ya establecidas):**

- URL pattern: `/api/{entity}` (plural, lowercase) — ej: `/api/accounts`, `/api/transactions`
- Sin versionado en MVP (no `/api/v1/`)
- Paginación: flexible por feature — offset-based (`?page=1&pageSize=20`) o cursor-based según convenga
- Filtros: query string params — ej: `/api/transactions?categoryId=5&from=2026-01-01`

**Error Response Format: ProblemDetails (RFC 7807) — ya implementado**

- Excepciones: `ProblemDetails` estándar de ASP.NET Core (via `AddProblemDetails()` en `ErrorSetup`)
- Errores de validación/negocio: `ApiProblemDetails` (hereda ProblemDetails) con propiedad `ErrorDetails Errors`
- `ErrorResultFilter` transforma Result pattern → ProblemDetails en responses HTTP
- Frontend: Axios interceptor parsea ProblemDetails → `ApiError` → TanStack Query toast automático

### Frontend Architecture

**Librería de Gráficos: Diferida**

- Se decidirá al momento de implementar el módulo de Visualización de Datos (sub-fase 7)
- Candidatos: Recharts, Chart.js + react-chartjs-2, Tremor — evaluación contextual

**Cache Invalidation Strategy: Mixta (Prefijo + Explícito)**

- **Intra-feature (mismo módulo):** Invalidación por prefijo — `queryClient.invalidateQueries({ queryKey: ['accounts'] })` captura todas las sub-queries de accounts
- **Cross-feature (entre módulos):** Invalidación explícita en mutations que afectan otros módulos:
  - Crear/editar/eliminar transacción → invalidar `['accounts']` (balance recalculado) + `['dashboard']`
  - Crear/editar/eliminar transferencia → invalidar `['accounts']` (ambas cuentas) + `['dashboard']`
  - Marcar pago recurrente como pagado → invalidar `['transactions']` + `['accounts']` + `['dashboard']` + `['upcoming-payments']`
- Rationale: prefijo mantiene simplicidad dentro del feature; explícito garantiza consistencia cross-feature sin invalidaciones excesivas

### Infrastructure & Deployment

**Hosting: Pendiente de decisión**

- A definir próximamente
- Requisito: soporte para .NET 9 + SQLite (o PostgreSQL si se migra)
- HTTPS obligatorio en producción

**CI/CD: Pendiente de definición**

- GitHub Actions como candidato probable (repo en GitHub)
- Pipeline mínimo: build → test → deploy

### Decision Impact Analysis

**Implementation Sequence:**

1. Cada módulo nuevo sigue los patrones establecidos (vertical slices, handlers, validators)
2. Balance on-the-fly requiere query de SUM en cada lectura de cuenta — definir query/projection eficiente
3. Cache invalidation cross-feature se implementa progresivamente al agregar cada módulo
4. Importación de datos se evalúa como feature al final del MVP

**Cross-Component Dependencies:**

- Transacciones, transferencias y pagos recurrentes → todos afectan balance de cuentas (query SUM)
- Dashboard depende de datos de transacciones, cuentas y próximos pagos — requiere invalidación desde todos
- Soft delete + HasQueryFilter es transparente — no requiere lógica adicional por feature
- ProblemDetails pipeline es uniforme — cada nuevo controller/handler se beneficia automáticamente

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Puntos de Conflicto Potencial Identificados:** 12 áreas donde agentes IA podrían tomar decisiones diferentes si no se especifican explícitamente.

_Nota: Muchos patrones de naming, imports, testing y código ya están documentados exhaustivamente en `project-context.md`. Esta sección cubre los patrones arquitectónicos complementarios que agentes podrían interpretar de forma diferente._

### Naming Patterns

**Database Naming:**

- Tablas: PascalCase plural — `Accounts`, `Categories`, `Transactions` (convención EF Core por defecto)
- Columnas: PascalCase siguiendo nombre de property C# — `InitialBalance`, `CurrencyCode`, `IsDeleted`
- Foreign Keys: `{Entity}Id` — ej: `AccountId`, `CategoryId`
- Índices: convención EF Core por defecto (no customizar nombres salvo necesidad específica)

**API Naming:**

- Routes: `[Route("[controller]")]` — genera nombre del controller en lowercase automáticamente
- Endpoints: `/accounts`, `/categories`, `/transactions`, `/transfers`, `/upcoming-payments`
- Parámetros de ruta: `{id}` (int) — ej: `[HttpGet("{id}")]`
- Query params: camelCase — ej: `?categoryId=5&from=2026-01-01&pageSize=20`
- Nueva entidad multi-palabra: kebab-case en URL — ej: `/upcoming-payments` (controller: `UpcomingPaymentsController`)

**DTO Naming:**

- Response DTOs: `{Entity}{Operation}DTO` o `{Entity}{Operation}Response` — ej: `AccountGetDTO`, `AccountCreateResponse`
- Command DTOs: `{Entity}{Operation}Command` — ej: `AccountCreateCommand`, `AccountUpdateCommand`
- Query DTOs: `{Entity}{Operation}Query` — ej: `AccountGetQuery`
- Frontend types: inferidos desde Zod schema via `z.infer<typeof schema>` cuando son para forms; interfaces explícitas para DTOs de API

### Structure Patterns

**Nueva Feature (Backend) — Checklist de archivos:**

Nota: La carpeta puede ser `Features/{Entity}/` cuando la feature opera sobre una entidad, o `Features/{Feature}/` cuando involucra operaciones multi-entidad (ej: Dashboard, Transfers, Import).

```
Features/{Entity|Feature}/
  ├── {Name}CoreValidations.cs          (validaciones compartidas, si aplica)
  ├── {Name}ExistsQueryHandler.cs       (query reutilizable de existencia, si aplica)
  ├── Create/
  │   ├── {Name}CreateCommand.cs
  │   ├── {Name}CreateCommandHandler.cs
  │   ├── {Name}CreateResponse.cs
  │   └── {Name}CreateValidator.cs
  ├── Get/
  │   ├── {Name}GetQuery.cs
  │   ├── {Name}GetQueryHandler.cs
  │   └── {Name}GetDTO.cs
  ├── GetById/
  │   ├── {Name}GetByIdQueryHandler.cs
  │   └── {Name}GetByIdDTO.cs
  ├── Update/
  │   ├── {Name}UpdateCommand.cs
  │   ├── {Name}UpdateCommandHandler.cs
  │   └── {Name}UpdateValidator.cs
  └── Delete/
      ├── {Name}DeleteCommand.cs
      └── {Name}DeleteCommandHandler.cs
```

**Nueva Feature (Frontend) — Checklist de archivos:**

```
features/{feature}/
  ├── {Feature}Page.tsx                 (page component con layout)
  ├── {Feature}Form.tsx                 (formulario create/edit)
  ├── {Feature}Card.tsx                 (card de item si aplica)
  ├── {Feature}List.tsx                 (listado/tabla)
  ├── use{Feature}.ts                   (hooks TanStack Query)
  ├── {feature}Schema.ts                (Zod schemas + tipos)
  └── {feature}Service.ts               (service layer → spApiClient)

api/services/{feature}/
  └── {feature}Service.ts               (si es servicio compartido entre features)
```

**Nueva Entidad de Dominio — Checklist:**

```
Domain/{Entity}/
  ├── {Entity}.cs                       (entidad con constructor protegido para EF)
  └── (Value Objects si aplica)

Persistence/EntityConfigurations/{Entity}/
  └── {Entity}Configuration.cs          (IEntityTypeConfiguration<T>)

WebApi/Controllers/
  └── {Entity}Controller.cs             (hereda ControllerBase, [ApiController])
```

**Registro de Servicios:**

- Features se registran en `WebApi/Setup/FeaturesSetup.cs` via `services.AddFeatures()`
- Handlers y validators se registran automáticamente por convención o manualmente agrupados por feature

### Format Patterns

**API Response Formats:**

- GET collection: Retorna `PagedListResponse<T>` directamente (no wrapper adicional)
- GET by id: Retorna DTO directamente o `NotFound()` con mensaje string
- POST create: Retorna `ActionResult<{Entity}CreateResponse>` via `result.ToActionResult()`
- PUT update: Retorna `ActionResult` (sin body en success) via `result.ToActionResult()`
- DELETE: Retorna `ActionResult` (sin body en success) via `result.ToActionResult()`
- Errores de validación: `ApiProblemDetails` con `ErrorDetails Errors` (array de `ErrorDetail`)
- Errores de negocio: `ApiProblemDetails` via `ErrorResultFilter`
- Excepciones: `ProblemDetails` estándar via middleware ASP.NET Core

**Formato de Fechas:**

- API JSON: ISO 8601 strings — `"2026-03-01T00:00:00"` (serialización .NET por defecto)
- Frontend display: formato localizado español — `"01/03/2026"` o `"Hoy, 01 de marzo 2026"`
- Frontend forms: Date object → ISO string para enviar al backend
- Base de datos: tipo `TEXT` en SQLite (ISO format), `timestamp` en PostgreSQL

**Montos Financieros:**

- Backend: `decimal` (C#) — precisión financiera nativa
- API JSON: number (serialización estándar de `decimal`)
- Frontend: `number` (JavaScript) — suficiente para el volumen y precisión requeridos en MVP
- Display: formato con separador de miles y 2 decimales — ej: `$1.234,50` (formato argentino)
- Zod: `z.coerce.number()` con `.min()` para validación

### Communication Patterns

**Cache Invalidation Cross-Feature (mutation → invalidaciones):**

| Mutation                            | Invalida                                                                     |
| ----------------------------------- | ---------------------------------------------------------------------------- |
| Crear/editar/eliminar transacción   | `['accounts']`, `['dashboard']`, `['transactions']`                          |
| Crear/editar/eliminar transferencia | `['accounts']`, `['dashboard']`, `['transfers']`                             |
| Marcar pago como pagado             | `['transactions']`, `['accounts']`, `['dashboard']`, `['upcoming-payments']` |
| Crear/editar/eliminar cuenta        | `['accounts']`, `['dashboard']`                                              |
| Crear/editar/eliminar categoría     | `['categories']`                                                             |

**Query Key Factory Pattern (obligatorio por feature):**

```typescript
export const {feature}Keys = {
  all: ['{feature}'] as const,
  lists: () => [...{feature}Keys.all, 'list'] as const,
  list: (filters: Filters) => [...{feature}Keys.lists(), filters] as const,
  details: () => [...{feature}Keys.all, 'detail'] as const,
  detail: (id: number) => [...{feature}Keys.details(), id] as const,
};
```

### Process Patterns

**Flujo Completo de Operación CRUD (end-to-end):**

1. **Frontend Form** → Zod valida → `onSubmit` llama mutation
2. **Mutation** → service → `spApiClient.post/put/delete` → API
3. **Controller** → valida `[FromBody]` → inyecta handler `[FromServices]` → llama handler
4. **Handler** → FluentValidation → lógica de negocio → `Result<T>` / `ResultWithErrors<T>`
5. **Controller** → `result.ToActionResult()` → HTTP response (200/400/404)
6. **Si error** → `ErrorResultFilter` / ProblemDetails middleware → `ApiProblemDetails` JSON
7. **Frontend** → Axios interceptor → `handleApiError()` → `ApiError` → reject Promise
8. **TanStack Query** → `MutationCache.onError` → toast automático (Sonner)
9. **Si success** → `onSuccess` callback → `invalidateQueries` (intra + cross-feature) → modal se cierra → toast ✅

**Patrón Controller — Verificación de Existencia:**

```csharp
if (await IsEntityNotFound(id, cancellation) is { } notFoundResult)
    return notFoundResult;
```

- Usar handler `{Entity}ExistsQueryHandler` inyectado en constructor del controller
- Retorna `NotFound()` con mensaje descriptivo si no existe

**Transacciones de Base de Datos:**

- Operaciones simples (CRUD single-entity): `SaveChangesAsync` estándar de EF Core
- Operaciones multi-entidad (transferencias, pagos recurrentes): usar `IDbContextTransaction` explícito

```csharp
using var transaction = await _context.Database.BeginTransactionAsync(cancellation);
// ... operaciones múltiples ...
await _context.SaveChangesAsync(cancellation);
await transaction.CommitAsync(cancellation);
```

**Loading States (Frontend):**

- Todas las listas y cards: `Skeleton` de shadcn mientras `isLoading === true`
- Botón submit durante mutation: spinner inline + texto "Guardando..." + `disabled`
- Nunca pantalla en blanco — siempre skeleton o estado vacío con mensaje

**Empty States (Frontend):**

- Toda lista sin datos muestra: ícono (Heroicons 48px) + título + descripción + CTA opcional
- Nunca lista vacía sin contexto

### Enforcement Guidelines

**Todo Agente IA DEBE:**

1. Seguir los checklists de archivos al crear features nuevas (backend y frontend)
2. Registrar query key factory al crear cualquier hook de TanStack Query
3. Incluir invalidaciones cross-feature según la tabla de invalidación
4. Usar `result.ToActionResult()` en controllers — nunca mapear manualmente Result a HTTP
5. Usar `handleApiError` del pipeline existente — nunca crear error handlers custom
6. Respetar el formato de montos (decimal backend, number frontend, display localizado)
7. Consultar `project-context.md` para reglas de código, naming, testing y anti-patrones

**Referencia Cruzada:**

- Reglas de código, naming, imports, testing → `project-context.md`
- Patrones arquitectónicos y de consistencia → este documento (`architecture.md`)
- Especificación UX y componentes → `ux-design-specification.md`

## Project Structure & Boundaries

### Project Layer Architecture

#### Monorepo Layout

SmartPocket es un monorepo sin workspace manager con separación física clara:

| Carpeta        | Rol                                          | Tecnología                   |
| -------------- | -------------------------------------------- | ---------------------------- |
| `backend/src/` | API REST + lógica de negocio                 | .NET 9, C#, EF Core          |
| `webapp/src/`  | SPA cliente                                  | React 19, TypeScript, Vite 7 |
| `_docs/`       | Artefactos de planificación e implementación | Markdown                     |
| `docs/`        | Documentación de proyecto (knowledge base)   | Markdown                     |

No hay dependencia de build entre `backend/` y `webapp/`. Se comunican exclusivamente via HTTP REST. En desarrollo, Vite proxea `/api` → `localhost:5000`.

#### Backend — Clean Architecture (4 capas + BuildingBlocks)

```
BuildingBlocks/
├── SmartPocket.SharedKernel        → Primitivas compartidas (Result pattern, BaseEntity, Guards, ValueObject)
└── SmartPocket.Features.Abstractions → Interfaces de CQRS (IHandler, ICommand, IQuery)

SmartPocket.Domain                  → Entidades de dominio. CERO dependencias externas.
SmartPocket.Features                → Handlers CQRS (vertical slices por entidad/feature)
SmartPocket.Persistence             → EF Core DbContext, configuraciones, interceptors, migrations
SmartPocket.WebApi                  → Composition root: controllers, DI, middleware, error pipeline
SmartPocket.Tests                   → xUnit: unitarios + integración (SQLite in-memory)
```

**Principio de dependencia:**

- Domain no referencia ningún proyecto
- SharedKernel es referenciado por todos
- Features referencia Domain + Persistence (via ISmartPocketContext) + Abstractions
- Persistence referencia Domain + SharedKernel
- WebApi referencia TODO (composition root) — único proyecto que conoce todas las capas
- Tests referencia Features + Persistence + WebApi (para integration tests)

**Features se organizan en vertical slices:**

```
Features/{Entity}/
  ├── {Name}CoreValidations.cs           (si aplica)
  ├── {Name}ExistsQueryHandler.cs        (si aplica)
  └── {Operation}/                       (Create/, Get/, GetById/, Update/, Delete/)
      ├── Command/Query + Handler + Validator + DTO/Response
```

Cada operación es un folder autocontenido. Los checklists completos de archivos están documentados en la sección "Implementation Patterns & Consistency Rules" de este documento.

#### Frontend — Feature-First Architecture

```
webapp/src/
├── api/                → Capa de comunicación: spApiClient (Axios), errorHandler, services por feature
│   └── services/{f}/   → Service functions + types por feature (puro, sin React)
├── features/{f}/       → Módulos de feature autocontenidos
│   ├── components/     → Componentes React específicos del feature
│   ├── hooks/          → TanStack Query hooks + query key factory
│   ├── schemas/        → Zod schemas + tipos inferidos
│   └── utils/          → Helpers específicos del feature
├── components/         → Componentes compartidos cross-feature
│   └── ui/             → Primitivas shadcn/ui (sin lógica de negocio)
├── hooks/              → Hooks compartidos (usados por 2+ features)
├── layout/             → Layout principal (shell, header, sidebar)
├── router/             → React Router config + rutas
├── lib/                → Utilidades generales (cn() de shadcn, etc.)
└── utils/              → Utilidades de dominio (formatters, dateHelpers)
```

**Principio de aislamiento:**

- Un feature NUNCA importa de otro feature directamente
- Si algo se necesita en 2+ features → sube a `components/`, `hooks/`, o `utils/`
- `api/services/` es la ÚNICA capa que habla con el backend (via `spApiClient`)
- `features/{f}/hooks/` son wrappers de TanStack Query sobre los services

### Architectural Boundaries

#### Dependency Graph — Backend

```
WebApi (Host) ──→ Features (CQRS Handlers) ──→ Domain (Entities)
      │                    │                          ↑
      │                    ↓                          │
      │              Persistence (EF Core) ───────────┘
      │
      └──→ BuildingBlocks (SharedKernel + Abstractions)
                    ↑              ↑
                    │              │
              Features        Persistence
```

#### Dependency Graph — Frontend

```
router/ ──→ features/{f}/components/ (Pages)
                      │
                      ├── hooks/ (TanStack Query) ──→ api/services/{f}/
                      │                                        │
                      ├── schemas/ (Zod validation)            ↓
                      │                                  api/spApiClient.ts
                      └── utils/                               │
                                                               ↓
layout/ ──→ components/ (shared + ui/)                   Backend REST API
```

#### API Contract Boundary (Frontend ↔ Backend)

- Punto único de contacto: `spApiClient.ts` → `http://localhost:5000/api/*`
- Desarrollo: Vite proxy (`/api` → `localhost:5000`)
- Producción: mismo dominio o CORS configurado (`AllowedOrigins` en appsettings)
- Formato: JSON sobre HTTP REST
- Errores: ProblemDetails (RFC 7807) end-to-end
- Sin versionado de API en MVP

### Requirements to Structure Mapping

| Sub-fase          | FRs           | Backend Feature                                      | Domain Entity                           | Frontend Feature                             | Estado              |
| ----------------- | ------------- | ---------------------------------------------------- | --------------------------------------- | -------------------------------------------- | ------------------- |
| 1. Cuentas        | FR1-FR5       | `Features/Accounts/`                                 | `Domain/Accounts/Account.cs`            | `features/accounts/`                         | ✅ 100%             |
| 2. Categorías     | FR6-FR10b     | `Features/Categories/`                               | `Domain/Transactions/Category.cs`       | `features/categories/`                       | 📋 En progreso      |
| 3. Transacciones  | FR11-FR17     | `Features/Transactions/`                             | `Domain/Transactions/Transaction.cs`    | `features/transactions/`                     | 📋 Parcial backend  |
| 4. Transferencias | FR18-FR23     | `Features/Transfers/` (crear)                        | (sin entidad propia — operación dual)   | `features/transfers/` (crear)                | 📋 Pendiente        |
| 5. Próximos Pagos | FR24-FR30     | `Features/UpcomingPayments/` (crear)                 | `Domain/.../UpcomingPayment.cs` (crear) | `features/upcoming-payments/` (crear)        | 📋 Pendiente        |
| 6. Dashboard      | FR31-FR34     | `Features/Dashboard/` (crear, queries de agregación) | N/A (consulta cross-entity)             | `features/dashboard/` (reemplazar mocks)     | 📋 Mocks existentes |
| 7. Gráficos       | FR35-FR37     | Queries en Dashboard o `Features/Reports/` (evaluar) | N/A                                     | `features/charts/` (crear)                   | 📋 Pendiente        |
| 8. Pulido UX      | Cross-cutting | Todos los features                                   | N/A                                     | Todos los features + componentes compartidos | 📋 Pendiente        |

**Notas de mapeo:**

- Cada sub-fase nueva genera: Controller + Feature handlers + Entity config + Migration (backend) + Service + Feature module (frontend)
- Transferencias no tiene entidad propia — crea 2 transacciones (egreso + ingreso) atómicamente via `IDbContextTransaction`. Editar = revertir original + aplicar nueva en una transacción
- Dashboard es consumer cross-entity — no tiene entidad, solo queries de agregación
- Los tests van en `SmartPocket.Tests/Features/{Entity}CRUD/` siguiendo convención establecida

### Cross-Cutting Concerns → Ubicaciones

| Concern             | Backend                                                                                              | Frontend                                                     |
| ------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Soft Delete         | `Interceptors/SoftDeleteSaveChangesInterceptor.cs` + `CommonEntityConfiguration.cs` (HasQueryFilter) | Transparente (API filtra automáticamente)                    |
| Error Pipeline      | `Errors/` (ApiProblemDetails, ErrorResultFilter) + `Results/` (Result pattern)                       | `api/errorHandler.ts` + `api/types.ts` → MutationCache toast |
| Validación          | `Features/{Entity}/{Op}/Validator.cs` + `Shared/Validators/`                                         | `features/{f}/schemas/{f}Schema.ts` (Zod)                    |
| Paginación          | `Persistence/PagedQuery/` (PagedListResponse, extensions)                                            | `api/services/shared/sharedTypes.ts`                         |
| Cache Invalidation  | N/A (backend stateless)                                                                              | `features/{f}/hooks/` (onSuccess → invalidateQueries)        |
| Balance Calculation | SUM on-the-fly en Account handlers/queries                                                           | Transparente (dato llega calculado del backend)              |
| Auth (futuro)       | `Domain/Security/` + `CommonEntityConfiguration` (HasQueryFilter UserId)                             | `router/PrivateRoute.tsx` (preparado)                        |

### Data Flow

**Request Pipeline completo (Frontend → Backend → Response):**

```
User Action
  → React Component (event handler / page load)
    → TanStack Query (mutation o query)
      → api/services/{feature}Service.ts
        → spApiClient.ts (Axios instance + interceptors)
          → HTTP Request → ASP.NET Core Pipeline
            → Controller (route + [FromServices] handler injection)
              → FluentValidation (if command)
                → Handler (business logic + EF Core)
                  → SmartPocketContext → SQLite/PostgreSQL
                ← Result<T> / ResultWithErrors<T>
              ← result.ToActionResult() → HTTP 200/400/404
            ← ProblemDetails (if exception/error)
          ← Axios interceptor → handleApiError (if error)
        ← Data / ApiError
      ← TanStack Query: cache update + cross-feature invalidations
    ← Re-render con datos actualizados
  ← UI refleja el cambio
```

### File Organization Conventions

**¿Dónde va cada cosa nueva?**

| Situación                       | Ubicación                                                                |
| ------------------------------- | ------------------------------------------------------------------------ |
| Lógica específica de UN feature | `features/{feature}/` (componente, hook, schema, util)                   |
| Usado por 2+ features           | `components/`, `hooks/`, o `utils/` (compartido)                         |
| Primitiva UI genérica           | `components/ui/` (shadcn — instalar via CLI)                             |
| Llamada HTTP al backend         | `api/services/{feature}/` (service function pura)                        |
| Tipo de API response/request    | `api/services/{feature}/{feature}Types.ts`                               |
| Tipo compartido cross-feature   | `api/services/shared/sharedTypes.ts`                                     |
| Nueva entidad de dominio        | `Domain/{AggregateRoot}/` + `Persistence/EntityConfigurations/{Domain}/` |
| Nuevo controller                | `WebApi/Controllers/{Entity}Controller.cs`                               |
| Registro de DI de nuevo feature | `WebApi/Setup/FeatureSetup.cs`                                           |
| Tests de integración backend    | `SmartPocket.Tests/Features/{Entity}CRUD/`                               |

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**

- Stack frontend (React 19 + TS 5.8 + Vite 7 + TanStack Query 5 + Zod 4 + shadcn/ui) y backend (.NET 9 + EF Core 9 + FluentValidation + SQLite) — sin conflictos de versiones ni incompatibilidades.
- Result pattern → ProblemDetails → handleApiError → toast automático: pipeline end-to-end coherente.
- Balance SUM on-the-fly viable para volumen esperado (1-2000 transacciones).

**Pattern Consistency:**

- Vertical slices backend ↔ feature-first frontend — patrón espejo correcto.
- Naming: PascalCase (C#), camelCase (TS), kebab-case (URLs) — diferenciados por contexto sin ambigüedad.
- Query key factory → cache invalidation table → mutations: cadena consistente.

**Structure Alignment:**

- Clean Architecture 4 capas reflejada en proyectos .NET.
- Feature-first frontend reflejada en `features/{f}/` con subdivisiones coherentes.
- Boundaries documentados con diagramas de dependencia en ambas capas.

### Requirements Coverage ✅

**Functional Requirements (FR1-FR46):** 100% cubiertos.

- Todos los 8 módulos del MVP tienen soporte arquitectónico documentado (vertical slices, patterns, cache invalidation).
- FR21 (Transferencias editables): corregido — editar = revertir original + aplicar nueva en IDbContextTransaction.
- FR38-FR39 (Importación datos): arquitectura definida (upload + batch), timing flexible (final MVP o post-MVP).

**Non-Functional Requirements (NFR1-NFR34):** Cubiertos con decisiones diferidas documentadas.

- NFR1-NFR8 (Performance): Vite build, lazy loading, paginación, SUM query eficiente.
- NFR9-NFR13 (Seguridad): HTTPS prod, CORS, validación/sanitización inputs. Auth diferido a post-MVP.
- NFR14-NFR18 (Integridad): ACID via IDbContextTransaction, SUM on-the-fly, soft delete pipeline.
- NFR19-NFR24 (Testing): Vitest + xUnit, >60% coverage. E2E framework diferido a Sub-fase 8.
- NFR25-NFR28 (Deployment): Hosting y CI/CD diferidos (documentados como pendientes).
- NFR29-NFR34 (Usabilidad): shadcn/ui + Radix (accesibilidad nativa), responsive, keyboard nav.

### Implementation Readiness ✅

**Decision Completeness:** Todas las decisiones críticas documentadas con versiones y rationale.
**Pattern Completeness:** 12 puntos de conflicto identificados con reglas explícitas. Checklists de archivos por feature (backend + frontend).
**Structure Completeness:** Capas, boundaries, convenciones de ubicación y mapeo de requirements documentados.

### Gaps & Deferred Decisions

| #   | Área                          | Estado                | Decisión                                                  |
| --- | ----------------------------- | --------------------- | --------------------------------------------------------- |
| 1   | E2E Testing Framework         | Diferido a Sub-fase 8 | Usuario decidirá framework al implementar pulido UX       |
| 2   | Hosting & Deployment          | Diferido              | Requisito: soporte .NET 9 + SQLite/PostgreSQL + HTTPS     |
| 3   | CI/CD Pipeline                | Diferido              | GitHub Actions como candidato probable                    |
| 4   | Librería de Gráficos          | Diferido a Sub-fase 7 | Se evalúa al implementar módulo de visualización          |
| 5   | Migración SQLite → PostgreSQL | Diferido              | EF Core abstrae provider. Sin features SQLite-específicas |
| 6   | Importación de Datos (timing) | Flexible              | Último feature MVP o post-MVP — arquitectura lista        |

### Architecture Completeness Checklist

- [x] Contexto del proyecto analizado (requisitos, constraints, cross-cutting concerns)
- [x] Evaluación de starter/fundación existente (brownfield validado)
- [x] Decisiones críticas documentadas (balance strategy, soft delete, API conventions, auth, cache)
- [x] Stack completo con versiones específicas
- [x] Patrones de implementación con checklists de archivos
- [x] Naming conventions por capa (DB, API, DTOs, frontend)
- [x] Structure patterns (backend vertical slices, frontend feature-first)
- [x] Communication patterns (cache invalidation table, query key factory)
- [x] Process patterns (CRUD flow end-to-end, DB transactions, loading/empty states)
- [x] Project structure por capas y boundaries
- [x] Requirements mapeados a ubicaciones de código
- [x] Cross-cutting concerns mapeados a archivos específicos
- [x] Enforcement guidelines para agentes IA

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** Alta — proyecto brownfield con módulo Accounts validando todos los patrones.

**Key Strengths:**

- Arquitectura ya probada en producción (módulo Cuentas 100% funcional)
- Patrones exhaustivamente documentados — reduce ambigüedad para agentes IA
- Pipeline de errores end-to-end uniforme — cada feature nuevo se beneficia automáticamente
- Decisiones diferidas son legítimas y no bloquean implementación del MVP

**Areas for Future Enhancement:**

- Decisión de hosting y CI/CD (pre-deployment)
- Selección de framework E2E (Sub-fase 8)
- Evaluación librería de gráficos (Sub-fase 7)
- Migración SQLite → PostgreSQL (post-MVP o según necesidad)
