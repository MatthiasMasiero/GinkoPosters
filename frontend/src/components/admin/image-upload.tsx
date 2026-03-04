"use client";

import { useCallback, useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  onUpload: (url: string) => void;
  currentUrl?: string | null;
  folder: string;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export function ImageUpload({ onUpload, currentUrl, folder }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(
    async (file: File) => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError("Only JPEG, PNG, and WebP images are allowed.");
        return;
      }
      if (file.size > MAX_SIZE) {
        setError("File must be smaller than 10 MB.");
        return;
      }

      setError(null);
      setUploading(true);

      try {
        const timestamp = Date.now();
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const key = `${folder}/${timestamp}-${safeName}`;

        const { upload_url, public_url } =
          await api.admin.uploads.getPresignedUrl(key, file.type);

        const uploadRes = await fetch(upload_url, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });

        if (!uploadRes.ok) {
          throw new Error("Upload to S3 failed");
        }

        setPreview(public_url);
        onUpload(public_url);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Upload failed"
        );
      } finally {
        setUploading(false);
      }
    },
    [folder, onUpload]
  );

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  }

  function handleRemove() {
    setPreview(null);
    onUpload("");
  }

  return (
    <div className="space-y-2">
      {preview ? (
        <div className="relative inline-block">
          <img
            src={preview}
            alt="Preview"
            className="h-40 w-40 rounded-md border object-cover"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground shadow-sm hover:bg-destructive/90"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={cn(
            "flex h-40 w-40 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed transition-colors",
            dragOver
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/50",
            uploading && "pointer-events-none opacity-50"
          )}
        >
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          ) : (
            <>
              <Upload className="h-6 w-6 text-muted-foreground" />
              <span className="mt-2 text-xs text-muted-foreground">
                Drop image or click
              </span>
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
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
