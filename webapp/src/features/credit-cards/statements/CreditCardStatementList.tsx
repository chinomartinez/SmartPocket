import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { ErrorAlert } from "@/components/ErrorAlert";
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";
import { Button } from "@/components/ui/button";
import {
  useCreditCardStatements,
  useDeleteCreditCardStatement,
} from "@/api/services/credit-cards/useCreditCards";
import type { CreditCardStatementListItemDTO } from "@/api/services/credit-cards/creditCardTypes";
import { CreditCardStatementFormDialog } from "./CreditCardStatementFormDialog";
import { CreditCardStatementItem } from "./CreditCardStatementItem";

const PAGE_SIZE = 3;

interface CreditCardStatementListProps {
  cardId: number;
  currencyCode: string;
}

export function CreditCardStatementList({ cardId, currencyCode }: CreditCardStatementListProps) {
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [statementToEdit, setStatementToEdit] = useState<CreditCardStatementListItemDTO>();
  const [statementToDelete, setStatementToDelete] = useState<CreditCardStatementListItemDTO>();
  const statementsQuery = useCreditCardStatements({
    creditCardId: cardId,
    page,
    pageSize: PAGE_SIZE,
  });
  const deleteMutation = useDeleteCreditCardStatement();
  const statements = statementsQuery.data?.data ?? [];
  const totalPages = Math.max(1, Math.ceil((statementsQuery.data?.totalCount ?? 0) / PAGE_SIZE));

  const handleOpenCreate = () => {
    setStatementToEdit(undefined);
    setFormOpen(true);
  };

  const handleOpenEdit = (statement: CreditCardStatementListItemDTO) => {
    setStatementToEdit(statement);
    setFormOpen(true);
  };

  const handleRequestDelete = (statement: CreditCardStatementListItemDTO) => {
    setStatementToDelete(statement);
  };

  const handleFormOpenChange = (open: boolean) => {
    setFormOpen(open);
    if (!open) setStatementToEdit(undefined);
  };

  const handleDeleteOpenChange = (open: boolean) => {
    if (!open) setStatementToDelete(undefined);
  };

  const handleConfirmDelete = () => {
    if (!statementToDelete) return;
    deleteMutation.mutate(
      { id: statementToDelete.id, creditCardId: cardId },
      { onSuccess: handleDeleteSuccess },
    );
  };

  const handleDeleteSuccess = () => {
    setStatementToDelete(undefined);
  };

  const handlePreviousPage = () => setPage((currentPage) => Math.max(1, currentPage - 1));
  const handleNextPage = () => setPage((currentPage) => Math.min(totalPages, currentPage + 1));

  return (
    <section className="space-y-4" aria-labelledby="statements-title">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 id="statements-title" className="text-xl font-semibold text-foreground">
            Resúmenes
          </h2>
          <p className="mt-1 text-sm text-text-quaternary">Cierres registrados de la tarjeta</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleOpenCreate}>
          <Plus className="size-4" /> Nuevo resumen
        </Button>
      </div>
      <div className="rounded-xl border border-border-subtle bg-surface-container-low/40 p-2">
        {statementsQuery.isLoading ? (
          <div className="space-y-2 p-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-28 animate-pulse rounded-lg bg-hover-muted" />
            ))}
          </div>
        ) : statementsQuery.error ? (
          <ErrorAlert error={statementsQuery.error} className="m-2" />
        ) : statements.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <p className="text-sm font-medium text-foreground">Todavía no hay resúmenes</p>
            <p className="mt-1 text-xs text-text-quaternary">
              Armá el primero con las cuotas y cargos registrados.
            </p>
            <Button variant="outline" size="sm" className="mt-4" onClick={handleOpenCreate}>
              <Plus className="size-4" /> Armar resumen
            </Button>
          </div>
        ) : (
          <>
            {statements.map((statement) => (
              <CreditCardStatementItem
                key={statement.id}
                statement={statement}
                currencyCode={currencyCode}
                onOpen={handleOpenEdit}
                onDelete={handleRequestDelete}
              />
            ))}
            <div className="flex items-center justify-between border-t border-border-subtle/60 px-2 pt-3 text-xs text-text-quaternary">
              <span>
                Página {page} de {totalPages}
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  aria-label="Página anterior de resúmenes"
                  disabled={page <= 1 || statementsQuery.isFetching}
                  onClick={handlePreviousPage}
                  className="rounded-md p-1.5 hover:bg-hover-muted disabled:pointer-events-none disabled:opacity-40"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  type="button"
                  aria-label="Página siguiente de resúmenes"
                  disabled={page >= totalPages || statementsQuery.isFetching}
                  onClick={handleNextPage}
                  className="rounded-md p-1.5 hover:bg-hover-muted disabled:pointer-events-none disabled:opacity-40"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      <CreditCardStatementFormDialog
        cardId={cardId}
        currencyCode={currencyCode}
        statement={statementToEdit}
        open={formOpen}
        onOpenChange={handleFormOpenChange}
      />
      <DeleteConfirmationDialog
        open={Boolean(statementToDelete)}
        onOpenChange={handleDeleteOpenChange}
        onConfirm={handleConfirmDelete}
        itemName={statementToDelete?.description ?? ""}
        itemType="resumen"
        title="¿Eliminar resumen?"
        description="Las cuotas volverán a estar disponibles y los cargos de suscripción de este resumen se eliminarán de SmartPocket."
        isDeleting={deleteMutation.isPending}
      />
    </section>
  );
}
