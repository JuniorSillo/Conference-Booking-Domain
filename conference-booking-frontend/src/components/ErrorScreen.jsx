

function ErrorScreen({ message, onRetry }) {
     return (
       <div className="error-screen">
         <div className="error-card">
           <span className="error-icon">⚠</span>
           <h2 className="error-title">Connection Failed</h2>
           <p className="error-msg">{message}</p>
           <button className="btn btn-primary" onClick={onRetry}>
             ↺ Retry
           </button>
         </div>
       </div>
     )
   }
   
   export default ErrorScreen