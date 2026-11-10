"use client";
import { useState } from "react";
import { Contact, Download, FileImage, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DesignPreview } from "@/components/design/DesignPreview";
import { useExportCard, useVCard } from "@/hooks/useExport";
import { useEditorStore } from "@/store/editor.store";
import { hasBackContent } from "@/lib/editor";
import type { CardSide, ExportFormat } from "@/types";

interface ExportModalProps {
  cardId: string;
  /** Save pending edits first so the server exports what the user sees. */
  onBeforeExport?: () => void;
}

export function ExportModal({ cardId, onBeforeExport }: ExportModalProps) {
  const [open, setOpen] = useState(false);
  const design = useEditorStore((s) => s.design);
  const isDirty = useEditorStore((s) => s.isDirty);
  const { mutate: exportCard, isPending } = useExportCard();
  const { mutate: getVCard, isPending: isVCardPending } = useVCard();
  const doubleSided = hasBackContent(design);

  const handleExport = (format: ExportFormat, side: CardSide = "front") => {
    if (!cardId) return;
    if (isDirty) {
      onBeforeExport?.();
      toast.info("Saving your latest changes first — try the export again in a moment.");
      return;
    }
    exportCard({ cardId, format, side });
    setOpen(false);
  };

  const handleVCard = () => {
    getVCard(cardId, {
      onSuccess: (data) => {
        const url = URL.createObjectURL(new Blob([data.vcard_string], { type: "text/vcard" }));
        const a = document.createElement("a");
        a.href = url;
        a.download = "contact.vcf";
        a.click();
        URL.revokeObjectURL(url);
        toast.success("vCard downloaded");
        setOpen(false);
      },
    });
  };

  const option = "flex h-auto flex-col items-start gap-1 whitespace-normal p-3 text-left";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>
        <Download className="size-4" />
        Export
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Export your card</DialogTitle>
          <DialogDescription>
            {doubleSided
              ? "Your card is double-sided. The PDF includes both sides, ready for printing."
              : "PDF is best for printing, PNG for sharing online."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3">
          {(["front", "back"] as CardSide[]).map((side) => (
            <figure key={side} className={side === "back" && !doubleSided ? "opacity-40" : undefined}>
              <div className="overflow-hidden rounded-md shadow ring-1 ring-black/10 dark:ring-white/10">
                <DesignPreview design={design} side={side} />
              </div>
              <figcaption className="mt-1 text-center text-xs text-muted-foreground">
                {side === "front" ? "Front" : doubleSided ? "Back" : "Back (empty)"}
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="grid gap-2">
          <Button variant="outline" className={option} disabled={isPending} onClick={() => handleExport("pdf")}>
            <span className="flex items-center gap-2 font-medium">
              {isPending ? <Loader2 className="animate-spin" /> : <FileText />}
              Print-ready PDF
            </span>
            <span className="text-xs font-normal text-muted-foreground">
              {doubleSided ? "2 pages (front + back) with bleed" : "1 page with bleed"}
            </span>
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className={option} disabled={isPending} onClick={() => handleExport("png", "front")}>
              <span className="flex items-center gap-2 font-medium"><FileImage /> PNG · Front</span>
            </Button>
            <Button variant="outline" className={option} disabled={isPending || !doubleSided} onClick={() => handleExport("png", "back")}>
              <span className="flex items-center gap-2 font-medium"><FileImage /> PNG · Back</span>
            </Button>
          </div>
          <Button variant="ghost" className="justify-start" disabled={isVCardPending} onClick={handleVCard}>
            {isVCardPending ? <Loader2 className="animate-spin" /> : <Contact />}
            Download vCard contact
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
