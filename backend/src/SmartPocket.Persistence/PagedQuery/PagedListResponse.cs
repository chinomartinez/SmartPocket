using Microsoft.EntityFrameworkCore;

namespace SmartPocket.Persistence.PagedQuery
{
    public class PagedListResponse<T>
    {
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalCount { get; set; }

        public List<T> Data { get; set; }

        private PagedListResponse(List<T> data, int totalCount, IPagedQuery? pagedQuery = default)
        {
            Page = pagedQuery?.Page ?? default;
            PageSize = pagedQuery?.PageSize ?? default;
            TotalCount = totalCount;
            Data = data;
        }

        public static Task<PagedListResponse<T>> Create(IQueryable<T> query,
            IPagedQuery pagedQuery,
            CancellationToken cancellationToken)
        {
            return Create(query, () => query.CountAsync(cancellationToken), pagedQuery, cancellationToken);
        }

        public static async Task<PagedListResponse<T>> Create(IQueryable<T> query,
            Func<Task<int>> factoryTotalCount,
            IPagedQuery pagedQuery,
            CancellationToken cancellationToken)
        {
            var response = pagedQuery.Page < 0 && pagedQuery.PageSize < 0
                ? await CreateResponse(query, cancellationToken)
                : await CreateResponse(query, factoryTotalCount, pagedQuery, cancellationToken);

            return response;
        }

        private static async Task<PagedListResponse<T>> CreateResponse(IQueryable<T> query,
            CancellationToken cancellationToken)
        {
            var data = await query.ToListAsync(cancellationToken);

            return new(data, data.Count);
        }

        private static async Task<PagedListResponse<T>> CreateResponse(IQueryable<T> query,
            Func<Task<int>> factoryTotalCount,
            IPagedQuery pagedQuery,
            CancellationToken cancellationToken)
        {
            var data = await query.ToPagination(pagedQuery).ToListAsync(cancellationToken);
            var totalCount = await factoryTotalCount();

            return new(data, totalCount, pagedQuery);
        }
    }
}
