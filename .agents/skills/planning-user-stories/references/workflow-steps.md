# Detailed Workflow Steps

Este documento detalla cada paso del workflow de creación de historias de usuario.

---

## Step 0: Preparar Contexto (Ejecución Automática)

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

## Step 1.5: Validar Contexto Funcional Suficiente

**Propósito:** Antes de generar la historia, verificar que tienes contexto funcional suficiente para escribir **Acceptance Criteria completos y específicos** (happy path + edge cases + error handling).

**Los FRs en epics.md son de alto nivel** - necesitas detalles funcionales para escribir AC útiles.

### Preguntas clave a validar internamente:

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

### Si falta contexto → PREGUNTAR AL USUARIO

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

### Flujo de decisión:

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

## Step 2: Escribir el título de la historia

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

---

## Step 3: Escribir el resultado de usuario (User Story statement)

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

---

## Step 4: Escribir Acceptance Criteria (AC)

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

---

## Step 5: Indicar FRs cubiertos

Al final de la historia, listar explícitamente qué FRs se cubren:

```markdown
**FRs Covered:** FR10b
```

Si cubre múltiples:

```markdown
**FRs Covered:** FR11, FR12, FR13
```

---

## Step 6: Asignar estado inicial

Toda historia nueva debe tener un estado explícito al crearla:

```markdown
**Estado:** Pending
```

Ver ciclo de vida completo en la sección "Story States" del SKILL.md principal.

---

## Step 7: Guardar Historia en Ubicación Correcta

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
