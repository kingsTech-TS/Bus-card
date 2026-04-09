import { Template } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CopyPlus, Trash2 } from "lucide-react";
import { useCreateCard } from "@/hooks/useCards";
import { useAuthStore } from "@/store/auth.store";
import { useDeleteTemplate } from "@/hooks/useTemplates";

interface TemplateCardProps {
  template: Template;
}

export function TemplateCard({ template }: TemplateCardProps) {
  const { mutate: createCard, isPending } = useCreateCard();
  const { user } = useAuthStore();
  const { mutate: deleteTemplate, isPending: isDeleting } = useDeleteTemplate();

  const isAdmin = user?.role === "admin";

  const handleUseTemplate = () => {
    createCard({
      title: `${template.title} Copy`,
      design: template.design,
      template_id: template.id
    });
  };

  return (
    <Card className="flex flex-col group rounded-3xl shadow-soft border-0 overflow-hidden">
      <div className="relative aspect-[1.75] bg-muted w-full overflow-hidden shrink-0">
        <div 
          className="w-full h-full"
          style={{ background: template.design?.background || "#ffffff" }}
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 gap-2">
          <Button onClick={handleUseTemplate} disabled={isPending} className="w-full max-w-[140px]">
            <CopyPlus className="w-4 h-4 mr-2" />
            {isPending ? "Creating..." : "Use Template"}
          </Button>
          {isAdmin && (
            <Button 
              variant="destructive" 
              size="sm" 
              className="w-full max-w-[140px]"
              onClick={(e) => {
                e.stopPropagation();
                if(confirm("Delete this template?")) {
                  deleteTemplate(template.id);
                }
              }}
              disabled={isDeleting}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          )}
        </div>
      </div>
      <CardHeader className="py-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{template.title}</CardTitle>
            {template.category && <CardDescription className="mt-1">{template.category}</CardDescription>}
          </div>
        </div>
      </CardHeader>
      <CardFooter className="pt-0 flex flex-wrap gap-1">
        {template.tags?.map(tag => (
          <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
        ))}
      </CardFooter>
    </Card>
  );
}
