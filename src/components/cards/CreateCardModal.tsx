"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateCard } from "@/hooks/useCards";
import { Plus } from "lucide-react";

export function CreateCardModal() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const { mutate: createCard, isPending } = useCreateCard();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    createCard(
      {
        title,
        design: {
          width: 1050, // Standard 3.5" x 2" at 300 DPI
          height: 600,
          background: "#ffffff",
          elements: []
        }
      },
      {
        onSuccess: () => {
          setOpen(false);
          setTitle("");
        }
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* @ts-expect-error React 19 radix typing issue */}
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Card
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Business Card</DialogTitle>
          <DialogDescription>Give your new card a title. You can change this later.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreate} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Card Title</Label>
            <Input 
              id="title" 
              placeholder="e.g. Acme Corp Sales Rep" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending || !title.trim()}>
              {isPending ? "Creating..." : "Create Blank Card"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
