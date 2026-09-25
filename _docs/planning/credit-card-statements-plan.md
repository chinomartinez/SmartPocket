# SmartPocket - Plan de resúmenes de tarjetas de crédito

## 1. Propósito

Definir el contrato funcional, el modelo de consulta y el flujo de UI para administrar resúmenes de tarjetas de crédito dentro de SmartPocket.

Este documento continúa el plan de UI de tarjetas de crédito y debe leerse junto con:

- `_docs/planning/credit-card-ui-plan.md`.
- `backend/src/SmartPocket.Domain/CreditCards/smart-pocket-tarjeta-credito-diseno.md`.

SmartPocket registra información manual del usuario. Un resumen es un registro de control personal y no representa un estado de cuenta oficial ni información sincronizada con una entidad emisora.

## 2. Alcance

### 2.1. Incluido en este plan

- Listado paginado de resúmenes por tarjeta.
- Detalle de un resumen.
- Sugerencias no persistentes de cuotas y cargos.
- Creación de un resumen con selección de items.
- Edición de un resumen existente.
- Eliminación de un resumen.
- Estados de carga, error y vacío en la UI.
- Totales derivados de items incluidos y pagos asociados.

### 2.2. Fuera de alcance inmediato

- Creación, edición y eliminación de pagos.
- Asociación de transacciones a resúmenes.
- Pagos en múltiples monedas.
- Gestión visual avanzada de diferencias entre total incluido y total pagado.
- Soft delete de cargos de suscripción.

La gestión de pagos pertenece a la Iteración 4, pero los contratos de resumen deben dejar preparada la información necesaria para incorporarla.

## 3. Modelo de dominio actual

### 3.1. Resumen

`CreditCardStatement` contiene:

- `CreditCardId`.
- `Description`.
- `ClosingDate`.
- `DueDate`.
- `Status`: `Closed` o `Paid`.
- Cuotas de compras incluidas.
- Cargos de suscripciones incluidos.
- Pagos asociados.

Los rangos habituales configurados en la tarjeta no reemplazan las fechas reales del resumen.

### 3.2. Cuota de compra

`CreditCardPurchaseInstallment` contiene:

- `Id`.
- `CreditCardPurchaseId`.
- `Number`.
- `Amount`.
- `CreditCardStatementId` nullable.

Una cuota está disponible cuando `CreditCardStatementId` es `null`.

La cuota no tiene una fecha propia. Para las sugerencias se calcula una fecha derivada:

```text
InstallmentDate = Purchase.EffectiveDate + (Installment.Number - 1) meses
```

### 3.3. Cargo de suscripción

`CreditCardSubscriptionCharge` contiene:

- `Id`.
- `CreditCardSubscriptionId`.
- `CreditCardStatementId`.
- `ChargeNumber`.
- `Amount`.

Los cargos se crean actualmente asociados a un resumen. Al eliminar un resumen:

- Las cuotas se desvinculan y vuelven a estar disponibles.
- Los cargos se eliminan físicamente.

No se modifica todavía el modelo para permitir cargos desvinculados o soft delete de cargos.

## 4. Reglas funcionales de fechas

### 4.1. Fecha de cierre

El cálculo de sugerencias utiliza exclusivamente `ClosingDate`.

`DueDate` no participa en la selección de cuotas ni cargos. Se utiliza para:

- Crear o editar el resumen.
- Mostrar la fecha de vencimiento.
- Validar que sea posterior al cierre.

### 4.2. Exclusión de la fecha de cierre

Un item producido exactamente en `ClosingDate` pertenece al resumen siguiente.

La comparación es estricta:

```text
ItemDate < ClosingDate
```

No se utiliza como regla general el rango:

```text
[ClosingDate - 1 mes, ClosingDate)
```

La consulta trabaja sobre el pool de items pendientes anteriores al cierre. El usuario decide qué items sugeridos incluir realmente.

### 4.3. Cuotas de compras

Una cuota se sugiere cuando:

- Pertenece a una compra de la tarjeta solicitada.
- No está asociada a otro resumen.
- Su fecha derivada es anterior a `ClosingDate`.

Las cuotas ya asociadas a otro resumen no se devuelven como sugerencias.

No se muestran estados especiales como `Overdue` o `AssignedToOtherStatement`.

### 4.4. Cargos de suscripciones

Una suscripción puede generar cargos mensuales sugeridos cuando:

- Pertenece a la tarjeta solicitada.
- Su fecha efectiva es anterior al cierre.
- El cargo mensual calculado es anterior a `ClosingDate`.
- No existe ya un cargo con el mismo número.
- La suscripción no fue cancelada antes de la fecha del cargo.

El cargo correspondiente exactamente a `ClosingDate` queda fuera y se considera para el resumen siguiente.

## 5. Cálculo de cargos de suscripción

### 5.1. Calendario mensual

La fecha efectiva define el día mensual de la suscripción.

Ejemplo:

```text
EffectiveDate: 10/03

Charge 1: 10/03
Charge 2: 10/04
Charge 3: 10/05
Charge 4: 10/06
Charge 5: 10/07
Charge 6: 10/08
Charge 7: 10/09
```

Con `ClosingDate = 10/09`, el cargo 7 queda fuera porque su fecha no es menor al cierre. Los cargos 4, 5 y 6 pueden ser sugeridos si todavía no existen.

### 5.2. Números faltantes

El backend calcula los números de cargo cuyos períodos ya ocurrieron antes del cierre y que todavía no existen.

Ejemplo:

```text
Cargos persistidos: 1, 2, 3
Números esperados antes del cierre: 1, 2, 3, 4, 5, 6
Sugerencias: 4, 5, 6
```

Si existen huecos intermedios, también se sugieren:

```text
Cargos persistidos: 1, 3
Números esperados: 1, 2, 3
Sugerencia: 2
```

### 5.3. Monto sugerido

Para cada suscripción se busca el último cargo persistido cuyo resumen tenga una fecha de cierre anterior al `ClosingDate` solicitado.

- Si existe, se utiliza su monto.
- Si no existe, se utiliza `InitialAmount`.
- Cada monto sugerido puede ser editado por el usuario.

El último cargo se determina por el contexto temporal del resumen, no solamente por el mayor `ChargeNumber`.

### 5.4. Cargos manuales adicionales

La UI debe permitir agregar cargos adicionales aunque no hayan sido sugeridos automáticamente.

El usuario puede:

- Modificar el monto de un cargo sugerido.
- Descartar un cargo sugerido.
- Agregar un cargo de una suscripción existente.
- Indicar manualmente su `ChargeNumber` y `Amount`.

La persistencia debe validar que no se duplique la combinación:

```text
CreditCardSubscriptionId + ChargeNumber
```

## 6. Contratos de consulta

### 6.1. Sugerencias

Ruta:

```text
GET /CreditCards/{creditCardId}/CreditCardStatements/suggestions
```

Query params obligatorios:

```text
closingDate
```

La consulta no persiste resumen, cuota ni cargo.

Respuesta conceptual:

```text
{
  suggestedInstallmentItems: [],
  suggestedChargeItems: []
}
```

No se devuelven items pertenecientes a otros resúmenes.

### 6.2. Detalle

Ruta:

```text
GET /CreditCardStatements/{id}
```

El resumen ya contiene `CreditCardId`, `ClosingDate` y `DueDate`, por lo que no se requieren query params.

Respuesta conceptual:

```text
{
  statement,
  includedInstallmentItems: [],
  includedChargeItems: [],
  suggestedInstallmentItems: [],
  suggestedChargeItems: [],
  totals
}
```

El detalle incluye items persistidos y vuelve a calcular sugerencias para la edición utilizando el `ClosingDate` del resumen.

### 6.3. Item de cuota

El item debe contener los datos necesarios para mostrar el origen del consumo sin reutilizar el read model de actividades:

```text
{
  id,
  amount,
  currencyCode,
  installmentNumber,
  purchase: {
    id,
    description,
    effectiveDate,
    category: {
      id,
      name,
      icon
    }
  }
}
```

`purchase` es obligatorio.

### 6.4. Item de cargo

```text
{
  id nullable,
  amount,
  currencyCode,
  chargeNumber,
  subscription: {
    id,
    description,
    effectiveDate,
    category: {
      id,
      name,
      icon
    }
  }
}
```

`subscription` es obligatorio.

`id` es nullable únicamente para cargos sugeridos que todavía no fueron persistidos.

## 7. Contratos de persistencia

### 7.1. Crear resumen

Se mantiene el concepto actual:

```text
CreditCardId
Description
ClosingDate
DueDate
InstallmentIds[]
SubscriptionCharges[]
```

Los cargos nuevos incluyen:

```text
SubscriptionId
ChargeNumber
Amount
```

El backend debe volver a validar disponibilidad y duplicados al confirmar. Las sugerencias no reservan items.

### 7.2. Actualizar resumen

Para cuotas, la lista representa el conjunto final de cuotas incluidas.

- Cuota presente: permanece o se vincula.
- Cuota ausente: se desvincula.
- Cuota perteneciente a otro resumen: error.

Para cargos:

- Cargo con `id`: se actualiza.
- Cargo con `id = null`: se crea.
- Cargo existente ausente: se elimina.
- Cargo duplicado: error.

La edición está permitida tanto para resúmenes `Closed` como `Paid`.

### 7.3. Eliminar resumen

Ruta prevista:

```text
DELETE /CreditCardStatements/{id}
```

La operación debe ejecutarse en una transacción:

1. Cargar cuotas y cargos del resumen.
2. Desvincular todas las cuotas.
3. Eliminar físicamente todos los cargos.
4. Eliminar el resumen mediante el mecanismo de soft delete existente.
5. Confirmar la transacción.

La UI debe informar que las cuotas vuelven a estar disponibles para futuros resúmenes y que los cargos registrados dentro de SmartPocket serán eliminados.

## 8. Totales

Los totales no se persisten. Se calculan como parte de la consulta.

### 8.1. Totales de items

Se calculan desde cuotas y cargos incluidos, agrupados por moneda:

```text
totalItemsInCardCurrency
totalItemsInUsd
```

La tarjeta puede tener compras o suscripciones en una moneda distinta de su moneda base.

### 8.2. Totales pagados

Cuando exista la gestión de pagos, se calculan desde las transacciones asociadas:

```text
totalPaidInCardCurrency
totalPaidInUsd
```

El pago puede ser mayor que la suma de cuotas y cargos incluidos. Esto es válido porque el usuario puede registrar conceptos adicionales no representados como consumos, como mantenimiento u otros cargos.

La diferencia no se persiste y puede calcularse desde los totales.

## 9. Reglas de integridad

### 9.1. Cuotas

- Una cuota no puede pertenecer a más de un resumen.
- La asignación debe verificar que `CreditCardStatementId` siga siendo `null` o pertenezca al resumen que se está editando.
- La protección contra condiciones de carrera se incorpora como mejora del plan principal.
- La estrategia recomendada es una actualización condicional que sólo asigne la cuota si continúa disponible.

### 9.2. Cargos

- No puede existir más de un cargo para la combinación `SubscriptionId + ChargeNumber`.
- El índice único existente debe mantenerse.
- La creación y actualización deben validar duplicados dentro del comando y contra la base.
- La eliminación del resumen debe borrar los cargos antes de eliminar el resumen.

### 9.3. Pagos

Como preparación para Iteración 4:

- `CreditCardStatementPayment.TransactionId` debe tener un índice único.
- Una transacción no debe asociarse a más de un resumen.
- La asociación debe validar la relación con la cuenta y la moneda cuando se implemente la feature de pagos.

## 10. UI del listado

El listado se mantiene compacto y dentro de la pantalla `/credit-cards`.

Debe mostrar:

- Fecha de cierre.
- Fecha de vencimiento.
- Estado.
- Total de items en moneda de la tarjeta.
- Total de items en USD, si corresponde.
- Total pagado en moneda de la tarjeta, cuando exista.
- Total pagado en USD, cuando exista.
- Cantidad de cuotas y cargos incluidos.
- Acción para abrir el detalle.

El listado debe:

- Ordenarse por `ClosingDate DESC`.
- Consumir un endpoint paginado.
- Mantener el diseño visual de cada resumen.
- Agregar controles de página fuera de cada item.
- Eliminar el botón `Ver todos`.

Estados requeridos:

- Loading con skeleton o mensaje localizado.
- Error con reintento.
- Empty state cuando la tarjeta no tenga resúmenes.
- Empty state diferenciado cuando no haya sugerencias.

## 11. UI de creación y edición

El flujo se mantiene dentro del contexto de la tarjeta seleccionada.

### 11.1. Creación

1. El usuario inicia `Nuevo resumen`.
2. Ingresa o confirma `ClosingDate`.
3. Ingresa o confirma `DueDate`.
4. La UI consulta sugerencias usando sólo `ClosingDate`.
5. Se muestran cuotas y cargos sugeridos separados.
6. Los items sugeridos aparecen seleccionados por defecto.
7. El usuario incluye, excluye o modifica items.
8. El usuario puede agregar cargos manuales.
9. La UI muestra totales derivados de la selección.
10. El usuario confirma.

### 11.2. Edición

1. La UI obtiene el detalle por `CreditCardStatementId`.
2. Muestra items incluidos.
3. Muestra nuevas sugerencias disponibles.
4. Conserva los items incluidos aunque ya no sean sugerencias.
5. Permite modificar fechas, cuotas y cargos.
6. Permite modificar un resumen `Closed` o `Paid`.
7. Confirma mediante el comando de actualización.

No se deben mostrar cuotas como formularios independientes. Se muestran como items de la compra padre, con número, importe y origen.

## 12. Servicios y caché frontend

El servicio de tarjetas deberá incorporar operaciones separadas para:

- Listar resúmenes.
- Obtener detalle.
- Obtener sugerencias.
- Crear resumen.
- Actualizar resumen.
- Eliminar resumen.

Las mutations deben invalidar, como mínimo:

- Listado de resúmenes de la tarjeta.
- Detalle del resumen afectado.
- Overview de la tarjeta.
- Actividades de la tarjeta.

## 13. Orden de implementación

### Fase 1: Contratos y consultas

- Confirmar DTOs de listado, detalle e items.
- Implementar listado paginado ordenado por cierre descendente.
- Implementar detalle con items incluidos.
- Implementar sugerencias de cuotas.
- Implementar sugerencias de cargos mensuales.

### Fase 2: Persistencia

- Completar validaciones de creación y actualización.
- Implementar eliminación con desvinculación de cuotas y eliminación de cargos.
- Validar estados y pertenencia a tarjeta.
- Agregar pruebas de integridad.

### Fase 3: UI

- Reemplazar mocks de `CreditCardStatementList`.
- Incorporar paginación.
- Crear dialog o drawer de resumen.
- Mostrar items agrupados por tipo.
- Implementar selección y edición de cargos.
- Incorporar loading, error y empty states.

### Fase 4: Mejoras de integridad

- Protección contra condiciones de carrera en asignación de cuotas.
- Índice único para `CreditCardStatementPayment.TransactionId`.
- Ajustes derivados de pruebas de concurrencia y soft delete.

## 14. Decisiones abiertas

- Confirmar si la fecha derivada de una cuota usa exactamente `EffectiveDate + Number - 1 meses`.
- Definir el comportamiento para fechas como `31` en meses que no tienen día 31.
- Definir cómo se calcula un cargo mensual cuando la fecha efectiva cae en un día inexistente de un mes posterior.
- Confirmar si la moneda distinta de la tarjeta siempre se presenta como USD o si se debe soportar una lista de monedas.
- Confirmar si los items sugeridos se muestran seleccionados por defecto también durante edición.
- Definir el texto exacto de confirmación al eliminar un resumen y sus cargos.
- Actualizar el plan general de UI y el diseño funcional, que todavía describen restricciones antiguas para resúmenes pagados.

## 15. Criterios para comenzar la implementación

- Contratos de listado, detalle y sugerencias aprobados.
- Regla estricta `ItemDate < ClosingDate` aprobada.
- Cálculo mensual de cargos aprobado.
- Comportamiento de cargos faltantes aprobado.
- Eliminación de cargos y desvinculación de cuotas definida.
- Edición de resúmenes `Paid` confirmada.
- Totales por moneda definidos.
- Pagos mantenidos fuera de Iteración 3, pero contemplados en el contrato de detalle.
