"use client"; 

interface Props {
  category: string;
  onCategoryChange: (value: string) => void;
  view: string;
  onViewChange: (value: string) => void;
  onRefresh: () => void;
  isSyncing: boolean;
}

function DashboardControls({ category, onCategoryChange, view, onViewChange, onRefresh, isSyncing }: Props) {
  return (
    <div className="flex items-center gap-4 mb-4">
      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700">Category</label>
        <select
          className="mt-1 p-2 border border-gray-300 rounded focus:border-blue-500"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Internal">Internal</option>
          <option value="Client">Client</option>
        </select>
      </div>

      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700">View</label>
        <select
          className="mt-1 p-2 border border-gray-300 rounded focus:border-blue-500"
          value={view}
          onChange={(e) => onViewChange(e.target.value)}
        >
          <option value="upcoming">Upcoming</option>
          <option value="past">Past</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <button
        className="px-4 py-2 text-white bg-gray-500 rounded hover:bg-gray-600 disabled:opacity-50"
        onClick={onRefresh}
        disabled={isSyncing}
        aria-label="Refresh bookings"
      >
        {isSyncing ? '↻ Syncing…' : '↺ Refresh'}
      </button>
    </div>
  );
}

export default DashboardControls;