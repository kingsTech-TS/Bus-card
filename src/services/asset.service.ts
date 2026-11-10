import { api } from "./api";
import type { Asset } from "@/types";

/** Raw asset document as returned by the FastAPI backend (Beanie may emit `_id`). */
interface RawAsset {
  id?: string;
  _id?: string;
  url: string;
  filename?: string;
  format?: string;
  resource_type?: string;
  bytes?: number;
  owner_id: string;
  created_at: string;
}

interface Envelope<T> {
  status: string;
  data: T;
}

function toAsset(raw: RawAsset): Asset {
  return {
    id: raw.id ?? raw._id ?? raw.url,
    url: raw.url,
    filename: raw.filename || "Untitled",
    mimetype: raw.format ? `${raw.resource_type ?? "image"}/${raw.format}` : "image",
    size: raw.bytes ?? 0,
    owner_id: raw.owner_id,
    created_at: raw.created_at,
  };
}

export const assetService = {
  async uploadAsset(file: File): Promise<Asset> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post<Envelope<RawAsset>>("/assets/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return toAsset(res.data.data);
  },

  async getAssets(): Promise<Asset[]> {
    const res = await api.get<Envelope<RawAsset[]>>("/assets/");
    return (res.data.data ?? [])
      .map(toAsset)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  },

  async deleteAsset(id: string): Promise<void> {
    await api.delete(`/assets/${id}`);
  },
};
