namespace SmartPocket.Domain.CreditCards
{
    public enum CreditCardStatementStatus
    {
        Closed = 2, // El resumen se cerró pero aún no se pagó
        Paid = 3, // Pagaste el resumen completo
        PartiallyPaid = 4   // Pagaste la sección USD pero no la ARS, o viceversa
    }
}
