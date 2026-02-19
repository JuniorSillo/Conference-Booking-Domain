// src/components/DashboardControls.jsx

function DashboardControls({ category, onCategoryChange, view, onViewChange, onRefresh, isSyncing }) {
     return (
       <div className="controls-row">
         <div className="control-group">
           <label className="control-label" htmlFor="category-select">Category</label>
           <select
             id="category-select"
             className="control-select"
             value={category}
             onChange={(e) => onCategoryChange(e.target.value)}
           >
             <option value="All">All</option>
             <option value="Internal">Internal</option>
             <option value="Client">Client</option>
           </select>
         </div>
   
         <div className="control-group">
           <label className="control-label" htmlFor="view-select">View</label>
           <select
             id="view-select"
             className="control-select"
             value={view}
             onChange={(e) => onViewChange(e.target.value)}
           >
             <option value="upcoming">Upcoming</option>
             <option value="past">Past</option>
             <option value="cancelled">Cancelled</option>
           </select>
         </div>
   
         <button
           className="btn btn-secondary refresh-btn"
           onClick={onRefresh}
           disabled={isSyncing}
           aria-label="Refresh bookings"
         >
           {isSyncing ? '↻ Syncing…' : '↺ Refresh'}
         </button>
       </div>
     )
   }
   
   export default DashboardControls