"use client";

import { useCallback, useRef, useState } from "react";
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
  const [uploadingCount, setUploadingCount] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Drag-to-reorder state
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  // Keep a ref to urls so concurrent uploads always append to the latest list
  const urlsRef = useRef(urls);
  urlsRef.current = urls;

  const uploadFile = useCallback(
    async (file: File): Promise<string | null> => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError("Only JPEG, PNG, and WebP images are allowed.");
        return null;
      }
      try {
        const processed = await compressImage(file);
        if (processed.size > MAX_SIZE) {
          setError("Image still too large after compression.");
          return null;
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
        return public_url;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
        return null;
      }
    },
    [folder]
  );

  const uploadFiles = useCallback(
    async (files: File[]) => {
      setError(null);
      setUploadingCount(files.length);

      const results = await Promise.all(files.map((f) => uploadFile(f)));
      const uploaded = results.filter((url): url is string => url !== null);

      if (uploaded.length > 0) {
        onChange([...urlsRef.current, ...uploaded]);
      }
      setUploadingCount(0);
    },
    [uploadFile, onChange]
  );

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter((f) => ACCEPTED_TYPES.includes(f.type));
    if (files.length > 0) uploadFiles(files);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) uploadFiles(files);
    e.target.value = "";
  }

  function removeImage(index: number) {
    onChange(urls.filter((_, i) => i !== index));
  }

  // Drag-to-reorder handlers
  function handleReorderDragStart(e: React.DragEvent, index: number) {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = "move";
    // Use a transparent image so the default ghost isn't distracting
    const ghost = document.createElement("div");
    ghost.style.opacity = "0";
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 0, 0);
    requestAnimationFrame(() => ghost.remove());
  }

  function handleReorderDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragIndex !== null && index !== dragIndex) {
      setDropIndex(index);
    }
  }

  function handleReorderDrop(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (dragIndex !== null && dragIndex !== index) {
      const newUrls = [...urls];
      const [moved] = newUrls.splice(dragIndex, 1);
      newUrls.splice(index, 0, moved);
      onChange(newUrls);
    }
    setDragIndex(null);
    setDropIndex(null);
  }

  function handleReorderDragEnd() {
    setDragIndex(null);
    setDropIndex(null);
  }

  const uploading = uploadingCount > 0;

  return (
    <div className="space-y-3">
      {/* Existing images */}
      {urls.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {urls.map((url, i) => (
            <div
              key={url}
              draggable
              onDragStart={(e) => handleReorderDragStart(e, i)}
              onDragOver={(e) => handleReorderDragOver(e, i)}
              onDrop={(e) => handleReorderDrop(e, i)}
              onDragEnd={handleReorderDragEnd}
              className={cn(
                "group relative cursor-grab active:cursor-grabbing transition-all duration-150",
                dragIndex === i && "opacity-40 scale-95",
                dropIndex === i && dragIndex !== null && "ring-2 ring-primary ring-offset-2 rounded-md"
              )}
            >
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
              <div className="absolute left-1 top-1 rounded bg-background/80 p-0.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                <GripVertical className="h-3.5 w-3.5" />
              </div>
              <span className="absolute bottom-1 right-1 rounded bg-background/80 px-1.5 py-0.5 text-[10px] font-medium backdrop-blur-sm">
                {i + 1}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Add image(s) button */}
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
          <div className="flex flex-col items-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <span className="mt-1 text-[10px] text-muted-foreground">{uploadingCount} file{uploadingCount > 1 ? "s" : ""}…</span>
          </div>
        ) : (
          <>
            <Upload className="h-5 w-5 text-muted-foreground" />
            <span className="mt-1 text-[10px] text-muted-foreground">Add images</span>
          </>
        )}
        <input
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          multiple
          onChange={handleFileInput}
          className="hidden"
          disabled={uploading}
        />
      </label>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
