"use client"; 

interface Props {
  label: string;
  variant: 'primary' | 'text' | 'danger';
  disabled?: boolean;
  type?: 'button' | 'submit';
  onClick?: () => void;
}

function Button({ label, variant = 'primary', disabled = false, type = 'button', onClick }: Props) {
  const baseStyle = 'px-4 py-2 rounded font-medium transition-colors';
  const variantStyle = variant === 'primary' ? 'bg-blue-500 text-white hover:bg-blue-600' :
                       variant === 'text' ? 'bg-transparent text-blue-500 hover:underline' :
                       variant === 'danger' ? 'bg-red-500 text-white hover:bg-red-600' : '';
  const disabledStyle = disabled ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <button 
      className={`${baseStyle} ${variantStyle} ${disabledStyle}`}
      disabled={disabled}
      type={type}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

export default Button;