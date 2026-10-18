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

### 2.2. Separación respecto del flujo base de resúmenes

- La creación de un resumen no incluye pagos.
- La edición de cuotas, cargos y datos propios del resumen se mantiene separada de la gestión de pagos.
- La gestión de pagos, la asociación de transacciones y los pagos en múltiples monedas pertenecen a la Iteración 4.
- No se calcula una diferencia monetaria entre items incluidos y pagos cuando las monedas son distintas.
- Los cargos de suscripción continúan eliminándose físicamente al eliminar un resumen; no se incorpora todavía soft delete de cargos.

La Iteración 4 utiliza el contrato de detalle del resumen y mantiene la gestión de pagos dentro del contexto de la tarjeta, pero en un flujo de UI independiente.

## 3. Modelo de dominio actual

### 3.1. Resumen

`CreditCardStatement` contiene:

- `CreditCardId`.
- `Description`.
- `ClosingDate`.
- `DueDate`.
- `Status`: `Closed`, `PartiallyPaid` o `Paid`.
- Cuotas de compras incluidas.
- Cargos de suscripciones incluidos.
- Pagos asociados.

El estado se determina por las monedas de los items que tienen un pago asociado, no por la igualdad entre importes. Los rangos habituales configurados en la tarjeta no reemplazan las fechas reales del resumen.

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
  totals
}
```

El detalle devuelve únicamente información persistida. Las sugerencias se consultan exclusivamente mediante el endpoint de sugerencias.

Durante la edición, la UI carga primero el detalle y luego consulta sugerencias utilizando el `ClosingDate` persistido. Si el usuario modifica esa fecha, se vuelve a consultar únicamente el endpoint de sugerencias.

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

### 6.5. Presentación cronológica de items

El detalle devuelve cuotas y cargos en colecciones separadas. La UI es responsable de:

1. Mapear las cuotas usando `purchase.effectiveDate`, `purchase.description` y `Cuota N`.
2. Mapear los cargos usando `subscription.effectiveDate`, `subscription.description` y `Cargo N`.
3. Unir ambas colecciones.
4. Ordenar el resultado por `effectiveDate` ascendente.
5. Detectar las monedas presentes y construir las columnas de importes dinámicamente.

No se requiere una colección adicional unificada en el endpoint. La tabla de detalle muestra una fila por item, con la descripción y el tipo en la primera columna, la fecha en la segunda y una columna por moneda. Cuando un item no tiene importe en una moneda, se muestra `—`.

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

El resumen debe incluir al menos una cuota o un cargo. Esta validación forma parte del contrato actual de creación y actualización; no se permiten resúmenes vacíos.

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

La edición de cuotas, cargos y datos del resumen sólo está permitida cuando el estado es `Closed`.
Los resúmenes `PartiallyPaid` y `Paid` no pueden editarse mientras tengan pagos asociados.

Para editar un resumen con pagos, el usuario debe eliminarlos primero mediante el contrato bulk de
pagos enviando un conjunto vacío. Luego puede modificar cuotas, cargos y datos del resumen, y
registrar nuevamente los pagos que correspondan.

### 7.3. Eliminar resumen

Ruta prevista:

```text
DELETE /CreditCardStatements/{id}
```

La operación utiliza el tracking existente del contexto y se persiste con una única llamada a `SaveChangesAsync`:

1. Cargar cuotas y cargos del resumen.
2. Desvincular todas las cuotas.
3. Eliminar físicamente todos los cargos.
4. Eliminar el resumen mediante el mecanismo de soft delete existente.
5. Guardar los cambios.

La UI debe informar que las cuotas vuelven a estar disponibles para futuros resúmenes, que los
cargos registrados dentro de SmartPocket serán eliminados y que los pagos y sus transacciones
asociadas también serán eliminados mediante soft delete.

## 8. Totales

Los totales no se persisten. Se calculan como parte de la consulta.

### 8.1. Totales de items

Se calculan desde cuotas y cargos incluidos, agrupados por cualquier moneda. En el detalle del
resumen se devuelven dentro de `totals.currencySummaries`:

```json
{
  "totals": {
    "currencySummaries": [
      {
        "currencyCode": "USD",
        "includedAmount": 20,
        "payment": {
          "amount": 40000,
          "currencyCode": "ARS"
        }
      }
    ]
  }
}
```

Cada `payment` utiliza la estructura común `MoneyDTO` y puede ser `null` cuando todavía no
existe un pago para la moneda del grupo:

```text
currencySummaries: [
  {
    currencyCode,
    includedAmount,
    payment: MoneyDTO | null
  }
]
```

La tarjeta puede tener compras o suscripciones en una moneda distinta de su moneda base. La estructura no debe limitarse a ARS y USD.

### 8.2. Totales pagados

Los totales pagados se calculan desde las transacciones asociadas y se muestran dentro del
resumen de la moneda cubierta. El `currencyCode` externo representa la moneda de los items y es
conceptualmente equivalente a `CreditCardStatementPayment.CoveredCurrencyCode`:

```text
currencyCode: "USD"
includedAmount: 20
payment: {
  amount: 40000,
  currencyCode: "ARS"
}
```

El ejemplo indica que se registraron `40.000 ARS` destinados a cubrir los items en USD. No representa una conversión ni permite comparar numéricamente ambas monedas.

El pago puede ser mayor o menor que la suma de cuotas y cargos incluidos. Esto es válido porque el usuario puede registrar importes manuales que no coincidan con los consumos registrados.

### 8.3. Representación en el listado

El endpoint paginado de resúmenes debe devolver directamente `totals.currencySummaries`, incluyendo
el `payment` cuando exista. La UI no debe ejecutar un `GetById` por cada item del listado.

Cada resumen muestra:

- El `includedAmount` de todas las monedas presentes.
- La moneda base de la tarjeta primero; las demás monedas se ordenan por código.
- El importe y la moneda de `payment` únicamente cuando existe.
- La cantidad de cuotas y cargos incluidos.
- El estado global del resumen.

La UI no muestra una diferencia o saldo restante calculado. Un pago puede estar expresado en una
moneda distinta de la moneda cubierta y no existe conversión automática. Tampoco se muestra un
estado independiente por cada moneda: si no hay `payment`, simplemente no se renderiza esa línea.

Ejemplo visual conceptual:

```text
USD
Incluido: 20 USD
Pago: 40.000 ARS

ARS
Incluido: 15.000 ARS
```

## 9. Reglas de integridad

### 9.1. Cuotas

- Una cuota no puede pertenecer a más de un resumen.
- La asignación debe verificar que `CreditCardStatementId` siga siendo `null` o pertenezca al resumen que se está editando.
- La protección contra condiciones de carrera queda diferida como mejora futura.

### 9.2. Cargos

- No puede existir más de un cargo para la combinación `SubscriptionId + ChargeNumber`.
- El índice único existente debe mantenerse.
- La creación y actualización deben validar duplicados dentro del comando y contra la base.
- La eliminación del resumen debe borrar los cargos antes de eliminar el resumen.

### 9.3. Pagos

- `CreditCardStatementPayment.TransactionId` debe tener un índice único.
- Una transacción no debe asociarse a más de un resumen.
- La asociación valida la relación con la cuenta y la moneda cubierta.
- Debe existir como máximo un pago por cada moneda cubierta del resumen.
- El monto del pago no se compara contra el total de items.
- Un pago puede registrarse desde una cuenta ARS para cubrir items USD, sin conversión automática.
- `CoveredCurrencyCode` debe existir entre las monedas de los items incluidos.
- Un resumen `PartiallyPaid` o `Paid` no puede actualizarse mientras tenga pagos asociados.
- El monto del pago debe ser mayor que cero; no se impone un máximo basado en el total de items.
- La fecha del pago debe cumplir `ClosingDate < PaymentDate <= Today(UtcNow)`.
- La cuenta se selecciona entre las cuentas activas disponibles, sin filtrar por la moneda cubierta.

## 10. UI del listado

El listado se mantiene compacto y dentro de la pantalla `/credit-cards`.

Debe mostrar:

- Fecha de cierre.
- Fecha de vencimiento.
- Estado global: `Cerrado`, `Parcialmente pagado` o `Pagado`.
- Items incluidos agrupados por cualquier moneda, con la moneda de la tarjeta primero.
- El pago registrado para cada moneda sólo cuando exista, mostrando importe y moneda real de la cuenta.
- Cantidad de cuotas y cargos incluidos.
- Acción `Editar resumen`.
- Acción `Gestionar pagos`.
- Acción para eliminar el resumen.

Los importes incluidos y pagos se representan mediante `totals.currencySummaries`. No se muestran
diferencias calculadas ni se comparan numéricamente importes de monedas distintas. La tarjeta no
muestra un estado independiente por moneda: cuando una moneda no tiene pago, simplemente no se
renderiza una línea de pago.

El listado debe:

- Ordenarse por `ClosingDate DESC`.
- Consumir un endpoint paginado.
- Recibir los totales y pagos en la respuesta paginada, sin realizar una consulta de detalle por cada resumen.
- Mantener una tarjeta compacta y responsive.
- Mantener las acciones visibles también en mobile; no depender de `hover`.
- Mostrar el importe incluido y, debajo, el pago si existe.
- Agregar controles de página fuera de cada item.
- No utilizar el click de toda la tarjeta como acción única; las acciones deben ser botones independientes.

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
5. Se muestran cuotas y cargos en una lista plana ordenada por fecha efectiva.
6. Las sugerencias no aparecen seleccionadas por defecto.
7. El usuario incluye, excluye o modifica items.
8. El usuario puede agregar cargos manuales.
9. La UI muestra totales derivados de la selección.
10. El usuario confirma.

La creación no incluye pagos. Una vez persistido el resumen, el usuario puede utilizar la acción
`Gestionar pagos` desde el listado.

### 11.2. Edición

1. La UI obtiene el detalle por `CreditCardStatementId`.
2. Muestra items incluidos en el bloque `Detalle del resumen`.
3. Consulta sugerencias en un bloque separado.
4. Conserva los items incluidos aunque ya no sean sugerencias.
5. Mantiene seleccionados sólo los items incluidos.
6. Permite modificar la fecha de cierre y recalcular sugerencias.
7. Permite modificar fechas, cuotas y cargos.
8. Permite modificar un resumen `Closed`.
9. Confirma mediante el comando de actualización.

Si el resumen está `PartiallyPaid` o `Paid`, la UI debe bloquear la edición y ofrecer acceso a
`Gestionar pagos`. El usuario debe eliminar todos los pagos antes de volver a editar el resumen.

No se deben mostrar cuotas como formularios independientes. Los items incluidos y sugeridos se muestran en listas planas, ordenadas por fecha efectiva, y cada fila identifica su tipo mediante `Cuota N` o `Cargo N`.

### 11.3. Gestión de pagos

La gestión de pagos es un diálogo amplio y responsive, separado del diálogo de edición del
resumen. No se abre como un modal encima del formulario de resumen. La pantalla muestra el
contexto completo del resumen y permite editar únicamente los pagos.

La navegación entre ambos flujos es bidireccional:

- Desde el listado, `Editar resumen` abre el diálogo de edición.
- Desde el listado, `Gestionar pagos` abre el diálogo de pagos.
- Desde `Editar resumen`, se puede abrir `Gestionar pagos`.
- Desde `Gestionar pagos`, se puede abrir `Editar resumen`.
- Si el diálogo actual tiene cambios sin guardar, el cambio de flujo solicita confirmación para descartarlos.

#### Detalle cronológico

El detalle muestra cuotas y cargos de sólo lectura en una tabla ordenada por `effectiveDate`
ascendente. El frontend une y ordena las colecciones devueltas por `GetById`.

La tabla utiliza:

- Primera columna: descripción y, debajo, `Cuota N` —o `Cuota N de M` si el read model expone el total de cuotas— o `Cargo N`.
- Segunda columna: fecha efectiva.
- Una columna dinámica por cada moneda presente.
- `—` cuando el item no tiene importe en una moneda.

En mobile la tabla mantiene el formato tabular y permite scroll horizontal únicamente dentro del
contenedor de la tabla. La primera columna debe mantenerse visible cuando sea posible, las
columnas monetarias deben ser compactas y las descripciones largas se limitan a dos líneas.
El diálogo no debe generar scroll horizontal en toda la pantalla.

#### Edición bulk de pagos

Debajo de la tabla se muestra una fila editable por cada moneda de los items incluidos. Cada fila
contiene:

- La moneda cubierta y el importe incluido.
- La cuenta seleccionada, entre todas las cuentas activas disponibles.
- El importe real debitado y la moneda de la cuenta.
- La fecha del pago.

La cuenta puede estar en una moneda distinta de la moneda cubierta. La fecha se inicializa con
`Today(UtcNow)` y debe cumplir `ClosingDate < PaymentDate <= Today(UtcNow)`. Una fila completamente
vacía significa que esa moneda todavía no fue pagada y es válida. Si el usuario comienza a
completarla, cuenta, importe y fecha pasan a ser obligatorios.

Los pagos se editan localmente y se guardan mediante una única operación bulk. Eliminar un pago
lo quita del borrador local; la eliminación se persiste sólo al pulsar `Guardar pagos`. Cancelar
recupera el estado original.

Después de guardar correctamente, el diálogo se cierra, se vuelve al listado y se muestra un
mensaje de éxito. El listado debe reflejar el estado y los importes actualizados. Si falla el
guardado, el diálogo permanece abierto, conserva el borrador y muestra los errores sin perder los
cambios.

## 12. Servicios y caché frontend

El servicio de tarjetas deberá incorporar operaciones separadas para:

- Listar resúmenes.
- Obtener detalle.
- Obtener sugerencias.
- Crear resumen.
- Actualizar resumen.
- Eliminar resumen.
- Consultar pagos de un resumen.
- Sincronizar en bulk los pagos de un resumen.

La feature de pagos utilizará la consulta existente de cuentas activas para los selectores, sin
crear un endpoint de cuentas dentro del servicio de resúmenes.

El listado paginado debe devolver `totals.currencySummaries` con `includedAmount` y `payment`
nullable. La UI utiliza el detalle para la tabla de items y el endpoint de pagos para los campos
editables; ambas consultas y la consulta de cuentas pueden cargarse en paralelo al abrir
`Gestionar pagos`.

Las mutations deben invalidar, como mínimo:

- Listado de resúmenes de la tarjeta.
- Detalle del resumen afectado.
- Sugerencias de la tarjeta.
- Overview de la tarjeta.
- Actividades de la tarjeta.
- Consultas de cuentas y dashboard relacionadas con la transacción de pago, según las keys existentes.

Después de guardar o eliminar pagos también se debe actualizar el listado paginado, el detalle del
resumen, el overview de la tarjeta y las actividades. Las mutaciones de pagos crean, actualizan o
eliminan transacciones, por lo que no deben dejar balances o datos del dashboard obsoletos.

Las mutations de compras y suscripciones también deben invalidar listado, detalle y sugerencias, porque modifican indirectamente cuotas y cargos disponibles.

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
- Las pruebas automatizadas de integridad quedan diferidas como deuda técnica.

### Fase 3: UI

- Reemplazar mocks de `CreditCardStatementList`.
- Incorporar paginación.
- Crear los diálogos separados de edición del resumen y gestión de pagos.
- Mostrar dos bloques visuales: detalle del resumen y sugerencias.
- Ordenar cada bloque por fecha efectiva.
- Implementar selección y edición de cargos.
- Incorporar loading, error y empty states.

### Fase 4: Iteración 4 - Pagos

La siguiente etapa comprende backend y frontend para administrar pagos asociados a un resumen.

Frontend — implementación pendiente:

- Actualizar los DTOs del listado para recibir `totals.currencySummaries` y `payment` nullable.
- Reemplazar la tarjeta actual por una tarjeta con totales genéricos, estado parcial y acciones independientes.
- Crear el diálogo responsive de `Gestionar pagos`.
- Construir en frontend la tabla cronológica uniendo cuotas y cargos.
- Implementar filas locales de pago por moneda y guardado bulk.
- Implementar navegación entre edición y gestión con confirmación de descarte.
- Implementar validaciones de fechas, importes y filas parcialmente completas.
- Mantener las cachés de resúmenes, tarjetas, cuentas, actividades y dashboard sincronizadas.

Backend — estado actual:

- [x] Agregar `TransactionSourceType.CreditCardStatementPayment`.
- [x] Crear la transacción con `Transaction.CreateAsCreditCardStatementPayment(accountId, amount, effectiveDate)`: debe ser un gasto sin categoría y con `Description = null`.
- [x] Crear, consultar, actualizar y eliminar pagos mediante el contrato bulk.
- [x] Asociar cada pago a una transacción y a un resumen.
- [x] Usar `amount` para el importe real debitado de la cuenta. La moneda real surge de `Account.CurrencyCode`.
- [x] Usar `CoveredCurrencyCode` para indicar la moneda del resumen que el usuario declara cubrir.
- [x] Validar `ClosingDate < PaymentDate <= Today(UtcNow)`.
- [x] Mantener las invariantes propias de la transacción en su factory y validar la relación con el cierre en la operación de pagos.
- [x] Permitir una cuenta en una moneda distinta de la moneda cubierta, sin realizar conversiones.
- [x] Garantizar un solo pago por resumen y moneda cubierta.
- [x] Garantizar que una transacción no se reutilice en otro pago.
- [x] Implementar los estados `Closed`, `PartiallyPaid` y `Paid`.
- [x] Recalcular el estado según las monedas cubiertas, no según igualdad de importes.
- [x] Devolver `currencySummaries` en el detalle, con el monto real del pago mediante `MoneyDTO`.
- [x] Crear el índice único de `CreditCardStatementPayment.TransactionId`.
- [ ] Rechazar la actualización de un resumen `PartiallyPaid` o `Paid` mientras tenga pagos asociados.

El listado paginado debe devolver también `currencySummaries` con el pago nullable para cada moneda.

#### Decisiones adoptadas del modelo de dominio

- `CreditCardStatementPayment` crea su transacción en el constructor y la actualiza reutilizando `Transaction.Update` con los valores propios de un pago.
- `CreditCardStatement` mantiene la transición de estado mediante datos mínimos calculados por la operación.
- La operación bulk carga primero el resumen y luego sus pagos con sus transacciones; las monedas de cuotas y cargos se consultan mediante proyecciones mínimas.
- Al eliminar un pago se elimina la asociación y se aplica soft delete a su transacción.
- La solución preserva las invariantes del modelo y evita cargar compras y suscripciones completas solo para calcular el estado.

Frontend:

- [ ] Mostrar pagos asociados dentro del contexto del resumen.
- [ ] Crear, editar, consultar y eliminar pagos sin reutilizar el modal de transacciones manuales.
- [ ] Mostrar cuenta, fecha, importe, moneda de la cuenta y moneda cubierta.
- [ ] Mostrar totales de items por moneda y pagos destinados a cada moneda.
- [ ] Mantener explícita la ausencia de conversión automática.
- [ ] Mostrar una tabla cronológica de cuotas y cargos, con columnas dinámicas por moneda.
- [ ] Mostrar acciones independientes `Editar resumen` y `Gestionar pagos` en cada tarjeta.
- [ ] Bloquear `Editar resumen` cuando el resumen tenga pagos y ofrecer acceso a `Gestionar pagos`.
- [ ] Mantener un borrador local y guardar pagos mediante una única mutación bulk.
- [ ] Implementar confirmación al descartar cambios al cambiar entre ambos diálogos.
- [ ] Implementar loading, errores, validaciones locales y preservación del borrador ante errores.

La gestión de pagos se abre en un diálogo amplio y responsive separado del diálogo de edición del
resumen. No se permite un modal de pagos encima del formulario de resumen.

### Contrato de consulta de pagos

```text
GET /CreditCardStatements/{statementId}/payments
```

La respuesta es un array de pagos con:

```text
id
transactionId
account
amount
effectiveDate
coveredCurrencyCode
```

### Contrato de persistencia de pagos

```text
PUT /CreditCardStatements/{statementId}/payments
```

El endpoint recibe el conjunto final de pagos y sincroniza la colección:

- Pago sin `id`: crea la transacción y la relación con el resumen.
- Pago con `id`: actualiza el pago y su transacción.
- Pago existente ausente: elimina la relación y aplica soft delete a su transacción.

No se propone un endpoint separado por cada pago.

Body conceptual:

```json
{
  "payments": [
    {
      "id": 12,
      "accountId": 3,
      "amount": 50000,
      "effectiveDate": "2026-10-05",
      "coveredCurrencyCode": "ARS"
    },
    {
      "id": null,
      "accountId": 3,
      "amount": 40000,
      "effectiveDate": "2026-10-05",
      "coveredCurrencyCode": "USD"
    }
  ]
}
```

`coveredCurrencyCode` debe validarse con `CurrencyValidations()` y además debe existir entre las monedas de los items incluidos en el resumen. Sólo puede existir un pago por moneda cubierta.

### Eliminación de pagos y resúmenes

Al eliminar un pago, también se elimina mediante soft delete la transacción creada para ese pago.

Al eliminar un resumen pago:

1. Se desvinculan sus cuotas.
2. Se eliminan sus cargos.
3. Se eliminan las relaciones de pagos.
4. Se aplica soft delete a las transacciones de pago.
5. Se aplica soft delete al resumen.

El usuario sólo puede modificar items y datos del resumen cuando éste está `Closed`. Los resúmenes
`PartiallyPaid` y `Paid` deben desbloquearse eliminando primero todos sus pagos mediante la
operación bulk. La UI debe comunicar la restricción y ofrecer acceso a `Gestionar pagos`; el backend
aplica la misma regla como protección definitiva.

## No olvidar

### Totales pagados en el listado de resúmenes

**Decisión adoptada:** el listado paginado reutiliza `totals.currencySummaries` en cada resumen.
Cada moneda muestra el importe incluido y, sólo cuando existe, una línea con el importe y la
moneda real del pago. La moneda de la tarjeta aparece primero y las demás se ordenan por código.
No se calcula ni se muestra una diferencia monetaria.

### Fase 5: Mejoras de integridad

- Protección contra condiciones de carrera en asignación de cuotas.
- Pruebas automatizadas de integridad, concurrencia y eliminación.
- Ajustes derivados de esas pruebas y del comportamiento de soft delete.

Las mejoras de concurrencia y las pruebas automatizadas no bloquean el avance hacia la Iteración 4, pero deben retomarse antes de considerar cerrado el módulo de resúmenes.

## 14. Decisiones abiertas

- Definir el comportamiento para fechas como `31` en meses que no tienen día 31.
- Definir cómo se calcula un cargo mensual cuando la fecha efectiva cae en un día inexistente de un mes posterior.
- Definir la redacción final de los mensajes de advertencia y confirmación, manteniendo el impacto funcional ya definido.

## 15. Criterios para comenzar la implementación

- Contratos de listado, detalle y sugerencias aprobados.
- Regla estricta `ItemDate < ClosingDate` aprobada.
- Cálculo mensual de cargos aprobado.
- Comportamiento de cargos faltantes aprobado.
- Eliminación de cargos y desvinculación de cuotas definida.
- Edición de resúmenes `Closed` confirmada; los estados `PartiallyPaid` y `Paid` requieren eliminar primero todos los pagos.
- Totales por moneda definidos.
- Pagos mantenidos fuera del flujo de creación y edición de items, pero contemplados en el contrato de detalle y en la Iteración 4.
- Gestión de pagos independiente del diálogo de edición, con edición local y persistencia bulk.
- Tabla cronológica de items y representación responsive definida.
- Totales pagados incluidos en el listado sin calcular diferencias entre monedas.
