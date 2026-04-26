import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex h-[60vh] items-center justify-center flex-col text-center">
      <h2 className="text-3xl iranSansBold text-gray-800">
        404 - صفحه پیدا نشد
      </h2>
      <p className="text-gray-500 mt-2">
        صفحه‌ای که به دنبال آن هستید یافت نشد.
      </p>
      <Link
        href="/"
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        برو به خانه
      </Link>
    </div>
  );
}
