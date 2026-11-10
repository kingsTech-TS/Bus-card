import { api } from "./api";
import type { AISuggestRequest, AITaglineRequest, AIImproveTextRequest, AIDesignSuggestion, DesignSchema } from "@/types";

/** The backend wraps every AI response as `{ status, data }`. */
interface Envelope<T> {
  status: string;
  data: T;
}

interface RawSuggestion {
  error?: string;
  suggestion?: {
    layout_name?: string;
    palette?: string[];
    design_data?: DesignSchema;
  };
}

export const aiService = {
  async suggestDesign(data: AISuggestRequest): Promise<AIDesignSuggestion> {
    const res = await api.post<Envelope<RawSuggestion>>("/ai/suggest", { style: "modern", ...data });
    const raw = res.data.data;
    const design = raw?.suggestion?.design_data;
    if (raw?.error || !design) throw new Error(raw?.error ?? "The AI did not return a design");
    return { design, description: raw.suggestion?.layout_name };
  },

  async generateTagline(data: AITaglineRequest): Promise<{ tagline: string }> {
    const res = await api.post<Envelope<{ tagline: string }>>("/ai/tagline", {
      business_name: data.name,
      industry: data.industry,
      description: data.description ?? "",
    });
    const tagline = res.data.data?.tagline?.trim().replace(/^["']|["']$/g, "");
    if (!tagline) throw new Error("The AI did not return a tagline");
    return { tagline };
  },

  async improveText(data: AIImproveTextRequest): Promise<{ improved_text: string }> {
    const res = await api.post<Envelope<{ text: string }>>("/ai/improve-text", data);
    return { improved_text: res.data.data?.text ?? data.text };
  },
};
