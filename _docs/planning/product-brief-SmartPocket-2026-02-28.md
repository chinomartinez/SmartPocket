---
stepsCompleted: [1, 2, 3, 4, 5]
inputDocuments:
  - "_docs/project-context.md"
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

SmartPocket no compite con otras finance apps de GitHub porque no es un proyecto académico o de estudio: es una herramienta real para uso diario que simultáneamente sirve como demostración profesional de capacidades técnicas actuales.

---

## Target Users

### Primary User

**Usuario Único (MVP): Chino - Desarrollador con Control Financiero Establecido**

**Perfil:**

- Desarrollador profesional reemplazando app comercial por solución propia
- Maneja 2 cuentas bancarias con múltiples métodos de pago
- Necesita acceso desktop (trabajo) + mobile (fuera de casa)

**Problema Actual:**

- App con anuncios intrusivos y esperas forzadas
- Sin versión desktop, funcionalidades bloqueadas tras paywall
- Cero control sobre datos y personalización

**Criterio de Adopción:**

- Paridad funcional completa: cuentas, categorías, transacciones, transferencias, reportes/gráficos
- Migración exitosa de datos históricos desde Excel
- Sin anuncios, carga rápida, responsive desktop + mobile

### User Journey

- **Adopción**: Validar que MVP tiene paridad funcional completa con app actual
- **Migración**: Importar datos históricos desde Excel, validar integridad
- **Validación**: Uso paralelo (1-2 semanas) confirmando confiabilidad sin bugs críticos
- **Uso Exclusivo**: Desinstalar app comercial, SmartPocket es la única herramienta financiera
- **Steady State**: Registro diario desktop/mobile según contexto + revisión bimestral de gráficos

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

### Out of Scope for MVP

**Diferido para Post-MVP:**

- **Innovación con IA**: OCR de tickets, análisis predictivo, comparaciones inteligentes, asesoramiento financiero con IA
- **Integraciones Avanzadas**: Conexión bancaria (Open Banking), importación automática (CSV, OFX)
- **Features Empresariales**: Autenticación multi-usuario, presupuestos y metas, notificaciones push/email, exportación PDF/Excel
- **Optimizaciones Futuras**: Tema oscuro/claro, modo offline PWA, gestión avanzada de cuotas

### Core Features

**Leyenda:** ✅ Completado | 🔵 Pendiente

| Feature                      | Status        | Descripción                                                                                           |
| ---------------------------- | ------------- | ----------------------------------------------------------------------------------------------------- |
| **Gestión de Cuentas**       | ✅ Completado | CRUD completo, múltiples monedas, íconos personalizados, balance automático                           |
| **Gestión de Categorías**    | 🔵 Pendiente  | CRUD completo para ingresos/gastos, color e ícono personalizado                                       |
| **Gestión de Transacciones** | 🔵 Pendiente  | CRUD con tags editables, calculadora integrada, búsqueda avanzada, filtros múltiples                  |
| **Transferencias**           | 🔵 Pendiente  | CRUD entre cuentas propias, validación de saldo, actualización automática de balances                 |
| **Próximos Pagos**           | 🔵 Pendiente  | CRUD con recurrencia (mensual/semanal/anual), marcar como pagado, indicadores visuales                |
| **Dashboard**                | 🔵 Pendiente  | Métricas en tiempo real (balance, ingresos, gastos, savings), transacciones recientes, próximos pagos |
| **Reportes/Gráficos**        | 🔵 Pendiente  | Gastos por categoría (torta), evolución temporal (líneas/barras), selector de período                 |
| **UX/Pulido**                | 🔵 Pendiente  | Loading states, estados vacíos, error handling, validación consistente, responsive completo           |

**Detalles técnicos completos de implementación:** Ver [PRD](prd.md) para especificaciones técnicas detalladas

---

## Future Vision

- **Post-MVP (IA)**: OCR de tickets con categorización automática, análisis predictivo de flujo de efectivo 3-6 meses, asesoramiento financiero personalizado
- **Escalabilidad (Multi-Usuario)**: Autenticación segura, aislamiento de datos, modelo SaaS opcional si hay demanda validada
- **Integración (Bancaria)**: Conexión segura con Open Banking APIs, sincronización automática de transacciones, dashboard consolidado de patrimonio

**Diferenciación a largo plazo**: Control total de datos (hosting propio), IA personalizada adaptada al usuario, innovación rápida sin vendor lock-in, portfolio evolutivo que demuestra capacidades técnicas actuales.
