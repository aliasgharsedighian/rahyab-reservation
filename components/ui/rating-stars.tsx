import { StarIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface RatingStarsProps {
  value: number | string | null | undefined;
  max?: number;
  className?: string;
  starClassName?: string;
  label?: string;
}

function RatingStars({
  value,
  max = 5,
  className,
  starClassName,
  label,
}: RatingStarsProps) {
  const numericValue = Number(value);
  const normalizedValue = Number.isFinite(numericValue)
    ? Math.min(Math.max(numericValue, 0), max)
    : 0;
  const wholeStars = Math.floor(normalizedValue);
  const displayValue =
    normalizedValue > wholeStars
      ? Math.min(wholeStars + 0.5, max)
      : wholeStars;

  return (
    <span
      dir="rtl"
      role="img"
      aria-label={label ?? `امتیاز ${normalizedValue} از ${max}`}
      className={cn("inline-flex shrink-0 items-center gap-0.5", className)}
    >
      {Array.from({ length: max }, (_, index) => {
        const fill = Math.min(Math.max(displayValue - index, 0), 1);

        return (
          <span
            key={index}
            aria-hidden="true"
            className={cn("relative size-4 shrink-0", starClassName)}
          >
            <StarIcon className="absolute inset-0 size-full fill-transparent text-amber-400/40" />
            {fill > 0 ? (
              <span
                className="absolute inset-0"
                style={{
                  clipPath: `inset(0 0 0 ${100 - fill * 100}%)`,
                }}
              >
                <StarIcon className="size-full fill-amber-400 text-amber-400" />
              </span>
            ) : null}
          </span>
        );
      })}
    </span>
  );
}

export { RatingStars };
