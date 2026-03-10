"use client"; 


import LoadingSpinner from './LoadingSpinner';

interface Props {
  isSyncing: boolean;
}

function PageHeader({ isSyncing }: Props) {
  return (
    <header className="p-4 bg-white border-b border-gray-200">
      <h1 className="text-2xl font-bold">Conference Bookings</h1>
      {isSyncing && (
        <span className="flex items-center mt-2 text-sm text-blue-500">
          <LoadingSpinner />
          Syncing…
        </span>
      )}
    </header>
  );
}

export default PageHeader;