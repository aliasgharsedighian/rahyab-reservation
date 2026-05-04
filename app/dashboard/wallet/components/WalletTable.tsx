function WalletTable({ walletList }: any) {
  return (
    <div className="w-full overflow-x-auto rounded-md">
      <div className="text-sm md:text-base grid grid-cols-[100px_180px_100px_100px_100px] lg:grid-cols-12 bg-gray-200 text-gray-700 min-w-max">
        <div className="lg:col-span-2 p-2 border flex items-center">تاریخ</div>
        <div className="lg:col-span-3 p-2 border flex items-center">نوع</div>

        <div className="lg:col-span-3 p-2 border flex items-center">
          مبلغ (تومان)
        </div>
        <div className="lg:col-span-4 p-2 border flex items-center">
          توضیحات
        </div>
      </div>

      {walletList.map((item: any) => (
        <div
          key={item.id}
          className="border-l border-b text-sm grid grid-cols-[100px_180px_100px_100px_100px] lg:grid-cols-12  min-w-max even:bg-gray-100 hover:bg-gray-200 transition"
        >
          <div className="lg:col-span-2 p-2 border-l border-r flex items-center">
            {item.created_at_jalali}
          </div>
          <div className="lg:col-span-3 p-2 border-l flex items-center">
            {item.type}
          </div>
          <div className="lg:col-span-3 p-2 border-l flex items-center">
            {item.amount.toLocaleString()}
          </div>
          <div className="lg:col-span-4 p-2 flex items-center">
            {item.description}
          </div>
        </div>
      ))}
    </div>
  );
}

export default WalletTable;
