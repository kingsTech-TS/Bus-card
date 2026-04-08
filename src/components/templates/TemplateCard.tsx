import { Template } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CopyPlus } from "lucide-react";
import { useCreateCard } from "@/hooks/useCards";

interface TemplateCardProps {
  template: Template;
}

export function TemplateCard({ template }: TemplateCardProps) {
  const { mutate: createCard, isPending } = useCreateCard();

  const handleUseTemplate = () => {
    createCard({
      title: `${template.title} Copy`,
      design: template.design,
      template_id: template.id
    });
  };

  return (
    <Card className="flex flex-col group overflow-hidden">
      <div className="relative aspect-[1.75] bg-muted w-full overflow-hidden flex-shrink-0">
        <div 
          className="w-full h-full"
          style={{ background: template.design?.background || "#ffffff" }}
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4">
          <Button onClick={handleUseTemplate} disabled={isPending}>
            <CopyPlus className="w-4 h-4 mr-2" />
            {isPending ? "Creating..." : "Use Template"}
          </Button>
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
