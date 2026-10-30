# SmartPocket - Plan de cierre de tarjetas de crédito y resúmenes

**Fecha:** 2026-10-29

## 1. Propósito

Cerrar el módulo de tarjetas de crédito y resúmenes con el alcance acordado. Este documento es la
fuente de verdad para el trabajo pendiente y reemplaza, a esos efectos, a:

- `_docs/planning/credit-card-ui-plan.md`
- `_docs/planning/credit-card-statements-plan.md`

Los dos planes anteriores **no se actualizan**. Al completar todas las fases de este documento se
eliminan, junto con este mismo plan, y el estado final queda registrado en
`_docs/planning/roadmap.md`.

El diseño de dominio del backend sigue siendo referencia y no se elimina:

- `backend/src/SmartPocket.Domain/CreditCards/smart-pocket-tarjeta-credito-diseno.md`

## 2. Decisiones cerradas

| Tema | Decisión |
|---|---|
| Acciones de tarjeta | Editar y eliminar **solo desde el overview** de la tarjeta seleccionada. |
| Menú por tarjeta | No se agrega. |
| Card "Agregar tarjeta" | No se agrega. El botón del encabezado es suficiente. |
| Resumen de uso en la card | No se agrega. |
| Eliminar tarjeta | Se permite siempre, con confirmación explícita. Si tiene compras, suscripciones, resúmenes o pagos, dejan de aparecer en SmartPocket. |
| Cascada al eliminar tarjeta | Se implementa en backend (FR53). Los pagos asociados también dejan de impactar en cuentas y dashboard. |
| Métricas del overview | Se mantienen las tres: `Pendiente registrado`, `Disponible estimado` y `Uso estimado del límite`. |
| Filtros de actividades | Se agrega **estado**. No se agregan periodo ni categoría. |
| Búsqueda de actividades | Se agrega debounce. |
| Cancelar suscripción | Se agrega confirmación con advertencia. La fecha de cancelación se registra automáticamente con el día actual; no se agrega selector de fecha. |
| Editar resumen | Pasa a ser un botón independiente, visible únicamente para resúmenes `Closed`. |
| Click en la card del resumen | Se elimina. La card deja de ser clickeable para editar. |
| Cargos manuales en resúmenes | Se descartan. Solo se usan cuotas y cargos sugeridos, con edición de montos. |
| Pagos: estado "Pendiente" | Se elimina. No se calcula `incluido - pagado` porque pueden ser monedas distintas. |
| Pagos: moneda del importe | El importe pagado se muestra con la moneda real de la cuenta, no con la moneda cubierta. |
| Pagos: conversión | Se mantiene explícito que SmartPocket no convierte monedas. |
| Detalle cronológico de pagos | Se mantiene la lista inline con importe y moneda. No se migra a tabla con columnas por moneda. |
| Diálogos con cambios | Se pide confirmación al cerrar con cambios sin guardar en el formulario de resumen y en la gestión de pagos. |
| Fechas de cuotas | Se mantiene el comportamiento actual del código. No se modifica. |
| Tests automatizados | Fuera del alcance de este plan. Se usa una matriz de QA manual. |
| FR53 | Entra en este plan como feature de backend. |

## 3. Fuera de alcance

- Filtros por periodo o categoría en actividades.
- Cargos manuales adicionales en resúmenes.
- Menú de acciones por tarjeta.
- Card "Agregar tarjeta" al final del carrusel.
- Resumen visual de uso dentro de la card del carrusel.
- Diferencia monetaria entre items incluidos y pagos.
- Selector de fecha al cancelar una suscripción.
- Soft delete de cargos de suscripción o cambios al modelo de dominio.
- Tests automatizados nuevos para el módulo.
- Rediseño general de la pantalla o separación en rutas adicionales.

## 4. Orden de ejecución

1. Fase 1: pagos.
2. Fase 2: tarjetas y cascada.
3. Fase 3: actividades.
4. Fase 4: resúmenes.
5. Fase 5: hardening de cargos.
6. Fase 6: cierre documental.

La Fase 2 depende de backend y frontend en ese orden. La Fase 5 se hace después de la Fase 4.
La Fase 6 es la última y no debe ejecutarse hasta que todo lo demás esté cerrado.

## 5. Fase 1: pagos

**Objetivo:** dejar de mostrar información monetaria incorrecta y evitar pérdida accidental de
cambios.

### 5.0. Contrato de pagos por moneda

El detalle del resumen deja de calcular totales de pago. El endpoint de pagos pasa a devolver las
filas por moneda:

```text
GET /CreditCardStatements/{statementId}/payments
```

Respuesta:

```csharp
public class CreditCardStatementPaymentSummaryDTO
{
    public string CoveredCurrencyCode { get; set; }
    public decimal IncludedAmount { get; set; }
    public CreditCardStatementPaymentDTO? Payment { get; set; }
}
```

`CreditCardStatementPaymentDTO` deja de anidar la cuenta y pasa a tener:

```csharp
public int AccountId { get; set; }
public MoneyDTO Money { get; set; }
```

Cambios asociados:

- `GetById` deja de devolver `totals.currencySummaries`; conserva header e items incluidos.
- El listado paginado mantiene `totals.currencySummaries` para evitar consultas por item.
- La UI arma las filas de pago desde el endpoint de pagos, no desde `GetById`.
- `IncludedAmount` se calcula sumando cuotas y cargos incluidos por moneda.
- `Payment` se asigna por `CoveredCurrencyCode`; es `null` cuando todavía no existe pago.
- No se cruza `CoveredCurrencyCode` con la moneda del pago. La moneda real del pago es
  `Payment.Money.CurrencyCode`.

### 5.1. Quitar el estado "Pendiente"

Archivo: `webapp/src/features/credit-cards/statements/payments/CurrencyPaymentCard.tsx`

- Eliminar el cálculo `pendingAmount = includedAmount - paidAmount`.
- Eliminar la fila `Pendiente` del bloque de totales.
- Mantener:
  - `Incluido` en la moneda cubierta.
  - `Pagado` en la moneda real de la cuenta.
- No comparar ni restar importes de monedas distintas.

### 5.2. Formatear el pago con la moneda de la cuenta

Archivos:

- `webapp/src/features/credit-cards/statements/payments/paymentHelpers.ts`
- `webapp/src/features/credit-cards/statements/payments/paymentTypes.ts`
- `webapp/src/features/credit-cards/statements/payments/CurrencyPaymentCard.tsx`

- `createDraftPayments` recibe el array de pagos por moneda y conserva `payment.money.currencyCode`
  como `accountCurrencyCode`.
- Mostrar `Pagado` con `accountCurrencyCode`.
- Si no hay cuenta seleccionada, mostrar `—`, sin asumir la moneda cubierta.
- Al elegir una cuenta distinta, actualizar `accountCurrencyCode` con la moneda de esa cuenta.
- Cambiar la etiqueta del input a `Importe (ARS)` cuando haya cuenta seleccionada.
- Mantener la moneda cubierta visible en el encabezado de la fila.
- La fila debe comunicar claramente dos conceptos distintos:
  - moneda cubierta del resumen;
  - moneda real debitada de la cuenta.

### 5.3. Advertencia de no conversión

Archivo: `webapp/src/features/credit-cards/statements/payments/CreditCardStatementPaymentsDialog.tsx`

- Agregar un texto visible, por ejemplo:
  - `El importe se registra en la moneda de la cuenta. SmartPocket no convierte monedas.`
- No agregar cálculos de equivalencia ni cotizaciones.

### 5.4. Confirmación al cerrar con cambios sin guardar

Archivos:

- `webapp/src/features/credit-cards/statements/payments/CreditCardStatementPaymentsDialog.tsx`
- `webapp/src/features/credit-cards/statements/CreditCardStatementFormDialog.tsx`

Comportamiento:

- Detectar cambios comparando el estado actual contra el estado inicial cargado.
- En pagos, comparar cada borrador: `id`, `accountId`, `accountCurrencyCode`, `amount`,
  `effectiveDate` y `coveredCurrencyCode`.
- En el formulario de resumen, comparar:
  - descripción y fechas;
  - cuotas seleccionadas;
  - cargos seleccionados;
  - montos editados de cargos.
- Si hay cambios y el usuario cierra con X, Escape, click afuera o `Cancelar`, mostrar confirmación
  para descartar.
- Si confirma, cerrar y resetear.
- Si cancela, mantener el diálogo abierto y conservar los cambios.
- Si guarda correctamente, cerrar sin preguntar.

Se recomienda crear un diálogo reutilizable de confirmación de descarte en `webapp/src/components/`
siguiendo los patrones existentes. Si no se reutiliza, implementar la misma lógica en ambos
diálogos.

### 5.5. Criterios de aceptación

- El endpoint de pagos devuelve una fila por moneda incluida, con `payment` nullable.
- `GetById` no devuelve `totals` ni `currencySummaries`.
- Un resumen con items en USD pagado desde una cuenta ARS muestra `Incluido 20 USD` y
  `Pagado 40.000 ARS`.
- No existe ninguna fila ni etiqueta `Pendiente` en el diálogo de pagos.
- El importe pagado nunca se rotula con la moneda cubierta.
- El texto de no conversión es visible.
- Cerrar cualquiera de los dos diálogos con cambios pregunta antes de descartar.
- Guardar correctamente cierra sin preguntar.
- Un error de guardado conserva el borrador.

## 6. Fase 2: tarjetas y cascada

**Objetivo:** completar la eliminación de tarjetas de punta a punta y cumplir FR52 y FR53.

### 6.1. Backend: cascada de eliminación

Archivo: `backend/src/SmartPocket.Features/CreditCards/Delete/CreditCardDeleteCommandHandler.cs`

Al eliminar una tarjeta:

1. Cargar la tarjeta y sus datos relacionados.
2. Aplicar soft delete a la tarjeta.
3. Aplicar soft delete a sus compras.
4. Aplicar soft delete a sus suscripciones.
5. Aplicar soft delete a sus resúmenes.
6. Aplicar soft delete a los pagos de esos resúmenes.
7. Aplicar soft delete a las transacciones asociadas a esos pagos.
8. Guardar una sola vez.

Consideraciones:

- Las cuotas y cargos no necesitan borrado físico: quedan ocultos por los filtros globales de sus
  padres y del resumen.
- Las transacciones de pago deben salir de cuentas y dashboard; de lo contrario quedarían gastos
  huérfanos.
- No se elimina nada físicamente.
- Mantener la operación dentro de una única unidad de persistencia.
- Si el volumen de datos crece, usar proyecciones mínimas para cargar IDs y entidades necesarias.

### 6.2. Frontend: servicio y hook

Archivos:

- `webapp/src/api/services/credit-cards/creditCardService.ts`
- `webapp/src/api/services/credit-cards/useCreditCards.ts`

Agregar:

- `creditCardService.delete(id)` contra `DELETE /creditcards/{id}`.
- `useDeleteCreditCard()` con invalidación de:
  - `creditCardKeys.all` o la raíz `["credit-cards"]`;
  - cuentas (`accountKeys.all`);
  - dashboard (`dashboardKeys.all`).

La invalidación debe cubrir también overview, actividades, resúmenes, sugerencias y detalles de la
tarjeta eliminada.

### 6.3. Frontend: acción en el overview

Archivo: `webapp/src/features/credit-cards/cards/SelectedCreditCardOverview.tsx`

- Mantener `Editar`.
- Agregar `Eliminar`.
- Abrir un diálogo de confirmación con advertencia explícita.
- Texto sugerido:

```text
¿Eliminar la tarjeta «{nombre}»?

Dejará de aparecer en SmartPocket junto con sus compras, suscripciones y resúmenes.
Si tiene pagos registrados, también dejarán de aparecer y sus transacciones se quitarán de tus
cuentas y del dashboard.

Esta acción no cancela nada ante el banco.
```

- El botón de confirmación debe ser destructivo y mostrar estado de carga mientras elimina.
- No eliminar tarjetas desde la card del carrusel.

### 6.4. Frontend: selección posterior

Archivo: `webapp/src/features/credit-cards/CreditCardsPage.tsx`

- Al eliminar la tarjeta seleccionada, seleccionar la primera tarjeta disponible.
- Si no quedan tarjetas, mostrar el empty state existente.
- Cerrar el diálogo y limpiar el estado de edición.
- Evitar consultar el overview de la tarjeta eliminada.

### 6.5. Métricas

- No modificar el bloque de métricas.
- Se mantienen `Pendiente registrado`, `Disponible estimado` y `Uso estimado del límite`.

### 6.6. Criterios de aceptación

- Se puede eliminar una tarjeta desde el overview.
- La confirmación advierte sobre resúmenes y pagos.
- La tarjeta y sus datos dejan de aparecer.
- Los pagos asociados dejan de impactar en cuentas y dashboard.
- Si era la última tarjeta, aparece el empty state.
- Si había otras, se selecciona la primera disponible.
- `pnpm run lint` y `pnpm run build` pasan.
- El backend compila.

## 7. Fase 3: actividades

**Objetivo:** completar los filtros y los estados vacíos de compras y suscripciones.

### 7.1. Filtro por estado

Archivos:

- `webapp/src/api/services/credit-cards/creditCardTypes.ts`
- `webapp/src/features/credit-cards/activities/CreditCardActivitySection.tsx`

- Agregar `status?: CreditCardActivityStatus` a `CreditCardActivityFilters`.
- Agregar un control `Estado` con opción `Todos`.
- Opciones según el tipo seleccionado:
  - Compras: `InProgress`, `Paid`, `Finished`.
  - Suscripciones: `Active`, `Cancelled`.
  - Todos: todos los estados.
- Al cambiar de tipo, limpiar un estado que no aplique.
- Al cambiar de estado, volver a la página 1.
- Combinar con tipo y búsqueda.
- El backend ya soporta `Status`; no requiere cambios.

Etiquetas visibles:

| Valor | Etiqueta |
|---|---|
| `InProgress` | En proceso |
| `Paid` | Pagada |
| `Finished` | Finalizada |
| `Active` | Activa |
| `Cancelled` | Cancelada |

### 7.2. Debounce de búsqueda

Archivo: `webapp/src/features/credit-cards/activities/CreditCardActivitySection.tsx`

- Separar el valor del input del valor enviado a la query.
- Aplicar un debounce de aproximadamente 300 ms.
- Resetear la página al cambiar el texto efectivo.
- Mantener el comportamiento actual de búsqueda por descripción y categoría.

### 7.3. Confirmación al cancelar suscripción

Archivo: `webapp/src/features/credit-cards/activities/CreditCardActivitySection.tsx`

- Reemplazar la cancelación directa por un diálogo de confirmación.
- Advertencia sugerida:

```text
¿Cancelar la suscripción «{descripción}»?

Se registrará la fecha de cancelación de hoy. La suscripción dejará de generar cargos posteriores.
Los cargos ya incluidos en resúmenes se conservan.
```

- Confirmar ejecuta la mutación.
- Cancelar cierra sin cambios.
- Mostrar estado de carga mientras cancela.
- No agregar selector de fecha: la fecha se registra automáticamente con el día actual.

### 7.4. Empty states

Archivo: `webapp/src/features/credit-cards/activities/CreditCardActivitySection.tsx`

Distinguir dos casos:

1. Sin actividades y sin filtros:
   - título: `Todavía no registraste compras ni suscripciones`;
   - descripción breve;
   - CTAs para agregar compra y suscripción.
2. Con filtros o búsqueda y sin resultados:
   - título: `No encontramos resultados`;
   - acción `Limpiar filtros` que resetee tipo, estado, búsqueda y página.

No usar el mismo mensaje genérico para ambos casos.

### 7.5. Criterios de aceptación

- El filtro de estado funciona solo y combinado con tipo y búsqueda.
- La paginación se resetea al cambiar filtros o búsqueda.
- La búsqueda no dispara una request por cada tecla.
- Cancelar una suscripción pide confirmación y muestra advertencia.
- Los dos empty states son distintos y el de filtros permite limpiarlos.

## 8. Fase 4: resúmenes

**Objetivo:** hacer visible y segura la edición de resúmenes, y mejorar el estado vacío de
sugerencias.

### 8.1. Botón independiente "Editar resumen"

Archivos:

- `webapp/src/features/credit-cards/statements/CreditCardStatementItem.tsx`
- `webapp/src/features/credit-cards/statements/CreditCardStatementList.tsx`

- Eliminar el click de toda la card para editar.
- Convertir el cuerpo de la card en contenido no interactivo.
- Agregar un botón `Editar resumen` en la fila de acciones.
- Mostrarlo únicamente cuando `status === "Closed"`.
- Mantener `Gestionar pagos` para cualquier estado.
- Mantener `Eliminar` para cualquier estado.
- Asegurar que las acciones sean visibles en mobile, sin depender de hover.
- Renombrar `onOpen` a `onEdit` si mejora la claridad.

### 8.2. Empty state de sugerencias

Archivo: `webapp/src/features/credit-cards/statements/CreditCardStatementFormDialog.tsx`

- Diferenciar:
  - `No hay items incluidos.` para el detalle de un resumen existente;
  - `No hay cuotas ni cargos pendientes para esta fecha de cierre.` para sugerencias.
- Agregar una guía breve cuando no haya sugerencias, por ejemplo:
  - `Registrá compras o suscripciones para que aparezcan aquí.`
- No cambiar la regla de que un resumen debe tener al menos un item.

### 8.3. Criterios de aceptación

- Solo los resúmenes `Closed` muestran `Editar resumen`.
- `PartiallyPaid` y `Paid` muestran solo `Gestionar pagos` y `Eliminar`.
- La card no abre el formulario por click.
- El empty state de sugerencias es distinto del de items incluidos.

## 9. Fase 5: hardening de cargos

**Objetivo:** evaluar y, si corresponde, corregir el riesgo de duplicados al actualizar cargos.

### 9.1. Reproducción

Caso:

1. Suscripción `S`.
2. Cargo `S + 4` en el resumen A.
3. Cargo `S + 5` en el resumen B.
4. Editar el resumen B y cambiar el cargo a `S + 4`.

Resultado esperado: error de validación claro.
Resultado actual posible: excepción por índice único.

### 9.2. Corrección propuesta

Archivo: `backend/src/SmartPocket.Features/CreditCardStatements/Update/CreditCardStatementUpdateCommandValidator.cs`

- Cargar los cargos existentes que se actualizan, con su `CreditCardSubscriptionId`.
- Validar la combinación `SubscriptionId + ChargeNumber` contra cargos de otros resúmenes.
- Excluir los cargos del resumen actual.
- Considerar los cargos que se eliminan.
- Mantener el índice único como salvaguarda.
- Opcional: mapear una violación de índice a un error de validación amigable.

No se modifica el esquema.

### 9.3. Criterios de aceptación

- El caso de reproducción devuelve un error de validación, no un 500.
- La creación y la actualización siguen rechazando duplicados.
- No se permiten cargos duplicados dentro del mismo resumen ni contra otros.

## 10. Fase 6: cierre documental

**Objetivo:** dejar el roadmap como fuente de verdad y eliminar los planes de tarjetas.

### 10.1. Verificación previa

Ejecutar desde `webapp/`:

```text
pnpm run lint
pnpm run build
pnpm test
```

Ejecutar desde `backend/src/`:

```text
dotnet build SmartPocket.sln
dotnet test --solution SmartPocket.sln
```

No se exige cobertura nueva del módulo; se ejecuta lo existente para detectar regresiones.

### 10.2. Eliminar planes

Eliminar:

- `_docs/planning/credit-card-ui-plan.md`
- `_docs/planning/credit-card-statements-plan.md`
- `_docs/planning/credit-card-closure-plan.md` (este documento, una vez completado)

No eliminar:

- `_docs/planning/roadmap.md`
- `_docs/planning/product-brief-SmartPocket-2026-02-28.md`
- `_docs/planning/web-application-requirements.md`
- `_docs/planning/date-handling-plan.md`

Actualizar las referencias de `_docs/planning/date-handling-plan.md` que apuntan a los planes de
tarjetas eliminados. Reemplazarlas por `_docs/planning/roadmap.md` o quitarlas.

Verificar que no queden referencias:

```text
rg "credit-card-ui-plan|credit-card-statements-plan|credit-card-closure-plan"
```

### 10.3. Actualizar el roadmap

Archivo: `_docs/planning/roadmap.md`

Cambios mínimos:

- Actualizar `Última Actualización` a `Fase 3.10 completada`.
- Cambiar el estado de `3.10: Credit Card Management` a `✅ Implementado 100%`.
- Marcar los FR49 a FR77 según la tabla de la sección 11.
- Reescribir los FR que ya no representan el alcance actual.
- Agregar una nota breve con las decisiones del módulo.

Nota sugerida para el roadmap:

```text
Decisiones del módulo:
- Los datos son registros manuales del usuario; no hay sincronización bancaria.
- Los pagos se registran en la moneda real de la cuenta y cubren una moneda del resumen, sin conversión.
- No se calculan diferencias entre monedas.
- La moneda de la tarjeta se muestra primero en los totales.
- Un resumen solo se edita mientras está cerrado; con pagos debe eliminarlos primero.
- Eliminar una tarjeta oculta sus compras, suscripciones y resúmenes, y quita sus pagos de cuentas y dashboard.
- Los cargos manuales no forman parte del alcance.
```

## 11. Alineación de FRs del roadmap

| FR | Acción | Redacción / nota |
|---|---|---|
| FR49 | Marcar `[x]` | Crear tarjetas con nombre, moneda, límite, ícono y rangos de cierre/vencimiento. |
| FR50 | Marcar `[x]` | Listado con límite y uso estimado desde el overview. |
| FR51 | Marcar `[x]` | Editar datos configurables. |
| FR52 | Marcar `[x]` al cerrar Fase 2 | Eliminar tarjetas con soft delete. |
| FR53 | Marcar `[x]` al cerrar Fase 2 | Ocultar en cascada compras, suscripciones, cuotas, resúmenes y pagos. |
| FR54 | Marcar `[x]` | Sin cambios. |
| FR55 | Marcar `[x]` | Sin cambios. |
| FR56 | Marcar `[x]` | Sin cambios. |
| FR57 | Marcar `[x]` al cerrar Fase 3 | Filtradas por tarjeta, tipo, estado y búsqueda. |
| FR58 | Marcar `[x]` | Sin cambios. |
| FR59 | Marcar `[x]` | Sin cambios. |
| FR60 | Marcar `[x]` y reescribir | Cancelar suscripciones con confirmación, registrando la fecha de cancelación y deteniendo cargos posteriores. |
| FR61 | Marcar `[x]` | Sin cambios. |
| FR62 | Marcar `[x]` | Sin cambios. |
| FR63 | Marcar `[x]` y reescribir | Generar un preview sin persistir usando la fecha de cierre real. |
| FR64 | Marcar `[x]` y reescribir | Mostrar cuotas y cargos sugeridos anteriores al cierre. |
| FR65 | Marcar `[x]` y reescribir | Mostrar items pendientes del pool que todavía no fueron asignados. |
| FR66 | Marcar `[x]` y reescribir | Incluir o excluir libremente cuotas y cargos sugeridos antes de confirmar. |
| FR67 | Marcar `[x]` y reescribir | Generar el cargo del período de una suscripción al incluirla en el resumen. |
| FR68 | Marcar `[x]` | Sin cambios. |
| FR69 | Marcar `[x]` y reescribir | Ver resúmenes ordenados por cierre, con estado cerrado, parcialmente pagado o pagado. |
| FR70 | Marcar `[x]` | Sin cambios. |
| FR71 | Marcar `[x]` | Sin cambios. |
| FR72 | Marcar `[x]` | Sin cambios. |
| FR73 | Marcar `[x]` y reescribir | Registrar pagos en cualquier moneda soportada. |
| FR74 | Marcar `[x]` y reescribir | Ver totales incluidos por moneda y pagos registrados, sin calcular diferencias entre monedas. |
| FR75 | Marcar `[x]` y reescribir | Editar pagos y sus transacciones mediante el contrato bulk. |
| FR76 | Marcar `[x]` y reescribir | Editar el monto de un cargo de suscripción incluido en un resumen cerrado. No se edita un resumen pagado. |
| FR77 | Marcar `[x]` | Sin cambios. |

## 12. QA manual

| Escenario | Resultado esperado |
|---|---|
| Resumen con items USD y pago desde cuenta ARS | Se muestra `Incluido 20 USD` y `Pagado 40.000 ARS`; no aparece `Pendiente`. |
| Cambiar cuenta de un pago | El importe y la etiqueta de moneda se actualizan a la moneda de la nueva cuenta. |
| Cerrar gestión de pagos con cambios | Se pide confirmación; cancelar conserva el borrador; descartar cierra. |
| Cerrar formulario de resumen con cambios | Se pide confirmación; cancelar conserva los cambios. |
| Guardar pagos con error | El diálogo permanece abierto y conserva el borrador. |
| Eliminar tarjeta sin movimientos | Se elimina y se selecciona la siguiente o aparece el empty state. |
| Eliminar tarjeta con compras, suscripciones y resúmenes | Todo deja de aparecer. |
| Eliminar tarjeta con pagos | Los pagos dejan de impactar en cuentas y dashboard. |
| Filtro de estado en compras | Muestra solo `En proceso`, `Pagada` o `Finalizada` según corresponda. |
| Filtro de estado en suscripciones | Muestra solo `Activa` o `Cancelada`. |
| Combinar tipo, estado y búsqueda | La lista respeta los tres filtros y resetea la página. |
| Buscar escribiendo rápido | Se ejecuta una sola request después del debounce. |
| Cancelar suscripción | Pide confirmación, advierte sobre cargos futuros y conserva los ya incluidos. |
| Sin actividades | Empty state con CTAs para agregar. |
| Sin resultados por filtros | Empty state con acción para limpiar filtros. |
| Resumen `Closed` | Muestra `Editar resumen`, `Gestionar pagos` y `Eliminar`. |
| Resumen `PartiallyPaid` o `Paid` | No muestra `Editar resumen`; sí pagos y eliminar. |
| Click en la card del resumen | No abre el formulario. |
| Resumen sin sugerencias | Mensaje específico de “no hay cuotas ni cargos pendientes”. |
| Actualizar cargo a un número ya usado en otro resumen | Error de validación claro, sin 500. |

## 13. Criterios de cierre del módulo

- [ ] Fase 1 completada y QA de pagos aprobado.
- [ ] Fase 2 completada y QA de eliminación de tarjetas aprobado.
- [ ] Fase 3 completada y QA de actividades aprobado.
- [ ] Fase 4 completada y QA de resúmenes aprobado.
- [ ] Fase 5 evaluada; corregida o descartada con justificación.
- [ ] `pnpm run lint`, `pnpm run build` y `pnpm test` pasan.
- [ ] `dotnet build` y `dotnet test` pasan.
- [ ] Los planes de tarjetas fueron eliminados.
- [ ] Las referencias a los planes eliminados fueron limpiadas.
- [ ] El roadmap refleja el estado real y los FRs actualizados.
- [ ] No queda ningún texto `Pendiente` en la UI de pagos.
- [ ] No queda ningún cálculo de diferencia entre monedas.

## 14. Referencias

- `_docs/planning/roadmap.md`, fase 3.10.
- `backend/src/SmartPocket.Domain/CreditCards/smart-pocket-tarjeta-credito-diseno.md`.
- `_docs/technical/ux-design-specification.md`.
- `_docs/design/DESIGN.md`.
