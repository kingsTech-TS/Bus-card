"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { brandKitService } from "@/services/brandkit.service";
import type { BrandKitCreate } from "@/types";

export function useBrandKits() {
  return useQuery({
    queryKey: ["brand-kits"],
    queryFn: brandKitService.getBrandKits,
  });
}

export function useCreateBrandKit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: BrandKitCreate) => brandKitService.createBrandKit(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["brand-kits"] });
      toast.success("Brand Kit created!");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdateBrandKit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BrandKitCreate> }) =>
      brandKitService.updateBrandKit(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["brand-kits"] });
      toast.success("Brand Kit updated!");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteBrandKit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: brandKitService.deleteBrandKit,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["brand-kits"] });
      toast.success("Brand Kit deleted.");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
