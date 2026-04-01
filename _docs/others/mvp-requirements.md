# SmartPocket MVP - Requerimientos Funcionales

Este documento define los requerimientos funcionales para el MVP (Minimum Viable Product) de SmartPocket.

---

## Objetivo del MVP

Desarrollar una aplicación web funcional de gestión financiera personal que permita a los usuarios:

- Administrar sus cuentas bancarias
- Categorizar y registrar transacciones (ingresos/gastos)
- Realizar transferencias entre cuentas
- Programar y visualizar próximos pagos/ingresos
- Visualizar resúmenes financieros y gráficos estadísticos

---

## Módulos Funcionales

> **⚠️ IMPORTANTE**: Los campos de entidad listados en cada módulo son **preliminares y aproximados**. Antes de comenzar la implementación del CRUD de cualquier entidad, se debe validar y definir con precisión los campos reales consultando el backend o la especificación técnica actualizada.

### A. Gestión de Cuentas

**Estado Backend**: ✅ CRUD implementado

**Descripción**: Permite crear y administrar las diferentes cuentas del usuario.

**Entidad - Campos Reales** (validado con backend):

- `id`: int (identificador único)
- `name`: string (nombre de la cuenta, ej: "Cuenta Corriente Banco X")
- `icon`: Icon (value object)
  - `code`: string (identificador del ícono Heroicons)
  - `colorHex`: string (color en formato hex, ej: "#1e40af")
- `currency`: Currency (entidad relacionada)
  - `id`: int (currencyId - foreign key)
  - `code`: string (ej: "USD", "EUR")
  - `symbol`: string (ej: "$", "€")
  - `name`: string (ej: "Dólar estadounidense")
- `balance`: decimal (saldo actual)
- `transactions`: IEnumerable<Transaction> (relación con transacciones)
- `createdAt`: DateTime (fecha de creación - auditoría)
- `lastModifiedAt`: DateTime? (fecha de última modificación - auditoría)
- `isDeleted`: bool (soft delete - auditoría)

**DTOs para Mutations**:

- **AccountCreateCommand** (o AccountCreateDTO): `name`, `icon` (code + colorHex), `currencyId`, `balance` (inicial)
- **AccountUpdateCommand** (o AccountUpdateDTO): `id`, `name`, `icon` (code + colorHex), `balance`
- **Nota**: Los campos de auditoría (`createdAt`, `lastModifiedAt`, `isDeleted`) son manejados automáticamente por la API

**Requerimientos**:

1. **REQ-ACC-001**: Crear cuenta

   - Formulario con validación de campos requeridos (name, icon, currency, balance inicial)
   - Selector de ícono (Heroicons) con color picker
   - Selector de moneda (dropdown con currencies disponibles)
   - Campo de balance inicial (decimal, formato de moneda)
   - Validación: name requerido, balance >= 0
   - Toast de confirmación

2. **REQ-ACC-002**: Listar cuentas

   - Vista de cards con información resumida
   - Mostrar: icono con color, nombre, balance formateado con símbolo de moneda
   - Ordenar por fecha de creación (descendente)
   - Filtrar cuentas eliminadas (isDeleted = false)
   - Skeleton loaders durante carga

3. **REQ-ACC-003**: Editar cuenta

   - Formulario pre-cargado con datos actuales
   - Permitir editar: name, icon (code + color), balance
   - NO permitir cambiar currency (decisión de negocio)
   - Validación de cambios
   - Toast de confirmación

4. **REQ-ACC-004**: Eliminar cuenta

   - Modal de confirmación antes de eliminar
   - Validar que no tenga transacciones asociadas (backend)
   - Soft delete (isDeleted = true)
   - Toast de confirmación
   - Actualizar lista (refetch/invalidate query)

5. **REQ-ACC-005**: Ver detalle de cuenta
   - Modal o página con información completa
   - Mostrar: icono, nombre, moneda completa (code, symbol, name), balance
   - Lista de transacciones recientes (últimas 10)
   - Gráfico de evolución de saldo (opcional para MVP)
   - Link a transacciones filtradas por cuenta
   - Gráfico de evolución de saldo

---

### B. Gestión de Categorías

**Estado Backend**: ✅ CRUD implementado

**Descripción**: Permite organizar ingresos y gastos en categorías personalizadas.

**Entidad - Campos Principales** (preliminar - validar antes de implementar):

- `id`: Identificador único
- `name`: Nombre de la categoría (ej: "Alimentación", "Salario")
- `type`: Tipo (income, expense)
- `color`: Color hexadecimal para UI
- `icon`: Identificador de ícono (Heroicons)
- `description`: Descripción opcional
- `isActive`: Estado activo/inactivo
- `createdAt`: Fecha de creación

**Requerimientos**:

1. **REQ-CAT-001**: Crear categoría

   - Formulario con validación
   - Selección de tipo (ingreso/gasto)
   - Selector de color
   - Selector de ícono visual

2. **REQ-CAT-002**: Listar categorías

   - Vista separada por tipo (ingresos/gastos)
   - Cards con color e ícono
   - Indicador de cantidad de transacciones

3. **REQ-CAT-003**: Editar categoría

   - Formulario pre-cargado
   - Actualización de color/ícono
   - Validación de nombre único

4. **REQ-CAT-004**: Eliminar categoría

   - Confirmación antes de eliminar
   - Validar que no tenga transacciones asociadas
   - Soft delete

5. **REQ-CAT-005**: Categorías por defecto
   - Conjunto inicial de categorías predefinidas
   - Se crean automáticamente para nuevos usuarios

---

### C. Gestión de Transacciones

**Estado Backend**: ❌ Pendiente de implementación

**Descripción**: Registro y administración de ingresos y gastos del usuario.

**Entidad - Campos Principales** (preliminar - validar antes de implementar):

- `id`: Identificador único
- `accountId`: Cuenta asociada
- `categoryId`: Categoría asociada
- `type`: Tipo (income, expense)
- `amount`: Monto
- `description`: Descripción de la transacción
- `tags`: Array de etiquetas (ej: ["urgente", "recurrente"])
- `date`: Fecha de la transacción
- `createdAt`: Fecha de registro
- `updatedAt`: Fecha de última modificación

**Requerimientos**:

1. **REQ-TXN-001**: Registrar transacción

   - Formulario con validación
   - Selección de cuenta
   - Selección de categoría (filtrada por tipo)
   - Campo de monto con formato de moneda
   - Selector de fecha
   - Tags opcionales

2. **REQ-TXN-002**: Listar transacciones

   - Vista tabla/lista con paginación
   - Mostrar: fecha, descripción, categoría, cuenta, monto
   - Indicador visual de tipo (ingreso/gasto)
   - Paginación (20 items por página)

3. **REQ-TXN-003**: Filtrar transacciones

   - Por rango de fechas (desde/hasta)
   - Por categoría (dropdown multi-select)
   - Por cuenta (dropdown multi-select)
   - Por tipo (ingreso/gasto/todos)
   - Combinación de filtros

4. **REQ-TXN-004**: Buscar transacciones

   - Campo de búsqueda de texto
   - Buscar en descripción y tags
   - Búsqueda en tiempo real (debounced)

5. **REQ-TXN-005**: Editar transacción

   - Formulario pre-cargado
   - Validación de cambios
   - Actualización de saldo de cuenta

6. **REQ-TXN-006**: Eliminar transacción

   - Confirmación antes de eliminar
   - Actualización de saldo de cuenta
   - Registro en historial

7. **REQ-TXN-007**: Ver detalle de transacción
   - Modal/página con información completa
   - Mostrar cuenta y categoría con estilos
   - Tags visuales

---

### D. Gestión de Transferencias

**Estado Backend**: ❌ Pendiente de implementación

**Descripción**: Registro de transferencias de dinero entre cuentas propias del usuario.

**Entidad - Campos Principales** (preliminar - validar antes de implementar):

- `id`: Identificador único
- `fromAccountId`: Cuenta de origen
- `toAccountId`: Cuenta de destino
- `amount`: Monto transferido
- `description`: Descripción/concepto
- `date`: Fecha de la transferencia
- `createdAt`: Fecha de registro

**Requerimientos**:

1. **REQ-TRF-001**: Registrar transferencia

   - Formulario con validación
   - Selección de cuenta origen
   - Selección de cuenta destino (excluir origen)
   - Validar saldo suficiente en origen
   - Descripción opcional
   - Selector de fecha

2. **REQ-TRF-002**: Listar transferencias

   - Vista tabla con paginación
   - Mostrar: fecha, origen, destino, monto, descripción
   - Indicador visual de dirección
   - Ordenar por fecha (descendente)

3. **REQ-TRF-003**: Filtrar transferencias

   - Por rango de fechas
   - Por cuenta (origen o destino)
   - Combinación de filtros

4. **REQ-TRF-004**: Ver detalle de transferencia

   - Modal con información completa
   - Mostrar cuentas con estilos
   - Saldos antes/después

5. **REQ-TRF-005**: Eliminar transferencia
   - Confirmación antes de eliminar
   - Reversión de saldos en ambas cuentas
   - Registro en historial

**Nota**: Las transferencias NO son editables una vez creadas (solo se pueden eliminar).

---

### E. Gestión de Próximos Pagos/Ingresos

**Estado Backend**: ❌ Pendiente de implementación

**Descripción**: Programación y seguimiento de pagos e ingresos futuros recurrentes o únicos.

**Entidad - Campos Principales** (preliminar - validar antes de implementar):

- `id`: Identificador único
- `accountId`: Cuenta asociada
- `categoryId`: Categoría asociada
- `type`: Tipo (income, expense)
- `amount`: Monto
- `description`: Descripción
- `dueDate`: Fecha de vencimiento
- `isRecurrent`: Si es recurrente
- `recurrenceType`: Tipo de recurrencia (monthly, weekly, yearly, null)
- `isPaid`: Estado de pago
- `createdAt`: Fecha de creación

**Requerimientos**:

1. **REQ-UPC-001**: Crear próximo pago/ingreso

   - Formulario con validación
   - Selección de cuenta y categoría
   - Fecha de vencimiento
   - Checkbox para recurrencia
   - Selector de tipo de recurrencia (si aplica)

2. **REQ-UPC-002**: Listar próximos pagos/ingresos

   - Vista cards ordenados por fecha
   - Mostrar: fecha, descripción, monto, categoría
   - Indicador de recurrencia
   - Filtrar por pendientes/pagados

3. **REQ-UPC-003**: Marcar como pagado

   - Botón de acción rápida
   - Opción de crear transacción automáticamente
   - Si es recurrente, generar próxima instancia

4. **REQ-UPC-004**: Editar próximo pago/ingreso

   - Formulario pre-cargado
   - Validación de cambios
   - Actualizar próximas instancias (si es recurrente)

5. **REQ-UPC-005**: Eliminar próximo pago/ingreso

   - Confirmación antes de eliminar
   - Si es recurrente, opción de eliminar solo esta instancia o todas

6. **REQ-UPC-006**: Visualización en Dashboard
   - Mostrar próximos 5 pagos/ingresos
   - Ordenados por fecha de vencimiento
   - Indicador de días restantes

---

### F. Dashboard - Integración con API Real

**Estado Backend**: ✅ Parcial (depende de otros módulos)

**Descripción**: Pantalla principal con resumen financiero actualizado en tiempo real.

**Requerimientos**:

1. **REQ-DASH-001**: Tarjetas financieras con datos reales

   - Reemplazar `financialCardsMockData` por API calls
   - Total Balance (suma de todas las cuentas activas)
   - Total Income (suma de ingresos del mes actual)
   - Total Expenses (suma de gastos del mes actual)
   - Savings (ingresos - gastos)

2. **REQ-DASH-002**: Transacciones recientes

   - Reemplazar `recentTransactionsMockData` por API
   - Mostrar últimas 5 transacciones
   - Link a vista completa de transacciones
   - Actualización automática

3. **REQ-DASH-003**: Próximos pagos/ingresos

   - Reemplazar `upcomingPaymentsMockData` por API
   - Mostrar próximos 5 eventos
   - Ordenados por fecha de vencimiento
   - Link a vista completa

4. **REQ-DASH-004**: Indicadores visuales

   - Progress bars para metas (opcional MVP)
   - Badges de alertas (vencimientos cercanos)
   - Colores según tipo (ingreso/gasto)

5. **REQ-DASH-005**: Actualización en tiempo real
   - Usar TanStack Query para auto-refresh
   - Invalidar cache al crear/editar transacciones
   - Skeleton loaders durante carga

---

### G. Visualización de Datos (Gráficos)

**Estado Backend**: ❌ Pendiente (endpoints de estadísticas)

**Descripción**: Gráficos estadísticos para análisis financiero.

**Requerimientos**:

1. **REQ-VIZ-001**: Gráfico de gastos por categoría

   - Gráfico de torta/donut
   - Mostrar % y monto por categoría
   - Período seleccionable (mes actual, últimos 3/6/12 meses)
   - Colores de categorías consistentes
   - Interactivo (click para ver detalle)

2. **REQ-VIZ-002**: Gráfico de evolución temporal

   - Gráfico de líneas o barras
   - Ingresos vs Gastos por mes
   - Últimos 6-12 meses
   - Tooltips con valores exactos
   - Línea de tendencia (opcional)

3. **REQ-VIZ-003**: Ubicación en Dashboard

   - Sección dedicada en Dashboard
   - Grid responsive (lado a lado en desktop)
   - Lazy loading de gráficos

4. **REQ-VIZ-004**: Biblioteca de gráficos
   - Evaluar: Recharts, Chart.js, o Tremor
   - Integración con shadcn/ui
   - Modo oscuro compatible

---

## Dependencias entre Módulos

**Secuencia de Implementación Sugerida**:

1. **Cuentas** → Base fundamental (todo depende de cuentas)
2. **Categorías** → Requerido para transacciones
3. **Transacciones** → Core del sistema
4. **Transferencias** → Depende de cuentas
5. **Próximos Pagos** → Depende de cuentas y categorías
6. **Dashboard Real** → Integra todos los módulos
7. **Gráficos** → Requiere datos de transacciones

---

## Consideraciones Técnicas

### Estado Global vs Local

- **Zustand Store**: Para usuario, cuentas activas, categorías (datos frecuentemente accedidos)
- **TanStack Query**: Para transacciones, transferencias (data fetching con cache)
- **Estado Local**: Para formularios y UI temporal

### Validaciones

- Validación client-side con zod o yup
- Validación server-side en API .NET
- Mensajes de error claros y específicos

### UX/UI

- Formularios con estados de loading
- Toasts para confirmaciones/errores
- Modals para confirmaciones destructivas
- Skeleton loaders durante carga de datos
- ErrorBoundary para errores críticos

### Testing

- Tests unitarios para utils y services
- Tests de integración para flujos críticos
- Coverage mínimo: 60% para MVP

---

## Fuera del Alcance del MVP

Las siguientes funcionalidades quedan para Fase 4 o versiones futuras:

> **📝 NOTA**: Esta lista será priorizada posteriormente para definir orden de implementación. Algunas funcionalidades podrían adelantarse a Fase 3 si el tiempo lo permite.

- Autenticación y multi-usuario
- Exportación de reportes (PDF, Excel)
- Presupuestos y metas financieras
- Notificaciones push/email
- Recordatorios automáticos
- Modo offline
- Importación de transacciones (CSV, OFX)
- Integración con bancos (Open Banking)
- Multi-moneda con conversión automática
- Calculadora de inversiones
- **Calculadora integrada en formularios**: Mini calculadora dentro del formulario de creación/edición de transacciones para sumar gastos compuestos (ej: varias compras) sin salir de la aplicación
