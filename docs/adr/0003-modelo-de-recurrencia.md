# ADR-0003 — Modelo de recurrencia: patrón estructurado (sin RRULE)

- **Estado:** Propuesto (pendiente de confirmación)
- **Fecha:** 2026-11-02
- **Contexto:** El roadmap pide frecuencias diaria, semanal, mensual y anual. El usuario necesita además "cada N" (cada 2 semanas, cada 3 meses), patrones con varios días de la semana (lunes-miércoles-viernes, lunes a viernes), varios días del mes (1 y 15) y pagos únicos. La mayoría de los casos reales son mensuales, pero el modelo no debe cerrarse.

## Decisión

La recurrencia se modela como un **patrón estructurado**, no como una cadena de texto:

- **Frecuencia:** única, diaria, semanal, mensual o anual.
- **Intervalo:** cada N períodos (`N >= 1`). No aplica a "única".
- **Primer vencimiento:** fecha de la primera ocurrencia. Es también la referencia del patrón y debe pertenecer al mismo.
- **Días de la semana** (solo semanal): uno o más días. La UI preselecciona el del primer vencimiento.
- **Días del mes** (solo mensual): uno o más días de 1 a 31. La UI preselecciona el del primer vencimiento.
- **Fin:** nunca, hasta una fecha o después de N ocurrencias. No aplica a "única".

El cálculo vive en una **función pura del dominio** (`RecurrenceCalendar`), testeada con fin de mes, año bisiesto, semanas que cruzan meses y días del mes que se repiten al ajustarse.

### Semántica por frecuencia

| Frecuencia | Cálculo |
|---|---|
| **Única** | Exactamente una ocurrencia: el primer vencimiento. Sin intervalo, días ni fin. |
| **Diaria** | Primer vencimiento + `n × intervalo` días. |
| **Semanal** | Semanas de lunes a domingo desde el primer vencimiento, avanzando `intervalo` semanas; una ocurrencia por cada día elegido, siempre `>=` primer vencimiento. |
| **Mensual** | Meses del primer vencimiento, avanzando `intervalo` meses; por cada mes, una ocurrencia por cada día elegido. |
| **Anual** | Años del primer vencimiento, avanzando `intervalo` años, conservando mes y día. |

### Reglas del mes

- Si un día elegido no existe en el mes, se usa el último día: `31/01 → 28/02 → 31/03`.
- Si dos o más días colapsan al mismo fecha al ajustarse, se genera **una sola ocurrencia**: `[30, 31]` en febrero → `28/02`.
- `[31]` equivale al **último día de cada mes**, porque en todos los meses con 31 días el 31 es el último.
- Las ocurrencias de un mes se ordenan por fecha y se deduplican.
- El primer vencimiento debe ser uno de los días elegidos. Los días anteriores del primer mes no se generan.

### Qué cubre

| Caso | Cómo se modela |
|---|---|
| Pago único el 15/12 | Única, primer vencimiento 15/12. |
| Todos los meses el 16 | Mensual, intervalo 1, días [16]. |
| Los 1 y 15 de cada mes | Mensual, intervalo 1, días [1, 15]. |
| Cada 3 meses | Mensual, intervalo 3. |
| Último día del mes | Mensual, días [31]. |
| Cada 2 semanas el lunes | Semanal, intervalo 2, días [lunes]. |
| Lunes, miércoles y viernes | Semanal, intervalo 1, días [lun, mié, vie]. |
| Lunes a viernes (días hábiles) | Semanal, intervalo 1, días [lun, mar, mié, jue, vie]. |
| Cada 2 semanas, lunes a miércoles | Semanal, intervalo 2, días [lun, mar, mié]. |
| Todos los años el 16/11 | Anual, intervalo 1, primer vencimiento 16/11. |
| Cada 10 días | Diaria, intervalo 10. |

### Qué no cubre (y cómo se resuelve)

| Caso | Alternativa |
|---|---|
| "Segundo martes del mes" | No soportado. |
| Semana del mes ("tercera semana") | No soportado. |
| Ajuste a día hábil anterior/siguiente | No soportado; el usuario elige la fecha real. |
| `RRULE` completo (RFC 5545) | No soportado. |

## Por qué

- Cubre los casos reales (mensual el 16, 1 y 15, quincenal, días fijos de la semana) sin introducir un lenguaje de recurrencia.
- La UI se arma con controles simples: frecuencia, "cada N", toggles de días de la semana o del mes y una fecha.
- Es testeable como función pura y no depende de librerías externas.
- `RRULE` obliga a parsear, validar, renderizar y explicar una gramática que nadie va a escribir a mano.

## Consecuencias

**Positivas**

- Un solo lugar donde vive el cálculo, fácil de testear y de mostrar en un preview ("próximas 3 ocurrencias").
- Los datos persistidos son legibles: frecuencia, intervalo, días y fecha.
- Extensible: agregar "n-ésimo día de la semana" o ajuste a día hábil es sumar un caso en la función.

**Negativas / costos aceptados**

- La UI mensual necesita un selector de hasta 31 días y una validación extra (el primer vencimiento debe estar entre los elegidos).
- El ajuste de fin de mes puede colapsar días; hay que deduplicar y explicarlo en la UI.
- No se pueden modelar patrones arbitrarios.

## Alternativas descartadas

**A. `RRULE` / Ical.Net.** Potencia innecesaria, dependencia externa, UI imposible de explicar y validación difusa. Se descarta para el MVP.

**B. Ocurrencias persistidas + constructor visual.** El usuario crea cada vencimiento a mano y la app los repite. Es el modelo "cadena" del ADR-0001, con los mismos problemas.

**C. Expresiones cron.** Pensadas para jobs, no para vencimientos; no expresan "el 16 de cada mes" de forma legible para el usuario.

## Notas

- El primer vencimiento es también la fecha desde la que se calcula la referencia del patrón. No hay un campo separado de "fecha de creación de la serie"; eso lo cubre `CreatedAt`.
- El horizonte de la vista de Próximos se define en el diseño funcional (RN-24), no en este ADR.
