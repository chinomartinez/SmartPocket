---
name: backend-testing
description: Pruebas unitarias y de integración del backend de SmartPocket con xUnit v3, NSubstitute, patrón Arrange-Act-Assert, Theory, FakeSmartPocketContext, QueryableMocker y SQLite in-memory. Úsala al escribir o revisar tests de handlers, validators, casos de uso, mocks, test doubles, tests frágiles o al decidir entre test unitario e integración.
---

# Testing del backend

Guía para escribir pruebas legibles y deterministas sobre `backend/src/SmartPocket.Tests`, usando el stack real del proyecto y evitando tests acoplados a la implementación.

## Cuándo usar esta skill

Actívala cuando la tarea implique:

- Escribir tests de handlers, validators o casos de uso.
- Decidir entre un test unitario y uno de integración.
- Usar NSubstitute, `FakeSmartPocketContext` o `QueryableMocker`.
- Reemplazar tests frágiles, dependientes del orden o con estado compartido.
- Probar reglas de FluentValidation.
- Usar `[Theory]`, `[InlineData]`, `[MemberData]` o `[ClassData]`.
- Definir nombres de clases y métodos de test.
- Agregar object mothers o datos de prueba.

## Estructura espejo

La carpeta de test refleja la carpeta de producción. Si una feature vive en `SmartPocket.Features/{Área}/{Operación}`, sus tests viven en `SmartPocket.Tests/Features/{Área}/{Operación}`:

```text
SmartPocket.Features/Accounts/Create/AccountCreateCommandHandler.cs
SmartPocket.Tests/Features/Accounts/Create/AccountCreateCommandHandlerTests.cs
SmartPocket.Tests/Features/Accounts/Create/AccountCreateCommandHandlerIntegrationTests.cs

SmartPocket.Features/Categories/Reorder/CategoryReorderCommandHandler.cs
SmartPocket.Tests/Features/Categories/Reorder/CategoryReorderCommandHandlerTests.cs
```

Reglas:

- El unitario y el de integración de la misma operación viven juntos; el sufijo `IntegrationTests` distingue el nivel.
- No crear carpetas `Unit/`, `Integration/`, `AccountCRUD/` ni `CategoryReorder/`.
- Los tests transversales que no pertenecen a una feature van en `Others/{Tema}`, por ejemplo `Others/DateOnlyValidation`.
- El namespace sigue la carpeta: `SmartPocket.Tests.Features.Categories.Reorder`.
- `Infrastructures/` y `TestData/` son compartidos y no se espejan.
- No dejes esta convención a la inferencia del modelo: se declara explícitamente para que no derive con cada feature nueva.

## Stack y comandos

- .NET 10, xUnit v3 y Microsoft Testing Platform.
- NSubstitute 6.2.0.
- MockQueryable.NSubstitute 10.0.12 (envuelto por `QueryableMocker`).
- FluentValidation 12.1.1. `InlineValidator<T>` y `TestValidateAsync` vienen en el paquete principal; **no instales `FluentValidation.TestHelper` por separado** (en v12 ya está incluido).

```text
dotnet build SmartPocket.sln
dotnet test --solution SmartPocket.sln
dotnet test --solution SmartPocket.sln --filter-trait "Category=Integration"
dotnet test --solution SmartPocket.sln --filter-not-trait "Category=Integration"
```

`--filter-trait` es la sintaxis de Microsoft Testing Platform. No uses `--filter` con sintaxis de VSTest.

## Regla dura: sin reflexión en tests

Está prohibido usar reflexión en `SmartPocket.Tests`: ni `GetProperty`, ni `SetValue`, ni `Activator`, ni `MakeGenericMethod`, ni similares. Si un test necesita forzar un estado que la API pública no permite, **pará y preguntá** antes de tocar código.

- Las librerías de terceros (NSubstitute, MockQueryable, xUnit) pueden usar reflexión internamente; la regla aplica a nuestro código.
- Para obtener la identidad de una entidad, usá `BaseEntity.GetId()`. No leas `Id` por reflexión.
- Si hace falta un setter o un método de dominio para preparar datos, se evalúa agregarlo a producción con el usuario; no se simula con reflexión.

## Test unitario o integración

```text
Situación                                              Test recomendado
Ramas del handler, mapeo de errores, validaciones      Unitario
LINQ que debe traducirse a SQL                         Integración
Soft delete, auditoría, interceptor, transacción       Integración
DI, seeding, endpoints, ProblemDetails                 Integración
Serialización, DateOnly, formateo                      Unitario puro
Identidad generada por la base de datos                Integración
```

Regla práctica: si el comportamiento depende de EF Core, SQLite o el contenedor de DI, es integración. Si se puede decidir con objetos en memoria, es unitario.

- Unitario: rápido, sin base de datos. Usa `FakeSmartPocketContext` y NSubstitute.
- Integración: `IntegrationTestFixture`, SQLite in-memory y DI real. Ver [integration-testing.md](./references/integration-testing.md).

## Traits: separar integración de unitarios

`SmartPocket.Tests/Infrastructures/IntegrationTestAttribute.cs` implementa `ITraitAttribute` directamente:

```csharp
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method | AttributeTargets.Assembly)]
public sealed class IntegrationTestAttribute : Attribute, ITraitAttribute
{
    public IReadOnlyCollection<KeyValuePair<string, string>> GetTraits()
    {
        return new[]
        {
            new KeyValuePair<string, string>("Category", "Integration")
        };
    }
}
```

Toda clase que use `IntegrationTestFixture` se marca con:

```csharp
[IntegrationTest]
public class AccountCreateCommandHandlerIntegrationTests : IClassFixture<IntegrationTestFixture>
```

- `GetTraits()` devuelve el par directamente: no hay reflexión en nuestro código.
- En modo reflection, xUnit descubre los atributos con reflexión; la regla de no reflexión aplica a lo que escribimos nosotros.
- En Native AOT, `ITraitAttribute` no está soportado (`[Obsolete(error: true)]`); allí solo funciona `TraitAttribute` con el source generator. Este proyecto no usa AOT.
- El trait aplica a toda la clase; no hace falta repetirlo en cada método.
- No es necesario marcar los unitarios: `--filter-not-trait "Category=Integration"` los selecciona.
- Si querés simetría, agregá `[Trait("Category", "Unit")]` a las clases unitarias.
- El atributo estándar `[Trait("Category", "Integration")]` produce el mismo filtro; el atributo propio evita repetir el par y errores de tipeo.

## Arrange-Act-Assert

```csharp
[Fact]
public async Task Update_WhenBalanceChanges_AddsAdjustmentTransaction()
{
    var cancellationToken = TestContext.Current.CancellationToken;

    // Arrange
    var account = AccountTestData.Create(id: 7);
    var context = new FakeSmartPocketContext().With(account);
    var handler = new AccountUpdateCommandHandler(
        context,
        new InlineValidator<AccountUpdateCommand>());

    var command = CreateCommand(id: account.Id, balance: 250);

    // Act
    var errors = await handler.Update(command, cancellationToken);

    // Assert
    Assert.True(errors.IsEmpty);
    var adjustment = Assert.Single(context.Saved<Transaction>());
    Assert.Equal(250, adjustment.SignedAmount);
}
```

Reglas:

- Un solo `Act` por test.
- Nada de asserts en el Arrange.
- Verificá resultado o estado observable, no detalles internos.
- Un test, un comportamiento. Si necesitás dos `Act`, son dos tests.
- Si el caso de uso no devuelve nada, verificá el estado persistido y, si importa, la interacción (`Received`).

## Convención de nombres

Clases:

```text
{TipoBajoPrueba}Tests
{TipoBajoPrueba}IntegrationTests
```

Ejemplos reales:

```text
AccountCreateCommandHandlerTests
AccountCreateCommandHandlerIntegrationTests
AccountCreateCommandValidatorTests
AccountUpdateCommandHandlerTests
CategoryReorderCommandHandlerTests
CategoryReorderCommandHandlerIntegrationTests
```

El nombre de la clase de test debe coincidir con la clase real bajo prueba. Si la clase se llama `AccountCreateCommandValidator`, el test es `AccountCreateCommandValidatorTests`. El archivo vive en la carpeta espejo de la feature y su nombre coincide con la clase.

Para suites transversales en `Others/{Tema}`, el nombre describe el tema (`DateOnlyDashboardQueryTest`); no hay una única clase de producción que espejar.

Métodos: `Metodo_Escenario_Resultado`.

- `Metodo`: el método real bajo prueba (`Create`, `Update`, `Reorder`, `Validate`).
- `Escenario`: `With...` para la forma del input; `When...` para estado o condición.
- `Resultado`: lo observable.

```text
Create_WithZeroBalance_AddsAccountWithoutAdjustment
Create_WhenValidationFails_ReturnsErrorsWithoutTransaction
Update_WhenAccountDoesNotExist_ReturnsError
Update_WhenBalanceChanges_AddsAdjustmentTransaction
Reorder_WithDuplicateSortOrders_ReturnsError
Validate_WithEmptyName_ReturnsErrorForName
Validate_WhenNameAlreadyExists_ReturnsErrorForName
```

No uses `Test`, `Should`, `Works` ni `Can...`. Los nombres van en inglés; los mensajes de assert y los datos pueden estar en español.

## NSubstitute

Usalo para interfaces o miembros virtuales. En este proyecto su rol principal es:

- Verificar interacciones (`CommitAsync`, `RollbackAsync`, `SaveChangesAsync`).
- Forzar excepciones.
- Simular colaboradores externos (`IUserContextAccessor`, etc.).

No lo uses para:

- `IValidator<T>`: FluentValidation recomienda validators reales o `InlineValidator<T>`.
- `IQueryable<T>`: usá `QueryableMocker`.
- Entidades de dominio: usá object mothers.

```csharp
var transaction = Substitute.For<IDatabaseContextTransaction>();
var context = Substitute.For<ISmartPocketContext>();

context.BeginTransactionAsync(Arg.Any<CancellationToken>())
    .Returns(Task.FromResult(transaction));

// El queryable se crea ANTES de Returns: crear un substitute dentro del
// argumento de Returns rompe el contexto de NSubstitute.
var emptyAccounts = QueryableMocker.Empty<Account>();
context.Query<Account>().Returns(emptyAccounts);

await transaction.Received(1).CommitAsync(Arg.Any<CancellationToken>());
await transaction.DidNotReceive().RollbackAsync(Arg.Any<CancellationToken>());
```

Reglas:

- Configurá las llamadas antes de `Returns`.
- Usá `Arg.Any<CancellationToken>()`; no compares el token exacto.
- Para `Task<T>` devolvé `Task.FromResult(...)` o `Task.FromException<T>(...)`.
- Para `ValueTask<T>` devolvé `ValueTask.FromResult(...)`.
- Verificá solo interacciones que importan; no conviertas el test en una lista de llamadas.

Más detalle en [test-doubles.md](./references/test-doubles.md).

## FakeSmartPocketContext y QueryableMocker

`FakeSmartPocketContext` implementa `ISmartPocketContext` en memoria:

```csharp
var account = AccountTestData.Create(id: 1, name: "Caja");
var context = new FakeSmartPocketContext().With(account);

IQueryable<Account> query = context.Query<Account>();
IReadOnlyList<Account> saved = context.Saved<Account>();
```

- `With<T>` siembra entidades ya persistidas.
- `AddEntity`/`AddRange` quedan pendientes hasta `SaveChangesAsync`.
- `DeleteEntity`/`DeleteRange` también quedan pendientes.
- `DiscardAllChanges` descarta los pendientes.
- `Query<T>()` devuelve un `IQueryable` async; soporta `ToListAsync`, `AnyAsync`, `SumAsync`, `FirstOrDefaultAsync`.
- `FindAsync`/`FindAsyncOrThrow` buscan por `GetId()`.
- `Transaction` es un `IDatabaseContextTransaction` de NSubstitute para verificar commit/rollback.

Limitaciones deliberadas:

- **No genera identidades.** Si el caso de uso depende de un `Id` generado por la base, probalo con integración.
- No aplica el interceptor de soft delete ni auditoría.
- No traduce LINQ a SQL.
- No simula atomicidad transaccional real.

`QueryableMocker` es el único punto de acoplamiento con MockQueryable:

```csharp
internal static class QueryableMocker
{
    public static IQueryable<T> AsAsyncQueryable<T>(this IEnumerable<T> source)
        where T : class
        => source.ToList().BuildMockDbSet();

    public static IQueryable<T> Empty<T>() where T : class
        => Array.Empty<T>().AsAsyncQueryable();
}
```

Si mañana se reemplaza MockQueryable por un `AsyncQueryable` propio, solo cambia este archivo.

## FluentValidation

No mockees `IValidator<T>`. La documentación de FluentValidation lo desaconseja explícitamente.

### Tests de reglas: validator real

```csharp
var validator = new AccountCreateCommandValidator(new FakeSmartPocketContext());

var result = await validator.TestValidateAsync(
    command,
    cancellationToken: TestContext.Current.CancellationToken);

result.ShouldHaveValidationErrorFor(x => x.Name);
```

- Tratá al validator como caja negra: input y errores esperados.
- Usá `ShouldNotHaveAnyValidationErrors()` para el caso válido.
- `TestValidateAsync` viene en el namespace `FluentValidation.TestHelper`, incluido en el paquete principal.

### Tests de handler: InlineValidator

Cuando el handler no es el sujeto de la validación, usá `InlineValidator<T>` para aislarlo:

```csharp
var validator = new InlineValidator<AccountUpdateCommand>();
// Sin reglas: siempre válido.
var handler = new AccountUpdateCommandHandler(context, validator);

// Para forzar un error concreto:
var invalidValidator = new InlineValidator<AccountUpdateCommand>();
invalidValidator.RuleFor(x => x.Name).Must(_ => false).WithMessage("Nombre inválido");
```

No hace falta agregar paquetes: `InlineValidator<T>` está en FluentValidation core.

## Theory

Usá `[Theory]` cuando cambia el dato, no el comportamiento.

```csharp
[Theory]
[InlineData("")]
[InlineData(" ")]
public async Task Validate_WithEmptyName_ReturnsErrorForName(string name)
{
    // ...
}
```

- `[InlineData]`: literales, bordes, enums.
- `[MemberData]` con `TheoryData<T1, T2>`: objetos o combinaciones.
- `[ClassData]`: matrices compartidas entre clases.
- El nombre del método describe la regla, no cada fila.
- Si el assert cambia por caso, usá `[Fact]`.

## Object mothers

Los datos de prueba **compartidos** viven en `backend/src/SmartPocket.Tests/TestData/`. Los datos de una sola clase pueden ser un helper privado en esa clase.

```csharp
// Compartido: TestData/AccountTestData.cs
internal static class AccountTestData
{
    public static Account Create(
        int id = 0,
        string name = "Cuenta de prueba",
        decimal initialBalance = 0)
    {
        return new Account(
            name: name,
            icon: new Icon("wallet", "#FFFFFF"),
            currencyCode: Currency.ARS.Code,
            initialBalance: initialBalance,
            includeInBalanceGlobal: true,
            isPrincipal: false)
        {
            Id = id
        };
    }
}

// Local: dentro de CategoryReorderCommandHandlerTests
private static Category CreateCategory(int id, string name = "Categoría de prueba", bool isIncome = false)
{
    return new Category(name, new Icon("tag", "#FFFFFF"), isIncome) { Id = id };
}
```

Reglas:

- Solo construyen entidades **válidas**, usando constructores públicos.
- Defaults obvios y estables; el test sobreescribe lo que importa.
- `id: 0` significa "sin persistir"; el test que necesita un id lo pasa explícito.
- Sin datos aleatorios, sin Bogus, sin GUIDs.
- Primero un helper privado en la clase de test; si lo usan dos o más clases, se promueve a `TestData/`.
- No crear un archivo por entidad de forma preventiva. Un archivo con un solo método se justifica por reutilización, no por simetría con el dominio.
- No ocultar reglas de dominio: si un test necesita un saldo, sembrá también las transacciones.

## Aislamiento de tests

- Una clase de test por sujeto. No llames un test desde otro (`CanUpdate` no debe invocar `CanCreate`).
- No dependas del orden de ejecución ni de `OrderByDescending(Id).First()`.
- Capturá el id devuelto por el caso de uso y usalo.
- En integración, cada clase tiene su propia instancia del fixture y su propia base SQLite. Dentro de una clase, los tests comparten la base: usá datos únicos y `DiscardAllChanges()` antes de leer estado persistido.
- Si un test necesita limpiar la base, implementá `IAsyncLifetime` en la clase de test y recreá la base; no agregues estado global.

## Anti-patterns

```text
No mockear IValidator<T>                  → validator real o InlineValidator
No mockear IQueryable<T> con NSubstitute  → QueryableMocker / BuildMockDbSet
No usar reflexión para setear estado      → pará y preguntá
No testear detalles privados              → resultado o estado observable
No usar Thread.Sleep                      → await de la operación o token
No compartir estado entre tests           → datos únicos por test
No probar identidad generada por BD       → test de integración
No crear un test para cada línea          → Theory cuando corresponde
```

## Checklist

- [ ] La clase de test se llama como la clase bajo prueba, con sufijo `Tests`.
- [ ] El método sigue `Metodo_Escenario_Resultado`.
- [ ] Hay un solo `Act`.
- [ ] No se usa reflexión.
- [ ] El validator se prueba con `TestValidateAsync`, no con un mock.
- [ ] El handler usa `InlineValidator` cuando la validación no es el sujeto.
- [ ] El `IQueryable` se crea antes de configurar `Returns`.
- [ ] Se usa `TestContext.Current.CancellationToken` en llamadas async que lo aceptan.
- [ ] Los tests son independientes del orden y del estado previo.
- [ ] Si depende de EF, SQLite o DI, el test es de integración.
- [ ] Los datos de prueba son deterministas y válidos.

## References

- [Test doubles: QueryableMocker, FakeSmartPocketContext y NSubstitute](./references/test-doubles.md)
- [Tests de integración con SQLite in-memory](./references/integration-testing.md)
- [NSubstitute](https://nsubstitute.github.io/)
- [FluentValidation - Testing](https://docs.fluentvalidation.net/en/latest/testing.html)
- [xUnit v3 - cancellation](https://xunit.net/docs/getting-started/v3/whats-new)
- [MockQueryable](https://github.com/romantitov/MockQueryable)
