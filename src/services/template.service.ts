import { api } from "./api";
import type { Template } from "@/types";

export const templateService = {
  async getTemplates(params?: { category?: string; tag?: string }): Promise<Template[]> {
    const res = await api.get<Template[]>("/templates/", { params });
    return res.data;
  },

  async searchTemplates(q: string): Promise<Template[]> {
    const res = await api.get<Template[]>("/templates/search", { params: { q } });
    return res.data;
  },

  async getTemplate(id: string): Promise<Template> {
    const res = await api.get<Template>(`/templates/${id}`);
    return res.data;
  },

  async createTemplate(data: Omit<Template, "id" | "created_at">): Promise<Template> {
    const res = await api.post<Template>("/templates/create", data);
    return res.data;
  },

  async deleteTemplate(id: string): Promise<void> {
    await api.delete(`/templates/${id}`);
  },
};
