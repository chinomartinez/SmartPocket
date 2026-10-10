---
name: backend-endpoints
description: Crea y modifica endpoints HTTP de la API SmartPocket usando controllers ASP.NET Core, bindings, handlers, ActionResultExtensions y ProblemDetails. Úsala al trabajar con rutas, verbos HTTP, FromRoute, FromQuery, FromBody, FromServices, respuestas HTTP, ApiProducesConvention o mensajes de error.
---

# Endpoints del backend

Expón los casos de uso de SmartPocket mediante controllers delgados que traduzcan HTTP al contrato de las features y del resultado del caso de uso.

## Cuándo usar esta skill

Actívala cuando la tarea implique:

- Crear o modificar un controller.
- Agregar una ruta o endpoint HTTP.
- Elegir un verbo HTTP o una plantilla de ruta.
- Usar model binding de ASP.NET Core.
- Inyectar un handler con `[FromServices]`.
- Convertir resultados de handlers a `ActionResult`.
- Devolver DTOs, respuestas paginadas, `NotFound` o errores de cliente.
- Trabajar con `ApiProducesConvention`, `ApiProblemDetails` o `ErrorResultFilter`.

## Estructura de controllers

Los controllers están en `backend/src/SmartPocket.WebApi/Controllers/` y normalmente siguen este patrón:

```csharp
[ApiController]
[Route("[controller]")]
public class AccountsController : ControllerBase
{
    // Endpoints de Account.
}
```

Reglas:

- Hereda de `ControllerBase`.
- Usa `[ApiController]`.
- Usa `[Route("[controller]")]` salvo que el recurso necesite una ruta explícita.
- Mantén los controllers delgados.
- Delega el caso de uso a un handler.
- No inyectes `DbContext` ni `ISmartPocketContext` directamente en un controller.
- No coloques reglas de negocio, consultas de datos o transformaciones complejas en el controller.
- Propaga el `CancellationToken` hasta el handler.

La aplicación utiliza `/api` como path base mediante `UsePathBase`; las rutas declaradas en los controllers son relativas a ese prefijo.

## Verbos HTTP

No limites los endpoints a operaciones CRUD. Usa el verbo que represente la semántica de la operación:

- `[HttpGet]` para obtener información sin modificar estado.
- `[HttpPost]` para crear recursos o ejecutar acciones que no sean actualizaciones idempotentes.
- `[HttpPut("{id}")]` para reemplazar o actualizar un recurso de forma idempotente.
- `[HttpPatch("{id}")]` para cambios parciales cuando el contrato lo requiera.
- `[HttpDelete("{id}")]` para eliminar o marcar un recurso como eliminado.
- `[HttpHead]` cuando solo se necesiten headers y no el cuerpo de la respuesta.
- `[HttpOptions]` cuando sea necesario declarar u obtener opciones del recurso.

No elijas el verbo solo por la implementación interna. Considera la semántica HTTP, la idempotencia y el contrato que consumen los clientes.

Ejemplos:

```csharp
[HttpGet]
public async Task<PagedListResponse<AccountGetDTO>> Get(...)
{
    return await handler.GetAll(request, cancellation);
}

[HttpPost]
public async Task<ActionResult<AccountCreateResponse>> Create(...)
{
    var result = await handler.Create(command, cancellation);
    return result.ToActionResult();
}

[HttpPut("{id}")]
public async Task<ActionResult> Update(...)
{
    // Construir Command y delegar.
}

[HttpDelete("{id}")]
public async Task<ActionResult> Delete(...)
{
    // Delegar eliminación o soft delete.
}
```

## Rutas

- Usa rutas consistentes con el recurso del controller.
- Usa `[HttpGet("{id}")]`, `[HttpPut("{id}")]` y `[HttpDelete("{id}")]` para recursos identificados.
- Usa rutas explícitas para acciones relacionadas o recursos anidados cuando mejoren la claridad:

```csharp
[HttpGet("/CreditCards/{creditCardId}/[controller]/suggestions")]
public async Task<CreditCardStatementSuggestionsDTO> Suggestions(...)
```

- Mantén los nombres de parámetros de ruta alineados con los parámetros del método.
- No ocultes una acción especializada detrás de una ruta ambigua.
- Evita incluir lógica de negocio en la construcción de rutas.

## Model binding

Usa bindings explícitos cuando existan varias fuentes de entrada o cuando mejoren la legibilidad.

### `[FromRoute]`

Usa `[FromRoute]` para identificadores o parámetros incluidos en la URL:

```csharp
public async Task<ActionResult<AccountGetByIdDTO>> GetById(
    [FromRoute] int id,
    [FromServices] AccountGetByIdQueryHandler handler,
    CancellationToken cancellation)
```

### `[FromQuery]`

Usa `[FromQuery]` para filtros, paginación, ordenamiento y parámetros de consulta:

```csharp
public async Task<PagedListResponse<CreditCardStatementListItemDTO>> List(
    [FromServices] CreditCardStatementListQueryHandler handler,
    [FromQuery] CreditCardStatementListRequest query,
    CancellationToken cancellation)
```

También aplica a parámetros simples como fechas, estados o filtros específicos.

### `[FromBody]`

Usa `[FromBody]` para Commands o modelos de entrada enviados como JSON:

```csharp
public async Task<ActionResult<AccountCreateResponse>> Create(
    [FromBody] AccountCreateCommand command,
    [FromServices] AccountCreateCommandHandler handler,
    CancellationToken cancellation)
```

No mezcles varios parámetros complejos desde el body. Encapsúlalos en un objeto de entrada.

### `[FromServices]`

Usa `[FromServices]` para inyectar puntualmente el handler o la interfaz propia de la feature:

```csharp
public async Task<CreditCardStatementSuggestionsDTO> Suggestions(
    [FromServices] ICreditCardStatementSuggestionsQueryHandler handler,
    [FromRoute] int creditCardId,
    [FromQuery] DateTime closingDate,
    CancellationToken cancellation)
```

La clase concreta suele implementar `IHandler` y estar registrada por scan. Una interfaz propia debe estar registrada explícitamente en `FeatureSetup`.

### Otros bindings

También pueden utilizarse según el contrato HTTP:

- `[FromHeader]` para valores enviados en headers.
- `[FromForm]` para formularios o archivos multipart.
- `[FromForm(Name = "...")]` cuando el nombre del campo difiera.
- `[FromQuery(Name = "...")]` y `[FromRoute(Name = "...")]` cuando el nombre externo no coincida.
- `[FromServices]` para servicios específicos del endpoint.

No agregues un binding explícito solo por costumbre si no aporta claridad, pero evita ambigüedad cuando el método combina route, query, body y servicios.

## Delegar al handler

El endpoint debe recibir la entrada HTTP, construir el Command cuando sea necesario y delegar:

```csharp
[HttpPut("{id}")]
public async Task<ActionResult> Update(
    [FromRoute] int id,
    [FromBody] CreditCardStatementUpdateBody body,
    [FromServices] CreditCardStatementUpdateCommandHandler handler,
    CancellationToken cancellation)
{
    var command = new CreditCardStatementUpdateCommand
    {
        Id = id,
        CreditCardId = body.CreditCardId,
        Description = body.Description,
        ClosingDate = body.ClosingDate,
        DueDate = body.DueDate,
        InstallmentIds = body.InstallmentIds,
        SubsChargesForUpdate = body.SubsChargesForUpdate,
        SubsChargesForCreate = body.SubsChargesForCreate
    };

    var result = await handler.Update(command, cancellation);
    return result.ToActionResult();
}
```

Reglas:

- No llames `ValidateAsync` manualmente en el controller.
- No dupliques reglas de FluentValidation.
- No consultes existencia y luego repitas la misma consulta en el handler sin una razón clara.
- Si el body y la ruta forman un Command distinto, construye el Command explícitamente.
- Mantén el mapeo body → Command simple y visible.

## Tipos de retorno

Elige un retorno que describa la respuesta HTTP y permita a `ApiProducesConvention` inferir su tipo:

### DTO directo

Úsalo cuando la operación siempre devuelve un resultado exitoso y no necesita representar un `ActionResult` explícito:

```csharp
public async Task<CreditCardStatementSuggestionsDTO> Suggestions(...)
```

### `ActionResult<T>`

Úsalo cuando el endpoint puede devolver el DTO o un resultado HTTP alternativo:

```csharp
public async Task<ActionResult<AccountGetByIdDTO>> GetById(...)
```

### `ActionResult`

Úsalo cuando el endpoint no devuelve un cuerpo exitoso o el resultado se transforma desde un resultado del SharedKernel:

```csharp
public async Task<ActionResult> Delete(...)
```

### Respuestas paginadas

Usa el tipo real de Persistence cuando la consulta devuelve paginación:

```csharp
public async Task<PagedListResponse<AccountGetDTO>> Get(...)
```

No envuelvas innecesariamente una respuesta paginada en `ActionResult<T>` si no necesitas una respuesta alternativa explícita.

## Convertir resultados

Usa las extensiones de `backend/src/SmartPocket.WebApi/Extensions/ActionResultExtensions.cs`:

```csharp
var result = await handler.Create(command, cancellation);
return result.ToActionResult();
```

Cuando el valor del resultado necesita una transformación:

```csharp
return result.ToActionResult(value => new AccountCreateResponse(value));
```

Estas extensiones convierten resultados exitosos en respuestas 200 y errores en respuestas de cliente. No repitas en cada controller la lógica de inspeccionar `IsSuccess` o `IsFailure`.

Para un resultado nullable que no es un `SimpleResult`, controla la ausencia explícitamente:

```csharp
var result = await handler.TryGet(id, cancellation);

if (result is null)
    return NotFound($"La cuenta con Id {id} no fue encontrada.");

return result;
```

## Mensajes de error

Incluye siempre un mensaje descriptivo en respuestas de error como `NotFound`, `BadRequest`, `Conflict` o `Unauthorized` cuando el endpoint construya directamente la respuesta.

Correcto:

```csharp
return NotFound($"La transacción con Id {id} no fue encontrada.");
```

Evita:

```csharp
return NotFound();
```

El mensaje debe explicar el recurso, identificador o motivo del error sin exponer información sensible. Mantén el idioma y la terminología consistentes con el proyecto.

## ApiProducesConvention

La aplicación registra `ApiProducesConvention` globalmente en `Program`:

```csharp
services.AddControllers(options =>
{
    options.Conventions.Add(new ApiProducesConvention());
});
```

La convención infiere el tipo de retorno y agrega automáticamente metadata para:

- Respuestas exitosas `200`.
- Respuestas de cliente `400` o el código que ya declare la acción.
- Respuestas de servidor `500` con `ProblemDetails`.

Por tanto:

- No agregues `ProducesResponseType` manualmente por defecto.
- Declara correctamente el tipo de retorno del método.
- Usa `ActionResult<T>` cuando el endpoint necesite combinar un tipo exitoso con respuestas HTTP alternativas.
- Agrega atributos manuales solo cuando exista una excepción documentada que la convención no pueda inferir.

La convención contempla `Task<T>`, `ValueTask<T>`, `ActionResult`, `IActionResult` y `ActionResult<T>`. Revisa el tipo declarado si la documentación OpenAPI no refleja la respuesta esperada.

## ProblemDetails y errores

El pipeline actual registra `ErrorResultFilter` y `AddProblemDetails` desde `ErrorSetup`.

`ErrorResultFilter` convierte resultados de error que contengan `string`, `ErrorDetail` o `ErrorDetailList` a `ApiProblemDetails`, que incluye:

```csharp
public ErrorDetailList Errors { get; init; }
```

Respeta esta separación:

- El handler devuelve el resultado del caso de uso.
- `ActionResultExtensions` transforma resultados conocidos a respuestas HTTP.
- El filtro convierte errores estructurados a `ApiProblemDetails`.
- El endpoint agrega mensajes descriptivos cuando construye directamente `NotFound` u otra respuesta.

No construyas manualmente `ApiProblemDetails` para cada endpoint si el pipeline existente ya puede realizar la conversión.

## Responsabilidades del endpoint

El endpoint puede:

- Recibir datos HTTP.
- Hacer binding de route, query, body, headers y services.
- Construir un Command o Request.
- Invocar un handler.
- Convertir el resultado a HTTP.
- Devolver mensajes descriptivos para errores HTTP directos.

El endpoint no debe:

- Implementar reglas de negocio.
- Consultar directamente la base de datos.
- Crear o modificar entidades de dominio.
- Ejecutar validators manualmente.
- Decidir detalles de persistencia.
- Repetir la lógica del handler.

## Checklist

- [ ] El controller usa `[ApiController]` y una ruta coherente.
- [ ] El verbo HTTP representa la semántica de la operación.
- [ ] Los bindings identifican claramente la fuente de cada dato.
- [ ] El handler o interfaz propia se obtiene mediante `[FromServices]` cuando corresponde.
- [ ] Se propaga el `CancellationToken`.
- [ ] El endpoint no contiene lógica de negocio ni acceso directo a datos.
- [ ] El body se transforma explícitamente a Command cuando route y body se combinan.
- [ ] Se utiliza `ActionResultExtensions` para resultados compatibles.
- [ ] Las respuestas directas de ausencia incluyen un mensaje descriptivo.
- [ ] No se agregan atributos `ProducesResponseType` innecesarios.
- [ ] El tipo de retorno permite que `ApiProducesConvention` genere metadata correcta.
- [ ] Los errores estructurados respetan `ApiProblemDetails` y `ErrorResultFilter`.
