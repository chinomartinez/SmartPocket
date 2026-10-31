import { useEffect, useState } from "react";
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";
import { ErrorAlert } from "@/components/ErrorAlert";
import {
  useCreditCardOverview,
  useCreditCards,
  useDeleteCreditCard,
} from "@/api/services/credit-cards/useCreditCards";
import type { CreditCardListItemDTO } from "@/api/services/credit-cards/creditCardTypes";
import { CreditCardFormDialog } from "./cards/CreditCardFormDialog";
import { CreditCardActivitySection } from "./activities/CreditCardActivitySection";
import { CreditCardCarousel } from "./cards/CreditCardCarousel";
import { CreditCardHeader } from "./cards/CreditCardHeader";
import { CreditCardsEmptyState } from "./cards/CreditCardsEmptyState";
import { CreditCardsLoadingState } from "./cards/CreditCardsLoadingState";
import { CreditCardStatementList } from "./statements/CreditCardStatementList";
import { SelectedCreditCardOverview } from "./cards/SelectedCreditCardOverview";

export function CreditCardsPage() {
  const { data: creditCards, isLoading, error } = useCreditCards();
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [cardDialogOpen, setCardDialogOpen] = useState(false);
  const [editingCardId, setEditingCardId] = useState<number | null>(null);
  const [cardToDelete, setCardToDelete] = useState<CreditCardListItemDTO | null>(null);
  const deleteCardMutation = useDeleteCreditCard();

  const selectedCard = creditCards?.find((card) => card.id === selectedCardId) ?? creditCards?.[0];
  const overviewQuery = useCreditCardOverview(selectedCard?.id ?? 0);
  const editingCard = creditCards?.find((card) => card.id === editingCardId);

  useEffect(() => {
    if (creditCards?.length && !creditCards.some((card) => card.id === selectedCardId)) {
      setSelectedCardId(creditCards[0].id);
    }
  }, [creditCards, selectedCardId]);

  const openCreateCardDialog = () => {
    setEditingCardId(null);
    setCardDialogOpen(true);
  };

  const openEditCardDialog = () => {
    if (!selectedCard) return;
    setEditingCardId(selectedCard.id);
    setCardDialogOpen(true);
  };

  const openDeleteCardDialog = () => {
    if (!selectedCard) return;
    deleteCardMutation.reset();
    setCardToDelete(selectedCard);
  };

  const closeDeleteCardDialog = () => {
    setCardToDelete(null);
  };

  const handleConfirmDelete = () => {
    if (!cardToDelete) return;

    const remainingCards = creditCards?.filter((card) => card.id !== cardToDelete.id) ?? [];

    deleteCardMutation.mutate(cardToDelete.id, {
      onSuccess: () => {
        if (cardToDelete.id === selectedCard?.id) {
          setSelectedCardId(remainingCards[0]?.id ?? null);
        }
        setCardToDelete(null);
      },
    });
  };

  if (isLoading) return <CreditCardsLoadingState />;
  if (error) return <ErrorAlert error={error} className="m-4" />;

  if (!creditCards?.length) {
    return (
      <div className="space-y-8 pb-8">
        <CreditCardHeader onAdd={openCreateCardDialog} />
        <CreditCardsEmptyState onAdd={openCreateCardDialog} />
        <CreditCardFormDialog
          card={undefined}
          open={cardDialogOpen}
          onOpenChange={setCardDialogOpen}
        />
      </div>
    );
  }

  if (!selectedCard) return null;

  return (
    <div className="space-y-8 pb-8">
      <CreditCardHeader onAdd={openCreateCardDialog} />
      <CreditCardCarousel
        cards={creditCards}
        selectedCardId={selectedCard.id}
        onSelect={setSelectedCardId}
      />
      <SelectedCreditCardOverview
        card={selectedCard}
        overview={overviewQuery.data}
        isLoading={overviewQuery.isLoading}
        error={overviewQuery.error}
        onEdit={openEditCardDialog}
        onDelete={openDeleteCardDialog}
      />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(330px,0.8fr)]">
        <CreditCardActivitySection
          cardId={selectedCard.id}
          cardName={selectedCard.name}
          currencyCode={selectedCard.currencyCode}
        />
        <CreditCardStatementList
          cardId={selectedCard.id}
          currencyCode={selectedCard.currencyCode}
        />
      </div>
      <CreditCardFormDialog
        card={editingCard}
        open={cardDialogOpen}
        onOpenChange={setCardDialogOpen}
      />
      <DeleteConfirmationDialog
        open={Boolean(cardToDelete)}
        onOpenChange={(open) => {
          if (!open) closeDeleteCardDialog();
        }}
        onConfirm={handleConfirmDelete}
        itemName={cardToDelete?.name ?? ""}
        itemType="tarjeta"
        title="¿Eliminar tarjeta?"
        description="Dejará de aparecer junto con sus compras, suscripciones y resúmenes. Si tiene pagos registrados, también se quitarán de tus cuentas y del dashboard. Esta acción no cancela nada ante el banco."
        isDeleting={deleteCardMutation.isPending}
      />
    </div>
  );
}
