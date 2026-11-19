"use client";

import { useState } from "react";
import Image from "next/image";

interface GalleryImage {
  id: number;
  url: string;
}

export function ProductGallery({
  images,
  productName,
}: {
  images: GalleryImage[];
  productName: string;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="relative w-full aspect-[4/5] max-h-[480px] bg-surface-container-low overflow-hidden border border-outline-variant/60 flex items-center justify-center text-secondary">
        No image
      </div>
    );
  }

  const mainImage = images[selectedIndex] ?? images[0];

  return (
    <>
      {/* Main hero image */}
      <div className="relative w-full aspect-[4/5] max-h-[480px] bg-surface-container-low overflow-hidden border border-outline-variant/60 group">
        <Image
          src={mainImage.url}
          alt={productName}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.015]"
          priority
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((img, index) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setSelectedIndex(index)}
              className={`relative aspect-square bg-surface-container-low overflow-hidden focus:outline-none transition-all border border-outline-variant/60 ${
                index === selectedIndex
                  ? "opacity-100"
                  : "opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={img.url}
                alt={`${productName} - view ${index + 1}`}
                fill
                sizes="12vw"
                className="object-cover object-center"
              />
              {/* Active indicator bar */}
              <span
                className={`absolute bottom-0 left-0 right-0 h-0.5 ${
                  index === selectedIndex ? "bg-primary" : "bg-transparent"
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </>
  );
}
