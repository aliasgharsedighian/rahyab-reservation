import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/login");

  return (
    <div className="">
      <Button>test</Button>
    </div>
  );
}
