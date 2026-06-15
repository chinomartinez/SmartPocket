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

                if (Installments != null && Installments.Any(i => !i.CreditCardStatementId.HasValue))
                    return CreditCardPurchaseStatus.InProgress;

                return CreditCardPurchaseStatus.Created;
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
            int? installmentCount = default,
            decimal? originalAmount = default
            )
        {
            if (purchaseType == CreditCardPurchaseType.Installment && installmentCount.GetValueOrDefault() <= 0)
            {
                var error = $"El número de cuotas debe ser mayor a cero para compras en cuotas.";
                throw new ArgumentException(error, nameof(installmentCount));
            }

            Status = CreditCardPurchaseStatus.Created;

            CreditCardId = creditCardId.GetIfNotNegativeOrZero(nameof(creditCardId));
            CategoryId = categoryId.GetIfNotNegativeOrZero(nameof(categoryId));
            Description = description.GetIfNotNullOrWhiteSpace(nameof(description));
            EffectiveDate = effectiveDate;
            PurchaseAmount = purchaseAmount;
            OriginalAmount = originalAmount;
            PurchaseType = purchaseType;

            var ic = PurchaseType == CreditCardPurchaseType.Installment
                ? installmentCount.GetValueOrDefault()
                : 1;

            var installmentAmount = purchaseAmount.Amount / ic;
            DateOnly? dueDate = purchaseType == CreditCardPurchaseType.Subscription
                ? effectiveDate.AddMonths(1)
                : null;

            Installments ??= [];

            for (int i = 1; i <= ic; i++)
            {
                Installments.Add(new CreditCardInstallment(this, i, installmentAmount, dueDate));
            }
        }

        public void Update(
            int creditCardId,
            int categoryId,
            string description,
            DateOnly effectiveDate,
            Money purchaseAmount,
            CreditCardPurchaseType purchaseType,
            int? installmentCount,
            decimal? originalAmount = default)
        {
            if (Status == CreditCardPurchaseStatus.PaidOff)
                throw new InvalidOperationException("No se pueden modificar compras ya saldadas.");

            if (Status == CreditCardPurchaseStatus.Cancelled)
                throw new InvalidOperationException("No se pueden modificar suscripciones ya canceladas.");

            if (purchaseType != PurchaseType && Status == CreditCardPurchaseStatus.InProgress)
                throw new InvalidOperationException("No se puede cambiar el tipo de compra mientras esté en progreso.");

            CreditCardId = creditCardId.GetIfNotNegativeOrZero(nameof(creditCardId));
            CategoryId = categoryId.GetIfNotNegativeOrZero(nameof(categoryId));
            Description = description.GetIfNotNullOrWhiteSpace(nameof(description));
            OriginalAmount = originalAmount;

            // Si no se modifican ni la fecha, ni el monto, ni el tipo de compra, no es necesario hacer nada más
            if (EffectiveDate == effectiveDate && PurchaseAmount == purchaseAmount && PurchaseType == purchaseType)
                return;

            EffectiveDate = effectiveDate;
            PurchaseAmount = purchaseAmount;

            if (Installments == null || Installments.Count == 0)
                throw new InvalidOperationException("Solo se pueden modificar compras que tengan cuotas asociadas.");

            if (purchaseType == CreditCardPurchaseType.Installment)
            {
                // Si se cambia de suscripción a cuota, se eliminan las cuotas anteriores y se crean nuevas
                if (PurchaseType == CreditCardPurchaseType.Subscription)
                    Installments = []; 

                UpdateInstallments(purchaseAmount, installmentCount.GetValueOrDefault());
            }

            else if (purchaseType == CreditCardPurchaseType.Subscription)
            {
                if (PurchaseType == CreditCardPurchaseType.Installment)
                {
                    Installments = [ new CreditCardInstallment(this, 1, purchaseAmount.Amount, effectiveDate.AddMonths(1)) ];
                    return;
                }

                UpdateSubscription(effectiveDate, purchaseAmount);
            }
            
            PurchaseType = purchaseType;
        }

        private void UpdateInstallments(Money purchaseAmount,int installmentCount)
        {
            if (PurchaseType != CreditCardPurchaseType.Installment)
                throw new InvalidOperationException("Solo se pueden modificar compras de tipo Installment.");            
            
            if (installmentCount < Installments.Count && Status == CreditCardPurchaseStatus.InProgress)
            {
                var canRemove = Installments.Skip(installmentCount).All(i => !i.CreditCardStatementId.HasValue);

                if (!canRemove)
                    throw new InvalidOperationException("No se pueden reducir las cuotas porque algunas ya fueron abonadas.");
            }

            if (installmentCount != Installments.Count || PurchaseAmount != purchaseAmount)
            {
                var installmentAmount = purchaseAmount.Amount / installmentCount;

                foreach (var i in Installments)
                {
                    i.UpdateAmount(installmentAmount);
                }

                if (installmentCount > Installments.Count)
                {
                    for (int i = Installments.Count + 1; i <= installmentCount; i++)
                    {
                        Installments.Add(new CreditCardInstallment(this, i, installmentAmount, null));
                    }
                }
                else if (installmentCount < Installments.Count)
                {
                    Installments = [.. Installments.Take(installmentCount)];
                }
            }
        }

        private void UpdateSubscription(
            DateOnly effectiveDate,
            Money purchaseAmount)
        {
            if (PurchaseType != CreditCardPurchaseType.Subscription)
                throw new InvalidOperationException("Solo se pueden modificar compras de tipo Subscription."); 

            if (Installments.Count == 1)
                throw new InvalidOperationException("Solo se pueden modificar suscripciones que tengan una única cuota asociada.");

            if (PurchaseAmount != purchaseAmount || EffectiveDate != effectiveDate)
            {
                var nextDueDate = effectiveDate.AddMonths(1);
                foreach (var i in Installments)
                {
                    i.UpdateAmount(purchaseAmount.Amount);
                    i.UpdateDueDate(nextDueDate);
                }
            }
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
        Created = 1, // Estado inicial, todavia no se ha pagado ninguna cuota o mes de suscripción.
        InProgress,
        PaidOff, // Todas las cuotas fueron abonadas y la compra quedó completamente saldada.
        Cancelled // Solo para suscripciones canceladas ya saldadas
    }
}
