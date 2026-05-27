import { useState } from "react";
import { Bars3Icon, BellIcon } from "@heroicons/react/24/outline";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TransactionFormModal } from "@/features/transactions/TransactionFormModal";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [transactionModalOpen, setTransactionModalOpen] = useState(false);

  return (
    <header className="glass-card border-b px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left: Menu + Logo */}
        <div className="flex items-center space-x-4">
          <Button
            onClick={onMenuClick}
            variant="ghost"
            size="icon"
            className="lg:hidden text-muted-foreground hover:bg-hover-muted"
          >
            <Bars3Icon className="size-6" />
          </Button>

          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-sp-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">💰</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">SmartPocket</h1>
              <p className="text-xs text-text-quaternary hidden sm:block">Financial Management</p>
            </div>
          </div>
        </div>

        {/* Right: Notifications + Theme Toggle + Profile */}
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Añadir Transacción - Desktop */}
          <Button
            variant="success"
            className="hidden sm:flex gap-2"
            onClick={() => setTransactionModalOpen(true)}
          >
            <Plus className="size-4" />
            Añadir transacción
          </Button>

          {/* Añadir Transacción - Mobile */}
          <Button
            variant="success"
            size="icon"
            className="flex sm:hidden"
            title="Añadir transacción"
            onClick={() => setTransactionModalOpen(true)}
          >
            <Plus className="size-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:bg-hover-muted relative"
          >
            <BellIcon className="size-6" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></span>
          </Button>

          {/* Theme Toggle */}
          {/* <ThemeToggle /> */}

          {/* <Button variant="ghost" className="text-muted-foreground hover:bg-hover-muted">
            <UserCircleIcon className="size-8" />
            <span className="hidden sm:block text-sm font-medium ml-2">Usuario</span>
          </Button> */}
        </div>
      </div>

      {/* Modal de creación de transacción */}
      {transactionModalOpen && (
        <TransactionFormModal open={transactionModalOpen} onOpenChange={setTransactionModalOpen} />
      )}
    </header>
  );
}
