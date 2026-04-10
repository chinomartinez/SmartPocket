---
name: planning-user-stories
description: Crea o edita historias de usuario funcionales para épicas de SmartPocket basadas en FRs. Úsala al descomponer épicas en historias enfocadas al usuario, mapear FRs a historias, escribir acceptance criteria en formato Given-When-Then, o revisar calidad. Sugiere FRs inteligentemente basándose en valor entregable. Puramente funcional - sin detalles técnicos. Incluye estados (pending/active/completed), guardado automático, validación post-guardado.
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

**⚠️ Nota importante:**  
Esta skill puede hacerte **preguntas sobre detalles funcionales** (campos de formulario, validaciones, comportamiento esperado, edge cases) cuando necesita aclarar para escribir **Acceptance Criteria completos**. Es mejor preguntar que adivinar/inventar comportamiento.

**NO usar esta skill para:**

- Decisiones técnicas (arquitectura, endpoints, componentes, librerías)
- Notas de implementación (eso va en skills de implementación técnica)
- Diseño UX detallado (eso informa la history, pero no es parte del documento)

---

## Prerequisites

Los siguientes documentos se leen automáticamente en Step 0:

- **Epic document** (en `_docs/planning/epics.md`) - Listado de FRs con markers `[x]`/`[]` y épicas
- **Product Requirements Document (PRD)** (en `_docs/planning/prd.md`) - Contexto de valor de negocio
- **User Stories Folder** (en `_docs/planning/user-stories/epic000X/`) - Historias existentes (para numeración)
- **Project context** (en `.github/copilot-instructions.md`) - Convenciones generales

---

## Step-by-Step Workflow (High-Level)

Este workflow consta de varios pasos que se ejecutan en secuencia para crear una historia de usuario:

### Step 0: Preparar Contexto (automático)

- Leer epics.md, PRD, y user-stories folder
- Identificar FRs pendientes y épicas disponibles
- Calcular numeración de próxima historia

Ver detalles: [workflow-steps.md](./references/workflow-steps.md#step-0)

---

### Step 1: Identificar Épica y FRs

La skill detecta el escenario según tu input y te guía:

- **Escenario A**: "Crea la siguiente historia" → Sugerencia automática de épica prioritaria
- **Escenario B**: "Crea historia para Epic X" → Sugerencias de FRs de esa épica
- **Escenario C**: "Crea historia para FR11, FR12" → Validación y confirmación
- **Escenario D**: Sin contexto → Error claro solicitando info específica
- **Escenario E**: "Edita Story X.Y" → Carga historia existente para edición
- **Batch Mode**: "Crea todas las historias de Epic X" → Confirmación antes de loop

Ver detalles de todos los escenarios: [workflow-scenarios.md](./references/workflow-scenarios.md)

---

### Step 1.5: Validar Contexto Funcional

Antes de generar la historia, la skill verifica si tiene suficiente información funcional para escribir Acceptance Criteria completos.

Si falta contexto, **te hará preguntas** sobre:

- Campos de formulario y validaciones
- Comportamiento esperado del sistema
- Edge cases y manejo de errores
- Reglas de negocio aplicables

Ver detalles: [workflow-steps.md](./references/workflow-steps.md#step-15)

---

### Steps 2-7: Crear y Guardar Historia

Una vez validado el contexto, la skill ejecuta:

1. **Step 2**: Escribir título (`Story X.Y: [Acción Clara]`)
2. **Step 3**: Escribir user story statement ("Como...Quiero...Para que...")
3. **Step 4**: Escribir Acceptance Criteria (Given-When-Then)
4. **Step 5**: Indicar FRs cubiertos
5. **Step 6**: Asignar estado inicial (Pending)
6. **Step 7**: Guardar archivo + actualizar markers en epics.md

Ver detalles completos: [workflow-steps.md](./references/workflow-steps.md#steps-2-7)

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

## Quick References

- 📝 [User Story Template](./templates/user-story-template.md)
- 📋 [Workflow Scenarios](./references/workflow-scenarios.md) - 5 escenarios detallados (A-E) + Batch Mode
- 📖 [Workflow Steps](./references/workflow-steps.md) - Steps 0, 1.5, 2-7 explicados en detalle
- ⚠️ [Common Mistakes](./references/common-mistakes.md) - 5 errores frecuentes y cómo evitarlos
- ✅ [Good vs Bad Examples](./references/examples.md) - Comparación de historias bien y mal escritas
- 🔧 [Troubleshooting Guide](./references/troubleshooting.md) - Problemas comunes y soluciones

---

## References

### Internal Project Documents

- [Epic Breakdown](../../../_docs/planning/epics.md) - FRs con markers `[x]`/`[]` y épicas
- [User Stories Folder](../../../_docs/planning/user-stories/) - Historias guardadas por épica (epic000X/)
- [PRD](../../../_docs/planning/prd.md) - Product Requirements Document y contexto de valor de negocio

### External Resources

- [User Story Best Practices](https://www.atlassian.com/agile/project-management/user-stories)
- [Acceptance Criteria Patterns](https://www.altexsoft.com/blog/business/acceptance-criteria-purposes-formats-and-best-practices/)
- [Gherkin Given-When-Then](https://cucumber.io/docs/gherkin/reference/)
