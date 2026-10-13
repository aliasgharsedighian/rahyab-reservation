"use client";

import Image from "next/image";
import { memo, useState } from "react";

interface ReserveFoodImageProps {
  src: string;
  alt: string;
  sizes: string;
}

function ReserveFoodImage({ src, alt, sizes }: ReserveFoodImageProps) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  let canOptimize = src.startsWith("/") && !src.startsWith("//");
  try {
    const url = new URL(src);
    canOptimize = url.protocol === "https:" && url.hostname === "app.foodnix.ir" &&
      url.pathname.startsWith("/storage/foods/");
  } catch { /* Relative images are served by this application. */ }

  if (!canOptimize || failedSource === src) return (
    // Keep API images usable if an external host or the image optimizer is unavailable.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} loading="lazy" decoding="async" className="size-full object-cover" />
  );
  return <Image src={src} alt={alt} fill sizes={sizes} decoding="async" className="object-cover"
    onError={() => setFailedSource(src)} />;
}

export default memo(ReserveFoodImage);
