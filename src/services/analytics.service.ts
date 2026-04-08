import { api } from "./api";
import type { CardAnalytics } from "@/types";

export const analyticsService = {
  async getCardAnalytics(cardId: string): Promise<CardAnalytics> {
    const res = await api.get<CardAnalytics>(`/analytics/${cardId}`);
    return res.data;
  },
};
