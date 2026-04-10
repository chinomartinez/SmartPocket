# Common Mistakes & Solutions

Errores frecuentes al crear historias de usuario y cómo evitarlos.

---

## ❌ Mistake 1: AC con detalles de implementación

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

## ❌ Mistake 2: Título muy técnico o vago

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

## ❌ Mistake 3: Missing edge cases en AC

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

## ❌ Mistake 4: User story sin beneficio claro

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

## ❌ Mistake 5: Incluir detalles técnicos en la historia

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
