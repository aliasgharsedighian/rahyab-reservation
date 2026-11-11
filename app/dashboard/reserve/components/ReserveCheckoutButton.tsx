import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

type ReserveCheckoutButtonProps = Pick<
  ComponentProps<typeof Button>,
  "className" | "disabled" | "onClick" | "size"
> & { isOnlineCheckoutPending: boolean };

export default function ReserveCheckoutButton({
  isOnlineCheckoutPending,
  disabled,
  ...props
}: ReserveCheckoutButtonProps) {
  return (
    <Button
      {...props}
      type="button"
      disabled={disabled || isOnlineCheckoutPending}
      aria-busy={isOnlineCheckoutPending}
    >
      {isOnlineCheckoutPending ? (
        <>
          <Spinner aria-hidden="true" />
          در حال اتصال به درگاه…
        </>
      ) : (
        "ثبت و نهایی کردن رزرو"
      )}
    </Button>
  );
}
