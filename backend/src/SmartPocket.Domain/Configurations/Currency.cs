namespace SmartPocket.Domain.Configurations
{
    public readonly record struct Currency(string Code, string Symbol, string Name)
    {
        public static Currency ARS => new("ARS", "$", "Peso argentino");

        public static Currency USD => new("USD", "U$D", "Dólar estadounidense");

        public static Currency[] All() => [ARS, USD];
    }
}
