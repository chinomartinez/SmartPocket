using SmartPocket.Domain.Accounts;
using SmartPocket.SharedKernel.Entities;
using SmartPocket.SharedKernel.Guards;

namespace SmartPocket.Domain.Transactions
{
    public class Transaction : BaseAuditEntity<int>
    {
        public Account Account { get; private set; } = default!;
        public int AccountId { get; private set; }

        public Category Category { get; private set; } = default!;
        public int? CategoryId { get; private set; }

        public decimal Amount { get; private set; }

        //public Money AccountMoney { get; private set; } = default!;

        /// <summary>
        /// Obtiene el monto con signo, dependiendo de si es un ingreso o un gasto.
        /// Campo calculado que devuelve el monto positivo para ingresos y negativo para gastos.
        /// </summary>
        public decimal SignedAmount
        {
            get => IsIncome ? Amount : -Amount;
            private set { }
        }

        public DateTime EffectiveDate { get; private set; }
        public string? Description { get; private set; }
        public bool IsIncome { get; private set; }

        public TransactionSource TransactionSource { get; private set; } = default!;
        public TransactionSourceType TransactionSourceId { get; private set; }

        /// <summary>
        /// Campo calculado para facilitar las consultas
        /// </summary>
        public bool IsSystemAdjustment 
        { 
            get  => TransactionSourceId == TransactionSourceType.SystemAdjustment; 
            private set { }
        }

        /// <summary>
        /// Campo calculado para facilitar las consultas
        /// </summary>
        public bool IsTransfer 
        { 
            get  => TransactionSourceId == TransactionSourceType.Transfer; 
            private set { }
        }

        /// <summary>
        /// Campo calculado para facilitar las consultas
        /// </summary>
        public bool IsManualEntry 
        { 
            get  => TransactionSourceId == TransactionSourceType.ManualEntry; 
            private set { }
        }

        private Transaction()
        {
            // PARA EF Core
        }

        public void Update(
            int accountId,
            decimal amount,
            DateTime effectiveDate,
            bool isIncome,
            string? description,
            int? categoryId)
        {
            if (TransactionSourceId == TransactionSourceType.None)
            {
                throw new InvalidOperationException("El origen de la transacción debe establecerse antes de actualizarla.");
            }

            if (TransactionSourceId == TransactionSourceType.SystemAdjustment)
            {
                throw new InvalidOperationException("Los ajustes del sistema no se pueden actualizar.");
            }

            if (TransactionSourceId == TransactionSourceType.ManualEntry && !categoryId.HasValue)
            {
                throw new InvalidOperationException("Las transacciones ingresadas manualmente deben tener una categoría.");
            }

            accountId.ThrowIsNegativeOrZero(nameof(accountId));
            amount.ThrowIsNegativeOrZero(nameof(amount));
            ValditeEffectiveDate(effectiveDate);

            AccountId = accountId;
            Amount = amount;
            EffectiveDate = DateTime.SpecifyKind(effectiveDate, DateTimeKind.Utc);
            IsIncome = isIncome;
            Description = description;
            CategoryId = categoryId;
        }

        public static Transaction CreateAsSystemAdjustment(
            int accountId,
            decimal amount,
            string description)
        {
            accountId.ThrowIsNegativeOrZero(nameof(accountId));

            if (amount == 0)
            {
                throw new ArgumentException("El monto no puede ser cero para los ajustes del sistema.", nameof(amount));
            }

            if (string.IsNullOrWhiteSpace(description))
            {
                throw new ArgumentException("La descripción no puede ser nula ni estar vacía para los ajustes del sistema.", nameof(description));
            }

            var absoluteAmount = Math.Abs(amount);

            var adjustment = new Transaction
            {
                AccountId = accountId,
                Amount = absoluteAmount,
                EffectiveDate = DateTime.UtcNow,
                IsIncome = amount >= 0,
                Description = description,
                TransactionSourceId = TransactionSourceType.SystemAdjustment
            };

            return adjustment;
        }

        public static Transaction CreateAsTransfer(
            int accountId,
            decimal amount,
            DateTime effectiveDate,
            bool isIncome,
            string? description)
        {
            accountId.ThrowIsNegativeOrZero(nameof(accountId));
            amount.ThrowIsNegativeOrZero(nameof(amount));

            if (effectiveDate == default)
            {
                throw new ArgumentException("La fecha efectiva debe ser válida.", nameof(effectiveDate));
            }

            if (effectiveDate > DateTime.UtcNow)
            {
                throw new ArgumentException("La fecha efectiva no puede ser futura.", nameof(effectiveDate));
            }

            var transferTransaction = new Transaction
            {
                AccountId = accountId,
                Amount = amount,
                EffectiveDate = DateTime.SpecifyKind(effectiveDate, DateTimeKind.Utc),
                IsIncome = isIncome,
                Description = description,
                TransactionSourceId = TransactionSourceType.Transfer
            };

            return transferTransaction;
        }

        public static Transaction CreateAsManualEntry(
            int accountId,
            int categoryId,
            decimal amount,
            DateTime effectiveDate,
            bool isIncome,
            string? description)
        {
            accountId.ThrowIsNegativeOrZero(nameof(accountId));
            categoryId.ThrowIsNegativeOrZero(nameof(categoryId));
            amount.ThrowIsNegativeOrZero(nameof(amount));

            ValditeEffectiveDate(effectiveDate);

            var manualEntryTransaction = new Transaction
            {
                AccountId = accountId,
                Amount = amount,
                EffectiveDate = DateTime.SpecifyKind(effectiveDate, DateTimeKind.Utc),
                IsIncome = isIncome,
                Description = description,
                CategoryId = categoryId,
                TransactionSourceId = TransactionSourceType.ManualEntry
            };

            return manualEntryTransaction;
        }

        private static void ValditeEffectiveDate(DateTime effectiveDate)
        {
            if (effectiveDate == default)
            {
                throw new ArgumentException("La fecha efectiva debe ser válida.", nameof(effectiveDate));
            }

            if (effectiveDate > DateTime.UtcNow)
            {
                throw new ArgumentException("La fecha efectiva no puede ser futura.", nameof(effectiveDate));
            }
        }
    }
}
