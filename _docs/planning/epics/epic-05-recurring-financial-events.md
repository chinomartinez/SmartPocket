# Epic 5: Recurring Financial Events

**Resultado de Usuario:** El usuario puede planificar pagos e ingresos recurrentes (facturas, salarios, suscripciones), marcarlos como pagados para convertirlos en transacciones, y gestionar patrones de recurrencia automática (diario, semanal, mensual, anual).

**FRs cubiertos:** FR24, FR25, FR26, FR27, FR28, FR29, FR30

**Estado Actual:** ⏳ Pendiente de crear historias

---

## Stories Pendientes

_Las historias de esta épica serán definidas en una próxima sesión de planning._

### Funcionalidades a Cubrir

- Crear próximos pagos con recurrencia
- Crear próximos ingresos con recurrencia
- Marcar próximos pagos/ingresos como pagado (conversión a transacción)
- Generación automática de entradas recurrentes
- Editar detalles de próximo pago/ingreso
- Eliminar entradas de próximos pagos/ingresos
- Ver lista de próximos eventos financieros

---

## Notas Técnicas Preliminares

- **Recurrence Patterns**: Diario, semanal, mensual, anual
- **Conversión a Transacción**: Marcar como pagado crea transacción real
- **Cache Invalidation**: Múltiples invalidaciones (pagos recurrentes, dashboard, transacciones)
- **Badges de Estado**: Días restantes, tipo de recurrencia
