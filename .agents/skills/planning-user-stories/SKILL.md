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

## Step-by-Step Workflow

### Step 0: Preparar Contexto (Ejecución Automática)

La skill ejecuta automáticamente:

1. **Leer `_docs/planning/epics.md`**
   - Identificar FRs pendientes (marker `[]`) vs cubiertos (marker `[x]`)
   - Listar épicas disponibles con su estado (✅ Completado / ⏳ Pendiente)
   - Detectar FRs agrupables por valor entregable (ej: FR11+FR12+FR13 = CRUD completo)

2. **Leer `_docs/planning/prd.md`**
   - Obtener contexto de valor de negocio para FRs
   - Entender prioridades y flujos de usuario

3. **Leer carpeta `_docs/planning/user-stories/epic000X/`**
   - Contar archivos existentes para calcular numeración (ej: 2 archivos → siguiente es X.3)
   - Verificar FRs ya cubiertos para evitar duplicados

4. **Mostrar resumen:**
   ```
   ✓ Leído epics.md (9 épicas, 38 FRs pendientes [])
   ✓ Leído prd.md (contexto de valor de negocio)
   ✓ Leído epic0003/ (2 historias existentes, siguiente: 3.3)
   ```

**Output:** Contexto completo cargado → Continuar a Step 1

---

### Step 1: Identificar Épica, FRs y Sugerir

La skill detecta el escenario y actúa según el input del usuario:

#### **Escenario A: "Crea la siguiente historia" (sin épica específica)**

**Input:** `"Crea la siguiente historia"` o `"Siguiente historia a realizar"`

**Acción:**

1. Buscar épica con FRs pendientes `[]` y estado ⏳ (prioridad según orden en epics.md)
2. Sugerir épica prioritaria + FRs agrupables por valor entregable

**Ejemplo de sugerencia:**

```
📋 Épica sugerida: Epic 3 (Transaction Management) - ⏳ Pendiente

FRs pendientes agrupables por valor entregable:

Opción 1 (RECOMENDADO - CRUD Completo):
  - FR11: Registrar transacciones con fecha, monto, cuenta, categoría
  - FR12: Agregar tags opcionales a transacciones
  - FR13: Editar detalles de transacción
  - FR14: Eliminar transacciones con soft delete
  Valor entregable: Gestión completa de transacciones (crear/editar/eliminar)

Opción 2 (Búsqueda y Filtros):
  - FR15: Filtrar transacciones por períodos, rango, cuenta, categoría
  - FR16: Buscar transacciones en tiempo real
  Valor entregable: Capacidad de encontrar transacciones históricas

Opción 3 (Features individuales):
  - FR17: Ver historial ordenado por fecha
  - FR17b: Mini calculadora integrada

¿Qué opción prefieres? (1/2/3 o especifica FRs)
```

**Usuario responde** → Aplicar Escenario C con FRs seleccionados

---

#### **Escenario B: "Crea historia para Epic X"**

**Input:** `"Crea historia para Epic 3"` o `"Historia para Transaction Management"`

**Acción:**

1. Filtrar FRs pendientes `[]` de la épica especificada
2. Sugerir FRs agrupables por valor entregable (similar a Escenario A pero solo para esa épica)

**Ejemplo de sugerencia:**

```
📋 Epic 3: Transaction Management

FRs pendientes []:
  - FR11, FR12, FR13, FR14 (CRUD completo - RECOMENDADO)
  - FR15, FR16 (Búsqueda y filtros)
  - FR17, FR17b (Historial y calculadora)

¿Qué FRs quieres cubrir en esta historia?
Ejemplo: "FR11, FR12, FR13" o "solo FR11"
```

**Usuario responde** → Aplicar Escenario C con FRs seleccionados

---

#### **Escenario C: "Crea historia para FR11, FR12, FR13"**

**Input:** `"Crea historia para FR11"` o `"Historia para FR11, FR12, FR13"`

**Acción:**

1. Validar que los FRs existen en epics.md
2. Validar que los FRs están pendientes `[]` (no `[x]`)
3. Determinar épica desde epics.md
4. Calcular numeración desde conteo en carpeta `epic000X/`

**Validaciones:**

```
✓ FR11 existe en epics.md
✓ FR11 está pendiente [] (no cubierto)
✓ FR11 pertenece a Epic 3 (Transaction Management)
✓ Carpeta epic0003/ tiene 2 historias → siguiente: Story 3.3
```

**Si validación falla:**

```
❌ Error: FR99 no existe en epics.md
❌ Error: FR10b ya está cubierto [x] por Story 2.6
❌ Error: FRs de épicas diferentes (FR11 es Epic 3, FR18 es Epic 4)
```

**Output exitoso:**

```
✅ Validación exitosa
   Épica: Epic 3 (Transaction Management)
   FRs: FR11, FR12, FR13
   Numeración: Story 3.3
   Carpeta: _docs/planning/user-stories/epic0003/
```

→ Continuar a Step 2

---

#### **Escenario D: Sin contexto o descripción libre**

**Input:** `"Crea historia"` o `"Quiero filtrar transacciones por fecha"`

**Acción:** ERROR claro sin procesar

```
❌ Error: Falta información requerida

Debes especificar épica o FRs explícitamente:

Ejemplos válidos:
  - "Crea la siguiente historia" (sugerencia automática)
  - "Crea historia para Epic 3"
  - "Crea historia para FR11"
  - "Historia para FR11, FR12, FR13"

❌ NO válido:
  - Descripciones libres ("filtrar transacciones")
  - Sin contexto ("crea historia")

Ve FRs disponibles en: _docs/planning/epics.md
```

**DETENER** - No continuar a Step 2

---

#### **Batch Mode: "Crea todas las historias de Epic 3"**

**Input:** `"Crea todas las historias para Epic 3"` o `"Genera todas las stories pendientes"`

**Acción:** Preguntar confirmación antes de loop

```
⚠️ Batch Mode Detectado

Epic 3 tiene 8 FRs pendientes []:
  - FR11, FR12, FR13, FR14, FR15, FR16, FR17, FR17b

Sugerencias agrupadas:
  - Historia 1: FR11, FR12, FR13, FR14 (CRUD)
  - Historia 2: FR15, FR16 (Búsqueda)
  - Historia 3: FR17, FR17b (Historial + Calculadora)

¿Ejecutar batch para crear 3 historias automáticamente? (sí/no)
Si prefieres control granular, responde "no" y crea una a la vez.
```

**Si usuario confirma:** Loop ejecutando Steps 2-7 para cada grupo sugerido
**Si usuario rechaza:** Volver a Step 1 esperando input específico

---

#### **Escenario E: "Edita Story X.Y"**

**Input:** `"Edita Story 3.1"` o `"Mejora Story 3.2 - agregar edge cases"`

**Acción:**

1. Extraer número de historia (ej: 3.1 → épica 3, secuencia 1)
2. Buscar archivo en carpeta correspondiente (ej: `epic0003/3_1_*.md`)
3. Leer contenido actual de la historia
4. Identificar secciones a mejorar según input del usuario

**Validaciones:**

```
✓ Story 3.1 existe en epic0003/
✓ Archivo encontrado: 3_1_registro-transacciones.md
✓ Contenido actual leído (título, estado, AC, FRs)
```

**Si validación falla:**

```
❌ Error: Story 3.1 no existe en epic0003/
❌ Error: Múltiples archivos 3_1_*.md encontrados (inconsistencia)
```

**Output exitoso:**

```
✅ Historia encontrada para edición
   Archivo: _docs/planning/user-stories/epic0003/3_1_registro-transacciones.md
   Estado actual: Pending
   FRs cubiertos: FR11, FR12, FR13

¿Qué quieres editar?
- Título (Step 2)
- User Story statement (Step 3)
- Acceptance Criteria (Step 4)
- FRs cubiertos (Step 5)
- Estado (Step 6)
- Todo (regenerar completo)
```

**Usuario especifica qué editar** → Ejecutar Steps correspondientes → **Sobrescribir archivo** (NO cambiar markers en epics.md)

---

- ✅ FRs identificados (ej: FR11, FR12, FR13)
- ✅ Numeración calculada (ej: Story 3.3)
- ✅ Carpeta de guardado (ej: `_docs/planning/user-stories/epic0003/`)

→ Continuar a Step 1.5

---

### Step 1.5: Validar Contexto Funcional Suficiente

**Propósito:** Antes de generar la historia, verificar que tienes contexto funcional suficiente para escribir **Acceptance Criteria completos y específicos** (happy path + edge cases + error handling).

**Los FRs en epics.md son de alto nivel** - necesitas detalles funcionales para escribir AC útiles.

#### Preguntas clave a validar internamente:

**1. Sobre inputs del usuario:**

- ¿Qué datos necesita ingresar el usuario? (campos de formulario, filtros, parámetros)
- ¿Cuáles son obligatorios vs opcionales?
- ¿Hay validaciones o restricciones? (ej: longitud máxima, formato, valores permitidos)

**2. Sobre outputs del sistema:**

- ¿Qué información debe mostrar el sistema como respuesta?
- ¿Qué debe aparecer en la UI? (listados, tarjetas, gráficos, mensajes)
- ¿Cómo se visualizan los datos? (tabla, cards, lista, dashboard)

**3. Sobre comportamiento esperado:**

- ¿Qué debe pasar en el happy path?
- ¿Qué edge cases son relevantes? (datos vacíos, lista vacía, límites, duplicados, conflictos)
- ¿Cómo debe manejar errores? (validaciones, mensajes al usuario, recuperación)

**4. Sobre reglas de negocio:**

- ¿Hay restricciones del dominio? (ej: no permitir balance negativo, categorías obligatorias)
- ¿Qué debe persistir? ¿Qué es transitorio o calculado?
- ¿Cómo afecta a otras entidades? (ej: eliminar una cuenta con transacciones asociadas)

---

#### Si falta contexto → PREGUNTAR AL USUARIO

**Regla de oro:**

- ✅ **Pregunta sobre QUÉ debe hacer el sistema** (comportamiento observable para el usuario)
- ❌ **NO preguntar sobre CÓMO implementarlo técnicamente** (eso no va en historias funcionales)

---

**Ejemplos de preguntas VÁLIDAS:**

```markdown
❓ Para escribir Acceptance Criteria completos, necesito aclarar algunos detalles funcionales:

1. **Formulario de Transacciones:**
   - ¿Qué campos debe incluir? (Monto, Categoría, Cuenta, Fecha, Nota... ¿alguno más?)
   - ¿Todos son obligatorios o hay opcionales?

2. **Validaciones:**
   - ¿Debe permitirse crear una transacción sin categoría o es obligatoria?
   - Si el usuario ingresa una nota muy larga (ej: 500 caracteres), ¿debe truncarse o rechazarse?

3. **Comportamiento:**
   - ¿El formulario debe mostrar errores en tiempo real o solo al intentar guardar?
   - Si falla el guardado, ¿qué mensaje debe ver el usuario?

4. **Edge cases:**
   - ¿Qué pasa si el usuario intenta crear una transacción con fecha futura?
   - ¿Debe haber un monto mínimo/máximo permitido?
```

---

**Ejemplos de preguntas INVÁLIDAS (NO hacer):**

```markdown
❌ ¿Debo usar React Hook Form o Formik para el formulario?
→ Decisión de implementación técnica, NO va en historia funcional

❌ ¿La API debe ser REST o GraphQL?
→ Arquitectura backend, NO va en historia funcional

❌ ¿Guardamos el estado en Redux o Context API?
→ Decisión de implementación, NO va en historia funcional

❌ ¿Usamos Zod o Yup para validación?
→ Librería técnica, NO va en historia funcional
```

---

#### Flujo de decisión:

**✅ Si tienes contexto funcional suficiente:**

- Continuar directamente a Step 2

**❌ Si falta contexto funcional:**

1. Listar preguntas específicas al usuario (formato arriba)
2. **Esperar respuestas del usuario**
3. Integrar respuestas al contexto mental
4. **Ahora sí** continuar a Step 2

---

**Nota importante:** Es MEJOR preguntar 2-3 detalles clave que inventar/adivinar comportamiento. Historias con AC vagos o incorrectos causan:

- 🚨 Implementación incorrecta (no cumple expectativa del usuario)
- 🚨 Re-trabajo (hay que rehacer la historia)
- 🚨 Bugs en producción (comportamiento no especificado)

---

→ Continuar a Step 2

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

### Step 7: Guardar Historia en Ubicación Correcta

**Proceso de guardado:**

1. **Construir nombre de archivo**
   - Formato: `{epic}_{seq}_{slug}.md`
   - Ejemplos:
     - Story 3.1: Registro de Transacciones → `3_1_registro-transacciones.md`
     - Story 3.2: Búsqueda y Filtros → `3_2_busqueda-filtros.md`
     - Story 4.1: Crear Transferencias → `4_1_crear-transferencias.md`

2. **Derivar slug de título**
   - Tomar acción principal del título (sin "Story X.Y:")
   - Convertir a kebab-case (lowercase, guiones)
   - Eliminar artículos (el, la, los, las, de, y)
   - Máximo 50 caracteres

3. **Verificar carpeta**
   - Ruta: `_docs/planning/user-stories/epic{XXXX}/` (con padding: epic0003)
   - Si no existe → crear carpeta automáticamente

4. **Guardar archivo**
   - Contenido completo con secciones Steps 2-6
   - Formato markdown limpio

5. **Distinguir entre creación y edición**

   **Caso A: Nueva historia (Escenarios A-D en Step 1)**
   - Crear archivo nuevo con nombre construido
   - Continuar a paso 6 (actualizar markers)

   **Caso B: Editar historia existente (Escenario E en Step 1)**
   - Sobrescribir archivo existente (mismo nombre)
   - **NO** continuar a paso 6 (FRs ya estaban marcados)
   - **Excepción:** Si se agregaron nuevos FRs en Step 5 → actualizar solo los nuevos markers `[] → [x]`
   - **No revertir:** Si se quitaron FRs → NO cambiar markers (un FR puede estar cubierto por múltiples historias)

6. **Post-guardado: Marcar FRs como cubiertos en epics.md** (solo Caso A o FRs nuevos)
   - Cambiar markers de `[]` a `[x]` para FRs cubiertos
   - Actualizar estado de épica si todos los FRs están `[x]`
   - Ejemplo:
     ```diff
     - [ ] FR11: Registrar transacciones...
     + [x] FR11: Registrar transacciones...
     ```

7. **Confirmación al usuario**

**Para nueva historia (Caso A):**

```
✅ Historia creada exitosamente

📁 Ubicación: _docs/planning/user-stories/epic0003/3_1_registro-transacciones.md
📊 Estado: Pending
🎯 FRs cubiertos: FR11, FR12, FR13
✓ Markers actualizados en epics.md ([] → [x])

Próximos pasos:
- Revisar y refinar AC si es necesario
- Cambiar estado a Active cuando comiences implementación (manual/otra skill)
```

**Para historia editada (Caso B):**

```
✅ Historia actualizada exitosamente

📁 Ubicación: _docs/planning/user-stories/epic0003/3_1_registro-transacciones.md
📊 Estado: [mantiene estado actual o modificado en Step 6]
🎯 FRs cubiertos: FR11, FR12, FR13
⚠️ Markers NO actualizados (historia existente, FRs ya cubiertos previamente)

Próximos pasos:
- Revisar cambios realizados
- Validar que AC sigue cumpliendo Definition of Ready
```

**Reglas de slug:**

| Título Original                        | Slug Derivado                  |
| -------------------------------------- | ------------------------------ |
| Registro de Transacciones              | registro-transacciones         |
| Búsqueda y Filtros de Transacciones    | busqueda-filtros-transacciones |
| Edición y Eliminación de Transacciones | edicion-eliminacion            |
| Mini Calculadora Integrada             | mini-calculadora-integrada     |

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

La skill usa esta plantilla automáticamente en Steps 2-6 para generar la estructura completa:

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

### Problema: Descripción libre sin épica/FR

**Síntoma:** Usuario dice "quiero filtrar transacciones" o "agregar calculadora" sin especificar FR

**Solución:**

La skill rechaza con error claro:

```
❌ No se aceptan descripciones libres

Especifica épica o FRs:
- "Crea la siguiente historia" (sugerencia automática)
- "Crea historia para Epic 3"
- "Historia para FR15, FR16"

Ve FRs en: _docs/planning/epics.md
```

No intentar "adivinar" qué FR corresponde - forzar input explícito.

---

## References

### Internal Documents

- [Epic Breakdown](../../../_docs/planning/epics.md) - FRs con markers `[x]`/`[]` y épicas
- [User Stories Folder](../../../_docs/planning/user-stories/) - Historias guardadas por épica (epic000X/)
- [PRD](../../../_docs/planning/prd.md) - Product Requirements Document y contexto de valor de negocio

### External Resources

- [User Story Best Practices](https://www.atlassian.com/agile/project-management/user-stories)
- [Acceptance Criteria Patterns](https://www.altexsoft.com/blog/business/acceptance-criteria-purposes-formats-and-best-practices/)
- [Gherkin Given-When-Then](https://cucumber.io/docs/gherkin/reference/)
