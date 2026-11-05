# SmartPocket — Eventos financieros recurrentes: diseño funcional

**Fase:** 3.5 del roadmap · **FRs:** 24–30 y 33 · **Estado:** propuesto, pendiente de confirmación
**Decisiones de arquitectura:** [ADR-0001](../../adr/0001-modelo-serie-calendario-liquidaciones.md) · [ADR-0002](../../adr/0002-fr27-sin-scheduler.md) · [ADR-0003](../../adr/0003-modelo-de-recurrencia.md) · [Glosario](../../../GLOSSARY.md#eventos-recurrentes)

---

## 1. Objetivo y alcance

El usuario puede planificar pagos e ingresos recurrentes o de una sola vez (alquiler, sueldo, servicios, suscripciones, una patente), ver el próximo vencimiento y el historial de qué pagó y qué no, y registrar el pago real cuando ocurre —a tiempo o tarde— sin perder trazabilidad.

**Entra en el MVP**

- Crear, editar, cancelar y eliminar series de ingresos y gastos.
- Frecuencias única, diaria, semanal, mensual y anual, con intervalo "cada N", días de la semana para las semanales y días del mes para las mensuales.
- Fin opcional: por fecha o por cantidad de ocurrencias.
- Lista de próximos vencimientos con estados derivados (pagada, vencida, próxima, omitida).
- Pago de una ocurrencia con monto y fecha editables; crea la transacción real.
- Omisión de una ocurrencia (no se pagó y no se va a pagar).
- Deshacer un pago o una omisión.
- Detalle de la serie con historial completo.
- Widget de próximos en el dashboard.

**Fuera de alcance (MVP)**

- Pagos automáticos o débitos (no hay sync bancario; ver ADR-0002).
- Recordatorios por mail, push o notificaciones.
- Pausa temporal: se resuelve cancelando y creando otra serie.
- Editar una ocurrencia futura antes de pagarla.
- Balance proyectado o "cuánto te va a quedar" después de pagar.
- Conversión entre monedas.
- Series compartidas entre cuentas.

---

## 2. Modelo conceptual

| Concepto | Qué es | Se persiste |
|---|---|---|
| **Serie** | La regla: cuenta, categoría, tipo, monto planificado, descripción, frecuencia, primer vencimiento y fin. | Sí |
| **Ocurrencia** | Una fecha del calendario de la serie. Su identidad es `(serie, fecha de vencimiento)`. | No |
| **Liquidación** | La decisión del usuario sobre una ocurrencia: pagarla (con transacción) u omitirla (sin transacción). | Sí |
| **Transacción** | El movimiento real que impacta el balance de la cuenta. | Sí |

La UI habla de **"próximos"** y **"vencimientos"**; el código habla de `RecurringEvent`, `DueDate` y `Settlement`. El glosario fija la correspondencia.

### 2.1 Serie

| Campo | Regla |
|---|---|
| Cuenta | Obligatoria. Define la moneda; no hay campo de moneda propio. |
| Categoría | Obligatoria. Es la que hereda la transacción al pagar. |
| Tipo | Ingreso o gasto (`IsIncome`). Define el signo de la transacción. |
| Descripción | Obligatoria (ej.: "Peluquería"). |
| Monto planificado | Mayor a cero. Es el valor sugerido al pagar, no un compromiso. |
| Frecuencia | Única, diaria, semanal, mensual o anual. |
| Intervalo | Cada N períodos (`N >= 1`, por defecto 1). No aplica a única. |
| Primer vencimiento | Primera ocurrencia. Es la referencia del patrón y debe pertenecer a él. Puede ser pasado o futuro. |
| Días de la semana | Solo semanal. Uno o más días; la UI preselecciona el del primer vencimiento. |
| Días del mes | Solo mensual. Uno o más días (1-31); la UI preselecciona el del primer vencimiento. |
| Fin | Nunca, hasta una fecha, o una cantidad de ocurrencias. Excluyentes. No aplica a única. |
| Cancelación | Fecha desde la que deja de proyectar. Conserva historial. |

### 2.2 Liquidación

| Campo | Regla |
|---|---|
| Serie + fecha de vencimiento | Únicos. Una ocurrencia se liquida una sola vez. |
| Tipo | Pago u omisión. |
| Transacción | Obligatoria si es pago; nula si es omisión. |
| Fecha de resolución | La del registro (auditoría). |

El **monto pagado** y la **fecha de pago** viven en la transacción, no en la liquidación. La liquidación solo dice *qué ocurrencia* se resolvió y *cómo*.

---

## 3. El patrón de recurrencia

Una serie combina **frecuencia**, **intervalo**, **primer vencimiento**, **días de la semana** (semanal) y **días del mes** (mensual). El cálculo vive en una función pura del dominio y se prueba con fin de mes, año bisiesto, semanas que cruzan meses y días que colapsan al ajustarse.

- **Única:** una sola ocurrencia, el primer vencimiento. Sin intervalo, días ni fin.
- **Diaria:** primer vencimiento + `n × intervalo` días.
- **Semanal:** semanas de lunes a domingo desde el primer vencimiento, avanzando `intervalo` semanas; una ocurrencia por cada día elegido, siempre `>=` primer vencimiento. Ej.: primer vencimiento lunes 16/11, días [lun, mié, vie], intervalo 2 → `16, 18 y 20/11`; `30/11, 02 y 04/12`; …
- **Mensual:** meses del primer vencimiento, avanzando `intervalo` meses; por cada mes, una ocurrencia por cada día elegido. Si un día no existe, se ajusta al último (`31/01 → 28/02 → 31/03`); si dos días colapsan (`[30, 31]` en febrero), se genera una sola ocurrencia el `28/02`. `[31]` equivale al último día de cada mes.
- **Anual:** se avanza `intervalo` años conservando mes y día. `29/02` cae el `28/02` en años no bisiestos y vuelve al `29/02` en bisiestos.

**Casos que cubre:** pago único; mensual el 16; los 1 y 15; cada 3 meses; último día del mes; cada 2 semanas el lunes; lunes-miércoles-viernes; lunes a viernes; cada 2 semanas de lunes a miércoles; anual el 16/11; cada 10 días.

**Casos que no cubre:** "segundo martes del mes", semanas del mes, ajuste a día hábil y `RRULE` completo. Ver [ADR-0003](../../adr/0003-modelo-de-recurrencia.md).

El calendario termina en la primera de estas condiciones: se alcanzó la cantidad de ocurrencias, se superó la fecha de fin, o se superó la fecha de cancelación.

**Límites:** el primer vencimiento no puede ser anterior a 12 meses (provisional). Con el horizonte de la vista (hoy + 90 días), la proyección más grande posible —una serie diaria— ronda las 455 ocurrencias.

**Ejemplos.** "Peluquería", mensual, días [16], primer vencimiento 16/08/2026, sin fin, cancelada el 20/01/2027: `16/08, 16/09, 16/10, 16/11, 16/12, 16/01`. "Patente", única, 15/12/2026: `15/12`.

> El calendario siempre arranca en el primer vencimiento elegido. Si querés ver el 16/11 como próximo pago, el primer vencimiento de esa serie es un 16.

---

## 4. Estados de una ocurrencia

Todos son **derivados**; ninguno se guarda como columna.

| Estado | Condición | Color |
|---|---|---|
| **Pagada** | Tiene liquidación de pago. | Verde |
| **Omitida** | Tiene liquidación de omisión. | Gris |
| **Vencida** | Fecha < hoy, sin liquidación, dentro del calendario. | Rojo |
| **Para hoy** | Fecha = hoy, sin liquidación. | Ámbar |
| **Próxima** | Fecha > hoy, sin liquidación, dentro del calendario. | Azul/slate |
| **Cancelada** | La serie se canceló y la ocurrencia es posterior a la cancelación: no se muestra. | — |

La **próxima ocurrencia** de una serie es la más antigua sin liquidar dentro del calendario. Si está en el pasado, la serie está vencida.

---

## 5. Flujos

### 5.1 Crear una serie

1. El usuario elige tipo, descripción, cuenta, categoría, monto planificado, frecuencia, intervalo, días de la semana (si es semanal), días del mes (si es mensual), primer vencimiento y fin.
2. La UI muestra un preview con las próximas 3 ocurrencias ("16/11, 16/12, 16/01"); para una serie única, la fecha y nada más.
3. Si el primer vencimiento es pasado, la UI avisa cuántos vencimientos quedarán impagos ("Se crearán 3 vencimientos vencidos"). No se crea ninguna transacción.
4. Se guarda la serie. Aparece en Próximos y, si corresponde, en el dashboard.

### 5.2 Listar próximos

- Una fila por **ocurrencia**, ordenada por fecha ascendente: primero las vencidas.
- Cada fila muestra: ícono y color de la categoría, descripción, cuenta, fecha, monto (planificado si no está pagada; real si lo está), estado y días restantes.
- Filtros: búsqueda por descripción, tipo (todos/ingresos/gastos), estado (todos/pendientes/vencidos/liquidados), cuenta, categoría y un toggle "incluir series canceladas".
- Las series canceladas o completadas sin vencimientos pendientes solo aparecen con ese toggle activo, usando su última ocurrencia como fila de referencia y la marca "Serie cancelada".
- Por defecto: ocurrencias no liquidadas hasta **hoy + 90 días**, más todas las vencidas de series activas. Si una serie no tiene ninguna ocurrencia en ese rango, se muestra igual su próxima ocurrencia.
- Acción principal por fila: **Pagar**. Menú secundario: **Omitir este vencimiento**, **Ver serie**.
- Estado vacío: "No tenés pagos ni ingresos programados".

### 5.3 Ver el detalle de una serie

Muestra:

- Encabezado: ícono, descripción, tipo, cuenta, categoría, monto planificado, frecuencia ("Mensual, días 1 y 15", "Semanal, lunes y miércoles", "Única vez"), primer vencimiento, fin y estado (activa/cancelada/completada).
- **Próximo vencimiento** con su estado y acción Pagar.
- **Vencidas pendientes**, si hay: lista con acción Pagar u Omitir.
- **Historial**: liquidaciones ordenadas de más reciente a más antigua, con fecha de vencimiento, estado, fecha de pago, monto real y acceso a la transacción.
- Acciones: Editar, Cancelar serie, Eliminar serie.
- Si la cuenta o la categoría fueron eliminadas: aviso "La cuenta/categoría de esta serie ya no existe" y la serie no se proyecta.

### 5.4 Editar una serie

- **Siempre editable:** descripción, monto planificado, cuenta, categoría y fin (fecha o cantidad).
- **Editable solo si no hay liquidaciones:** frecuencia, intervalo, días de la semana, días del mes, primer vencimiento y tipo. Si ya hay historial, la UI explica que hay que cancelar y crear una serie nueva.
- Cambiar el monto planificado afecta a los vencimientos **no liquidados** (se muestran como monto estimado). Los pagados conservan su monto real.
- Cambiar cuenta o categoría solo afecta a los vencimientos no liquidados; las transacciones ya creadas conservan la cuenta y la categoría originales.
- El fin no puede excluir una ocurrencia ya liquidada.
- Una serie "Única vez" liquidada queda **completada**: no proyecta más ocurrencias y solo se ve con el toggle de canceladas/completadas.

### 5.5 Marcar como pagado

1. El usuario elige una ocurrencia (por defecto, la próxima).
2. Se abre un diálogo con: vencimiento (solo lectura), **monto** (precargado con el planificado, editable), **fecha de pago** (por defecto hoy, no futura) y resumen de cuenta/categoría/descripción.
3. Al confirmar se crea, en una sola operación:
   - la **transacción** (cuenta, categoría, tipo y descripción de la serie; origen "pago recurrente"; fecha = fecha de pago; monto = monto ingresado);
   - la **liquidación** que vincula esa transacción con el vencimiento.
4. La ocurrencia pasa a Pagada y el próximo vencimiento avanza. El calendario **no se realinea**: las ocurrencias impagas anteriores siguen visibles.
5. Se invalidan las cachés de próximos, transacciones, cuentas y dashboard.

### 5.6 Omitir un vencimiento

- Pide confirmación: "¿Omitir el vencimiento del 16/10? No se creará ninguna transacción."
- Crea una liquidación de omisión. La ocurrencia queda como Omitida y deja de contar como vencida.
- No afecta balances.

### 5.7 Deshacer un pago o una omisión

- **Deshacer pago:** elimina la transacción asociada (soft delete) y la liquidación. La ocurrencia vuelve a estar vencida o próxima.
- **Deshacer omisión:** elimina la liquidación. La ocurrencia vuelve a su estado derivado.
- Pide confirmación explícita porque el pago impactó balances.

### 5.8 Cancelar una serie

- Fija la cancelación en la fecha de hoy. No se proyectan ocurrencias posteriores.
- Las ocurrencias anteriores sin liquidar siguen visibles como vencidas y se pueden pagar u omitir.
- La serie deja de aparecer en Próximos y en el dashboard; sigue accesible desde el filtro "Canceladas" y conserva su historial.

### 5.9 Eliminar una serie

- Soft delete de la serie, con confirmación explícita.
- Sus liquidaciones dejan de mostrarse y el historial de la serie desaparece.
- **Las transacciones ya creadas se conservan**: son movimientos reales que afectaron balances. Siguen visibles en Transacciones con origen "pago recurrente".

---

## 6. Reglas de negocio

| # | Regla |
|---|---|
| RN-01 | La cuenta y la categoría son obligatorias y deben existir al crear y al editar. |
| RN-02 | El monto planificado debe ser mayor a cero. |
| RN-03 | El primer vencimiento puede ser pasado o futuro; al crear o al cambiar la fecha, no puede ser anterior a 12 meses (límite provisional). |
| RN-04 | El intervalo es un entero mayor o igual a 1. No aplica a la frecuencia única. |
| RN-05 | El fin es excluyente: fecha o cantidad, nunca ambas. No aplica a la frecuencia única. |
| RN-06 | La fecha de fin no puede ser anterior al primer vencimiento; la cantidad no puede ser menor a 1. |
| RN-07 | Solo se puede liquidar una ocurrencia que pertenezca al calendario de la serie. |
| RN-08 | Una ocurrencia admite una única liquidación. |
| RN-09 | La fecha de pago no puede ser futura. Puede ser anterior al primer vencimiento si el usuario pagó adelantado. |
| RN-10 | El monto pagado debe ser mayor a cero y no modifica el monto planificado. |
| RN-11 | Pagar una ocurrencia no adelanta, atrasa ni saltea las demás. |
| RN-12 | La transacción hereda cuenta, categoría, tipo y descripción de la serie. |
| RN-13 | Las transacciones de origen recurrente no se editan ni eliminan desde Transacciones; se deshacen desde la serie. |
| RN-14 | Omitir no crea transacción ni afecta balances. |
| RN-15 | Con al menos una liquidación, frecuencia, intervalo, días de la semana, días del mes, primer vencimiento y tipo quedan bloqueados. |
| RN-16 | El fin no puede dejar fuera una ocurrencia ya liquidada. |
| RN-17 | Una serie cancelada no proyecta ocurrencias posteriores a la cancelación ni permite liquidarlas. |
| RN-18 | Una ocurrencia vencida sin liquidación se muestra como Vencida; no se omite automáticamente. |
| RN-19 | Eliminar una serie no elimina las transacciones ya creadas. |
| RN-20 | Si la cuenta o la categoría se eliminan, la serie deja de proyectarse y se marca como inactiva. |
| RN-21 | El dashboard muestra como máximo una ocurrencia por serie (la próxima sin liquidar) e indica cuántas vencidas tiene. |
| RN-22 | Las series canceladas o eliminadas no aparecen en Próximos ni en el dashboard. |
| RN-23 | En frecuencia semanal se elige al menos un día y el primer vencimiento debe caer en uno de los días elegidos. |
| RN-24 | La lista de Próximos muestra las ocurrencias no liquidadas hasta hoy + 90 días, más todas las vencidas; si una serie no tiene ninguna en ese rango, se muestra su próxima ocurrencia. |
| RN-25 | En frecuencia mensual se elige al menos un día del mes y el primer vencimiento debe caer en uno de ellos. Los días que no existen se ajustan al último del mes y los que colapsan se deduplican. |
| RN-26 | La frecuencia única genera exactamente una ocurrencia y no admite intervalo, días ni fin. |

---

## 7. UI

### 7.1 Página "Próximos"

- Ruta propia y entrada en el sidebar (ícono de calendario/reloj), entre Transferencias y Cuentas.
- Layout maestro-detalle: lista a la izquierda, detalle de la serie seleccionada a la derecha en desktop; en mobile, la lista y un panel deslizante.
- Header: "Próximos pagos e ingresos" + botón "Nuevo".
- Reutiliza: `Card`, `Badge`, `Select`, `Input`, `Button`, `DeleteConfirmationDialog`, `ConfirmActionDialog`, `ErrorAlert`, `IconBox`, `Skeleton`.

### 7.2 Formulario de serie

- Tipo como selector segmentado (Ingreso / Gasto).
- Descripción, cuenta, categoría, monto planificado.
- Frecuencia (Única vez / Diaria / Semanal / Mensual / Anual) + "Cada N" (oculto en única).
- Días de la semana (semanal): siete toggles `L M X J V S D`, con el día del primer vencimiento preseleccionado.
- Días del mes (mensual): grilla del 1 al 31, con el día del primer vencimiento preseleccionado.
- Primer vencimiento.
- Fin: "Nunca" / "Hasta una fecha" / "Después de N veces" (oculto en única).
- Preview en vivo de las próximas 3 ocurrencias y, si el primer vencimiento es pasado, de los vencimientos impagos que se crearán.
- Si el primer vencimiento no cae en un día elegido (semanal o mensual), el formulario muestra el error en línea y no deja guardar.
- Validación con Zod; errores de API a nivel de campo con `useFormErrorHandler`.

### 7.3 Diálogo de pago

- Vencimiento (solo lectura), monto editable, fecha de pago, resumen de cuenta/categoría/descripción.
- Botón "Registrar pago"; estado pendiente y errores con `ErrorAlert`.

### 7.4 Widget del dashboard

- Título "Próximos", hasta 5 filas, una por serie: ícono, descripción, fecha relativa ("Vence en 3 días", "Vencido hace 2 días"), monto y estado.
- Badge con la cantidad de vencidas de la serie si tiene más de una.
- Acción rápida "Pagar" que abre el mismo diálogo; "Ver todo" navega a la página.
- Reemplaza por completo `upcomingPayments/mockData.ts`.
- Estados de carga (skeleton), vacío y error.

---

## 8. Impacto en datos existentes

- **Nuevo origen de transacción** `RecurringEvent`. Requiere agregar el valor al enum y su fila en la tabla de orígenes. Sin esto, la transacción no se puede distinguir de una carga manual ni se puede impedir su edición/eliminación.
- **La transacción recurrente sí lleva categoría.** Hoy `Transaction.Update` solo permite categoría para `ManualEntry`; hay que habilitarla también para `RecurringEvent`, porque el análisis por categoría del dashboard depende de eso.
- **No se toca el cálculo de balances**: los pagos son transacciones normales.
- **Invalidación de caché** al pagar, omitir, deshacer, cancelar o eliminar: `recurring-events`, `transactions`, `accounts` y `dashboard`.

---

## 9. Casos borde

| Caso | Comportamiento |
|---|---|
| Pagar el vencimiento de diciembre en noviembre | Permitido. La fecha de pago es la de hoy (o una pasada); la ocurrencia queda pagada y la próxima avanza. |
| Pagar tres vencimientos atrasados | Se pagan de a uno. El calendario no se realinea; cada uno conserva su fecha de vencimiento. |
| El monto real difiere del planificado | Normal. Se guarda en la transacción; la serie no cambia. |
| Pago único (patente, 15/12) | Una sola ocurrencia. Al pagarla u omitirla queda completada y no proyecta más; se ve con el toggle de canceladas/completadas. |
| Serie mensual con días [31] | Último día de cada mes: `31/01 → 28/02 → 31/03`. |
| Serie mensual con días [1, 15] | Dos ocurrencias por mes, ordenadas por fecha. |
| Serie mensual con días [30, 31] en febrero | Ambos se ajustan al 28 y se genera una sola ocurrencia. |
| Primer vencimiento fuera de los días elegidos | Rechazado: el primer vencimiento debe ser uno de los días del patrón. |
| Serie anual con primer vencimiento 29/02 | `29/02/2028 → 28/02/2029 → 28/02/2030 → 29/02/2032`. |
| Serie semanal lunes-miércoles-viernes | Tres ocurrencias por semana, ordenadas por fecha. |
| Serie semanal cada 2 semanas, lunes a miércoles | `16, 17 y 18/11`; `30/11, 01 y 02/12`; … |
| "Todos los días hábiles" | Semanal cada 1 semana con días L-V. |
| Primer vencimiento hace 2 años | Rechazado: el límite es 12 meses (provisional). |
| Próximo vencimiento a 120 días | Se muestra igual: la serie siempre exhibe su próxima ocurrencia (RN-24). |
| Serie creada con primer vencimiento de hace 6 meses | Se muestran 6 vencimientos vencidos; no se crean transacciones. |
| Cambiar la frecuencia con historial | Bloqueado; se ofrece cancelar y crear una serie nueva. |
| Acortar el fin por debajo de una ocurrencia pagada | Rechazado. |
| Eliminar una serie con pagos | La serie y su historial desaparecen; las transacciones quedan. |
| Cancelar con vencimientos impagos | Se conservan como vencidos hasta pagarlos u omitirlos. |
| Cuenta o categoría eliminada | La serie no se proyecta; el detalle avisa y conserva el historial. |
| Intentar liquidar dos veces el mismo vencimiento | Rechazado por la invariante de unicidad. |
| Pagar una ocurrencia ya omitida | Rechazado; primero hay que deshacer la omisión. |
| Ingresos recurrentes | Mismo flujo; el color y el signo siguen la paleta de ingresos. |

---

## 10. Cobertura del roadmap

| FR | Cómo se cumple |
|---|---|
| FR24 | Crear series de gasto con recurrencia, incluido el pago único. |
| FR25 | Crear series de ingreso con recurrencia (misma entidad, `IsIncome`). |
| FR26 | Pagar una ocurrencia desde Próximos o desde el detalle; crea la transacción. |
| FR27 | Reinterpretado: las ocurrencias se proyectan automáticamente, no se generan transacciones (ADR-0002). Requiere ajustar la redacción del roadmap. |
| FR28 | Editar la serie con las restricciones de RN-15/RN-16. |
| FR29 | Cancelar o eliminar la serie; eliminar ocurrencias vía omisión. |
| FR30 | Lista de próximos con filtros y estados. |
| FR33 | Widget de próximos en el dashboard. |

El pago único ("Única vez") no es un FR propio: es una frecuencia más del mismo módulo.

---

## 11. Decisiones de recurrencia

Confirmado:

1. **Semanal con varios días.** Cubre lunes-miércoles-viernes, lunes a viernes y "cada 2 semanas de lunes a miércoles".
2. **Mensual con varios días del mes.** Los 1 y 15 se modelan como una sola serie con días `[1, 15]`; los días que no existen se ajustan al último y los que colapsan se deduplican.
3. **Pago único ("Única vez").** Una sola ocurrencia, sin intervalo, días ni fin.
4. **No se soporta** "segundo martes del mes", semanas del mes, ajuste a día hábil ni `RRULE`. Ver ADR-0003.
5. **Horizonte de Próximos:** hoy + 90 días, más todas las vencidas, más la próxima de cada serie que no caiga en ese rango.
6. **Límite de historial:** primer vencimiento hasta 12 meses atrás. Queda **provisional**: es el valor que hay que confirmar (la alternativa era 24 meses).
