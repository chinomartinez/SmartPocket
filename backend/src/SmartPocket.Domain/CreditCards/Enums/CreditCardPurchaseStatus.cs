namespace SmartPocket.Domain.CreditCards.Enums
{
    public enum CreditCardPurchaseStatus
    {
        InProgress,
        PaidOff, // Todas las cuotas fueron abonadas y la compra quedó completamente saldada.
        Cancelled // Solo para suscripciones canceladas ya saldadas
    }
}
