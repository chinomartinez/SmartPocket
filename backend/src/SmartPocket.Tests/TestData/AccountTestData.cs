using SmartPocket.Domain;
using SmartPocket.Domain.Accounts;
using SmartPocket.Domain.Configurations;

namespace SmartPocket.Tests.TestData
{
    internal static class AccountTestData
    {
        public static Account Create(
            int id = 0,
            string name = "Cuenta de prueba",
            decimal initialBalance = 0,
            bool includeInBalanceGlobal = true,
            bool isPrincipal = false)
        {
            return new Account(
                name: name,
                icon: new Icon("wallet", "#FFFFFF"),
                currencyCode: Currency.ARS.Code,
                initialBalance: initialBalance,
                includeInBalanceGlobal: includeInBalanceGlobal,
                isPrincipal: isPrincipal)
            {
                Id = id
            };
        }
    }
}
