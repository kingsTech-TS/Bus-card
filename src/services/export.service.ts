import { api } from "./api";
import type { CardSide, ExportFormat, ExportTask, VCardData } from "@/types";

/** Backend responses are wrapped as `{ status, data }`. */
interface TriggerResponse {
  status: string;
  data: { task_id: string };
}

interface StatusResponse {
  status: "success" | "pending" | "error";
  message?: string;
  data?: {
    task_id?: string;
    status?: string;
    error?: string;
    /** Cloudinary upload result (or a plain URL). */
    url?: string | { secure_url?: string; url?: string };
  };
}

export const exportService = {
  async exportCard(cardId: string, format: ExportFormat, side: CardSide = "front"): Promise<ExportTask> {
    const res = await api.post<TriggerResponse>(`/export/${cardId}`, null, { params: { format, side } });
    return { task_id: res.data.data.task_id, status: "pending" };
  },

  async getExportStatus(taskId: string): Promise<ExportTask> {
    const res = await api.get<StatusResponse>(`/export/status/${taskId}`);
    const body = res.data;
    if (body.status === "pending") return { task_id: taskId, status: "pending" };
    if (body.status === "error" || body.data?.error) {
      return { task_id: taskId, status: "failed", error: body.data?.error ?? body.message ?? "Export failed" };
    }
    const url = body.data?.url;
    const download_url = typeof url === "string" ? url : url?.secure_url ?? url?.url;
    return download_url
      ? { task_id: taskId, status: "done", download_url }
      : { task_id: taskId, status: "failed", error: "Export finished without a file" };
  },

  async getVCard(cardId: string): Promise<VCardData> {
    // The backend returns the raw .vcf text.
    const res = await api.get<string>(`/export/vcard/${cardId}`, { responseType: "text" });
    return { vcard_string: res.data };
  },

  /** Poll export status until done or failed */
  async pollExport(
    taskId: string,
    onUpdate?: (task: ExportTask) => void,
    intervalMs = 2000,
    timeoutMs = 90_000
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
