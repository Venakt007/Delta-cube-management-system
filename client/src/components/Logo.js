import React from 'react';

const Logo = ({ className = '', size = 'medium' }) => {
  const sizeClasses = {
    small: 'h-8',
    medium: 'h-12',
    large: 'h-16'
  };

  return (
    <img 
      src="/logo.png" 
      alt="Company Logo" 
      className={`${sizeClasses[size]} w-auto ${className}`}
    />
  );
};

export default Logo;
