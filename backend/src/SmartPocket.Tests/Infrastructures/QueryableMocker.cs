using MockQueryable.NSubstitute;

namespace SmartPocket.Tests.Infrastructures
{
    internal static class QueryableMocker
    {
        public static IQueryable<T> AsAsyncQueryable<T>(this IEnumerable<T> source) where T : class
        {
            return source.ToList().BuildMockDbSet();
        }

        public static IQueryable<T> Empty<T>() where T : class
        {
            return Array.Empty<T>().AsAsyncQueryable();
        }
    }
}
