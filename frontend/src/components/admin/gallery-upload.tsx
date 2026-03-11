"use client";

import { useCallback, useState } from "react";
import { Upload, X, Loader2, GripVertical } from "lucide-react";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";

interface GalleryUploadProps {
  urls: string[];
  onChange: (urls: string[]) => void;
  folder: string;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const COMPRESS_MAX_DIMENSION = 2400;
const COMPRESS_QUALITY = 0.82;
const MAX_SIZE = 10 * 1024 * 1024;

function compressImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    if (file.size <= MAX_SIZE) {
      resolve(file);
      return;
    }
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > COMPRESS_MAX_DIMENSION || height > COMPRESS_MAX_DIMENSION) {
        const ratio = Math.min(COMPRESS_MAX_DIMENSION / width, COMPRESS_MAX_DIMENSION / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("No canvas context")); return; }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) { reject(new Error("Compression failed")); return; }
          resolve(new File([blob], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" }));
        },
        "image/jpeg",
        COMPRESS_QUALITY
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Failed to load image")); };
    img.src = url;
  });
}

export function GalleryUpload({ urls, onChange, folder }: GalleryUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(
    async (file: File) => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError("Only JPEG, PNG, and WebP images are allowed.");
        return;
      }
      setError(null);
      setUploading(true);
      try {
        const processed = await compressImage(file);
        if (processed.size > MAX_SIZE) {
          setError("Image still too large after compression.");
          setUploading(false);
          return;
        }
        const timestamp = Date.now();
        const safeName = processed.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const key = `${folder}/gallery/${timestamp}-${safeName}`;
        const { upload_url, public_url } = await api.admin.uploads.getPresignedUrl(key, processed.type);
        const uploadRes = await fetch(upload_url, {
          method: "PUT",
          headers: { "Content-Type": processed.type },
          body: processed,
        });
        if (!uploadRes.ok) throw new Error("Upload to S3 failed");
        onChange([...urls, public_url]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [folder, urls, onChange]
  );

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) uploadFile(files[0]);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = "";
  }

  function removeImage(index: number) {
    onChange(urls.filter((_, i) => i !== index));
  }

  function moveImage(from: number, to: number) {
    if (to < 0 || to >= urls.length) return;
    const newUrls = [...urls];
    const [moved] = newUrls.splice(from, 1);
    newUrls.splice(to, 0, moved);
    onChange(newUrls);
  }

  return (
    <div className="space-y-3">
      {/* Existing images */}
      {urls.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {urls.map((url, i) => (
            <div key={url} className="group relative">
              <img
                src={url}
                alt={`Gallery image ${i + 1}`}
                className="h-28 w-28 rounded-md border object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground shadow-sm hover:bg-destructive/90"
              >
                <X className="h-3 w-3" />
              </button>
              {urls.length > 1 && (
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {i > 0 && (
                    <button
                      type="button"
                      onClick={() => moveImage(i, i - 1)}
                      className="rounded bg-background/80 px-1 py-0.5 text-[10px] font-bold shadow backdrop-blur-sm hover:bg-background"
                    >
                      ‹
                    </button>
                  )}
                  {i < urls.length - 1 && (
                    <button
                      type="button"
                      onClick={() => moveImage(i, i + 1)}
                      className="rounded bg-background/80 px-1 py-0.5 text-[10px] font-bold shadow backdrop-blur-sm hover:bg-background"
                    >
                      ›
                    </button>
                  )}
                </div>
              )}
              <span className="absolute bottom-1 right-1 rounded bg-background/80 px-1.5 py-0.5 text-[10px] font-medium backdrop-blur-sm">
                {i + 1}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Add image button */}
      <label
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "flex h-28 w-28 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed transition-colors",
          dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50",
          uploading && "pointer-events-none opacity-50"
        )}
      >
        {uploading ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : (
          <>
            <Upload className="h-5 w-5 text-muted-foreground" />
            <span className="mt-1 text-[10px] text-muted-foreground">Add image</span>
          </>
        )}
        <input
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          onChange={handleFileInput}
          className="hidden"
          disabled={uploading}
        />
      </label>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
