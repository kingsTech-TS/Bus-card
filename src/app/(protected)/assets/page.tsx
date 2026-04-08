"use client";
import { PageHeader } from "@/components/layout/PageHeader";
import { useUploadAsset, useAssets } from "@/hooks/useAssets";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, Image as ImageIcon, Loader2 } from "lucide-react";
import { useRef } from "react";

export default function AssetsPage() {
  const { data: assets, isLoading } = useAssets();
  const { mutate: uploadAsset, isPending: uploading } = useUploadAsset();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadAsset(file);
    }
  };

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500">
      <PageHeader 
        title="Asset Library" 
        description="Upload and manage logos, background images, and brand assets."
      >
        <Button onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UploadCloud className="w-4 h-4 mr-2" />}
          Upload Asset
        </Button>
        <input 
          type="file" 
          ref={fileRef} 
          className="hidden" 
          accept="image/*"
          onChange={handleUpload} 
        />
      </PageHeader>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
           {[...Array(5)].map((_, i) => (
             <div key={i} className="aspect-square bg-muted rounded-xl animate-pulse" />
           ))}
        </div>
      ) : assets?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed rounded-xl bg-muted/20">
          <UploadCloud className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No assets yet</h3>
          <p className="text-muted-foreground max-w-sm mb-6">Upload images to use them directly inside the card editor.</p>
          <Button variant="outline" onClick={() => fileRef.current?.click()}>Select File</Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {assets?.map((asset: any) => (
            <Card key={asset.id} className="overflow-hidden group">
              <div className="aspect-square bg-muted relative">
                {/* Fallback rendering */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/5">
                  {asset.mimetype?.startsWith('image') ? (
                    <img src={asset.url} alt={asset.filename} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button variant="secondary" size="sm" onClick={() => navigator.clipboard.writeText(asset.url)}>
                    Copy URL
                  </Button>
                </div>
              </div>
              <CardContent className="p-3">
                <p className="text-xs truncate font-medium">{asset.filename}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{(asset.size / 1024).toFixed(1)} KB</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
