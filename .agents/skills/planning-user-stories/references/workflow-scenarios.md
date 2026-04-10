# Step 1: Identificar Épica, FRs y Sugerir

La skill detecta el escenario y actúa según el input del usuario:

---

## Escenario A: "Crea la siguiente historia" (sin épica específica)

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

## Escenario B: "Crea historia para Epic X"

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

## Escenario C: "Crea historia para FR11, FR12, FR13"

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

## Escenario D: Sin contexto o descripción libre

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

## Batch Mode: "Crea todas las historias de Epic 3"

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

## Escenario E: "Edita Story X.Y"

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

**Output de Step 1:**

- ✅ FRs identificados (ej: FR11, FR12, FR13)
- ✅ Numeración calculada (ej: Story 3.3)
- ✅ Carpeta de guardado (ej: `_docs/planning/user-stories/epic0003/`)

→ Continuar a Step 1.5
