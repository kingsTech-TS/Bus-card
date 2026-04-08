"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cardService } from "@/services/card.service";
import type { CardCreate, CardUpdate } from "@/types";

export function useCards() {
  return useQuery({
    queryKey: ["cards"],
    queryFn: cardService.getCards,
    staleTime: 30_000,
  });
}

export function useCard(id: string) {
  return useQuery({
    queryKey: ["cards", id],
    queryFn: () => cardService.getCard(id),
    enabled: !!id,
    staleTime: 60_000,
  });
}

export function useCreateCard() {
  const qc = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: (data: CardCreate) => cardService.createCard(data),
    onSuccess: (card) => {
      qc.invalidateQueries({ queryKey: ["cards"] });
      toast.success("Card created!");
      router.push(`/cards/${card.id}`);
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdateCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CardUpdate }) =>
      cardService.updateCard(id, data),
    onSuccess: (card) => {
      qc.setQueryData(["cards", card.id], card);
      qc.invalidateQueries({ queryKey: ["cards"] });
    },
    onError: (err: Error) => toast.error(`Autosave failed: ${err.message}`),
  });
}

export function useDeleteCard() {
  const qc = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: (id: string) => cardService.deleteCard(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cards"] });
      toast.success("Card deleted.");
      router.push("/cards");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
