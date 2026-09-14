"use client";

import { useState } from "react";
import Image from "next/image";

export function ProductGallery({
  images,
  name,
  discount,
}: {
  images: string[];
  name: string;
  discount: number | null;
}) {
  const [active, setActive] = useState(0);
  const cover = images[active];

  return (
    <div className="space-y-3">
      <div className="relative aspect-square overflow-hidden rounded-[1.75rem] border border-white/60 bg-gradient-to-br from-cream via-silver-100 to-gold-100 shadow-premium">
        {cover ? (
          <Image
            src={cover}
            alt={name}
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="font-serif text-5xl text-ink-200">Mi</span>
          </div>
        )}
        {discount && (
          <span className="absolute left-4 top-4 rounded-full bg-gold-400 px-4 py-1.5 text-sm font-bold text-ink-900 shadow-gold">
            %{discount} Off
          </span>
        )}
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-3">
          {images.slice(0, 5).map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`relative aspect-square overflow-hidden rounded-xl border border-white/60 bg-silver-100 shadow-soft transition ${
                active === i ? "ring-2 ring-gold-500" : "opacity-75 hover:opacity-100"
              }`}
            >
              <Image
                src={src}
                alt={`${name} - ${i + 1}`}
                fill
                sizes="(min-width: 1024px) 10vw, 20vw"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
