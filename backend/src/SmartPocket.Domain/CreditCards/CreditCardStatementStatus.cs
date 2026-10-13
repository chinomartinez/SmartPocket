namespace SmartPocket.Domain.CreditCards
{
    public enum CreditCardStatementStatus
    {
        Closed = 1, // No hay pagos registrados.
        Paid = 2, // Hay pagos registrados para todas las monedas incluidas.
        PartiallyPaid = 3
    }
}
