import { useState } from "react";
import { ArrowUpRightIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { useRecentTransactions } from "@/features/transactions/useTransactions";
import { TransactionFormModal } from "@/features/transactions/TransactionFormModal";
import { formatRelativeTime, formatCurrency } from "@/utils/formatters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/router/routes";
import { Skeleton } from "@/components/ui/skeleton";
import { IconBox } from "@/components/iconBoxes/IconBox";

export default function RecentTransactions() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<number | undefined>();

  // Fetch recent transactions (últimas 4)
  const { data: transactions, isLoading, error } = useRecentTransactions(4);

  const handleEditTransaction = (id: number) => {
    setSelectedTransactionId(id);
    setModalOpen(true);
  };

  const handleCloseModal = (open: boolean) => {
    setModalOpen(open);
    if (!open) {
      setSelectedTransactionId(undefined);
    }
  };

  return (
    <>
      <Card className="group glass-card glass-card-hover gap-0 p-6 hover:scale-105 hover:shadow-2xl transition-all duration-300 shadow-xl">
        {/* Header */}
        <CardHeader className="p-0 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-sp-blue-600 p-3 rounded-xl">
                <span className="text-white text-lg">💳</span>
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-white">
                  Recent Transactions
                </CardTitle>
                <p className="text-sm text-slate-400">Latest activity</p>
              </div>
            </div>
            <Badge className="bg-sp-blue-600/20 text-sp-blue-400 border-0 font-medium">
              RECENT
            </Badge>
          </div>
        </CardHeader>

        {/* Transactions List */}
        <CardContent className="p-0 space-y-4">
          {isLoading && (
            <>
              {[...Array(4)].map((_, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl">
                  <div className="flex items-center space-x-3 flex-1">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <div className="space-y-2 text-right">
                    <Skeleton className="h-4 w-20 ml-auto" />
                    <Skeleton className="h-3 w-16 ml-auto" />
                  </div>
                </div>
              ))}
            </>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-red-400 text-sm">Error al cargar transacciones</p>
            </div>
          )}

          {!isLoading && !error && transactions?.length === 0 && (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">📝</div>
              <p className="text-slate-400 text-sm mb-2">No hay transacciones recientes</p>
              <p className="text-slate-500 text-xs">Crea tu primera transacción para comenzar</p>
            </div>
          )}

          {!isLoading && !error && transactions && transactions.length > 0 && (
            <>
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  onClick={() => handleEditTransaction(transaction.id)}
                  className="group/item flex items-center justify-between p-3 rounded-xl hover:bg-slate-700/30 transition-colors cursor-pointer"
                >
                  {/* Left: Icon + Description */}
                  <div className="flex items-center space-x-3">
                    <IconBox
                      icon={transaction.category.icon}
                      size="sm"
                      shape="rounded"
                      backgroundOpacity={20}
                      animated
                    />
                    <div>
                      <p className="text-white font-medium text-sm">
                        {transaction.description || transaction.category.name}
                      </p>
                      <p className="text-slate-400 text-xs">{transaction.category.name}</p>
                    </div>
                  </div>

                  {/* Right: Amount + Time */}
                  <div className="text-right">
                    <p
                      className={`text-sm font-semibold font-mono ${
                        transaction.isIncome ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {transaction.isIncome ? "+" : "-"}
                      {formatCurrency(Math.abs(transaction.money.amount))}
                    </p>
                    <p className="text-slate-500 text-xs">
                      {formatRelativeTime(new Date(transaction.effectiveDate))}
                    </p>
                  </div>
                </div>
              ))}
            </>
          )}
        </CardContent>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-700/50">
          <Link
            to={ROUTES.TRANSACTIONS}
            className="group/button w-full flex items-center justify-center space-x-2 text-sp-blue-400 hover:text-sp-blue-300 transition-colors py-2 rounded-lg hover:bg-sp-blue-600/10"
          >
            <span className="text-sm font-medium">View all transactions</span>
            <ArrowUpRightIcon className="h-4 w-4 group-hover/button:translate-x-1 group-hover/button:-translate-y-1 transition-transform duration-300" />
          </Link>
        </div>
      </Card>

      {/* Modal de edición de transacción */}
      {modalOpen && (
        <TransactionFormModal
          mode="edit"
          transactionId={selectedTransactionId}
          open={modalOpen}
          onOpenChange={handleCloseModal}
        />
      )}
    </>
  );
}
