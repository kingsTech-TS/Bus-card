import { Card as CardType } from "@/types";
import { CardThumbnail } from "./CardThumbnail";
import { Skeleton } from "@/components/ui/skeleton";

interface CardGridProps {
  cards?: CardType[];
  isLoading: boolean;
}

export function CardGrid({ cards, isLoading }: CardGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
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

  if (!cards || cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed rounded-xl">
        <h3 className="text-xl font-semibold text-foreground mb-2">No cards yet</h3>
        <p className="text-muted-foreground max-w-sm">Create your first business card by clicking the button above or picking a template.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {cards.map((card) => (
        <CardThumbnail key={card.id} card={card} />
      ))}
    </div>
  );
}
