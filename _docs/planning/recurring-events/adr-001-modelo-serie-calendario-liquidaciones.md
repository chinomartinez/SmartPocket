# ADR-001 — Modelo de eventos recurrentes: serie, calendario derivado y liquidaciones

- **Estado:** Propuesto (pendiente de confirmación)
- **Fecha:** 2026-11-02
- **Contexto:** Fase 3.5 del roadmap (FR24–FR30, FR33). El backend es .NET 10 sobre SQLite, sin scheduler ni worker, y la app es online-only. El usuario necesita ver el próximo vencimiento, saber qué ocurrencias ya pasó y pagarlas (eventualmente tarde), y conservar el historial de qué se pagó y qué no.

## Decisión

Modelar el módulo con **tres conceptos**:

1. **Serie** (`RecurringEvent`): la regla. Cuenta, categoría, tipo (ingreso/gasto), monto planificado, descripción, patrón de recurrencia (frecuencia, intervalo, días de la semana y días del mes) y fin opcional. Ver ADR-003.
2. **Ocurrencia**: **no se persiste**. Se calcula a partir del primer vencimiento y el patrón de recurrencia. Su identidad es `(serie, fecha de vencimiento)`.
3. **Liquidación** (`RecurringEventSettlement`): lo único que se persiste por ocurrencia, y solo cuando el usuario actúa. Puede ser **pago** (con transacción asociada) u **omisión** (sin transacción).

El estado de cada ocurrencia se **deriva**: pagada si tiene liquidación de pago, omitida si tiene liquidación de omisión, vencida si su fecha pasó sin liquidación, próxima si su fecha es hoy o futura.

## Por qué

- **El historial de impagos es gratis y no se puede desincronizar.** Si los pagos son la fuente de verdad, cualquier ocurrencia sin pago es un impago. No hace falta una tabla de ocurrencias ni un proceso que las cree.
- **Elimina el problema de "generación automática".** No hay job, no hay catch-up, no hay riesgo de duplicados: la ocurrencia aparece al abrir la app porque se calcula. Ver ADR-002.
- **Soporta pagos tardíos sin ambigüedad.** La liquidación guarda qué vencimiento cubre, no la fecha en que se pagó. Pagar el 16/10 el 02/11 deja el historial correcto.
- **Evita filas huérfanas y migraciones de datos.** Cambiar una frecuencia no reescribe historial: las liquidaciones ya tomadas no dependen del calendario.
- **Encaja con el precedente del módulo de tarjetas**: regla + hijos derivados/generados, sin `DbSet` propio y con soft delete por interceptor.

## Consecuencias

**Positivas**

- Un solo agregado editable (la serie) y un ledger chico (las liquidaciones).
- El calendario es determinístico y testeable como función pura.
- Menos tablas, menos invariantes, menos estados imposibles.

**Negativas / costos aceptados**

- **No se puede editar una ocurrencia futura antes de pagarla.** Solo se puede cambiar el monto al pagar u omitirla. Si el producto necesita "editar solo este vencimiento", hay que persistir ocurrencias (ver alternativas).
- **Cambiar la forma del calendario después de liquidar es inviable.** Frecuencia, intervalo, días de la semana, días del mes, primer vencimiento y tipo quedan bloqueados una vez que existe una liquidación; para cambiarlos hay que cancelar y crear otra serie.
- **Ordenar y paginar por próxima ocurrencia no se puede hacer en SQL.** Se resuelve en memoria sobre las series activas (igual que `CreditCardActivities`). Es aceptable para decenas de series; si el volumen crece, se denormaliza `NextDueDate`.
- El roadmap dice "generación automática de entradas recurrentes" (FR27) y este modelo no genera entradas: las proyecta. Requiere actualizar la redacción (ADR-002).

## Alternativas descartadas

**A. Serie + ocurrencias persistidas con catch-up al consultar.** Cada vencimiento sería una fila con estado `Pending/Paid/Skipped`, y al leer se materializarían los faltantes de forma idempotente. Permite editar un vencimiento puntual antes de pagarlo, pero agrega una segunda entidad, índices únicos, lógica de catch-up, limpieza de ocurrencias huérfanas al editar el calendario y un estado más que puede quedar inconsistente. No compensa para el MVP.

**B. Una fila por pago (cadena).** Lo que propone `mvp-requirements.md` §E. Al marcar pagado se crea la siguiente fila. Es el modelo más simple, pero si una ocurrencia no se paga la cadena se corta, no hay pronóstico y el historial se mezcla con el calendario.

**C. Solo la próxima fecha.** Guardar únicamente `NextDueDate` en la serie. Es suficiente para el dashboard, pero no permite mostrar el historial de vencimientos ni detectar impagos.

## Notas de implementación

- El calendario se calcula en el dominio (`RecurrenceCalendar` o similar) como función pura y se testea con casos de fin de mes, año bisiesto y fin de serie.
- La lista de Próximos devuelve **ocurrencias**, no series: cada fila es `(serie, vencimiento, estado)`. El detalle de la serie muestra la serie completa y su historial.
- El dashboard muestra **como máximo una ocurrencia por serie**: la próxima sin liquidar (que puede estar vencida), con un contador de vencidas si hay más.
- Las transacciones creadas al pagar usan un origen propio (`RecurringEvent`) y no se pueden editar ni eliminar desde Transacciones.
