import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  level?: 1 | 2 | 3;
  glow?: boolean;
  glowColor?: 'blue' | 'purple';
  className?: string;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  level = 2,
  glow = false,
  glowColor = 'blue',
  className = '',
  children,
  ...props
}) => {
  let elevationStyle = '';
  switch (level) {
    case 1:
      elevationStyle = 'surface-level-1';
      break;
    case 2:
      elevationStyle = 'surface-level-2';
      break;
    case 3:
      elevationStyle = 'surface-level-2 shadow-[0_0_40px_rgba(173,198,255,0.15)] border-primary/20';
      break;
  }

  let glowStyle = '';
  if (glow) {
    glowStyle = glowColor === 'purple' ? 'neon-glow-purple' : 'neon-glow';
  }

  return (
    <div
      className={`rounded-2xl overflow-hidden transition-all duration-300 ${elevationStyle} ${glowStyle} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
