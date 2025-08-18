import React, { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { UploadCloud, ImageIcon } from "lucide-react";
import { classifyImageFromDataURL, type ClassificationResult } from "@/services/wasteClassifier";

interface GarbageUploaderProps {
  onClassified: (result: ClassificationResult, file: File, previewUrl: string) => void;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export const GarbageUploader: React.FC<GarbageUploaderProps> = ({ onClassified }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const onSelectFile = async (file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast({ title: "Unsupported file", description: "Please upload a JPG, PNG or WEBP image.", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const url = String(reader.result);
      setPreviewUrl(url);
      setIsLoading(true);
      try {
        const result = await classifyImageFromDataURL(url);
        onClassified(result, file, url);
        toast({ title: "Identified", description: `${result.category} (${(result.score * 100).toFixed(0)}% confidence)` });
      } catch (e) {
        console.error(e);
        toast({ title: "Classification failed", description: "Please try another photo.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onSelectFile(file);
  }, []);

  const openFilePicker = () => inputRef.current?.click();

  return (
    <section aria-label="Upload recyclables" className="w-full">
      <Card className="p-6 md:p-8 glass-panel shadow-elegant">
        <div
          onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragOver={(e) => { e.preventDefault(); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
          onDrop={handleDrop}
          className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 md:p-12 transition-smooth ${isDragging ? "border-ring bg-secondary" : "border-border"}`}
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Uploaded recyclable preview"
              loading="lazy"
              className="max-h-72 w-full object-contain rounded-md"
            />
          ) : (
            <div className="flex flex-col items-center text-center gap-3 py-6">
              <div className="rounded-full h-14 w-14 grid place-items-center bg-secondary">
                <ImageIcon className="text-foreground/70" />
              </div>
              <h3 className="text-xl font-semibold">Drag & drop a photo</h3>
              <p className="text-muted-foreground">Newspaper, glass bottle, plastic, steel, etc.</p>
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onSelectFile(f);
            }}
          />

          <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
            <Button variant="hero" onClick={openFilePicker} disabled={isLoading}>
              <UploadCloud /> {isLoading ? "Identifying..." : previewUrl ? "Try another photo" : "Upload a photo"}
            </Button>
            <span className="text-sm text-muted-foreground">or drop it here</span>
          </div>
        </div>
      </Card>
    </section>
  );
};

export default GarbageUploader;
