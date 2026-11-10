"use client";
import { CopyPlus, Eye, Loader2, Trash2 } from "lucide-react";
import type { Template } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DesignPreview } from "@/components/design/DesignPreview";
import { useAuthStore } from "@/store/auth.store";
import { useDeleteTemplate } from "@/hooks/useTemplates";

interface TemplateCardProps {
  template: Template;
  onPreview: (t: Template) => void;
  onUse: (t: Template) => void;
  isCreating: boolean;
}

export function TemplateCard({ template, onPreview, onUse, isCreating }: TemplateCardProps) {
  const isAdmin = useAuthStore((s) => s.user?.role === "admin");
  const { mutate: deleteTemplate, isPending: isDeleting } = useDeleteTemplate();
  const isCustom = template.source === "custom";

  return (
    <div className="group flex flex-col gap-3">
      <div className="relative overflow-hidden rounded-2xl shadow-soft ring-1 ring-black/5 transition-shadow group-hover:shadow-lg dark:ring-white/10">
        <button
          type="button"
          onClick={() => onPreview(template)}
          className="block w-full text-left"
          aria-label={`Preview ${template.title}`}
        >
          <DesignPreview design={template.design} />
        </button>

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 bg-black/45 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
          <Button size="sm" className="pointer-events-auto" onClick={() => onUse(template)} disabled={isCreating}>
            {isCreating ? <Loader2 className="animate-spin" /> : <CopyPlus />}
            Use template
          </Button>
          <Button size="sm" variant="secondary" className="pointer-events-auto" onClick={() => onPreview(template)}>
            <Eye />
            Preview
          </Button>
        </div>

        {isCustom && (
          <Badge className="absolute left-3 top-3" variant="secondary">Custom</Badge>
        )}
        {isCustom && isAdmin && (
          <Button
            size="icon-sm"
            variant="destructive"
            className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100"
            title="Delete template"
            disabled={isDeleting}
            onClick={() => {
              if (confirm(`Delete the template “${template.title}”?`)) deleteTemplate(template.id);
            }}
          >
            {isDeleting ? <Loader2 className="animate-spin" /> : <Trash2 />}
          </Button>
        )}
      </div>

      <div className="flex items-start justify-between gap-2 px-1">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold">{template.title}</h3>
          {template.category && <p className="text-xs text-muted-foreground">{template.category}</p>}
        </div>
      </div>
    </div>
  );
}
