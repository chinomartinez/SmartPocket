# SmartPocket - Session Starter Prompt

## 🚀 Prompt para Nueva Sesión

Copia y pega esto al iniciar una nueva ventana de chat con GitHub Copilot:

---

Hola! Voy a continuar trabajando en **SmartPocket**, una aplicación de gestión financiera personal.

**Por favor:**
1. Lee [`copilot-instructions.md`](.github/copilot-instructions.md) para entender la arquitectura y stack tecnológico
2. Revisa [`roadmap.md`](.github/roadmap.md) para ver el estado actual del proyecto y próximas tareas
3. Cuando sugieras código, usa siempre las convenciones del proyecto:
   - Alias `@/` para imports entre features/carpetas
   - Colores con namespace `sp-` para brand colors (sp-blue, sp-purple)
   - Componentes shadcn/ui de `@/components/ui/`
   - Component Module Pattern para organización

**Estado actual del proyecto:**
- ✅ Fase 1 completada (estructura, shadcn/ui, sistema de colores)
- 🔄 Trabajando en: [INDICA LA FASE ACTUAL DEL ROADMAP]

**Próxima tarea:** [DESCRIBE LO QUE QUIERES HACER]

---

## 📝 Variaciones del Prompt

### Para continuar con el roadmap:
```
Voy a continuar con la Fase 2 del roadmap de SmartPocket: Mejoras en la Interfaz de Usuario. 
Revisa roadmap.md para ver las tareas pendientes.
```

### Para debugging/refactorización:
```
Necesito ayuda con [COMPONENTE/FEATURE]. 
Revisa copilot-instructions.md para entender la arquitectura del proyecto.
Problema: [DESCRIBE EL PROBLEMA]
```

### Para nueva feature:
```
Voy a implementar [NUEVA FEATURE] en SmartPocket.
Revisa copilot-instructions.md y roadmap.md para mantener consistencia con el proyecto.
Esta feature debe: [DESCRIBE REQUISITOS]
```

### Para integración con Backend:
```
Voy a comenzar la integración con la API .NET (Fase 2.5 del roadmap).
Revisa copilot-instructions.md, específicamente la sección "API Integration".
```

---

## 🎯 Tips para Mejores Resultados

1. **Siempre menciona los archivos clave:**
   - `copilot-instructions.md` → Arquitectura y convenciones
   - `roadmap.md` → Estado del proyecto y tareas

2. **Sé específico sobre el contexto:**
   - ¿Qué fase del roadmap?
   - ¿Qué componente/feature?
   - ¿Qué problema estás resolviendo?

3. **Menciona restricciones importantes:**
   - Usar shadcn/ui components
   - Mantener Component Module Pattern
   - Seguir naming convention de colores

4. **Usa el alias `@/` al pedir código:**
   ```
   "Crea un componente en @/features/dashboard/charts/ 
   que use @/components/ui/card"
   ```

---

## 📚 Documentación del Proyecto

- **Arquitectura**: [`.github/copilot-instructions.md`](.github/copilot-instructions.md)
- **Roadmap**: [`.github/roadmap.md`](.github/roadmap.md)
- **Colores y Design System**: Ver sección en `copilot-instructions.md`
- **Estructura de carpetas**: Ver "Project Structure" en `copilot-instructions.md`

---

## 🔄 Cuándo Crear Nueva Sesión

Considera abrir una nueva ventana de chat cuando:
- ✅ Completaste una fase completa del roadmap
- ✅ El chat actual tiene >40-50 mensajes
- ✅ Vas a cambiar completamente de contexto (ej: UI → Backend integration)
- ✅ Necesitas "refrescar" el contexto de Copilot

---

## 💡 Ejemplo de Prompt Completo

```
Hola! Voy a continuar con SmartPocket.

Lee copilot-instructions.md y roadmap.md para entender el proyecto.

Estado actual:
- ✅ Fase 1 completada (estructura, shadcn/ui integrado, colores refactorizados)
- 🔄 Ahora en Fase 2: Mejoras en la Interfaz de Usuario

Próxima tarea:
Mejorar el dashboard layout - ajustar espaciados y proporciones.
Específicamente necesito revisar FinancialCards para que tenga mejor spacing.

Recuerda usar:
- Alias @/ para imports
- Colores sp-blue y sp-purple
- Componentes de @/components/ui/
```

---

**Última actualización:** 29 de octubre de 2025