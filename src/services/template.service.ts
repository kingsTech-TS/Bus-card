import { api } from "./api";
import type { DesignSchema, Template, TemplateCreate } from "@/types";

/** Template document as returned by the backend (it uses `name`, not `title`). */
interface RawTemplate {
  id?: string;
  _id?: string;
  name?: string;
  title?: string;
  category?: string;
  tags?: string[];
  design: DesignSchema;
  created_at?: string;
}

function toTemplate(raw: RawTemplate): Template {
  return {
    id: raw.id ?? raw._id ?? "",
    title: raw.name ?? raw.title ?? "Untitled template",
    category: raw.category,
    tags: raw.tags ?? [],
    design: raw.design,
    created_at: raw.created_at,
    source: "custom",
  };
}

export const templateService = {
  async getTemplates(params?: { category?: string; tag?: string }): Promise<Template[]> {
    const res = await api.get<RawTemplate[]>("/templates/", { params });
    return res.data.map(toTemplate);
  },

  async searchTemplates(q: string): Promise<Template[]> {
    const res = await api.get<RawTemplate[]>("/templates/search", { params: { q } });
    return res.data.map(toTemplate);
  },

  async getTemplate(id: string): Promise<Template> {
    const res = await api.get<RawTemplate>(`/templates/${id}`);
    return toTemplate(res.data);
  },

  async createTemplate(data: TemplateCreate): Promise<Template> {
    const res = await api.post<RawTemplate>("/templates/create", {
      name: data.title,
      category: data.category,
      tags: data.tags ?? [],
      design: data.design,
    });
    return toTemplate(res.data);
  },

  async deleteTemplate(id: string): Promise<void> {
    await api.delete(`/templates/${id}`);
  },
};
