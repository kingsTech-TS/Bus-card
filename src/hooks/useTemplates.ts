"use client";
import { useQuery } from "@tanstack/react-query";
import { templateService } from "@/services/template.service";

export function useTemplates(params?: { category?: string; tag?: string }) {
  return useQuery({
    queryKey: ["templates", params],
    queryFn: () => templateService.getTemplates(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSearchTemplates(q: string) {
  return useQuery({
    queryKey: ["templates", "search", q],
    queryFn: () => templateService.searchTemplates(q),
    enabled: q.length > 1,
    staleTime: 60_000,
  });
}

export function useTemplate(id: string) {
  return useQuery({
    queryKey: ["templates", id],
    queryFn: () => templateService.getTemplate(id),
    enabled: !!id,
  });
}
