using SmartPocket.Domain;
using SmartPocket.Domain.Transactions;
using SmartPocket.Features.Categories.Reorder;
using SmartPocket.Tests.Infrastructures;

namespace SmartPocket.Tests.Features.Categories.Reorder
{
    public class CategoryReorderCommandHandlerTests
    {
        [Fact]
        public async Task Reorder_WithValidItems_PersistsNewOrder()
        {
            var cancellationToken = TestContext.Current.CancellationToken;

            // Arrange
            var cat1 = CreateCategory(id: 1, name: "Comida");
            var cat2 = CreateCategory(id: 2, name: "Transporte");
            var cat3 = CreateCategory(id: 3, name: "Entretenimiento");
            var context = new FakeSmartPocketContext().With(cat1, cat2, cat3);
            var handler = new CategoryReorderCommandHandler(context, new CategoryReorderValidator());

            var command = new CategoryReorderCommand
            {
                Items =
                [
                    new() { Id = cat3.Id, SortOrder = 0 },
                    new() { Id = cat1.Id, SortOrder = 1 },
                    new() { Id = cat2.Id, SortOrder = 2 }
                ]
            };

            // Act
            var result = await handler.Reorder(command, cancellationToken);

            // Assert
            Assert.True(result.IsEmpty);
            Assert.Equal(0, cat3.SortOrder);
            Assert.Equal(1, cat1.SortOrder);
            Assert.Equal(2, cat2.SortOrder);
            Assert.Equal(3, context.Saved<Category>().Count);
        }

        [Fact]
        public async Task Reorder_WithBothTypes_PersistsOrderPerType()
        {
            var cancellationToken = TestContext.Current.CancellationToken;

            // Arrange
            var expense1 = CreateCategory(id: 1, name: "Alquiler");
            var expense2 = CreateCategory(id: 2, name: "Servicios");
            var income1 = CreateCategory(id: 3, name: "Salario", isIncome: true);
            var income2 = CreateCategory(id: 4, name: "Freelance", isIncome: true);
            var context = new FakeSmartPocketContext().With(expense1, expense2, income1, income2);
            var handler = new CategoryReorderCommandHandler(context, new CategoryReorderValidator());

            var command = new CategoryReorderCommand
            {
                Items =
                [
                    new() { Id = expense2.Id, SortOrder = 0 },
                    new() { Id = expense1.Id, SortOrder = 1 },
                    new() { Id = income2.Id, SortOrder = 0 },
                    new() { Id = income1.Id, SortOrder = 1 }
                ]
            };

            // Act
            var result = await handler.Reorder(command, cancellationToken);

            // Assert
            Assert.True(result.IsEmpty);
            Assert.Equal(0, expense2.SortOrder);
            Assert.Equal(1, expense1.SortOrder);
            Assert.Equal(0, income2.SortOrder);
            Assert.Equal(1, income1.SortOrder);
        }

        [Fact]
        public async Task Reorder_WhenCategoryDoesNotExist_ReturnsErrorWithId()
        {
            var cancellationToken = TestContext.Current.CancellationToken;

            // Arrange
            var category = CreateCategory(id: 1);
            var context = new FakeSmartPocketContext().With(category);
            var handler = new CategoryReorderCommandHandler(context, new CategoryReorderValidator());

            var command = new CategoryReorderCommand
            {
                Items =
                [
                    new() { Id = 99, SortOrder = 0 }
                ]
            };

            // Act
            var result = await handler.Reorder(command, cancellationToken);

            // Assert
            Assert.False(result.IsEmpty);
            Assert.Contains(result, error => error.Message.Contains("99"));
            Assert.Equal(0, category.SortOrder);
        }

        [Fact]
        public async Task Reorder_WithDuplicateSortOrderSameType_ReturnsError()
        {
            var cancellationToken = TestContext.Current.CancellationToken;

            // Arrange
            var category1 = CreateCategory(id: 1, name: "Comida");
            var category2 = CreateCategory(id: 2, name: "Transporte");
            var context = new FakeSmartPocketContext().With(category1, category2);
            var handler = new CategoryReorderCommandHandler(context, new CategoryReorderValidator());

            var command = new CategoryReorderCommand
            {
                Items =
                [
                    new() { Id = category1.Id, SortOrder = 0 },
                    new() { Id = category2.Id, SortOrder = 0 }
                ]
            };

            // Act
            var result = await handler.Reorder(command, cancellationToken);

            // Assert
            Assert.False(result.IsEmpty);
            Assert.Contains(result, error => error.Message.Contains("duplicado"));
        }

        [Fact]
        public async Task Reorder_WithDuplicateIds_ReturnsValidationError()
        {
            var cancellationToken = TestContext.Current.CancellationToken;

            // Arrange
            var category = CreateCategory(id: 1);
            var context = new FakeSmartPocketContext().With(category);
            var handler = new CategoryReorderCommandHandler(context, new CategoryReorderValidator());

            var command = new CategoryReorderCommand
            {
                Items =
                [
                    new() { Id = category.Id, SortOrder = 0 },
                    new() { Id = category.Id, SortOrder = 1 }
                ]
            };

            // Act
            var result = await handler.Reorder(command, cancellationToken);

            // Assert
            Assert.False(result.IsEmpty);
            Assert.Equal(0, category.SortOrder);
        }

        [Fact]
        public async Task Reorder_WithEmptyItems_ReturnsValidationError()
        {
            var cancellationToken = TestContext.Current.CancellationToken;

            // Arrange
            var context = new FakeSmartPocketContext();
            var handler = new CategoryReorderCommandHandler(context, new CategoryReorderValidator());

            var command = new CategoryReorderCommand
            {
                Items = []
            };

            // Act
            var result = await handler.Reorder(command, cancellationToken);

            // Assert
            Assert.False(result.IsEmpty);
        }

        private static Category CreateCategory(
            int id,
            string name = "Categoría de prueba",
            bool isIncome = false)
        {
            return new Category(name, new Icon("tag", "#FFFFFF"), isIncome)
            {
                Id = id
            };
        }
    }
}
