using SmartPocket.Domain.Transactions;
using SmartPocket.SharedKernel.Entities;
using SmartPocket.SharedKernel.Guards;

namespace SmartPocket.Domain.CreditCards
{
    public class CreditCardSubscription : BaseAuditEntity<int>
    {
        public CreditCard CreditCard { get; private set; } = default!;
        public int CreditCardId { get; private set; }

        public Category Category { get; private set; } = default!;
        public int CategoryId { get; private set; }

        public string Description { get; private set; } = default!;

        public DateOnly EffectiveDate { get; private set; }

        /// <summary>
        /// Moneda real de la subscripcion. Puede diferir de la moneda base de la tarjeta.
        /// Ej: tarjeta ARS pero compra en USD (suscripción Spotify, Netflix, etc.)
        /// </summary>
        public string CurrencyCode { get; private set; } = default!;

        /// <summary>
        /// Monto de la subscripcion. Es el monto en cual se establece la subs pero mes a mes puede variar.
        /// </summary>
        public decimal InitialAmount { get; private set; }

        /// <summary>
        /// Solo aplica para PurchaseType = Subscription.
        /// Null = activa, fecha = cancelada desde ese día
        /// </summary>
        public DateOnly? CancelledAt { get; private set; }

        public bool IsCancelled { get; private set; } 

        public bool IsActive => !IsCancelled;

        /// <summary>
        /// Historial de cargos de la subscripcion. Cada cargo es un registro en el resumen de la tarjeta. Puede variar el monto de un mes a otro.
        /// </summary>
        public ICollection<CreditCardSubscriptionCharge> Charges { get; private set; } = [];

        private CreditCardSubscription()
        {
            // Para EF Core
        }

        public CreditCardSubscription(int creditCardId,
            int categoryId,
            string description,
            DateOnly effectiveDate,
            string currencyCode,
            decimal initialAmount)
        {
            Update(
                creditCardId: creditCardId,
                categoryId: categoryId,
                description: description,
                effectiveDate: effectiveDate,
                currencyCode: currencyCode,
                initialAmount: initialAmount);

            IsCancelled = false;
        }

        public void Update(int creditCardId,
            int categoryId,
            string description,
            DateOnly effectiveDate,
            string currencyCode,
            decimal initialAmount)
        {
            CreditCardId = creditCardId.GetIfNotNegativeOrZero(nameof(creditCardId));
            CategoryId = categoryId.GetIfNotNegativeOrZero(nameof(categoryId));
            Description = description;
            EffectiveDate = effectiveDate;
            CurrencyCode = currencyCode.GetIfNotNullOrWhiteSpace(nameof(currencyCode));
            InitialAmount = initialAmount.GetIfNotNegativeOrZero(nameof(initialAmount));
        }

        public void Cancel(DateOnly? cancelledAt = null)
        {
            CancelledAt = cancelledAt ?? DateOnly.FromDateTime(DateTime.UtcNow);
            IsCancelled = true;
        }
    }
}
