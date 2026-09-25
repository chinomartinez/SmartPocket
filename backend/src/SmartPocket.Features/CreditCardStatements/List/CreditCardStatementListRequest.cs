using SmartPocket.Persistence.PagedQuery;

namespace SmartPocket.Features.CreditCardStatements.List
{
    public class CreditCardStatementListRequest : IPagedQuery
    {
        public int CreditCardId { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}
