// components/shared/rules-modal.tsx

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { MailIcon, PhoneCallIcon, ShieldCheckIcon } from "lucide-react";

interface RulesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContactModal({ open, onOpenChange }: RulesModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl border-0 p-0 overflow-hidden">
        <div className="bg-gradient-to-br from-green-600 to-emerald-500 p-3 md:p-6 text-white">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold flex items-center justify-center gap-2">
              <PhoneCallIcon className="size-6" />
              تماس با ما
            </DialogTitle>
          </DialogHeader>

          <p className="text-center text-sm text-white/90 mt-3 leading-7">
            در صورت وجود هرگونه مشکل یا سوال می‌توانید با ما در ارتباط باشید.
          </p>
        </div>

        <div className="p-3 md:p-6 space-y-4">
          <div className="rounded-xl border bg-muted/30 p-4 flex items-center gap-4 hover:bg-muted transition">
            <div className="bg-green-100 text-green-600 p-3 rounded-full">
              <PhoneCallIcon className="size-5" />
            </div>

            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">شماره تماس</span>
              <span className="font-bold tracking-wide">021-12345678</span>
            </div>
          </div>

          <div className="rounded-xl border bg-muted/30 p-4 flex items-center gap-4 hover:bg-muted transition">
            <div className="bg-blue-100 text-blue-600 p-3 rounded-full">
              <MailIcon className="size-5" />
            </div>

            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">
                ایمیل پشتیبانی
              </span>
              <span className="font-bold">support@example.com</span>
            </div>
          </div>

          <div className="pt-2">
            <Button
              className="w-full rounded-xl h-11"
              onClick={() => onOpenChange(false)}
            >
              متوجه شدم
            </Button>
          </div>
        </div>
      </DialogContent>
      <DialogDescription></DialogDescription>
    </Dialog>
  );
}
