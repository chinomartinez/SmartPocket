# Plan de Reducción de Skills Frontend

**Fecha:** 3 de abril de 2026  
**Objetivo:** Reducir contenido de skills para cumplir con requisito `<500 líneas` de agent-skills.instructions.md  
**Método:** Eliminar redundancia, mover contenido extenso a `references/`, optimizar ejemplos

---

## Estado Actual

| Skill                             | Líneas | Exceso | Prioridad          |
| --------------------------------- | ------ | ------ | ------------------ |
| `frontend-component-architecture` | 589    | +89    | 🔴 Alta            |
| `frontend-error-handling`         | 558    | +58    | 🔴 Alta            |
| `frontend-testing`                | 550    | +50    | 🔴 Alta            |
| `frontend-routing`                | 505    | +5     | 🟡 Media           |
| `frontend-forms`                  | 492    | ✅ OK  | 🟢 Baja (opcional) |
| `frontend-data-fetching`          | 459    | ✅ OK  | 🟢 Baja (opcional) |

**Meta de reducción:** 202 líneas total para cumplir estrictamente

---

## 1. frontend-component-architecture (589 → ~400 líneas)

**Reducción objetivo: -189 líneas**

### Redundancia Identificada (eliminar ~70 líneas)

#### Ejemplos duplicados de code quality principles

**Problema:** Tres secciones (KISS, Early Returns, No Magic Numbers) tienen estructura similar con ejemplos BAD/GOOD repetitivos.

**Solución:**

- **KISS:** Reducir de 30 líneas → 15 líneas
  - Eliminar ejemplo completo de "SavingsAccountStrategy" (15 líneas)
  - Mantener solo reglas KISS en bullets (5 líneas)
  - Un ejemplo corto de function simple vs compleja (10 líneas)

- **Early Returns:** Reducir de 40 líneas → 20 líneas
  - Eliminar ejemplo largo de nested ifs (20 líneas)
  - Mantener solo el ejemplo BUENO con pattern completo (15 líneas)
  - Pattern para components queda igual (5 líneas)

- **No Magic Numbers:** Reducir de 20 líneas → 10 líneas
  - Mantener solo un ejemplo (no dos)

**Ahorro:** 55 líneas

#### Tabla de Naming Conventions excesiva

**Problema:** Tabla + ejemplos ocupan 25 líneas, info básica muy conocida.

**Solución:**

- Mantener solo tabla (9 líneas)
- Eliminar sección "Ejemplos correctos" (16 líneas) - es obvio de la tabla

**Ahorro:** 16 líneas

### Contenido Movible a `references/` (~80 líneas)

#### Component Composition Patterns (sección completa)

**Problema:** Section completa (35 líneas) con Container/Presentational y Compound Components es contenido avanzado, no esencial para skill básico.

**Solución:**

- Mover a `references/component-patterns.md`
- Agregar link en SKILL.md: "Ver [Component Patterns](./references/component-patterns.md) para patterns avanzados"

**Ahorro:** 33 líneas (35 - 2 de link)

#### Anti-Patterns detallados

**Problema:** Sección entera de anti-patterns (85 líneas) es muy verbose con 5 subsecciones.

**Solución:**

- Mantener en SKILL.md solo lista corta de anti-patterns críticos (15 líneas):

  ```markdown
  ## Anti-Patterns Críticos

  - ❌ Non-null assertions sin validación (`account!.name`)
  - ❌ Uso de `any` type
  - ❌ Inline function props (re-renders)
  - ❌ Missing React.memo para expensive components
  - ❌ Destructuring excesivo

  Ver [Anti-Patterns detallados](./references/anti-patterns.md) para ejemplos completos.
  ```

- Mover ejemplos completos a `references/anti-patterns.md`

**Ahorro:** 68 líneas (85 - 17 resumida)

### Optimización (~30 líneas)

#### Empty States section

**Problema:** 70 líneas con múltiples ejemplos de EmptyState component completo.

**Solución:**

- Reducir a 40 líneas:
  - Mantener pattern completo de conditional rendering (15 líneas)
  - EmptyState component interface + uso resumido (20 líneas)
  - Safe access pattern (5 líneas)
- Eliminar ejemplo completo de EmptyState implementation (30 líneas) - mejor en references/

**Ahorro:** 30 líneas

### Resumen frontend-component-architecture

| Acción                                                         | Ahorro         |
| -------------------------------------------------------------- | -------------- |
| Eliminar redundancia ejemplos KISS/Early Returns/Magic Numbers | 55 líneas      |
| Eliminar ejemplos de Naming Conventions                        | 16 líneas      |
| Mover Component Composition Patterns a references/             | 33 líneas      |
| Mover Anti-Patterns detallados a references/                   | 68 líneas      |
| Optimizar Empty States section                                 | 30 líneas      |
| **TOTAL**                                                      | **202 líneas** |

**Resultado: 589 - 202 = 387 líneas** ✅

---

## 2. frontend-error-handling (558 → ~450 líneas)

**Reducción objetivo: -108 líneas**

### Redundancia Identificada (~40 líneas)

#### Ejemplos repetitivos de Try-Catch

**Problema:** Sección "Try-Catch Patterns" tiene 4 ejemplos (BAD + 3 GOOD casos), muy verbose (80 líneas).

**Solución:**

- Reducir a 40 líneas:
  - Un ejemplo BAD corto (10 líneas)
  - Tres bullets de cuándo usar con ejemplo mínimo inline (25 líneas)
  - Eliminar ejemplos completos de chains, recovery, processFile (40 líneas eliminadas)

**Ahorro:** 40 líneas

### Contenido Movible a `references/` (~50 líneas)

#### API Response Structure (RFC 7807) completa

**Problema:** Sección completa (60 líneas) con interface TypeScript + ejemplo JSON + safe access patterns es demasiado detallado.

**Solución:**

- Mantener en SKILL.md solo:

  ````markdown
  ## RFC 7807 Problem Details

  Backend retorna estructura estandarizada. Ver [RFC 7807 Reference](./references/rfc7807-structure.md) para detalles completos.

  **Safe Access:**

  ```typescript
  const errorMessages = error.errors?.map((e) => e.message) ?? [];
  const firstError = error.errors?.[0]?.message ?? "Unknown error";
  ```
  ````

  ```

  ```

- Mover interface completa, ejemplo JSON, filtros a `references/rfc7807-structure.md`

**Ahorro:** 45 líneas (60 - 15 resumida)

### Optimización (~20 líneas)

#### Display Patterns section

**Problema:** 55 líneas con 2 componentes completos (ErrorAlert + Form errors).

**Solución:**

- Reducir a 35 líneas:
  - ErrorAlert: mantener solo interface + concepto (10 líneas), no implementation completa
  - Form errors: mantener ejemplo de setError loop (15 líneas)
  - Agregar link a references/ para implementations completas (10 líneas)

**Ahorro:** 20 líneas

#### ErrorBoundary setup

**Problema:** 45 líneas con class component completa.

**Solución:**

- Reducir a 30 líneas:
  - Mantener estructura básica pero más compacta
  - Eliminar comentarios verbose

**Ahorro:** 15 líneas

### Resumen frontend-error-handling

| Acción                                 | Ahorro         |
| -------------------------------------- | -------------- |
| Reducir ejemplos de Try-Catch patterns | 40 líneas      |
| Mover RFC 7807 structure a references/ | 45 líneas      |
| Optimizar Display Patterns             | 20 líneas      |
| Optimizar ErrorBoundary setup          | 15 líneas      |
| **TOTAL**                              | **120 líneas** |

**Resultado: 558 - 120 = 438 líneas** ✅

---

## 3. frontend-testing (550 → ~450 líneas)

**Reducción objetivo: -100 líneas**

### Redundancia Identificada (~60 líneas)

#### Mock Patterns casi idénticos

**Problema:** Tres secciones de mocks (Service Mocking 50 líneas, Hook Testing 50 líneas, Toast Mocking 15 líneas) tienen estructura muy similar.

**Solución:**

- **Service Mocking:** Reducir de 50 → 25 líneas
  - Mantener solo ejemplo de setup + un test (happy path)
  - Eliminar segundo test (error case) - es obvio el pattern
- **Hook Testing:** Reducir de 50 → 30 líneas
  - Mantener createWrapper helper completo (necesario)
  - Reducir tests de 2 casos a 1 caso (happy path)

- **Toast Mocking:** Mantener (es corto, 15 líneas)

**Ahorro:** 45 líneas

#### Testing Utilities examples

**Problema:** Section con 50 líneas de ejemplos de pure functions + user interaction, muy básico.

**Solución:**

- Reducir a 25 líneas:
  - Pure functions: mantener solo 3 test cases (no 5)
  - User interaction: mantener solo un ejemplo completo

**Ahorro:** 25 líneas

### Contenido Movible a `references/` (~50 líneas)

#### Integration Tests (sección completa)

**Problema:** 60 líneas con integration test completo "create account → shows in list" es demasiado detallado para skill básico.

**Solución:**

- Mantener en SKILL.md solo:

  ````markdown
  ## Integration Tests

  Para flows complejos end-to-end. Ver [Integration Test Examples](./references/integration-tests.md).

  ```typescript
  // Ejemplo: render con QueryClient + mock service
  const queryClient = new QueryClient({...});
  render(
    <QueryClientProvider client={queryClient}>
      <Page />
    </QueryClientProvider>
  );
  ```
  ````

  ```

  ```

- Mover ejemplo completo a `references/integration-tests.md`

**Ahorro:** 45 líneas (60 - 15 resumida)

#### Vitest Config

**Problema:** 30 líneas de vitest.config.ts completo.

**Solución:**

- Eliminar de SKILL.md (link a file real en repo)
- Agregar solo: "Ver [vitest.config.ts](../../../webapp/vitest.config.ts) en repo"

**Ahorro:** 28 líneas (30 - 2 de link)

### Optimización (~10 líneas)

#### Commands section

**Problema:** 15 líneas listando comandos NPM básicos.

**Solución:**

- Reducir a 5 líneas con solo los 3 comandos esenciales:
  ```bash
  npm run test           # Run all tests
  npm run test:watch     # Watch mode
  npm run test:coverage  # Coverage report
  ```

**Ahorro:** 10 líneas

### Resumen frontend-testing

| Acción                                | Ahorro         |
| ------------------------------------- | -------------- |
| Reducir redundancia en Mock Patterns  | 45 líneas      |
| Reducir Testing Utilities examples    | 25 líneas      |
| Mover Integration Tests a references/ | 45 líneas      |
| Mover Vitest Config (link a repo)     | 28 líneas      |
| Optimizar Commands section            | 10 líneas      |
| **TOTAL**                             | **153 líneas** |

**Resultado: 550 - 153 = 397 líneas** ✅

---

## 4. frontend-routing (505 → ~495 líneas)

**Reducción objetivo: -10 líneas (mínima)**

### Optimización (~10 líneas)

#### Query Strings section

**Problema:** 35 líneas con ejemplo muy verbose de useSearchParams.

**Solución:**

- Reducir a 25 líneas manteniendo funcionalidad completa pero más compacta

**Ahorro:** 10 líneas

### Resumen frontend-routing

| Acción                          | Ahorro        |
| ------------------------------- | ------------- |
| Optimizar Query Strings example | 10 líneas     |
| **TOTAL**                       | **10 líneas** |

**Resultado: 505 - 10 = 495 líneas** ✅

---

## Estructura de `references/` a Crear

Cada skill que excede el límite tendrá su carpeta `references/`:

```
.agents/skills/
├── frontend-component-architecture/
│   ├── SKILL.md (reducido a 387 líneas)
│   └── references/
│       ├── component-patterns.md      # Composition patterns
│       └── anti-patterns.md           # Anti-patterns detallados
├── frontend-error-handling/
│   ├── SKILL.md (reducido a 438 líneas)
│   └── references/
│       └── rfc7807-structure.md       # RFC 7807 interface completo
├── frontend-testing/
│   ├── SKILL.md (reducido a 397 líneas)
│   └── references/
│       └── integration-tests.md       # Integration test examples
└── frontend-routing/
    └── SKILL.md (reducido a 495 líneas)
```

---

## Resumen Global

| Skill                           | Original  | Reducción | Final     | Cumple |
| ------------------------------- | --------- | --------- | --------- | ------ |
| frontend-component-architecture | 589       | -202      | 387       | ✅     |
| frontend-error-handling         | 558       | -120      | 438       | ✅     |
| frontend-testing                | 550       | -153      | 397       | ✅     |
| frontend-routing                | 505       | -10       | 495       | ✅     |
| **TOTAL**                       | **2,202** | **-485**  | **1,717** | ✅     |

**Benefit adicional:** 485 líneas eliminadas = -22% de contenido innecesario

---

## Principios Aplicados en Reducción

### 1. Eliminar Redundancia

- ✅ Ejemplos BAD/GOOD repetitivos → mantener solo los más claros
- ✅ Test cases similares → mantener solo happy path, obviar error cases
- ✅ Tablas muy detalladas → resumir a lo esencial

### 2. Mover a `references/`

- ✅ Content avanzado (Component Patterns, Integration Tests)
- ✅ Estructuras completas (RFC 7807 interface, Vitest config)
- ✅ Anti-patterns exhaustivos (mejor como reference que inline)

### 3. Optimizar Sin Perder Claridad

- ✅ Mantener code examples funcionales completos
- ✅ Mantener patterns críticos (Early Returns, Safe Access)
- ✅ Links claros a references/ para contenido movido

### 4. No Comprometer Usabilidad

- ❌ NO eliminar patterns esenciales
- ❌ NO remover troubleshooting tables
- ❌ NO dejar skills "hollow" (sin substance)

---

## Checklist de Implementación

Cuando se ejecute la reducción:

- [ ] ✅ Frontmatter permanece intacto (name, description)
- [ ] ✅ "When to Use This Skill" se mantiene completo
- [ ] ✅ Al menos un ejemplo completo por pattern crítico
- [ ] ✅ Troubleshooting table preservada
- [ ] ✅ Links a `references/` correctos (relative paths)
- [ ] ✅ Todas las skills <500 líneas verificado con `wc -l`
- [ ] ✅ Content en `references/` tiene header y estructura clara
- [ ] ✅ No se referencian skills entre sí (mantener independencia)

---

## Notas Finales

- **Skills actuales son funcionales**, esta reducción es cumplimiento estricto de guidelines
- **No hay pérdida de información**: todo se mueve a `references/` o simplifica sin perder substance
- **Mantiene auto-discovery effectiveness**: descriptions en frontmatter no cambian
- **Progressive loading beneficio**: Copilot carga <500 líneas primero, `references/` on-demand
- **Implementación incremental posible**: puede hacerse skill por skill sin afectar otras

---

**Status:** ✅ Plan completo - Listo para implementación cuando se requiera
