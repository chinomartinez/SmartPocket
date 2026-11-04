# SmartPocket

Aplicación de finanzas personales: cuentas, categorías, transacciones, transferencias,
recordatorios de pago, dashboard con métricas y eventos recurrentes.

## Eventos recurrentes

**Serie** (o regla):
Configuración de un pago o ingreso: cuenta, categoría, tipo, monto planificado, descripción,
patrón de recurrencia y fin. Una serie "única" representa un pago de una sola vez.
_Avoid_: recurrencia, evento recurrente

**Patrón de recurrencia**:
Frecuencia, intervalo y días de la semana o del mes. Define cómo se repite una serie.
_Avoid_: periodicidad, frecuencia

**Primer vencimiento**:
Fecha de la primera ocurrencia de la serie. Es la referencia del patrón y puede ser pasada o futura.

**Días de la semana**:
Días elegidos para una serie semanal, de lunes a domingo. La UI preselecciona el del primer
vencimiento y siempre hay al menos uno.

**Días del mes**:
Días elegidos para una serie mensual, del 1 al 31. Si un día no existe en el mes se ajusta al
último. La UI preselecciona el del primer vencimiento y siempre hay al menos uno.

**Ocurrencia**:
Fecha concreta que le corresponde a una serie según su calendario. No se persiste: se calcula a
partir del primer vencimiento y el patrón de recurrencia.
_Avoid_: instancia, evento

**Vencimiento**:
Fecha de una ocurrencia. Es la clave que identifica una ocurrencia dentro de una serie.
_Avoid_: fecha de pago, due date

**Próxima ocurrencia**:
La ocurrencia sin liquidar más antigua de una serie. Es la que se muestra en la lista y en el
dashboard.
_Avoid_: próximo vencimiento

**Calendario**:
Secuencia completa de ocurrencias de una serie, desde el primer vencimiento hasta su fin o
cancelación.

**Liquidación**:
Registro que resuelve una ocurrencia. Puede ser un pago, con transacción, o una omisión, sin
transacción. Una ocurrencia tiene como máximo una liquidación.
_Avoid_: resolución, cierre

**Pago**:
Liquidación que crea una transacción real. Guarda qué ocurrencia cubre y cuál es la transacción
asociada.
_Avoid_: abono, cobro

**Omisión**:
Liquidación que marca una ocurrencia como "no se pagó a propósito". No crea transacción y no
afecta balances.
_Avoid_: salto, skip

**Impago** / **Vencido**:
Ocurrencia cuya fecha ya pasó y no tiene liquidación. No se guarda como estado: se deduce
comparando la fecha con hoy.
_Avoid_: atrasado, pendiente

**Monto planificado**:
Monto sugerido de la serie. Es solo el valor por defecto al pagar; no afecta balances ni historial.

**Monto pagado**:
Monto real de la transacción creada al pagar. Puede diferir del planificado en cada ocurrencia.

**Fecha de pago**:
Fecha en la que el pago impacta en la cuenta. La elige el usuario al pagar; por defecto es hoy y no
puede ser futura.

**Ancla**:
Punto de referencia del patrón: la semana del primer vencimiento en una serie semanal, o el mes y
día en una anual. En una mensual los días son explícitos.

**Horizonte**:
Ventana de la vista de Próximos: ocurrencias no liquidadas hasta hoy + 90 días, más todas las
vencidas.

**Fin de serie**:
Límite opcional de una serie: una fecha tope o una cantidad de ocurrencias. Si no se define, la
serie es indefinida.

**Serie cancelada**:
Serie que deja de proyectar ocurrencias desde una fecha, pero conserva su historial.
_Avoid_: serie eliminada

**Serie eliminada**:
Serie con soft delete. Desaparece de la UI; las transacciones ya creadas se conservan porque son
movimientos reales.

**Pago automático**:
Débito o crédito que ocurriría sin intervención del usuario. Fuera de alcance del MVP: no hay
sincronización bancaria ni scheduler.

**Transacción recurrente**:
Transacción generada al pagar una ocurrencia. No se edita ni se elimina desde Transacciones: se
deshace desde la serie.
