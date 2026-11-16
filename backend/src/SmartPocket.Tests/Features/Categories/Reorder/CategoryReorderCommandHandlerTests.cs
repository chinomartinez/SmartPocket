using SmartPocket.Domain.Transactions;
using SmartPocket.Features.Categories.Reorder;
using SmartPocket.Tests.Infrastructures;
using SmartPocket.Tests.TestData;

namespace SmartPocket.Tests.Features.Categories.Reorder
{
    public class CategoryReorderCommandHandlerTests
    {
        [Fact]
        public async Task Reorder_WithValidItems_PersistsNewOrder()
        {
            var cancellationToken = TestContext.Current.CancellationToken;

            // Arrange
            var cat1 = CategoryTestData.Create(id: 1, name: "Comida");
            var cat2 = CategoryTestData.Create(id: 2, name: "Transporte");
            var cat3 = CategoryTestData.Create(id: 3, name: "Entretenimiento");
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
            var expense1 = CategoryTestData.Create(id: 1, name: "Alquiler");
            var expense2 = CategoryTestData.Create(id: 2, name: "Servicios");
            var income1 = CategoryTestData.Create(id: 3, name: "Salario", isIncome: true);
            var income2 = CategoryTestData.Create(id: 4, name: "Freelance", isIncome: true);
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
            var category = CategoryTestData.Create(id: 1);
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
            var category1 = CategoryTestData.Create(id: 1, name: "Comida");
            var category2 = CategoryTestData.Create(id: 2, name: "Transporte");
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
            var category = CategoryTestData.Create(id: 1);
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
    }
}
