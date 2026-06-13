using SmartPocket.Domain.Transactions;
using SmartPocket.SharedKernel.Entities;
using SmartPocket.SharedKernel.Guards;

namespace SmartPocket.Domain.CreditCards
{
    public class CreditCardPurchase : BaseAuditEntity<int>
    {
        public CreditCard CreditCard { get; private set; } = default!;
        public int CreditCardId { get; private set; }

        public Category Category { get; private set; } = default!;
        public int CategoryId { get; private set; }

        public string Description { get; private set; } = default!;

        public DateOnly EffectiveDate { get; private set; }

        /// <summary>
        /// Moneda real de la compra. Puede diferir de la moneda base de la tarjeta.
        /// Ej: tarjeta ARS pero compra en USD (suscripción Spotify, Netflix, etc.)
        /// </summary>
        public Money PurchaseAmount { get; private set; } = default!;

        /// <summary>
        /// Solo informativo, no afecta cálculos
        /// </summary>
        public decimal? OriginalAmount { get; private set; }

        public CreditCardPurchaseType PurchaseType { get; private set; }

        /// <summary>
        /// Solo aplica para PurchaseType = Installment. Null = en curso, fecha = saldada ese día
        /// </summary>
        public DateOnly? PaidOffAt { get; private set; }

        /// <summary>
        /// Solo aplica para PurchaseType = Subscription.
        /// Null = activa, fecha = cancelada desde ese día
        /// </summary>
        public DateOnly? CancelledAt { get; private set; }

        public CreditCardPurchaseStatus Status 
        { 
            get
            {
                if (CancelledAt.HasValue)
                    return CreditCardPurchaseStatus.Cancelled;

                if (PaidOffAt.HasValue)
                    return CreditCardPurchaseStatus.PaidOff;

                return CreditCardPurchaseStatus.InProgress;
            }
            private set { } // Necesario para EF Core, aunque no se use directamente
        }

        public ICollection<CreditCardInstallment> Installments { get; private set; } = new List<CreditCardInstallment>();

        private CreditCardPurchase()
        {
            
        }

        public CreditCardPurchase(
            int creditCardId,
            int categoryId,
            string description,
            DateOnly effectiveDate,
            Money purchaseAmount,
            CreditCardPurchaseType purchaseType,
            int installmentCount,
            decimal? originalAmount = default
            )
        {
            Status = CreditCardPurchaseStatus.InProgress;

            CreditCardId = creditCardId.GetIfNotNegativeOrZero(nameof(creditCardId));
            CategoryId = categoryId.GetIfNotNegativeOrZero(nameof(categoryId));
            Description = description.GetIfNotNullOrWhiteSpace(nameof(description));
            EffectiveDate = effectiveDate;
            PurchaseAmount = purchaseAmount;
            OriginalAmount = originalAmount;
            PurchaseType = purchaseType;

            if (purchaseType == CreditCardPurchaseType.Installment)
            {
                if (installmentCount <= 0)
                {
                    var error = $"El número de cuotas debe ser mayor a cero para compras en cuotas.";
                    throw new ArgumentException(error, nameof(installmentCount));
                }

                var installmentAmount = purchaseAmount.Amount / installmentCount;
                DateOnly? dueDate = purchaseType == CreditCardPurchaseType.Subscription
                    ? effectiveDate.AddMonths(1)
                    : null;

                Installments ??= [];

                for (int i = 1; i <= installmentCount; i++)
                {
                    Installments.Add(new CreditCardInstallment(this, i, installmentAmount, dueDate));
                }
            }
        }

        public void Update(int creditCardId,
            int categoryId,
            string description,
            DateOnly effectiveDate,
            Money purchaseAmount,
            CreditCardPurchaseType purchaseType,
            decimal? originalAmount = default
            )
        {
            CreditCardId = creditCardId;
            CategoryId = categoryId;
            Description = description;
            EffectiveDate = effectiveDate;
            PurchaseAmount = purchaseAmount;
            OriginalAmount = originalAmount;
            PurchaseType = purchaseType;
        }

        public void CancelSubscription(DateOnly cancellationDate)
        {
            if (PurchaseType != CreditCardPurchaseType.Subscription)
                throw new InvalidOperationException("Solo se pueden cancelar compras de tipo Subscription.");

            CancelledAt = cancellationDate;
        }

        public void MarkAsPaidOff(DateOnly paidOffDate)
        {
            PaidOffAt = paidOffDate;
        }
    }

    public enum CreditCardPurchaseType
    {
        Installment = 1,    // Compra en cuotas finitas
        Subscription = 2    // Cargo mensual indefinido hasta cancelación
    }

    public enum CreditCardPurchaseStatus
    {
        InProgress = 1,
        PaidOff = 2,
        Cancelled = 3 // Solo para suscripciones canceladas ya saldadas
    }
}
