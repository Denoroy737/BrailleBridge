import { Suspense } from "react";
import { MainApp }  from "@/components/MainApp";

export default function HomePage() {
  return (
    <Suspense fallback={<Spinner />}>
      <MainApp />
    </Suspense>
  );
}

function Spinner() {
  return (
    <div className="min-h-screen bg-[#f9f9f9] dark:bg-[#111] flex items-center justify-center"
      aria-hidden>
      <div className="w-8 h-8 border-2 border-black dark:border-white
        border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
