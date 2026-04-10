# Troubleshooting Guide

Problemas comunes y sus soluciones al crear historias de usuario.

---

## Problema: AC ambiguos o no verificables

**Síntoma:** AC como "El sistema debe funcionar bien" o "La UI debe ser intuitiva"

**Solución:**

- Hacer AC observables: "El sistema muestra notificación 'Guardado exitosamente'"
- Ser específico: "La UI muestra botón 'Guardar Orden' con ícono de checkmark verde"
- Usar verbos de acción: mostrar, habilitar, deshabilitar, guardar, validar, permitir

---

## Problema: Historia muy grande (épica disfrazada)

**Síntoma:** Historia con >10 AC, múltiples FRs no relacionados, >2 semanas de trabajo estimado

**Solución:**

- Split en múltiples historias más pequeñas e independientes
- Una historia = un flujo de usuario coherente y completo
- Target: 2-5 días de implementación por historia (estimado rough)

---

## Problema: Duplicación con historia existente

**Síntoma:** FR ya cubierto parcial o totalmente por otra historia en la misma épica

**Solución:**

- Revisar épica completa antes de crear historia nueva
- Verificar en documento de épica si FR ya está implementado (ver estado)
- Si necesario, editar historia existente en lugar de crear duplicada

---

## Problema: Historia mezcla funcional con técnico

**Síntoma:** AC mencionan endpoints, componentes, librerías, estado interno, o decisiones de implementación

**Solución:**

- Reescribir AC desde perspectiva de usuario (qué ve/experimenta el usuario final)
- Eliminar todas las referencias técnicas (eso va en skill de implementación técnica)
- Enfocarse solo en comportamiento observable en la UI
- Verificar Definition of Ready funcional checklist

---

## Problema: Descripción libre sin épica/FR

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

## Problema: Falta contexto funcional para escribir AC completos

**Síntoma:** FRs de alto nivel sin detalles sobre campos, validaciones, o comportamiento esperado

**Solución:**

- **NO adivinar** ni inventar comportamiento
- Ejecutar Step 1.5: Validar Contexto Funcional
- Preguntar al usuario sobre aspectos funcionales específicos (ver ejemplos en workflow-steps.md#step-15)
- Esperar respuestas antes de continuar con Steps 2-7
