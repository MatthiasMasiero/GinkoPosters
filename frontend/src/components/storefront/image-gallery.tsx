"use client";

import Image from "next/image";

interface ImageGalleryProps {
  images: { src: string; alt: string }[];
}

export function ImageGallery({ images }: ImageGalleryProps) {
  if (images.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-1">
      {images.map((img, i) => (
        <div
          key={img.src}
          className="relative aspect-[3/4] overflow-hidden bg-muted"
        >
          <Image
            src={img.src}
            alt={img.alt}
            fill
            priority={i < 2}
            sizes="(max-width: 768px) 50vw, 30vw"
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}
