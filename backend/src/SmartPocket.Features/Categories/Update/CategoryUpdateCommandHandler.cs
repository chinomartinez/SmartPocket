using FluentValidation;
using SmartPocket.Domain.Transactions;
using SmartPocket.Features.Abstractions.Handlers;
using SmartPocket.Features.Shared.Validators;
using SmartPocket.Persistence;
using SmartPocket.SharedKernel.Errors;

namespace SmartPocket.Features.Categories.Update
{
    public class CategoryUpdateCommandHandler : IHandler
    {
        private readonly ISmartPocketContext _smartPocketContext;
        private readonly IValidator<CategoryUpdateCommand> _validator;

        public CategoryUpdateCommandHandler(ISmartPocketContext smartPocketContext,
            IValidator<CategoryUpdateCommand> validator)
        {
            _smartPocketContext = smartPocketContext;
            _validator = validator;
        }

        public async Task<ErrorDetails> Update(CategoryUpdateCommand request, CancellationToken cancellationToken)
        {
            var validation = await _validator.ValidateCommand(request, cancellationToken);
            if (validation.IsNotValid) return validation.Errors;

            var entity = await _smartPocketContext.FindAsyncOrThrow<Category>(request.Id, cancellationToken);

            entity.Update(
                name: request.Name,
                icon: request.Icon.ToDomainIcon(),
                isIncome: request.IsIncome);

            await _smartPocketContext.SaveChangesAsync(cancellationToken);

            return ErrorDetails.Empty;
        }
    }
}
