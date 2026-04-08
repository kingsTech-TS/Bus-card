import { api } from "./api";
import type { Card, CardCreate, CardUpdate } from "@/types";

export const cardService = {
  async createCard(data: CardCreate): Promise<Card> {
    const res = await api.post<Card>("/cards/create", data);
    return res.data;
  },

  async getCards(): Promise<Card[]> {
    const res = await api.get<Card[]>("/cards/");
    return res.data;
  },

  async getCard(id: string): Promise<Card> {
    const res = await api.get<Card>(`/cards/${id}`);
    return res.data;
  },

  async updateCard(id: string, data: CardUpdate): Promise<Card> {
    const res = await api.put<Card>(`/cards/${id}`, data);
    return res.data;
  },

  async deleteCard(id: string): Promise<void> {
    await api.delete(`/cards/${id}`);
  },
};
