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
        public string CurrencyCode { get; private set; } = default!;

        /// <summary>
        /// Solo informativo, no afecta cálculos
        /// </summary>
        public decimal TotalAmount { get; private set; }

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
            string currencyCode,
            decimal amount,
            CreditCardPurchaseType purchaseType,
            int? installmentCount = default
            )
        {
            if (purchaseType == CreditCardPurchaseType.Installment && installmentCount.GetValueOrDefault() <= 0)
            {
                var error = $"El número de cuotas debe ser mayor a cero para compras en cuotas.";
                throw new ArgumentException(error, nameof(installmentCount));
            }

            CreditCardId = creditCardId.GetIfNotNegativeOrZero(nameof(creditCardId));
            CategoryId = categoryId.GetIfNotNegativeOrZero(nameof(categoryId));
            Description = description.GetIfNotNullOrWhiteSpace(nameof(description));
            EffectiveDate = effectiveDate;
            CurrencyCode = currencyCode.GetIfNotNullOrWhiteSpace(nameof(currencyCode));
            TotalAmount = amount;
            PurchaseType = purchaseType;

            var ic = PurchaseType == CreditCardPurchaseType.Installment
                ? installmentCount.GetValueOrDefault().GetIfNotNegativeOrZero(nameof(installmentCount))
                : 1;

            var installmentAmount = amount / ic;
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
            string currencyCode,
            decimal amount,
            CreditCardPurchaseType purchaseType,
            int? installmentCount = default)
        {
            if (Installments == null || Installments.Count == 0)
                throw new InvalidOperationException("Solo se pueden modificar compras que tengan cuotas asociadas.");

            if (Status == CreditCardPurchaseStatus.PaidOff)
                throw new InvalidOperationException("No se pueden modificar compras ya saldadas.");

            if (Status == CreditCardPurchaseStatus.Cancelled)
                throw new InvalidOperationException("No se pueden modificar suscripciones ya canceladas.");

            CreditCardId = creditCardId.GetIfNotNegativeOrZero(nameof(creditCardId));
            CategoryId = categoryId.GetIfNotNegativeOrZero(nameof(categoryId));
            Description = description.GetIfNotNullOrWhiteSpace(nameof(description));
            CurrencyCode = currencyCode.GetIfNotNullOrWhiteSpace(nameof(currencyCode));


            if (EffectiveDate == effectiveDate &&
                TotalAmount == amount &&
                PurchaseType == purchaseType &&
                (Installments.Count == installmentCount && PurchaseType == CreditCardPurchaseType.Installment))
                return;

            if (PurchaseType != purchaseType && Installments.Any(x => x.CreditCardStatementId.HasValue))
            {
                var error = $"No se puede cambiar el tipo de compra, cuando esta en resumenes";
                throw new InvalidOperationException(error);
            }

            if (purchaseType == CreditCardPurchaseType.Installment)
            {
                // Si se cambia de suscripción a cuota, se eliminan las cuotas anteriores y se crean nuevas
                if (PurchaseType == CreditCardPurchaseType.Subscription)
                    Installments = []; 

                UpdateInstallments(amount, installmentCount.GetValueOrDefault());
            }

            else if (purchaseType == CreditCardPurchaseType.Subscription)
            {
                if (PurchaseType == CreditCardPurchaseType.Installment)
                {
                    Installments = [ new CreditCardInstallment(this, 1, amount, effectiveDate.AddMonths(1)) ];
                    return;
                }

                UpdateSubscription(effectiveDate, amount);
            }
            
            PurchaseType = purchaseType;
            TotalAmount = amount.GetIfNotNegativeOrZero(nameof(amount));
            EffectiveDate = effectiveDate;
        }

        private void UpdateInstallments(decimal amount,int installmentCount)
        {
            if (installmentCount <= 0)
                throw new ArgumentException("El número de cuotas debe ser mayor a cero.", nameof(installmentCount));

            if (amount <= 0)
                throw new ArgumentException("El monto total debe ser mayor a cero.", nameof(amount));

            if (installmentCount < Installments.Count)
            {
                var canRemove = Installments
                    .Skip(installmentCount)
                    .All(i => !i.CreditCardStatementId.HasValue);

                if (!canRemove)
                    throw new InvalidOperationException($"No se pueden reducir las cuotas porque algunas de las cuotas a eliminar ya están asociadas a un resumen cerrado o pagado.");
            }

            if (installmentCount != Installments.Count || TotalAmount != amount)
            {
                var installmentAmount = amount / installmentCount;

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
            decimal amount)
        {
            if (Installments.Count == 1)
                throw new InvalidOperationException("Solo se pueden modificar suscripciones que tengan una única cuota asociada.");

            if (amount <= 0)
                throw new ArgumentException("El monto total debe ser mayor a cero.", nameof(amount));

            foreach (var i in Installments)
            {
                i.UpdateAmount(amount);
                i.UpdateDueDate(effectiveDate.AddMonths(1));
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
            if (PurchaseType != CreditCardPurchaseType.Installment)
                throw new InvalidOperationException("Solo se pueden marcar como saldadas las compras de tipo Installment.");

            if (Status == CreditCardPurchaseStatus.Cancelled)
                throw new InvalidOperationException("No se pueden marcar como saldadas las suscripciones canceladas.");

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
        InProgress,
        PaidOff, // Todas las cuotas fueron abonadas y la compra quedó completamente saldada.
        Cancelled // Solo para suscripciones canceladas ya saldadas
    }
}
