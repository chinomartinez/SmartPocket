# Technical Requirements Specification - SmartPocket

**Document Type:** Technical Reference  
**Last Updated:** 2026-04-15  
**Status:** MVP In Progress (12% Complete)  
**Related Documents:** [Product Brief](product-brief-SmartPocket-2026-02-28.md)

## Requirements Traceability

**Total Functional Requirements:** 46 (FR1-FR46)  
**Total Non-Functional Requirements:** 34 (NFR1-NFR34)

**Coverage by Module:**

| Module                   | FRs        | Status        |
| ------------------------ | ---------- | ------------- |
| Gestión de Cuentas       | FR1-FR5    | ✅ Completado |
| Gestión de Categorías    | FR6-FR10b  | ✅ Completado |
| Gestión de Transacciones | FR11-FR17b | 🔵 Pendiente  |
| Transferencias           | FR18-FR23  | 🔵 Pendiente  |
| Próximos Pagos           | FR24-FR30  | 🔵 Pendiente  |
| Dashboard/Reportes       | FR31-FR37  | 🔵 Pendiente  |
| Gestión de Datos         | FR38-FR41  | 🔵 Pendiente  |
| Multi-Dispositivo        | FR42-FR46  | 🔵 Pendiente  |

**NFR Coverage:**

| Category     | NFRs        | Priority      |
| ------------ | ----------- | ------------- |
| Performance  | NFR1-NFR8   | 🔴 Bloqueante |
| Security     | NFR9-NFR13  | 🔴 Bloqueante |
| Reliability  | NFR14-NFR18 | 🔴 Bloqueante |
| Code Quality | NFR19-NFR24 | 🔴 Bloqueante |
| Deployment   | NFR25-NFR28 | 🟡 Alta       |
| Usability    | NFR29-NFR34 | 🟡 Alta       |

## Functional Requirements

### Gestión de Cuentas

- **FR1:** El usuario puede crear cuentas financieras con nombre, moneda, y balance inicial
- **FR2:** El usuario puede ver lista de todas las cuentas activas con balances actuales
- **FR3:** El usuario puede editar detalles de cuenta (nombre, moneda)
- **FR4:** El usuario puede eliminar cuentas con soft delete (datos preservados, marcados como inactivos)
- **FR5:** El sistema calcula automáticamente los balances de cuenta desde transacciones y transferencias

### Gestión de Categorías

- **FR6:** El usuario puede crear categorías de transacción con tipo (ingreso/gasto)
- **FR7:** El usuario puede asignar colores e íconos a categorías para identificación visual
- **FR8:** El usuario puede editar detalles de categoría (nombre, tipo, color, ícono)
- **FR9:** El usuario puede eliminar categorías con soft delete (datos preservados, validación para transacciones existentes)
- **FR10:** El usuario puede ver lista de todas las categorías organizadas por tipo
- **FR10b:** El usuario puede reordenar categorías manualmente para priorizar las más utilizadas en selección de transacciones

### Gestión de Transacciones

- **FR11:** El usuario puede registrar transacciones con fecha, monto, cuenta, categoría, y descripción
- **FR12:** El usuario puede agregar tags opcionales a transacciones para organización flexible
- **FR13:** El usuario puede editar detalles de transacción después de crearla
- **FR14:** El usuario puede eliminar transacciones con soft delete (con recalculación automática de balances)
- **FR15:** El usuario puede filtrar transacciones por períodos predefinidos (semana, mes, año), rango de fecha personalizado, cuenta, categoría, y tags
- **FR16:** El usuario puede buscar transacciones en tiempo real por descripción o tags
- **FR17:** El usuario puede ver historial de transacciones ordenado por fecha (más reciente primero)
- **FR17b:** El usuario puede usar mini calculadora integrada en modal de transacciones con operaciones básicas (+−×÷), resultado se inserta automáticamente en campo monto

### Gestión de Transferencias

- **FR18:** El usuario puede crear transferencias entre cuentas con fecha, monto, y descripción
- **FR19:** El sistema actualiza automáticamente balances de ambas cuentas involucradas en transferencia
- **FR20:** El sistema valida balance suficiente en cuenta origen antes de transferencia
- **FR21:** El usuario puede editar transferencias (fecha, monto, descripción, cuentas origen/destino) con recalculación automática de balances
- **FR22:** El usuario puede eliminar transferencias con recalculación automática de balances
- **FR23:** El usuario puede ver historial de transferencias con detalles de cuenta origen/destino

### Pagos e Ingresos Recurrentes

- **FR24:** El usuario puede crear próximos pagos con fecha, monto, cuenta, categoría, y patrón de recurrencia
- **FR25:** El usuario puede crear próximos ingresos con los mismos atributos que pagos
- **FR26:** El usuario puede marcar próximos pagos/ingresos como "pagado" (se convierte en transacción)
- **FR27:** El sistema genera automáticamente entradas recurrentes basadas en patrones de recurrencia (diario, semanal, mensual, anual)
- **FR28:** El usuario puede editar detalles de próximo pago/ingreso antes de marcar como pagado
- **FR29:** El usuario puede eliminar entradas de próximos pagos/ingresos
- **FR30:** El usuario puede ver lista de próximos eventos financieros ordenados por fecha

### Dashboard Financiero y Reportes

- **FR31:** El usuario puede ver tarjetas de resumen financiero consolidado (balance total, ingresos totales, gastos totales, ahorros)
- **FR32:** El usuario puede ver transacciones recientes de todas las cuentas
- **FR33:** El usuario puede ver próximos pagos/ingresos en dashboard
- **FR34:** El usuario puede filtrar datos de dashboard por rangos de fecha
- **FR35:** El usuario puede ver desglose de gastos por categoría en gráfico de torta/donut
- **FR36:** El usuario puede ver evolución financiera temporal en gráficos de líneas/barras
- **FR37:** El usuario puede seleccionar rango de fecha para visualizaciones de gráficos (mensual, trimestral, anual)

### Gestión de Datos

- **FR38:** El usuario puede importar datos financieros históricos desde formato Excel
- **FR39:** El sistema valida integridad de datos durante proceso de importación
- **FR40:** El sistema maneja 1000-2000 transacciones sin degradación de performance
- **FR41:** El sistema preserva todos los datos financieros cuando cuentas/categorías/transacciones son soft-deleted

### Experiencia Multi-Dispositivo

- **FR42:** El usuario puede acceder a la aplicación desde navegadores desktop (Chrome, Edge, Brave)
- **FR43:** El usuario puede acceder a la aplicación desde navegadores móviles con interfaz optimizada para touch
- **FR44:** El usuario puede acceder a la aplicación desde dispositivos tablet con layout responsive
- **FR45:** El sistema cumple browser support (NFR29), responsive design (NFR30), y touch-friendly UI (NFR31) para experiencia cross-device
- **FR46:** El sistema requiere conexión a internet activa para operar (online-only en MVP)

---

## Non-Functional Requirements

### Performance

- **NFR1:** La carga inicial de la aplicación debe completarse en menos de 2 segundos en desktop y mobile
- **NFR2:** El tiempo hasta interactividad (TTI) debe ser menor a 3 segundos
- **NFR3:** El Largest Contentful Paint (LCP) debe ser menor a 2.5 segundos
- **NFR4:** Las operaciones CRUD de API deben responder en menos de 500ms
- **NFR5:** Las interacciones de UI deben responder en menos de 100ms
- **NFR6:** El scrolling debe mantener 60 FPS consistentes
- **NFR7:** El feedback de envío de formularios debe ser instantáneo (<50ms)
- **NFR8:** El sistema debe manejar 1000-2000 transacciones sin degradación de performance

### Security & Data Protection

- **NFR9:** Todos los datos financieros deben estar protegidos contra acceso no autorizado mediante permisos de filesystem y acceso restringido al servidor
- **NFR10:** La base de datos debe estar almacenada de forma segura en el servidor con permisos restrictivos y acceso exclusivo vía aplicación backend
- **NFR11:** Las comunicaciones entre frontend y backend deben usar HTTPS en producción
- **NFR12:** Los datos soft-deleted (cuentas, categorías, transacciones) deben preservarse y ser irrecuperables por usuarios
- **NFR13:** El sistema debe validar y sanitizar todos los inputs del usuario para prevenir inyección SQL

### Reliability & Data Integrity

- **NFR14:** Las operaciones financieras críticas (transacciones, transferencias) deben ser atómicas (ACID compliant)
- **NFR15:** Los balances de cuenta deben recalcularse automáticamente con 100% de precisión después de transacciones/transferencias
- **NFR16:** El sistema debe prevenir estados inconsistentes de datos (ej: transferencias sin balance suficiente)
- **NFR17:** El sistema debe tener 0 bugs críticos (show-stoppers) en producción durante 2 semanas de uso para adopción
- **NFR18:** Las operaciones de soft delete deben preservar integridad referencial de datos

### Code Quality & Testing

- **NFR19:** El código frontend debe mantener >60% de cobertura de tests
- **NFR20:** El código backend debe mantener >60% de cobertura de tests
- **NFR21:** El código TypeScript debe cumplir 100% con modo strict (sin tipos `any`)
- **NFR22:** El código debe tener 0 errores de linting (ESLint en frontend, .NET Analyzer en backend)
- **NFR23:** La arquitectura Clean Architecture + CQRS debe estar documentada y validada
- **NFR24:** Los tests E2E deben cubrir flujos críticos (registro transacciones, transferencias)

### Deployment & Operations

- **NFR25:** La aplicación debe estar desplegada y accesible 24/7 en producción
- **NFR26:** El pipeline CI/CD debe ejecutar build → test → deploy de forma automatizada
- **NFR27:** El sistema debe requerir conexión a internet activa (online-only en MVP)
- **NFR28:** La base de datos SQLite debe funcionar correctamente en producción

### Usability & User Experience

- **NFR29:** La aplicación debe ser completamente funcional en navegadores Chrome, Edge, y Brave (versiones modernas)
- **NFR30:** La interfaz debe ser responsive y funcional en desktop (1920x1080, 1366x768), tablet (768-1024px), y mobile (375-428px)
- **NFR31:** La UI debe ser touch-friendly en dispositivos móviles y tablets
- **NFR32:** El usuario debe poder navegar completamente usando teclado (Tab, Shift+Tab, Enter, Escape)
- **NFR33:** Los elementos interactivos deben tener focus visible
- **NFR34:** Los formularios deben tener labels asociados a inputs correctamente

---

## Web Application Specific Requirements

### Project-Type Overview

SmartPocket es una Single Page Application (SPA) desarrollada con React 19, diseñada para uso personal en desktop y mobile a través de navegadores modernos. La aplicación prioriza simplicidad arquitectónica (REST API tradicional) y enfoque pragmático en MVP, dejando capacidades avanzadas (PWA, offline, accesibilidad completa) para Growth Features post-MVP.

### Browser Support & Compatibility

**Target Browsers (Evergreen - Modern Versions Only):**

- Chrome (navegador principal)
- Edge (Chromium-based)
- Brave (uso ocasional en tablet)

**Estrategia:** Enfoque en navegadores evergreen sin soporte legacy. Sin polyfills para navegadores antiguos.

**Testing:** Validación manual en Chrome (primario) + smoke tests en Edge/Brave según disponibilidad.

### Responsive Design Requirements

**Device Support:**

- Desktop (primary): 1920x1080, 1366x768
- Tablet: 768px-1024px (contexto Brave)
- Mobile: 375px-428px (iOS/Android web browsers)

**Design Approach:**

- Mobile-first CSS
- Breakpoints adaptativos para tablet/desktop
- Touch-friendly UI en mobile (botones, formularios)

**Critical User Flows - Multi-Device:**

- Desktop: Registro rápido de transacciones, gestión completa
- Mobile: Registro inmediato de gastos on-the-go
- Tablet: Revisión de transacciones, gráficos

### Performance Targets

**Load Performance:**

- Initial load (desktop/mobile): <2 segundos
- Time to Interactive (TTI): <3 segundos
- Largest Contentful Paint (LCP): <2.5 segundos

**Runtime Performance:**

- API response time: <500ms (CRUD operations)
- UI interaction responsiveness: <100ms
- Smooth scrolling: 60 FPS
- Form submission feedback: instantáneo (<50ms)

**Data Volume Handling:**

- Soporte 1000-2000 transacciones sin degradación
- Paginación/virtualización si listas exceden 100 items
- Lazy loading de gráficos/dashboard widgets

### SEO Strategy

**SEO: Not Applicable**

SmartPocket es una aplicación de uso personal sin intención de indexación pública. No se requiere optimización para motores de búsqueda en MVP ni post-MVP.

### Accessibility Requirements

**MVP Level: Basic Navigation**

**Must-Have (Bloqueante para MVP):**

- ✅ Navegación completa por teclado (Tab, Shift+Tab, Enter, Escape)
- ✅ Focus visible en elementos interactivos
- ✅ Formularios accesibles (labels asociados a inputs)

**Post-MVP (Growth Features):**

- Atajos de teclado personalizados (Ctrl+N, Ctrl+K, etc.)
- ARIA labels completos
- Screen reader support
- WCAG AA compliance
- High contrast mode
