import React from 'react';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`container-responsive ${className}`}>
      {children}
    </div>
  );
};

export const MobileOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="visible-mobile">{children}</div>;
};

export const DesktopOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="hidden-mobile">{children}</div>;
};
