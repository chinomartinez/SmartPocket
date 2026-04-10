## Story 2.6: Reordenamiento Manual de Categorías

**Estado:** COMPLETADO!

**Como** usuario de SmartPocket,
**Quiero** reordenar mis categorías manualmente activando un modo de edición y guardando los cambios cuando esté satisfecho,
**Para que** las categorías más utilizadas aparezcan primero en los selectores y formularios, acelerando el registro de transacciones.

**FRs Covered:** FR10b

### Acceptance Criteria

**Given** tengo múltiples categorías creadas en el sistema  
**When** accedo a la página de gestión de categorías  
**Then** veo todas mis categorías con un botón "Reordenar Categorías"

**And When** hago clic en el botón "Reordenar Categorías"  
**Then** el sistema activa el modo de edición mostrando:

- Controles drag-and-drop visibles en cada categoría
- Botón "Guardar Orden" (primario)
- Botón "Cancelar" (secundario)
- Otros botones de acciones deshabilitados (Crear, Editar, Eliminar)

**And Given** el modo de reordenamiento está activo  
**When** arrastro una categoría a una nueva posición  
**Then** el sistema actualiza inmediatamente el orden visual en la interfaz (sin persistir en backend)

**And When** arrastro múltiples categorías cambiando el orden varias veces  
**Then** la interfaz refleja todos los cambios visualmente pero no persiste nada hasta confirmar

**And Given** he reordenado las categorías y estoy satisfecho con el resultado  
**When** hago clic en el botón "Guardar Orden"  
**Then** el sistema envía una sola llamada API con el nuevo orden completo de todas las categorías

**And When** la API confirma el guardado exitoso  
**Then** el sistema muestra notificación de éxito, desactiva el modo de edición, y habilita las acciones normales

**And Given** he reordenado las categorías pero no me gusta el resultado  
**When** hago clic en el botón "Cancelar"  
**Then** el sistema revierte visualmente al orden original antes de activar el modo de edición

**And When** cancelo el reordenamiento  
**Then** el sistema desactiva el modo de edición y habilita las acciones normales sin hacer llamada a la API

**And Given** el reordenamiento fue guardado exitosamente  
**When** abro un formulario de transacción  
**Then** las categorías aparecen en el nuevo orden personalizado que configuré

**And Given** estoy en modo de reordenamiento  
**When** intento crear, editar o eliminar una categoría  
**Then** esas acciones están deshabilitadas hasta que salga del modo de reordenamiento

**And Given** el guardado del reordenamiento falla (error de red o validación)  
**When** la API retorna error  
**Then** el sistema muestra mensaje de error específico y mantiene el modo de edición activo para reintentar

**And When** recargo la página después de guardar exitosamente  
**Then** las categorías mantienen el orden personalizado que configuré
