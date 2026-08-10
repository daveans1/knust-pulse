"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AnalyticsPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/safety");
  }, [router]);

  return (
    <div className="flex justify-center items-center h-screen bg-white dark:bg-black text-[#536471]">
      <span>Redirecting to Trust & Safety Intelligence Center...</span>
    </div>
  );
}
