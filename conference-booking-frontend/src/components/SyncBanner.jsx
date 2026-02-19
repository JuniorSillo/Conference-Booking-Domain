// src/components/SyncBanner.jsx

function SyncBanner({ error, isStale, onRetry }) {
     return (
       <>
         {error && (
           <div className="error-banner">
             <span>⚠ {error}</span>
             <button className="btn btn-sm" onClick={onRetry}>Retry</button>
           </div>
         )}
   
         {isStale && (
           <div className="stale-notice">Showing cached data while refreshing…</div>
         )}
       </>
     )
   }
   
   export default SyncBanner