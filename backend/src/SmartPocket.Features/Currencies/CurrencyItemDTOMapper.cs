using SmartPocket.Domain.Configurations;

namespace SmartPocket.Features.Currencies
{
    public static class CurrencyItemDTOMapper
    {
        public static IEnumerable<CurrencyItemDTO> GetAll()
        {
            var currencies = Currency.All()
                .Select(c => new CurrencyItemDTO
                {
                    Code = c.Code,
                    Symbol = c.Symbol,
                    Name = c.Name
                });

            return currencies;
        }

        public static CurrencyItemDTO GetByCode(string code)
        {
            return GetAll().First(c => c.Code.Equals(code, StringComparison.OrdinalIgnoreCase));
        }
    }
}
