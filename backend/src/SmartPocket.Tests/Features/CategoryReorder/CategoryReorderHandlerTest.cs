using Microsoft.EntityFrameworkCore;
using SmartPocket.Domain;
using SmartPocket.Domain.Transactions;
using SmartPocket.Features.Categories.Reorder;
using SmartPocket.Persistence;
using SmartPocket.Tests.Infrastructures;

namespace SmartPocket.Tests.Features.CategoryReorder
{
    public class CategoryReorderHandlerTest : IClassFixture<IntegrationTestFixture>
    {
        private readonly ISmartPocketContext _smartPocketContext;
        private readonly CategoryReorderCommandHandler _handler;

        public CategoryReorderHandlerTest(IntegrationTestFixture testFixture)
        {
            _smartPocketContext = testFixture.SmartPocketContext;
            _handler = testFixture.GetHandler<CategoryReorderCommandHandler>();
        }

        [Fact]
        public async Task Reorder_WithValidItems_PersistsNewOrder()
        {
            // Arrange - create extra categories for gastos
            var cat1 = new Category("Comida", new Icon("food", "#FF0000"), false);
            var cat2 = new Category("Transporte", new Icon("transport", "#00FF00"), false);
            var cat3 = new Category("Entretenimiento", new Icon("entertainment", "#0000FF"), false);

            await _smartPocketContext.AddAndSaveChangesAsync(cat1);
            await _smartPocketContext.AddAndSaveChangesAsync(cat2);
            await _smartPocketContext.AddAndSaveChangesAsync(cat3);

            _smartPocketContext.DiscardAllChanges();

            var command = new CategoryReorderCommand
            {
                Items =
                [
                    new() { Id = cat3.Id, SortOrder = 0 },
                    new() { Id = cat1.Id, SortOrder = 1 },
                    new() { Id = cat2.Id, SortOrder = 2 },
                ]
            };

            // Act
            var result = await _handler.Reorder(command, default);

            // Assert
            Assert.True(result.IsEmpty);

            _smartPocketContext.DiscardAllChanges();

            var reordered = await _smartPocketContext.Query<Category>()
                .Where(c => c.Id == cat1.Id || c.Id == cat2.Id || c.Id == cat3.Id)
                .OrderBy(c => c.SortOrder)
                .ToListAsync();

            Assert.Equal(cat3.Id, reordered[0].Id);
            Assert.Equal(0, reordered[0].SortOrder);
            Assert.Equal(cat1.Id, reordered[1].Id);
            Assert.Equal(1, reordered[1].SortOrder);
            Assert.Equal(cat2.Id, reordered[2].Id);
            Assert.Equal(2, reordered[2].SortOrder);
        }

        [Fact]
        public async Task Reorder_WithBothTypes_PersistsCorrectly()
        {
            // Arrange - create categories for both types
            var gasto1 = new Category("Alquiler", new Icon("rent", "#FF1111"), false);
            var gasto2 = new Category("Servicios", new Icon("services", "#FF2222"), false);
            var ingreso1 = new Category("Salario", new Icon("salary", "#00FF11"), true);
            var ingreso2 = new Category("Freelance", new Icon("freelance", "#00FF22"), true);

            await _smartPocketContext.AddAndSaveChangesAsync(gasto1);
            await _smartPocketContext.AddAndSaveChangesAsync(gasto2);
            await _smartPocketContext.AddAndSaveChangesAsync(ingreso1);
            await _smartPocketContext.AddAndSaveChangesAsync(ingreso2);

            _smartPocketContext.DiscardAllChanges();

            // SortOrder can repeat between types (0 for gastos, 0 for ingresos)
            var command = new CategoryReorderCommand
            {
                Items =
                [
                    new() { Id = gasto2.Id, SortOrder = 0 },
                    new() { Id = gasto1.Id, SortOrder = 1 },
                    new() { Id = ingreso2.Id, SortOrder = 0 },
                    new() { Id = ingreso1.Id, SortOrder = 1 },
                ]
            };

            // Act
            var result = await _handler.Reorder(command, default);

            // Assert
            Assert.True(result.IsEmpty);

            _smartPocketContext.DiscardAllChanges();

            var gastos = await _smartPocketContext.Query<Category>()
                .Where(c => !c.IsIncome && (c.Id == gasto1.Id || c.Id == gasto2.Id))
                .OrderBy(c => c.SortOrder)
                .ToListAsync();

            Assert.Equal(gasto2.Id, gastos[0].Id);
            Assert.Equal(gasto1.Id, gastos[1].Id);

            var ingresos = await _smartPocketContext.Query<Category>()
                .Where(c => c.IsIncome && (c.Id == ingreso1.Id || c.Id == ingreso2.Id))
                .OrderBy(c => c.SortOrder)
                .ToListAsync();

            Assert.Equal(ingreso2.Id, ingresos[0].Id);
            Assert.Equal(ingreso1.Id, ingresos[1].Id);
        }

        [Fact]
        public async Task Reorder_WithNonExistentId_ReturnsError()
        {
            // Arrange
            var command = new CategoryReorderCommand
            {
                Items =
                [
                    new() { Id = 99999, SortOrder = 0 },
                ]
            };

            // Act
            var result = await _handler.Reorder(command, default);

            // Assert
            Assert.False(result.IsEmpty);
            Assert.Contains(result, e => e.Message.Contains("99999"));
        }

        [Fact]
        public async Task Reorder_WithDuplicateSortOrderSameType_ReturnsError()
        {
            // Arrange
            var cat1 = new Category("Test A", new Icon("a", "#111111"), false);
            var cat2 = new Category("Test B", new Icon("b", "#222222"), false);

            await _smartPocketContext.AddAndSaveChangesAsync(cat1);
            await _smartPocketContext.AddAndSaveChangesAsync(cat2);

            _smartPocketContext.DiscardAllChanges();

            var command = new CategoryReorderCommand
            {
                Items =
                [
                    new() { Id = cat1.Id, SortOrder = 0 },
                    new() { Id = cat2.Id, SortOrder = 0 }, // duplicate within same type
                ]
            };

            // Act
            var result = await _handler.Reorder(command, default);

            // Assert
            Assert.False(result.IsEmpty);
            Assert.Contains(result, e => e.Message.Contains("duplicado"));
        }

        [Fact]
        public async Task Reorder_WithEmptyItems_ReturnsValidationError()
        {
            // Arrange
            var command = new CategoryReorderCommand
            {
                Items = []
            };

            // Act
            var result = await _handler.Reorder(command, default);

            // Assert
            Assert.False(result.IsEmpty);
        }

        [Fact]
        public async Task Reorder_WithDuplicateIds_ReturnsValidationError()
        {
            // Arrange
            var cat = new Category("Dup Test", new Icon("dup", "#333333"), false);
            await _smartPocketContext.AddAndSaveChangesAsync(cat);

            _smartPocketContext.DiscardAllChanges();

            var command = new CategoryReorderCommand
            {
                Items =
                [
                    new() { Id = cat.Id, SortOrder = 0 },
                    new() { Id = cat.Id, SortOrder = 1 },
                ]
            };

            // Act
            var result = await _handler.Reorder(command, default);

            // Assert
            Assert.False(result.IsEmpty);
        }

        [Fact]
        public async Task Reorder_PersistsAndReadBackInOrder()
        {
            // Arrange - create numbered categories for gastos
            var catA = new Category("A-Lectura", new Icon("read", "#AA0000"), false);
            var catB = new Category("B-Lectura", new Icon("read2", "#BB0000"), false);

            await _smartPocketContext.AddAndSaveChangesAsync(catA);
            await _smartPocketContext.AddAndSaveChangesAsync(catB);

            _smartPocketContext.DiscardAllChanges();

            // Assign reverse order
            var command = new CategoryReorderCommand
            {
                Items =
                [
                    new() { Id = catB.Id, SortOrder = 0 },
                    new() { Id = catA.Id, SortOrder = 1 },
                ]
            };

            var result = await _handler.Reorder(command, default);
            Assert.True(result.IsEmpty);

            _smartPocketContext.DiscardAllChanges();

            // Act - read back ordered
            var ordered = await _smartPocketContext.Query<Category>()
                .Where(c => c.Id == catA.Id || c.Id == catB.Id)
                .OrderBy(c => c.SortOrder)
                .ThenBy(c => c.Id)
                .ToListAsync();

            // Assert - B should come first
            Assert.Equal(catB.Id, ordered[0].Id);
            Assert.Equal(catA.Id, ordered[1].Id);
        }
    }
}
