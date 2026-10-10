---
name: backend-domain-entities
description: Crea y modifica entidades de dominio y configuraciones de Entity Framework Core en el backend de SmartPocket. Úsala al trabajar en backend/src/SmartPocket.Domain, backend/src/SmartPocket.Persistence, modelos de dominio, entidades, value objects, IEntityTypeConfiguration, DbSet, auditoría, soft delete o mapeos EF Core.
---

# Entidades de dominio y EF Core

Aplica las convenciones de SmartPocket para diseñar entidades de dominio con comportamiento encapsulado y mapearlas correctamente con Entity Framework Core.

## Cuándo usar esta skill

Activa esta skill cuando la tarea implique:

- Crear o modificar una entidad bajo `backend/src/SmartPocket.Domain/`.
- Agregar propiedades, relaciones, constructores o métodos de comportamiento a una entidad.
- Crear un value object del dominio.
- Crear una configuración `IEntityTypeConfiguration<T>`.
- Configurar propiedades, relaciones, precisión decimal, iconos o monedas en EF Core.
- Registrar un `DbSet` en `SmartPocketContext`.
- Configurar auditoría, timestamps o soft delete.
- Revisar por qué una entidad o configuración no se persiste correctamente.

## Reglas generales

- Escribe identificadores y nombres de archivos en inglés.
- Mantén la comunicación y los comentarios técnicos del proyecto en español cuando corresponda.
- Trabaja dentro de `backend/src/SmartPocket.Domain/` para el modelo de dominio y de `backend/src/SmartPocket.Persistence/` para la persistencia.
- Revisa entidades y configuraciones similares antes de crear una nueva.
- No agregues configuraciones, abstracciones o validaciones que no sean necesarias para el caso de uso.
- Mantén las reglas de negocio en la entidad cuando pertenezcan a su estado o comportamiento.
- No conviertas la entidad en una clase plana de propiedades sin comportamiento cuando existan invariantes o transiciones de estado.

## Límites entre Domain y Persistence

Respeta la dirección de dependencias existente:

```text
SmartPocket.Persistence → SmartPocket.Domain → SmartPocket.SharedKernel
```

- Mantén `SmartPocket.Domain` independiente de Entity Framework Core.
- No agregues referencias de `Microsoft.EntityFrameworkCore` al proyecto Domain.
- Mantén las configuraciones, `EntityTypeBuilder`, `ComplexProperty` y detalles de tablas en `SmartPocket.Persistence`.
- No uses atributos de persistencia en las entidades de dominio salvo que exista una decisión explícita y justificada.
- No agregues paquetes EF Core innecesarios al proyecto Domain.
- Revisa `ISmartPocketContext` cuando una entidad deba formar parte del contrato de persistencia, pero no expongas automáticamente cada `DbSet` sin necesidad.

Ambos proyectos usan `net10.0`, `Nullable` habilitado e `ImplicitUsings` habilitado. Respeta estas opciones al crear código:

- Declara tipos anulables con `?` cuando una propiedad, navegación o clave foránea pueda faltar.
- Usa `= default!` únicamente cuando EF Core materialice una propiedad no anulable o cuando el constructor garantice su asignación.
- Evita usar `!` para ocultar estados potencialmente inválidos.
- Revisa conjuntamente la nulabilidad de la navegación y su clave foránea.
- No agregues imports redundantes que ya estén disponibles por `ImplicitUsings`, pero conserva explícitamente los imports necesarios para namespaces del proyecto.

## Estructura y nombres

- Usa nombres singulares para las entidades: `Account`, `Transaction`, `CreditCard`.
- Usa carpetas plurales para agrupar entidades: `Accounts/`, `Transactions/`, `CreditCards/`.
- Coloca las configuraciones en `backend/src/SmartPocket.Persistence/EntityConfigurations/`.
- Mantén la misma estructura de carpetas y namespace entre el dominio y sus configuraciones cuando sea conveniente.
- Nombra las configuraciones con el sufijo `_EntityConfig`: `Account_EntityConfig`.

## Crear una entidad de dominio

### Elegir la clase base

Usa la clase base mínima que represente las necesidades de la entidad:

| Necesidad | Base o interfaz |
| --- | --- |
| Entidad sin identificador propio | `BaseEntity` |
| Entidad con identificador | `BaseEntity<T>` |
| Identificador, auditoría, timestamps y soft delete | `BaseAuditEntity<T>` |
| Solo soft delete | `IDeletable` |
| Solo timestamps y auditoría temporal | `ITimestampedEntity` |

Importa los tipos desde `SmartPocket.SharedKernel.Entities`.

Si la entidad tiene `Id`, hereda de `BaseEntity<T>` o de `BaseAuditEntity<T>`. El identificador de `BaseEntity<T>` usa `init`; no agregues un setter público alternativo.

`BaseAuditEntity<T>` ya implementa `ITimestampedEntity` e `IDeletable`, inicializa `IsDeleted` y expone `SetCreated` y `SetLastModified`. No dupliques esas propiedades o métodos en la entidad.

### Propiedades

- Expón propiedades con `get` público y `set` privado.
- Usa `= default!` para propiedades no anulables que EF Core inicializa o que se establecen desde un constructor.
- Mantén las colecciones de navegación inicializadas, normalmente con `new List<T>()`.
- Declara las navegaciones con el tipo de navegación y las claves foráneas que necesite el modelo.
- No uses setters públicos para permitir modificaciones desde cualquier capa.
- Para propiedades calculadas, expresa el cálculo en la entidad y configura la columna calculada solo si realmente debe persistirse o consultarse en la base de datos.

Ejemplo de propiedades y navegación:

```csharp
public class Account : BaseAuditEntity<int>
{
    public string Name { get; private set; } = default!;
    public Icon Icon { get; private set; } = default!;
    public string CurrencyCode { get; private set; } = default!;
    public decimal InitialBalance { get; private set; }

    public ICollection<Transaction> Transactions { get; private set; } = new List<Transaction>();
}
```

### Constructores

- Crea un constructor público que reciba los datos mínimos requeridos para construir una entidad válida.
- Asigna los datos mediante `Update` u otros métodos de dominio para centralizar validaciones y reglas.
- Para constructores complejos, agrega también un constructor privado sin parámetros para que EF Core pueda materializar la entidad.
- Si el constructor sin parámetros solo existe para EF Core, deja un comentario breve que lo indique.
- Inicializa las colecciones de navegación en la declaración o en los constructores.
- Cuando las pruebas unitarias necesiten navegar desde la entidad recién creada, proporciona constructores o fábricas que inicialicen también los objetos de navegación necesarios. No dependas de reflexión para completar el estado del objeto.
- No hagas público el constructor sin parámetros salvo que exista una razón concreta del modelo.

Ejemplo:

```csharp
private CreditCard()
{
    // Para EF Core
}

public CreditCard(
    string name,
    Icon icon,
    string currencyCode,
    decimal creditLimit)
{
    Update(name, icon, currencyCode, creditLimit);
}
```

### Comportamiento y actualización

- Agrega un método `Update` cuando una entidad pueda editarse después de su creación.
- Usa métodos con nombres de dominio para transiciones específicas, por ejemplo `MarkAsPaid`, `AddInstallment` o `SetPrimary`, en lugar de exponer setters.
- Valida invariantes antes de modificar el estado.
- Mantén una única fuente de verdad para las reglas: el constructor y los métodos públicos deben reutilizar la misma lógica cuando sea posible.
- Usa los guards existentes de `SmartPocket.SharedKernel.Guards` cuando ya cubran la validación requerida.
- Devuelve excepciones coherentes con las convenciones existentes si los datos no pueden formar un estado válido.
- No agregues un método `Update` genérico si la entidad solo puede modificarse mediante operaciones específicas.

Ejemplo:

```csharp
public void Update(string name, Icon icon, string currencyCode, bool includeInBalanceGlobal)
{
    Name = name.GetIfNotNullOrWhiteSpace(nameof(name));
    Icon = icon;
    CurrencyCode = currencyCode.GetIfNotNullOrWhiteSpace(nameof(currencyCode));
    IncludeInBalanceGlobal = includeInBalanceGlobal;
}
```

### Value objects

- Para tipos pequeños e inmutables del dominio usa `readonly record struct`.
- Sigue el patrón existente de `backend/src/SmartPocket.Domain/Icon.cs`.
- Mantén las validaciones propias del value object junto al tipo cuando sea apropiado.
- Configura los value objects como `ComplexProperty` en EF Core.
- Configura explícitamente sus propiedades requeridas, longitudes y precisión cuando las convenciones no sean suficientes.

Ejemplo de forma:

```csharp
public readonly record struct DayRange(int StartDay, int EndDay);
```

## Configurar EF Core

### Crear la configuración

Implementa `IEntityTypeConfiguration<TEntity>` en una clase con el sufijo `_EntityConfig`:

```csharp
internal class Account_EntityConfig : IEntityTypeConfiguration<Account>
{
    public void Configure(EntityTypeBuilder<Account> builder)
    {
        builder.Property(x => x.Name)
            .HasMaxLength(200)
            .IsRequired();
    }
}
```

Usa los imports de `Microsoft.EntityFrameworkCore` y `Microsoft.EntityFrameworkCore.Metadata.Builders` según sean necesarios.

### Aprovechar las convenciones

`SmartPocketContext.OnModelCreating` ejecuta:

```csharp
modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
```

Por ello:

- No registres manualmente cada configuración en `OnModelCreating`.
- No agregues `HasKey(x => x.Id)` si la convención ya identifica la clave.
- No agregues `ToTable(...)` si la tabla convencional es correcta.
- Configura explícitamente solo los requisitos que no cubran las convenciones: longitudes, required/optional, precisión, relaciones, columnas calculadas y comportamientos de borrado.

### Extensiones existentes

Reutiliza las extensiones de `backend/src/SmartPocket.Persistence/EntityConfigurations/MapPropertyExtensions.cs`:

- `ConfigureCurrency(...)` para códigos de moneda de tres caracteres.
- `ConfigureIcon(...)` para mapear `Icon` como propiedad compleja.
- `IsNumeric(...)` para propiedades `decimal` con precisión y escala centralizadas.
- `IsNotRequired()` para propiedades opcionales cuando mejore la legibilidad.

Ejemplo:

```csharp
builder.ConfigureIcon(x => x.Icon);
builder.ConfigureCurrency(x => x.CurrencyCode);
builder.Property(x => x.InitialBalance)
    .IsNumeric()
    .IsRequired();
```

### Relaciones

- Configura relaciones explícitamente cuando haya más de una navegación posible, una clave foránea no convencional, un comportamiento de borrado específico o una relación opcional.
- Usa `HasOne`, `WithMany`, `HasForeignKey`, `IsRequired` y `OnDelete` solo cuando expresen una decisión real del modelo.
- Revisa el impacto de `Cascade`, `Restrict` o `NoAction` sobre datos relacionados.
- No configures una navegación dos veces desde entidades diferentes sin comprobar que las configuraciones sean compatibles.
- Para relaciones opcionales, asegúrate de que la clave foránea y la navegación puedan ser nulas según el modelo.

### Configuración común

`SmartPocketContext` ejecuta `ApplyCommonConfigs(...)` desde `OnModelCreating`. Esta utilidad detecta interfaces aplicables y agrega configuraciones comunes:

- `IDeletable`: `HasQueryFilter(x => !x.IsDeleted)`.
- `ITimestampedEntity`: valores SQL por defecto y generación de timestamps.
- Configuración de tenant cuando se habilite en `CommonEntityConfiguration`.

No dupliques en la configuración individual los filtros globales, timestamps o propiedades que ya aplica `ApplyCommonConfigs`.

### Columnas calculadas

Si una propiedad calculada debe consultarse desde la base de datos:

- Mantén el cálculo expresado claramente en la entidad.
- Configura `HasComputedColumnSql` en la configuración.
- Usa `ValueGeneratedOnAddOrUpdate()` cuando corresponda.
- Verifica que el SQL sea compatible con el proveedor actual, SQLite, y documenta la decisión si no es obvia.

El proveedor actual de Persistence es `Microsoft.EntityFrameworkCore.Sqlite`. No asumas comportamiento de SQL Server o PostgreSQL al crear SQL para columnas calculadas, valores por defecto, timestamps o conversiones. Si cambia el proveedor, revisa las configuraciones dependientes del dialecto SQL.

## Registrar el DbSet

Agrega el `DbSet` en `backend/src/SmartPocket.Persistence/SmartPocketContext.cs` con nombre plural:

```csharp
internal DbSet<Account> Accounts { get; private set; }
```

Mantén la propiedad `internal`, con `get` público dentro de la declaración y `set` privado o `internal`, siguiendo el patrón existente. Revisa también `ISmartPocketContext` si la nueva entidad debe formar parte de su contrato.

No agregues registros manuales para la configuración si la clase está dentro del assembly de Persistence y cumple `IEntityTypeConfiguration<T>`.

## Flujo de trabajo

1. Identifica la entidad relacionada y revisa ejemplos existentes en el mismo agregado o feature.
2. Define el namespace, carpeta plural y nombre singular.
3. Elige `BaseEntity<T>`, `BaseAuditEntity<T>`, `BaseEntity` o las interfaces individuales.
4. Define propiedades, claves foráneas, navegaciones y value objects.
5. Diseña constructores que creen estados válidos y un constructor privado para EF Core si es necesario.
6. Agrega `Update` y métodos de comportamiento que encapsulen las modificaciones permitidas.
7. Crea la configuración `_EntityConfig` y aplica solo las reglas de persistencia necesarias.
8. Reutiliza las extensiones de `MapPropertyExtensions` y evita duplicar `ApplyCommonConfigs`.
9. Registra el `DbSet` plural en `SmartPocketContext` y actualiza el contrato si corresponde.
10. Revisa si el cambio requiere una migración según el flujo actual del backend.

## Checklist de validación

- [ ] La entidad está bajo `backend/src/SmartPocket.Domain/`.
- [ ] La carpeta es plural y el nombre de la entidad es singular.
- [ ] La clase hereda de la base o interfaces adecuadas.
- [ ] Las propiedades mutables tienen setter privado o una excepción justificada por una clase base.
- [ ] Las invariantes se validan en constructores y métodos de dominio.
- [ ] Las navegaciones y colecciones se inicializan para evitar estados nulos innecesarios en pruebas.
- [ ] Existe constructor privado para EF Core cuando el constructor de dominio es complejo.
- [ ] Los value objects usan `readonly record struct` cuando corresponde.
- [ ] La configuración implementa `IEntityTypeConfiguration<T>`.
- [ ] La configuración usa el sufijo `_EntityConfig` y está en Persistence.
- [ ] No se duplican convenciones, filtros globales o timestamps comunes.
- [ ] Se reutilizan `ConfigureIcon`, `ConfigureCurrency`, `IsNumeric` u otras extensiones cuando aplican.
- [ ] Las relaciones tienen el comportamiento de borrado intencional.
- [ ] El `DbSet` está registrado con nombre plural y visibilidad consistente.
- [ ] `ISmartPocketContext` fue revisado si el contrato necesita la entidad.
## Troubleshooting

| Problema | Revisión |
| --- | --- |
| La configuración no se aplica | Comprueba el assembly, namespace, implementación de `IEntityTypeConfiguration<T>` y el sufijo/nombre de la clase. |
| La entidad aparece con una tabla o clave inesperada | Revisa primero las convenciones antes de agregar `ToTable` o `HasKey`. |
| Una entidad auditada no filtra eliminados | Comprueba que implemente `IDeletable` directamente o mediante `BaseAuditEntity<T>` y que `ApplyCommonConfigs` se ejecute. |
| Faltan timestamps | Comprueba `ITimestampedEntity` y evita sobrescribir la configuración común sin necesidad. |
| Un value object no se persiste | Configúralo con `ComplexProperty` y mapea sus propiedades internas. |
| Una relación elimina datos incorrectamente | Revisa `OnDelete`, la opcionalidad y las claves foráneas de ambos lados. |
| Las pruebas encuentran navegaciones nulas | Inicializa colecciones y proporciona constructores o fábricas de prueba con las navegaciones necesarias. |
| EF Core no puede crear la entidad | Agrega o corrige el constructor sin parámetros privado/protegido requerido para materialización. |
