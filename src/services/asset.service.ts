import { api } from "./api";
import type { Asset } from "@/types";

export const assetService = {
  async uploadAsset(file: File): Promise<Asset> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post<Asset>("/assets/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  async getAssets(): Promise<Asset[]> {
    console.warn("Backend missing GET /api/v1/assets/ endpoint. Returning standard mock/empty.");
    // Fallback since swagger didn't document GET /assets/
    return Promise.resolve([]);
  },
};
