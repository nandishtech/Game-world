import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'neon' | 'glass' | 'ghost' | 'primary';
  className?: string;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'neon',
  className = '',
  children,
  ...props
}) => {
  let baseStyle = 'relative overflow-hidden font-label-md text-label-md px-6 py-2.5 rounded-lg transition-all duration-300 font-bold active:scale-98 select-none flex items-center justify-center gap-2';
  
  let variantStyle = '';
  switch (variant) {
    case 'neon':
      variantStyle = 'neon-button text-on-primary shadow-[0_0_20px_rgba(77,142,255,0.35)] hover:shadow-[0_0_30px_rgba(77,142,255,0.6)] hover:scale-[1.03]';
      break;
    case 'glass':
      variantStyle = 'glass-card text-white hover:bg-white/10 hover:border-white/20 hover:scale-[1.03]';
      break;
    case 'ghost':
      variantStyle = 'bg-transparent border border-primary/40 text-primary hover:bg-primary/10 hover:border-primary/80 hover:scale-[1.03] hover:shadow-[0_0_15px_rgba(173,198,255,0.2)]';
      break;
    case 'primary':
      variantStyle = 'bg-primary text-on-primary hover:scale-[1.03] hover:brightness-110';
      break;
  }

  return (
    <button className={`${baseStyle} ${variantStyle} ${className}`} {...props}>
      {children}
    </button>
  );
};
