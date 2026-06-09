using SmartPocket.SharedKernel.Entities;
using SmartPocket.SharedKernel.Guards;

namespace SmartPocket.Domain.CreditCards
{
    public class CreditCard : BaseAuditEntity<int>
    {
        public string Name { get; private set; } = default!; // "Visa Galicia", "Mastercard Santander"
        public Icon Icon { get; private set; } = default!;
        public string CurrencyCode { get; private set; } = default!;
        public decimal CreditLimit { get; private set; } // Límite de la tarjeta

        /// <summary>
        /// Día habitual de cierre. Usado como sugerencia al crear un nuevo resumen.
        /// La fecha real queda en CreditCardStatement.ClosingDate.
        /// </summary>
        public int StatementClosingDay { get; private set; }

        /// <summary>
        /// Día habitual de vencimiento. Usado como sugerencia al crear un nuevo resumen.
        /// La fecha real queda en CreditCardStatement.DueDate.
        /// </summary>
        public int PaymentDueDay { get; private set; }

        public ICollection<CreditCardPurchase> Purchases { get; private set; } = new List<CreditCardPurchase>();
        public ICollection<CreditCardStatement> Statements { get; private set; } = new List<CreditCardStatement>();

        private CreditCard()
        {
            // Para EF Core
        }

        public CreditCard(string name, Icon icon, string currencyCode, decimal creditLimit, int statementClosingDay, int paymentDueDay)
        {
            Update(name: name,
                icon: icon,
                currencyCode: currencyCode,
                creditLimit: creditLimit,
                statementClosingDay: statementClosingDay,
                paymentDueDay: paymentDueDay
            );
        }

        public void Update(string name, Icon icon, string currencyCode, decimal creditLimit, int statementClosingDay, int paymentDueDay)
        {
            Name = name.GetIfNotNullOrWhiteSpace(nameof(name));
            Icon = icon;
            CurrencyCode = currencyCode.GetIfNotNullOrWhiteSpace(nameof(currencyCode));
            CreditLimit = creditLimit;
            StatementClosingDay = statementClosingDay;
            PaymentDueDay = paymentDueDay;
        }
    }
}
