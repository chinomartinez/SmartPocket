namespace SmartPocket.Features.Currencies
{
    public class CurrencyItemDTO
    {
        public int Id { get; set; }
        public string Code { get; set; } = default!;
        public string Symbol { get; set; } = default!;
        public string Name { get; set; } = default!;
    }
}
