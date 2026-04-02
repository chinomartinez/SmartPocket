# SmartPocket - Copilot Rules

Manual técnico para GitHub Copilot. React 19 + TypeScript + Tailwind v4.

---

## Descripción

SmartPocket es una aplicación web full-stack de gestión financiera personal que reemplaza aplicaciones comerciales limitadas (anuncios, paywalls, falta de privacidad) con una solución propia bajo control total del usuario. Como proyecto de portfolio profesional, demuestra arquitectura moderna (.NET 9 + React 19 con Clean Architecture + CQRS) y desarrollo acelerado con IA.

**MVP**:

El MVP entrega paridad funcional completa con apps comerciales actuales: gestión de cuentas/categorías, registro de transacciones con búsqueda avanzada, transferencias, recordatorios de pagos, dashboard con métricas en tiempo real, y visualizaciones gráficas. Sin anuncios, acceso desktop + mobile, y fundación sólida para features innovadoras futuras (OCR, análisis predictivo con IA, conexión bancaria segura).

**Monorepo**:

- `webapp/` - Frontend (React 19 + TypeScript + Tailwind v4)
- `backend/` - API REST (.NET)
- `_docs/` - Documentación, specs, épicas, roadmap

## Uso Principal de IA

1. Desarrollo frontend (webapp/)
2. Planning & especificaciones (épicas, historias de usuario, roadmap)
3. Documentación técnica

## REGLAS CRITICAS!

- La IA solo trabaja con `webapp/` y `_docs/planning/`. Por el momento.
- El código backend es manual. Solo intervenir en backend si se solicita explícitamente.
- Si algo es ambiguo, preguntar antes de asumir.
- No inventar endpoints. Si el backend no tiene un endpoint para algo, no lo hagas. En su lugar, pregunta cómo proceder.

## Prioridades del Proyecto

1. UX excepcional
2. Código mantenible y limpio
3. Interfaz atractiva
4. Performance

## Convenciones Generales

- **Código**: Inglés (variables, funciones, clases, archivos)
- **Comentarios**: Español
- **Comunicación**: Español (git commits, documentación, specs)

## Decisiones Arquitectónicas Clave

**Balance Calculation:** SUM on-the-fly (no stored balance en Account.cs)
**Soft Delete:** `IsDeleted` + `HasQueryFilter` global (transparente)
**Auth:** Sin autenticación en MVP (diferido post-MVP)
**API Errors:** ProblemDetails (RFC 7807) end-to-end
**DB:** SQLite actual → PostgreSQL probable futuro
**Imports:** Named exports only (NO default exports)
**Testing:** Coverage mínimo 60% MVP

## Estructura

- Frontend: Feature-first architecture en `webapp/src/features/`
- Backend: Feature-first organization (vertical slices) en `backend/src/`
- Docs centralizadas en `_docs/`

**Mapa de carpetas de `webapp/src/` (simplificado):**

```
src/
├── api/          # HTTP client + services por entidad
├── components/   # UI reutilizable + shadcn
├── features/     # Módulos feature-first
├── hooks/        # Custom hooks compartidos
├── layout/       # Header, Sidebar, Layout
├── router/       # AppRouter, rutas
├── store/        # Zustand stores
└── utils/        # Helpers puros
```

**Mapa de carpetas de `_docs/` (simplificado):**

```
_docs/
├── planning/      # Épicas, historias de usuario, roadmap
├── others/        # Documentación sin uso directo. Almacenamiento de referencia.
```
