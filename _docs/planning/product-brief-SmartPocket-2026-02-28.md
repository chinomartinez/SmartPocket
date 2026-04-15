---
inputDocuments:
  - "_docs/roadmap.md"
  - "_docs/mvp-requirements.md"
date: 2026-02-28
author: Chino
---

# Product Brief: SmartPocket

<!-- Content will be appended sequentially through collaborative workflow steps -->

## Executive Summary

SmartPocket es una aplicación web full-stack de gestión financiera personal que reemplaza aplicaciones comerciales limitadas (anuncios, paywalls, falta de privacidad) con una solución propia bajo control total del usuario. Como proyecto de portfolio profesional, demuestra arquitectura moderna (.NET 9 + React 19 con Clean Architecture + CQRS) y desarrollo acelerado con IA.

El MVP entrega paridad funcional completa con apps comerciales actuales: gestión de cuentas/categorías, registro de transacciones con búsqueda avanzada, transferencias, recordatorios de pagos, dashboard con métricas en tiempo real, y visualizaciones gráficas. Sin anuncios, acceso desktop + mobile, y fundación sólida para features innovadoras futuras (OCR, análisis predictivo con IA, conexión bancaria segura).

---

## Contenido

- [Core Vision](#core-vision)
- [Target Users](#target-users)
- [Success Criteria](#success-criteria)
- [MVP Scope](#mvp-scope)
- [Future Vision](#future-vision)

---

## Core Vision

### El Problema

Los usuarios técnicos con hábitos establecidos de control financiero enfrentan un dilema crítico con las aplicaciones comerciales actuales:

#### El Problema Central

Apps gratuitas con anuncios intrusivos y funcionalidades bloqueadas tras paywall (reportes, múltiples cuentas, exportación). Versiones premium requieren pago recurrente por features que un desarrollador podría implementar personalmente. Sin transparencia sobre manejo de datos sensibles ni flexibilidad para personalización.

#### Impacto del Problema

- **Financiero**: Pérdida de visibilidad sobre flujo de dinero, control de hábitos y capacidad de planificación
- **Profesional**: Ausencia de proyecto de portfolio robusto que demuestre arquitectura moderna y buenas prácticas reduce oportunidades laborales en mercado competitivo
- **Técnico**: Limitaciones impuestas por vendor, datos confiados a terceros sin control, imposibilidad de auditar código o integrar servicios propios

#### Por Qué Soluciones Actuales No Funcionan

Apps como Wallet o Gestor de Gastos ofrecen funcionalidades core adecuadas pero carecen de: capacidad de personalización/extensión, APIs para integración, funcionalidades innovadoras (OCR, análisis predictivo con IA), control sobre privacidad y datos, y potencial como activo profesional de portfolio.

### Proposed Solution

SmartPocket es una aplicación web full-stack de gestión financiera personal que combina:

**MVP Funcional (Fase Inmediata):**

- Gestión completa de cuentas bancarias (múltiples cuentas, múltiples monedas)
- Sistema flexible de categorías para ingresos y gastos
- Registro de transacciones con búsqueda y filtros avanzados
- Transferencias entre cuentas propias
- Próximos pagos y recordatorios
- Dashboard con métricas financieras en tiempo real
- Visualizaciones gráficas (gastos por categoría, evolución temporal)

**Fundación Técnica (Portfolio):**

- Stack moderno: React 19 + TypeScript strict + .NET 9
- Clean Architecture + CQRS (sin MediatR)
- Feature-first organization (vertical slices)
- TanStack Query para gestión de estado server-side
- Testing automatizado (Vitest + xUnit)
- Integración con IA para desarrollo acelerado (GitHub Copilot)

**Visión Futura (Post-MVP):**

- OCR inteligente para lectura automática de tickets de supermercado
- Conexión segura con banco personal (control total de credenciales)
- Análisis predictivo: "visión del futuro financiero"
- Comparaciones inteligentes (precios entre supermercados, patrones de gasto)
- Gestión avanzada de cuotas de tarjetas de crédito
- Integración con modelos de IA para asesoramiento financiero personalizado

### Key Differentiators

**1. Control Total y Privacidad**

- Código propio: auditable, sin black boxes
- Datos bajo control absoluto (hosting propio)
- Base sólida para funcionalidades sensibles (conexión bancaria) con confianza total

**2. Flexibilidad Técnica Ilimitada**

- Platform propia: cualquier feature es implementable
- Sin limitaciones de vendor o paywalls
- Arquitectura extensible diseñada para evolución
- Artesanía de software personal

**3. Proyecto de Portfolio Profesional**

- Demostración tangible de habilidades .NET avanzadas
- Arquitectura limpia y patrones modernos (CQRS, vertical slices)
- Evidencia de capacidad de uso de IA en desarrollo profesional
- Proyecto completo end-to-end (no solo frontend o backend aislado)

**4. Fundación para Innovación**

- Stack moderno preparado para IA (OCR, predicciones, análisis)
- Arquitectura escalable desde MVP hasta features complejas
- Modelo de desarrollo iterativo: valor inmediato con visión de largo plazo

**5. Pragmatismo sobre Perfección**

- Filosofía KISS: simplicidad que funciona sobre sobre-ingeniería
- Decisiones técnicas basadas en necesidad real, no en hype
- Desarrollo acelerado con herramientas de IA manteniendo calidad

---

## Target Users

### Primary User

**Usuario Único (MVP): Chino - Desarrollador con Control Financiero Establecido**

**Perfil:**

- Desarrollador profesional reemplazando app comercial por solución propia
- Maneja 2 cuentas bancarias con múltiples métodos de pago
- Necesita acceso desktop (trabajo) + mobile (fuera de casa)

### User Journey

- **Adopción**: Validar que MVP tiene paridad funcional completa con app actual
- **Migración**: Importar datos históricos desde Excel, validar integridad
- **Validación**: Uso paralelo (1-2 semanas) confirmando confiabilidad sin bugs críticos
- **Uso Exclusivo**: Desinstalar app comercial, SmartPocket es la única herramienta financiera
- **Steady State**: Registro diario desktop/mobile según contexto + revisión bimestral de gráficos

**Patrones de Uso:**

- Días laborales: 2-4 transacciones (cafetería, almuerzo, transporte)
- Días de pago (10-15): 10-15 transacciones (servicios, pagos recurrentes)
- Transferencias: 1-2/mes (ahorro)
- Análisis gráficos: Bimestral/mensual

**Evolución Post-MVP:** Con MVP estable, apertura a features experimentales (OCR, análisis predictivo con IA, conexión bancaria propia).

**Quote del Usuario:**

> "No necesito la app más innovadora del mundo para el MVP, necesito una que haga exactamente lo que ya hago hoy, pero sin anuncios, desde cualquier dispositivo, y con mis datos bajo mi control."

---

## Success Criteria

### Criterio de Adopción del MVP

**Criterio de Adopción del Usuario:**

> "Cuando el MVP tenga paridad funcional completa, SmartPocket reemplaza inmediatamente a la app comercial. No hay grises: o funciona todo o no se adopta."

**Paridad Funcional Completa (Bloqueante):**

- ✅ Gestión de Cuentas, Categorías, Transacciones, Transferencias
- ✅ Reportes/Gráficos: gastos por categoría, comparación ingresos vs gastos, análisis por período
- ✅ Migración de datos sin pérdida de información
- ✅ Responsive desktop + mobile, sin anuncios

### Objetivos de Portfolio

SmartPocket es un activo profesional que demuestra capacidades técnicas actuales para oportunidades laborales:

1. **Arquitectura Moderna**: Clean Architecture + CQRS (sin MediatR), vertical slices, Result pattern
2. **Full-Stack End-to-End**: .NET 9 + React 19, TypeScript strict, TanStack Query, testing >60%
3. **Uso Efectivo de IA**: Desarrollo acelerado con GitHub Copilot manteniendo estándares profesionales
4. **Producto Desplegado**: App en producción con CI/CD, documentación técnica profesional

### Objetivo Académico

**Proyecto Final Analista de Sistemas (En Evaluación):**

- Potencial presentación como proyecto final para carrera de Analista de Sistemas
- Documentación técnica completa preparada (arquitectura, casos de uso, especificaciones)
- Decisión a tomar en coordinación con profesores cuando corresponda
- **No bloqueante para MVP** — evaluación posterior a consolidación funcional

### KPIs Críticos

**KPIs Bloqueantes (Go/No-Go):**

| Métrica                      | Target             | Medición               |
| ---------------------------- | ------------------ | ---------------------- |
| Paridad funcional completa   | 100% features core | Checklist manual       |
| Migración de datos exitosa   | 0 pérdida de datos | Validación post-import |
| Bugs críticos en producción  | 0 (show-stoppers)  | Issue tracking         |
| Tests de features críticas   | 100% cobertura     | Test suites            |
| TypeScript strict compliance | 100%               | tsc --noEmit           |
| Responsive mobile            | 100% funcionalidad | Testing manual         |

**KPIs de Monitoreo (Salud Post-Lanzamiento):**

| Métrica                   | Target                  | Período            |
| ------------------------- | ----------------------- | ------------------ |
| Uso exclusivo consecutivo | >14 días sin regresión  | Primera validación |
| Cobertura de tests        | >60% frontend + backend | Continuo           |
| Performance carga inicial | <2 segundos             | Continuo           |
| Performance API           | <500ms respuesta        | Continuo           |
| Disponibilidad            | >95% uptime             | Mensual            |
| Transacciones registradas | >100 acumuladas         | Primer mes         |

### Definición de Éxito

**MVP Completo (Éxito Técnico):**  
✅ Features core implementadas y testeadas + migración exitosa + performance dentro de targets + deploy funcional

**Adopción Personal (Éxito de Producto):**  
✅ 2 semanas de uso exclusivo sin bugs críticos + app comercial desinstalada + operación rutinaria estable

**Portfolio Validado (Éxito Profesional):**  
✅ Repositorio público con documentación profesional + arquitectura limpia + proyecto demostrable en entrevistas + evidencia de uso efectivo de IA

---

## MVP Scope

### Core Features

**Leyenda:** ✅ Completado | 🔵 Pendiente

| Feature                      | Status        | Descripción                                                                                           |
| ---------------------------- | ------------- | ----------------------------------------------------------------------------------------------------- |
| **Gestión de Cuentas**       | ✅ Completado | CRUD completo, múltiples monedas, íconos personalizados, balance automático                           |
| **Gestión de Categorías**    | ✅ Completado | CRUD completo para ingresos/gastos, color e ícono personalizado                                       |
| **Gestión de Transacciones** | 🔵 Pendiente  | CRUD con tags editables, calculadora integrada, búsqueda avanzada, filtros múltiples                  |
| **Transferencias**           | 🔵 Pendiente  | CRUD entre cuentas propias, validación de saldo, actualización automática de balances                 |
| **Próximos Pagos**           | 🔵 Pendiente  | CRUD con recurrencia (mensual/semanal/anual), marcar como pagado, indicadores visuales                |
| **Dashboard**                | 🔵 Pendiente  | Métricas en tiempo real (balance, ingresos, gastos, savings), transacciones recientes, próximos pagos |
| **Reportes/Gráficos**        | 🔵 Pendiente  | Gastos por categoría (torta), evolución temporal (líneas/barras), selector de período                 |
| **UX/Pulido**                | 🔵 Pendiente  | Loading states, estados vacíos, error handling, validación consistente, responsive completo           |

---

## Future Vision

**Innovación con IA:**

- 🤖 OCR inteligente de tickets de supermercado con categorización automática
- 📊 Análisis predictivo: proyecciones de flujo de efectivo 3-6 meses
- 💡 Asesoramiento financiero personalizado con IA (patrones históricos)
- 🔍 Comparaciones inteligentes de precios entre supermercados

**Integraciones Avanzadas:**

- 🏦 Conexión bancaria segura (Open Banking APIs)
- 💳 Gestión avanzada de cuotas de tarjetas de crédito

**Optimizaciones Futuras**:

- Tema oscuro/claro, modo offline PWA, gestión avanzada de cuotas

**Escalabilidad (Opcional):**

- 👥 Multi-usuario con autenticación JWT
- 🌐 Modelo SaaS (si se valida demanda real)
- 💰 Presupuestos y metas financieras
- 🔔 Sistema de notificaciones

**Diferenciación a largo plazo**: Control total de datos (hosting propio), IA personalizada adaptada al usuario, innovación rápida sin vendor lock-in, portfolio evolutivo que demuestra capacidades técnicas actuales.

Si el producto evoluciona hacia las siguientes capacidades, se activarán **requisitos completos de compliance fintech**:

**Compliance Requirements (Phase 3):**

- **Regulatory**: GDPR/CCPA (datos personales), PCI-DSS (si procesamiento de pagos), SOC2 (multi-usuario)
- **Security Architecture**: Autenticación/autorización robusta, encriptación end-to-end, threat modeling
- **Audit & Fraud Prevention**: Logging de auditoría, audit trails, detección de actividad sospechosa

**Fundación Actual:**

Los Non-Functional Requirements de seguridad actuales (protección de datos, HTTPS, sanitización de inputs, prevención SQL injection) establecen base técnica sólida para evolución futura. Phase 3 requerirá documentación técnica dedicada antes de implementar features reguladas.

---
