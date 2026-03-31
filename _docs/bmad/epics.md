---
stepsCompleted:
  ["step-01-validate-prerequisites", "step-02-design-epics", "step-03-create-stories-partial"]
inputDocuments:
  - "_docs/planning-artifacts/prd.md"
  - "_docs/planning-artifacts/architecture.md"
  - "_docs/planning-artifacts/ux-design-specification.md"
progressNotes:
  - "Epic 1: Account Management - ✅ 100% implementado (Fase 3 completada)"
  - "Epic 2: Category Management - Story 2.6 (Reordenamiento) definida"
  - "Epic 3-9: Pendientes de crear historias en próxima sesión"
nextStep: "Continuar con Epic 3: Transaction Management (7 stories aprox) y resto de épicas"
---

# SmartPocket - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for SmartPocket, decomposing the requirements from the PRD, UX Design, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

**FR1:** El usuario puede crear cuentas financieras con nombre, moneda, y balance inicial

**FR2:** El usuario puede ver lista de todas las cuentas activas con balances actuales

**FR3:** El usuario puede editar detalles de cuenta (nombre, moneda)

**FR4:** El usuario puede eliminar cuentas con soft delete (datos preservados, marcados como inactivos)

**FR5:** El sistema calcula automáticamente los balances de cuenta desde transacciones y transferencias

**FR6:** El usuario puede crear categorías de transacción con tipo (ingreso/gasto)

**FR7:** El usuario puede asignar colores e íconos a categorías para identificación visual

**FR8:** El usuario puede editar detalles de categoría (nombre, tipo, color, ícono)

**FR9:** El usuario puede eliminar categorías con soft delete (datos preservados, validación para transacciones existentes)

**FR10:** El usuario puede ver lista de todas las categorías organizadas por tipo

**FR10b:** El usuario puede reordenar categorías manualmente para priorizar las más utilizadas en selección de transacciones

**FR11:** El usuario puede registrar transacciones con fecha, monto, cuenta, categoría, y descripción

**FR12:** El usuario puede agregar tags opcionales a transacciones para organización flexible

**FR13:** El usuario puede editar detalles de transacción después de crearla

**FR14:** El usuario puede eliminar transacciones con soft delete (con recalculación automática de balances)

**FR15:** El usuario puede filtrar transacciones por períodos predefinidos (semana, mes, año), rango de fecha personalizado, cuenta, categoría, y tags

**FR16:** El usuario puede buscar transacciones en tiempo real por descripción o tags

**FR17:** El usuario puede ver historial de transacciones ordenado por fecha (más reciente primero)

**FR17b:** El usuario puede usar mini calculadora integrada en modal de transacciones con operaciones básicas (+−×÷), resultado se inserta automáticamente en campo monto

**FR18:** El usuario puede crear transferencias entre cuentas con fecha, monto, y descripción

**FR19:** El sistema actualiza automáticamente balances de ambas cuentas involucradas en transferencia

**FR20:** El sistema valida balance suficiente en cuenta origen antes de transferencia

**FR21:** El usuario puede editar transferencias (fecha, monto, descripción, cuentas origen/destino) con recalculación automática de balances

**FR22:** El usuario puede eliminar transferencias con recalculación automática de balances

**FR23:** El usuario puede ver historial de transferencias con detalles de cuenta origen/destino

**FR24:** El usuario puede crear próximos pagos con fecha, monto, cuenta, categoría, y patrón de recurrencia

**FR25:** El usuario puede crear próximos ingresos con los mismos atributos que pagos

**FR26:** El usuario puede marcar próximos pagos/ingresos como "pagado" (se convierte en transacción)

**FR27:** El sistema genera automáticamente entradas recurrentes basadas en patrones de recurrencia (diario, semanal, mensual, anual)

**FR28:** El usuario puede editar detalles de próximo pago/ingreso antes de marcar como pagado

**FR29:** El usuario puede eliminar entradas de próximos pagos/ingresos

**FR30:** El usuario puede ver lista de próximos eventos financieros ordenados por fecha

**FR31:** El usuario puede ver tarjetas de resumen financiero consolidado (balance total, ingresos totales, gastos totales, ahorros)

**FR32:** El usuario puede ver transacciones recientes de todas las cuentas

**FR33:** El usuario puede ver próximos pagos/ingresos en dashboard

**FR34:** El usuario puede filtrar datos de dashboard por rangos de fecha

**FR35:** El usuario puede ver desglose de gastos por categoría en gráfico de torta/donut

**FR36:** El usuario puede ver evolución financiera temporal en gráficos de líneas/barras

**FR37:** El usuario puede seleccionar rango de fecha para visualizaciones de gráficos (mensual, trimestral, anual)

**FR38:** El usuario puede importar datos financieros históricos desde formato Excel

**FR39:** El sistema valida integridad de datos durante proceso de importación

**FR40:** El sistema maneja 1000-2000 transacciones sin degradación de performance

**FR41:** El sistema preserva todos los datos financieros cuando cuentas/categorías/transacciones son soft-deleted

**FR42:** El usuario puede acceder a la aplicación desde navegadores desktop (Chrome, Edge, Brave)

**FR43:** El usuario puede acceder a la aplicación desde navegadores móviles con interfaz optimizada para touch

**FR44:** El usuario puede acceder a la aplicación desde dispositivos tablet con layout responsive

**FR45:** El sistema cumple browser support (NFR29), responsive design (NFR30), y touch-friendly UI (NFR31) para experiencia cross-device

**FR46:** El sistema requiere conexión a internet activa para operar (online-only en MVP)

### Non-Functional Requirements

**NFR1:** La carga inicial de la aplicación debe completarse en menos de 2 segundos en desktop y mobile

**NFR2:** El tiempo hasta interactividad (TTI) debe ser menor a 3 segundos

**NFR3:** El Largest Contentful Paint (LCP) debe ser menor a 2.5 segundos

**NFR4:** Las operaciones CRUD de API deben responder en menos de 500ms

**NFR5:** Las interacciones de UI deben responder en menos de 100ms

**NFR6:** El scrolling debe mantener 60 FPS consistentes

**NFR7:** El feedback de envío de formularios debe ser instantáneo (<50ms)

**NFR8:** El sistema debe manejar 1000-2000 transacciones sin degradación de performance

**NFR9:** Todos los datos financieros deben estar protegidos contra acceso no autorizado mediante permisos de filesystem y acceso restringido al servidor

**NFR10:** La base de datos debe estar almacenada de forma segura en el servidor con permisos restrictivos y acceso exclusivo vía aplicación backend

**NFR11:** Las comunicaciones entre frontend y backend deben usar HTTPS en producción

**NFR12:** Los datos soft-deleted (cuentas, categorías, transacciones) deben preservarse y ser irrecuperables por usuarios

**NFR13:** El sistema debe validar y sanitizar todos los inputs del usuario para prevenir inyección SQL

**NFR14:** Las operaciones financieras críticas (transacciones, transferencias) deben ser atómicas (ACID compliant)

**NFR15:** Los balances de cuenta deben recalcularse automáticamente con 100% de precisión después de transacciones/transferencias

**NFR16:** El sistema debe prevenir estados inconsistentes de datos (ej: transferencias sin balance suficiente)

**NFR17:** El sistema debe tener 0 bugs críticos (show-stoppers) en producción durante 2 semanas de uso para adopción

**NFR18:** Las operaciones de soft delete deben preservar integridad referencial de datos

**NFR19:** El código frontend debe mantener >60% de cobertura de tests

**NFR20:** El código backend debe mantener >60% de cobertura de tests

**NFR21:** El código TypeScript debe cumplir 100% con modo strict (sin tipos `any`)

**NFR22:** El código debe tener 0 errores de linting (ESLint en frontend, .NET Analyzer en backend)

**NFR23:** La arquitectura Clean Architecture + CQRS debe estar documentada y validada

**NFR24:** Los tests E2E deben cubrir flujos críticos (registro transacciones, transferencias)

**NFR25:** La aplicación debe estar desplegada y accesible 24/7 en producción

**NFR26:** El pipeline CI/CD debe ejecutar build → test → deploy de forma automatizada

**NFR27:** El sistema debe requerir conexión a internet activa (online-only en MVP)

**NFR28:** La base de datos SQLite debe funcionar correctamente en producción

**NFR29:** La aplicación debe ser completamente funcional en navegadores Chrome, Edge, y Brave (versiones modernas)

**NFR30:** La interfaz debe ser responsive y funcional en desktop (1920x1080, 1366x768), tablet (768-1024px), y mobile (375-428px)

**NFR31:** La UI debe ser touch-friendly en dispositivos móviles y tablets

**NFR32:** El usuario debe poder navegar completamente usando teclado (Tab, Shift+Tab, Enter, Escape)

**NFR33:** Los elementos interactivos deben tener focus visible

**NFR34:** Los formularios deben tener labels asociados a inputs correctamente

### Additional Requirements

**Architecture Requirements:**

- **Proyecto Brownfield:** SmartPocket está en Fase 3 (12% completado) con módulo de Gestión de Cuentas implementado al 100%. No se requiere story de inicialización - el proyecto ya está operativo.

- **Balance Calculation Strategy:** Balance on-the-fly via SUM query (InitialBalance + SUM transacciones). No se almacena balance calculado - se computa desde transacciones por precisión y simplicidad.

- **Soft Delete Universal:** Campo `IsDeleted` en `BaseAuditEntity` + `HasQueryFilter` global filtra automáticamente soft-deleted. `SoftDeleteSaveChangesInterceptor` intercepta deletes.

- **Transaccionalidad Multi-Entidad:** Transferencias requieren `IDbContextTransaction` explícito (2 transacciones + 2 updates de balance atómicamente). Editar transferencia = revertir original + aplicar nueva en una transacción.

- **Cache Invalidation Cross-Feature:** Estrategia mixta (prefijo intra-feature + explícito cross-feature). Crear/editar/eliminar transacción → invalidar `['accounts']`, `['dashboard']`. Transferencias → invalidar ambas cuentas. Pagos recurrentes → múltiples invalidaciones.

- **Query Key Factory Pattern:** Obligatorio por feature con estructura estandarizada (all, lists, list with filters, details, detail by id).

- **Error Handling Pipeline:** Result pattern (backend) → ProblemDetails (API) → Axios interceptor → ApiError → TanStack Query toast automático → UI inline errors.

- **Importación de Datos:** Feature dedicada con UI de upload (frontend) + endpoint API (backend) que procesa archivo Excel y crea transacciones en batch. Timing flexible: final del MVP o post-MVP.

- **Sin Autenticación en MVP:** API sin auth middleware ni login. Single-user, acceso localhost o servidor propio. CORS configurado solo para orígenes conocidos.

- **Persistencia:** SQLite actual con posible migración a PostgreSQL. EF Core abstrae DB provider. Restricción: evitar features SQLite-específicas.

- **REST API Conventions:** URL pattern `/api/{entity}` (plural, lowercase). Sin versionado en MVP. Paginación flexible por feature. Filtros vía query string params.

- **API Response Formats:** GET collection retorna `PagedListResponse<T>`. POST create retorna DTO con `ToActionResult()`. Errores vía `ApiProblemDetails` con `ErrorDetails Errors`.

- **Formato de Fechas:** API JSON en ISO 8601. Frontend display en formato localizado español. Base de datos en TEXT (SQLite) o timestamp (PostgreSQL).

- **Montos Financieros:** Backend usa `decimal`. API JSON como number. Frontend usa `number`. Display con separador de miles y 2 decimales (formato argentino).

- **Feature Structure Pattern:** Backend sigue vertical slices en `Features/{Entity}/{Operation}/`. Frontend sigue feature-first en `features/{feature}/`. Checklists de archivos documentados en architecture.md.

- **Loading & Empty States:** Todas las listas usan Skeleton de shadcn durante `isLoading`. Botones submit muestran spinner + "Guardando..." + disabled. Empty states con ícono + título + descripción + CTA.

**UX Requirements:**

- **Mini Calculadora Inline:** Mini-calculadora en modal de transacciones con operaciones básicas (+, -, ×, ÷). Botón visible pero no intrusivo. Resultado se inserta automáticamente al campo monto. Feature diferenciador crítico para velocidad de registro.

- **Velocidad de Registro:** Target <30 segundos para registrar transacción completa (<20s ideal). Campos mínimos obligatorios: monto, fecha, cuenta, categoría. Campos opcionales: descripción, tags.

- **Smart Defaults:** Fecha por defecto = HOY. Última cuenta usada o cuenta principal como default. Categorías ordenadas por frecuencia de uso.

- **Responsive sin Disparidad Funcional:** Mobile NO es "versión lite - es la app completa. Adaptar layout por espacio de pantalla, nunca remover funcionalidad. Desktop (sidebar navigation, tablas completas) vs Mobile (bottom/hamburger navigation, cards adaptativas).

- **Dark Mode Glassmorphism:** Sistema de diseño basado en dark mode desde día 1. Paleta vibrante: Primary Blue (#3b82f6), Success Green (#10b981), Accent Purple (#a855f7), Danger Red (#ef4444), Warning Orange (#f59e0b). Efectos glow en números financieros, depth en cards. Light mode como Growth Feature post-MVP.

- **FAB (Floating Action Button):** FAB siempre visible en Home para nueva transacción. 1 clic → modal de transacción abierto. Atajos de teclado diferidos a post-MVP.

- **Arquitectura Home vs Dashboard:**
  - **Home (Operacional):** Balance consolidado, transacciones recientes (últimas 5-10), próximos pagos pendientes, acceso rápido a acciones frecuentes.
  - **Dashboard (Analítico):** Gráficos de gastos por categoría, evolución temporal, métricas y reportes detallados.

- **Balance Siempre Visible:** Balance total = suma de todas las cuentas activas. Siempre visible en Home. Animación counter al actualizarse. Feedback visual inmediato.

- **Feedback Visual Inmediato:** Toast notifications centralizadas (Sonner). Balance con animación suave al cambiar. Confirmación visual de operaciones exitosas. Estados de carga con skeleton screens.

- **Touch-Friendly UI:** Botones y formularios optimizados para touch en mobile y tablet. Dropdowns con iconos + colores personalizados. Targets táctiles mínimos cumplidos.

- **Ordenamiento Personalizable:** Cuentas y categorías permiten reordenamiento manual por el usuario. Campo `SortOrder` persistido. Lógica de reordenamiento en handlers.

- **Basarse en Patrones Probados:** No reinventar soluciones ya resueltas (date pickers, dropdowns). Inspirarse en apps existentes que funcionan bien. Innovar donde agrega valor real.

- **Micro-Interacciones Financieras:** Balance con animación counter. Skeleton loaders consistentes. Badges de estado para próximos pagos (días restantes, recurrencia). Transiciones suaves sin perder contexto.

### FR Coverage Map

[**Epic 1: Account Management**](epics/epic-01-account-management.md) ✅ (Ya implementado 100%)

- FR1: Crear cuentas financieras con nombre, moneda, balance inicial
- FR2: Ver lista de cuentas activas con balances actuales
- FR3: Editar detalles de cuenta (nombre, moneda)
- FR4: Eliminar cuentas con soft delete
- FR5: Cálculo automático de balances desde transacciones/transferencias

[**Epic 2: Category Management**](epics/epic-02-category-management.md) ⏳ (En proceso)

- FR6: Crear categorías con tipo (ingreso/gasto)
- FR7: Asignar colores e íconos a categorías
- FR8: Editar detalles de categoría
- FR9: Eliminar categorías con soft delete y validación
- FR10: Ver lista de categorías organizadas por tipo
- FR10b: Reordenar categorías manualmente

[**Epic 3: Transaction Management**](epics/epic-03-transaction-management.md)

- FR11: Registrar transacciones con fecha, monto, cuenta, categoría, descripción
- FR12: Agregar tags opcionales a transacciones
- FR13: Editar detalles de transacción
- FR14: Eliminar transacciones con soft delete y recalculación de balances
- FR15: Filtrar transacciones por períodos, rango fecha, cuenta, categoría, tags
- FR16: Buscar transacciones en tiempo real
- FR17: Ver historial de transacciones ordenado por fecha
- FR17b: Usar mini calculadora integrada en modal de transacciones

[**Epic 4: Inter-Account Transfers**](epics/epic-04-inter-account-transfers.md)

- FR18: Crear transferencias entre cuentas
- FR19: Actualización automática de balances en ambas cuentas
- FR20: Validar balance suficiente en cuenta origen
- FR21: Editar transferencias con recalculación automática
- FR22: Eliminar transferencias con recalculación automática
- FR23: Ver historial de transferencias

[**Epic 5: Recurring Financial Events**](epics/epic-05-recurring-financial-events.md)

- FR24: Crear próximos pagos con recurrencia
- FR25: Crear próximos ingresos con recurrencia
- FR26: Marcar próximos pagos/ingresos como pagado
- FR27: Generación automática de entradas recurrentes
- FR28: Editar detalles de próximo pago/ingreso
- FR29: Eliminar entradas de próximos pagos/ingresos
- FR30: Ver lista de próximos eventos financieros

[**Epic 6: Financial Overview Dashboard**](epics/epic-06-financial-overview-dashboard.md)

- FR31: Ver tarjetas de resumen financiero consolidado
- FR32: Ver transacciones recientes de todas las cuentas
- FR33: Ver próximos pagos/ingresos en dashboard
- FR34: Filtrar datos de dashboard por rangos de fecha

[**Epic 7: Data Visualization & Analytics**](epics/epic-07-data-visualization-analytics.md)

- FR35: Ver desglose de gastos por categoría en gráfico torta/donut
- FR36: Ver evolución financiera temporal en gráficos líneas/barras
- FR37: Seleccionar rango de fecha para visualizaciones de gráficos

[**Epic 8: Data Import & Migration**](epics/epic-08-data-import-migration.md)

- FR38: Importar datos financieros históricos desde Excel
- FR39: Validar integridad de datos durante importación

[**Epic 9: System Quality & User Experience Polish**](epics/epic-09-system-quality-ux-polish.md)

- FR40: Manejar 1000-2000 transacciones sin degradación de performance
- FR41: Preservar datos financieros con soft delete
- FR42: Acceso desde navegadores desktop (Chrome, Edge, Brave)
- FR43: Acceso desde navegadores móviles con interfaz touch-optimized
- FR44: Acceso desde dispositivos tablet con layout responsive
- FR45: Cumplir browser support, responsive design, touch-friendly UI
- FR46: Conexión a internet activa requerida (online-only en MVP)
- NFR1-NFR34: Performance, seguridad, integridad, testing, deployment, usabilidad
