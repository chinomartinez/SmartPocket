# ADR-002 — FR27 sin scheduler: "automático" significa calendario derivado, no transacciones automáticas

- **Estado:** Propuesto (pendiente de confirmación)
- **Fecha:** 2026-11-02
- **Contexto:** FR27 pide "generación automática de entradas recurrentes". El backend no tiene scheduler, worker ni job en background, la base es SQLite y la app es online-only. Hoy `Transaction` rechaza fechas futuras (`La fecha efectiva no puede ser futura.`) y no hay sincronización bancaria. El usuario decidió no soportar pagos automáticos en el MVP.

## Decisión

1. **No se materializan ocurrencias ni transacciones automáticamente.** Al leer la lista o el dashboard, el backend calcula las ocurrencias y su estado. No hay catch-up ni creación implícita de filas.
2. **La única forma de que exista una transacción recurrente es que el usuario marque una ocurrencia como pagada.**
3. **FR27 se reinterpreta** como: "las entradas recurrentes aparecen solas en la vista de próximos y en el dashboard, sin que el usuario tenga que crearlas". La automatización es de **proyección**, no de **registro**.
4. No se agrega `IsAutomatic` ni un flag equivalente. Si en el futuro se suma, será con reglas explícitas de creación y auditoría.

## Por qué

- Un job en SQLite + app online-only es frágil: si el proceso no corre, no hay generación; si corre dos veces, hay duplicados. Requiere idempotencia, lock y un lugar donde correr.
- Crear transacciones sin acción del usuario muta balances y dashboard sin que nadie lo haya confirmado. Es exactamente el tipo de inconsistencia que NFR15/NFR16 quieren evitar.
- Un "pago automático" sin sync bancario es una suposición: la app no puede saber si el débito ocurrió, por cuánto, ni con qué fecha.
- El modelo del ADR-001 ya produce la experiencia que el usuario pidió ("ver Peluquería el 16/11 por $10k") sin escribir nada.

## Consecuencias

**Positivas**

- Cero jobs, cero locks, cero duplicados.
- Los balances solo cambian por acciones explícitas.
- El cálculo es determinístico y testeable.

**Negativas / costos aceptados**

- Si el usuario no abre la app, no "pasa nada": al abrir ve la realidad calculada, que es lo esperado.
- Los vencimientos impagos no generan deuda automática ni notificaciones. Se ven como "Vencidos" y requieren acción.
- **Hay que corregir la redacción de FR27 en el roadmap** para que no prometa generación de transacciones.

## Alternativas descartadas

**A. Catch-up al consultar.** En cada request de lista/dashboard, crear las ocurrencias faltantes (o incluso las transacciones) hasta hoy. Se descarta por el costo de idempotencia y porque sigue creando registros sin acción del usuario.

**B. Endpoint explícito invocado por el frontend al iniciar.** Se descarta porque depende de que el cliente lo llame y agrega un estado global "ya generé" que hay que persistir.

**C. Job programado (`IHostedService` / cron).** Se descarta por la fragilidad operativa en SQLite y porque el host puede no estar corriendo.

**D. Flag `IsAutomatic` con generación al vencer.** Se descarta para el MVP: sin sync bancario no hay forma de saber el monto real, y crear la transacción sola contradice la decisión de registrar siempre con confirmación.
