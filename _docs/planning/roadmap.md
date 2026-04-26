# SmartPocket Web App - Roadmap de Desarrollo

Este documento define el plan de desarrollo para la aplicación web SmartPocket.

**Documentos de referencias**

- [Product Brief](product-brief-SmartPocket-2026-02-28.md)
- [Web Application Requirement](web-application-requirements.md)

## Estado Actual del Proyecto

- **Fase Actual**: Fase 3 - Desarrollo del MVP (25%)
- **Última Actualización**: Fase 3.2 completada

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

---

#### 3.1: Account Management

**Estado:** ✅ **Ya implementado 100%**

**Resultado de Usuario:** El usuario puede gestionar múltiples cuentas financieras con diferentes monedas, ver balances actualizados automáticamente, y mantener control completo sobre sus cuentas activas/inactivas.

**FRs**

- [x] FR1: Crear cuentas financieras con nombre, moneda, balance inicial
- [x] FR2: Ver lista de cuentas activas con balances actuales
- [x] FR3: Editar detalles de cuenta (nombre, moneda)
- [x] FR4: Eliminar cuentas con soft delete
- [x] FR5: Cálculo automático de balances desde transacciones/transferencias

**Referencias:**

- Sirve como base para Epic 3 (Transaction Management) y Epic 4 (Inter-Account Transfers)

---

#### 3.2: Category Management

**Estado:** ✅ **Ya implementado 100%**

**Resultado de Usuario:** El usuario puede organizar sus transacciones con categorías personalizadas, asignar colores e íconos para identificación visual rápida, y priorizar categorías frecuentes mediante reordenamiento manual.

**FRs**

- [x] FR6: Crear categorías con tipo (ingreso/gasto)
- [x] FR7: Asignar colores e íconos a categorías
- [x] FR8: Editar detalles de categoría
- [x] FR9: Eliminar categorías con soft delete y validación
- [x] FR10: Ver lista de categorías organizadas por tipo
- [x] FR10b: Reordenar categorías manualmente

**Referencias:**

- Sirve como base para Fase 3.3 (Transaction Management) y Fase 3.4 (Inter-Account Transfers)

---

#### 3.3: Transaction Management

**Estado:** ⏳ Pendiente

**Resultado de Usuario:** El usuario puede registrar ingresos y gastos diarios con velocidad (<30s), usar mini calculadora integrada para sumar componentes de gastos compuestos, filtrar y buscar transacciones históricas, y gestionar sus finanzas con tags opcionales y descripciones.

**FRs**

- [x] FR11: Registrar transacciones con fecha, monto, cuenta, categoría, descripción
- [] FR12: Agregar tags opcionales a transacciones
- [x] FR13: Editar detalles de transacción
- [] FR14: Eliminar transacciones con soft delete y recalculación de balances
- [] FR15: Filtrar transacciones por períodos, rango fecha, cuenta, categoría, tags
- [] FR16: Buscar transacciones en tiempo real
- [] FR17: Ver historial de transacciones ordenado por fecha
- [] FR47: Usar mini calculadora integrada en modal de transacciones
- [x] FR48: Ver listado de transacciones recientes, ordenados por fecha.

---

#### 3.4: Inter-Account Transfers

**Estado:** ⏳ Pendiente

**Resultado de Usuario:** El usuario puede mover dinero entre sus cuentas de forma segura, con validación de saldo suficiente, actualización automática de balances, y capacidad de editar/eliminar transferencias con recalculación correcta.

**FRs:**

- [] FR18: Crear transferencias entre cuentas
- [] FR19: Actualización automática de balances en ambas cuentas
- [] FR20: Validar balance suficiente en cuenta origen
- [] FR21: Editar transferencias con recalculación automática
- [] FR22: Eliminar transferencias con recalculación automática
- [] FR23: Ver historial de transferencias

---

#### 3.5: Recurring Financial Events

**Estado:** ⏳ Pendiente

**Resultado de Usuario:** El usuario puede planificar pagos e ingresos recurrentes (facturas, salarios, suscripciones), marcarlos como pagados para convertirlos en transacciones, y gestionar patrones de recurrencia automática (diario, semanal, mensual, anual).

**FRs:**

- [] FR24: Crear próximos pagos con recurrencia
- [] FR25: Crear próximos ingresos con recurrencia
- [] FR26: Marcar próximos pagos/ingresos como pagado
- [] FR27: Generación automática de entradas recurrentes
- [] FR28: Editar detalles de próximo pago/ingreso
- [] FR29: Eliminar entradas de próximos pagos/ingresos
- [] FR30: Ver lista de próximos eventos financieros

---

#### 3.6: Financial Overview Dashboard

**Estado:** ⏳ Pendiente

**Resultado de Usuario:** El usuario puede ver su estado financiero consolidado de un vistazo (balance total, ingresos, gastos, ahorros), revisar transacciones recientes, ver próximos pagos pendientes, y filtrar datos por rangos de fecha para análisis operacional rápido.

**FRs:**

- [] FR31: Ver tarjetas de resumen financiero consolidado
- [] FR32: Ver transacciones recientes de todas las cuentas
- [] FR33: Ver próximos pagos/ingresos en dashboard
- [] FR34: Filtrar datos de dashboard por rangos de fecha

---

#### 3.7: Data Visualization & Analytics

**Estado:** ⏳ Pendiente

**Resultado de Usuario:** El usuario puede analizar sus patrones de gastos por categoría con gráficos de torta/donut, visualizar evolución temporal de ingresos/gastos con gráficos de líneas/barras, y seleccionar períodos de análisis (mensual, trimestral, anual) para tomar decisiones financieras informadas.

**FRs:**

- [] FR35: Ver desglose de gastos por categoría en gráfico torta/donut
- [] FR36: Ver evolución financiera temporal en gráficos líneas/barras
- [] FR37: Seleccionar rango de fecha para visualizaciones de gráficos

---

#### 3.8: Data Import & Migration

**Estado:** ⏳ Pendiente

**Resultado de Usuario:** El usuario puede importar sus datos financieros históricos desde archivos Excel con validación automática de integridad, permitiendo migrar desde otras herramientas sin pérdida de información.

**FRs:**

- [] FR38: Importar datos financieros históricos desde Excel
- [] FR39: Validar integridad de datos durante importación

---

#### 3.9: System Quality & User Experience Polish

**Estado:** ⏳ Pendiente

**Resultado de Usuario:** El usuario experimenta una aplicación pulida y confiable con performance óptima (1000-2000 transacciones sin degradación), acceso multi-dispositivo responsive (desktop/tablet/mobile), navegación por teclado completa, y 0 bugs críticos para adopción definitiva.

**FRs:**

- [] FR40: Manejar 1000-2000 transacciones sin degradación de performance
- [] FR41: Preservar datos financieros con soft delete
- [] FR42: Acceso desde navegadores desktop (Chrome, Edge, Brave)
- [] FR43: Acceso desde navegadores móviles con interfaz touch-optimized
- [] FR44: Acceso desde dispositivos tablet con layout responsive
- [] FR45: Cumplir browser support, responsive design, touch-friendly UI
- [] FR46: Conexión a internet activa requerida (online-only en MVP)
- [] NFR1-NFR26: Performance, seguridad, integridad, deployment, usabilidad, accesibilidad

---

#### Non-Functional Requirements

#### Performance

- **NFR1:** La carga inicial de la aplicación debe completarse en menos de 2 segundos en desktop y mobile
- **NFR2:** El tiempo hasta interactividad (TTI) debe ser menor a 3 segundos
- **NFR3:** El Largest Contentful Paint (LCP) debe ser menor a 2.5 segundos
- **NFR4:** Las operaciones CRUD de API deben responder en menos de 500ms
- **NFR5:** Las interacciones de UI deben responder en menos de 100ms
- **NFR6:** El scrolling debe mantener 60 FPS consistentes
- **NFR7:** El feedback de envío de formularios debe ser instantáneo (<50ms)
- **NFR8:** El sistema debe manejar 1000-2000 transacciones sin degradación de performance

#### Security & Data Protection

- **NFR9:** Todos los datos financieros deben estar protegidos contra acceso no autorizado mediante permisos de filesystem y acceso restringido al servidor
- **NFR10:** La base de datos debe estar almacenada de forma segura en el servidor con permisos restrictivos y acceso exclusivo vía aplicación backend
- **NFR11:** Las comunicaciones entre frontend y backend deben usar HTTPS en producción
- **NFR12:** Los datos soft-deleted (cuentas, categorías, transacciones) deben preservarse y ser irrecuperables por usuarios
- **NFR13:** El sistema debe validar y sanitizar todos los inputs del usuario para prevenir inyección SQL

#### Reliability & Data Integrity

- **NFR14:** Las operaciones financieras críticas (transacciones, transferencias) deben ser atómicas (ACID compliant)
- **NFR15:** Los balances de cuenta deben recalcularse automáticamente con 100% de precisión después de transacciones/transferencias
- **NFR16:** El sistema debe prevenir estados inconsistentes de datos (ej: transferencias sin balance suficiente)
- **NFR17:** El sistema debe tener 0 bugs críticos (show-stoppers) en producción durante 2 semanas de uso para adopción
- **NFR18:** Las operaciones de soft delete deben preservar integridad referencial de datos

#### Code Quality & Testing

- **NFR19:** El código frontend debe mantener >60% de cobertura de tests
- **NFR20:** El código backend debe mantener >60% de cobertura de tests
- **NFR21:** El código TypeScript debe cumplir 100% con modo strict (sin tipos `any`)
- **NFR22:** El código debe tener 0 errores de linting (ESLint en frontend, .NET Analyzer en backend)
- **NFR23:** La arquitectura Clean Architecture + CQRS debe estar documentada y validada
- **NFR24:** Los tests E2E deben cubrir flujos críticos (registro transacciones, transferencias)

#### Deployment & Operations

- **NFR25:** La aplicación debe estar desplegada y accesible 24/7 en producción
- **NFR26:** El pipeline CI/CD debe ejecutar build → test → deploy de forma automatizada
- **NFR27:** El sistema debe requerir conexión a internet activa (online-only en MVP)
- **NFR28:** La base de datos SQLite debe funcionar correctamente en producción

#### Usability & User Experience

- **NFR29:** La aplicación debe ser completamente funcional en navegadores Chrome, Edge, y Brave (versiones modernas)
- **NFR30:** La interfaz debe ser responsive y funcional en desktop (1920x1080, 1366x768), tablet (768-1024px), y mobile (375-428px)
- **NFR31:** La UI debe ser touch-friendly en dispositivos móviles y tablets
- **NFR32:** El usuario debe poder navegar completamente usando teclado (Tab, Shift+Tab, Enter, Escape)
- **NFR33:** Los elementos interactivos deben tener focus visible
- **NFR34:** Los formularios deben tener labels asociados a inputs correctamente
