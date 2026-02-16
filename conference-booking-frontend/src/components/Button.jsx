function Button({ label, variant = 'primary', disabled = false, onClick }) {
     const className = `button ${variant} ${disabled ? 'disabled' : ''}`
   
     return (
       <button 
         className={className}
         disabled={disabled}
         onClick={onClick}
       >
         {label}
       </button>
     )
   }
   
   export default Button