# SmartPocket

Aplicación de finanzas personales: cuentas, categorías, transacciones, transferencias,
recordatorios de pago, dashboard con métricas y transacciones recurrentes.

## Conceptos generales

**Transacción**:
Movimiento real de dinero en una cuenta. Impacta el balance.
_Avoid_: movimiento, operación

**Recordatorio**:
Notificación sobre un vencimiento próximo. Es una funcionalidad aparte de las transacciones
recurrentes.
_Avoid_: alerta, aviso

## Transacciones recurrentes

**Transacción recurrente**:
Regla que define un pago o ingreso que se repite en el tiempo: cuenta, categoría, tipo, monto
planificado, descripción, patrón y fin. Una frecuencia única representa un pago de una sola vez.
_Avoid_: evento recurrente, serie, recurrencia

**Patrón de recurrencia**:
Frecuencia, intervalo y días de la semana o del mes. Define cuándo ocurre la transacción recurrente.
_Avoid_: periodicidad

**Primer vencimiento**:
Fecha de la primera ocurrencia. Es la referencia del patrón y puede ser pasada o futura.

**Días de la semana**:
Días elegidos para una recurrencia semanal, de lunes a domingo. La UI preselecciona el del primer
vencimiento; siempre hay al menos uno.

**Días del mes**:
Días elegidos para una recurrencia mensual, del 1 al 31. Si un día no existe en el mes se ajusta al
último. La UI preselecciona el del primer vencimiento; siempre hay al menos uno.

**Ocurrencia**:
Instancia de una transacción recurrente en una fecha de vencimiento. Se persiste cuando vence.
_Avoid_: instancia, evento

**Vencimiento**:
Fecha de una ocurrencia. Es la clave que la identifica dentro de la transacción recurrente.
_Avoid_: fecha de pago, due date

**Programada**:
Ocurrencia futura que todavía no venció. Se proyecta desde el patrón y no se persiste.
_Avoid_: pendiente, próxima

**Pendiente**:
Ocurrencia vencida que está dentro de los días de gracia y todavía no se confirmó ni se omitió.
_Avoid_: vencida, impaga

**Vencida**:
Etiqueta de UI para una ocurrencia pendiente cuya fecha de vencimiento ya pasó. No es un estado
persistido.
_Avoid_: impaga, atrasada

**Confirmada**:
Ocurrencia pagada o cobrada. Tiene una transacción asociada.
_Avoid_: pagada, realizada

**Omitida**:
Ocurrencia que no se pagó ni se cobró. No tiene transacción asociada.
_Avoid_: salteada, cancelada

**Confirmación**:
Acto de marcar una ocurrencia como pagada o cobrada y crear la transacción.

**Pago**:
Confirmación de un gasto.

**Cobro**:
Confirmación de un ingreso.

**Omisión**:
Acto de marcar una ocurrencia como no pagada ni cobrada, sin crear transacción.

**Confirmación automática**:
Propiedad de la transacción recurrente que confirma la ocurrencia el día del vencimiento, dentro de
los días de gracia, sin intervención del usuario.
_Avoid_: pago automático, débito automático

**Confirmada por**:
Origen de una confirmación: manual o automática.

**Motivo de omisión**:
Por qué una ocurrencia quedó omitida: manual, gracia vencida o reemplazada por un cambio de patrón.

**Días de gracia**:
Días que una ocurrencia vencida permanece pendiente antes de pasar a omitida. Siete por defecto.

**Monto planificado**:
Monto sugerido de la transacción recurrente. Es el valor por defecto al confirmar y el que usa la
confirmación automática; no es un hecho hasta que se confirma.
_Avoid_: monto estimado, presupuesto

**Monto confirmado**:
Monto real de la transacción creada al confirmar. Puede diferir del planificado.

**Fecha de confirmación**:
Fecha en la que el pago o ingreso impacta en la cuenta. En la confirmación automática es el
vencimiento; en la manual la elige el usuario y no puede ser futura.

**Próxima ocurrencia**:
La ocurrencia programada o pendiente más antigua de una transacción recurrente. Es la que se muestra
en la lista y en el dashboard.
_Avoid_: próximo vencimiento

**Calendario**:
Secuencia completa de ocurrencias de una transacción recurrente, desde el primer vencimiento hasta su
fin o cancelación.

**Ancla**:
Punto de referencia del patrón: la semana del primer vencimiento en una semanal, o el mes y día en una
anual. En una mensual los días son explícitos.

**Horizonte**:
Ventana de la vista de Próximos: ocurrencias no resueltas hasta hoy + 90 días, más todas las vencidas.

**Fin de transacción recurrente**:
Límite opcional: una fecha tope o una cantidad de ocurrencias. Si no se define, es indefinida.

**Transacción recurrente cancelada**:
Deja de proyectar ocurrencias desde una fecha, pero conserva su historial.
_Avoid_: eliminada

**Transacción recurrente eliminada**:
Soft delete. Desaparece de la UI; las transacciones ya creadas se conservan porque son movimientos
reales.

**Zona horaria**:
Zona IANA del usuario que define "hoy" y cuándo corre el job. Los vencimientos no tienen hora; los
timestamps van en UTC.
