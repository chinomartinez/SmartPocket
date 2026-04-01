# Epic 6: Financial Overview Dashboard

**Resultado de Usuario:** El usuario puede ver su estado financiero consolidado de un vistazo (balance total, ingresos, gastos, ahorros), revisar transacciones recientes, ver próximos pagos pendientes, y filtrar datos por rangos de fecha para análisis operacional rápido.

**FRs cubiertos:** FR31, FR32, FR33, FR34

**Estado Actual:** ⏳ Pendiente de crear historias

---

## Stories Pendientes

_Las historias de esta épica serán definidas en una próxima sesión de planning._

### Funcionalidades a Cubrir

- Ver tarjetas de resumen financiero consolidado
- Ver transacciones recientes de todas las cuentas
- Ver próximos pagos/ingresos en dashboard
- Filtrar datos de dashboard por rangos de fecha

---

## Notas Técnicas Preliminares

- **Arquitectura Home vs Dashboard**:
  - **Home (Operacional)**: Balance consolidado, transacciones recientes (últimas 5-10), próximos pagos pendientes
  - **Dashboard (Analítico)**: Gráficos, métricas, reportes detallados
- **Balance Siempre Visible**: Suma de todas las cuentas activas, animación counter
- **Cache**: Invalidaciones desde Epic 3, 4, 5
