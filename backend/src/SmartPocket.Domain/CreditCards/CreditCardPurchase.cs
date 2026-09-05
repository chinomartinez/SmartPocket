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
        /// Ej: tarjeta ARS pero compra en USD (libro en amazon, compra en temu, etc)
        /// </summary>
        public string CurrencyCode { get; private set; } = default!;

        /// <summary>
        /// Solo informativo, no afecta cálculos
        /// </summary>
        public decimal TotalAmount { get; private set; }

        public DateOnly? PaidOffAt { get; private set; }

        public DateOnly? FinishedAt { get; private set; }

        public ICollection<CreditCardPurchaseInstallment> Installments { get; private set; } = [];

        private CreditCardPurchase()
        {
            // Para EF Core
        }

        public CreditCardPurchase(
            int creditCardId,
            int categoryId,
            string description,
            DateOnly effectiveDate,
            string currencyCode,
            decimal amount,
            int installmentCount)
        {
            CreditCardId = creditCardId.GetIfNotNegativeOrZero(nameof(creditCardId));
            CategoryId = categoryId.GetIfNotNegativeOrZero(nameof(categoryId));
            Description = description.GetIfNotNullOrWhiteSpace(nameof(description));
            EffectiveDate = effectiveDate;
            CurrencyCode = currencyCode.GetIfNotNullOrWhiteSpace(nameof(currencyCode));
            TotalAmount = amount.GetIfNotNegativeOrZero(nameof(amount));

            var ic = installmentCount.GetIfNotNegativeOrZero(nameof(installmentCount));

            var installmentAmount = amount / ic;

            Installments ??= [];

            for (int start = 1; start <= ic; start++)
            {
                Installments.Add(new CreditCardPurchaseInstallment(this, start, installmentAmount));
            }
        }

        public bool TryUpdate(
            int creditCardId,
            int categoryId,
            string description,
            DateOnly effectiveDate,
            string currencyCode,
            decimal amount,
            int installmentCount,
            [NotNullWhen(false)] out string error)
        {
            error = string.Empty;

            if (Installments == null)
            {
                throw new InvalidOperationException($"La lista de cuotas debe estar inicializada antes de actualizar la compra.");
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

            if (!TryUpdateInstallments(amount, installmentCount, out error))
            {
                return false;
            }

            TotalAmount = amount.GetIfNotNegativeOrZero(nameof(amount));

            return true;
        }

        private bool TryUpdateInstallments(decimal amount, int installmentCount, out string error)
        {
            error = string.Empty;

            if (amount <= 0)
                throw new ArgumentException("El monto total debe ser mayor a cero.",
                    nameof(amount));

            if (installmentCount <= 0)
                throw new ArgumentException("El número de cuotas debe ser mayor a cero.",
                    nameof(installmentCount));

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
                        Installments.Add(new CreditCardPurchaseInstallment(this, i, installmentAmount));
                    }
                }
                else if (installmentCount < Installments.Count)
                {
                    Installments = [.. Installments.Take(installmentCount)];
                }
            }

            return true;
        }

        public void MarkAsPaidOff(DateOnly? paidOffAt = null)
        {
            PaidOffAt = paidOffAt ?? DateOnly.FromDateTime(DateTime.UtcNow);
        }

        public void MarkAsFinished(DateOnly? finishedAt = null)
        {
            FinishedAt = finishedAt ?? DateOnly.FromDateTime(DateTime.UtcNow);
        }
    }
}
