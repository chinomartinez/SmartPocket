using SmartPocket.Persistence.PagedQuery;

namespace SmartPocket.Features.CreditCardActivities.List
{
    public class CreditCardActivityListFilters : IPagedQuery
    {
        public int Page { get; set; } = 1;

        public int PageSize { get; set; } = 10;

        public string? Type { get; set; }

        public string? Status { get; set; }

        public string? Search { get; set; }
    }
}
