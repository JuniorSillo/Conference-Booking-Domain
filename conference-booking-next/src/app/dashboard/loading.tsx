function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div className={`bg-zinc-800 rounded-lg animate-pulse ${className ?? ''}`} />
  );
}

function StatCardSkeleton() {
  return (
    <div className="bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 flex items-center gap-3">
      <SkeletonBlock className="w-8 h-8 rounded-lg shrink-0" />
      <div className="space-y-1.5 flex-1">
        <SkeletonBlock className="h-5 w-12" />
        <SkeletonBlock className="h-3 w-24" />
      </div>
    </div>
  );
}

function TableRowSkeleton() {
  return (
    <tr className="border-b border-white/5">
      {[...Array(6)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <SkeletonBlock className={`h-4 ${i === 0 ? 'w-32' : i === 4 ? 'w-16 rounded-full' : 'w-24'}`} />
        </td>
      ))}
    </tr>
  );
}

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-zinc-950 px-4 sm:px-8 py-10">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* ── Header skeleton ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <SkeletonBlock className="h-7 w-32" />
              <SkeletonBlock className="h-5 w-16 rounded-full" />
            </div>
            <SkeletonBlock className="h-4 w-48" />
          </div>
          <div className="flex gap-2">
            {[...Array(4)].map((_, i) => (
              <SkeletonBlock key={i} className="h-6 w-24 rounded-full" />
            ))}
          </div>
        </div>

        {/* ── Stats strip skeleton ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)}
        </div>

        {/* ── Search + sort bar skeleton ── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <SkeletonBlock className="h-10 flex-1 rounded-lg" />
          <SkeletonBlock className="h-10 w-40 rounded-lg" />
          <SkeletonBlock className="h-10 w-32 rounded-lg" />
        </div>

        {/* ── Table skeleton ── */}
        <div className="rounded-xl border border-white/5 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-zinc-800/60">
                {[...Array(6)].map((_, i) => (
                  <th key={i} className="px-4 py-3 text-left">
                    <SkeletonBlock className="h-3 w-16" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-zinc-900">
              {[...Array(6)].map((_, i) => <TableRowSkeleton key={i} />)}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}