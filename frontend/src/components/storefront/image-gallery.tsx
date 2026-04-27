"use client";

import Image from "next/image";

interface ImageGalleryProps {
  images: { src: string; alt: string }[];
}

export function ImageGallery({ images }: ImageGalleryProps) {
  if (images.length === 0) return null;

  const [mainImage, ...galleryImages] = images;

  return (
    <div className="flex flex-col gap-1 w-[90%] mx-auto">
      {/* Main image — full width, natural height, no cropping */}
      <Image
        src={mainImage.src}
        alt={mainImage.alt}
        width={0}
        height={0}
        sizes="(max-width: 768px) 100vw, 50vw"
        className="w-full h-auto block"
        priority
      />

      {/* Gallery images — 2-column grid, same total width as main */}
      {galleryImages.length > 0 && (
        <div className="grid grid-cols-2 gap-1">
          {galleryImages.map((img) => (
            <Image
              key={img.src}
              src={img.src}
              alt={img.alt}
              width={0}
              height={0}
              sizes="(max-width: 768px) 50vw, 25vw"
              className="w-full h-auto block"
            />
          ))}
        </div>
      )}
    </div>
  );
}
