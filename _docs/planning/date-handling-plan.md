# SmartPocket - Plan de manejo de fechas

## 1. Propósito

Definir cómo se representan, transportan, validan y muestran las fechas en SmartPocket, y el plan para eliminar el manejo disperso y las conversiones implícitas entre día de calendario e instante.

El documento es la referencia para las sesiones de implementación. No aplica cambios por sí mismo.

Alcance:

- Frontend (`webapp/`).
- Contratos y entidades del backend relacionados con fechas.
- Migración de datos existentes.

Fuera de alcance por ahora:

- Adopción de Temporal (se evalúa en la fase 3).
- Cambios de UI no relacionados con fechas.

## 2. Estado actual

Ya corregido:

- `AddCurrentTimeToDate` interpreta la fecha del picker como local (antes UTC) y conserva la hora actual en el timestamp enviado. Renombrado a `withCurrentTime`.
- `TransactionFormModal` y `TransferFormModal` usan fecha local en el valor por defecto y en el prefill de edición.
- El default de creación se recalcula mediante el prop `values` de React Hook Form, sin `useEffect`.
- Los formularios con fecha por defecto (compra, suscripción, resumen, transacción y transferencia) calculan ese valor con una factory `getCreateValues()` usada tanto en `values` como en `form.reset`. Así el default se recalcula al abrir y al reabrir el formulario, aunque la app cruce medianoche.
- `CreditCardPurchaseFormDialog`, `CreditCardSubscriptionFormDialog` y `CreditCardStatementFormDialog` ya no usan `toISOString().slice(0, 10)`; el cierre se calcula con `toDateOnly(new Date())`.
- `getDefaultDueDate` suma 15 días sobre el calendario local y formatea con `toDateOnly`, calculando cierre y vencimiento desde el mismo instante.
- `dateHelpers` expone la API centralizada: `toDateOnly`, `toDateOnlyUtc`, `todayDateOnly`, `dateOnlyFromDateTime`, `dateOnlyFromInstant`, `compareDateOnly`, `compareInstants`, `parseInstant`, `daysBetweenDateOnly`, `isValidDateOnly`, `formatDateOnlyLabel`, `formatInstantLabel` y `withCurrentTime`.
- Ninguna feature usa `toISOString`, `.slice(0, 10)`, `.split("T")` ni `new Date("...")`; la regla ESLint `no-restricted-syntax` lo bloquea en `src/features/**`.
- La validación Zod de fechas usa `dateOnlySchema` (rechaza timestamps y fechas inexistentes) en transacciones, transferencias, compras, suscripciones y resúmenes.
- `getInstallmentDate` está documentado y testeado como espejo del `AddMonths` de EF Core/SQLite, incluido el overflow de fin de mes.
- `UpcomingPayments` usa DateOnly y `daysBetweenDateOnly`.
- `parseDateFromISO` eliminado por no tener usos.
- Tests de regresión en `dateHelpers.test.ts`, `dateSchema.test.ts`, `paymentHelpers.test.ts` y `formatters.test.ts`.

Pendiente: Fase 2 (secciones 5 y 7).

## 3. Modelo conceptual

### 3.1. Tipos

| Tipo | Uso | Representación |
| --- | --- | --- |
| **DateOnly** | Día de calendario elegido por el usuario: fechas de compras, suscripciones, resúmenes, pagos, transacciones y transferencias | `"YYYY-MM-DD"` |
| **Instant** | Timestamp técnico o de auditoría | ISO 8601 con `Z` u offset |
| **Audit DateTime** | `CreatedAt`, `LastModifiedAt` | `DateTime` UTC, solo backend |

### 3.2. Reglas

1. Todo dato que el usuario elige con un date-picker es **DateOnly**.
2. Todo dato de auditoría o técnico es **Instant / DateTime UTC**.
3. El frontend no convierte un DateOnly a `Date` para agregarle hora. Si necesita un instante, lo deriva de forma explícita o lo expone el backend.
4. Solo `webapp/src/utils/dateHelpers.ts` puede usar `new Date(string)`, `toISOString`, `.slice(0, 10)` y `toLocaleDateString`.
5. El tipo de cada campo se documenta por contrato (sección 4).

### 3.3. Serialización

- `DateOnly` se serializa como `"YYYY-MM-DD"` (System.Text.Json).
- `DateTime` se serializa como ISO 8601 UTC.
- El frontend trata los DateOnly como `string` y no los pasa por `new Date` (salvo dentro del adaptador, si hiciera falta).
- Si en el futuro se adopta Temporal, `PlainDate` ocupa el lugar de DateOnly y `Instant` el de los timestamps. Las features no deberían enterarse.

## 4. Contrato objetivo por campo

| Campo | Hoy | Objetivo | Observaciones |
| --- | --- | --- | --- |
| `CreditCardPurchase.EffectiveDate` | `DateOnly` | `DateOnly` | Ya correcto |
| `CreditCardSubscription.EffectiveDate` | `DateOnly` | `DateOnly` | Ya correcto |
| `CreditCardStatement.ClosingDate` | `DateTime` | `DateOnly` | Hoy el frontend usa `dateOnlyFromDateTime` (puente) |
| `CreditCardStatement.DueDate` | `DateTime` | `DateOnly` | Ídem |
| `CreditCardStatementPayment.EffectiveDate` | `DateTime` | `DateOnly` | No tiene columna propia: usa `Transaction.EffectiveDate` |
| `Transaction.EffectiveDate` | `DateTime` | `DateOnly` | Confirmado para la Fase 2; hoy se agrega la hora actual |
| `Transfer.EffectiveDate` | `DateTime` | `DateOnly` | Confirmado para la Fase 2 |
| `CreatedAt` / `LastModifiedAt` | `DateTime` | `DateTime` UTC | Auditoría; no cambia |
| Timestamps de logs (`errorLogger`) | `Instant` | `Instant` | Técnicos; no cambia |
| `DayRangeDTO` (cierre/vencimiento habitual) | `int` | `int` | No es fecha |

## 5. Hallazgos pendientes

Los hallazgos de frontend de las fases 0 y 1 están corregidos y se detallan en la sección 2. Queda pendiente el cambio de contrato del backend:

| Archivo | Problema | Impacto | Fase |
| --- | --- | --- | --- |
| `backend/.../Transaction.cs` | `EffectiveDate` es `DateTime` y se fuerza a UTC | Con DateOnly desaparece la hora y la conversión local | 2 |

## 6. Decisiones

- **D1**: Todo dato que el usuario elige es DateOnly. No se captura hora en ningún formulario.
- **D2**: Confirmado en la Fase 2: los campos de negocio pasan a `DateOnly`; `DateTime` queda reservado para auditoría y timestamps técnicos.
- **D3**: El frontend tiene un único adaptador de fechas. Las features no usan `Date` directamente.
- **D4**: No se agrega una librería de fechas en las fases 0 y 1. Temporal se evalúa recién en la fase 3.
- **D5**: Los cambios de contrato del backend se hacen en un trabajo separado, con migración y validaciones propias.
- **D6**: La adopción de Temporal, si ocurre, cambia solo la implementación del adaptador; la API pública de helpers se mantiene.

## 7. Plan por fases

### Fase 0 - Bugfix inmediato (completada)

Objetivo: que ningún formulario precargue una fecha incorrecta.

Estado: completada. El detalle de lo corregido está en la sección 2.

Tareas:

- Reemplazar los defaults UTC por fecha local en:
  - `CreditCardPurchaseFormDialog`.
  - `CreditCardSubscriptionFormDialog`.
  - `CreditCardStatementFormDialog` (`closingDate`).
- Corregir `getDefaultDueDate` para que sume 15 días y formatee la fecha local.
- Recalcular la fecha al abrir cada formulario de creación usando el prop `values` de React Hook Form (sin `useEffect`), para que no quede una constante de módulo vieja.
- Tests de los helpers de fecha usados en esos formularios.

Notas de implementación:

- Además de `values`, la factory `getCreateValues()` se usa en `form.reset`. Sin eso, el reset de cierre reintroducía la fecha capturada al importar el módulo y reabrir el mismo día no la actualizaba.
- El mismo patrón se aplicó a `TransactionFormModal` y `TransferFormModal`, incluyendo la cuenta principal en el reset.
- `toDateOnly` queda cubierto por los tests existentes de `dateHelpers`; `getDefaultDueDate` sigue privado al diálogo, sin test dedicado.

Criterios de aceptación:

- Abriendo los formularios a las 22:30 ART, la fecha es la del día local actual y el vencimiento es +15 días.
- Si la app queda abierta cruzando medianoche, al abrir el formulario la fecha es la nueva.
- Sin `toISOString().slice(0, 10)` en los formularios de creación.
- `pnpm run build`, eslint y tests en verde.

### Fase 1 - Capa de fechas centralizada (frontend) (completada)

Objetivo: que ninguna feature vuelva a improvisar con fechas.

Estado: completada. El detalle está en la sección 2.

API implementada en `webapp/src/utils/dateHelpers.ts`:

```ts
// DateOnly
todayDateOnly(): string;
toDateOnly(date: Date): string;
toDateOnlyUtc(date: Date): string;
formatDateOnlyLabel(value: string, options?: Intl.DateTimeFormatOptions): string;
compareDateOnly(a: string, b: string): number;
daysBetweenDateOnly(from: string, to: string): number;
isValidDateOnly(value: string): boolean;

// Puente mientras el backend siga mandando DateTime para campos de calendario
dateOnlyFromDateTime(value: string): string;
dateOnlyFromInstant(instant: string): string;

// Instant / auditoría
formatInstantLabel(instant: string, options?: Intl.DateTimeFormatOptions): string;
compareInstants(a: string, b: string): number;
parseInstant(instant: string): Date;

// Puente temporal: Transaction/Transfer todavía envían DateTime (se elimina en Fase 2)
withCurrentTime(dateOnly: string): string;
```

Tareas:

- Renombrar `formatDateToISO` → `toDateOnly`.
- Renombrar `formatDateLocal` → `formatInstantLabel`.
- Renombrar `formatDateOnly` → `formatDateOnlyLabel`.
- Renombrar `AddCurrentTimeToDate` → `withCurrentTime` (temporal hasta la Fase 2).
- Reemplazar los `.slice(0, 10)` de statements y payments por `dateOnlyFromDateTime`.
- Documentar `getInstallmentDate` como espejo de `AddMonths` del backend.
- Unificar la validación Zod de fechas si se repite.
- Evaluar una regla ESLint `no-restricted-syntax` para prohibir `toISOString().slice` y `.split("T")` en `src/features/**`.

Notas de implementación:

- La validación Zod quedó en `webapp/src/utils/dateSchema.ts` (`dateOnlySchema`) y se usa en transacciones, transferencias, compras/suscripciones y resúmenes.
- La regla ESLint se aplicó a `src/features/**` y bloquea `toISOString().slice`, `.slice(0, 10)`, `.split("T")` y `new Date("...")`.
- `getInstallmentDate` replica el overflow de SQLite: 31/01 + 1 mes = 03/03. Queda cubierto por tests para que nadie lo "corrija" a último día del mes.
- Tests nuevos: `dateSchema.test.ts` y `paymentHelpers.test.ts`; se amplió `dateHelpers.test.ts` y se alineó `formatters.test.ts` con la salida real (es-AR/ARS).
- `pnpm run lint` sigue mostrando errores previos ajenos a fechas (`any` en `errorHandler`, `var` en `accountService`, `react-refresh` en componentes UI y un unused en `AccountsPage`). Los archivos tocados por la fase pasan sin errores.

Criterios de aceptación:

- Ninguna feature usa `new Date(string)` ni `.slice(0, 10)` para fechas de negocio.
- Tests de DateOnly e Instant con TZ fijada (ART) y casos a las 22:30.
- Sin cambios de comportamiento visibles.

### Fase 2 - Contratos del backend a DateOnly

Objetivo: eliminar las asunciones "este `DateTime` en realidad es una fecha".

Estado: pendiente de implementación.

Alcance confirmado:

- Statements: `ClosingDate`, `DueDate` → `DateOnly`.
- Transactions: `EffectiveDate` → `DateOnly`.
- Transfers: `EffectiveDate` → `DateOnly`.
- Payments: `CreditCardStatementPayment` no tiene columna de fecha propia; usa `Transaction.EffectiveDate`. Al pasar la transacción a `DateOnly`, el pago queda `DateOnly`.
- Auditoría (`CreatedAt`, `LastModifiedAt`) y logs: siguen `DateTime` UTC.

Decisiones de datos:

- La base de desarrollo no se borra. Se conservan los datos y se les corta la hora.
- No se hace backup ni rollback: no hay producción y es una decisión explícita.
- No se hace conversión de zona horaria ni auditoría histórica. El día queda tal como está guardado.
- EF Core guarda `DateOnly` como `TEXT` `"YYYY-MM-DD"`. Si el valor tiene hora, leerlo como `DateOnly` lanza `FormatException` (verificado contra SQLite). Por eso la limpieza es obligatoria antes de usar la app con el modelo nuevo.

SQL de limpieza (lo ejecuta el usuario, no el agente):

```sql
UPDATE CreditCardStatement SET ClosingDate = substr(ClosingDate, 1, 10), DueDate = substr(DueDate, 1, 10);
UPDATE Transactions SET EffectiveDate = substr(EffectiveDate, 1, 10);
UPDATE Transfers SET EffectiveDate = substr(EffectiveDate, 1, 10);
```

Reglas de ejecución:

- El agente puede modificar código y crear el archivo de migración.
- El agente NO ejecuta `dotnet ef database update`, ni SQL contra la base, ni backups.
- El usuario revisa el diff y aplica la migración/limpieza cuando corresponda.

Impacto backend:

- DTOs, comandos y entidades.
- Validadores: se mantiene el criterio existente de compras/suscripciones (`DateOnly.FromDateTime(DateTime.UtcNow)`). Los pagos comparan contra `statement.ClosingDate`.
- `AddMonths` de sugerencias de cuotas: no se toca.
- Consultas por rango y orden: los filtros `From`/`To` pasan a `DateOnly`; el desempate intra-día sigue con `CreatedAt`.
- `CreateAsSystemAdjustment` usa `DateOnly.FromDateTime(DateTime.UtcNow)`.

Impacto frontend:

- Tipos de DTO.
- Eliminación de `dateOnlyFromDateTime`, `dateOnlyFromInstant` y `withCurrentTime`.
- Formularios: envían el DateOnly tal cual, sin agregar hora.
- Prefill de edición: usa el DateOnly del backend directamente.
- Listas: `formatDateOnlyLabel` y comparación date-only.
- `RecentTransactions`: necesita un formateador relativo date-only.

Criterios de aceptación:

- No queda ningún `dateOnlyFromDateTime`, `dateOnlyFromInstant` ni `withCurrentTime` en el frontend.
- Los formularios no agregan hora.
- Tests backend de serialización y validadores.
- La migración queda creada en el repo, sin aplicarse desde el agente.

### Fase 3 - Temporal (opcional)

Objetivo: reemplazar la implementación de `Date` por `PlainDate` / `Instant` sin tocar las features.

- Adoptar `@js-temporal/polyfill` (o nativo si el soporte de navegadores lo permite).
- Migrar solo la implementación de `dateHelpers`.
- Mantener la API pública de la fase 1.
- Medir impacto en bundle y confirmar soporte.

Go/no-go: después de la fase 2.

## 8. Riesgos y migración de datos

- **Instantes con hora**: `Transaction.EffectiveDate` y `Transfer.EffectiveDate` hoy guardan la hora de creación/edición. Al pasar a DateOnly se corta la hora; el día queda tal como está guardado.
- **Conversión de datos existentes**: no se convierte zona horaria. Se aplica `substr(fecha, 1, 10)`; una transacción nocturna puede quedar con el día UTC.
- **Datos ya corridos**: no se auditan ni corrigen. Quedan como están.
- **Backup y rollback**: no se hacen. Decisión explícita: no hay producción.
- **Validadores de fecha futura**: se mantiene el criterio existente de compras (`DateOnly.FromDateTime(DateTime.UtcNow)`), con la ventana conocida de 21:00–23:59 ART.
- **Orden intra-día**: ya existe desempate por `CreatedAt`; verificar todas las consultas que ordenan por fecha.

## 9. Verificación

- Vitest con TZ fijada en ART y casos cerca de medianoche (22:30).
- Tests de round-trip de DateOnly.
- `pnpm run build` y eslint.
- Backend: `dotnet build` y `dotnet test`.
- La migración y la limpieza de datos las aplica el usuario; el agente no ejecuta comandos sobre la base.
- QA manual: crear y editar una transacción, una transferencia, una compra, una suscripción y un pago; verificar el día mostrado en las listas.

## 10. Preguntas abiertas

- ¿Se adopta Temporal o se mantiene el adaptador sobre `Date`? (Fase 3)

## 11. Referencias

- `_docs/planning/credit-card-statements-plan.md`
- `_docs/planning/credit-card-ui-plan.md`
- `webapp/src/utils/dateHelpers.ts`
- `webapp/src/utils/dateHelpers.test.ts`
- `webapp/src/utils/dateSchema.ts`
- `webapp/src/features/credit-cards/statements/payments/paymentHelpers.ts`
- `backend/src/SmartPocket.Domain/Transactions/Transaction.cs`
- `backend/src/SmartPocket.Features/CreditCardStatements/Payments/Bulk/CreditCardStatementPaymentsBulkCommandHandler.cs`
