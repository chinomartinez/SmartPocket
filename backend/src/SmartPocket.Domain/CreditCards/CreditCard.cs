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
        /// Rango habitual de cierre. Usado como sugerencia al crear un nuevo resumen.
        /// La fecha real queda en CreditCardStatement.ClosingDate.
        /// </summary>
        public DayRange StatementClosingRange { get; private set; }

        /// <summary>
        /// Rango habitual de vencimiento. Usado como sugerencia al crear un nuevo resumen.
        /// La fecha real queda en CreditCardStatement.DueDate.
        /// </summary>
        public DayRange PaymentDueRange { get; private set; }

        public ICollection<CreditCardPurchase> Purchases { get; private set; } = new List<CreditCardPurchase>();

        public ICollection<CreditCardSubscription> Subscriptions { get; private set; } = new List<CreditCardSubscription>();

        public ICollection<CreditCardStatement> Statements { get; private set; } = new List<CreditCardStatement>();

        private CreditCard()
        {
            // Para EF Core
        }

        public CreditCard(string name, Icon icon, string currencyCode, decimal creditLimit, DayRange statementClosingRange, DayRange paymentDueRange)
        {
            Update(name: name,
                icon: icon,
                currencyCode: currencyCode,
                creditLimit: creditLimit,
                statementClosingRange: statementClosingRange,
                paymentDueRange: paymentDueRange
            );
        }

        public void Update(string name, Icon icon, string currencyCode, decimal creditLimit, DayRange statementClosingRange, DayRange paymentDueRange)
        {
            Name = name.GetIfNotNullOrWhiteSpace(nameof(name));
            Icon = icon;
            CurrencyCode = currencyCode.GetIfNotNullOrWhiteSpace(nameof(currencyCode));
            CreditLimit = creditLimit;
            StatementClosingRange = statementClosingRange;
            PaymentDueRange = paymentDueRange;
        }
    }
}