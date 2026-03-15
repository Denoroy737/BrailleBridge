"use client";
import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  error: Error & { digest?: string | undefined };
  reset: () => void;
}

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    console.error("[BrailleBridge] Unhandled error:", error);
    // Swap for Sentry.captureException(error) in production
  }, [error]);

  return (
    <div className="min-h-screen bg-[#f9f9f9] dark:bg-[#111] flex items-center justify-center p-8"
      role="alert">
      <div className="max-w-sm text-center space-y-4">
        <AlertTriangle size={36} className="mx-auto text-[#777]" aria-hidden />
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="text-sm text-[#555] dark:text-[#999]">
          An unexpected error occurred.
          {error.digest !== undefined && (
            <span className="block mt-1 font-mono text-xs">ID: {error.digest}</span>
          )}
        </p>
        <button onClick={reset}
          className="px-5 py-2 text-sm bg-black text-white dark:bg-white dark:text-black
            rounded-md hover:opacity-80 transition-opacity">
          Try again
        </button>
      </div>
    </div>
  );
}
