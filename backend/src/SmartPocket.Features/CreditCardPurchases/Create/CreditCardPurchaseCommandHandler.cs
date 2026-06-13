using FluentValidation;
using SmartPocket.Domain.CreditCards;
using SmartPocket.Features.Abstractions.Handlers;
using SmartPocket.Features.Shared.Validators;
using SmartPocket.Persistence;
using SmartPocket.SharedKernel.Errors;
using SmartPocket.SharedKernel.Results;

namespace SmartPocket.Features.CreditCardPurchases.Create
{
    public class CreditCardPurchaseCommandHandler : IHandler
    {
        private readonly ISmartPocketContext _smartPocketContext;
        private readonly IValidator<CreditCardPurchaseCommand> _validator;

        public CreditCardPurchaseCommandHandler(ISmartPocketContext smartPocketContext,
            IValidator<CreditCardPurchaseCommand> validator)
        {
            _smartPocketContext = smartPocketContext;
            _validator = validator;
        }

        public async Task<Result<CreditCardPurchaseResponse, ErrorDetailList>> Create(CreditCardPurchaseCommand command,
            CancellationToken cancellation)
        {
            var validations = await _validator.ValidateCommand(command, cancellation);
            if (validations.IsNotValid) return validations.Errors;

            var entity = new CreditCardPurchase(
                creditCardId: command.CreditCardId,
                categoryId: command.CategoryId,
                description: command.Description,
                effectiveDate: command.EffectiveDate,
                purchaseAmount: command.PurchaseAmount.ToDomainMoney(),
                purchaseType: command.IsInstallment ? CreditCardPurchaseType.Installment : CreditCardPurchaseType.Subscription,
                installmentCount: command.IsInstallment ? command.Installments.GetValueOrDefault() : 1,
                originalAmount: command.OriginalAmount);

            _smartPocketContext.AddEntity(entity);

            await _smartPocketContext.SaveChangesAsync(cancellation);

            return new CreditCardPurchaseResponse(Id: entity.Id);
        }
    }
}
