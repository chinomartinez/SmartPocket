# Test doubles del backend

Detalle de `QueryableMocker`, `FakeSmartPocketContext` y los patrones de NSubstitute que usa SmartPocket.

## `BaseEntity.GetId()`

`FindAsync` necesita la identidad sin reflexión. Por eso `BaseEntity` expone:

```csharp
public abstract class BaseEntity
{
    public abstract object GetId();
}

public abstract class BaseEntity<T> : BaseEntity
{
    public T Id { get; init; } = default!;

    public override object GetId() => Id!;
}
```

- Funciona con claves `int` y con claves enum como `TransactionSourceType`.
- EF Core no mapea métodos.
- No agregues setters ni métodos solo para tests sin consultarlo.

## `QueryableMocker`

```csharp
using MockQueryable.NSubstitute;

namespace SmartPocket.Tests.Infrastructures
{
    internal static class QueryableMocker
    {
        public static IQueryable<T> AsAsyncQueryable<T>(this IEnumerable<T> source) where T : class
        {
            return source.ToList().BuildMockDbSet();
        }

        public static IQueryable<T> Empty<T>() where T : class
        {
            return Array.Empty<T>().AsAsyncQueryable();
        }
    }
}
```

- `BuildMockDbSet()` devuelve un `DbSet<T>`; como `DbSet<T>` implementa `IQueryable<T>`, satisface `ISmartPocketContext.Query<T>()`.
- Soporta las extensiones async de EF: `ToListAsync`, `FirstOrDefaultAsync`, `AnyAsync`, `SumAsync`.
- Es el único archivo acoplado a MockQueryable.
- La reflexión que usa MockQueryable internamente está permitida; la prohibición aplica a nuestro código.

## `FakeSmartPocketContext`

Implementa `ISmartPocketContext` sobre listas en memoria.

```csharp
var account = AccountTestData.Create(id: 1, name: "Caja");
var context = new FakeSmartPocketContext().With(account);
```

### Comportamiento

| Operación | Comportamiento |
|---|---|
| `With<T>` | Siembra entidades ya persistidas. |
| `AddEntity` / `AddRange` | Quedan pendientes hasta `SaveChangesAsync`. |
| `DeleteEntity` / `DeleteRange` | Quedan pendientes hasta `SaveChangesAsync`. |
| `SaveChangesAsync` | Aplica pendientes y devuelve la cantidad afectada. |
| `DiscardAllChanges` | Descarta pendientes; no borra lo sembrado. |
| `Query<T>()` | `IQueryable` async con lo persistido. |
| `FindAsync` / `FindAsyncOrThrow` | Busca por `GetId()`; incluye pendientes de alta. |
| `BeginTransactionAsync` | Devuelve `Transaction`. |
| `Transaction` | `IDatabaseContextTransaction` de NSubstitute. |

### Ejemplo de verificación de transacción

```csharp
var context = new FakeSmartPocketContext();
var handler = new AccountCreateCommandHandler(
    context,
    new InlineValidator<AccountCreateCommand>());

var result = await handler.Create(command, cancellationToken);

Assert.True(result.IsSuccess);
await context.Transaction.Received(1).CommitAsync(Arg.Any<CancellationToken>());
```

### Limitaciones

- **No genera identidades.** Si el handler crea una entidad y usa su `Id` antes de un `SaveChanges` real, el resultado será `0`. Ese caso va a integración.
- No aplica el interceptor de soft delete.
- No aplica auditoría (`CreatedAt`, `LastModifiedAt`).
- No traduce LINQ a SQL; solo ejecuta en memoria.
- No simula atomicidad: un `SaveChanges` fallido no revierte los anteriores.

## NSubstitute

### Configurar antes de `Returns`

Crear un substitute dentro del argumento de `Returns` rompe el contexto de NSubstitute:

```csharp
// Mal: BuildMockDbSet crea un substitute dentro de Returns.
context.Query<Account>().Returns(QueryableMocker.Empty<Account>());
// CouldNotSetReturnDueToNoLastCallException
```

```csharp
// Bien: el queryable se crea antes.
var emptyAccounts = QueryableMocker.Empty<Account>();
context.Query<Account>().Returns(emptyAccounts);
```

### `Task<T>` y `ValueTask<T>`

```csharp
context.SaveChangesAsync(Arg.Any<CancellationToken>())
    .Returns(Task.FromException<int>(new InvalidOperationException("save failed")));

context.BeginTransactionAsync(Arg.Any<CancellationToken>())
    .Returns(Task.FromResult(transaction));

context.FindAsyncOrThrow<Account>(account.Id, Arg.Any<CancellationToken>())
    .Returns(ValueTask.FromResult(account));
```

### Forzar una excepción y verificar rollback

```csharp
var context = Substitute.For<ISmartPocketContext>();
var transaction = Substitute.For<IDatabaseContextTransaction>();

context.BeginTransactionAsync(Arg.Any<CancellationToken>())
    .Returns(Task.FromResult(transaction));

var emptyAccounts = QueryableMocker.Empty<Account>();
context.Query<Account>().Returns(emptyAccounts);

context.SaveChangesAsync(Arg.Any<CancellationToken>())
    .Returns(Task.FromException<int>(new InvalidOperationException("save failed")));

var handler = new AccountCreateCommandHandler(
    context,
    new InlineValidator<AccountCreateCommand>());

await Assert.ThrowsAsync<InvalidOperationException>(
    () => handler.Create(command, cancellationToken));

await transaction.Received(1).RollbackAsync(Arg.Any<CancellationToken>());
await transaction.DidNotReceive().CommitAsync(Arg.Any<CancellationToken>());
```

### Argumentos y verificaciones

```csharp
context.AddEntity(Arg.Is<Account>(x => x.Name == "Caja"));

await context.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
await context.DidNotReceive().BeginTransactionAsync(Arg.Any<CancellationToken>());

context.ReceivedCalls();
```

- `Arg.Any<T>()` cuando el valor no importa.
- `Arg.Is<T>(...)` cuando el valor es parte del contrato.
- `Received(1)` / `DidNotReceive()` para interacciones significativas.
- No verifiques cada llamada: el test se vuelve frágil.

### `CancellationToken`

- Configurá con `Arg.Any<CancellationToken>()`.
- No compares el token exacto; el token del test no es parte del contrato.
- En el SUT, usá `TestContext.Current.CancellationToken` para llamadas async.
- `CancellationToken.None` es válido en lógica pura o cuando probás el comportamiento por defecto.

## Fake o substitute

| Situación | Herramienta |
|---|---|
| Camino feliz con estado en memoria | `FakeSmartPocketContext` |
| Verificar commit/rollback | `FakeSmartPocketContext.Transaction` |
| Forzar excepción de `SaveChangesAsync` | `Substitute.For<ISmartPocketContext>()` |
| Colaborador externo | NSubstitute |
| Validación | Validator real o `InlineValidator` |
| `IQueryable` async | `QueryableMocker` |

No mezcles ambos en el mismo test sin una razón. Si el test necesita forzar excepciones y además estado, preferí el substitute y configurá solo lo necesario.

## Anti-patterns

- Mockear `IValidator<T>`.
- Mockear `IQueryable<T>` con `Substitute.For<IQueryable<T>>()`.
- Usar reflexión para setear `Id` o propiedades privadas.
- Crear object mothers con datos aleatorios.
- Probar el interceptor de soft delete en un unitario.
- Verificar llamadas internas que no son parte del contrato.
- Reutilizar una instancia de `FakeSmartPocketContext` entre tests sin limpiar.
