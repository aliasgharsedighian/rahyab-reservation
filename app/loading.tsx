import { ForkKnife } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col justify-center w-full min-h-screen items-center animate-pulse font-serif text-lg text-gray-400 text-center p-10">
      <div className="flex flex-col items-center space-y-4">
        {/* Spinner */}
        <div className="relative">
          {/* <div className="h-10 w-10 md:h-12 md:w-12 rounded-full border-4 border-blue-400 border-t-transparent animate-spin"></div> */}
          <div className="absolute inset-0 flex items-center justify-center">
            {/* <div className="h-6 w-6 rounded-full bg-blue-500 animate-pulse"></div> */}
          </div>
        </div>

        {/* Text */}
        <div className="bg-(--light-green) p-6 rounded-full">
          <ForkKnife className="size-24 text-(--base-green)" />
        </div>
      </div>
    </div>
  );
}
