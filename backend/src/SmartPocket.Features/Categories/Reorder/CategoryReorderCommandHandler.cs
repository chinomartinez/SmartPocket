using FluentValidation;
using Microsoft.EntityFrameworkCore;
using SmartPocket.Domain.Transactions;
using SmartPocket.Features.Abstractions.Handlers;
using SmartPocket.Features.Shared.Validators;
using SmartPocket.Persistence;
using SmartPocket.SharedKernel.Errors;

namespace SmartPocket.Features.Categories.Reorder
{
    public class CategoryReorderCommandHandler : IHandler
    {
        private readonly ISmartPocketContext _smartPocketContext;
        private readonly IValidator<CategoryReorderCommand> _validator;

        public CategoryReorderCommandHandler(ISmartPocketContext smartPocketContext,
            IValidator<CategoryReorderCommand> validator)
        {
            _smartPocketContext = smartPocketContext;
            _validator = validator;
        }

        public async Task<ErrorDetails> Reorder(CategoryReorderCommand request, CancellationToken cancellationToken)
        {
            var validation = await _validator.ValidateCommand(request, cancellationToken);
            if (validation.IsNotValid) return validation.Errors;

            var requestedIds = request.Items.Select(i => i.Id).ToList();

            // Load all requested categories from DB
            var categories = await _smartPocketContext.Query<Category>()
                .Where(c => requestedIds.Contains(c.Id))
                .ToListAsync(cancellationToken);

            // Validate all IDs exist
            var foundIds = categories.Select(c => c.Id).ToHashSet();
            var missingIds = requestedIds.Where(id => !foundIds.Contains(id)).ToList();

            if (missingIds.Count > 0)
            {
                var errors = missingIds.Select(id =>
                    new ErrorDetail($"La categoría con id {id} no existe.")
                    {
                        PropertyName = "Items"
                    });
                return new ErrorDetails(errors);
            }

            // Validate no duplicate SortOrder within same type
            var itemsByType = request.Items
                .Join(categories, i => i.Id, c => c.Id, (i, c) => new { i.SortOrder, c.IsIncome })
                .GroupBy(x => x.IsIncome);

            foreach (var typeGroup in itemsByType)
            {
                var duplicateSortOrders = typeGroup
                    .GroupBy(x => x.SortOrder)
                    .Where(g => g.Count() > 1)
                    .Select(g => g.Key)
                    .ToList();

                if (duplicateSortOrders.Count > 0)
                {
                    var typeName = typeGroup.Key ? "ingresos" : "gastos";
                    var errors = duplicateSortOrders.Select(so =>
                        new ErrorDetail($"SortOrder {so} está duplicado dentro de {typeName}.")
                        {
                            PropertyName = "Items"
                        });
                    return new ErrorDetails(errors);
                }
            }

            // Apply sort orders atomically
            var sortOrderMap = request.Items.ToDictionary(i => i.Id, i => i.SortOrder);
            foreach (var category in categories)
            {
                category.SortOrder = sortOrderMap[category.Id];
            }

            await _smartPocketContext.SaveChangesAsync(cancellationToken);

            return ErrorDetails.Empty;
        }
    }
}
