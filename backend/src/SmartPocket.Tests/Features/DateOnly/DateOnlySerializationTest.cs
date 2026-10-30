using System.Text.Json;
using SmartPocket.Features.CreditCardStatements.GetById;
using SmartPocket.Features.CreditCardStatements.Payments.Get;
using SmartPocket.Features.Transactions;
using SmartPocket.Features.Transactions.GetById;
using SmartPocket.Features.Transfers.GetById;

namespace SmartPocket.Tests.Features.DateOnlySerialization
{
    public class DateOnlySerializationTest
    {
        private static readonly JsonSerializerOptions WebOptions = new(JsonSerializerDefaults.Web);

        [Fact]
        public void DateOnly_SerializesAsIsoDateWithoutTime()
        {
            var date = new DateOnly(2026, 10, 21);

            var json = JsonSerializer.Serialize(date, WebOptions);

            Assert.Equal("\"2026-10-21\"", json);
        }

        [Fact]
        public void DateOnly_RoundTripsFromIsoDate()
        {
            var date = new DateOnly(2026, 10, 21);

            var json = JsonSerializer.Serialize(date, WebOptions);
            var result = JsonSerializer.Deserialize<DateOnly>(json, WebOptions);

            Assert.Equal(date, result);
        }

        [Fact]
        public void TransactionDto_SerializesEffectiveDateAsDateOnly()
        {
            var dto = new TransactionGetByIdDTO
            {
                Id = 1,
                AccountId = 2,
                CategoryId = 3,
                IsIncome = false,
                EffectiveDate = new DateOnly(2026, 10, 21)
            };

            var json = JsonSerializer.Serialize(dto, WebOptions);

            Assert.Contains("\"effectiveDate\":\"2026-10-21\"", json);
        }

        [Fact]
        public void TransferDto_SerializesEffectiveDateAsDateOnly()
        {
            var dto = new TransferGetByIdDTO
            {
                Id = 1,
                Amount = 100,
                EffectiveDate = new DateOnly(2026, 10, 21)
            };

            var json = JsonSerializer.Serialize(dto, WebOptions);

            Assert.Contains("\"effectiveDate\":\"2026-10-21\"", json);
        }

        [Fact]
        public void StatementDto_SerializesClosingAndDueDateAsDateOnly()
        {
            var dto = new CreditCardStatementGetByIdDTO
            {
                Id = 1,
                CreditCardId = 2,
                ClosingDate = new DateOnly(2026, 10, 21),
                DueDate = new DateOnly(2026, 11, 5)
            };

            var json = JsonSerializer.Serialize(dto, WebOptions);

            Assert.Contains("\"closingDate\":\"2026-10-21\"", json);
            Assert.Contains("\"dueDate\":\"2026-11-05\"", json);
        }

        [Fact]
        public void PaymentDto_SerializesEffectiveDateAsDateOnly()
        {
            var dto = new CreditCardStatementPaymentDTO
            {
                Id = 1,
                TransactionId = 2,
                AccountId = 3,
                Money = new MoneyDTO
                {
                    Amount = 100,
                    CurrencyCode = "ARS"
                },
                CoveredCurrencyCode = "ARS",
                EffectiveDate = new DateOnly(2026, 10, 21)
            };

            var json = JsonSerializer.Serialize(dto, WebOptions);

            Assert.Contains("\"effectiveDate\":\"2026-10-21\"", json);
        }

        [Fact]
        public void DateOnly_DoesNotDeserializeDateTimeWithTime()
        {
            const string json = "\"2026-10-21T10:30:00Z\"";

            Assert.ThrowsAny<Exception>(() => JsonSerializer.Deserialize<DateOnly>(json, WebOptions));
        }
    }
}
