namespace SmartPocket.Domain.Transactions
{
    public readonly record struct Money(decimal Amount, string CurrencyCode)
    {
    }
}
