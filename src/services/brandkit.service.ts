import { api } from "./api";
import type { BrandKit, BrandKitCreate } from "@/types";

export const brandKitService = {
  async getBrandKits(): Promise<BrandKit[]> {
    const res = await api.get<BrandKit[]>("/brand-kits/");
    return res.data;
  },

  async createBrandKit(data: BrandKitCreate): Promise<BrandKit> {
    const res = await api.post<BrandKit>("/brand-kits/", data);
    return res.data;
  },

  async updateBrandKit(id: string, data: Partial<BrandKitCreate>): Promise<BrandKit> {
    const res = await api.put<BrandKit>(`/brand-kits/${id}`, data);
    return res.data;
  },

  async deleteBrandKit(id: string): Promise<void> {
    await api.delete(`/brand-kits/${id}`);
  },
};
