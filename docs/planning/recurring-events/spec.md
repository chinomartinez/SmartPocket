# Transacciones recurrentes

Type: enhancement
Status: ready-for-agent

## Problem Statement

Hoy SmartPocket solo registra movimientos cuando ya ocurrieron. El usuario no puede planificar un alquiler, un sueldo, un servicio o una suscripción, ni ver qué le toca pagar o cobrar en los próximos días. El widget de próximos usa datos mock y no hay historial de qué se pagó, qué se omitió y qué quedó pendiente. Tampoco puede corregir una regla sin que el pasado se recalcule.

## Solution

Un módulo de transacciones recurrentes con una regla editable y ocurrencias que se persisten al vencer. El usuario ve los próximos vencimientos, confirma el pago o cobro con el monto real, omite lo que no ocurrió y consulta el historial. El futuro se proyecta desde el patrón; el pasado queda congelado. La regla puede autoconfirmarse el día del vencimiento si el usuario lo elige.

## User Stories

1. Como usuario, quiero crear una regla de gasto recurrente con cuenta, categoría, monto, descripción y frecuencia, para planificar mis pagos.
2. Como usuario, quiero crear una regla de ingreso recurrente, para planificar mi sueldo y otros cobros.
3. Como usuario, quiero crear un pago único, para planificar una patente o un gasto que no se repite.
4. Como usuario, quiero elegir frecuencia diaria, semanal, mensual o anual, para adaptar la regla a cada obligación.
5. Como usuario, quiero definir un intervalo "cada N", para representar cada 2 semanas o cada 3 meses.
6. Como usuario, quiero elegir varios días de la semana, para representar lunes-miércoles-viernes o lunes a viernes.
7. Como usuario, quiero elegir varios días del mes, para representar los pagos del 1 y 15.
8. Como usuario, quiero definir el primer vencimiento, para que la regla arranque en la fecha correcta.
9. Como usuario, quiero definir un fin por fecha o por cantidad de ocurrencias, para limitar préstamos y planes de cuotas.
10. Como usuario, quiero prender la autoconfirmación, para que la ocurrencia se confirme sola el día del vencimiento.
11. Como usuario, quiero ver un preview de las próximas ocurrencias mientras creo la regla, para confirmar que el patrón es el que quiero.
12. Como usuario, quiero ver la lista de próximos vencimientos ordenada por fecha, para saber qué viene.
13. Como usuario, quiero distinguir Programada, Pendiente, Vencida, Confirmada y Omitida, para entender el estado de cada ocurrencia.
14. Como usuario, quiero ver los días restantes de cada vencimiento, para priorizar.
15. Como usuario, quiero filtrar por tipo, cuenta, categoría, estado y texto, para encontrar un vencimiento puntual.
16. Como usuario, quiero abrir el detalle de una regla, para ver su patrón, su próximo vencimiento y su historial.
17. Como usuario, quiero ver el historial de ocurrencias confirmadas y omitidas, para saber qué pasó.
18. Como usuario, quiero confirmar una ocurrencia pendiente con el monto y la fecha reales, para registrar el movimiento verdadero.
19. Como usuario, quiero confirmar tarde una ocurrencia omitida, para corregir un pago que sí hice.
20. Como usuario, quiero omitir una ocurrencia pendiente, para sacarla del historial sin crear una transacción.
21. Como usuario, quiero deshacer una confirmación, para corregir un monto o una fecha equivocada.
22. Como usuario, quiero ver que una ocurrencia fue confirmada automáticamente y poder deshacerla, para mantener el control.
23. Como usuario, quiero editar la plantilla (monto, descripción, cuenta, categoría, tipo, patrón, fin y autoconfirmación), para mantener la regla al día.
24. Como usuario, quiero que cambiar el patrón no reescriba el pasado, para conservar un historial confiable.
25. Como usuario, quiero que cambiar el monto actualice las pendientes y futuras, pero no las confirmadas, para no falsear hechos.
26. Como usuario, quiero cancelar una regla, para que deje de proyectar ocurrencias sin borrar el historial.
27. Como usuario, quiero eliminar una regla conservando las transacciones ya creadas, para no perder movimientos reales.
28. Como usuario, quiero ver en el dashboard los próximos cinco vencimientos con la cantidad de vencidas, para tener el panorama al abrir la app.
29. Como usuario, quiero confirmar rápido desde el dashboard, para no navegar a otra pantalla.
30. Como usuario, quiero encontrar reglas canceladas o completadas, para consultar su historial.
31. Como usuario, quiero recibir errores claros cuando el primer vencimiento no cae en los días elegidos o el fin es inválido, para corregir el formulario.
32. Como usuario, quiero que una regla quede inactiva si se elimina su cuenta o categoría, para no proyectar movimientos imposibles.
33. Como usuario, quiero que las fechas respeten mi zona horaria, para que un vencimiento del 16 no se adelante al 15.
34. Como usuario, quiero que el sistema materialice las ocurrencias al vencer aunque no abra la app, para encontrar la realidad cuando vuelvo.

## Implementation Decisions

### Modelo de dominio

- La **transacción recurrente** es la regla: cuenta, categoría, tipo (ingreso/gasto), descripción, monto planificado, patrón, primer vencimiento, fin y `AutoConfirm`. Es la única superficie editable.
- La **ocurrencia** se identifica por `(transacción recurrente, fecha de vencimiento)`, única, una por día. Se persiste al vencer con estado `Pending`, `Confirmed` o `Skipped`. `Scheduled` es una proyección y no tiene fila.
- La ocurrencia guarda un snapshot de cuenta, categoría, descripción, tipo y monto planificado. `Pending` se actualiza con la plantilla; `Confirmed` y `Skipped` quedan congeladas.
- `Confirmed` exige una transacción asociada y registra `ConfirmedBy` (`Manual` o `Auto`). `Skipped` registra `SkipReason` (`Manual`, `GraceExpired` o `Superseded`).
- El **calendario de recurrencia** es una función pura: frecuencia única, diaria, semanal, mensual o anual; intervalo; días de semana o de mes; primer vencimiento; fin. Ajusta días inexistentes al último del mes y deduplica los que colapsan. No soporta `RRULE`, "segundo martes", ajuste a día hábil ni hora de vencimiento.
- **Ciclo de vida:** al vencer, el job materializa `Pending`, o `Confirmed` (`Auto`) si `AutoConfirm` está prendido y está dentro de la gracia. `Pending` pasa a `Skipped` (`GraceExpired`) a los 7 días. La confirmación manual crea la transacción; la omisión manual no. `Skipped` se puede confirmar tarde. Deshacer una confirmación vuelve a `Pending` dentro de la gracia o a `Skipped` fuera de ella.
- **Edición:** antes de aplicar un cambio se congela el pasado con la plantilla vieja. Cambiar el patrón reemplaza la ocurrencia `Pending` del período (`Superseded`) y rige ese período; si la última ocurrencia está `Confirmed` o `Skipped`, rige desde el próximo período. Sin versionado ni edición individual de ocurrencias: el monto real se define al confirmar.
- **Autoconfirmación:** flag por regla, apagado por defecto, editable después. Si el job se pierde el vencimiento por más de la gracia, no autoconfirma: deja `Skipped` para revisión manual.
- **Transacción:** origen propio `RecurringTransaction`, con categoría permitida. Se crea con un factory que setea cuenta, categoría, tipo, descripción y fecha; no se edita ni elimina desde Transacciones.

### Persistencia

- Dos entidades nuevas: regla y ocurrencia. Tablas en plural con `ToTable` explícito, sin `DbSet` en el contexto, siguiendo el refactor de persistencia vigente.
- Índice único `(transacción recurrente, fecha de vencimiento)` para garantizar idempotencia y una ocurrencia por día.
- La regla usa soft delete. La ocurrencia no se elimina: se oculta con la regla.
- Migración nueva con las dos tablas, el índice y el nuevo origen de transacción.
- Los balances siguen calculándose desde las transacciones; no se agrega un saldo mutable.

### Disparador y zona horaria

- Job diario a las **00:10 de la zona horaria del usuario** + catch-up al arrancar el backend. Si el proceso estuvo apagado, procesa los días faltantes.
- La evaluación vive en un servicio compartido. Los handlers de creación y edición lo invocan para congelar el pasado con la regla vieja antes de aplicar un cambio.
- Los GET no escriben. La lectura solo lee filas y proyecta el futuro.
- El job materializa y transiciona. Solo crea transacciones para reglas con `AutoConfirm`, al vencer y dentro de la gracia.
- Zona horaria: `DateOnly` para vencimientos; UTC para timestamps; zona IANA del usuario para "hoy" y el job. `DateTimeOffset` solo para instantes.

### API

- Reglas: listar, obtener detalle, crear, actualizar, cancelar y eliminar.
- Ocurrencias: listar con filtros (rango, estado, cuenta, categoría, texto, incluir canceladas), obtener las próximas para el dashboard y confirmar, omitir o deshacer una ocurrencia.
- El listado devuelve ocurrencias persistidas y proyecciones `Scheduled`; las proyecciones no tienen `occurrenceId` y no admiten acciones.
- El detalle de la regla devuelve la regla, las pendientes/vencidas y el historial paginado.
- Preview del formulario: endpoint que recibe el patrón y devuelve las próximas 3 fechas, sin persistir. Es la única fuente de verdad del cálculo.
- Confirmar recibe monto y fecha de confirmación; la fecha no puede ser futura. El monto debe ser mayor a cero.
- Los errores usan el pipeline existente de `ProblemDetails` y `ErrorDetail`.

### Frontend

- Módulo de feature `recurring-transactions`: página de próximos, lista maestro-detalle, formulario de regla, diálogo de confirmación y badge de estado.
- Servicios, tipos y hooks de TanStack Query en la capa de servicios, con una query key factory propia. Invalidar recurrentes, transacciones, cuentas y dashboard al confirmar, omitir, deshacer, autoconfirmar, cancelar o eliminar.
- Ruta propia y entrada en el sidebar; el widget del dashboard reemplaza los datos mock y muestra hasta cinco reglas con su próxima ocurrencia y el contador de vencidas.
- El formulario usa Zod y React Hook Form; el preview se pide al endpoint con debounce. Días de semana y días de mes se preseleccionan desde el primer vencimiento.
- El diálogo de confirmación precarga el monto planificado, permite el monto real y la fecha, y muestra cuenta, categoría y descripción.
- Los estados usan la paleta semántica existente: Programada (slate), Pendiente (ámbar), Vencida (rojo), Confirmada (verde), Omitida (gris).

### Integración con transacciones y balances

- Confirmar crea una transacción normal con origen recurrente; el balance de la cuenta se actualiza por la suma existente.
- Deshacer elimina la transacción con soft delete y devuelve la ocurrencia a su estado anterior.
- Eliminar la regla conserva las transacciones; sus ocurrencias dejan de mostrarse.
- Una cuenta o categoría eliminada deja la regla inactiva: no se proyecta ni se autoconfirma.

## Testing Decisions

- Un buen test prueba **comportamiento externo**, no detalles de implementación. Un solo `Act`, datos deterministas, sin reflexión y sin depender del reloj real.
- **Backend unitario:** calendario de recurrencia como función pura, con `[Theory]` y fechas fijas (fin de mes, bisiesto, varios días, `Once`, fin por fecha/cantidad). Validators con `TestValidateAsync`. Ramas de handlers que no dependen de EF ni de identidades generadas, con `FakeSmartPocketContext` e `InlineValidator`.
- **Backend integración:** evaluador de ocurrencias con `IntegrationTestFixture` (SQLite in-memory) y reloj fijo, marcado `[IntegrationTest]`. Cubre materialización, gracia, autoconfirmación, catch-up, idempotencia, congelamiento antes de editar y cambio de patrón. También los handlers que dependen de EF, soft delete, identidad generada o transacciones.
- **Nombres y carpetas:** espejo de la feature, `{Tipo}Tests` / `{Tipo}IntegrationTests`, métodos `Metodo_Escenario_Resultado`. Datos compartidos en object mothers; sin reflexión.
- **Endpoints/controladores: no se testean** en unitario ni integración. El nivel correcto sería E2E, pero el stack de E2E no está instalado; queda como follow-up. Los handlers detrás de los endpoints sí se testean.
- **Frontend:** Vitest en entorno node para funciones puras y schemas (etiquetas y colores de estado, fechas relativas, validación del patrón), y services con `vi.mock("@/api/spApiClient")` para URL, método, payload y mapeo. Timers falsos para "hoy"; sin zona horaria real.
- **Sin tests de DOM, componentes, hooks ni E2E** en esta spec. La UI se verifica manualmente. Playwright no está configurado como suite.
- **Prior art:** `AccountCreateUpdateHandlerTest`, `CategoryReorderHandlerTest`, `DateOnlyDashboardQueryTest`, `dateHelpers.test.ts`, `formatters.test.ts`, `paymentHelpers.test.ts`.

## Out of Scope

- Tests de endpoints/controladores y E2E. El setup de E2E es un esfuerzo aparte.
- Recordatorios y notificaciones.
- Pagos automáticos fuera del flag `AutoConfirm`; no hay sincronización bancaria.
- Pausa temporal, vencimientos con hora, omitir un vencimiento futuro, gracia por regla y más de una ocurrencia por día.
- Versionado de ocurrencias y edición individual de una ocurrencia.
- Balance proyectado, conversión de moneda y reglas compartidas entre usuarios.
- Tests de DOM, componentes, hooks y rutas.

## Further Notes

- Decisiones de arquitectura: ADR-0001 (modelo), ADR-0002 (disparador y zona horaria), ADR-0003 (patrón de recurrencia). Vocabulario: `GLOSSARY.md`.
- Valores provisionales a confirmar en implementación: primer vencimiento hasta 12 meses atrás, horizonte de 90 días, gracia de 7 días, job a las 00:10 y zona por defecto `America/Argentina/Buenos_Aires`.
- FR27 se reinterpreta: el job materializa ocurrencias; la autoconfirmación es opt-in. Hay que ajustar la redacción del roadmap.
- Los endpoints quedan definidos pero sin tests unitarios/integración por decisión explícita; el follow-up de E2E los cubre cuando exista el stack.
