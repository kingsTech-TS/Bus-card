"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminService } from "@/services/admin.service";

export function useAdminUsers() {
  return useQuery({
    queryKey: ["admin", "users"],
    queryFn: adminService.getUsers,
  });
}

export function usePromoteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminService.promoteUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("User promoted to admin.");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: adminService.getStats,
  });
}

export function useActivityLogs() {
  return useQuery({
    queryKey: ["admin", "activity"],
    queryFn: adminService.getActivityLogs,
  });
}
