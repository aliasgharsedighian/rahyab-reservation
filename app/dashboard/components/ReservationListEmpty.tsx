import Link from "next/link";
import { CalendarDaysIcon, HistoryIcon, SearchXIcon, UtensilsIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardEmptyState from "./DashboardEmptyState";

export default function ReservationListEmpty({ variant, filtered }: { variant: "history" | "upcoming"; filtered: boolean }) {
  const history = variant === "history";
  return (
    <DashboardEmptyState
      icon={filtered ? SearchXIcon : history ? HistoryIcon : CalendarDaysIcon}
      title={filtered ? "رزروی با این فیلترها پیدا نشد" : history ? "هنوز رزروی در سوابق شما نیست" : "رزروی برای روزهای پیش رو ندارید"}
      description={filtered ? "برای دیدن رزروهای بیشتر، فیلتر نام غذا، تاریخ یا وضعیت را تغییر دهید یا همه فیلترها را پاک کنید." : history ? "رزروهای گذشته شما در این بخش نمایش داده می‌شوند. برای انتخاب غذاهای روزهای آینده، به منوی غذا سر بزنید." : "بعد از انتخاب و رزرو غذا، جزئیات رزروهای آینده و امکان لغو آن‌ها در این بخش نمایش داده می‌شود."}
    >
      <Button asChild className="min-h-11 w-full gap-2 rounded-lg bg-(--base-green) text-white hover:bg-(--base-green)/90 dark:text-zinc-950">
        <Link href={filtered ? "/dashboard/" + (history ? "history-reserve" : "upcoming-reserve") + "?page=1" : "/dashboard/reserve"}>
          {filtered ? <XIcon className="size-4" aria-hidden="true" /> : <UtensilsIcon className="size-4" aria-hidden="true" />}
          {filtered ? "پاک کردن فیلترها" : "مشاهده منوی غذا"}
        </Link>
      </Button>
    </DashboardEmptyState>
  );
}
