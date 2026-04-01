# SmartPocket Web App - Roadmap de Desarrollo

Este documento define el plan de desarrollo para la aplicación web SmartPocket. Para detalles técnicos de implementación, consultar [copilot-instructions.md](./copilot-instructions.md).

## Estado Actual del Proyecto

- **Fase Actual**: Fase 3 - Desarrollo del MVP (0%)
- **Última Actualización**: Fase 2.6 completada

---

## Fases de Desarrollo

### Fase 1: Estructuración del Proyecto (Completado)

**Logros principales**:

- Stack base: React 19 + TypeScript strict + Vite + Tailwind CSS v4
- Integración shadcn/ui con sistema de colores custom (namespace `sp-blue`, `sp-purple`)
- Arquitectura feature-first + Component Module Pattern
- Layout básico (Header, Sidebar, Dashboard) con glassmorphism
- Alias `@/` para imports absolutos
- Preparación para React Router (tags `<a>` como placeholders)

### Fase 2: Mejoras en la Interfaz de Usuario (Completado)

**Logros principales**:

- Layout optimizado: grid 5 columnas con proporciones 60/40, spacing responsive
- Microinteracciones: hover effects (scale, shadow), animaciones de iconos con group-hover
- Glassmorphism estandarizado: utility classes `.glass-card`, `.glass-card-strong`, `.glass-card-hover`
- Componente UpcomingPayments con mock data implementado

### Fase 2.5: Integración con Backend API (Completado)

**Logros principales**:

- Dependencias instaladas: react-router-dom v7, axios, @tanstack/react-query
- React Router: rutas configuradas, PrivateRoute, active state en Sidebar, página 404
- TanStack Query: QueryClient con staleTime 5min, retry 1, refetchOnWindowFocus false
- Axios: instancia base con interceptors, timeout 10s, proxy de desarrollo hacia API .NET
- Estructura de carpetas: `src/api/` y `src/router/` creadas

### Fase 2.6: Calidad y Robustez (Completado)

**Logros principales**:

- **API Layer refactorizada**: `spApiClient.ts` con tipos `ApiResponse<T>` y `RequestConfig`, abstracción sobre Axios, error handling integrado
- **Error Handling**: ErrorBoundary, Toast centralizado (sonner), ErrorAlert, errorLogger, integración con TanStack Query (QueryCache/MutationCache)
- **Testing básico**: Vitest + Testing Library configurado, tests para formatters y utilidades, coverage básico
- **Documentación**: Patrones de Services y Hooks documentados en copilot-instructions.md
- **Pospuesto**: MSW (backend disponible), Zustand (no necesario aún), Skeleton loaders (se crearán en Fase 3)

### Fase 3: Desarrollo del MVP (En Progreso - 12%)

**Objetivo**: Implementar funcionalidades core con integración completa al backend API .NET.

**Orden de Implementación**: Cuentas → Categorías → Transacciones → Transferencias → Próximos Pagos → Dashboard Real → Gráficos

**Documentación técnica**: Ver [mvp-requirements.md](./mvp-requirements.md) para requerimientos funcionales.

---

#### 3.1: Gestión de Cuentas (Backend Listo - Frontend 100%)

**Services y Hooks** (Completado):

- accountService.ts: CRUD completo (getAll, getById, create, update, delete)
- useAccounts.ts: queries + mutations con TanStack Query
- useCurrencies.ts: query cross-feature
- Pendiente: tests unitarios

**Vista de Listado** (Completado):

- AccountsList.tsx con grid responsive, skeleton loaders, estado vacío
- Integración API real con useAccounts(), formato de moneda
- Botón "Nueva Cuenta" que abre modal de creación

**Formulario de Creación/Edición** (Completado):

- Modal único AccountFormModal.tsx con modo create/edit
- react-hook-form + zod (accountSchema.ts) para validación
- ErrorAlert para errores generales, errores por campo con propertyName
- Icon selector (12 emojis), color picker, campo balance (readonly en edit)
- Integración useCreateAccount/useUpdateAccount con toasts automáticos
- Testing manual exitoso: CRUD completo validado

**Eliminación** (Completado):

- AlertDialog de confirmación, validación backend de transacciones asociadas
- useDeleteAccount() mutation, soft delete (isActive=false), toast automático

**Detalle de Cuenta** (Opcional para MVP): Pospuesto

---

#### 3.2: Gestión de Categorías (Backend Listo - Pendiente)

**Tareas**:

- Services y Hooks: categoriesService.ts, useCategories.ts
- Vista CategoriesList.tsx: secciones separadas Ingresos/Gastos, cards con color e ícono
- Modal creación/edición: selector tipo, color picker, icon selector (Heroicons), validación zod
- Eliminación: validación sin transacciones, soft delete, toast
- Opcional: seed de categorías predefinidas

---

#### 3.3: Gestión de Transacciones (Backend Pendiente)

**Backend**: CRUD, filtros, búsqueda, paginación, actualización automática de saldos

**Tareas Frontend**:

- Services y Hooks: transactionsService.ts, useTransactions.ts, hooks filtros/búsqueda
- Vista TransactionsList.tsx: tabla responsive, paginación (20 items), columnas (fecha, descripción, categoría, cuenta, monto, tipo), badges verde/rojo
- Filtros TransactionFilters.tsx: rango fechas (DatePicker), categoría/cuenta (multi-select), tipo (toggle), query params
- Búsqueda: input con debounce 300ms, buscar en descripción/tags
- Formulario creación/edición: toggle tipo, selección cuenta/categoría, monto, DatePicker, descripción, tags (chips), validación zod
- Eliminación: modal confirmación, actualización saldo backend
- Modal detalle: info completa, tags (badges), botones editar/eliminar

---

#### 3.4: Gestión de Transferencias (Backend Pendiente)

**Backend**: CRUD, validación saldo suficiente, actualización saldos en ambas cuentas, filtros

**Tareas Frontend**:

- Services y Hooks: transfersService.ts, useTransfers.ts
- Vista TransfersList.tsx: tabla (fecha, origen, destino, monto, descripción), iconos flecha, paginación
- Filtros: rango fechas, cuenta origen/destino
- Formulario creación: selección origen/destino (excluir origen), validación saldo, monto, DatePicker, descripción
- Eliminación: modal confirmación, reversión saldos backend
- Detalle modal: info completa, saldos antes/después

**Nota**: Transferencias NO editables (solo crear y eliminar)

---

#### 3.5: Gestión de Próximos Pagos/Ingresos (Backend Pendiente)

**Backend**: CRUD, lógica recurrencia, endpoint marcar como pagado, generación próxima instancia

**Tareas Frontend**:

- Services y Hooks: upcomingPaymentsService.ts, useUpcomingPayments.ts
- Vista UpcomingPaymentsList.tsx: cards ordenados por vencimiento, indicador días restantes, badge recurrencia, filtros (pendientes/pagados), botón "Marcar como pagado"
- Formulario creación/edición: tipo (ingreso/gasto), cuenta, categoría, monto, DatePicker vencimiento, checkbox recurrencia, selector tipo recurrencia
- Marcar como pagado: modal con opción crear transacción, generar próxima instancia si recurrente, invalidar queries dashboard
- Eliminación: modal con opción eliminar instancia o todas (si recurrente)

---

#### 3.6: Dashboard - Integración con API Real

**Tareas**:

- Tarjetas Financieras: reemplazar mock por API, service estadísticas (Total Balance, Income, Expenses, Savings), skeleton loaders
- Transacciones Recientes: reemplazar mock por useRecentTransactions() límite 5, link "Ver todas" → /transactions
- Próximos Pagos: reemplazar mock por useUpcomingPayments() límite 5, ordenar por vencimiento
- Invalidación cache: configurar en mutations transacciones/cuentas/transferencias
- Indicadores visuales: badges alertas vencimientos, colores consistentes

---

#### 3.7: Visualización de Datos (Gráficos)

**Backend**: Endpoints estadísticas por categoría y evolución temporal (6-12 meses), agregación mensual

**Tareas Frontend**:

- Evaluar librería: Recharts vs Chart.js vs Tremor, instalar e integrar con shadcn/ui
- CategoryExpensesChart.tsx: gráfico torta/donut, % y monto por categoría, selector período (mes, 3/6/12 meses), colores consistentes, tooltips
- IncomeExpensesChart.tsx: gráfico líneas/barras, Ingresos vs Gastos mensual, últimos 6-12 meses, tooltips, línea tendencia (opcional)
- Integración Dashboard: sección dedicada, grid responsive, lazy loading, skeleton loaders

---

#### 3.8: Mejoras de UX y Pulido (Final de MVP)

**Tareas**:

- Loading: Skeleton components (shadcn/ui) en todas las vistas, spinner en botones
- Estados vacíos: mensajes instructivos, ilustraciones/iconos grandes
- Navegación: breadcrumbs (opcional), links "Volver" en detalles
- Validación global: revisar formularios, mensajes consistentes, client/server-side
- Responsividad: revisar mobile, tablas → cards en mobile, optimizar modals
- Testing: integración flujos críticos, smoke tests rutas, edge cases error handling
- Documentación: README setup, variables entorno, guía desarrollo

---

**Progreso Total Fase 3**: 1/8 sub-fases completadas (Cuentas 100%)

### Fase 4: Refinamiento y Optimización (Pendiente)

**Objetivo**: Pulir detalles, optimizar performance y accesibilidad.

**Tareas**:

- Mejoras RecentTransactions: paginación, filtros, ordenamiento
- Sistema tema oscuro/claro: selector, variables CSS (requiere refactorización, actualmente dark por defecto)
- Performance: React.memo(), lazy loading rutas, code splitting features, optimizar re-renders, auditoría bundle size
- Accesibilidad (a11y): ARIA labels, navegación teclado completa, contraste WCAG AA, screen readers, focus management
- Testing: integración flujos principales, E2E Playwright (opcional), coverage 70%+
- Optimizaciones: animaciones GPU, responsive polish, error handling completo

---

## Convenciones y Guías Técnicas

Para detalles de implementación, arquitectura, convenciones de código y design system, consultar **[copilot-instructions.md](./copilot-instructions.md)**.
