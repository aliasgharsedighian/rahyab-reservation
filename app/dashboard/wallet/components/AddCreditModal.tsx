"use client";

import { useState } from "react";
import { PlusIcon, MinusIcon } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const suggestedAmounts = [100000, 500000, 1000000];

export default function AddCreditModal() {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(100000);

  const increase = () => {
    setAmount((prev) => prev + 10000);
  };

  const decrease = () => {
    setAmount((prev) => Math.max(10000, prev - 10000));
  };

  const handlePayment = async () => {
    console.log(amount);

    // api create payment

    // const res = await fetch(...)
    // const data = await res.json()
    // window.location.href = data.payment_url
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full mt-4">
          <PlusIcon />
          افزایش اعتبار
        </Button>
      </DialogTrigger>

      <DialogContent dir="rtl" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="pr-5 iranSansBold text-lg text-center">
            افزایش اعتبار کیف پول
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-4">
          <div className="grid grid-cols-3 gap-2">
            {suggestedAmounts.map((item) => (
              <Button
                key={item}
                type="button"
                variant={amount === item ? "default" : "outline"}
                onClick={() => setAmount(item)}
              >
                {item.toLocaleString()}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="icon"
              type="button"
              variant="outline"
              onClick={increase}
            >
              <PlusIcon />
            </Button>

            <Input
              value={amount.toLocaleString()}
              onChange={(e) => {
                const value = Number(e.target.value.replaceAll(",", ""));

                if (!isNaN(value)) {
                  setAmount(value);
                }
              }}
              className="text-center"
            />

            <Button
              size="icon"
              type="button"
              variant="outline"
              onClick={decrease}
            >
              <MinusIcon />
            </Button>
          </div>

          <div className="rounded-lg bg-muted p-4 text-center">
            <span className="text-sm text-muted-foreground">مبلغ شارژ</span>

            <div className="mt-2 text-xl font-bold">
              {amount.toLocaleString()} تومان
            </div>
          </div>

          <Button onClick={handlePayment} disabled={amount < 10000}>
            اتصال به درگاه پرداخت
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
