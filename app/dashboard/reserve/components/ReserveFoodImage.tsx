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
  // The API host can resolve to a private address on the deployment network.
  // Load remote images directly; never probe the optimizer and then retry them.
  const canOptimize = src.startsWith("/") && !src.startsWith("//");

  if (!canOptimize || failedSource === src) return (
    // The browser reuses the original URL and its normal HTTP image cache.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} loading="lazy" decoding="async" className="size-full object-cover" />
  );
  return <Image src={src} alt={alt} fill sizes={sizes} decoding="async" className="object-cover"
    onError={() => setFailedSource(src)} />;
}

export default memo(ReserveFoodImage);
