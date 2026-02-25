namespace SmartPocket.Domain.Security
{
    public interface ITenantEntity
    {
        User User { get; set; }

        int UserId { get; set; }
    }
}
