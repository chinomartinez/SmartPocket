using SmartPocket.Features.Shared.Icons;
using SmartPocket.SharedKernel.DTOs;

namespace SmartPocket.Features.Categories.Get
{
    public class CategoryGetDTO : BaseDTO<int>
    {
        public string Name { get; set; } = default!;

        public IconDTO Icon { get; set; } = default!;

        /// <summary>
        /// true = categoría para ingresos, false = para gastos
        /// </summary>
        public bool IsIncome { get; set; }

        public bool IsDefault { get; set; }

        public int SortOrder { get; set; }
    }
}
