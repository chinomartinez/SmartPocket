namespace SmartPocket.Persistence.PagedQuery
{
    public interface IPagedQuery
    {
        /// <summary>
        /// Page number. If null then default is 1.
        /// </summary>
        int Page { get; set; }

        /// <summary>
        /// Records number per page (page size).
        /// </summary>
        int PageSize { get; set; }
    }
}
