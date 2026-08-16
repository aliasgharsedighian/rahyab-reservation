"use client";

import * as React from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

type PasswordInputProps = Omit<React.ComponentProps<typeof Input>, "type">;

function PasswordInput({ className, disabled, ...props }: PasswordInputProps) {
  const [isVisible, setIsVisible] = React.useState(false);

  return (
    <div className="relative">
      <Input
        type={isVisible ? "text" : "password"}
        disabled={disabled}
        className={cn("pe-10", className)}
        {...props}
      />
      <button
        type="button"
        disabled={disabled}
        aria-label={isVisible ? "مخفی کردن رمز عبور" : "نمایش رمز عبور"}
        aria-pressed={isVisible}
        title={isVisible ? "مخفی کردن رمز عبور" : "نمایش رمز عبور"}
        onClick={() => setIsVisible((visible) => !visible)}
        className="absolute end-1 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
      >
        {isVisible ? (
          <EyeOffIcon aria-hidden="true" className="size-4" />
        ) : (
          <EyeIcon aria-hidden="true" className="size-4" />
        )}
      </button>
    </div>
  );
}

export { PasswordInput };
