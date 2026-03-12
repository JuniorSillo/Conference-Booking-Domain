
"use client";

import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log to console for traceability (would go to Sentry/Datadog in production)
    console.error("[Dashboard Error]", error);
  }, [error]);

  const isNetworkError =
    error.message?.toLowerCase().includes("network") ||
    error.message?.toLowerCase().includes("fetch") ||
    error.message?.toLowerCase().includes("failed");

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-6 text-center">

        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-white">
            {isNetworkError ? "Cannot reach the server" : "Something went wrong"}
          </h2>
          <p className="text-sm text-zinc-400">
            {isNetworkError
              ? "The backend API appears to be offline. Check that your .NET server is running on port 5051."
              : "An unexpected error occurred in the dashboard. You can try resetting or come back later."}
          </p>
        </div>

        {/* Error detail (collapsed) */}
        <details className="text-left">
          <summary className="text-xs text-zinc-600 cursor-pointer hover:text-zinc-400 transition-colors">
            Show error details
          </summary>
          <pre className="mt-2 text-xs text-red-400 bg-red-500/5 border border-red-500/10 rounded-lg p-3 overflow-auto max-h-32 whitespace-pre-wrap">
            {error.message}
            {error.digest ? `\nDigest: ${error.digest}` : ""}
          </pre>
        </details>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Try Again
          </button>
          <a
            href="/dashboard"
            className="bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors"
          >
            Reload Dashboard
          </a>
        </div>

      </div>
    </div>
  );
}