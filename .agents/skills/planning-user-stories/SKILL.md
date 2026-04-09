---
name: planning-user-stories
description: Create or edit functional user stories for SmartPocket epics based on FRs. Use when breaking down epics into user-focused stories, mapping FRs to user stories, writing acceptance criteria in Given-When-Then format, or reviewing story quality. Purely functional - no technical implementation details. Includes states (pending/active/completed), templates, validation rules.
license: Complete terms in LICENSE.txt
---

# SmartPocket - User Story Creation (Functional)

Skill para crear y editar historias de usuario **puramente funcionales** para épicas de SmartPocket basadas en requisitos funcionales (FRs) del PRD.

**Alcance:** Solo aspectos funcionales y valor de usuario. Sin decisiones técnicas, arquitectura, o implementación.

---

## When to Use This Skill

- Crear historias de usuario nuevas para una épica (solo aspecto funcional)
- Editar/mejorar historias existentes que no cumplen estándares funcionales
- Mapear requisitos funcionales (FRs) a historias de usuario
- Escribir acceptance criteria en formato Given-When-Then (comportamiento observable del usuario)
- Validar que una historia cumple con Definition of Ready funcional
- Revisar calidad funcional de historias (completitud, claridad, testability)
- Cambiar estado de historias (pending → active → completed)

**NO usar esta skill para:**

- Decisiones técnicas (arquitectura, endpoints, componentes, librerías)
- Notas de implementación (eso va en skills de implementación técnica)
- Diseño UX detallado (eso informa la history, pero no es parte del documento)

---

## Prerequisites

Antes de crear una historia de usuario funcional, asegúrate de tener acceso a:

- **Epic document** (en `_docs/planning/epics/epic-XX-*.md`) - Contexto de la épica
- **Functional Requirements** (en `_docs/planning/epics.md`) - Lista completa de FRs del proyecto
- **Product Requirements Document (PRD)** (en `_docs/planning/prd.md`) - Requisitos funcionales detallados y contexto del producto
- **Project context** (en `.github/copilot-instructions.md`) - Convenciones generales

---

## Step-by-Step Workflow

### Step 1: Identificar el FR y contexto funcional

1. Lee el **epic document** para entender el módulo/feature
2. Identifica el **Functional Requirement (FR)** específico que vas a cubrir
3. Confirma que el FR no está ya cubierto por otra historia en la épica
4. Identifica el **valor de usuario** o **problema** que resuelve el FR

**Ejemplo:**

```
FR10b: El usuario puede reordenar categorías manualmente para priorizar
       las más utilizadas en selección de transacciones

Valor: Acelerar el registro de transacciones al tener categorías frecuentes primero
Problema: Usuario pierde tiempo buscando categorías en una lista larga
```

### Step 2: Escribir el título de la historia

**Formato:** `Story X.Y: [Acción Clara del Usuario]`

**Reglas:**

- Numeración: `X` = número de épica, `Y` = número secuencial en la épica
- Acción: Verbo + sustantivo que describe qué hace el usuario
- Longitud: 3-8 palabras, no más de 60 caracteres
- Claro: Sin jerga técnica, enfocado en valor de usuario

**✅ Buenos ejemplos:**

```
Story 2.6: Reordenamiento Manual de Categorías
Story 3.1: Registro de Transacciones
Story 4.2: Validación de Balance en Transferencias
```

**❌ Malos ejemplos:**

```
Story 2.6: Drag and Drop                    ← Demasiado vago
Story 3.1: CRUD de Transacciones            ← Jerga técnica (CRUD)
Story 4.2: Implementar lógica de validación ← Enfoque técnico, no de usuario
```

### Step 3: Escribir el resultado de usuario (User Story statement)

**Formato:** Como [rol], Quiero [acción], Para que [beneficio]"

**Reglas:**

- **Rol:** Siempre "usuario de SmartPocket" (single-user app en MVP)
- **Acción:** Qué quiere hacer el usuario (específico, medible)
- **Beneficio:** Por qué lo quiere hacer (valor de negocio, mejora UX)

**✅ Buen ejemplo:**

```markdown
**Como** usuario de SmartPocket,
**Quiero** reordenar mis categorías manualmente activando un modo de edición,
**Para que** las categorías más utilizadas aparezcan primero en los selectores,
acelerando el registro de transacciones.
```

**❌ Mal ejemplo:**

```markdown
Como desarrollador, ← Rol incorrecto (no es user story, es tarea técnica)
Quiero implementar drag-and-drop, ← Enfoque en implementación
Para que el código esté ordenado. ← Beneficio no es para usuario
```

### Step 4: Escribir Acceptance Criteria (AC)

**Formato:** Given-When-Then (Gherkin style)

**Estructura:**

```
**Given** [precondición/contexto inicial]
**When** [acción del usuario]
**Then** [resultado esperado observable]

**And Given/When/Then** [continuación del flujo]
```

**Reglas:**

- Un AC por flujo/escenario de usuario
- Cubrir **happy path** + **edge cases** + **error handling**
- Observable: El resultado debe ser verificable visualmente/funcionalmente por el usuario
- Sin detalles de implementación (endpoints, componentes, estado interno)
- Lenguaje de usuario, no técnico

**✅ Buen ejemplo:**

```markdown
**Given** tengo múltiples categorías creadas en el sistema
**When** accedo a la página de gestión de categorías
**Then** veo todas mis categorías con un botón "Reordenar Categorías"

**And When** hago clic en el botón "Reordenar Categorías"
**Then** el sistema activa el modo de edición mostrando:

- Controles para arrastar y soltar visibles en cada categoría
- Botón "Guardar Orden" (primario)
- Botón "Cancelar" (secundario)
- Otros botones deshabilitados (Crear, Editar, Eliminar)
```

**❌ Mal ejemplo:**

```markdown
Given el endpoint /api/categories retorna 200 ← Detalle técnico
When el usuario hace POST a /api/categories/reorder ← Implementación
Then el estado Redux se actualiza ← Detalle de implementación interno
```

**Cobertura mínima requerida:**

- ✅ Happy path (flujo exitoso sin errores)
- ✅ Edge cases (datos vacíos, límites, valores nulos)
- ✅ Error handling (red caída, validación fallida)
- ✅ State transitions (cambios de modo, confirmación vs cancelación)
- ✅ Persistence (recargar página mantiene cambios guardados)

### Step 5: Indicar FRs cubiertos

Al final de la historia, listar explícitamente qué FRs se cubren:

```markdown
**FRs Covered:** FR10b
```

Si cubre múltiples:

```markdown
**FRs Covered:** FR11, FR12, FR13
```

### Step 6: Asignar estado inicial

Toda historia nueva debe tener un estado explícito al crearla:

```markdown
**Estado:** Pending
```

Ver sección "Story States" abajo para ciclo de vida completo.

---

## Story States

### Ciclo de Vida de una Historia

```
Pending → Active → Completed
```

| Estado        | Significado                                        | Cuándo usar                                         |
| ------------- | -------------------------------------------------- | --------------------------------------------------- |
| **Pending**   | Historia funcional lista, esperando implementación | Al crear la historia (estado inicial por defecto)   |
| **Active**    | Implementación técnica en progreso                 | Al comenzar desarrollo (cambio manual o otra skill) |
| **Completed** | Historia implementada, testeada, y desplegada      | Al finalizar desarrollo y deployment exitoso        |

**Nota importante:** El cambio de estado se hace **manualmente** o mediante **otras skills de implementación técnica**. Esta skill solo crea historias en estado `Pending`.

---

## Definition of Ready Checklist (Funcional)

Antes de considerar una historia funcional como "lista para pasar a implementación", verificar:

- [ ] **Título claro** (`Story X.Y: [Acción orientada a usuario]`)
- [ ] **User story statement** completo (Como...Quiero...Para que...)
- [ ] **Acceptance Criteria** con Given-When-Then
- [ ] **AC cubre** happy path + edge cases + error handling
- [ ] **FRs cubiertos** listados explícitamente
- [ ] **Estado inicial** asignado (Pending por defecto)
- [ ] **No menciona implementación técnica** (sin endpoints, componentes, librerías)
- [ ] **Testeable** desde perspectiva funcional (AC son verificables por usuario final)
- [ ] **Scope claro** (no épica disfrazada, 2-5 días de trabajo estimado)

---

## User Story Template

```
# Epic X: [Epic Name]

## Story X.Y: [Clear User Action]

**Estado:** Pending

**Como** usuario de SmartPocket,
**Quiero** [specific action with context],
**Para que** [business value or UX improvement].

### Acceptance Criteria

**Given** [initial context/precondition]
**When** [user action]
**Then** [expected observable result]

**And When** [continuation of flow]
**Then** [next result]

**And Given** [new context for edge case]
**When** [edge case action]
**Then** [edge case result]

**And Given** [error scenario context]
**When** [action that triggers error]
**Then** [error handling behavior with specific user-visible message]

**And When** [recovery action after error]
**Then** [system recovery behavior]

**And When** [persistence check - reload page]
**Then** [data persists correctly after reload]

**FRs Covered:** FRX, FRY, FRZ
```

---

## Common Mistakes & Solutions

### ❌ Mistake 1: AC con detalles de implementación

**Malo:**

```markdown
**When** el usuario hace click
**Then** el componente CategoryList hace dispatch de reorderAction al store Redux
```

**Bueno:**

```markdown
**When** el usuario hace click en "Guardar Orden"
**Then** el sistema persiste el nuevo orden y muestra notificación "Orden guardado exitosamente"
```

**Por qué:** AC describe comportamiento observable para el usuario, no código interno o arquitectura.

---

### ❌ Mistake 2: Título muy técnico o vago

**Malo:**

```
Story 3.2: Implementar POST /api/transactions  ← Enfoque técnico
Story 2.6: Drag and Drop                       ← Demasiado vago
```

**Bueno:**

```
Story 3.2: Registro de Transacciones
Story 2.6: Reordenamiento Manual de Categorías
```

**Por qué:** Título debe comunicar valor de usuario en lenguaje de negocio, no implementación.

---

### ❌ Mistake 3: Missing edge cases en AC

**Malo:**

```markdown
**Given** tengo cuentas
**When** creo una transferencia
**Then** el sistema la guarda
```

**Bueno:**

```markdown
**Given** tengo cuentas con balance suficiente
**When** creo una transferencia con monto mayor al balance disponible
**Then** el sistema muestra error "Balance insuficiente en cuenta origen" y no persiste la transferencia

**And When** creo una transferencia con monto válido
**Then** el sistema la guarda exitosamente y actualiza ambos balances visibles

**And When** la conexión falla al guardar
**Then** el sistema muestra error "No se pudo conectar al servidor" y permite reintentar
```

**Por qué:** AC debe cubrir error handling y edge cases, no solo happy path. Esto previene bugs en producción.

---

### ❌ Mistake 4: User story sin beneficio claro

**Malo:**

```markdown
**Como** usuario,
**Quiero** reordenar categorías,
**Para que** estén ordenadas.
```

**Bueno:**

```markdown
**Como** usuario de SmartPocket,
**Quiero** reordenar categorías manualmente,
**Para que** las más utilizadas aparezcan primero en selectores,
acelerando el registro de transacciones diarias.
```

**Por qué:** "Para que" debe explicar el valor de negocio o mejora UX concreta y medible.

---

### ❌ Mistake 5: Incluir detalles técnicos en la historia

**Malo:**

```markdown
**Como** usuario,
**Quiero** que el sistema use el endpoint POST /api/categories/reorder con un array de {id, sortOrder},
**Para que** el backend actualice el campo SortOrder en la base de datos.
```

**Bueno:**

```markdown
**Como** usuario de SmartPocket,
**Quiero** guardar mi orden personalizado de categorías,
**Para que** el sistema recuerde mi preferencia en futuras sesiones.
```

**Por qué:** La historia debe enfocarse en VALOR de usuario y comportamiento observable, no en implementación técnica. Las decisiones técnicas van en otras skills de implementación.

---

## Good vs Bad Examples

### ✅ Good Example: Story (Enfoque Funcional Puro)

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

### ❌ Bad Example: Historia incompleta y técnica

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

---

## Troubleshooting

### Problema: AC ambiguos o no verificables

**Síntoma:** AC como "El sistema debe funcionar bien" o "La UI debe ser intuitiva"

**Solución:**

- Hacer AC observables: "El sistema muestra notificación 'Guardado exitosamente'"
- Ser específico: "La UI muestra botón 'Guardar Orden' con ícono de checkmark verde"
- Usar verbos de acción: mostrar, habilitar, deshabilitar, guardar, validar, permitir

---

### Problema: Historia muy grande (épica disfrazada)

**Síntoma:** Historia con >10 AC, múltiples FRs no relacionados, >2 semanas de trabajo estimado

**Solución:**

- Split en múltiples historias más pequeñas e independientes
- Una historia = un flujo de usuario coherente y completo
- Target: 2-5 días de implementación por historia (estimado rough)

---

### Problema: Duplicación con historia existente

**Síntoma:** FR ya cubierto parcial o totalmente por otra historia en la misma épica

**Solución:**

- Revisar épica completa antes de crear historia nueva
- Verificar en documento de épica si FR ya está implementado (ver estado)
- Si necesario, editar historia existente en lugar de crear duplicada

---

### Problema: Historia mezcla funcional con técnico

**Síntoma:** AC mencionan endpoints, componentes, librerías, estado interno, o decisiones de implementación

**Solución:**

- Reescribir AC desde perspectiva de usuario (qué ve/experimenta el usuario final)
- Eliminar todas las referencias técnicas (eso va en skill de implementación técnica)
- Enfocarse solo en comportamiento observable en la UI
- Verificar Definition of Ready funcional checklist

---

## References

### Internal Documents

- [Epic Breakdown](../../../_docs/planning/epics/epics.md) - FRs completos y requiremientos del proyecto
- [Epics Folder](../../../_docs/planning/epics/) - Documentos de épicas individuales con historias existentes
- [PRD](../../../_docs/planning/prd.md) - Product Requirements Document completo

### External Resources

- [User Story Best Practices](https://www.atlassian.com/agile/project-management/user-stories)
- [Acceptance Criteria Patterns](https://www.altexsoft.com/blog/business/acceptance-criteria-purposes-formats-and-best-practices/)
- [Gherkin Given-When-Then](https://cucumber.io/docs/gherkin/reference/)
