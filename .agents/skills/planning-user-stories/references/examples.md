# Good vs Bad Examples

Ejemplos completos de historias de usuario bien y mal escritas.

---

## ✅ Good Example: Story (Enfoque Funcional Puro)

```markdown
# Epic 2: Category Management

## Story 2.6: Reordenamiento Manual de Categorías

**Estado:** Pending

**Como** usuario de SmartPocket,
**Quiero** reordenar mis categorías manualmente activando un modo de edición,
**Para que** las categorías más utilizadas aparezcan primero en los selectores,
acelerando el registro de transacciones.

### Acceptance Criteria

**Given** tengo múltiples categorías creadas en el sistema
**When** accedo a la página de gestión de categorías
**Then** veo todas mis categorías con un botón "Reordenar Categorías"

**And When** hago clic en el botón "Reordenar Categorías"
**Then** el sistema activa el modo de edición mostrando:

- Controles arrastrables visibles en cada categoría
- Botón "Guardar Orden" (primario)
- Botón "Cancelar" (secundario)
- Botones Crear/Editar/Eliminar deshabilitados

**And When** arrastro una categoría a una nueva posición
**Then** la interfaz actualiza visualmente el orden inmediatamente

**And When** hago clic en "Guardar Orden"
**Then** el sistema persiste el nuevo orden y muestra "Orden guardado exitosamente"

**And When** hago clic en "Cancelar" después de reordenar
**Then** el sistema revierte visualmente al orden original y desactiva el modo de edición

**And When** recargo la página después de guardar
**Then** las categorías mantienen el orden personalizado que configuré

**FRs Covered:** FR10b
```

**Strengths:**

- ✅ Título claro y orientado a usuario
- ✅ Estado explícito (Pending)
- ✅ User story con beneficio específico y medible ("acelerando el registro")
- ✅ AC cubre happy path + cancelación + persistence
- ✅ Flujos Given-When-Then observables desde perspectiva de usuario
- ✅ Sin mencionar implementación (endpoints, componentes, librerías)
- ✅ FR10b mapeado explícitamente

---

## ❌ Bad Example: Historia incompleta y técnica

```markdown
## Story 3.X: Crear transacción

El usuario puede crear transacciones.

### AC

- Debe funcionar
- Guardar en base de datos mediante POST /api/transactions
- Componente TransactionForm con react-hook-form
- Mostrar en lista con invalidación de cache TanStack Query

### Technical Notes

- Backend: TransactionCreateCommandHandler
- Frontend: Usar mutation hook useCreateTransaction
```

**Problemas:**

- ❌ Sin formato "Como...Quiero...Para que..."
- ❌ Sin estado asignado
- ❌ AC no usa Given-When-Then
- ❌ AC mezclados con detalles técnicos (POST, react-hook-form, TanStack Query)
- ❌ AC muy vagos ("debe funcionar" no es verificable por usuario)
- ❌ AC no cubre edge cases ni error handling
- ❌ Incluye "Technical Notes" (no van en historia funcional)
- ❌ No indica FRs cubiertos
- ❌ No testeable desde perspectiva de usuario
