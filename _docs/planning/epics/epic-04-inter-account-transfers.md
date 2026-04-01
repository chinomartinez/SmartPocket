# Epic 4: Inter-Account Transfers

**Resultado de Usuario:** El usuario puede mover dinero entre sus cuentas de forma segura, con validación de saldo suficiente, actualización automática de balances, y capacidad de editar/eliminar transferencias con recalculación correcta.

**FRs cubiertos:** FR18, FR19, FR20, FR21, FR22, FR23

**Estado Actual:** ⏳ Pendiente de crear historias

---

## Stories Pendientes

_Las historias de esta épica serán definidas en una próxima sesión de planning._

### Funcionalidades a Cubrir

- Crear transferencias entre cuentas
- Actualización automática de balances en ambas cuentas
- Validar balance suficiente en cuenta origen
- Editar transferencias con recalculación automática
- Eliminar transferencias con recalculación automática
- Ver historial de transferencias

---

## Notas Técnicas Preliminares

- **Transaccionalidad Multi-Entidad**: Transferencias requieren `IDbContextTransaction` explícito (2 transacciones + 2 updates de balance atómicamente)
- **Editar Transferencia**: Revertir original + aplicar nueva en una transacción
- **Cache Invalidation**: Invalidar ambas cuentas involucradas
- **Validación**: Balance suficiente en cuenta origen antes de transferencia
