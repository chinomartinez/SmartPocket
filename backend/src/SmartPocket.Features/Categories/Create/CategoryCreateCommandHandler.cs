using FluentValidation;
using SmartPocket.Domain.Transactions;
using SmartPocket.Features.Abstractions.Handlers;
using SmartPocket.Features.Shared.Validators;
using SmartPocket.Persistence;
using SmartPocket.SharedKernel.Results;

namespace SmartPocket.Features.Categories.Create
{
    public class CategoryCreateCommandHandler : IHandler
    {
        private readonly ISmartPocketContext _smartPocketContext;
        private readonly IValidator<CategoryCreateCommand> _validator;

        public CategoryCreateCommandHandler(ISmartPocketContext smartPocketContext,
            IValidator<CategoryCreateCommand> validator)
        {
            _smartPocketContext = smartPocketContext;
            _validator = validator;
        }

        public async Task<ResultWithErrors<CategoryCreateResponse>> Create(CategoryCreateCommand request,
            CancellationToken cancellationToken)
        {
            var validation = await _validator.ValidateCommand(request, cancellationToken);
            if (validation.IsNotValid) return validation.Errors;

            var category = new Category(
                name: request.Name,
                icon: request.Icon.ToDomainIcon(),
                isIncome: request.IsIncome);

            await _smartPocketContext.AddAndSaveChangesAsync(category, cancellationToken);

            return new CategoryCreateResponse(category.Id);
        }
    }
}
