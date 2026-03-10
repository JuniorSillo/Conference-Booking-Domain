"use client"; 



interface Props {
  error: string | null;
  isStale: boolean;
  onRetry: () => void;
}

function SyncBanner({ error, isStale, onRetry }: Props) {
  return (
    <>
      {error && (
        <div className="p-3 mb-4 text-sm text-red-800 bg-red-100 rounded flex items-center justify-between" role="alert">
          <span>⚠ {error}</span>
          <button className="text-red-600 hover:underline" onClick={onRetry}>Retry</button>
        </div>
      )}

      {isStale && (
        <div className="p-3 mb-4 text-sm text-yellow-800 bg-yellow-100 rounded">
          Showing cached data while refreshing…
        </div>
      )}
    </>
  );
}

export default SyncBanner;