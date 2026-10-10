---
name: backend-data-access
description: Accede a datos desde el código de aplicación del backend de SmartPocket usando ISmartPocketContext y las utilidades existentes de Persistence. Úsala al crear consultas, proyecciones, paginación, operaciones CRUD, búsquedas por Id, soft delete, transacciones o acceso a EF Core.
---

# Acceso a datos del backend

Aplica el contrato de persistencia existente en SmartPocket para consultar y modificar datos sin acoplar el código de aplicación directamente al `DbContext`.

## Cuándo usar esta skill

Actívala cuando la tarea implique:

- Consultar entidades desde código de aplicación.
- Crear proyecciones a DTOs.
- Buscar entidades por identificador.
- Comprobar existencia de registros.
- Crear, modificar o eliminar entidades.
- Ejecutar operaciones atómicas con transacciones.
- Implementar listados paginados.
- Trabajar con soft delete o filtros globales.
- Revisar consultas duplicadas, cargas innecesarias o problemas de rendimiento.

## Contrato de acceso a datos

Los consumidores de Persistence deben utilizar `ISmartPocketContext` desde `SmartPocket.Persistence`.
Actualmente, el uso principal ocurre en handlers y validators:

```csharp
public class AccountGetQueryHandler : IHandler
{
    private readonly ISmartPocketContext _smartPocketContext;

    public AccountGetQueryHandler(ISmartPocketContext smartPocketContext)
    {
        _smartPocketContext = smartPocketContext;
    }
}
```

Respeta estas reglas:

- Inyecta `ISmartPocketContext`, no `SmartPocketContext` ni `DbContext` directamente en el código de aplicación.
- Usa únicamente los métodos expuestos por `ISmartPocketContext` desde el consumidor correspondiente.
- Mantén el acceso a EF Core detrás del contrato existente.
- No introduzcas repositorios genéricos adicionales salvo que exista una necesidad concreta y aprobada.
- No agregues métodos al contrato solo para evitar una consulta sencilla que ya pueda expresarse con `Query<T>()`.
- Recuerda que las entidades consultables deben heredar de `BaseEntity`.

El contrato actual expone:

```csharp
IQueryable<T> Query<T>() where T : BaseEntity;
ValueTask<T> FindAsyncOrThrow<T>(object id, CancellationToken cancellation) where T : BaseEntity;
ValueTask<T?> FindAsync<T>(object id, CancellationToken cancellation) where T : BaseEntity;
T AddEntity<T>(T entity) where T : BaseEntity;
void AddRange<T>(IEnumerable<T> entities) where T : BaseEntity;
T DeleteEntity<T>(T entity) where T : BaseEntity;
void DeleteRange<T>(IEnumerable<T> entities) where T : BaseEntity;
Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
void DiscardAllChanges();
Task<IDatabaseContextTransaction> BeginTransactionAsync(CancellationToken cancellationToken = default);
```

`SmartPocketContext` contiene algunas operaciones auxiliares adicionales, pero si no están en `ISmartPocketContext` no las trates como parte del contrato público disponible para los consumidores de Persistence.

## Consultas de lectura

### Construir consultas con `Query<T>()`

Usa `Query<T>()` como punto de entrada para consultas:

```csharp
var accounts = await _smartPocketContext.Query<Account>()
    .Where(x => x.IncludeInBalanceGlobal)
    .OrderBy(x => x.Name)
    .ToListAsync(cancellationToken);
```

- Construye la consulta antes de ejecutarla.
- Usa métodos async de EF Core para ejecutar consultas: `ToListAsync`, `FirstOrDefaultAsync`, `SingleOrDefaultAsync`, `AnyAsync`, `CountAsync` y `SumAsync`.
- Propaga siempre el `CancellationToken` recibido.
- No llames `ToList()` o `ToArray()` antes de completar filtros, ordenamiento y proyección.
- No ejecutes la misma consulta varias veces sin una razón explícita.

### Buscar por identificador

Elige el método según el contrato esperado:

- Usa `FindAsync<T>(id, cancellation)` cuando la ausencia sea válida y deba representarse como `null`.
- Usa `FindAsyncOrThrow<T>(id, cancellation)` cuando la entidad sea obligatoria para continuar.
- Usa una consulta proyectada cuando no necesites materializar la entidad completa.

```csharp
var account = await _smartPocketContext.FindAsyncOrThrow<Account>(command.Id, cancellationToken);
account.Update(...);
await _smartPocketContext.SaveChangesAsync(cancellationToken);
```

No hagas primero `Exists(id)` y luego `FindAsyncOrThrow(id)` para la misma operación. Busca la entidad una vez y usa el resultado. Esto evita consultas duplicadas y permite aplicar la regla de ausencia en un único lugar.

### Comprobar existencia

Usa `AnyAsync` cuando solo necesites saber si existe un registro:

```csharp
var exists = await _smartPocketContext.Query<Account>()
    .AnyAsync(x => x.Name == name, cancellationToken);
```

No cargues una entidad completa para una comprobación booleana.

La existencia de entidades relacionadas puede comprobarse antes de ejecutar una operación cuando el caso de uso lo requiera. Evita comprobar y volver a buscar el mismo registro dentro de una única operación; reutiliza la entidad obtenida o expresa la operación con una sola consulta.

## Proyecciones y relaciones

Para consultas de lectura, proyecta directamente al DTO:

```csharp
var result = await _smartPocketContext.Query<Account>()
    .Select(x => new AccountGetByIdDTO
    {
        Id = x.Id,
        Name = x.Name,
        Balance = x.Transactions.Sum(t => t.SignedAmount),
        Currency = CurrencyItemDTOMapper.GetByCode(x.CurrencyCode),
        Icon = new()
        {
            Code = x.Icon.Code,
            ColorHex = x.Icon.ColorHex,
        },
    })
    .FirstOrDefaultAsync(cancellationToken);
```

- Selecciona solo los campos que necesita la respuesta.
- Permite que EF Core traduzca el filtro, cálculo y proyección a SQL.
- Evita cargar la entidad completa y sus relaciones si solo necesitas un DTO.
- Evita `Include` como sustituto de una proyección.
- Usa `Include` solo cuando necesites materializar la entidad junto con sus relaciones para una operación de dominio.
- No cargues colecciones completas si un agregado o cálculo puede resolverse con `Any`, `Count`, `Sum` o una proyección.
- Revisa que las expresiones usadas en `Select` sean traducibles por el proveedor SQLite actual.

No uses una consulta dentro de un bucle si puede expresarse en una sola consulta. Evita el patrón N+1, especialmente al recorrer entidades y consultar sus relaciones una por una.

### Tracking

Las entidades obtenidas para ser modificadas deben permanecer rastreadas por el contexto. Las consultas proyectadas a DTO no necesitan tracking porque no materializan entidades para actualizar.

No agregues `AsNoTracking` indiscriminadamente. Úsalo solo cuando exista una necesidad clara de lectura sin tracking y comprueba que no se requiera modificar la entidad resultante.

## Paginación

Para requests que implementan `IPagedQuery`, usa las utilidades de `SmartPocket.Persistence.PagedQuery`:

```csharp
return await _smartPocketContext.Query<Account>()
    .OrderBy(x => x.Name)
    .Select(x => new AccountGetDTO
    {
        Id = x.Id,
        Name = x.Name,
    })
    .ToPagedListResponse(request, cancellationToken);
```

`ToPagedListResponse` obtiene los datos y el total. Con paginación activa normalmente ejecuta una consulta para la página y otra para `Count`. Esto es esperado; no lo reemplaces por consultas manuales sin una necesidad demostrada.

Antes de paginar:

- Aplica filtros.
- Aplica un ordenamiento determinista.
- Proyecta al DTO cuando sea posible.
- Pasa el `CancellationToken`.

El comportamiento actual permite valores negativos de `Page` y `PageSize` para solicitar todos los registros. No cambies esta semántica desde el código consumidor sin una decisión explícita.

## Operaciones de escritura

### Crear

Agrega entidades mediante `AddEntity` o `AddRange` y persiste los cambios explícitamente:

```csharp
var account = new Account(...);

_smartPocketContext.AddEntity(account);
await _smartPocketContext.SaveChangesAsync(cancellationToken);
```

Para varias entidades:

```csharp
_smartPocketContext.AddRange(entities);
await _smartPocketContext.SaveChangesAsync(cancellationToken);
```

No llames `SaveChangesAsync` después de cada entidad si todas forman parte de una misma operación y no existe una razón transaccional para separar los guardados.

### Modificar

1. Obtén la entidad con `FindAsyncOrThrow` o una consulta adecuada.
2. Usa métodos de dominio como `Update`.
3. Llama una vez a `SaveChangesAsync` al completar la operación.

No asignes propiedades privadas desde el código consumidor ni uses consultas proyectadas para entidades que deban actualizarse.

### Eliminar

Para eliminar una entidad cargada, utiliza las operaciones expuestas por el contrato:

```csharp
_smartPocketContext.DeleteEntity(account);
await _smartPocketContext.SaveChangesAsync(cancellationToken);
```

Respeta el soft delete configurado por la entidad y por `ApplyCommonConfigs`. No ejecutes SQL directo para marcar `IsDeleted`.

## Transacciones

Usa `BeginTransactionAsync` cuando una operación incluya varios cambios que deban confirmarse o revertirse juntos:

```csharp
await using var dbTransaction = await _smartPocketContext
    .BeginTransactionAsync(cancellationToken);

try
{
    // Varias operaciones de escritura.
    await _smartPocketContext.SaveChangesAsync(cancellationToken);

    await dbTransaction.CommitAsync(cancellationToken);
}
catch
{
    await dbTransaction.RollbackAsync(cancellationToken);
    throw;
}
```

- Pasa el `CancellationToken` a inicio, guardado, commit y rollback.
- Usa transacción cuando haya varios `SaveChangesAsync` relacionados o efectos que deban ser atómicos.
- No abras una transacción para cada consulta simple o escritura única sin necesidad.
- No ocultes excepciones después del rollback.
- Libera la transacción mediante `using` o `await using`.

## Soft delete y filtros globales

Las entidades que implementan `IDeletable`, directamente o mediante `BaseAuditEntity<T>`, reciben el filtro global configurado por `ApplyCommonConfigs`:

```csharp
HasQueryFilter(x => !x.IsDeleted)
```

Por tanto:

- Las consultas normales no deben agregar manualmente `Where(x => !x.IsDeleted)`.
- No asumas que una entidad eliminada aparece en `Query<T>()`.
- Usa la configuración existente en lugar de crear filtros específicos duplicados.
- No uses `IgnoreQueryFilters` salvo que el caso de uso requiera explícitamente consultar registros eliminados y esté justificado.

## Reglas de consistencia

- Usa nombres claros para las variables de consulta y resultados.
- Mantén filtros, ordenamiento y proyección dentro del `IQueryable` antes de ejecutarlo.
- Evita materializar datos que no se utilizarán.
- Usa `CancellationToken` en toda operación async de base de datos.
- No mezcles acceso a datos con construcción de respuestas HTTP.
- No pongas validaciones de entrada propias de FluentValidation en este nivel.
- Mantén las reglas de negocio fuera de Persistence; esta capa ejecuta el acceso a datos y no decide el caso de uso.

## Checklist

- [ ] El consumidor inyecta `ISmartPocketContext`.
- [ ] No se inyecta directamente `DbContext` o `SmartPocketContext`.
- [ ] La consulta usa `Query<T>()` y una entidad derivada de `BaseEntity`.
- [ ] La consulta se ejecuta con un método async de EF Core.
- [ ] Se propaga el `CancellationToken`.
- [ ] Se usa `Select` para proyectar DTOs cuando no se necesita la entidad completa.
- [ ] Se evita `Include` innecesario y el patrón N+1.
- [ ] No se consulta `Exists` y después `Find` para el mismo registro.
- [ ] Las escrituras usan `AddEntity`, `AddRange`, `DeleteEntity` o `DeleteRange`.
- [ ] Se llama explícitamente a `SaveChangesAsync`.
- [ ] Las operaciones múltiples que requieren atomicidad usan transacción.
- [ ] La transacción se confirma, revierte y libera correctamente.
- [ ] Se respeta el filtro global de soft delete.
- [ ] La paginación usa `ToPagedListResponse` cuando aplica.
- [ ] Los filtros y el orden preceden a la paginación.

## Validación

Ejecuta desde `backend/src/`:

```text
dotnet build SmartPocket.sln
dotnet test --solution SmartPocket.sln
```

Si una consulta falla en ejecución, revisa primero la traducción de LINQ al proveedor SQLite, especialmente cálculos sobre navegaciones, value objects, fechas, columnas calculadas y expresiones dentro de `Select`.
