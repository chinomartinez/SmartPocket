using SmartPocket.Domain.Transactions;
using SmartPocket.SharedKernel.Entities;
using SmartPocket.SharedKernel.Guards;

namespace SmartPocket.Domain.Accounts
{
    public class Account : BaseAuditEntity<int>
    {
        protected Account()
        {
            // PARA EF Core
        }

        public Account(string name, Icon icon, string currencyCode, decimal initialBalance,
            bool includeInBalanceGlobal)
        {
            Update(name, icon, currencyCode, includeInBalanceGlobal);

            InitialBalance = initialBalance;
        }

        public string Name { get; private set; } = default!;
        public Icon Icon { get; private set; } = default!;

        public string CurrencyCode { get; private set; } = default!;

        public decimal InitialBalance { get; private set; }

        public bool IncludeInBalanceGlobal { get; private set; }

        public ICollection<Transaction> Transactions { get; private set; } = new List<Transaction>();


        public void Update(string name, Icon icon, string currencyCode, bool includeInBalanceGlobal)
        {
            Name = name.GetIfNotNullOrWhiteSpace(nameof(name));
            Icon = icon;
            CurrencyCode = currencyCode.GetIfNotNullOrWhiteSpace(nameof(currencyCode));
            IncludeInBalanceGlobal = includeInBalanceGlobal;
        }
    }
}
