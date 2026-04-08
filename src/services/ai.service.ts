import { api } from "./api";
import type { AISuggestRequest, AITaglineRequest, AIImproveTextRequest, AIDesignSuggestion } from "@/types";

export const aiService = {
  async suggestDesign(data: AISuggestRequest): Promise<AIDesignSuggestion> {
    const res = await api.post<AIDesignSuggestion>("/ai/suggest", data);
    return res.data;
  },

  async generateTagline(data: AITaglineRequest): Promise<{ taglines: string[] }> {
    const res = await api.post<{ taglines: string[] }>("/ai/tagline", data);
    return res.data;
  },

  async improveText(data: AIImproveTextRequest): Promise<{ improved_text: string }> {
    const res = await api.post<{ improved_text: string }>("/ai/improve-text", data);
    return res.data;
  },
};
