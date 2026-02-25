using SmartPocket.Features.Shared.Icons;

namespace SmartPocket.Features.Categories.Create
{
    public class CategoryCreateCommand
    {
        public string Name { get; set; } = default!;

        public IconDTO Icon { get; set; } = default!;

        /// <summary>
        /// true = categoría para ingresos, false = para gastos
        /// </summary>
        public bool IsIncome { get; set; }
    }
}
