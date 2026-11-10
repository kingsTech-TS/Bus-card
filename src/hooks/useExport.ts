"use client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { exportService } from "@/services/export.service";
import type { CardSide, ExportFormat } from "@/types";

export function useExportCard() {
  return useMutation({
    mutationFn: ({ cardId, format, side }: { cardId: string; format: ExportFormat; side?: CardSide }) =>
      exportService.exportCard(cardId, format, side),
    onSuccess: async (task) => {
      const id = toast.loading("Preparing your export…");
      try {
        const completedTask = await exportService.pollExport(task.task_id);
        if (completedTask.download_url) {
          window.open(completedTask.download_url, "_blank");
          toast.success("Export ready!", { id });
        }
      } catch (err) {
        toast.error(`Export failed: ${err instanceof Error ? err.message : String(err)}`, { id });
      }
    },
    onError: (err: Error) => toast.error(`Export request failed: ${err.message}`),
  });
}

export function useExportStatus(taskId: string) {
  return useQuery({
    queryKey: ["export", taskId],
    queryFn: () => exportService.getExportStatus(taskId),
    enabled: !!taskId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "pending" || status === "processing" ? 2000 : false;
    },
  });
}

export function useVCard() {
  return useMutation({
    mutationFn: exportService.getVCard,
    onError: (err: Error) => toast.error(err.message),
  });
}
