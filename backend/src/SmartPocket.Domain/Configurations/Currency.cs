using SmartPocket.SharedKernel.Entities;

namespace SmartPocket.Domain.Configurations
{
    public class Currency
    {
        public string Code { get; private set; }
        public string Symbol { get; private set; }
        public string Name { get; private set; }

        public Currency(string code, string symbol, string name)
        {
            Code = code;
            Symbol = symbol;
            Name = name;
        }

        public static Currency ARS => new("ARS", "$", "Peso argentino");

        public static Currency USD => new("USD", "U$D", "Dólar estadounidense");

        public static Currency[] All() => [ARS, USD];
    }
}
