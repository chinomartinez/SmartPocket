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

- `AddCurrentTimeToDate` interpreta la fecha del picker como local (antes UTC) y conserva la hora actual en el timestamp enviado.
- `TransactionFormModal` y `TransferFormModal` usan fecha local en el valor por defecto y en el prefill de edición.
- El default de creación se recalcula mediante el prop `values` de React Hook Form, sin `useEffect`.
- Los formularios con fecha por defecto (compra, suscripción, resumen, transacción y transferencia) calculan ese valor con una factory `getCreateValues()` usada tanto en `values` como en `form.reset`. Así el default se recalcula al abrir y al reabrir el formulario, aunque la app cruce medianoche.
- `CreditCardPurchaseFormDialog`, `CreditCardSubscriptionFormDialog` y `CreditCardStatementFormDialog` ya no usan `toISOString().slice(0, 10)`; el cierre se calcula con `formatDateToISO(new Date())`.
- `getDefaultDueDate` suma 15 días sobre el calendario local y formatea con `formatDateToISO`, calculando cierre y vencimiento desde el mismo instante.
- `formatDateToISO` documentado como fecha local, con guard para fechas inválidas.
- `parseDateFromISO` eliminado por no tener usos.
- Tests de regresión en `webapp/src/utils/dateHelpers.test.ts`.

Pendiente: ver sección 5 (hallazgos de las fases 1 y 2).

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
| `CreditCardStatement.ClosingDate` | `DateTime` | `DateOnly` | Hoy el frontend hace `.slice(0, 10)` |
| `CreditCardStatement.DueDate` | `DateTime` | `DateOnly` | Ídem |
| `CreditCardStatementPayment.EffectiveDate` | `DateTime` | `DateOnly` | Revisar la relación con `Transaction` |
| `Transaction.EffectiveDate` | `DateTime` | `DateOnly` (a confirmar) | El usuario no elige hora; hoy se agrega la hora actual |
| `Transfer.EffectiveDate` | `DateTime` | `DateOnly` (a confirmar) | Ídem |
| `CreatedAt` / `LastModifiedAt` | `DateTime` | `DateTime` UTC | Auditoría; no cambia |
| Timestamps de logs (`errorLogger`) | `Instant` | `Instant` | Técnicos; no cambia |
| `DayRangeDTO` (cierre/vencimiento habitual) | `int` | `int` | No es fecha |

## 5. Hallazgos pendientes

Los hallazgos de la Fase 0 están corregidos y se detallan en la sección 2. Quedan pendientes:

| Archivo | Problema | Impacto | Fase |
| --- | --- | --- | --- |
| `features/credit-cards/statements/CreditCardStatementFormDialog.tsx` | `.slice(0, 10)` sobre `DateTime` del backend (edición) | Funciona por la asunción "medianoche UTC"; frágil ante cambios de contrato | 2 |
| `features/credit-cards/statements/payments/paymentHelpers.ts` | `.slice(0, 10)` sobre `payment.effectiveDate` | Ídem | 2 |
| `features/credit-cards/statements/payments/CreditCardStatementPaymentsDialog.tsx` | Comparación por strings con `.slice(0, 10)` | Ídem | 2 |
| `utils/dateHelpers.ts` | `formatDateLocal` (instante → local) vs `formatDateOnly` (date-only → display) | Nombres ambiguos; elegir mal corre un día | 1 |
| `utils/dateHelpers.ts` | `formatDateToISO` devuelve fecha local, pero el nombre sugiere ISO/UTC | Riesgo de mal uso | 1 |
| `features/.../payments/paymentHelpers.ts` | `getInstallmentDate` hace la cuenta en UTC para replicar `AddMonths` del backend | Correcto, pero necesita comentario/test para que nadie lo "arregle" | 1 |
| `features/transactions/transactionSchema.ts`, `features/transfers/transferSchema.ts` | Validación con `Date.parse` acepta date-only y timestamps | No garantiza el formato del campo | 1 |
| `features/dashboard/upcomingPayments/UpcomingPayments.tsx` | `new Date("YYYY-MM-DD")` (UTC) contra `new Date()` local + `Math.ceil` | Con datos reales puede dar días corridos; hoy usa mock | 1 |
| `backend/.../Transaction.cs` | `EffectiveDate` es `DateTime` y se fuerza a UTC | Con DateOnly desaparece la hora y la conversión local | 2 |

## 6. Decisiones

- **D1**: Todo dato que el usuario elige es DateOnly. No se captura hora en ningún formulario.
- **D2**: `DateTime` queda reservado para auditoría (`CreatedAt`, `LastModifiedAt`) y timestamps técnicos. La probabilidad de pasar todos los contratos y entidades de negocio a `DateOnly` es alta; se confirma en la fase 2.
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
- `formatDateToISO` queda cubierto por los tests existentes de `dateHelpers`; `getDefaultDueDate` sigue privado al diálogo, sin test dedicado.

Criterios de aceptación:

- Abriendo los formularios a las 22:30 ART, la fecha es la del día local actual y el vencimiento es +15 días.
- Si la app queda abierta cruzando medianoche, al abrir el formulario la fecha es la nueva.
- Sin `toISOString().slice(0, 10)` en los formularios de creación.
- `pnpm run build`, eslint y tests en verde.

### Fase 1 - Capa de fechas centralizada (frontend)

Objetivo: que ninguna feature vuelva a improvisar con fechas.

API propuesta en `webapp/src/utils/dateHelpers.ts`:

```ts
// DateOnly
todayDateOnly(): string;
toDateOnly(date: Date): string;
formatDateOnlyLabel(value: string, options?: Intl.DateTimeFormatOptions): string;
compareDateOnly(a: string, b: string): number;

// Puente mientras el backend siga mandando DateTime para campos de calendario
dateOnlyFromDateTime(value: string): string;

// Instant / auditoría
nowInstant(): string;
formatInstantLabel(instant: string, options?: Intl.DateTimeFormatOptions): string;

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

Criterios de aceptación:

- Ninguna feature usa `new Date(string)` ni `.slice(0, 10)` para fechas de negocio.
- Tests de DateOnly e Instant con TZ fijada (ART) y casos a las 22:30.
- Sin cambios de comportamiento visibles.

### Fase 2 - Contratos del backend a DateOnly

Objetivo: eliminar las asunciones "este `DateTime` en realidad es una fecha".

Alcance probable:

- Statements: `ClosingDate`, `DueDate` → `DateOnly`.
- Payments: `EffectiveDate` → `DateOnly`.
- Transactions / Transfers: `EffectiveDate` → `DateOnly` (a confirmar).
- Auditoría (`CreatedAt`, `LastModifiedAt`) y logs: siguen `DateTime` UTC.

Impacto backend:

- DTOs, comandos y entidades.
- Validadores:
  - `EffectiveDate <= DateTime.UtcNow` → comparación de `DateOnly`.
  - `payment.EffectiveDate <= statement.ClosingDate`.
- `AddMonths` de sugerencias de cuotas.
- Consultas por rango y orden:
  - El listado de transacciones ya usa `ThenByDescending(CreatedAt)` como desempate; con DateOnly el orden intra-día queda cubierto por auditoría.
- Migraciones de columnas `DateTime` → `DateOnly`.

Impacto frontend:

- Tipos de DTO.
- Eliminación de `dateOnlyFromDateTime` y de `AddCurrentTimeToDate` / `withCurrentTime`.
- Formularios: envían el DateOnly tal cual, sin agregar hora.
- Prefill de edición: usa el DateOnly del backend directamente.

Criterios de aceptación:

- No queda ningún `.slice(0, 10)` en el frontend.
- Los formularios no agregan hora.
- Tests backend de serialización y validadores.
- Migración verificada con datos de ejemplo.

### Fase 3 - Temporal (opcional)

Objetivo: reemplazar la implementación de `Date` por `PlainDate` / `Instant` sin tocar las features.

- Adoptar `@js-temporal/polyfill` (o nativo si el soporte de navegadores lo permite).
- Migrar solo la implementación de `dateHelpers`.
- Mantener la API pública de la fase 1.
- Medir impacto en bundle y confirmar soporte.

Go/no-go: después de la fase 2.

## 8. Riesgos y migración de datos

- **Instantes con hora**: `Transaction.EffectiveDate` y `Transfer.EffectiveDate` hoy guardan la hora de creación/edición. Al pasar a DateOnly se pierde; aceptable porque el usuario nunca eligió hora.
- **Conversión de datos existentes**: hay que decidir con qué zona horaria se toma el día de un `DateTime` almacenado. Para un usuario en Argentina, lo esperable es el día local (ART), no el UTC.
- **Datos ya corridos**: los registros creados con el bug de UTC pueden tener la fecha un día antes. Una migración ingenua consolidaría el error. Antes de migrar, auditar `EffectiveDate` contra `CreatedAt`.
- **Backup y rollback**: snapshot previo y script reversible.
- **Validadores de fecha futura**: con DateOnly, comparar contra el día UTC permite hasta un día de diferencia con el día local. Definir la regla antes de implementar.
- **Orden intra-día**: ya existe desempate por `CreatedAt`; verificar todas las consultas que ordenan por fecha.

## 9. Verificación

- Vitest con TZ fijada en ART y casos cerca de medianoche (22:30).
- Tests de round-trip de DateOnly.
- `pnpm run build` y eslint.
- Backend: `dotnet build` y `dotnet test`.
- QA manual: crear y editar una transacción, una transferencia, una compra, una suscripción y un pago; verificar el día mostrado en las listas.

## 10. Preguntas abiertas

- ¿Se confirma `DateOnly` para `Transaction.EffectiveDate` y `Transfer.EffectiveDate`?
- ¿Cómo se migran los registros existentes que ya tienen el día corrido?
- ¿La validación de "no futura" se hace contra el día UTC o contra el día local del usuario?
- ¿`Payment.EffectiveDate` se expone como DateOnly y la `Transaction` asociada mantiene un instante para auditoría, o también pasa a DateOnly?
- ¿Se adopta Temporal o se mantiene el adaptador sobre `Date`?

## 11. Referencias

- `_docs/planning/credit-card-statements-plan.md`
- `_docs/planning/credit-card-ui-plan.md`
- `webapp/src/utils/dateHelpers.ts`
- `webapp/src/utils/dateHelpers.test.ts`
- `backend/src/SmartPocket.Domain/Transactions/Transaction.cs`
- `backend/src/SmartPocket.Features/CreditCardStatements/Payments/Bulk/CreditCardStatementPaymentsBulkCommandHandler.cs`
