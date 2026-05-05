function WalletTable({ walletList }: any) {
  return (
    <div className="w-full overflow-x-auto rounded-md">
      <div className="border text-sm grid grid-cols-[50px_100px_50px_180px_100px_100px_100px] lg:grid-cols-12 bg-transparent text-gray-700 min-w-max rounded-t-md">
        <div className="lg:col-span-1 p-2 md:p-4  flex items-center">ردیف</div>
        <div className="lg:col-span-2 p-2 md:p-4  flex items-center">تاریخ</div>
        <div className="lg:col-span-2 p-2 md:p-4  flex items-center">نوع</div>
        <div className="lg:col-span-2 p-2 md:p-4  flex items-center">
          مبلغ (تومان)
        </div>
        <div className="lg:col-span-5 p-4  flex items-center">توضیحات</div>
      </div>

      {walletList.map((item: any, index: number) => (
        <div
          key={item.id}
          className="border-l border-b text-sm grid grid-cols-[50px_100px_50px_180px_100px_100px_100px] lg:grid-cols-12  min-w-max  hover:bg-(--light-green) transition"
        >
          <div className="lg:col-span-1 p-2 md:p-4 border-r flex items-center">
            {index + 1}
          </div>
          <div className="lg:col-span-2 p-2 md:p-4  flex items-center">
            {item.created_at_jalali}
          </div>
          <div className="lg:col-span-2 p-2 md:p-4 flex items-center">
            {item.type}
          </div>

          <div className="lg:col-span-2 p-2 md:p-4  flex items-center">
            <span className="bg-(--light-green) text-(--base-green) py-1 px-2 rounded-lg">
              {item.amount.toLocaleString()}
            </span>
          </div>
          <div className="lg:col-span-5 p-2 md:p-4 flex items-center">
            {item.description.toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}

export default WalletTable;
