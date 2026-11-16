# Tests de integración del backend

Cómo usar `IntegrationTestFixture`, SQLite in-memory y el contenedor de DI real.

## Ubicación y trait

El test de integración vive junto al unitario, en la carpeta espejo de la feature:

```text
SmartPocket.Tests/Features/Accounts/Create/
├── AccountCreateCommandHandlerTests.cs
└── AccountCreateCommandHandlerIntegrationTests.cs
```

Toda clase que use `IClassFixture<IntegrationTestFixture>` se marca con:

```csharp
[IntegrationTest]
public class AccountCreateCommandHandlerIntegrationTests : IClassFixture<IntegrationTestFixture>
```

`IntegrationTestAttribute` vive en `Infrastructures/IntegrationTestAttribute.cs` e implementa `ITraitAttribute`; `GetTraits()` devuelve `Category=Integration` sin reflexión en nuestro código. En Native AOT no está soportado: allí solo funciona `TraitAttribute`.

```text
dotnet test --solution SmartPocket.sln --filter-trait "Category=Integration"
dotnet test --solution SmartPocket.sln --filter-not-trait "Category=Integration"
```

## Qué prueba la integración

Usá integración cuando el comportamiento depende de:

- Traducción de LINQ a SQL (`Where`, `Sum`, `Any`, `Include`, proyecciones).
- `DateOnly` y funciones de fecha en SQLite.
- Soft delete y filtros globales.
- Auditoría e interceptores de `SaveChanges`.
- Transacciones reales y rollback.
- Identidad generada por la base de datos.
- Registro de handlers y validators en DI.
- Seeding.
- Paginación (`ToPagedListResponse`).
- Endpoints y `ProblemDetails`, si se agregan tests de API.

No uses integración para:

- Ramas de un handler que se pueden decidir en memoria.
- Mapeo de errores a `ErrorDetailList`.
- Reglas de validación que no dependen de la base.
- Formateo o serialización pura.

## `IntegrationTestFixture`

Vive en `backend/src/SmartPocket.Tests/Infrastructures/IntegrationTestFixture.cs`.

- Abre una conexión SQLite en memoria (`Data Source=:memory:;Foreign Keys=True`).
- Construye un `ServiceProvider` con `AddFeatures()`.
- Registra `SmartPocketContext` con interceptor de soft delete y seeding.
- Ejecuta `EnsureCreatedAsync()`.
- Expone `SmartPocketContext` y `GetHandler<T>()`.

```csharp
public class AccountCreateCommandHandlerIntegrationTests
    : IClassFixture<IntegrationTestFixture>
{
    private readonly IntegrationTestFixture _fixture;
    private readonly AccountCreateCommandHandler _handler;

    public AccountCreateCommandHandlerIntegrationTests(IntegrationTestFixture fixture)
    {
        _fixture = fixture;
        _handler = fixture.GetHandler<AccountCreateCommandHandler>();
    }
}
```

## Aislamiento

- Cada clase de test obtiene su propia instancia del fixture y su propia base SQLite.
- Dentro de una clase, los tests comparten la base. Escribilos para que sean independientes.
- No llames un test desde otro para preparar datos.
- No dependas del orden ni de `OrderByDescending(Id).First()`.
- Capturá el id devuelto por el caso de uso.
- Usá nombres únicos por test si el caso de uso valida duplicados.
- Llamá `DiscardAllChanges()` antes de leer estado persistido, para forzar la lectura desde SQLite.

```csharp
var result = await _handler.Create(command, cancellationToken);
Assert.True(result.IsSuccess);

var accountId = result.Value!.Id;

_fixture.SmartPocketContext.DiscardAllChanges();

var name = await _fixture.SmartPocketContext.Query<Account>()
    .Where(x => x.Id == accountId)
    .Select(x => x.Name)
    .FirstAsync(cancellationToken);

Assert.Equal(command.Name, name);
```

## Ejemplo: crear y verificar el saldo

```csharp
[Fact]
public async Task Create_WithInitialBalance_PersistsAccountAndAdjustmentTransaction()
{
    var cancellationToken = TestContext.Current.CancellationToken;

    var command = new AccountCreateCommand
    {
        Name = "Cuenta integration create",
        CurrencyCode = Currency.ARS.Code,
        Balance = 10000,
        IncludeInBalanceGlobal = true,
        Icon = new IconDTO { Code = "wallet", ColorHex = "#FFFFFF" }
    };

    var result = await _handler.Create(command, cancellationToken);

    Assert.True(result.IsSuccess);

    var accountId = result.Value!.Id;
    Assert.True(accountId > 0);

    _fixture.SmartPocketContext.DiscardAllChanges();

    var accountName = await _fixture.SmartPocketContext.Query<Account>()
        .Where(x => x.Id == accountId)
        .Select(x => x.Name)
        .FirstAsync(cancellationToken);

    Assert.Equal(command.Name, accountName);

    var balance = await _fixture.SmartPocketContext.Query<Transaction>()
        .Where(x => x.AccountId == accountId)
        .SumAsync(x => x.SignedAmount, cancellationToken);

    Assert.Equal(10000m, balance);
}
```

## SQLite: límites a tener en cuenta

- No es SQL Server. Algunas funciones o traducciones pueden diferir.
- `decimal` se compara y suma en SQLite con las conversiones configuradas; verificá los bordes.
- `DateOnly` se traduce con `strftime`; los tests de dashboard ya cubren ese caso.
- El soft delete depende del filtro global; no lo agregues a mano en las consultas.
- La base vive mientras vive la conexión del fixture. No cierres la conexión manualmente.

## Cuándo dividir unitario e integración

Si un handler tiene ramas que no dependen de EF, probalas en unitario y dejá en integración solo lo que necesita la base:

```text
Unitario:
  - validación falla y no abre transacción
  - cuenta inexistente devuelve error
  - cambio de saldo agrega ajuste en memoria

Integración:
  - identidad generada
  - persistencia del nombre y del saldo
  - traducción de Sum/Where/DateOnly
  - soft delete y auditoría
```

Así la suite rápida cubre la lógica y la suite de integración cubre el comportamiento real de EF.

## Comandos

```text
dotnet test --solution SmartPocket.sln
```

Para correr una clase o un test, usá el filtro del runner o del IDE. No agregues `Thread.Sleep` ni dependas de tiempos: usá el `CancellationToken` del test.

## Checklist de integración

- [ ] La clase termina en `IntegrationTests`.
- [ ] Usa `IClassFixture<IntegrationTestFixture>`.
- [ ] No llama tests entre sí.
- [ ] Crea sus propios datos.
- [ ] Captura ids devueltos, no los adivina.
- [ ] Llama `DiscardAllChanges()` antes de verificar persistencia.
- [ ] Usa `TestContext.Current.CancellationToken`.
- [ ] Verifica el estado real en SQLite, no solo el objeto en memoria.
