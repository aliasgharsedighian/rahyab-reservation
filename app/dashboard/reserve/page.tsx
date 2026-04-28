import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FoodReserveInvoice from "./components/FoodReserveInvoice";
import FoodReserveCard from "./components/FoodReserveCard";

interface Props {
  searchParams: Promise<{
    open: string;
  }>;
}

const getReserveList = async () => {
  const cookieStore = await cookies();
  const browserId = cookieStore.get("user_token")?.value;
  var myHeaders = new Headers();
  myHeaders.append("Accept", "application/json");
  myHeaders.append("Authorization", `Bearer ${browserId}`);
  var requestOptions = {
    method: "GET",
    headers: myHeaders,
  };
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_ADDRESS}weekly-menu`,
    requestOptions,
  );

  const reserveList = await res.json();
  if (res.status === 200) {
    return reserveList.data;
  }
};

export default async function ReservePage({ searchParams }: Props) {
  const { open } = await searchParams;

  const reserveList = await getReserveList();

  async function revalidateData() {
    "use server";

    revalidatePath(`/dashboard/profile`);
  }

  return (
    <div className="flex gap-6">
      <div className="basis-8/12">
        <Tabs defaultValue={reserveList.weeks[0].range} className="w-full rtl">
          <TabsList className="rtl w-full">
            {reserveList.weeks.map((item: any, index: number) => (
              <TabsTrigger key={index} value={item.range}>
                {item.is_current_week
                  ? "هفته جاری"
                  : `${item.week_number} هفته بعد `}
              </TabsTrigger>
            ))}
          </TabsList>
          {reserveList.weeks.map((item: any, index: number) => (
            <TabsContent key={index} value={item.range}>
              <div className="flex flex-col gap-3">
                {item.days.map((day: any) => (
                  <div key={day.date} className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <p>{day.day_name}</p>
                      <span>{day.jalali_date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {day.foods.map((food: any) => (
                        <div key={food.food_id}>
                          <div>
                            <img src={food.image_url} alt={food.name} />
                            <span>{food.price}</span>
                          </div>
                          <p>{food.name}</p>
                          <p>{food.description}</p>
                          <FoodReserveInvoice
                            food_id={food.food_id}
                            weekly_menu_id={food.weekly_menu_id}
                            name={food.name}
                            price={food.price}
                            day={day.day_name}
                            jalali_date={day.jalali_date}
                            date={day.date}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
      <div className="basis-4/12 w-full">
        <FoodReserveCard />
      </div>
    </div>
  );
}
