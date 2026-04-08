"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, FileImage, FileText, Loader2 } from "lucide-react";
import { useExportCard } from "@/hooks/useExport";
import type { ExportFormat } from "@/types";

export function ExportModal({ cardId }: { cardId: string }) {
  const [open, setOpen] = useState(false);
  const { mutate: exportCard, isPending } = useExportCard();

  const handleExport = (format: ExportFormat) => {
    if (!cardId) return;
    exportCard({ cardId, format });
    setOpen(false); // Close modal while toast handles polling
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* @ts-expect-error React 19 radix typing issue */}
      <DialogTrigger asChild>
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
