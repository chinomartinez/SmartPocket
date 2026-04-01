# Historia 2.6: Reordenamiento Manual de Categorías

Status: review

<!-- Nota: la validación es opcional. Ejecutar validate-create-story para revisar la calidad antes de dev-story. -->

## Historia

Como usuario de SmartPocket,
Quiero reordenar mis categorías manualmente activando un modo de edición y guardando los cambios cuando esté satisfecho,
Para que las categorías más utilizadas aparezcan primero en los selectores y formularios, acelerando el registro de transacciones.

## Criterios de Aceptación

1. Dado que tengo múltiples categorías creadas en el sistema, cuando accedo a la página de gestión de categorías, entonces veo todas mis categorías con un botón "Reordenar Categorías".
2. Dado que hago clic en "Reordenar Categorías", cuando el sistema activa el modo de edición, entonces se muestran controles drag-and-drop visibles en cada categoría de la pestaña activa, un botón "Guardar Orden", un botón "Cancelar", las acciones de crear, editar y eliminar quedan deshabilitadas y la navegación entre las pestañas de Gastos e Ingresos permanece disponible.
3. Dado que el modo de reordenamiento está activo, cuando arrastro una categoría a una nueva posición, entonces el orden visual se actualiza inmediatamente en la interfaz sin persistirse todavía en backend.
4. Dado que el modo de reordenamiento está activo, cuando cambio entre las pestañas de Gastos e Ingresos, entonces el modo edición continúa activo y la interfaz conserva los cambios pendientes de ambas pestañas dentro de la misma sesión.
5. Dado que realizo múltiples cambios de orden en la misma sesión, cuando sigo arrastrando categorías en una o ambas pestañas, entonces la interfaz mantiene todos los cambios visuales acumulados hasta que confirme o cancele.
6. Dado que estoy conforme con el nuevo orden, cuando hago clic en "Guardar Orden", entonces el sistema envía una única llamada API con una colección plana de items {id, sortOrder} representando el estado final de las categorías a persistir; el backend infiere el tipo de cada categoría a partir de su id y persiste la operación de forma atómica, respetando el orden por tipo.
7. Dado que la API confirma el guardado, cuando la operación finaliza correctamente, entonces el sistema muestra notificación de éxito, sale del modo de reordenamiento y vuelve a habilitar las acciones normales.
8. Dado que cambié el orden pero decido no conservarlo, cuando hago clic en "Cancelar", entonces la interfaz revierte los cambios pendientes de ambas pestañas al estado original previo a la edición, sale del modo reordenamiento y no realiza ninguna llamada API.
9. Dado que el reordenamiento fue guardado exitosamente, cuando abro un formulario de transacción en el futuro, entonces las categorías aparecen en el orden personalizado configurado por el usuario dentro de su tipo.
10. Dado que estoy en modo de reordenamiento, cuando intento crear, editar o eliminar una categoría, entonces esas acciones permanecen deshabilitadas hasta salir del modo de edición, pero sigo pudiendo cambiar entre las pestañas de Gastos e Ingresos para completar el ordenamiento.
11. Dado que las categorías del sistema también forman parte del catálogo visible, cuando entro en modo de reordenamiento, entonces puedo mover y reordenar tanto categorías personalizadas como categorías de sistema.
12. Dado que el guardado falla por error de red o validación, cuando la API retorna error, entonces el sistema muestra un mensaje específico y conserva el modo de reordenamiento activo para permitir reintento sin perder los cambios pendientes.
13. Dado que ya guardé el nuevo orden, cuando recargo la página, entonces las categorías mantienen el orden configurado previamente.

## Tareas / Subtareas

- [x] Extender backend de categorías para soportar orden persistido por tipo (AC: 6, 9, 13)
  - [x] Agregar campo SortOrder a la entidad Category y su configuración EF Core manteniendo compatibilidad con datos existentes.
  - [x] Crear migración que inicialice SortOrder para categorías ya existentes con un orden determinístico por tipo.
  - [x] Actualizar consultas Get/GetById y DTOs necesarios para exponer SortOrder donde haga falta y ordenar por SortOrder ascendente dentro del tipo filtrado.
- [x] Implementar endpoint de reordenamiento atómico en backend (AC: 6, 7, 12)
  - [x] Crear contrato CategoryReorderCommand para recibir una colección plana de items {id, sortOrder}, sin enviar el tipo explícitamente en la request.
  - [x] Definir que el payload representa el orden final completo de cada tipo incluido en la operación y no solo las categorías movidas individualmente.
  - [x] Crear validator y handler CategoryReorderCommandHandler para validar IDs, inferir el tipo desde la base de datos, permitir que SortOrder se repita entre tipos distintos y aplicar la actualización masiva en una sola operación.
  - [x] Exponer endpoint PUT /categories/reorder en CategoriesController siguiendo el patrón Result -> ToActionResult().
  - [x] Cubrir el caso de error de validación o IDs inexistentes con respuestas consistentes del pipeline ProblemDetails.
- [x] Adaptar servicios y hooks frontend de categorías al flujo de reordenamiento (AC: 6, 7, 12)
  - [x] Incorporar tipos API para reorder y método reorder en categoryService.
  - [x] Extender la query key factory de categorías y agregar useReorderCategories con invalidación de ['categories'] solo en éxito.
  - [x] Mantener el pipeline de errores existente para mostrar toast automático y permitir manejo inline si el guardado falla.
- [x] Incorporar modo de reordenamiento en la pantalla de categorías (AC: 1, 2, 3, 4, 5, 8, 10, 11)
  - [x] Agregar botón "Reordenar Categorías" y estado local de edición en CategoriesList.
  - [x] Integrar drag-and-drop con una biblioteca compatible con React 19, preferentemente dnd-kit, sin romper el layout actual de chips.
  - [x] Mantener una única sesión de edición compartida entre las pestañas de Gastos e Ingresos, conservando cambios pendientes al alternar entre ellas.
  - [x] Deshabilitar durante la edición las acciones de crear, editar y eliminar categorías, manteniendo habilitado el cambio entre pestañas.
  - [x] Permitir reordenar también categorías de sistema durante el modo edición.
  - [x] Implementar restauración del orden original al cancelar en ambas pestañas y persistencia única al confirmar.
- [x] Preservar la experiencia UX y consistencia cross-feature (AC: 7, 9, 13)
  - [x] Asegurar feedback visual claro durante guardado, error y cancelación.
  - [x] Confirmar que el orden persistido impacte los futuros selectores de categorías en formularios de transacciones cuando esa pantalla se implemente.
  - [x] Mantener comportamiento responsive y touch-friendly sin reducir funcionalidad.
- [x] Agregar cobertura de pruebas mínima para el cambio dentro del alcance actual (AC: 6, 7, 8, 12, 13)
  - [x] Crear tests backend para el handler de reordenamiento usando IntegrationTestFixture y base SQLite en memoria.
  - [x] Diferir los tests frontend de hooks, UI y abstracción drag-and-drop a una historia futura enfocada en la configuración y estrategia de testing frontend.

## Dev Notes

### Contexto para el desarrollador

- Esta historia se implementa sobre un proyecto brownfield en Fase 3 con Gestión de Cuentas completada y CRUD de Categorías ya operativo de punta a punta. El objetivo no es rediseñar el módulo, sino extenderlo con reordenamiento persistido sin romper los flujos existentes de crear, editar y eliminar categorías.
- El frontend actual de Categorías ya existe en webapp/src/features/categories/ con CategoriesList.tsx, CategoryChip.tsx, CategoryFormModal.tsx, hooks/useCategories.ts y api/services/categories/categoryService.ts. La pantalla trabaja con un filtro binario por tipo y renderiza una sola lista visible a la vez.
- El backend actual ya expone CRUD en CategoriesController, usa handlers manuales registrados automáticamente por IHandler, validación con FluentValidation y pipeline Result hacia ToActionResult() y ProblemDetails. El reordenamiento debe entrar en ese mismo patrón y no introducir endpoints ni servicios paralelos.
- El modelo Category todavía no tiene SortOrder y la consulta CategoryGetQueryHandler solo filtra por IsIncome. Esta historia incluye persistencia, migración, ordenamiento de lectura y contrato API nuevo.
- Guardrail funcional importante: el orden sigue siendo por tipo, pero la sesión de edición es compartida entre las pestañas de Gastos e Ingresos. El usuario puede alternar entre ambas, acumular cambios y guardarlos juntos en una única operación.
- Guardrail de contrato API: la request no debe enviar el tipo de categoría. El backend debe inferirlo a partir de cada id recibido y validar el orden dentro de cada grupo inferido.
- Guardrail de alcance: la pantalla de Transacciones todavía está en placeholder. En esta historia no hay que construir el selector final de transacciones, pero sí dejar garantizado que cuando se implemente consuma categorías en el orden persistido.
- Las categorías del sistema marcadas con isDefault hoy están protegidas para edición y eliminación en la UI, pero en esta historia sí deben participar del reordenamiento igual que las categorías creadas por el usuario.
- La librería de drag-and-drop todavía no está instalada en webapp/package.json, por lo que la implementación debe agregar la dependencia elegida y mantener compatibilidad con React 19.
- Con el set actual de datos seed existe una sola categoría por tipo. Si SortOrder no se asigna explícitamente en el seeder, el valor por defecto no genera conflicto funcional inmediato en una base nueva; no es obligatorio tocar el seeder en esta historia salvo que resulte necesario durante la implementación.

### Requisitos técnicos

- El backend debe persistir el orden de categorías mediante SortOrder y garantizar un orden determinístico dentro de cada tipo de categoría. La lectura de categorías no puede seguir dependiendo del orden implícito de la base de datos.
- La actualización del orden debe resolverse con una única operación de aplicación desde frontend y una única operación lógica de persistencia en backend. No se deben emitir múltiples requests por cada movimiento individual.
- El endpoint de reordenamiento debe validar como mínimo que todos los IDs existan, inferir el tipo de cada categoría a partir de la base de datos y comprobar que no haya posiciones duplicadas o inconsistentes dentro de cada tipo.
- El handler de reordenamiento debe actualizar el conjunto completo de categorías involucradas de forma atómica, evitando estados parciales si ocurre un fallo durante la operación.
- La consulta de categorías debe devolver resultados ordenados por SortOrder ascendente y usar un criterio estable secundario para categorías heredadas o empates durante la transición de datos.
- La request de reorder debe usar una colección plana de items {id, sortOrder}. SortOrder puede repetirse entre Gastos e Ingresos; la unicidad del orden es por tipo, no global.
- El payload debe representar el estado final completo de cada tipo incluido en la operación. No debe interpretarse como una lista parcial de movimientos individuales.
- El frontend debe manejar el modo de reordenamiento con estado local aislado de la cache de TanStack Query. El orden visual puede cambiar inmediatamente durante el arrastre, pero la cache remota solo debe invalidarse y refrescarse después de un guardado exitoso.
- La sesión local de reorder debe conservar snapshots pendientes de Gastos e Ingresos dentro del mismo modo edición, permitiendo alternar de pestaña sin perder cambios.
- La acción Cancelar debe restaurar exactamente el snapshot original de ambas pestañas antes de entrar en modo edición, sin requests y sin efectos colaterales sobre otros estados del módulo.
- Mientras el modo de reordenamiento esté activo, deben quedar bloqueadas las acciones de crear, editar y eliminar para evitar conflictos entre estado local temporal y mutaciones remotas, pero el cambio entre pestañas debe permanecer habilitado.
- La solución debe respetar el pipeline de errores existente: validación backend con FluentValidation, respuesta ProblemDetails o ApiProblemDetails, interceptores Axios, ApiError tipado y toast automático vía TanStack Query.
- La historia no debe introducir dependencias con Transacciones ni construir lógica temporal en esa pantalla; el entregable correcto es dejar el módulo de Categorías listo para que futuros selectores consuman el orden persistido sin retrabajo.

### Cumplimiento de arquitectura

- Backend: mantener la organización por vertical slices en backend/src/SmartPocket.Features/Categories/. El reordenamiento debe agregarse como una operación nueva del feature Categories, con command, handler y validator separados, en lugar de mezclar lógica dentro de Create o Update.
- Backend: preservar el patrón actual de controllers finos. CategoriesController debe recibir el nuevo handler por FromServices y delegar toda la lógica al handler correspondiente. No mapear manualmente errores HTTP fuera de ToActionResult().
- Backend: respetar el patrón de registro automático de handlers basado en IHandler ya configurado en FeatureSetup. No agregar registro manual específico para esta historia salvo que sea estrictamente necesario.
- Backend: mantener compatibilidad con SQLite actual y futura migración a PostgreSQL. Evitar cualquier solución dependiente de características exclusivas de SQLite para calcular o persistir el orden.
- Backend: el ordenamiento debe convivir con soft delete y query filters globales. Las categorías eliminadas lógicamente no deben afectar el orden visible ni el payload de reordenamiento del usuario.
- Frontend: conservar la estructura feature-first existente en webapp/src/features/categories/. La lógica de datos debe seguir el flujo Hook de TanStack Query -> Service -> spApiClient -> API y no implementarse con fetch directo ni useEffect para data fetching.
- Frontend: mantener named exports y tipado estricto. No introducir default exports ni any para modelar payloads de reorder, eventos de drag-and-drop o errores.
- Frontend: extender la query key factory del feature Categories en lugar de crear claves ad hoc. La invalidación correcta tras guardar es ['categories'], consistente con la tabla de invalidación documentada en arquitectura.
- Frontend: el modo de reordenamiento debe integrarse sobre la pantalla actual sin reemplazar sus estados base de loading, error y empty state. El comportamiento nuevo se monta encima del módulo existente, no como una pantalla paralela, y debe sostenerse al cambiar entre las pestañas de Gastos e Ingresos.
- UX: respetar el enfoque responsive y touch-friendly documentado. Los controles para arrastrar, guardar y cancelar deben seguir siendo utilizables en mobile y tablet sin convertir la experiencia en una versión recortada.

### Requisitos de librerías y frameworks

- React 19.1.1 y TypeScript 5.8 en modo strict son obligatorios para toda la implementación frontend. Cualquier integración drag-and-drop debe ser compatible con este stack y no depender de patrones legacy o APIs obsoletas.
- TanStack Query 5 es la capa de server state del proyecto. El guardado del reordenamiento debe resolverse mediante mutation dedicada y no con manejo manual de promesas fuera de los hooks del feature.
- Axios ya está encapsulado en spApiClient. El service de categorías debe seguir usando esa abstracción para el nuevo endpoint de reorder y no crear clientes HTTP alternativos.
- React Hook Form y Zod ya existen en el módulo, pero esta historia no necesita meter el reordenamiento dentro del formulario modal actual. El modo reorder debe vivir en la pantalla de listado, separado de CategoryFormModal.
- Tailwind CSS v4, shadcn/ui y los componentes UI actuales del proyecto son la base visual a reutilizar. Botones, cards, diálogos y estados de carga deben mantenerse consistentes con el módulo actual de Categorías y con Accounts.
- Heroicons y/o componentes visuales existentes pueden seguir usándose para acciones auxiliares, pero los íconos funcionales de navegación y controles deben respetar la guideline UX del proyecto. No reemplazar la iconografía actual por emojis de acción.
- FluentValidation 12 debe validar el command de reordenamiento en backend. No trasladar la validación crítica únicamente al frontend.
- EF Core 9 con SQLite es la base actual de persistencia. La migración y el acceso a datos deben apoyarse en EF Core y en la infraestructura existente, sin SQL manual innecesario.
- Se requiere incorporar una librería de drag-and-drop porque el proyecto todavía no la tiene instalada. La recomendación de la historia sigue siendo dnd-kit por compatibilidad con React moderno y por permitir controlar mejor accesibilidad y sensores táctiles.
- Si se incorpora dnd-kit, la implementación debería considerar al menos los paquetes mínimos necesarios para sortable drag-and-drop y evitar agregar librerías de UI redundantes cuando el proyecto ya tiene su propio sistema visual.
- La integración de la librería de drag-and-drop no debe consumirse de forma directa desde la pantalla principal. Debe crearse una abstracción propia del proyecto para encapsular sensores, contexto, estrategia sortable y contratos mínimos de uso, de modo que en el futuro pueda reemplazarse la librería subyacente sin reescribir la lógica de la pantalla.

### Requisitos de estructura de archivos

- Backend dominio:
  - Extender backend/src/SmartPocket.Domain/Transactions/Category.cs para incorporar SortOrder sin romper el constructor actual ni las reglas existentes de Update.
  - Ajustar la configuración EF correspondiente en backend/src/SmartPocket.Persistence/EntityConfigurations/Transactions/CategoryConfig.cs para mapear el nuevo campo.
- Backend feature Categories:
  - Mantener la operación nueva dentro de backend/src/SmartPocket.Features/Categories/ con una carpeta dedicada de operación, por ejemplo Reorder/.
  - Crear archivos separados para CategoryReorderCommand, CategoryReorderCommandHandler y CategoryReorderCommandValidator.
  - Si el contrato requiere DTOs auxiliares para el payload, ubicarlos junto a la operación de reorder y no mezclarlos con DTOs de Get o Create.
  - Actualizar backend/src/SmartPocket.Features/Categories/Get/CategoryGetQueryHandler.cs para ordenar por SortOrder y, solo si realmente aporta valor al consumidor, extender CategoryGetDTO con la propiedad SortOrder.
  - Ajustar backend/src/SmartPocket.WebApi/Controllers/CategoriesController.cs para exponer el endpoint nuevo sin alterar el contrato existente de CRUD.
  - Generar la migración de EF Core dentro del proyecto de persistencia junto con el resto de migrations existentes.
- Frontend feature Categories:
  - Mantener los cambios dentro de webapp/src/features/categories/ y webapp/src/api/services/categories/.
  - Extender webapp/src/api/services/categories/categoryTypes.ts con los tipos necesarios para reorder.
  - Extender webapp/src/api/services/categories/categoryService.ts con el método reorder.
  - Actualizar webapp/src/features/categories/hooks/useCategories.ts para incluir la mutation de reorder siguiendo la misma convención del resto del feature.
  - Adaptar webapp/src/features/categories/components/CategoriesList.tsx como punto principal del modo reordenamiento.
  - Evaluar si CategoryChip.tsx necesita una variante o props adicionales para modo edición; evitar duplicar el componente si una extensión acotada resuelve el caso.
  - Crear una abstracción específica para drag-and-drop dentro del feature de categorías, por ejemplo en una subcarpeta dnd/, sortable/ o similar, evitando acoplar CategoriesList.tsx a imports directos de la librería elegida.
  - La abstracción debe exponer una interfaz mínima estable para el caso de uso actual, por ejemplo contenedor sortable, item sortable y utilidades de movimiento, en lugar de filtrar toda la API del proveedor externo al resto del módulo.
- Pruebas:
  - Backend: agregar tests en backend/src/SmartPocket.Tests/Features/ siguiendo la convención ya existente del proyecto.
- Dependencias:
  - Cualquier dependencia nueva de drag-and-drop debe declararse en webapp/package.json y no en archivos ad hoc de configuración externa.

### Requisitos de testing

- Backend:
  - Agregar tests de integración para el handler de reordenamiento en backend/src/SmartPocket.Tests/Features/, reutilizando IntegrationTestFixture y SQLite en memoria como patrón vigente del proyecto.
  - Cubrir al menos el caso exitoso de reordenamiento completo, incluyendo cambios acumulados de Gastos e Ingresos, el rechazo de IDs inexistentes o inválidos, la inferencia correcta del tipo desde los IDs y la persistencia correcta del nuevo SortOrder al releer la colección.
  - Verificar que la operación no deje estados parciales cuando el payload es inválido o inconsistente.
- Frontend:
  - La cobertura frontend de hooks, UI y abstracción drag-and-drop queda fuera del alcance de esta historia y podrá retomarse en una historia futura dedicada a fortalecer la configuración y estrategia de testing frontend.
  - Si durante la implementación se agrega alguna prueba frontend puntual, debe enfocarse en lógica pura del proyecto y no obligar a reconfigurar por completo la infraestructura de tests de UI en esta misma historia.
- Alcance de pruebas:
  - No es necesario testear detalles internos de la librería de drag-and-drop elegida.
  - Sí es necesario testear el comportamiento propio del proyecto dentro del alcance actual: orden persistido e integración backend del reorder.
- Convenciones:
  - Mantener nombres descriptivos de test siguiendo el estilo actual del repositorio.
  - Evitar over-mocking: mockear solo servicios externos o bordes de infraestructura, no la lógica propia que se quiere verificar.

### Project Structure Notes

- La historia se alinea con la estructura unificada del proyecto: backend organizado por vertical slices, frontend organizado por feature, servicios API separados y pruebas ubicadas junto al código o dentro del proyecto SmartPocket.Tests.
- No se detectan conflictos estructurales con el módulo actual de Categorías. El cambio principal es extender un feature existente, no crear uno nuevo ni redistribuir carpetas base del monorepo.
- La variación estructural más relevante y aceptada en esta historia es incorporar una abstracción local para drag-and-drop dentro del feature de categorías, con el objetivo explícito de desacoplar la pantalla de la librería externa elegida.
- El endpoint nuevo de reorder debe convivir con el CRUD actual sin reemplazar contratos existentes ni mover responsabilidades a otras capas.
- No mover lógica de reorder a carpetas shared salvo que en el futuro aparezca un segundo caso de uso real que justifique una abstracción transversal.

### References

- \_docs/planning-artifacts/epics/epic-02-category-management.md - Historia 2.6, criterios de aceptación y notas técnicas de reordenamiento.
- \_docs/planning-artifacts/prd.md - FR6 a FR10b de Gestión de Categorías y contexto de MVP.
- \_docs/planning-artifacts/architecture.md - reglas de ordenamiento personalizable, vertical slices, invalidación de cache, query key factory, rutas API y pipeline de errores.
- \_docs/planning-artifacts/ux-design-specification.md - requisitos de orden configurado por el usuario, dropdowns de categorías, responsive y touch-friendly UI.
- \_docs/project-context.md - reglas de named exports, strict mode, prohibición de any y default exports, uso obligatorio de TanStack Query y estándares de testing.
- webapp/package.json - stack frontend actual y ausencia de librería drag-and-drop instalada.
- webapp/src/features/categories/components/CategoriesList.tsx - pantalla base de Categorías a extender con modo reorder.
- webapp/src/features/categories/components/CategoryChip.tsx - componente visual actual de cada categoría y restricciones existentes por isDefault.
- webapp/src/features/categories/components/CategoryFormModal.tsx - flujo create/edit/delete existente que debe permanecer separado del reorder.
- webapp/src/features/categories/hooks/useCategories.ts - query keys y mutations actuales del feature.
- webapp/src/api/services/categories/categoryService.ts - servicio HTTP actual a extender con reorder.
- webapp/src/api/services/categories/categoryTypes.ts - contratos frontend actuales de categorías.
- backend/src/SmartPocket.Domain/Transactions/Category.cs - entidad de dominio a extender con SortOrder.
- backend/src/SmartPocket.Persistence/EntityConfigurations/Transactions/CategoryConfig.cs - configuración EF Core de Category.
- backend/src/SmartPocket.Features/Categories/Get/CategoryGetQueryHandler.cs - consulta actual que hoy no aplica orden explícito.
- backend/src/SmartPocket.WebApi/Controllers/CategoriesController.cs - controller actual del módulo Categorías.
- backend/src/SmartPocket.WebApi/Setup/FeatureSetup.cs - registro automático de handlers basado en IHandler.
- backend/src/SmartPocket.Tests/Infrastructures/IntegrationTestFixture.cs - patrón actual para tests de integración backend con SQLite en memoria.

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- No se registraron errores de build ni fallos de tests durante la implementación.
- Todos los tests existentes (2 Account CRUD) continuaron pasando sin regresión.
- 7 tests nuevos de integración para CategoryReorder agregados y pasando.

### Completion Notes List

- **Backend Domain**: SortOrder (int, default 0) agregado a Category entity y mapeado en CategoryConfig con EF Core.
- **Backend Migration**: AddCategorySortOrder migración generada. Columna INTEGER con defaultValue 0.
- **Backend Query**: CategoryGetQueryHandler ordena por SortOrder asc, Id asc. CategoryGetDTO expone SortOrder.
- **Backend Reorder**: Nuevo vertical slice Reorder/ con CategoryReorderCommand, CategoryReorderValidator (FluentValidation), CategoryReorderCommandHandler (validación de IDs, inferencia de tipo, detección de SortOrder duplicado por tipo, actualización atómica).
- **Backend Endpoint**: PUT /categories/reorder expuesto en CategoriesController con patrón ErrorDetails.ToActionResult().
- **Backend Tests**: 7 tests de integración en CategoryReorderHandlerTest usando IntegrationTestFixture con SQLite en memoria.
- **Frontend Types**: CategoryReorderItem y CategoryReorderCommand agregados a categoryTypes.ts.
- **Frontend Service**: Método reorder agregado a categoryService usando spApiClient.put.
- **Frontend Hook**: useReorderCategories mutation con invalidación de categoryKeys.all en éxito.
- **Frontend DnD Abstraction**: Carpeta dnd/ con SortableContainer, SortableItem, moveItem — desacoplando dnd-kit del feature.
- **Frontend UI**: CategoriesList.tsx extendido con modo reordenamiento: botón Reordenar, sesión compartida Gastos/Ingresos, drag-and-drop, Guardar/Cancelar, CRUD deshabilitado en modo edición.
- **Frontend CategoryChip**: Prop isReordering agregada para deshabilitar click durante reorder.
- **Dependencias**: @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities instalados en webapp.
- Tests frontend diferidos a historia futura según lo especificado en la story.
- 9/9 tests backend pasando (0 regresiones). TypeScript y ESLint sin errores.

### File List

- Archivos modificados:
  - backend/src/SmartPocket.Domain/Transactions/Category.cs (SortOrder property)
  - backend/src/SmartPocket.Persistence/EntityConfigurations/Transactions/CategoryConfig.cs (SortOrder mapping)
  - backend/src/SmartPocket.Features/Categories/Get/CategoryGetDTO.cs (SortOrder property)
  - backend/src/SmartPocket.Features/Categories/Get/CategoryGetQueryHandler.cs (OrderBy SortOrder)
  - backend/src/SmartPocket.WebApi/Controllers/CategoriesController.cs (Reorder endpoint)
  - webapp/package.json (dnd-kit dependencies)
  - webapp/src/api/services/categories/categoryTypes.ts (Reorder types)
  - webapp/src/api/services/categories/categoryService.ts (reorder method)
  - webapp/src/features/categories/hooks/useCategories.ts (useReorderCategories)
  - webapp/src/features/categories/components/CategoriesList.tsx (reorder mode)
  - webapp/src/features/categories/components/CategoryChip.tsx (isReordering prop)
- Archivos creados:
  - backend/src/SmartPocket.Features/Categories/Reorder/CategoryReorderCommand.cs
  - backend/src/SmartPocket.Features/Categories/Reorder/CategoryReorderCommandHandler.cs
  - backend/src/SmartPocket.Features/Categories/Reorder/CategoryReorderValidator.cs
  - backend/src/SmartPocket.Persistence/Migrations/20260314023656_AddCategorySortOrder.cs
  - backend/src/SmartPocket.Persistence/Migrations/20260314023656_AddCategorySortOrder.Designer.cs
  - backend/src/SmartPocket.Tests/Features/CategoryReorder/CategoryReorderHandlerTest.cs
  - webapp/src/features/categories/dnd/index.ts
  - webapp/src/features/categories/dnd/SortableContainer.tsx
  - webapp/src/features/categories/dnd/SortableItem.tsx
  - webapp/src/features/categories/dnd/moveItem.ts
