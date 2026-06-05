using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartPocket.Domain.Transactions;

namespace SmartPocket.Persistence.EntityConfigurations.Transactions
{
    public class TransactionConfig : IEntityTypeConfiguration<Transaction>
    {
        public void Configure(EntityTypeBuilder<Transaction> builder)
        {
            builder.Property(x => x.Description).HasMaxLength(300);

            builder
                .HasOne(x => x.Account)
                .WithMany(x => x.Transactions)
                .IsRequired()
                .OnDelete(DeleteBehavior.Cascade);

            builder
                .HasOne(x => x.Category)
                .WithMany()
                .OnDelete(DeleteBehavior.Cascade);

            // No quiero que se borre la transacción si se borra la fuente de la transacción, por eso Restrict.
            builder
                .HasOne(x => x.TransactionSource)
                .WithMany()
                .HasForeignKey(x => x.TransactionSourceId)
                .IsRequired()
                .OnDelete(DeleteBehavior.Restrict);

            // Para cuando quiera mapear NativeMoney como moneda diferente a la moneda de la cuenta
            // Ejemplo, la cuenta es en pesos y quiero guardar el monto en dolares.
            //builder.ComplexProperty(x => x.AccountMoney, moneyBulder =>
            //{
            //    moneyBulder.Property(m => m.CurrencyCode)
            //        .IsRequired()
            //        .HasMaxLength(3);
            //});

            // Campos calculados con sqlite

            var amountName = nameof(Transaction.Amount);
            string sql = $"CASE WHEN IsIncome = 1 THEN {amountName} ELSE -{amountName} END";

            builder.Property(x => x.SignedAmount)
                .HasComputedColumnSql(sql, stored: true)
                .ValueGeneratedOnAddOrUpdate();

            var transactionSourceIdName = nameof(Transaction.TransactionSourceId);
            var manualEntryId = ((int)TransactionSourceType.ManualEntry);
            var transferId = ((int)TransactionSourceType.Transfer);
            var systemAdjustmentId = ((int)TransactionSourceType.SystemAdjustment);

            string isManualEntrySql = $"CASE WHEN {transactionSourceIdName} = {manualEntryId} THEN 1 ELSE 0 END";
            builder.Property(x => x.IsManualEntry)
                .HasComputedColumnSql(isManualEntrySql, stored: false)
                .ValueGeneratedOnAddOrUpdate();
            
            string isTransferSql = $"CASE WHEN {transactionSourceIdName} = {transferId} THEN 1 ELSE 0 END";
            builder.Property(x => x.IsTransfer)
                .HasComputedColumnSql(isTransferSql, stored: false)
                .ValueGeneratedOnAddOrUpdate();

            string isSystemAdjustmentSql = $"CASE WHEN {transactionSourceIdName} = {systemAdjustmentId} THEN 1 ELSE 0 END";
            builder.Property(x => x.IsSystemAdjustment)
                .HasComputedColumnSql(isSystemAdjustmentSql, stored: false)
                .ValueGeneratedOnAddOrUpdate();
        }
    }
}
