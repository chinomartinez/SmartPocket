# Epic 3: Transaction Management

**Resultado de Usuario:** El usuario puede registrar ingresos y gastos diarios con velocidad (<30s), usar mini calculadora integrada para sumar componentes de gastos compuestos, filtrar y buscar transacciones históricas, y gestionar sus finanzas con tags opcionales y descripciones.

**FRs cubiertos:** FR11, FR12, FR13, FR14, FR15, FR16, FR17, FR17b

**Estado Actual:** ⏳ Pendiente de crear historias (~7 stories aproximadamente)

---

## Stories Pendientes

_Las historias de esta épica serán definidas en una próxima sesión de planning._

### Funcionalidades a Cubrir

- Registrar transacciones con fecha, monto, cuenta, categoría, descripción
- Agregar tags opcionales a transacciones
- Editar detalles de transacción
- Eliminar transacciones con soft delete y recalculación de balances
- Filtrar transacciones por períodos, rango fecha, cuenta, categoría, tags
- Buscar transacciones en tiempo real
- Ver historial de transacciones ordenado por fecha
- Mini calculadora integrada en modal de transacciones

---

## Notas Técnicas Preliminares

- **Cache Invalidation**: Crear/editar/eliminar transacción → invalidar `['accounts']`, `['dashboard']`
- **Balance Recalculation**: Automático al crear/editar/eliminar transacciones
- **Mini Calculadora**: Feature diferenciador crítico para velocidad de registro
- **Target Performance**: <30 segundos para registrar transacción completa (<20s ideal)
