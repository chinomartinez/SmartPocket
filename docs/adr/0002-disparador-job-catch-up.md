# ADR-0002 — Disparador: job diario + catch-up, sin escrituras en GET

- **Estado:** Aceptado
- **Fecha:** 2026-11-14
- **Reemplaza:** la propuesta del 2026-11-02 (FR27 sin scheduler)
- **Contexto:** Las ocurrencias se persisten al vencer y transicionan de estado con el tiempo. Hace falta un disparador. La app es un proceso único sobre SQLite, online-only, y el backend puede estar apagado.

## Decisión

1. **Job diario a las 00:10 de la zona horaria del usuario**, más un **catch-up al arrancar** el backend. Si el proceso estuvo apagado, el catch-up procesa los días faltantes.
2. La evaluación vive en un **servicio compartido**. Los handlers de creación y edición lo invocan para **congelar el pasado** con la regla vieja antes de aplicar un cambio.
3. **Los GET no escriben.** La lectura no materializa ni transiciona nada; solo lee filas y proyecta el futuro.
4. El job **materializa ocurrencias** y **transiciona estados**. Solo crea transacciones para reglas con `AutoConfirm`, al vencer y dentro de la gracia (ADR-0001).
5. Si el job se pierde el vencimiento por más de la gracia, la ocurrencia queda `Skipped` (`GraceExpired`). **No se autoconfirma hacia atrás.**

### Zona horaria

- Los vencimientos son `DateOnly`; no llevan hora ni offset.
- "Hoy" se calcula con la zona IANA del usuario (`TimeZoneId`), no con UTC.
- Los timestamps de auditoría van en UTC. `DateTimeOffset` se usa solo para instantes, nunca para fechas de calendario.
- El job corre a las 00:10 de esa zona. Con UTC, el día cambiaría a las 21:00 en Argentina y el job se adelantaría.

## Por qué

- Mantiene los GET puros y la separación query/command.
- El estado está listo sin que el usuario abra la app; el catch-up cubre caídas y reinicios.
- Es el mismo lugar donde después viven los recordatorios.
- Un job diario alcanza para vencimientos sin hora. Si se agregan horas, se aumenta la frecuencia.

## Consecuencias

- Hay un `BackgroundService` y una zona horaria configurada.
- La idempotencia depende de un índice único `(transacción recurrente, fecha)` y de transacciones de base.
- La autoconfirmación es una excepción explícita, opt-in, a "sin transacciones automáticas".
- Si el backend se cae mucho tiempo, las ocurrencias viejas quedan omitidas y requieren confirmación manual; no se inventan pagos.

## Alternativas descartadas

**A. Lazy al leer.** Materializar en el handler de lista/dashboard. Evita el job, pero mete escrituras en un GET, mezcla query y command y la caché del frontend retrasa la transición.

**B. Endpoint al iniciar la app.** El frontend llama a un `POST /evaluate` al arrancar. Depende del cliente y no corre si la app queda abierta.

**C. Híbrido job + lazy.** Más robusto, pero dos caminos para la misma lógica y más tests.

**D. Job horario.** Innecesario mientras los vencimientos no tengan hora; el diario alcanza.

## Notas

- El job nunca crea transacciones, salvo la excepción de autoconfirmación descrita.
- La lógica de evaluación se testea como caso de uso, sin depender del `BackgroundService`.
