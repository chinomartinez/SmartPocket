using SmartPocket.Persistence.PagedQuery;

namespace SmartPocket.Features.Accounts.Get
{
    public class AccountGetRequest : IPagedQuery
    {
        public int Page { get; set; }

        public int PageSize { get; set; }
    }
}
