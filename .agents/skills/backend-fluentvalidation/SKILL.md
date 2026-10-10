---
name: backend-fluentvalidation
description: Crea y mantiene validaciones FluentValidation en el backend de SmartPocket. Úsala al trabajar con AbstractValidator, validators de Commands o Requests, validaciones de objetos anidados, reglas de existencia, ISmartPocketContext, CascadeStop o AddValidatorsFromAssembly.
---

# FluentValidation en el backend

Aplica las convenciones existentes de SmartPocket para validar Commands, Requests y DTOs antes de ejecutar los casos de uso.

## Cuándo usar esta skill

Actívala cuando la tarea implique:

- Crear o modificar un `AbstractValidator<T>`.
- Validar Commands, Requests o DTOs.
- Validar propiedades anidadas con `SetValidator`.
- Comprobar la existencia de entidades relacionadas mediante `ISmartPocketContext`.
- Reutilizar reglas de `CommonValidators` o validaciones core de una entidad.
- Revisar errores de validación, cascadas o reglas async.

## Registro y ubicación

Los validators pertenecen al proyecto `SmartPocket.Features`, junto al Command, Request o DTO que validan.

`FeatureSetup` registra automáticamente todos los validators del assembly de Features:

```csharp
services.AddValidatorsFromAssembly(FeatureAssembly);
```

Por tanto:

- No registres manualmente cada validator en `Program.cs`.
- Mantén el validator como clase concreta derivada de `AbstractValidator<T>`.
- Usa un namespace coherente con la feature y operación.
- Sigue las convenciones de nombres existentes, como `AccountCreateValidator`, `TransferUpdateCommandValidator` o `IconDTOValidator`.

La configuración global actual usa `CascadeMode.Stop` como nivel de cascada de reglas. No cambies la configuración global desde un validator individual sin una razón explícita.

## Crear un validator

Define el validator para el tipo exacto que recibe el caso de uso:

```csharp
public class TransferUpdateCommandValidator : AbstractValidator<TransferUpdateCommand>
{
    public TransferUpdateCommandValidator(ISmartPocketContext smartPocketContext)
    {
        RuleFor(x => x.Id)
            .GreaterThan(0);

        RuleFor(x => x.Amount)
            .GreaterThan(0)
            .WithMessage("El monto debe ser mayor que cero.");
    }
}
```

Reglas generales:

- Valida la forma y los datos de entrada antes de ejecutar el caso de uso.
- Usa mensajes claros y específicos para la propiedad validada.
- Encadena reglas relacionadas en la misma propiedad.
- Usa `WithMessage` cuando el mensaje predeterminado no sea suficiente o el proyecto ya tenga un mensaje establecido.
- No modifiques el Command o Request desde el validator.
- No uses el validator para ejecutar cambios en la base de datos.
- Mantén las reglas pequeñas y reutilizables cuando se repitan entre operaciones.

## Qué validar y qué no validar

### Validaciones apropiadas

Usa FluentValidation para:

- Campos obligatorios.
- Longitudes mínimas y máximas.
- Rangos numéricos.
- Formatos y códigos.
- Fechas válidas y límites temporales.
- Combinaciones simples de propiedades.
- Existencia de entidades relacionadas cuando sea una regla de entrada.

Ejemplo:

```csharp
RuleFor(x => x.EffectiveDate)
    .CascadeStop()
    .NotEmpty()
    .GreaterThan(DateTime.MinValue)
    .WithMessage("La fecha efectiva debe ser una fecha válida.")
    .LessThanOrEqualTo(DateTime.UtcNow)
    .WithMessage("La fecha efectiva no puede ser en el futuro.");
```

### Responsabilidades del handler o dominio

No uses FluentValidation para reemplazar:

- Reglas de negocio complejas que dependan del estado actual de una entidad.
- Transiciones de estado que pertenecen a la entidad de dominio.
- Operaciones de escritura.
- Creación de entidades o modificaciones del contexto.
- La búsqueda definitiva de la entidad principal que se va a actualizar o eliminar.

La validación puede confirmar que un Id tenga un formato válido y que una entidad relacionada exista. El handler debe obtener la entidad principal que necesita modificar y decidir cómo tratar su ausencia.

Evita consultar dos veces el mismo registro: no valides la existencia del recurso principal y luego vuelvas a buscarlo en el handler sin necesidad.

## Reglas reutilizables

### Validaciones core de una entidad

Cuando varias operaciones comparten reglas de una entidad, centralízalas en una clase estática de la feature:

```csharp
internal static class AccountCoreValidations
{
    internal static IRuleBuilderOptions<T, string> NameValidations<T>(
        IRuleBuilder<T, string> ruleBuilder)
    {
        return ruleBuilder
            .NotEmpty()
            .MaximumLength(100);
    }
}
```

Úsalas mediante `Apply`:

```csharp
RuleFor(x => x.Name)
    .CascadeStop()
    .Apply(AccountCoreValidations.NameValidations);
```

No dupliques reglas idénticas en Create, Update y otras operaciones si representan la misma regla de entrada.

### Validaciones compartidas

Reutiliza `SmartPocket.Features.Shared.Validators.CommonValidators` y las extensiones compartidas que correspondan.

Extensiones disponibles:

- `CascadeStop()` para detener reglas posteriores de una propiedad cuando una regla anterior falla.
- `Apply(...)` para aplicar un conjunto de reglas reutilizable.
- `CurrencyValidations()` para códigos de moneda de tres letras mayúsculas.
- `ExistById(...)` para comprobar que exista una entidad relacionada.

Ejemplo de existencia de una entidad relacionada:

```csharp
RuleFor(x => x.OriginAccountId)
    .CascadeStop()
    .GreaterThan(0)
    .ExistById(smartPocketContext.Query<Account>());
```

`ExistById` utiliza `AnyAsync` y el `CancellationToken` de FluentValidation. Pasa una consulta de `ISmartPocketContext.Query<TEntity>()`; no inyectes un `DbContext` directamente.

## Cascada y orden de las reglas

Usa `CascadeStop()` cuando una regla posterior no tenga sentido si falla la anterior:

```csharp
RuleFor(x => x.Icon)
    .CascadeStop()
    .NotNull()
    .SetValidator(new IconDTOValidator());
```

Esto evita errores secundarios o consultas de existencia con valores inválidos.

La configuración global ya define `CascadeMode.Stop` a nivel de regla, pero usa `CascadeStop()` explícitamente cuando el orden sea importante para comunicar la intención o proteger una regla async.

## Validaciones anidadas

Para objetos complejos, crea un validator específico y conéctalo con `SetValidator`:

```csharp
RuleFor(x => x.StatementClosingRange)
    .NotNull()
    .SetValidator(new DayRangeDTOValidator());
```

Usa validators anidados para:

- `IconDTO`.
- `DayRangeDTO`.
- `MoneyDTO`.
- Otros DTOs reutilizables con reglas propias.

No copies las reglas internas del objeto en cada validator padre.

Si la propiedad puede ser nula, valida primero `NotNull()` y configura la cascada para no ejecutar el validator anidado sobre un valor inválido.

## Validaciones asíncronas y acceso a datos

Inyecta `ISmartPocketContext` cuando una regla necesite consultar datos:

```csharp
public AccountCreateValidator(ISmartPocketContext context)
{
    RuleFor(x => x.Name)
        .CascadeStop()
        .NotEmpty()
        .MustAsync(async (name, cancellationToken) =>
        {
            var exists = await context.Query<Account>()
                .AnyAsync(x => x.Name == name, cancellationToken);

            return !exists;
        })
        .WithMessage("Ya existe una cuenta con ese nombre.");
}
```

Reglas para validaciones async:

- Usa `MustAsync` para consultas asíncronas.
- Propaga el `CancellationToken` recibido por FluentValidation.
- Usa `AnyAsync` cuando solo necesites existencia.
- No cargues la entidad completa para validar una existencia.
- No realices escrituras desde un validator.
- Evita múltiples consultas para validar el mismo valor.
- Considera la unicidad y las condiciones de carrera como una responsabilidad adicional del almacenamiento o del caso de uso; la validación no reemplaza una restricción de base de datos.

## Errores y límites de la validación

- Un error de FluentValidation representa datos de entrada inválidos.
- Una entidad principal inexistente debe resolverse en el handler mediante la operación correspondiente.
- Una regla de dominio que solo puede evaluarse con el estado actual de la entidad no debe duplicarse sin necesidad en el validator.
- No conviertas excepciones de dominio en errores de validación automáticamente.
- No construyas respuestas HTTP desde un validator.

## Checklist

- [ ] El validator hereda de `AbstractValidator<T>`.
- [ ] Está ubicado junto al Command, Request o DTO correspondiente.
- [ ] Se registra automáticamente desde `FeatureAssembly`.
- [ ] No tiene registro manual innecesario en `Program.cs`.
- [ ] Valida datos de entrada, no operaciones de escritura.
- [ ] Usa `CascadeStop()` cuando el orden de reglas sea relevante.
- [ ] Reutiliza validaciones core y validators anidados cuando corresponda.
- [ ] Usa `ISmartPocketContext` para consultas de validación.
- [ ] Las consultas async usan `AnyAsync` y `CancellationToken`.
- [ ] No valida y vuelve a buscar innecesariamente la misma entidad principal.
- [ ] No crea respuestas HTTP ni decide el status code.

## Validación

Ejecuta desde `backend/src/`:

```text
dotnet build SmartPocket.sln
dotnet test --solution SmartPocket.sln
```
