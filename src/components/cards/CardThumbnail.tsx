import { Card as CardType } from "@/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Copy, Edit2, MoreVertical, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDeleteCard } from "@/hooks/useCards";

interface CardThumbnailProps {
  card: CardType;
}

export function CardThumbnail({ card }: CardThumbnailProps) {
  const router = useRouter();
  const { mutate: deleteCard } = useDeleteCard();

  return (
    <Card className="group flex flex-col rounded-3xl shadow-soft border-0 overflow-hidden">
      <Link href={`/cards/${card.id}`} className="block relative aspect-[1.75] bg-muted w-full flex-1 overflow-hidden">
        {/* Placeholder for actual canvas render */}
        <div 
          className="w-full h-full"
          style={{ 
            background: card.design?.background || card.design?.brand_kit?.colors?.[0] || "#ffffff" 
          }}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
          <Button variant="secondary" className="opacity-0 group-hover:opacity-100 transition-opacity">
            <Edit2 className="w-4 h-4 mr-2" />
            Edit Design
          </Button>
        </div>
      </Link>
      <CardFooter className="p-4 flex items-center justify-between bg-card text-card-foreground">
        <div className="overflow-hidden">
          <h3 className="font-semibold truncate">{card.title}</h3>
          <p className="text-xs text-muted-foreground mt-1">Edited {new Date(card.updated_at).toLocaleDateString()}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-muted-foreground hover:text-foreground">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push(`/cards/${card.id}`)}>
                <Edit2 className="w-4 h-4 mr-2" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem disabled>
              <Copy className="w-4 h-4 mr-2" /> Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-destructive focus:bg-destructive/10"
              onClick={() => {
                if(confirm("Are you sure you want to delete this card?")) {
                  deleteCard(card.id);
                }
              }}
            >
              <Trash className="w-4 h-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
}
