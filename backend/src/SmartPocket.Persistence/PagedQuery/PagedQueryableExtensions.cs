
namespace SmartPocket.Persistence.PagedQuery
{
    public static class PagedQueryableExtensions
    {
        public static Task<PagedListResponse<T>> ToPagedListResponse<T>(this IQueryable<T> query,
            IPagedQuery pagedQuery,
            CancellationToken cancellationToken)
        {
            return PagedListResponse<T>.Create(query, pagedQuery, cancellationToken);
        }

        public static Task<PagedListResponse<T>> ToPagedListResponse<T>(this IQueryable<T> query,
            Func<Task<int>> factoryTotalCount,
            IPagedQuery pagedQuery,
             CancellationToken cancellationToken)
        {
            return PagedListResponse<T>.Create(query, factoryTotalCount, pagedQuery, cancellationToken);
        }

        public static IQueryable<T> ToPagination<T>(this IQueryable<T> query, IPagedQuery pagedQuery)
        {
            return query.Skip(pagedQuery).Take(pagedQuery);
        }

        private static IQueryable<T> Skip<T>(this IQueryable<T> query, IPagedQuery pagedQuery)
        {
            if (pagedQuery.Page < 0 && pagedQuery.PageSize < 0)
                return query;

            var page = Math.Max(pagedQuery.Page, 1) - 1;

            if (page is 0) return query;

            return query.Skip(page * pagedQuery.PageSize);
        }

        private static IQueryable<T> Take<T>(this IQueryable<T> query, IPagedQuery pagedQuery)
        {
            return pagedQuery.PageSize > 0
                ? query.Take(pagedQuery.PageSize)
                : query;
        }
    }
}
