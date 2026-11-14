# ADR-0001 — Modelo de transacciones recurrentes: ocurrencias persistidas y futuro proyectado

- **Estado:** Aceptado
- **Fecha:** 2026-11-14
- **Reemplaza:** la propuesta del 2026-11-02 (modelo de ocurrencias derivadas)
- **Contexto:** Fase 3.5 del roadmap (FR24–FR30, FR33). La app es single-user, corre sobre SQLite y es online-only. El usuario necesita ver el próximo vencimiento, conservar el historial de lo que pagó o cobró y de lo que no, y editar la regla sin reescribir el pasado.

## Decisión

Una **transacción recurrente** (`RecurringTransaction`) es la regla. Sus **ocurrencias** (`RecurringOccurrence`) se persisten cuando vencen; el futuro se proyecta desde el patrón y no se guarda.

- **Regla:** cuenta, categoría, tipo, monto planificado, descripción, patrón (frecuencia, intervalo, días de semana o mes), primer vencimiento, fin y `AutoConfirm`.
- **Ocurrencia persistida:** fecha de vencimiento, estado (`Pending`, `Confirmed`, `Skipped`), snapshot de los datos de la regla, transacción asociada, `ConfirmedBy` y `SkipReason`.
- **Proyección:** las ocurrencias futuras son `Scheduled`, no tienen fila y se calculan desde el patrón.
- **Identidad:** `(transacción recurrente, fecha de vencimiento)`, única. Una ocurrencia por día.

### Ciclo de vida

- Al vencer, el job crea la ocurrencia:
  - con `AutoConfirm` y dentro de la gracia → `Confirmed` (`Auto`) + transacción fechada el vencimiento;
  - sin `AutoConfirm` → `Pending`.
- `Pending` → confirmación manual → `Confirmed` (`Manual`) + transacción.
- `Pending` → omisión manual → `Skipped` (`Manual`).
- `Pending` → 7 días de gracia → `Skipped` (`GraceExpired`).
- `Skipped` → confirmación tardía → `Confirmed` (`Manual`).
- `Confirmed` → deshacer → `Pending` si está dentro de la gracia; si no, `Skipped`.

### Edición

- La plantilla es la única superficie editable.
- Antes de aplicar un cambio se **congela el pasado** con la plantilla vieja.
- `Pending` sigue a la plantilla; `Confirmed` y `Skipped` no.
- Sin versionado ni edición individual de ocurrencias; el monto real se define al confirmar.
- **Cambio de patrón:** si el último vencimiento del período está `Pending`, se reemplaza (`Skipped`/`Superseded`) y el patrón nuevo rige ese período; si está `Confirmed` o `Skipped`, rige desde el próximo período.

## Por qué

- **El historial es un hecho, no una derivación.** Editar la regla no reescribe lo que ya pasó.
- **El futuro sigue siendo barato.** No se generan filas infinitas; se proyectan.
- **Los balances cambian solo por un acto deliberado** (confirmación manual) o por una regla auto-confirmada que el usuario eligió.
- **Una ocurrencia por día** mantiene la identidad simple; la hora de vencimiento puede agregarse después como atributo.

## Consecuencias

- El job y la zona horaria pasan a ser parte del dominio (ADR-0002).
- La ocurrencia duplica datos de la regla (snapshot). `Pending` se refresca con la plantilla; `Confirmed` y `Skipped` quedan congelados.
- La autoconfirmación es una excepción opt-in a "sin transacciones automáticas".
- Sin versionado: las correcciones van por deshacer y reconfirmar.
- La proyección futura se calcula en memoria; el volumen es chico (decenas de reglas).

## Alternativas descartadas

**A. Todo derivado (modelo anterior).** Las ocurrencias no se persisten; pagos y omisiones se guardan como liquidaciones. Es más simple, pero el pasado se recalcula al editar la regla y una ocurrencia pasada no se puede editar. Se descartó.

**B. Calendario completo persistido.** Se materializan también las ocurrencias futuras. Permite editar cualquier vencimiento, pero hay que regenerar y sincronizar filas futuras en cada cambio. Se descartó.

**C. Una fila por pago (cadena).** Cada pago/ingreso es una fila y al confirmar se crea la siguiente. Si una ocurrencia no se paga, la cadena se corta y no hay pronóstico. Se descartó.

## Notas

- El disparador y la autoconfirmación se detallan en ADR-0002.
- El patrón de recurrencia se detalla en ADR-0003.
