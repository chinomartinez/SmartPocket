using SmartPocket.SharedKernel.Entities;
using SmartPocket.SharedKernel.Guards;

namespace SmartPocket.Domain.Transactions
{
    public class Category : BaseAuditEntity<int>
    {
        public string Name { get; private set; } = default!;

        public Icon Icon { get; private set; } = default!;

        /// <summary>
        /// true = categoría para ingresos, false = para gastos
        /// </summary>
        public bool IsIncome { get; private set; }

        /// <summary>
        /// Es una categoria de Servicio, proporcionado por el sistema. No se puede editar
        /// </summary>
        public bool IsDefault { get; set; } = false;

        /// <summary>
        /// Orden de visualización dentro del tipo (Gastos o Ingresos). Menor valor = aparece primero.
        /// </summary>
        public int SortOrder { get; set; }

        protected Category()
        {
            //For EF Core
        }

        public Category(string name, Icon icon, bool isIncome)
        {
            Update(name, icon, isIncome);
        }

        public void Update(string name, Icon icon, bool isIncome)
        {
            Name = name.GetIfNotNullOrWhiteSpace(nameof(name));
            Icon = icon ?? throw new ArgumentNullException(nameof(icon));
            IsIncome = isIncome;
        }
    }
}
