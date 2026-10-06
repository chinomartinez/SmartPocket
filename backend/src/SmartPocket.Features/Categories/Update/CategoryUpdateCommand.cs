using SmartPocket.Features.Shared.Icons;

namespace SmartPocket.Features.Categories.Update
{
    public class CategoryUpdateCommand
    {
        public int Id { get; set; }

        public string Name { get; set; } = default!;

        public IconDTO Icon { get; set; } = default!;

        /// <summary>
        /// true = categoría para ingresos, false = para gastos
        /// </summary>
        public bool IsIncome { get; set; }
    }
}
