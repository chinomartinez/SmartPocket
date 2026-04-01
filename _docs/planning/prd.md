---
stepsCompleted:
  [
    "step-01-init",
    "step-02-discovery",
    "step-02b-vision",
    "step-02c-executive-summary",
    "step-03-success",
    "step-04-journeys",
    "step-05-domain-skipped",
    "step-06-innovation-skipped",
    "step-07-project-type",
    "step-08-scoping",
    "step-09-functional",
    "step-10-nonfunctional",
    "step-11-polish",
    "step-e-01-discovery",
    "step-e-02-review",
    "step-e-03-edit",
  ]
inputDocuments:
  - "_docs/planning/product-brief-SmartPocket-2026-02-28.md"
  - "_docs/project-context.md"
workflowType: "prd"
workflow: "edit"
lastEdited: "2026-03-02"
editHistory:
  - date: "2026-03-02"
    changes: "Optimización 4/5→5/5: Eliminadas redundancias estructurales (~39% reducción), añadida sección Domain Considerations (Fintech), refinados requirements para SMART 100%, condensadas narrativas"
    validationGuided: true
classification:
  projectType: "web_app"
  domain: "fintech"
  complexity: "medium"
  projectContext: "brownfield"
  mvpProgress: "12%"
  scope: "mvp_complete"
vision:
  essence: "Herramienta financiera personal construida por ti, para ti, con libertad de evolucionar según TUS necesidades"
  successMoment: "Usar SmartPocket en cualquier lugar y desinstalar app comercial"
  differentiator: "Tu app - como carpintero con su placard - artesanía de software personal"
  motivation: "Necesidad real + capacidad técnica + proyecto final Analista de Sistemas + amor por programar"
  futureState: "Uso diario + agregando funcionalidades a gusto + viviendo el proceso de dev"
---

# Product Requirements Document - SmartPocket

**Author:** Chino
**Date:** 2026-02-28

## Executive Summary

SmartPocket es una aplicación web de gestión financiera personal construida como herramienta de uso diario y proyecto final para la carrera de Analista de Sistemas. El producto resuelve la necesidad inmediata de reemplazar aplicaciones comerciales con anuncios intrusivos, paywalls y falta de control sobre datos sensibles, mientras sirve como fundación técnica para experimentar con funcionalidades innovadoras (OCR, IA, análisis predictivo) cuando el MVP esté consolidado.

El proyecto combina stack moderno (React 19 + .NET 9 + Clean Architecture + CQRS) con filosofía pragmática (KISS sobre sobre-ingeniería), demostrando capacidad de arquitectura profesional, desarrollo acelerado con IA (GitHub Copilot), y ejecución end-to-end completa. SmartPocket NO es un producto comercial — es artesanía de software personal: "como el carpintero que tiene su placard armado por él mismo", con libertad total de evolucionar según necesidades específicas del usuario-desarrollador.

El usuario objetivo es único: Chino (desarrollador que construye su propia herramienta), con criterio de adopción claro: cuando el MVP tenga paridad funcional completa con apps comerciales, se desinstalará definitivamente la alternativa externa. Actualmente el proyecto está en Fase 3 (12% completado) con módulo de Gestión de Cuentas implementado al 100%, siguiendo roadmap estructurado de 8 sub-fases (Cuentas → Categorías → Transacciones → Transferencias → Próximos Pagos → Dashboard → Gráficos → Pulido).

### Diferenciadores Clave

**Control Total:** Código propio auditable, datos bajo control absoluto, hosting propio. Base sólida para features sensibles futuras (conexión bancaria, IA personalizada).

**Arquitectura Extensible:** Diseñada para evolucionar sin reescrituras. Capacidad de agregar features innovadoras (OCR, análisis predictivo) que apps comerciales no ofrecen.

**Artesanía Personal:** Libertad total para programar funcionalidades cuando se necesiten. Portfolio profesional y aprendizaje continuo como consecuencias naturales.

**Pragmatismo Ejecutado:** Desarrollo acelerado con IA + estándares profesionales (TypeScript strict, testing >60%, Clean Architecture validada).

## Clasificación del Proyecto

**Tipo:** Web Application (SPA Frontend + API REST Backend)  
**Dominio:** Fintech - Personal Finance Management  
**Complejidad:** Media (datos sensibles, cálculos importantes, sin regulaciones enterprise en MVP)  
**Contexto:** Brownfield (proyecto existente, Fase 3 en progreso - 12% MVP completado)  
**Stack Técnico:** React 19 + TypeScript + .NET 9 + SQLite + Clean Architecture + CQRS  
**Alcance PRD:** MVP Completo (features implementadas + pendientes) con visión futura compacta

## Success Criteria

### User Success

**Momento de Éxito:**  
Cuando pueda hacer TODO lo que hacía en la app comercial, incluso en local sin desplegar, y decir "listo, lo logramos". El éxito se mide por **paridad funcional completa**, no por métricas artificiales.

**Criterios de Adopción:**

- **Paridad funcional 100%**: Gestión de cuentas, categorías, transacciones, transferencias, próximos pagos, dashboard con datos reales, gráficos
- **Eficiencia mejorada**: Registro de transacciones <30 segundos (vs 45-60s con anuncios en app comercial)
- **Cero anuncios**: 100% de sesiones sin interrupciones publicitarias
- **Disponibilidad multi-dispositivo**: Desktop + mobile (web responsive) según contexto de uso
- **Desinstalación definitiva**: App comercial desinstalada sin dudas ni regresiones

**Uso Sostenido:**

- 2 semanas de uso exclusivo sin bugs críticos (show-stoppers)
- Capacidad de manejar 1-2000 transacciones diarias sin problemas de performance
- Visualización de gráficos funcional (una vez al día, semana o mes según necesidad)
- Operación rutinaria estable (50+ transacciones registradas acumuladas)

### Business Success (Portfolio/Proyecto)

**Objetivo Principal: Proyecto Personal Funcional**

- SmartPocket desplegado y funcional en producción
- Repositorio GitHub público con código profesional
- README completo con setup, arquitectura, tech stack
- Demostración de capacidades full-stack modernas (.NET 9 + React 19)

**Objetivo Académico (En Evaluación):**

- Potencial presentación como proyecto final para Analista de Sistemas
- Documentación completa preparada (PRD, arquitectura, casos de uso)
- Decisión a tomar en coordinación con profesores cuando corresponda
- No bloqueante para MVP - evaluación posterior

**Valor de Portfolio:**

- Evidencia tangible de arquitectura limpia (Clean Architecture + CQRS)
- Demostración de desarrollo acelerado con IA (GitHub Copilot)
- Proyecto completo end-to-end (no solo frontend o backend aislado)
- Disponible para mostrar en contextos profesionales (si surge la oportunidad)

### Technical Success

**Criterios Bloqueantes (Go/No-Go):**

- ✅ Paridad funcional 100% con app comercial
- ✅ Bugs críticos: 0 (show-stoppers)
- ✅ Tests de features críticas: 100% (cuentas, transacciones, transferencias)
- ✅ TypeScript strict compliance: 100%

**Performance Targets:**

- Carga inicial <2 segundos (desktop/mobile)
- Respuesta API <500ms (operaciones CRUD)
- Responsive mobile: 100% funcionalidad

**Calidad de Código:**

- Coverage testing frontend >60%
- Coverage testing backend >60%
- Linting errors: 0 (ESLint + .NET Analyzer)
- Arquitectura Clean + CQRS validada y documentada

**Deployment:**

- Aplicación desplegada y accesible
- CI/CD pipeline funcional (build/test/deploy automatizado)
- Base de datos SQLite funcionando en producción

### Measurable Outcomes

**MVP Progress:** 12% completado (1 de 8 módulos core implementados)

**Adopción:** 2 semanas uso exclusivo sin bugs críticos + app comercial desinstalada

**Consolidación:** Repositorio público + aplicación desplegada + evaluación académica (timing a definir)

## Product Scope

### Development Strategy

**MVP Approach:** Feature Parity MVP - paridad funcional 100% con app comercial existente.

**Development Model:** Secuencial modular - cada sub-fase completa al 100% antes de continuar.

**Resource Model:** Solo developer (Chino) + GitHub Copilot

**Current Progress:** 12% completado (1 de 8 sub-fases)

### MVP - Phase 1: Core Financial Management

**Objetivo:** Paridad funcional completa → desinstalar app comercial definitivamente.

**Módulos Core (Orden Implementación):**

1. **✅ Gestión de Cuentas** (100% completado)
   - CRUD completo, múltiples monedas, soft delete, balance automático

2. **📋 Gestión de Categorías**
   - CRUD completo, tipo ingreso/gasto, color/ícono personalizado

3. **📋 Gestión de Transacciones**
   - CRUD completo, filtros avanzados, búsqueda en tiempo real, tags, calculadora integrada

4. **📋 Gestión de Transferencias**
   - CRUD completo, validación de saldos, actualización automática de balances

5. **📋 Próximos Pagos/Ingresos**
   - CRUD completo, recurrencias, marcar como pagado, generación automática

6. **📋 Dashboard con Datos Reales**
   - Tarjetas financieras (balance, ingresos, gastos, savings), transacciones recientes, próximos eventos

7. **📋 Visualización de Datos (Gráficos)**
   - Gastos por categoría (torta/donut), evolución temporal (líneas/barras)

8. **📋 Pulido UX y Testing**
   - Loading states, estados vacíos, validaciones globales, responsive completo, testing integración

**Explícitamente Fuera del MVP:**

- Autenticación/multi-usuario
- Exportación reportes (PDF, Excel)
- Presupuestos y metas
- Notificaciones
- Modo offline completo
- Importación masiva de datos

### Phase 2: Growth Features (Post-MVP)

**Trigger:** MVP consolidado + 2 semanas uso estable sin bugs críticos.

**Mejoras de Usabilidad:**

- Sistema tema oscuro/claro (actualmente dark por defecto)
- Mejoras en RecentTransactions (paginación, filtros, ordenamiento)
- Calculadora integrada avanzada en formularios de transacciones
- Atajos de teclado personalizados (Ctrl+N, Ctrl+K)

**Optimización Técnica:**

- Performance avanzada (lazy loading, code splitting, bundle optimization)
- Accesibilidad completa (WCAG AA, screen readers)
- PWA completo con modo offline robusto
- Service Workers para caching

**Data Management:**

- Exportación de reportes (PDF, Excel)
- Importación masiva de datos (CSV, OFX)
- Migración de datos históricos desde Excel

### Phase 3: Vision - Innovation & Advanced Features

**Nota:** PRDs dedicados post-MVP consolidado.

**Innovación con IA:**

- 🤖 OCR inteligente de tickets de supermercado con categorización automática
- 📊 Análisis predictivo: proyecciones de flujo de efectivo 3-6 meses
- 💡 Asesoramiento financiero personalizado con IA (patrones históricos)
- 🔍 Comparaciones inteligentes de precios entre supermercados

**Integraciones Avanzadas:**

- 🏦 Conexión bancaria segura (Open Banking APIs)
- 💳 Gestión avanzada de cuotas de tarjetas de crédito

**Escalabilidad (Opcional):**

- 👥 Multi-usuario con autenticación JWT
- 🌐 Modelo SaaS (si se valida demanda real)
- 💰 Presupuestos y metas financieras
- 🔔 Sistema de notificaciones

## User Journeys

### Usuario Principal: Chino (Desarrollador-Usuario Único)

**Contexto:** Desarrollador con hábito establecido de registro financiero buscando reemplazar app comercial con anuncios por herramienta propia con control total.

**Journey Phases:**

1. **Decisión:** Validar paridad funcional 100% con app comercial (cuentas, categorías, transacciones, transferencias, gráficos)
2. **Migración:** Importar datos históricos desde Excel, validar integridad
3. **Validación:** Uso paralelo 1-2 semanas (verificar registro rápido, transferencias, reportes, sin bugs críticos)
4. **Adopción:** Primera semana exclusiva usando SmartPocket → desinstalar app comercial
5. **Uso Rutinario:** Desktop (registro diario transacciones), Mobile (gastos on-the-go), Revisión periódica gráficos (bimestral/mensual)

**Patrones de Uso:**

- Días laborales: 2-4 transacciones (cafetería, almuerzo, transporte)
- Días de pago (10-15): 10-15 transacciones (servicios, pagos recurrentes)
- Transferencias: 1-2/mes (ahorro)
- Análisis gráficos: Bimestral/mensual

**Evolución Post-MVP:** Con MVP estable, apertura a features experimentales (OCR, análisis predictivo con IA, conexión bancaria propia).

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

### Architecture & Communication

**Frontend Architecture:**

- React 19 SPA (client-side rendering)
- TypeScript strict mode
- Component-based modular design

**Backend Architecture:**

- .NET 9 Web API
- Clean Architecture + CQRS pattern
- SQLite database with EF Core
- FluentValidation for input validation

**Communication Protocol:**

- RESTful API endpoints
- JSON data exchange
- API response time target: <500ms
- Error handling with structured error responses

## Domain Considerations (Fintech)

**MVP Scope - Personal Use:** SmartPocket MVP (Fase 1) no requiere cumplimiento regulatorio fintech completo dado su alcance: uso personal, usuario único, sin procesamiento de pagos, sin transacciones de terceros, y solo registro de transacciones históricas.

**Phase 3 Triggers:** Si el producto evoluciona hacia multi-usuario, integración bancaria (Open Banking), procesamiento de pagos, o distribución comercial/SaaS, entonces se activarán requisitos completos de compliance fintech:

- **Compliance Matrix:** SOC2, PCI-DSS (si procesamiento de pagos), GDPR/CCPA (datos personales multi-usuario)
- **Security Architecture:** Flujos de autenticación/autorización robustos, estándares de encriptación, threat modeling
- **Audit Requirements:** Logging de auditoría, compliance reporting, audit trails para transacciones financieras
- **Fraud Prevention:** Detección de actividad sospechosa, medidas preventivas, monitoreo de patrones

**Fundación Actual:** Los NFRs de seguridad existentes (NFR9-NFR13: protección de datos, almacenamiento seguro, HTTPS, sanitización, prevención SQL injection) establecen base técnica sólida. Phase 3 requerirá PRD dedicado con secciones fintech completas antes de implementar features reguladas.

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
