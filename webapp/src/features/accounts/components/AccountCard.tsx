/**
 * AccountCard Component
 * Card individual para mostrar una cuenta
 */

import { useState } from "react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatCurrency } from "@/utils/formatters";
import { getIconSymbol } from "../utils/iconHelpers";
import type { AccountGetDTO } from "@/api/services/accounts/accountTypes";

interface AccountCardProps {
  account: AccountGetDTO;
  onEdit?: (account: AccountGetDTO) => void;
  onDelete?: (accountId: number) => void;
  isDeleting?: boolean;
}

export function AccountCard({ account, onEdit, onDelete, isDeleting }: AccountCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { name, icon, currency, balance } = account;

  // Obtener símbolo del icono (maneja legacy y fallback)
  const iconSymbol = getIconSymbol(icon.code);

  // Formatear balance con símbolo de moneda
  const formattedBalance = formatCurrency(balance, currency.symbol);

  // Determinar color del balance (positivo/negativo)
  const balanceColor = balance >= 0 ? "text-emerald-400" : "text-red-400";

  return (
    <Card className="glass-card glass-card-hover group overflow-hidden">
      <div className="p-6">
        {/* Header: Icono + Nombre */}
        <div className="flex items-start gap-4 mb-6">
          {/* Icono con color */}
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-transform duration-300 group-hover:scale-110"
            style={{
              backgroundColor: `${icon.colorHex}20`,
              color: icon.colorHex,
            }}
          >
            {iconSymbol}
          </div>

          {/* Nombre de la cuenta */}
          <div className="flex-1 min-w-0">
            <h3
              onClick={() => onEdit?.(account)}
              className="text-lg font-semibold text-white truncate cursor-pointer hover:text-sp-blue-300 transition-colors duration-200"
            >
              {name}
            </h3>
            <p className="text-sm text-slate-400">{currency.name}</p>
          </div>
        </div>

        {/* Balance */}
        <div className="space-y-1">
          <p className="text-xs text-slate-400 uppercase tracking-wider">Saldo disponible</p>
          <p
            className={`text-2xl font-bold ${balanceColor} transition-all duration-300 group-hover:scale-105`}
          >
            {formattedBalance}
          </p>
        </div>

        {/* Footer: Moneda code + Botones de acción */}
        <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center justify-between">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-700/50 text-slate-300">
            {currency.code}
          </span>
          <div className="flex items-center gap-2">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(account)}
                className="h-9 w-9 p-0 border-sp-blue-500/30 bg-sp-blue-500/10 hover:bg-sp-blue-500/20 hover:border-sp-blue-400/50 text-sp-blue-300 hover:text-sp-blue-200 transition-all duration-200"
              >
                <PencilIcon className="h-5 w-5" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteDialog(true);
                }}
                disabled={isDeleting}
                className="h-9 w-9 p-0 border-red-500/30 bg-red-500/10 hover:bg-red-500/20 hover:border-red-400/50 text-red-300 hover:text-red-200 transition-all duration-200"
              >
                <TrashIcon className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cuenta?</AlertDialogTitle>
            <AlertDialogDescription>
              Estás a punto de eliminar la cuenta <strong>{name}</strong>. Esta acción no se puede
              deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete?.(account.id);
                setShowDeleteDialog(false);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
