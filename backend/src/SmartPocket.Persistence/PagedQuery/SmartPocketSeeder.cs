using Microsoft.EntityFrameworkCore;
using SmartPocket.Domain;
using SmartPocket.Domain.Transactions;

namespace SmartPocket.Persistence.PagedQuery
{
    public static class SmartPocketSeeder
    {
        public static async Task SeedAsync(ISmartPocketContext context, CancellationToken cancellation)
        {
            await SeedCategories(context, cancellation);
        }

        private static async Task SeedCategories(ISmartPocketContext context, CancellationToken cancellation)
        {
            var any = await context
                .Query<Category>()
                .Where(x => x.IsDefault)
                .AnyAsync(cancellation);

            if (any) return;

            var defaultCategories = new Category[]
            {
                new("Otros", new Icon("others", "#FD2D00"), true){ IsDefault = true },
                new("Otros", new Icon("others", "#FD2D00"), false){ IsDefault = true}
            };

            context.AddRange(defaultCategories);

            await context.SaveChangesAsync(cancellation);
        }
    }
}
