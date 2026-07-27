# Smart Pocket — Tarjeta de crédito: diseño funcional

## 1. Entidades

### CreditCard
- Nombre, día de cierre y vencimiento (sugerencia, no automatismo), icono/color, límite.
- Crear, actualizar, eliminar (soft delete).
- Soft delete de la tarjeta oculta en cascada sus compras/subscripciones y cuotas.

### CreditCardPurchase (compra o subscripción)
- Campos comunes: categoría, moneda (propia, no hereda de la tarjeta — pueden convivir ARS/USD en la misma tarjeta), descripción, fecha efectiva, monto total, fecha de pago, fecha de cancelación (esta última solo aplica a subscripciones).
- Reglas de actualización:
  - No editable si está pagada, finalizada o cancelada.
  - No se puede cambiar de tarjeta si ya tiene cuotas en algún resumen.
  - No se puede cambiar el tipo (compra ↔ subscripción) si está relacionada a un resumen.
  - No se pueden reducir cuotas si alguna ya está en un resumen.
- **Generación de cuotas/pagos:**
  - Compra en cuotas: todas las cuotas se generan de una sola vez al crear la compra, monto fijo (`total / N`), todas con `statement_id = null`.
  - Subscripción: el pago del mes se genera recién al armar el preview del resumen que lo incluye (porque el monto varía).

### CreditCardInstallment (cuota o pago)
- Número, monto, relación opcional a un resumen (`statement_id` nullable).
- **Sin estados propios.** Solo es binaria: está en un resumen o no (`statement_id` seteado o `null`). No tiene flags de "vencida" ni "salteada" — todo eso se resuelve a nivel compra (ver estados de compra) o por cálculo de fechas (pool).

### CreditCardStatement (resumen)
- Contenedor de cuotas/pagos.
- Estado: cerrado (sin pagar) / pagado.
- Fechas de cierre y pago.
- Se vincula a una o más transacciones de pago (moneda corriente y/o dólar) — puede haber más de una transacción por resumen (multi-moneda).
- **No se guarda "preview".** El preview es una consulta calculada al vuelo (pool + rango de fechas); el `CreditCardStatement` recién se crea cuando el usuario confirma qué cuotas/pagos incluye. Si no confirma, no queda rastro.
- Visualización del total con tres columnas: total de cuotas/pagos incluidos, total realmente pagado (según transacciones asociadas), y diferencia entre ambos (sin persistir un campo `ajuste` — se deriva en el momento).

## 2. El pool de items (mecanismo central)

En vez de generar resúmenes por automatismo secuencial, existe un **pool** de todo lo que tiene `statement_id = null` y pertenece a una compra en estado activo (no finalizada ni cancelada). El preview de un resumen nuevo se arma contra ese pool, no contra "el resumen anterior".

**Cálculo del rango:** el día de cierre sugerido de la tarjeta es solo un valor de arranque. Al generar un resumen, el usuario confirma/ajusta la **fecha de cierre real de ese resumen puntual** (porque varía mes a mes y no siempre coincide con el sugerido). El rango se calcula siempre contra esa fecha confirmada: `[fecha_cierre_elegida - 1 mes, fecha_cierre_elegida]`. No se usa la fecha de solicitud del preview (cuándo el usuario abre la app) ni la fecha del último resumen generado — así el cálculo no se corre si el usuario genera el resumen unos días tarde, y absorbe la variabilidad real del cierre mes a mes.

El preview muestra dos grupos:
- **Sugeridos**: cuotas/pagos con fecha efectiva dentro del rango calculado. Vienen tildados por defecto.
- **Atrasados**: cualquier ítem del pool con fecha efectiva anterior al rango (quedó suelto de meses previos). Sin tildar, con indicador visual de atraso. Se muestra la fecha efectiva original de cada ítem (no la fecha del resumen) para no perder de vista cuándo se originó el gasto real.

El usuario tilda/destilda libremente antes de confirmar:
- Destildar una cuota sugerida = queda en el pool, disponible para el próximo preview (equivalente a "saltear", sin necesidad de flag).
- Tildar una atrasada = incluirla en este resumen aunque sea de un mes anterior.

Esto permite también **crear resúmenes con fecha pasada** (ej. "resumen de agosto" armado en octubre) sin funcionalidad aparte: es el mismo preview, con otra fecha de cierre como input. Los resúmenes se listan/ordenan por fecha de cierre, no por fecha de creación.

## 3. Ciclo de vida del resumen

- **Preview (no persiste):** cálculo al vuelo, todo editable, no existe como registro hasta confirmar.
- **Cerrado sin pagar:** se puede editar o borrar libremente (no hay plata comprometida). Al borrarlo, sus cuotas vuelven automáticamente a `statement_id = null` (vuelven al pool).
- **Pagado:** vinculado a una o más transacciones.
  - Edición limitada a: monto del pago de una subscripción individual, y datos de la transacción asociada (monto, fecha, moneda). No se puede tocar qué cuotas pertenecen al resumen.
  - Se puede borrar (con alerta explícita), incluyendo las transacciones adheridas. Al borrar, las cuotas también vuelven al pool.

## 4. Estados de CreditCardPurchase

Los estados se calculan / setean a nivel **compra completa**, nunca por cuota individual. Son estados distintos entre sí, sin agrupación en el listado general — cada uno con su propio filtro/badge.

### Compra en cuotas
- **En proceso**: quedan cuotas sueltas (`statement_id = null`) sin resolver.
- **Pagado**: el 100% de las cuotas está incluido en resúmenes pagados. Se calcula solo, nunca se marca a mano.
- **Finalizado**: el usuario decide manualmente cortar camino — da por perdidas todas las cuotas sueltas restantes de una sola vez (todo o nada, no granular por cuota). Deja de aparecer en el pool. Si el usuario quiere granularidad, la ejerce registrando pagos a su ritmo, no marcando cuotas individuales.

### Subscripción
- **En proceso (activa)**: sigue generando pagos mes a mes mientras entre en el rango del pool.
- **Cancelada**: tiene `fecha_cancelacion` seteada. Deja de generar pagos nuevos a partir de esa fecha. No existe "pagado" ni "finalizado" para subs — el único cierre posible es la cancelación (no hay total contable contra el cual medir progreso, a diferencia de una compra en cuotas).

## 5. Pendiente / a definir

- Colores/badges concretos para distinguir visualmente en proceso / pagado / finalizado / cancelado en el listado general.
