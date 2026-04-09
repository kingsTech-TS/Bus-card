"use client";
import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UploadCloud, Image as ImageIcon, Loader2, Search } from "lucide-react";
import { useAssets, useUploadAsset } from "@/hooks/useAssets";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

interface AssetPickerProps {
  onSelect: (url: string) => void;
  trigger?: React.ReactElement;
}

export function AssetPicker({ onSelect, trigger }: AssetPickerProps) {
  const [open, setOpen] = useState(false);
  const { data: assets, isLoading } = useAssets();
  const { mutate: uploadAsset, isPending: uploading } = useUploadAsset();
  const [search, setSearch] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const filteredAssets = assets?.filter(a => a.filename.toLowerCase().includes(search.toLowerCase()));

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadAsset(file, {
        onSuccess: (newAsset) => {
          onSelect(newAsset.url);
          setOpen(false);
        }
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger || <Button variant="outline" />}>
        {trigger ? null : "Select Asset"}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl h-[80vh] flex flex-col p-0 overflow-hidden rounded-[2rem]">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Asset Library</DialogTitle>
          <DialogDescription>
            Choose an image or upload a new one.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-4 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search assets..." 
              className="pl-9 rounded-xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button onClick={() => fileRef.current?.click()} disabled={uploading} className="rounded-xl">
            {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UploadCloud className="w-4 h-4 mr-2" />}
            Upload
          </Button>
          <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleUpload} />
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {isLoading ? (
            <div className="grid grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => <Skeleton key={i} className="aspect-square rounded-xl" />)}
            </div>
          ) : filteredAssets?.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <ImageIcon className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">No assets found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
              {filteredAssets?.map((asset) => (
                <button
                  key={asset.id}
                  onClick={() => {
                    onSelect(asset.url);
                    setOpen(false);
                  }}
                  className="group relative aspect-square rounded-xl overflow-hidden border bg-muted/30 hover:border-primary transition-all"
                >
                  <img src={asset.url} alt={asset.filename} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-[10px] text-white font-medium bg-black/50 px-2 py-1 rounded-full">Select</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
