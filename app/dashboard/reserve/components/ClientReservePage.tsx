"use client";

import FoodReserveTabs from "./FoodReserveTabs";
import FoodReserveCart from "./FoodReserveCart";
import useDetectMobile from "@/app/components/hooks/DetectMobile";

function ClientReservePage({ reserveList, revalidateData, refreshPage }: any) {
  const isMobile = useDetectMobile();

  return (
    <>
      <div className="w-full md:basis-8/12">
        <FoodReserveTabs reserveList={reserveList} />
      </div>
      {isMobile ? null : (
        <div className="basis-4/12 w-full">
          <FoodReserveCart
            revalidateData={revalidateData}
            refresh={refreshPage}
          />
        </div>
      )}
    </>
  );
}

export default ClientReservePage;
