using SmartPocket.Domain.CreditCards.Enums;
using SmartPocket.Domain.Transactions;
using SmartPocket.SharedKernel.Entities;
using SmartPocket.SharedKernel.Guards;
using System.Diagnostics.CodeAnalysis;

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

        public ICollection<CreditCardInstallment> Installments { get; private set; }

        private CreditCardPurchase()
        {
            Installments = [];
        }

        public CreditCardPurchase(
            int creditCardId,
            int categoryId,
            string description,
            DateOnly effectiveDate,
            string currencyCode,
            decimal amount,
            CreditCardPurchaseType purchaseType,
            int? installmentCount,
            int? installmentNumberStart)
            :this()
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

            // Una compra en cuotas tiene N cuotas, una suscripción tiene pagos indefinidos hasta cancelación.
            // No se añade "pagos" a una compra hasta que se efectuen.
            if (PurchaseType == CreditCardPurchaseType.Subscription)
                return;

            var ic = installmentCount
                .GetValueOrDefault()
                .GetIfNotNegativeOrZero(nameof(installmentCount));

            var startNumber = installmentNumberStart.HasValue
                ? installmentNumberStart.Value.GetIfNotNegativeOrZero(nameof(installmentNumberStart))
                : 1;

            if (startNumber >= ic)
            {
                var error = $"El número de cuota inicial debe ser menor que el número total de cuotas.";
                throw new ArgumentException(error, nameof(installmentNumberStart));
            }

            var installmentAmount = amount / ic;

            Installments ??= [];

            for (int start = 1; start <= ic; start++)
            {
                Installments.Add(new CreditCardInstallment(this, start, installmentAmount));
            }
        }

        public bool TryUpdate(
            int creditCardId,
            int categoryId,
            string description,
            DateOnly effectiveDate,
            string currencyCode,
            decimal amount,
            CreditCardPurchaseType purchaseType,
            int? installmentCount,
            int? installmentNumberStart,
            [NotNullWhen(false)] out string error)
        {
            error = string.Empty;

            if (Installments == null)
            {
                throw new InvalidOperationException($"La lista de cuotas debe estar inicializada antes de actualizar la compra.");
            }

            if (Status == CreditCardPurchaseStatus.PaidOff)
            {
                error = "No se pueden modificar compras ya saldadas.";
                return false;
            }

            if (Status == CreditCardPurchaseStatus.Cancelled)
            {
                error = "No se pueden modificar suscripciones ya canceladas.";
                return false;
            }

            CategoryId = categoryId.GetIfNotNegativeOrZero(nameof(categoryId));
            Description = description.GetIfNotNullOrWhiteSpace(nameof(description));
            CurrencyCode = currencyCode.GetIfNotNullOrWhiteSpace(nameof(currencyCode));
            EffectiveDate = effectiveDate;

            var anyInstallmentClosedOrPaid = Installments.Any(i => i.CreditCardStatementId.HasValue);

            if (CreditCardId != creditCardId && anyInstallmentClosedOrPaid)
            {
                error = $"No se puede cambiar la tarjeta, cuando esta en resumenes";
                return false;
            }
            else
            {
                CreditCardId = creditCardId.GetIfNotNegativeOrZero(nameof(creditCardId));
            }

            if (PurchaseType != purchaseType && anyInstallmentClosedOrPaid)
            {
                error = $"No se puede cambiar el tipo de compra, cuando esta en resumenes";
                return false;
            }

            if (TotalAmount == amount &&
                PurchaseType == purchaseType &&
                (Installments.Count == installmentCount && PurchaseType == CreditCardPurchaseType.Installment))
            {
                return true;
            }

            if (purchaseType == CreditCardPurchaseType.Installment)
            {
                if (!TryUpdateInstallments(amount,
                    installmentCount.GetValueOrDefault(),
                    installmentNumberStart,
                    out error))
                {
                    return false;
                }
            }

            else if (purchaseType == CreditCardPurchaseType.Subscription)
            {
                Installments = [];
            }

            PurchaseType = purchaseType;
            TotalAmount = amount.GetIfNotNegativeOrZero(nameof(amount));

            return true;
        }

        private bool TryUpdateInstallments(decimal amount, int installmentCount, int? installmentNumberStart, out string error)
        {
            error = string.Empty;

            if (amount <= 0)
                throw new ArgumentException("El monto total debe ser mayor a cero.",
                    nameof(amount));

            if (installmentCount <= 0)
                throw new ArgumentException("El número de cuotas debe ser mayor a cero.",
                    nameof(installmentCount));

            if (installmentNumberStart.HasValue && installmentNumberStart <= 0)
                throw new ArgumentException("El número de cuota inicial debe ser mayor a cero.",
                    nameof(installmentNumberStart));

            if (installmentNumberStart.HasValue && installmentNumberStart >= installmentCount)
                throw new ArgumentException("El número de cuota inicial debe ser menor que el número total de cuotas.",
                    nameof(installmentNumberStart));

            // Validar si se pueden eliminar cuotas existentes.
            // Si antes era una subscripcion, no hay problema, por que no hay cuotas.
            if (installmentCount < Installments.Count)
            {
                var canRemove = Installments
                    .Skip(installmentCount)
                    .All(i => !i.CreditCardStatementId.HasValue);

                if (!canRemove)
                {
                    error = "No se pueden reducir las cuotas porque algunas de las cuotas a eliminar ya están asociadas a un resumen cerrado o pagado.";

                    return false;
                }
            }

            if (installmentNumberStart.HasValue)
            {
                var startNumber = installmentNumberStart.Value;
                foreach (var installment in Installments)
                {
                    installment.UpdateInstallmentNumber(startNumber++);
                }
            }

            // Crear o actualizas las cuotas si cambio el monto total o la cantidad de cuotas.
            // Si antes era una subscripción, deberia crear las cuotas nuevas.
            // Si sigue siendo una compra en cuotas, actualizar y/o crea las cuotas nuevas.
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
                        Installments.Add(new CreditCardInstallment(this, i, installmentAmount));
                    }
                }
                else if (installmentCount < Installments.Count)
                {
                    Installments = [.. Installments.Take(installmentCount)];
                }
            }

            return true;
        }

        public bool TryCancelSubscription(DateOnly cancellationDate, out string error)
        {
            error = string.Empty;

            if (PurchaseType != CreditCardPurchaseType.Subscription)
            {
                error = "Solo se pueden cancelar compras de tipo Subscription.";
                return false;
            }

            if (Status == CreditCardPurchaseStatus.PaidOff)
            {
                error = "No se pueden cancelar suscripciones ya saldadas.";
                return false;
            }

            CancelledAt = cancellationDate;
            return true;
        }

        public bool TryMarkAsPaidOff(DateOnly paidOffDate, out string error)
        {
            error = string.Empty;

            if (PurchaseType != CreditCardPurchaseType.Installment)
            {
                error = "Solo se pueden marcar como saldadas las compras de tipo Installment.";
                return false;
            }

            if (Status == CreditCardPurchaseStatus.Cancelled)
            {
                error = "No se pueden marcar como saldadas las suscripciones canceladas.";
                return false;
            }

            PaidOffAt = paidOffDate;
            return true;
        }
    }
}
