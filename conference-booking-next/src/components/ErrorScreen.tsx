"use client"; 

interface Props {
  message: string;
  onRetry: () => void;
}

function ErrorScreen({ message, onRetry }: Props) {
  return (
    <div className="flex items-center justify-center h-screen bg-red-50">
      <div className="p-6 text-center bg-white border border-red-200 rounded-lg shadow-md">
        <span className="text-4xl text-red-500">⚠</span>
        <h2 className="mt-4 text-xl font-bold text-red-700">Connection Failed</h2>
        <p className="mt-2 text-gray-600">{message}</p>
        <button 
          className="mt-4 px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
          onClick={onRetry}
        >
          ↺ Retry
        </button>
      </div>
    </div>
  );
}

export default ErrorScreen;