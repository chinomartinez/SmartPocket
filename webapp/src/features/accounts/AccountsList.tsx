/**
 * AccountsList Component
 * Vista de listado de cuentas con grid de cards
 */

import { useState } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { AccountCard } from "./AccountCard";
import { AccountCardSkeleton } from "./AccountCardSkeleton";
import { AccountFormModal } from "./AccountFormModal";
import { useAccounts, useDeleteAccount } from "./useAccounts";
import type { AccountGetDTO } from "@/api/services/accounts/accountTypes";

export function AccountsList() {
  const { data: accounts, isLoading, error } = useAccounts();
  const deleteMutation = useDeleteAccount();

  // Estado del modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedAccount, setSelectedAccount] = useState<AccountGetDTO | undefined>();

  // Handlers
  const handleCreateClick = () => {
    setModalMode("create");
    setSelectedAccount(undefined);
    setModalOpen(true);
  };

  const handleEditClick = (account: AccountGetDTO) => {
    setModalMode("edit");
    setSelectedAccount(account);
    setModalOpen(true);
  };

  const handleDeleteClick = async (accountId: number) => {
    try {
      await deleteMutation.mutateAsync(accountId);
      // Toast de éxito se muestra automáticamente
    } catch (error) {
      // Toast de error se muestra automáticamente
    }
  };

  return (
    <>
      {/* Header */}
      <div className="mb-6 md:mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Cuentas</h1>
          <p className="mt-1 text-sm text-slate-400">Gestiona tus cuentas y fondos disponibles</p>
        </div>
        <Button onClick={handleCreateClick} className="flex items-center gap-2">
          <PlusIcon className="h-5 w-5" />
          <span className="hidden sm:inline">Nueva Cuenta</span>
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <div className="glass-card rounded-xl p-6 border border-red-500/20 bg-red-500/10">
          <p className="text-red-400">
            Error al cargar las cuentas. Por favor, intenta nuevamente.
          </p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <AccountCardSkeleton key={idx} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && accounts?.length === 0 && (
        <div className="glass-card rounded-xl p-12 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-sp-blue-500/20 flex items-center justify-center mb-4">
            <PlusIcon className="h-8 w-8 text-sp-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No tienes cuentas</h3>
          <p className="text-slate-400 mb-6">
            Crea tu primera cuenta para comenzar a gestionar tus finanzas
          </p>
          <Button onClick={handleCreateClick} className="mx-auto">
            <PlusIcon className="h-5 w-5 mr-2" />
            Crear primera cuenta
          </Button>
        </div>
      )}

      {/* Accounts Grid */}
      {!isLoading && !error && accounts && accounts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              isDeleting={deleteMutation.isPending}
            />
          ))}
        </div>
      )}

      {/* Modal de crear/editar cuenta */}
      <AccountFormModal
        mode={modalMode}
        account={selectedAccount}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  );
}
