---
name: backend-features
description: Crea y organiza features verticales en el backend de SmartPocket. Úsala al trabajar con Commands, Requests, DTOs, handlers, IHandler, interfaces propias de features, ValidateCommand, resultados de casos de uso o coordinación entre dominio, validación y persistencia.
---

# Features del backend

Organiza los casos de uso del backend como features verticales, manteniendo separadas las responsabilidades de endpoint, validación, acceso a datos y dominio.

## Cuándo usar esta skill

Actívala cuando la tarea implique:

- Crear una nueva feature o una nueva operación de una feature existente.
- Crear Commands, Requests, DTOs o responses.
- Crear o modificar un handler.
- Decidir si una clase implementa `IHandler` o una interfaz propia.
- Coordinar validación, dominio, persistencia y resultado de un caso de uso.
- Elegir entre un handler de un método o una abstracción reutilizable con varios métodos.
- Usar `ValidateCommand` desde un handler.
- Elegir un tipo de resultado del SharedKernel.

## Organización vertical

Organiza las features bajo `backend/src/SmartPocket.Features/`, agrupando primero por capacidad o entidad y después por operación:

```text
Accounts/
├── Create/
│   ├── AccountCreateCommand.cs
│   ├── AccountCreateCommandHandler.cs
│   ├── AccountCreateValidator.cs
│   └── AccountCreateResponse.cs
├── Get/
│   ├── AccountGetRequest.cs
│   ├── AccountGetQueryHandler.cs
│   └── AccountGetDTO.cs
└── Update/
    ├── AccountUpdateCommand.cs
    ├── AccountUpdateCommandHandler.cs
    └── AccountUpdateValidator.cs
```

Reglas generales:

- Usa nombres de código en inglés.
- Agrupa los archivos de una operación dentro de su propia carpeta cuando la feature lo requiera.
- Mantén Commands, Requests, DTOs y validators cerca del handler que los utiliza.
- Mantén el acceso a datos mediante `ISmartPocketContext`; consulta `backend-data-access` para los detalles de Persistence.
- Mantén las reglas de FluentValidation en validators; consulta `backend-fluentvalidation`.
- Mantén invariantes y cambios de estado propios dentro de las entidades de dominio; consulta `backend-domain-entities`.
- No mezcles varias capacidades no relacionadas en una misma feature.

## Handler y `IHandler`

`IHandler` es una interfaz marcadora:

```csharp
public interface IHandler;
```

`FeatureSetup.AddFeatureHandlers()` escanea el assembly `SmartPocket.Features` y registra como scoped las clases concretas que implementan `IHandler`.

### Handler inyectado por clase

Implementa `IHandler` cuando la clase representa un caso de uso que se inyectará directamente por su tipo concreto:

```csharp
public class AccountCreateCommandHandler : IHandler
{
    public async Task<ResultWithErrors<AccountCreateResponse>> Create(
        AccountCreateCommand command,
        CancellationToken cancellationToken)
    {
        // Caso de uso.
    }
}
```

Este patrón permite que el scan automático lo registre. La inyección concreta y los parámetros `[FromServices]` pertenecen a la capa de endpoints; esta skill solo define la decisión del handler sobre su registro.

### Clase inyectada mediante interfaz propia

No implementes `IHandler` cuando la clase deba consumirse mediante una interfaz propia:

```csharp
public interface ICreditCardStatementSuggestionsQueryHandler
{
    Task<CreditCardStatementSuggestionsDTO> Get(
        int creditCardId,
        DateTime closingDate,
        CancellationToken cancellation);
}

public class CreditCardStatementSuggestionsQueryHandler
    : ICreditCardStatementSuggestionsQueryHandler
{
    // Implementación.
}
```

Este patrón es apropiado cuando:

- La funcionalidad puede ser consumida por otra feature.
- La abstracción propia es parte del contrato de la capacidad.
- Se desea desacoplar al consumidor de la implementación concreta.
- La clase expone una capacidad reutilizable y no una operación inyectada directamente por clase.

Una interfaz propia no activa el scan de `IHandler`. Registra explícitamente la implementación en `FeatureSetup`:

```csharp
services.AddScoped<
    ICreditCardStatementSuggestionsQueryHandler,
    CreditCardStatementSuggestionsQueryHandler>();
```

No implementes ambas formas automáticamente. Usa `IHandler` o una interfaz propia según el contrato de inyección necesario.

## Verticalidad y cantidad de métodos

La recomendación principal es crear una clase vertical con un método público que represente un caso de uso:

```csharp
public class CategoryReorderCommandHandler : IHandler
{
    public Task<ErrorDetailList> Reorder(
        CategoryReorderCommand command,
        CancellationToken cancellationToken)
    {
        // Caso de uso Reorder.
    }
}
```

La verticalidad es una recomendación, no una restricción absoluta. Permite varios métodos públicos cuando:

- Pertenecen a la misma abstracción funcional.
- Se exponen mediante una interfaz propia claramente definida.
- Comparten consultas, transformaciones o lógica interna significativa.
- Separarlos produciría duplicación artificial o clases pequeñas sin una responsabilidad independiente.
- La clase funciona como una capacidad reutilizable entre features.

Cuando existan varios métodos públicos:

- Mantén todos los métodos relacionados con la misma responsabilidad.
- Extrae la lógica compartida a métodos privados.
- No uses métodos privados para ocultar operaciones de capacidades diferentes.
- Documenta el motivo si la clase deja de representar un único caso de uso.
- Prefiere una interfaz propia si la clase será consumida desde otra feature.

No fuerces una separación de un método por clase cuando la separación empeore la cohesión. Tampoco agrupes métodos solo porque usan la misma entidad.

## Commands, Requests y parámetros

Usa un `Command` para operaciones que cambian el estado:

```csharp
public class CategoryCreateCommand
{
    public string Name { get; set; } = default!;
    public IconDTO Icon { get; set; } = default!;
    public bool IsIncome { get; set; }
}
```

Usa un `Request` para consultas, filtros o paginación:

```csharp
public class AccountGetRequest : IPagedQuery
{
    public int Page { get; set; }
    public int PageSize { get; set; }
}
```

Reglas:

- Encapsula parámetros en un objeto cuando sean varios, relacionados o puedan crecer.
- Acepta parámetros directos cuando sean pocos y expresen claramente la operación.
- No crees un objeto artificial si un método con uno o dos parámetros es más claro.
- Mantén los DTOs de entrada separados de las entidades de dominio.
- Usa nombres explícitos en los métodos: `Create`, `Update`, `Get`, `GetAll`, `TryGet`, `Exists`, `SoftDelete`, `Remove` o `Reorder` según la intención.
- No uses `Handle` como nombre genérico del método.

## Flujo de un handler

Un handler coordina el caso de uso, pero no debe asumir responsabilidades de endpoint ni de infraestructura de persistencia:

1. Recibe un Command, Request o los parámetros explícitos necesarios.
2. Ejecuta la validación mediante `IValidator<T>` y `ValidateCommand` cuando exista un validator.
3. Devuelve inmediatamente los errores de validación.
4. Obtiene o consulta datos mediante `ISmartPocketContext`.
5. Invoca constructores y métodos de la entidad de dominio.
6. Coordina una transacción si hay varios cambios atómicos.
7. Persiste mediante el contrato de Persistence.
8. Proyecta o construye la respuesta del caso de uso.

Ejemplo:

```csharp
public async Task<ResultWithErrors<CategoryCreateResponse>> Create(
    CategoryCreateCommand request,
    CancellationToken cancellationToken)
{
    var validation = await _validator.ValidateCommand(request, cancellationToken);
    if (validation.IsNotValid) return validation.Errors;

    var category = new Category(
        name: request.Name,
        icon: request.Icon.ToDomainIcon(),
        isIncome: request.IsIncome);

    _smartPocketContext.AddEntity(category);
    await _smartPocketContext.SaveChangesAsync(cancellationToken);

    return new CategoryCreateResponse(category.Id);
}
```

No pongas en el handler:

- Construcción de `ActionResult` o status codes HTTP.
- Reglas de validación que pertenecen a FluentValidation.
- SQL directo o acceso a `DbContext` concreto.
- Asignación directa a setters privados de una entidad.
- Reglas de mapeo EF Core.

## Resultados del SharedKernel

Usa los tipos reales de `SmartPocket.SharedKernel.Results`. No llames a estos tipos `ResultMonad` ni inventes un `Result<T>` genérico.

### `SimpleResult`

Usa `SimpleResult` cuando solo necesites éxito o fallo sin valor ni error específico:

```csharp
return SimpleResult.Success();
return SimpleResult.Failure();
```

### `SimpleResult<E>`

Usa `SimpleResult<E>` cuando el fallo tenga un error de tipo `E`, pero la operación no devuelva un valor exitoso:

```csharp
return SimpleResult<ErrorDetailList>.Failure(errors);
```

### `SimpleResult<T, E>`

Usa `SimpleResult<T, E>` cuando el caso de uso pueda devolver un valor `T` o un error `E`:

```csharp
public Task<SimpleResult<AccountResponse, ErrorDetailList>> Create(...)
```

El tipo admite conversiones implícitas desde el valor exitoso y el error, pero usa métodos explícitos cuando mejoren la claridad.

### `ResultWithErrors<T>`

Usa `ResultWithErrors<T>` cuando el error esperado sea `ErrorDetailList`:

```csharp
public async Task<ResultWithErrors<AccountCreateResponse>> Create(...)
```

Este tipo deriva de `SimpleResult<T, ErrorDetailList>` y permite devolver directamente una lista de errores o el valor exitoso.

### Interfaces de resultado

Las interfaces disponibles son:

- `ISimpleResult` para éxito o fallo.
- `ISimpleResult<E>` para fallo con error.
- `ISimpleResult<T, E>` para valor o error.

Elige el resultado según el contrato del caso de uso. No envuelvas innecesariamente un DTO en un resultado si el caso de uso no necesita representar errores mediante ese tipo.

La transformación del resultado a `ActionResult`, `NotFound`, `BadRequest` u otra respuesta HTTP pertenece a la futura skill de endpoints.

## Coordinación con otras skills

- Usa `backend-data-access` para consultas, escrituras, paginación y transacciones.
- Usa `backend-fluentvalidation` para definir validators y reglas de entrada.
- Usa `backend-domain-entities` para entidades, value objects y configuraciones EF Core.
- Usa la skill de endpoints cuando se creen controllers, rutas, `[FromServices]` o respuestas HTTP.

## Checklist

- [ ] La feature está organizada por capacidad y operación.
- [ ] El handler implementa `IHandler` si se inyectará por clase y debe detectarse por scan.
- [ ] La clase no implementa `IHandler` si se consumirá mediante una interfaz propia.
- [ ] Las interfaces propias están registradas explícitamente en `FeatureSetup`.
- [ ] La clase tiene un método público por caso de uso, salvo una excepción justificada.
- [ ] Los métodos múltiples pertenecen a una misma capacidad y comparten lógica coherente.
- [ ] La lógica compartida está en métodos privados cuando corresponde.
- [ ] Los Commands representan escrituras y los Requests representan consultas o filtros.
- [ ] El handler usa `ValidateCommand` y retorna temprano ante errores de validación.
- [ ] El acceso a datos usa `ISmartPocketContext`.
- [ ] Las modificaciones pasan por métodos de dominio.
- [ ] El resultado usa los tipos reales de `SmartPocket.SharedKernel.Results`.
- [ ] El handler no construye respuestas HTTP.
- [ ] Se propaga el `CancellationToken`.

## Validación

Ejecuta desde `backend/src/`:

```text
dotnet build SmartPocket.sln
dotnet test --solution SmartPocket.sln
```
