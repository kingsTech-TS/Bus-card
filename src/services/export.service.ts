import { api } from "./api";
import type { ExportFormat, ExportTask, VCardData } from "@/types";

export const exportService = {
  async exportCard(cardId: string, format: ExportFormat): Promise<ExportTask> {
    const res = await api.post<ExportTask>(`/export/${cardId}`, null, {
      params: { format },
    });
    return res.data;
  },

  async getExportStatus(taskId: string): Promise<ExportTask> {
    const res = await api.get<ExportTask>(`/export/status/${taskId}`);
    return res.data;
  },

  async getVCard(cardId: string): Promise<VCardData> {
    const res = await api.get<VCardData>(`/export/vcard/${cardId}`);
    return res.data;
  },

  /** Poll export status until done or failed */
  async pollExport(
    taskId: string,
    onUpdate?: (task: ExportTask) => void,
    intervalMs = 2000,
    timeoutMs = 60_000
  ): Promise<ExportTask> {
    const start = Date.now();
    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          const task = await exportService.getExportStatus(taskId);
          onUpdate?.(task);
          if (task.status === "done") return resolve(task);
          if (task.status === "failed") return reject(new Error(task.error ?? "Export failed"));
          if (Date.now() - start > timeoutMs) return reject(new Error("Export timed out"));
          setTimeout(poll, intervalMs);
        } catch (e) {
          reject(e);
        }
      };
      poll();
    });
  },
};
