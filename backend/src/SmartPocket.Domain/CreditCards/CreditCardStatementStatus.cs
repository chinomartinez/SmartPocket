namespace SmartPocket.Domain.CreditCards
{
    public enum CreditCardStatementStatus
    {
        Closed = 1, // El resumen se cerró pero aún no se pagó
        Paid = 2 // Pagaste el resumen completo
    }
}
