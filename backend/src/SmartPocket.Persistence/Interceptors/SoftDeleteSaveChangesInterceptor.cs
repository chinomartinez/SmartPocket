using Microsoft.EntityFrameworkCore.Diagnostics;
using SmartPocket.SharedKernel.Entities;

namespace SmartPocket.Persistence.Interceptors
{
    public class SoftDeleteSaveChangesInterceptor : SaveChangesInterceptor
    {
        public override InterceptionResult<int> SavingChanges(
            DbContextEventData eventData,
            InterceptionResult<int> result)
        {
            HandleSoftDelete(eventData);
            return base.SavingChanges(eventData, result);
        }

        public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
            DbContextEventData eventData,
            InterceptionResult<int> result,
            CancellationToken cancellationToken = default)
        {
            HandleSoftDelete(eventData);

            return base.SavingChangesAsync(eventData, result, cancellationToken);
        }

        private void HandleSoftDelete(DbContextEventData eventData)
        {
            if (eventData.Context is null) return;

            var entriesDeleted = eventData.Context.ChangeTracker.Entries<IDeletable>()
                .Where(e => e.State == Microsoft.EntityFrameworkCore.EntityState.Deleted)
                .ToList();

            if (entriesDeleted.Count == 0) return;            

            // Convertir entidades principales a soft delete
            foreach (var entry in entriesDeleted)
            {
                entry.State = Microsoft.EntityFrameworkCore.EntityState.Modified;
                entry.Entity.IsDeleted = true;
            }

            var ownedEntriesDeleted = entriesDeleted
                .SelectMany(e => e.References)
                .Where(r => r.TargetEntry != null && r.TargetEntry.Metadata.IsOwned())
                .Select(r => r.TargetEntry!)
                .Where(e => e.State == Microsoft.EntityFrameworkCore.EntityState.Deleted)
                .ToList();

            // Preservar owned entities de las entidades que fueron soft-deleted
            // Cambiamos su estado de Deleted a Unchanged para evitar que EF Core los ponga a NULL
            foreach (var entry in ownedEntriesDeleted)
            {
                entry.State = Microsoft.EntityFrameworkCore.EntityState.Unchanged;
            }
        }
    }
}
