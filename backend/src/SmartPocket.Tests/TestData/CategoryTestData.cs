using SmartPocket.Domain;
using SmartPocket.Domain.Transactions;

namespace SmartPocket.Tests.TestData
{
    internal static class CategoryTestData
    {
        public static Category Create(
            int id = 0,
            string name = "Categoría de prueba",
            bool isIncome = false)
        {
            return new Category(name, new Icon("tag", "#FFFFFF"), isIncome)
            {
                Id = id
            };
        }
    }
}
