"use client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { aiService } from "@/services/ai.service";
import type { AISuggestRequest, AITaglineRequest, AIImproveTextRequest } from "@/types";

export function useSuggestDesign() {
  return useMutation({
    mutationFn: (data: AISuggestRequest) => aiService.suggestDesign(data),
    onError: (err: Error) => toast.error(`AI error: ${err.message}`),
  });
}

export function useGenerateTagline() {
  return useMutation({
    mutationFn: (data: AITaglineRequest) => aiService.generateTagline(data),
    onError: (err: Error) => toast.error(`AI error: ${err.message}`),
  });
}

export function useImproveText() {
  return useMutation({
    mutationFn: (data: AIImproveTextRequest) => aiService.improveText(data),
    onError: (err: Error) => toast.error(`AI error: ${err.message}`),
  });
}
