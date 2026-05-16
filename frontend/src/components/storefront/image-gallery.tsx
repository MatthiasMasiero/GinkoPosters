"use client";

import Image from "next/image";

interface ImageGalleryProps {
  images: { src: string; alt: string }[];
}

export function ImageGallery({ images }: ImageGalleryProps) {
  if (images.length === 0) return null;

  return (
    <>
      {/* Mobile: smooth horizontal scroll, fixed-ratio slides with warm sand letterbox fill */}
      <div className="md:hidden -mx-4 flex overflow-x-auto overflow-y-hidden overscroll-x-contain scrollbar-hide">
        {images.map((img, i) => (
          <div
            key={img.src}
            className="relative flex shrink-0 w-screen aspect-[4/5] items-center justify-center overflow-hidden bg-[#e7e1d6]"
            onContextMenu={(e) => e.preventDefault()}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes="100vw"
              quality={75}
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
              onDragStart={(e) => e.preventDefault()}
              className="no-save-img object-contain"
              priority={i === 0}
            />
          </div>
        ))}
      </div>

      {/* Desktop: stacked vertical */}
      <div
        className="hidden md:flex flex-col w-[90%] mx-auto"
        onContextMenu={(e) => e.preventDefault()}
      >
        {images.map((img, i) => (
          <Image
            key={img.src}
            src={img.src}
            alt={img.alt}
            width={0}
            height={0}
            sizes="50vw"
            quality={75}
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
            className="no-save-img w-full h-auto block"
            priority={i === 0}
          />
        ))}
      </div>
    </>
  );
}
