namespace SmartPocket.Features.Categories.Reorder
{
    public class CategoryReorderCommand
    {
        /// <summary>
        /// Colección plana de items representando el estado final completo de orden por tipo.
        /// El backend infiere el tipo de cada categoría a partir de su id.
        /// </summary>
        public List<CategoryReorderItem> Items { get; set; } = [];
    }

    public class CategoryReorderItem
    {
        public int Id { get; set; }
        public int SortOrder { get; set; }
    }
}
