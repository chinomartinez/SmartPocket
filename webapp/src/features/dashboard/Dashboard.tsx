import FinancialCards from "@/features/dashboard/financialCards/FinancialCards";
import RecentTransactions from "@/features/dashboard/recentTransactions/RecentTransactions";
import UpcomingPayments from "@/features/dashboard/upcomingPayments/UpcomingPayments";

export default function Dashboard() {
  return (
    <>
      <div className="mb-6 md:mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Dashboard Overview
        </h2>
        <p className="text-slate-400">
          Welcome back! Here's what's happening with your finances.
        </p>
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
        <h3 className="text-xl font-semibold text-white mb-4">
          🚀 Dashboard Layout Complete!
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="text-lg font-medium text-slate-300">
              ✅ Structure Ready
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>• Responsive header with navigation</li>
              <li>• Collapsible sidebar menu</li>
              <li>• Mobile-first design</li>
              <li>• Grid layout for content</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="text-lg font-medium text-slate-300">
              📋 Next Steps
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>• Add charts & visualizations</li>
              <li>• Implement transaction list</li>
              <li>• Create category breakdown</li>
              <li>• Add financial indicators</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
