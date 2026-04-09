import { api } from "./api";
import type { AdminUser, ActivityLog, AdminStats } from "@/types";

export const adminService = {
  async getUsers(): Promise<AdminUser[]> {
    const res = await api.get<AdminUser[]>("/admin/users");
    return res.data;
  },

  async promoteUser(userId: string): Promise<void> {
    await api.post("/admin/promote", { user_id: userId });
  },

  async getStats(): Promise<AdminStats> {
    const res = await api.get<AdminStats>("/admin/stats");
    return res.data;
  },

  async getActivityLogs(): Promise<ActivityLog[]> {
    const res = await api.get<ActivityLog[]>("/admin/activity");
    return res.data;
  },

  async getAdminAnalytics(): Promise<unknown> {
    const res = await api.get("/admin/analytics");
    return res.data;
  },

  async clearCache(): Promise<void> {
    await api.post("/admin/maintenance/clear-cache");
  },
};
