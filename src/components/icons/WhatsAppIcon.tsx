import React from 'react';

interface WhatsAppIconProps {
  className?: string;
}

const WhatsAppIcon: React.FC<WhatsAppIconProps> = ({ className }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
    >
      {/* Main logo shape - chat bubble with tail */}
      <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
      
      {/* WhatsApp phone icon - simple representation */}
      <path d="M9.5 11c0 1.5 1 2.5 2.5 2.5" />
      <path d="M14 12v2h-2" />
    </svg>
  );
};

export default WhatsAppIcon;