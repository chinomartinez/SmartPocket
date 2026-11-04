# Glosario — Eventos financieros recurrentes

Términos canónicos del módulo 3.5. Se usan igual en documentación, código y UI. Si un término cambia acá, cambia en todos lados.

| Término | Nombre en código | Definición |
|---|---|---|
| **Serie** (o regla) | `RecurringEvent` | Configuración de un pago o ingreso: cuenta, categoría, tipo, monto planificado, descripción, patrón de recurrencia y fin. Una serie "única" representa un pago de una sola vez. Es lo único que se configura. |
| **Patrón de recurrencia** | `RecurrencePattern` | Frecuencia + intervalo + días de la semana o del mes. Define cómo se repite una serie. Ver ADR-003. |
| **Primer vencimiento** | `FirstDueDate` | Fecha de la primera ocurrencia de la serie. Es la referencia del patrón y puede ser pasada o futura. |
| **Días de la semana** | `Weekdays` | Días elegidos para una serie semanal (lunes a domingo). La UI preselecciona el del primer vencimiento; siempre hay al menos uno. |
| **Días del mes** | `MonthDays` | Días elegidos para una serie mensual (1 a 31). Si un día no existe en el mes, se ajusta al último. La UI preselecciona el del primer vencimiento; siempre hay al menos uno. |
| **Ocurrencia** | — (derivada) | Fecha concreta que le corresponde a una serie según su calendario. No se persiste: se calcula a partir del primer vencimiento y el patrón de recurrencia. |
| **Vencimiento** | `DueDate` | Fecha de una ocurrencia. Es la clave con la que se identifica una ocurrencia dentro de una serie: `(serie, fecha de vencimiento)`. |
| **Próxima ocurrencia** | — (derivada) | La ocurrencia sin liquidar más antigua de una serie. Es la que se muestra en la lista y en el dashboard. |
| **Calendario** | — (derivado) | Secuencia completa de ocurrencias de una serie, desde el primer vencimiento hasta su fin o cancelación. |
| **Liquidación** | `RecurringEventSettlement` | Registro que resuelve una ocurrencia. Puede ser un **pago** (con transacción) o una **omisión** (sin transacción). Una ocurrencia tiene como máximo una liquidación. |
| **Pago** | `SettlementType.Payment` | Liquidación que crea una transacción real. Guarda qué ocurrencia cubre y cuál es la transacción asociada. |
| **Omisión** | `SettlementType.Skip` | Liquidación que marca una ocurrencia como "no se pagó a propósito". No crea transacción y no afecta balances. |
| **Impago / Vencido** | — (derivado) | Ocurrencia cuya fecha ya pasó y no tiene liquidación. No se guarda como estado: se deduce comparando la fecha con hoy. |
| **Monto planificado** | `PlannedAmount` | Monto sugerido de la serie. Es solo el valor por defecto al pagar; no afecta balances ni historial. |
| **Monto pagado** | `Transaction.Amount` | Monto real de la transacción creada al pagar. Puede diferir del planificado en cada ocurrencia. |
| **Fecha de pago** | `Transaction.EffectiveDate` | Fecha en la que el pago impacta en la cuenta. La elige el usuario al pagar; por defecto es hoy y no puede ser futura. |
| **Ancla** | — | Punto de referencia del patrón: la semana del primer vencimiento (semanal) o el mes y día (anual). En mensual, los días son explícitos. |
| **Horizonte** | — | Ventana de la vista de Próximos: ocurrencias no liquidadas hasta hoy + 90 días, más todas las vencidas. |
| **Fin de serie** | `EndDate` / `EndCount` | Límite opcional: una fecha tope o una cantidad de ocurrencias. Si no se define, la serie es indefinida. |
| **Serie cancelada** | `CancelledAt` | Serie que deja de proyectar ocurrencias desde una fecha, pero conserva su historial. |
| **Serie eliminada** | `IsDeleted` | Soft delete de la serie. Desaparece de la UI; las transacciones ya creadas se conservan porque son movimientos reales. |
| **Pago automático** | — | Débito/crédito que ocurriría sin intervención del usuario. **Fuera de alcance del MVP**: no hay sincronización bancaria ni scheduler. |
| **Transacción recurrente** | `TransactionSourceType.RecurringEvent` | Transacción generada al pagar una ocurrencia. No se edita ni se elimina desde Transacciones: se deshace desde la serie. |
