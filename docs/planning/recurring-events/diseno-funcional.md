# SmartPocket — Transacciones recurrentes: diseño funcional

**Fase:** 3.5 del roadmap · **FRs:** 24–30 y 33 · **Estado:** actualizado al modelo de ocurrencias persistidas
**Decisiones:** [ADR-0001](../adr/0001-modelo-transacciones-recurrentes.md) · [ADR-0002](../adr/0002-disparador-job-catch-up.md) · [ADR-0003](../adr/0003-modelo-de-recurrencia.md) · [Glosario](../../../GLOSSARY.md#transacciones-recurrentes)

---

## 1. Objetivo y alcance

El usuario puede planificar pagos e ingresos recurrentes o de una sola vez, ver el próximo vencimiento, confirmar o omitir ocurrencias, conservar el historial de lo que pagó y lo que no, y editar la regla sin reescribir el pasado.

**Entra en el MVP**

- Reglas con frecuencia única, diaria, semanal, mensual o anual; intervalo "cada N"; días de la semana o del mes.
- Ocurrencias pasadas persistidas; futuro proyectado.
- Estados `Scheduled`, `Pending`, `Confirmed`, `Skipped`; gracia de 7 días.
- Confirmación manual con monto y fecha editables.
- Autoconfirmación opt-in al vencimiento.
- Omisión manual, deshacer confirmación, cancelar y eliminar reglas.
- Edición de la plantilla con congelamiento del pasado.
- Job diario + catch-up.
- Lista, detalle y widget del dashboard.

**Fuera del MVP**

- Recordatorios y notificaciones (feature aparte).
- Sincronización bancaria y pagos automáticos fuera del flag `AutoConfirm`.
- Pausa temporal: se resuelve cancelando y creando otra regla.
- Edición individual de ocurrencias.
- Versionado de ocurrencias.
- Vencimientos con hora.
- Omitir un vencimiento futuro.
- Más de una ocurrencia por día.
- Balance proyectado, conversión de moneda y reglas compartidas.

---

## 2. Modelo conceptual

| Concepto | Qué es | Se persiste |
|---|---|---|
| **Transacción recurrente** | La regla: cuenta, categoría, tipo, monto planificado, descripción, patrón, primer vencimiento, fin y `AutoConfirm`. | Sí |
| **Ocurrencia** | El vencimiento concreto. Existe como fila cuando vence o cuando se resuelve. | Sí |
| **Transacción** | El movimiento real que impacta el balance. | Sí |
| **Recordatorio** | Notificación de un vencimiento próximo. | Feature aparte |

### 2.1 Transacción recurrente (regla)

| Campo | Regla |
|---|---|
| Cuenta | Obligatoria. Define la moneda; no hay campo de moneda propio. |
| Categoría | Obligatoria. Es la que hereda la transacción al confirmar. |
| Tipo | Ingreso o gasto. Define el signo de la transacción. |
| Descripción | Obligatoria. |
| Monto planificado | Mayor a cero. Es la previsión, no un hecho. |
| Frecuencia | Única, diaria, semanal, mensual o anual. |
| Intervalo | Cada N períodos (`N >= 1`). No aplica a única. |
| Primer vencimiento | Primera ocurrencia y referencia del patrón. Puede ser pasado o futuro. |
| Días de la semana | Solo semanal. Uno o más; el primer vencimiento debe caer en uno de ellos. |
| Días del mes | Solo mensual. Uno o más (1-31); el primer vencimiento debe caer en uno de ellos. |
| Fin | Nunca, hasta una fecha o una cantidad de ocurrencias. Excluyentes. No aplica a única. |
| Autoconfirmación | `AutoConfirm`: confirma la ocurrencia el día del vencimiento. Por defecto apagado. |
| Cancelación | Fecha desde la que deja de proyectar. Conserva historial. |

### 2.2 Ocurrencia

| Campo | Regla |
|---|---|
| Regla + fecha de vencimiento | Únicos. Una ocurrencia por día. |
| Estado | `Pending`, `Confirmed` o `Skipped`. `Scheduled` es una proyección, no una fila. |
| Snapshot | Cuenta, categoría, descripción, tipo y monto planificado al momento de vencer. |
| Transacción | Obligatoria si está confirmada; nula si está pendiente u omitida. |
| Confirmada por | `Manual` o `Auto`. Solo en confirmadas. |
| Motivo de omisión | `Manual`, `GraceExpired` o `Superseded`. Solo en omitidas. |
| Timestamps | Creación y última modificación. |

La ocurrencia `Pending` sigue a la plantilla: si cambia el monto, la descripción, la cuenta, la categoría o el tipo, se actualiza. `Confirmed` y `Skipped` quedan congeladas.

### 2.3 Transacción

- Se crea solo al confirmar, manual o automáticamente.
- Origen propio: `RecurringTransaction`, con categoría permitida.
- `EffectiveDate`: la fecha de vencimiento en la autoconfirmación; la que elige el usuario en la manual (no futura).
- Hereda cuenta, categoría, tipo y descripción de la ocurrencia.
- No se edita ni se elimina desde Transacciones: se deshace desde la ocurrencia.

---

## 3. Patrón de recurrencia

Una regla combina **frecuencia**, **intervalo**, **primer vencimiento**, **días de la semana** (semanal) y **días del mes** (mensual). El cálculo es una función pura del dominio y se prueba con fin de mes, año bisiesto, semanas que cruzan meses y días que colapsan al ajustarse.

- **Única:** una sola ocurrencia, el primer vencimiento. Sin intervalo, días ni fin.
- **Diaria:** primer vencimiento + `n × intervalo` días.
- **Semanal:** semanas de lunes a domingo desde el primer vencimiento, avanzando `intervalo` semanas; una ocurrencia por cada día elegido, siempre `>=` primer vencimiento. Ej.: primer vencimiento lunes 16/11, días [lun, mié, vie], intervalo 2 → `16, 18 y 20/11`; `30/11, 02 y 04/12`.
- **Mensual:** meses del primer vencimiento, avanzando `intervalo` meses; por cada mes, una ocurrencia por cada día elegido. Si un día no existe, se ajusta al último (`31/01 → 28/02 → 31/03`); si dos días colapsan (`[30, 31]` en febrero), se genera una sola ocurrencia el `28/02`. `[31]` equivale al último día de cada mes.
- **Anual:** se avanza `intervalo` años conservando mes y día. `29/02` cae el `28/02` en años no bisiestos y vuelve al `29/02` en bisiestos.

**Casos que cubre:** pago único; mensual el 16; los 1 y 15; cada 3 meses; último día del mes; cada 2 semanas el lunes; lunes-miércoles-viernes; lunes a viernes; cada 2 semanas de lunes a miércoles; anual el 16/11; cada 10 días.

**Casos que no cubre:** "segundo martes del mes", semanas del mes, ajuste a día hábil, `RRULE` completo y vencimientos con hora. Ver [ADR-0003](../adr/0003-modelo-de-recurrencia.md).

El calendario termina cuando se alcanza la cantidad de ocurrencias, se supera la fecha de fin o se supera la fecha de cancelación.

**Límites:** el primer vencimiento no puede ser anterior a 12 meses (provisional, a confirmar en el spec). Una ocurrencia por día como máximo.

**Ejemplos.** "Peluquería", mensual, días [16], primer vencimiento 16/08/2026, sin fin, cancelada el 20/01/2027: `16/08, 16/09, 16/10, 16/11, 16/12, 16/01`. "Patente", única, 15/12/2026: `15/12`.

---

## 4. Estados y ciclo de vida

| Estado | Cuándo | ¿Fila? | ¿Transacción? | UI |
|---|---|---|---|---|
| **Scheduled** | Fecha futura, todavía no venció. | No, proyección. | No. | "Programada" |
| **Pending** | Venció y está dentro de la gracia. | Sí. | No. | "Pendiente" / "Vencida" |
| **Confirmed** | Se pagó o cobró. | Sí. | Sí. | "Confirmada" |
| **Skipped** | Pasó la gracia, se omitió o la reemplazó un cambio de patrón. | Sí. | No. | "Omitida" / "No pagada" |

**Vencida** no es un estado: es la etiqueta de una `Pending` cuya fecha ya pasó. Sigue siendo accionable (confirmar u omitir).

Transiciones:

- `Scheduled` → `Pending`: el job materializa al vencer, sin autoconfirmación.
- `Scheduled` → `Confirmed`: el job materializa y autoconfirma al vencer, dentro de la gracia.
- `Pending` → `Confirmed`: confirmación manual.
- `Pending` → `Skipped`: omisión manual o fin de la gracia (`GraceExpired`).
- `Skipped` → `Confirmed`: confirmación tardía (`Manual`).
- `Confirmed` → `Pending` o `Skipped`: deshacer. Vuelve a `Pending` si está dentro de la gracia; si no, a `Skipped`.

---

## 5. Flujos

### 5.1 Crear una regla

1. El usuario elige tipo, descripción, cuenta, categoría, monto planificado, frecuencia, intervalo, días de la semana o del mes, primer vencimiento, fin y `AutoConfirm`.
2. La UI muestra un preview con las próximas 3 ocurrencias; para una única, la fecha.
3. Si el primer vencimiento es pasado, la UI avisa que se materializarán los vencimientos pasados: los que estén dentro de la gracia quedan `Pending` (o `Confirmed` si `AutoConfirm` está prendido); los más viejos quedan `Skipped` (`GraceExpired`).
4. Al guardar, se evalúa la regla con el job lógico para congelar el pasado.
5. Aparece en Próximos y, si corresponde, en el dashboard.

### 5.2 Listar próximos

- Una fila por ocurrencia, ordenada por fecha ascendente: primero las vencidas y pendientes.
- Se muestran las `Pending` y las `Scheduled` hasta hoy + 90 días. Las `Confirmed`/`Skipped` aparecen al filtrar por estado o al abrir el detalle.
- Cada fila muestra: ícono y color de la categoría, descripción, cuenta, fecha, monto (planificado si no está confirmada; real si lo está), estado y días restantes.
- Filtros: búsqueda, tipo, estado, cuenta, categoría y "incluir canceladas".
- Acciones por fila: **Confirmar** (pendiente u omitida), **Omitir** (pendiente), **Ver regla**.
- Estado vacío: "No tenés pagos ni ingresos programados".

### 5.3 Ver el detalle de una regla

- Encabezado: ícono, descripción, tipo, cuenta, categoría, monto planificado, frecuencia, primer vencimiento, fin, estado y sello **"Autoconfirmación"** si está prendida.
- **Próximo vencimiento** con su estado y acción Confirmar.
- **Pendientes y vencidas**: lista con Confirmar u Omitir.
- **Historial**: ocurrencias `Confirmed` y `Skipped`, ordenadas de más reciente a más antigua, con fecha de vencimiento, estado, fecha de confirmación, monto real, origen (`Manual`/`Auto`), motivo de omisión y acceso a la transacción.
- Acciones: Editar, Cancelar, Eliminar.
- Si la cuenta o la categoría fueron eliminadas: aviso y la regla no se proyecta.

### 5.4 Editar la plantilla

- **Siempre editable:** descripción, monto planificado, cuenta, categoría, tipo, patrón, primer vencimiento, fin y `AutoConfirm`.
- **Antes de aplicar el cambio se congela el pasado** con la plantilla vieja.
- `Pending` sigue a la plantilla en monto, descripción, cuenta, categoría y tipo. Su fecha de vencimiento no cambia.
- `Confirmed` y `Skipped` no se tocan.
- El fin no puede excluir una ocurrencia ya materializada.
- **Cambio de patrón:** si el último vencimiento del período está `Pending`, se reemplaza (`Skipped`/`Superseded`) y el patrón nuevo rige ese período; si está `Confirmed` o `Skipped`, rige desde el próximo período. Si no hay filas, la proyección simplemente se reemplaza.
- **`AutoConfirm`:** prenderlo o apagarlo afecta a los vencimientos futuros; no cambia las confirmadas.

### 5.5 Confirmar

1. El usuario elige una ocurrencia `Pending` o `Skipped` (por defecto, la próxima).
2. El diálogo muestra: vencimiento (solo lectura), **monto** (precargado con el planificado, editable), **fecha de confirmación** (por defecto hoy, no futura) y resumen de cuenta/categoría/descripción.
3. Al confirmar, en una sola operación se crea la **transacción** y se actualiza la ocurrencia a `Confirmed` (`Manual`).
4. Se invalidan las cachés de recurrentes, transacciones, cuentas y dashboard.

### 5.6 Omitir

- Solo para `Pending`.
- Pide confirmación: "¿Omitir el vencimiento del 16/10? No se creará ninguna transacción."
- Pasa a `Skipped` (`Manual`). No afecta balances.
- Una omisión no se deshace; si fue un error, se confirma tarde.

### 5.7 Deshacer una confirmación

- Elimina la transacción asociada (soft delete) y devuelve la ocurrencia a `Pending` si está dentro de la gracia, o a `Skipped` si ya pasó.
- Pide confirmación explícita porque el pago impactó balances.
- Aplica también a las confirmaciones automáticas.

### 5.8 Cancelar una regla

- Fija la cancelación en la fecha de hoy. No se proyectan ocurrencias posteriores ni se autoconfirman.
- Las ocurrencias anteriores sin resolver siguen visibles como pendientes o vencidas y se pueden confirmar u omitir.
- La regla deja de aparecer en Próximos y en el dashboard; sigue accesible con el filtro "incluir canceladas" y conserva su historial.

### 5.9 Eliminar una regla

- Soft delete, con confirmación explícita.
- Sus ocurrencias dejan de mostrarse y el historial de la regla desaparece.
- **Las transacciones ya creadas se conservan**: son movimientos reales.
- Siguen visibles en Transacciones con origen "transacción recurrente".

### 5.10 Autoconfirmación

- Si `AutoConfirm` está prendido, la ocurrencia se confirma el día del vencimiento, dentro de la gracia, sin pasar por `Pending`.
- Crea la transacción con el monto planificado y fecha = vencimiento, y marca `ConfirmedBy = Auto`.
- Si el job se pierde el vencimiento por más de la gracia, **no autoconfirma**: la ocurrencia queda `Skipped` (`GraceExpired`) para revisión manual.
- Si el monto real difiere, se deshace y se reconfirma.
- No hay validación de fondos (FR20 diferido).
- Prender o apagar el flag afecta solo a los vencimientos futuros.

---

## 6. Reglas de negocio

| # | Regla |
|---|---|
| RN-01 | La cuenta y la categoría son obligatorias y deben existir al crear y al editar. |
| RN-02 | El monto planificado debe ser mayor a cero. |
| RN-03 | El primer vencimiento puede ser pasado o futuro; al crear o cambiar la fecha, no puede ser anterior a 12 meses (provisional). |
| RN-04 | El intervalo es un entero mayor o igual a 1. No aplica a única. |
| RN-05 | El fin es excluyente: fecha o cantidad, nunca ambas. No aplica a única. |
| RN-06 | La fecha de fin no puede ser anterior al primer vencimiento; la cantidad no puede ser menor a 1. |
| RN-07 | Una ocurrencia se identifica por regla + fecha de vencimiento; hay una sola por día. |
| RN-08 | Una ocurrencia admite una única resolución: confirmada u omitida. |
| RN-09 | La fecha de confirmación manual no puede ser futura. |
| RN-10 | El monto confirmado debe ser mayor a cero y no modifica el monto planificado. |
| RN-11 | La transacción hereda cuenta, categoría, tipo y descripción de la ocurrencia. |
| RN-12 | La transacción recurrente no se edita ni elimina desde Transacciones; se deshace desde la ocurrencia. |
| RN-13 | Confirmar crea la transacción; omitir no crea ninguna. |
| RN-14 | `Pending` pasa a `Skipped` (`GraceExpired`) a los 7 días de gracia. |
| RN-15 | Omitir manualmente deja `Skipped` (`Manual`). |
| RN-16 | Una omitida se puede confirmar tarde; pasa a `Confirmed` (`Manual`). |
| RN-17 | Deshacer una confirmación devuelve a `Pending` dentro de la gracia, o a `Skipped` fuera de ella. |
| RN-18 | La autoconfirmación solo aplica con `AutoConfirm` prendido, al vencer y dentro de la gracia. |
| RN-19 | La autoconfirmación usa el monto planificado y fecha de vencimiento; crea la transacción con origen recurrente. |
| RN-20 | Si el job se pierde el vencimiento por más de la gracia, no autoconfirma: queda `Skipped`. |
| RN-21 | Antes de editar una regla se congela el pasado con la plantilla vieja. |
| RN-22 | `Pending` sigue a la plantilla; `Confirmed` y `Skipped` no. |
| RN-23 | El fin no puede excluir una ocurrencia ya materializada. |
| RN-24 | Cambio de patrón: `Pending` del período se reemplaza (`Superseded`); `Confirmed`/`Skipped` rigen desde el próximo período. |
| RN-25 | `AutoConfirm` se puede prender o apagar; afecta solo a vencimientos futuros. |
| RN-26 | Cancelar detiene la proyección y la autoconfirmación desde la fecha de cancelación; las pendientes anteriores siguen accionables. |
| RN-27 | Eliminar es soft delete; las transacciones ya creadas se conservan. |
| RN-28 | Si la cuenta o la categoría se eliminan, la regla no se proyecta ni se autoconfirma. |
| RN-29 | El dashboard muestra como máximo una ocurrencia por regla (la próxima sin resolver) e indica cuántas vencidas tiene. |
| RN-30 | La lista muestra `Pending` y `Scheduled` hasta hoy + 90 días, más todas las vencidas; si una regla no tiene ninguna en ese rango, se muestra su próxima ocurrencia. |
| RN-31 | En semanal se elige al menos un día y el primer vencimiento debe caer en uno de ellos. |
| RN-32 | En mensual se elige al menos un día del mes y el primer vencimiento debe caer en uno de ellos; los días inexistentes se ajustan y los que colapsan se deduplican. |
| RN-33 | La frecuencia única genera exactamente una ocurrencia y no admite intervalo, días ni fin. |
| RN-34 | El job no crea transacciones, salvo la excepción de autoconfirmación (RN-18/19). |

---

## 7. UI

### 7.1 Página "Próximos"

- Ruta propia y entrada en el sidebar, entre Transferencias y Cuentas.
- Layout maestro-detalle: lista a la izquierda, detalle de la regla a la derecha en desktop; en mobile, lista y panel deslizante.
- Header: "Próximos pagos e ingresos" + botón "Nuevo".
- Badges de estado: Programada (slate), Pendiente (ámbar), Vencida (rojo), Confirmada (verde), Omitida (gris).
- Reutiliza: `Card`, `Badge`, `Select`, `Input`, `Button`, `DeleteConfirmationDialog`, `ConfirmActionDialog`, `ErrorAlert`, `IconBox`, `Skeleton`.

### 7.2 Formulario de regla

- Tipo segmentado (Ingreso / Gasto).
- Descripción, cuenta, categoría, monto planificado.
- Frecuencia (Única vez / Diaria / Semanal / Mensual / Anual) + "Cada N" (oculto en única).
- Días de la semana (semanal): siete toggles, con el del primer vencimiento preseleccionado.
- Días del mes (mensual): grilla del 1 al 31, con el del primer vencimiento preseleccionado.
- Primer vencimiento.
- Fin: "Nunca" / "Hasta una fecha" / "Después de N veces" (oculto en única).
- **Autoconfirmación**: toggle con la leyenda "Se confirmará automáticamente el día del vencimiento".
- Preview de las próximas 3 ocurrencias y aviso de vencimientos pasados que se materializarán.
- Si el primer vencimiento no cae en un día elegido, error en línea y no deja guardar.
- Validación con Zod; errores de API con `useFormErrorHandler`.

### 7.3 Diálogo de confirmación

- Vencimiento (solo lectura), monto editable, fecha de confirmación, resumen de cuenta/categoría/descripción.
- Botón "Registrar pago" o "Registrar cobro" según el tipo.
- Para una confirmación automática: sello "Confirmada automáticamente" y acción "Deshacer".

### 7.4 Widget del dashboard

- Título "Próximos", hasta 5 filas, una por regla: ícono, descripción, fecha relativa, monto y estado.
- Badge con la cantidad de vencidas de la regla si tiene más de una.
- Acción rápida "Confirmar" que abre el mismo diálogo; "Ver todo" navega a la página.
- Reemplaza por completo `upcomingPayments/mockData.ts`.
- Estados de carga, vacío y error.

---

## 8. Job y zona horaria

- **Job diario a las 00:10** de la zona horaria del usuario, más **catch-up al arrancar**.
- La evaluación es idempotente y transaccional. Índice único `(regla, fecha)`.
- **No escribe en GET.** La lectura solo lee y proyecta.
- **Congela el pasado** antes de cualquier edición de la plantilla.
- **Autoconfirma** solo reglas con `AutoConfirm`, al vencer y dentro de la gracia.
- Si el backend estuvo caído más de la gracia, las ocurrencias viejas quedan `Skipped`; no se autoconfirman hacia atrás.
- **Zona horaria:** `DateOnly` para vencimientos; UTC para timestamps; zona IANA del usuario para "hoy" y el job. `DateTimeOffset` solo para instantes.
- Si en el futuro se agregan vencimientos con hora, el job pasa a correr con mayor frecuencia.

---

## 9. Impacto en datos existentes

- **Nuevo origen de transacción** `RecurringTransaction`. Requiere agregar el valor al enum y su fila en la tabla de orígenes.
- **La transacción recurrente lleva categoría.** Se crea con un factory propio que la setea; no se edita desde Transacciones. Si en el futuro se permite editarla, hay que habilitar la categoría para ese origen en `Transaction.Update`.
- **Migración:** tablas de reglas y ocurrencias, índice único `(regla, fecha)` y el origen nuevo.
- **Job:** `BackgroundService` + `TimeProvider`/zona horaria.
- **No se toca el cálculo de balances:** las confirmaciones son transacciones normales.
- **Invalidación de caché** al confirmar, omitir, deshacer, autoconfirmar, cancelar o eliminar: `recurring`, `transactions`, `accounts` y `dashboard`.

---

## 10. Casos borde

| Caso | Comportamiento |
|---|---|
| Regla creada con primer vencimiento pasado | Se materializan los vencimientos: dentro de la gracia quedan `Pending`; los más viejos, `Skipped`. |
| Regla con `AutoConfirm` y primer vencimiento pasado | Los vencimientos dentro de la gracia se autoconfirman; los más viejos quedan `Skipped`. |
| Autoconfirmación con monto distinto al real | Se deshace y se reconfirma con el monto real. |
| El backend estuvo caído más de 7 días | Las ocurrencias viejas quedan `Skipped`; se confirman manualmente. |
| Cambio de patrón con el último vencimiento `Pending` | Se reemplaza (`Superseded`) y el patrón nuevo rige el período. |
| Cambio de patrón con el último vencimiento `Confirmed` | El patrón nuevo rige desde el próximo período. |
| Cambio de patrón sin filas | La proyección se reemplaza sin omitir nada. |
| Edición de monto con una `Pending` | La `Pending` se actualiza; las confirmadas y omitidas no. |
| Deshacer una confirmación dentro de la gracia | Vuelve a `Pending`. |
| Deshacer una confirmación fuera de la gracia | Vuelve a `Skipped`. |
| Omitir una `Pending` por error | No se deshace; se confirma tarde. |
| Intentar omitir una futura | Fuera del MVP: solo se puede cancelar la regla. |
| Cuenta o categoría eliminada | La regla no se proyecta ni se autoconfirma; el detalle avisa. |
| Dos ocurrencias el mismo día | No se permiten: una por día. |
| Vencimiento hoy antes de las 00:10 | Todavía es `Scheduled` hasta que corre el job; el catch-up lo resuelve. |
| Confirmación manual de una ocurrencia futura | Fuera del MVP; primero debe vencer. |
| Ingresos recurrentes | Mismo flujo; cambia el signo y las etiquetas de cobro. |

---

## 11. Cobertura del roadmap

| FR | Cómo se cumple |
|---|---|
| FR24 | Crear reglas de gasto con recurrencia, incluido el pago único. |
| FR25 | Crear reglas de ingreso con recurrencia (misma entidad, `IsIncome`). |
| FR26 | Confirmar una ocurrencia desde Próximos o el detalle; crea la transacción. |
| FR27 | El job materializa las ocurrencias al vencer; la autoconfirmación es opt-in. No se generan transacciones sin acción del usuario, salvo esa excepción. |
| FR28 | Editar la plantilla con congelamiento del pasado. |
| FR29 | Cancelar, eliminar y omitir ocurrencias. |
| FR30 | Lista de próximos con filtros y estados. |
| FR33 | Widget de próximos en el dashboard. |

---

## 12. Fuera de alcance y evolución

- **Recordatorios:** feature aparte; no se implementan acá.
- **Vencimientos con hora:** se agrega `DueTime` nullable y el job aumenta su frecuencia.
- **Omitir un futuro:** requiere materializar la ocurrencia antes de tiempo; queda para después.
- **Gracia por regla:** el MVP usa 7 días global; el override por regla es configuración futura.
- **Más de una ocurrencia por día:** cambia la identidad a `(regla, fecha, hora)`.
- **Versionado de ocurrencias:** se reemplaza por deshacer y confirmar.
- **Edición individual de ocurrencias:** no; el monto real se define al confirmar.
- **Balance proyectado, conversión de moneda y reglas compartidas:** fuera del MVP.
