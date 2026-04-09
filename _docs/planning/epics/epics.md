---
inputDocuments:
  - "_docs/planning/prd.md"
progressNotes:
  - "Epic 1: Account Management - ✅ 100% implementado (Fase 3 completada)"
  - "Epic 2: Category Management - Story 2.6 (Reordenamiento) definida"
  - "Epic 3-9: Pendientes de crear historias en próxima sesión"
nextStep: "Continuar con Epic 3: Transaction Management (7 stories aprox) y resto de épicas"
---

# SmartPocket - Epic Breakdown

## Overview

Este documento proporciona el índice de épicas y mapeo de requerimientos funcionales para SmartPocket. La información técnica de implementación está disponible en:

- [architecture.md](../architecture.md) - Patrones técnicos, estructuras backend/frontend
- [ux-design-specification.md](../ux-design-specification.md) - Requisitos de UX y diseño visual
- [prd.md](../prd.md) - Especificación completa de producto

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

**NFR19:** La aplicación debe estar desplegada y accesible 24/7 en producción

**NFR20:** El sistema debe requerir conexión a internet activa (online-only en MVP)

**NFR21:** La aplicación debe ser completamente funcional en navegadores Chrome, Edge, y Brave (versiones modernas)

**NFR22:** La interfaz debe ser responsive y funcional en desktop (1920x1080, 1366x768), tablet (768-1024px), y mobile (375-428px)

**NFR23:** La UI debe ser touch-friendly en dispositivos móviles y tablets

**NFR24:** El usuario debe poder navegar completamente usando teclado (Tab, Shift+Tab, Enter, Escape)

**NFR25:** Los elementos interactivos deben tener focus visible

**NFR26:** Los formularios deben tener labels asociados a inputs correctamente

### FR Coverage Map

[**Epic 1: Account Management**](./epic001/epic-01-account-management.md) ✅ (Ya implementado 100%)

- FR1: Crear cuentas financieras con nombre, moneda, balance inicial
- FR2: Ver lista de cuentas activas con balances actuales
- FR3: Editar detalles de cuenta (nombre, moneda)
- FR4: Eliminar cuentas con soft delete
- FR5: Cálculo automático de balances desde transacciones/transferencias

[**Epic 2: Category Management**](./epic002/epic-02-category-management.md) ⏳ (En proceso)

- FR6: Crear categorías con tipo (ingreso/gasto)
- FR7: Asignar colores e íconos a categorías
- FR8: Editar detalles de categoría
- FR9: Eliminar categorías con soft delete y validación
- FR10: Ver lista de categorías organizadas por tipo
- FR10b: Reordenar categorías manualmente

[**Epic 3: Transaction Management**](./epic003/epic-03-transaction-management.md)

- FR11: Registrar transacciones con fecha, monto, cuenta, categoría, descripción
- FR12: Agregar tags opcionales a transacciones
- FR13: Editar detalles de transacción
- FR14: Eliminar transacciones con soft delete y recalculación de balances
- FR15: Filtrar transacciones por períodos, rango fecha, cuenta, categoría, tags
- FR16: Buscar transacciones en tiempo real
- FR17: Ver historial de transacciones ordenado por fecha
- FR17b: Usar mini calculadora integrada en modal de transacciones

[**Epic 4: Inter-Account Transfers**](./epic004/epic-04-inter-account-transfers.md)

- FR18: Crear transferencias entre cuentas
- FR19: Actualización automática de balances en ambas cuentas
- FR20: Validar balance suficiente en cuenta origen
- FR21: Editar transferencias con recalculación automática
- FR22: Eliminar transferencias con recalculación automática
- FR23: Ver historial de transferencias

[**Epic 5: Recurring Financial Events**](./epic005/epic-05-recurring-financial-events.md)

- FR24: Crear próximos pagos con recurrencia
- FR25: Crear próximos ingresos con recurrencia
- FR26: Marcar próximos pagos/ingresos como pagado
- FR27: Generación automática de entradas recurrentes
- FR28: Editar detalles de próximo pago/ingreso
- FR29: Eliminar entradas de próximos pagos/ingresos
- FR30: Ver lista de próximos eventos financieros

[**Epic 6: Financial Overview Dashboard**](./epic006/epic-06-financial-overview-dashboard.md)

- FR31: Ver tarjetas de resumen financiero consolidado
- FR32: Ver transacciones recientes de todas las cuentas
- FR33: Ver próximos pagos/ingresos en dashboard
- FR34: Filtrar datos de dashboard por rangos de fecha

[**Epic 7: Data Visualization & Analytics**](./epic007/epic-07-data-visualization-analytics.md)

- FR35: Ver desglose de gastos por categoría en gráfico torta/donut
- FR36: Ver evolución financiera temporal en gráficos líneas/barras
- FR37: Seleccionar rango de fecha para visualizaciones de gráficos

[**Epic 8: Data Import & Migration**](./epic008/epic-08-data-import-migration.md)

- FR38: Importar datos financieros históricos desde Excel
- FR39: Validar integridad de datos durante importación

[**Epic 9: System Quality & User Experience Polish**](./epic009/epic-09-system-quality-ux-polish.md)

- FR40: Manejar 1000-2000 transacciones sin degradación de performance
- FR41: Preservar datos financieros con soft delete
- FR42: Acceso desde navegadores desktop (Chrome, Edge, Brave)
- FR43: Acceso desde navegadores móviles con interfaz touch-optimized
- FR44: Acceso desde dispositivos tablet con layout responsive
- FR45: Cumplir browser support, responsive design, touch-friendly UI
- FR46: Conexión a internet activa requerida (online-only en MVP)
- NFR1-NFR26: Performance, seguridad, integridad, deployment, usabilidad, accesibilidad
