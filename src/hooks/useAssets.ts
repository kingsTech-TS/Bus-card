"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { assetService } from "@/services/asset.service";

export function useAssets() {
  return useQuery({
    queryKey: ["assets"],
    queryFn: assetService.getAssets,
    staleTime: 60_000,
  });
}

export function useUploadAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => assetService.uploadAsset(file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assets"] });
      toast.success("Asset uploaded!");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
