import { Template } from "@/types";
import { TemplateCard } from "./TemplateCard";
import { Skeleton } from "@/components/ui/skeleton";

interface TemplateGridProps {
  templates?: Template[];
  isLoading: boolean;
}

export function TemplateGrid({ templates, isLoading }: TemplateGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex flex-col space-y-3">
            <Skeleton className="h-[200px] w-full rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!templates || templates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed rounded-xl">
        <h3 className="text-xl font-semibold mb-2">No templates found</h3>
        <p className="text-muted-foreground max-w-sm">Try adjusting your search query or filters.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {templates.map((template) => (
        <TemplateCard key={template.id} template={template} />
      ))}
    </div>
  );
}
