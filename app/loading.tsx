export default function Loading() {
  return (
    <div className="flex items-center justify-center h-[60vh] bg-gradient-to-br from-gray-50 to-gary-100">
      <div className="flex flex-col items-center space-y-4">
        {/* Spinner */}
        <div className="relative">
          <div className="h-10 w-10 md:h-12 md:w-12 rounded-full border-4 border-blue-400 border-t-transparent animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            {/* <div className="h-6 w-6 rounded-full bg-blue-500 animate-pulse"></div> */}
          </div>
        </div>

        {/* Text */}
        <p className="text-lg iranSansBold text-blue-700 animate-pulse">
          در حال بارگذاری ...
        </p>
      </div>
    </div>
  );
}
