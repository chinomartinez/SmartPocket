import { useState } from "react";
import FinancialCards from "@/features/dashboard/financialCards/FinancialCards";
import RecentTransactions from "@/features/dashboard/recentTransactions/RecentTransactions";
import UpcomingPayments from "@/features/dashboard/upcomingPayments/UpcomingPayments";
import { TransactionFormModal } from "@/features/transactions/TransactionFormModal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Dashboard() {
  const [transactionModalOpen, setTransactionModalOpen] = useState(false);

  return (
    <>
      <div className="mb-6 md:mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h2>
        <p className="text-slate-400">Welcome back! Here's what's happening with your finances.</p>
      </div>

      {/* Financial Cards Row */}
      <FinancialCards />

      {/* Transactions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6 md:mb-8">
        <div className="lg:col-span-3">
          <RecentTransactions />
        </div>
        <div className="lg:col-span-2">
          <UpcomingPayments />
        </div>
      </div>

      {/* Placeholder for future components */}
      <div className="glass-card rounded-2xl p-8">
        <h3 className="text-xl font-semibold text-white mb-4">🚀 Dashboard Layout Complete!</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="text-lg font-medium text-slate-300">✅ Structure Ready</h4>
            <ul className="space-y-2 text-slate-400">
              <li>• Responsive header with navigation</li>
              <li>• Collapsible sidebar menu</li>
              <li>• Mobile-first design</li>
              <li>• Grid layout for content</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="text-lg font-medium text-slate-300">📋 Next Steps</h4>
            <ul className="space-y-2 text-slate-400">
              <li>• Add charts & visualizations</li>
              <li>• Implement transaction list</li>
              <li>• Create category breakdown</li>
              <li>• Add financial indicators</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Floating Action Button (FAB) para crear transacción */}
      <Button
        onClick={() => setTransactionModalOpen(true)}
        size="lg"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl 
          glass-card glass-card-hover
          bg-sp-blue-600 hover:bg-sp-blue-500
          border-2 border-sp-blue-400/30
          transition-all duration-300 ease-out
          hover:scale-110 hover:shadow-sp-blue-500/50
          z-50
          group"
        title="Nueva Transacción"
      >
        <Plus className="h-6 w-6 transition-transform duration-300 group-hover:rotate-90" />
      </Button>

      {/* Modal de creación de transacción */}
      <TransactionFormModal
        mode="create"
        open={transactionModalOpen}
        onOpenChange={setTransactionModalOpen}
      />
    </>
  );
}
