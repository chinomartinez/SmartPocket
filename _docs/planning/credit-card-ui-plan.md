# SmartPocket - Plan de UI para tarjetas de crédito

## 1. Propósito

Definir el primer diseño de interfaz para el módulo de tarjetas de crédito antes de implementar la UI y consumir los endpoints. El plan busca servir como contexto para futuras sesiones de desarrollo y puede cambiar a medida que se valide la experiencia.

Este documento describe la UI inicial. No reemplaza los FRs de la fase 3.10 del roadmap ni pretende cerrar todavía el contrato de resúmenes y pagos.

## 1.1. Modelo mental del módulo

Este módulo **no representa la gestión bancaria de una tarjeta**. SmartPocket no está conectado a bancos, financieras ni procesadores de pagos, por lo que no existe sincronización automática de consumos, límites, cierres o pagos.

La tarjeta de crédito se trata como una cuenta financiera manual dentro de la aplicación. El usuario registra las actividades que realiza con ella para llevar su propio control, del mismo modo que registra ingresos, gastos y pagos en sus cuentas.

Implicaciones para la UI:

- Los datos mostrados representan registros cargados por el usuario, no información oficial del banco.
- El límite, consumo, fechas y estados son referencias de control personal.
- Las fechas de cierre y vencimiento pueden variar en cada resumen. La fecha configurada en la tarjeta es sólo una sugerencia o valor inicial.
- El usuario puede corregir sus registros en la aplicación según las reglas del dominio. La UI no debe comunicar que una compra es inmutable por haber ocurrido en el mundo real.
- Eliminar una compra en SmartPocket elimina o archiva el registro de la aplicación; no intenta cancelar la compra real realizada con la tarjeta.
- Registrar un pago en SmartPocket registra la transacción personal asociada al resumen; no ejecuta ni verifica un pago ante el banco.
- No se deben usar textos como "sincronizar", "actualizado por el banco", "estado de cuenta oficial" o "pago procesado".

La interfaz debe comunicar control y trazabilidad personal, no autoridad bancaria. Cuando una acción tenga impacto sólo dentro de SmartPocket, ese alcance debe quedar claro en confirmaciones, empty states y mensajes de éxito.

## 2. Idea central

Agregar una opción **Tarjetas de crédito** en el menú principal. La opción lleva a una pantalla única desde la cual se administra el registro personal de actividad asociado a una tarjeta:

- Tarjetas de crédito.
- Compras en cuotas.
- Suscripciones.
- Cuotas y pagos pendientes de la tarjeta.
- Resúmenes de la tarjeta.

La pantalla debe priorizar la tarjeta seleccionada y evitar separar prematuramente el módulo en muchas rutas o pantallas.

## 3. Estructura de la pantalla

### 3.1 Encabezado

- Título: **Tarjetas de crédito**.
- Descripción breve orientada a la acción: administrar tarjetas, consumos y resúmenes.
- Acción principal: **Agregar tarjeta**.
- En desktop, la acción puede estar en el encabezado y también existir como tarjeta al final de la fila.

### 3.2 Selector de tarjetas

Las tarjetas se muestran como cards horizontales, una al lado de la otra.

Cada card debería mostrar, como mínimo:

- Nombre de la tarjeta.
- Ícono y/o color identificatorio.
- Moneda.
- Límite de crédito.
- Un resumen visual de uso disponible o consumos, si el endpoint lo permite.
- Rango habitual de cierre.
- Rango habitual de vencimiento.
- Indicador visual de tarjeta seleccionada.
- Menú de acciones para editar y eliminar.

Comportamiento:

- Toda la card es cliqueable para seleccionar la tarjeta.
- La tarjeta seleccionada queda claramente destacada.
- Al ingresar, se selecciona automáticamente la primera tarjeta disponible.
- Si no hay tarjetas, no se muestra una sección vacía de contenido: se muestra un empty state con CTA para crear la primera.
- La card **Agregar tarjeta** aparece al final de la fila.
- El límite visual de tarjetas es bajo; no se necesita una grilla paginada.

Responsive:

- Desktop: fila horizontal con cards de ancho consistente.
- Mobile: carrusel horizontal con scroll táctil, snap por card y sin comprimir la información de cada tarjeta.
- El carrusel debe conservar visible la acción de agregar tarjeta.
- La selección debe poder realizarse con teclado en desktop y con touch en mobile.

### 3.3 Contenido de la tarjeta seleccionada

Debajo del selector se muestra el detalle de la tarjeta activa. El contenido se organiza en dos bloques principales:

1. **Compras y suscripciones**: listado operativo y acciones CRUD.
2. **Resúmenes**: listado compacto de resúmenes y acceso a su detalle cuando exista suficiente API.

El contenido debe actualizarse al cambiar de tarjeta sin recargar la página completa.

### 3.4 Formulario de tarjeta

El flujo de crear y editar tarjeta utiliza un dialog reutilizable y contiene únicamente datos propios del modelo actual:

- Nombre.
- Ícono y color.
- Moneda.
- Límite configurado.
- Rango habitual de cierre.
- Rango habitual de vencimiento.

Los rangos se editan como día inicial y día final. Debe permitirse un rango que cruce el fin de mes, como `26 al 2`. El formulario debe explicar que son referencias habituales y no fechas confirmadas por un banco.

El formulario está conectado al CRUD del backend para crear y editar tarjetas.

## 4. Sección Compras y Suscripciones

### 4.1 Encabezado y acciones

- Título: **Compras y suscripciones**.
- Botón **Agregar compra**.
- Botón **Agregar suscripción**.
- Opcionalmente, un menú único **Agregar** si el espacio mobile es reducido.

### 4.2 Filtros

Filtros previstos:

- Tipo: todas, compras, suscripciones.
- Estado: todos, en proceso, pagada, finalizada, activa, cancelada.
- Periodo o fecha efectiva.
- Categoría.
- Búsqueda por descripción.

Los filtros deben ser combinables y mostrar un estado claro cuando no existen resultados. La implementación actual comienza con tipo y búsqueda; el backend también soporta estado, pero el control visual todavía debe incorporarse junto con periodo y categoría.

### 4.3 Listado

Cada fila o card de consumo debería mostrar:

- Descripción.
- Tipo de registro.
- Categoría.
- Fecha efectiva.
- Monto y moneda.
- Cantidad de cuotas o indicación de suscripción.
- Estado.
- Acciones de editar y eliminar.
- Acción de cancelar para suscripciones activas.

En mobile, el listado se transforma en cards apiladas o filas con acciones en un menú contextual. No se debe exigir una tabla ancha con scroll horizontal para operar.

Reglas de interacción:

- Crear y editar se realiza mediante un dialog reutilizable.
- El dialog cambia sus campos según sea compra o suscripción.
- Eliminar usa `AlertDialog` y explica el impacto sobre cuotas y resúmenes.
- Las acciones deshabilitadas por reglas de negocio deben comunicar el motivo, no desaparecer silenciosamente.
- Una compra con cuotas no debe presentar las cuotas como registros editables individuales.

## 5. Sección Resúmenes

Esta sección forma parte del primer layout, pero su contenido exacto queda sujeto a la API que todavía falta definir.

### 5.1 Primera versión visual

Usar un listado compacto por resumen, con información suficiente para identificarlo sin competir visualmente con las compras:

- Fecha de cierre.
- Fecha de vencimiento real.
- Estado: cerrado o pagado.
- Total incluido.
- Total pagado, si está disponible.
- Diferencia, si está disponible.
- Cantidad de cuotas/pagos incluidos.
- Acción para ver o gestionar.

El listado debe ordenarse por fecha de cierre descendente, mostrando primero el resumen más reciente.

### 5.2 Preview de resumen

El flujo previsto para crear un resumen es:

1. El usuario inicia **Nuevo resumen** para la tarjeta seleccionada.
2. Selecciona o confirma la fecha de cierre real.
3. Selecciona o confirma la fecha de vencimiento real.
4. La UI consulta un preview no persistido.
5. Se muestran grupos de ítems sugeridos y atrasados.
6. El usuario incluye o excluye cuotas y pagos.
7. El usuario confirma y se crea el resumen.

El preview debe diferenciar visualmente sugeridos de atrasados y mantener visible el origen del consumo. No se debe implementar como un formulario de cuotas independientes.

### 5.3 Acciones condicionadas por estado

- Resumen cerrado sin pagar: editar o eliminar.
- Resumen pagado: consultar y gestionar pagos, sin modificar las cuotas incluidas.
- Eliminación de resumen: confirmación explícita e información sobre la devolución de cuotas al pool.

Hasta contar con endpoints de listado, detalle, preview, eliminación y pagos, la UI puede incluir el bloque como placeholder funcional o limitarse a la estructura visual, sin inventar datos persistidos.

## 6. Estados de la pantalla

### Sin tarjetas

- Ícono de tarjeta.
- Título: **Aún no tenés tarjetas de crédito**.
- Descripción breve.
- CTA: **Agregar primera tarjeta**.

### Tarjeta sin consumos

- Mantener visible la tarjeta seleccionada.
- Empty state en compras y suscripciones.
- CTA para agregar compra o suscripción.

### Sin resultados por filtros

- Indicar que los filtros no encontraron resultados.
- Acción para limpiar filtros.

### Carga

- Skeletons para la fila de tarjetas.
- Skeletons para el listado de consumos y resúmenes.
- Nunca mostrar una pantalla completamente en blanco.

### Error

- ErrorAlert en el bloque afectado cuando sea posible.
- Mantener disponible el selector de tarjetas si la carga de consumos falla.
- Permitir reintentar.

## 7. Navegación y rutas iniciales

Agregar una entrada de Sidebar con una ruta propia, inicialmente sugerida como:

- Label: `Tarjetas de crédito`
- Ruta: `/credit-cards`
- Ícono: `CreditCardIcon` u otro ícono que no se confunda con `Cuentas`.

La primera versión puede ser una única ruta. No se propone todavía crear rutas separadas para compras, resúmenes o pagos; esos recursos viven dentro del contexto de la tarjeta seleccionada.

## 8. Arquitectura frontend actual

Feature implementada en `webapp/src/features/credit-cards/`.

Estructura actual:

```text
features/credit-cards/
  CreditCardsPage.tsx
  creditCardActivityConstants.ts
  cards/
    CreditCardCarousel.tsx
    CreditCardFormDialog.tsx
    CreditCardHeader.tsx
    CreditCardsEmptyState.tsx
    CreditCardsLoadingState.tsx
    SelectedCreditCardOverview.tsx
    creditCardHelpers.ts
    creditCardSchema.ts
  activities/
    CreditCardActivitySection.tsx
    CreditCardActivityItem.tsx
    CreditCardPurchaseFormDialog.tsx
    CreditCardSubscriptionFormDialog.tsx
    creditCardActivitySchema.ts
  statements/
    CreditCardStatementList.tsx
```

Los servicios y hooks de API viven en `webapp/src/api/services/credit-cards/` y utilizan `spApiClient` y TanStack Query. La feature mantiene separados los componentes de tarjetas, actividades y resúmenes sin separar todavía estas áreas en rutas propias.

## 9. Orden de implementación de la UI

### Iteración 1: Shell y tarjetas

- Ruta `/credit-cards`.
- Entrada en Sidebar.
- Layout responsive.
- Listado/carrusel de tarjetas.
- Selección de tarjeta.
- Empty, loading y error states.
- CRUD de tarjetas disponible para crear y editar; la eliminación y el menú de acciones de cada tarjeta todavía deben completarse en la UI.

### Iteración 2: Compras y suscripciones

- Listado de la tarjeta seleccionada.
- Filtros iniciales.
- Crear, editar y eliminar compra.
- Crear, editar, cancelar y eliminar suscripción.
- Badges y restricciones de estado.
- Endpoint combinado y paginado de actividades: `GET /CreditCards/{id}/activities`.
- Búsqueda y filtro inicial por tipo.
- Formularios separados para compras y suscripciones.
- Selector de categorías con íconos y selector de monedas permitidas.
- Acciones contextuales de editar, eliminar y cancelar suscripciones activas.

**Estado:** implementada en frontend y backend. Quedan mejoras menores de UX, como debounce de búsqueda, filtro visual por estado y confirmación específica para cancelar una suscripción.

### Iteración 3: Resúmenes

- Listado compacto.
- Nuevo resumen y preview.
- Selección de cuotas/pagos.
- Confirmación, edición y eliminación según estado.

**Estado:** pendiente. El bloque visual existe con datos mock; todavía no consume el CRUD real de resúmenes ni existe el preview de candidatos.

### Iteración 4: Pagos

- Asociación de transacciones a un resumen.
- Pagos en múltiples monedas.
- Totales incluido/pagado/diferencia.
- Edición y eliminación con confirmaciones.

**Estado:** pendiente. Depende del contrato definitivo de resúmenes y pagos.

## 10. Fechas de tarjetas y resúmenes

### 10.1 Rangos habituales de la tarjeta

El CRUD de tarjetas utiliza dos rangos de días:

- `StatementClosingRange`: rango habitual de cierre.
- `PaymentDueRange`: rango habitual de vencimiento.

Cada rango tiene un `StartDay` y un `EndDay`, ambos entre `1` y `31`. Se permite que el inicio sea mayor que el final para representar rangos que cruzan el fin de mes. Por ejemplo, `26 -> 2` representa del 26 al 2 del mes siguiente.

En la card de la tarjeta deben mostrarse como referencias, nunca como fechas exactas:

```text
Cierre habitual: 26 al 2
Vencimiento habitual: 4 al 13
```

Debe utilizarse lenguaje como `habitual`, `sugerido` o `rango de referencia`. No debe mostrarse como `cierra el 26` ni `vence el 4`.

### 10.2 Fechas reales del resumen

Cada resumen tiene sus propias fechas reales y ambas son obligatorias:

- `ClosingDate`: fecha real de cierre del resumen.
- `DueDate`: fecha real de vencimiento del resumen.

El formulario de creación y edición de resúmenes debe mostrar ambos campos. La UI puede usar los rangos de la tarjeta para proponer valores iniciales, pero el usuario debe poder modificar las dos fechas antes de guardar.

El preview se calcula utilizando el `ClosingDate` confirmado para ese resumen. Los rangos habituales de la tarjeta no reemplazan las fechas reales y no deben utilizarse para afirmar cuál será el próximo cierre.

### 10.3 Impacto en la UI actual

- Reemplazar en las cards los valores puntuales de cierre/vencimiento por sus rangos habituales.
- Mantener una etiqueta o ayuda visual que indique que son referencias manuales.
- Mantener eliminada la sección `Próximo cierre`, porque sería redundante y podría comunicar una precisión inexistente.
- Mostrar en el listado de resúmenes las fechas concretas de cada resumen.
- Evitar lenguaje de sincronización bancaria: todos los datos son registros manuales del usuario.

### 10.4 Métricas estimadas de la tarjeta

El bloque de la tarjeta seleccionada puede mostrar métricas calculadas por SmartPocket, pero no datos reales de la entidad emisora:

- `Pendiente registrado`.
- `Disponible estimado`.
- `Uso estimado del límite`.

El pendiente se calcula únicamente en la moneda base de la tarjeta y considera obligaciones registradas que todavía están pendientes. No debe sumar indiscriminadamente compras históricas ni presentarse como el consumo real informado por el banco.

La UI debe mostrar una ayuda contextual similar a:

```text
Estimación basada en los registros pendientes de SmartPocket. No representa el disponible real informado por el banco.
```

El backend dispone de la consulta y la UI ya la consume:

```text
GET /CreditCards/{id}/overview
```

Las métricas actuales se calculan desde el overview de SmartPocket y se presentan explícitamente como estimaciones basadas en registros manuales.

### 10.5 Estado actual de implementación

- La ruta `/credit-cards`, el encabezado y el selector/carrusel de tarjetas están implementados.
- El formulario de crear/editar tarjeta está conectado al backend.
- El endpoint `GET /CreditCards/{id}/overview` está integrado en el bloque de métricas.
- El listado de actividades consume el endpoint combinado y paginado `GET /CreditCards/{id}/activities`.
- Compras y suscripciones tienen formularios separados conectados a create/update/delete.
- Las suscripciones activas pueden cancelarse desde el menú contextual.
- La actividad utiliza un read model unificado sin unificar las entidades de dominio.
- El bloque de resúmenes continúa utilizando datos mock y todavía no está conectado a API.
- El preview de resúmenes, la selección de cuotas/cargos y los pagos todavía no están implementados.
- Los resúmenes utilizan conceptualmente los estados `Closed` y `Paid`.

## 11. Decisiones abiertas

- Qué métricas adicionales mostrar en cada card de tarjeta, más allá del overview actual.
- Si el detalle de la tarjeta usa tabs, secciones apiladas o un layout con dos columnas.
- Qué información mínima debe mostrar cada resumen en el listado.
- Si el detalle de resumen se abre en dialog, drawer o una ruta propia.
- Cómo se visualizan importes en tarjetas con compras en ARS y USD.
- Si el usuario puede crear un resumen desde el encabezado de la sección o desde una card de resumen vacía.
- Qué endpoints de resumen y pagos estarán disponibles antes de comenzar la Iteración 3.
- Contrato del preview y reglas para sugerir cuotas y cargos.
- Cómo se determina la inclusión de una suscripción en un resumen nuevo.
- Confirmar colores y badges definitivos para estados de compras y suscripciones.

## 12. Criterios para pasar a implementación

- Confirmar la información mínima de la card de tarjeta.
- Mantener el listado combinado de compras y suscripciones con filtros por tipo.
- Confirmar la información mínima del resumen compacto.
- Identificar endpoints disponibles y endpoints faltantes para resúmenes, preview y pagos.
- Validar el flujo mobile del carrusel y de los formularios.
- Mantener los cambios de FRs del roadmap sincronizados si las decisiones de producto modifican el alcance.

## 13. Referencias

- `_docs/planning/roadmap.md`, fase 3.10.
- `backend/src/SmartPocket.Domain/CreditCards/smart-pocket-tarjeta-credito-diseno.md`.
- `_docs/technical/ux-design-specification.md`.
- `_docs/design/DESIGN.md`.
