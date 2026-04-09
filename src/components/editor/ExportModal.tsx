"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, FileImage, FileText, Loader2, Contact } from "lucide-react";
import { useExportCard, useVCard } from "@/hooks/useExport";
import type { ExportFormat } from "@/types";
import { toast } from "sonner";

export function ExportModal({ cardId }: { cardId: string }) {
  const [open, setOpen] = useState(false);
  const { mutate: exportCard, isPending } = useExportCard();
  const { mutate: getVCard, isPending: isVCardPending } = useVCard();

  const handleExport = (format: ExportFormat) => {
    if (!cardId) return;
    exportCard({ cardId, format });
    setOpen(false); // Close modal while toast handles polling
  };

  const handleVCard = () => {
    if (!cardId) return;
    getVCard(cardId, {
      onSuccess: (data) => {
        const blob = new Blob([data.vcard_string], { type: "text/vcard" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "contact.vcf";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("VCard exported!");
        setOpen(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export your card</DialogTitle>
          <DialogDescription>
            Choose a format. PDF is best for printing, PNG for digital sharing.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <Button 
            variant="outline" 
            className="flex flex-col h-32 gap-4"
            disabled={isPending || !cardId}
            onClick={() => handleExport("png")}
          >
            {isPending ? <Loader2 className="w-8 h-8 animate-spin" /> : <FileImage className="w-8 h-8" />}
            <span>High-Q PNG</span>
          </Button>
          <Button 
            variant="outline" 
            className="flex flex-col h-32 gap-4"
            disabled={isPending || !cardId}
            onClick={() => handleExport("pdf")}
          >
            {isPending ? <Loader2 className="w-8 h-8 animate-spin" /> : <FileText className="w-8 h-8" />}
            <span>Print-ready PDF</span>
          </Button>
          <Button 
            variant="outline" 
            className="flex flex-col h-32 gap-4 col-span-2"
            disabled={isVCardPending || !cardId}
            onClick={() => handleVCard()}
          >
            {isVCardPending ? <Loader2 className="w-8 h-8 animate-spin" /> : <Contact className="w-8 h-8" />}
            <span>Export VCard (Contact)</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
