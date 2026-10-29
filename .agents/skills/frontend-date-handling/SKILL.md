---
name: frontend-date-handling
description: Manejo de fechas de calendario en el frontend de SmartPocket. Usar al agregar o editar campos de fecha, DTOs, schemas Zod, date pickers, filtros por periodo, formateo de fechas, listas o cualquier lógica con DateOnly. Cubre dateHelpers, dateSchema, anti-patterns y checklist.
---

# SmartPocket - Frontend Date Handling

Reglas operativas para fechas date-only. El fundamento está en `_docs/planning/date-handling-plan.md` (plan cerrado); esta skill es el checklist de implementación.

---

## When to Use This Skill

- Agregar o editar un campo fecha en un DTO, form o filtro
- Validar fechas con Zod
- Precargar una fecha en modo edición
- Mostrar fechas en listas, cards o transacciones recientes
- Comparar o restar días entre fechas
- Tocar `dateHelpers.ts` o `dateSchema.ts`

**No usar para**: timestamps de auditoría (`CreatedAt`, logs). Esos son instantes, no días de calendario.

---

## Regla Base

`DateOnly` viaja como `string` `"YYYY-MM-DD"`. En TypeScript se tipa como `string`.

- `Date` representa un instante: no usarlo para fechas de negocio.
- No se adopta Temporal: quedó como no-go en la Fase 3.
- El backend serializa `DateOnly` como `"YYYY-MM-DD"`. El frontend no lo convierte a `Date`.

---

## Flujo: agregar un campo fecha

1. **DTO/command**: `effectiveDate: string; // YYYY-MM-DD (DateOnly)`.
2. **Schema**: usar `dateOnlySchema` de `@/utils/dateSchema`.
3. **Default**: `todayDateOnly()` en `getCreateValues()`.
4. **Input**: `<Input type="date" {...field} />`.
5. **Prefill edición**: `effectiveDate: entity.effectiveDate` (string directo).
6. **Payload**: `effectiveDate: data.effectiveDate` (sin hora ni conversión).
7. **Display**: `formatDateOnlyLabel()` o `formatRelativeDateOnly()`.

No agregues pasos intermedios ni adaptadores nuevos.

---

## Helpers disponibles

| Helper | Uso |
| --- | --- |
| `todayDateOnly()` | Fecha local de hoy como string |
| `toDateOnly(date: Date)` | Convierte un `Date` local a string |
| `toDateOnlyUtc(date: Date)` | Solo para cálculos UTC (cuotas) |
| `formatDateOnlyLabel(value, options?)` | Muestra `21/10/2026` sin corrimiento |
| `formatRelativeDateOnly(value)` | `Hoy`, `Ayer`, `Hace 3d`, fecha corta |
| `compareDateOnly(a, b)` | Ordena fechas date-only |
| `daysBetweenDateOnly(from, to)` | Días de calendario (`to - from`) |
| `getPeriodRange(period, customRange?)` | Rangos de filtros |
| `isValidDateOnly(value)` | Validación de calendario real |

`DateRange` (`from`/`to`) también vive en `dateHelpers`.

---

## Validación con Zod

```ts
import { dateOnlySchema } from "@/utils/dateSchema";

const schema = z.object({
  effectiveDate: dateOnlySchema,
});
```

- No uses `z.coerce.date()`: devuelve un instante y corre el día.
- No uses `z.coerce.string()`: acepta numbers/null y esconde errores de tipo.
- `dateOnlySchema` ya rechaza timestamps y fechas inexistentes.

---

## Anti-patterns

| Mal | Bien |
| --- | --- |
| `new Date("2026-10-21")` | Usar el string directo |
| `toISOString().slice(0, 10)` | `toDateOnly(new Date())` o `todayDateOnly()` |
| `new Date(entity.effectiveDate)` en prefill | `entity.effectiveDate` |
| Agregar hora manualmente (patrón viejo) | Enviar el string tal cual |
| Recortar un timestamp del backend con `slice(0, 10)` | El backend debe devolver `DateOnly` |
| `z.coerce.date()` | `dateOnlySchema` |
| `date.toLocaleDateString(...)` en una feature | `formatDateOnlyLabel(...)` |
| Comparar con `new Date(a) < new Date(b)` | `compareDateOnly(a, b)` |

---

## Checklist

- [ ] El DTO declara `string` con comentario `YYYY-MM-DD (DateOnly)`.
- [ ] El schema usa `dateOnlySchema`.
- [ ] El default usa `todayDateOnly()`.
- [ ] El prefill de edición usa el string del backend.
- [ ] El payload no agrega hora.
- [ ] La lista muestra la fecha con un helper.
- [ ] Los tests cubren formato o comparación si tocaste `dateHelpers`.

---

## Referencias

- `webapp/src/utils/dateHelpers.ts`
- `webapp/src/utils/dateSchema.ts`
- `webapp/src/features/transactions/TransactionFormModal.tsx`
- `webapp/src/features/transfers/TransferFormModal.tsx`
- `webapp/src/features/credit-cards/statements/payments/paymentHelpers.ts`
- `_docs/planning/date-handling-plan.md`
