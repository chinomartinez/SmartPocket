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
        public decimal SignedAmount { 
            get => IsIncome ? Amount : -Amount;
            private set { } 
        }

        public DateTime EffectiveDate { get; private set; }
        public string? Description { get; private set; }
        public bool IsIncome { get; private set; }

        public bool IsSystemAdjustment { get; private set; }

        private Transaction()
        {
            // PARA EF Core
        }

        public Transaction(int accountId,
            int categoryId,
            decimal amount,
            DateTime effectiveDate,
            bool isIncome,
            string? description)
        {
            Update(accountId, categoryId, amount, effectiveDate, isIncome, description);
        }

        public void Update(int accountId,
            int categoryId,
            decimal amount,
            DateTime effectiveDate,
            bool isIncome,
            string? description)
        {
            AccountId = accountId.GetIfNotNegativeOrZero(nameof(accountId));
            CategoryId = categoryId.GetIfNotNegativeOrZero(nameof(categoryId));

            Amount = amount;

            EffectiveDate = DateTime.SpecifyKind(effectiveDate, DateTimeKind.Utc);
            IsIncome = isIncome;
            Description = description;
        }

        public static Transaction CreateSystemAdjustment(int accountId,
            string currencyCode,
            decimal amount,
            string description)
        {
            if (string.IsNullOrWhiteSpace(currencyCode))
                throw new ArgumentException("La cuenta debe tener un código de moneda válido.", nameof(accountId));

            if (amount == 0)
                throw new ArgumentException("El monto del ajuste no puede ser cero.", nameof(amount));

            var absoluteAmount = Math.Abs(amount);

            var adjustment = new Transaction
            {
                AccountId = accountId,
                Amount = absoluteAmount,
                EffectiveDate = DateTime.UtcNow,
                IsIncome = amount >= 0,
                Description = description,
                IsSystemAdjustment = true
            };

            return adjustment;
        }
    }
}
