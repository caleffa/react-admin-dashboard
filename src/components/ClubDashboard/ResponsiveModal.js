import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const ResponsiveModal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  showCloseButton = true
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4'
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        {/* Modal Content */}
        <div className={`
          relative
          transform
          overflow-hidden
          rounded-xl
          bg-white
          text-left
          shadow-2xl
          transition-all
          w-full
          ${sizeClasses[size]}
          max-h-[90vh]
          my-8
          mx-auto
          ${size === 'full' ? 'h-[90vh]' : ''}
        `}>
          {/* Header */}
          {title && (
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {title}
                </h3>
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="rounded-full p-1 hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
                    aria-label="Cerrar modal"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>
                )}
              </div>
            </div>
          )}
          
          {/* Body */}
          <div className={`
            ${size === 'full' ? 'h-[calc(90vh-73px)]' : 'max-h-[calc(90vh-73px)]'}
            overflow-y-auto
            ${!title ? 'pt-6' : ''}
            px-6
            pb-6
          `}>
            {children}
          </div>
          
          {/* Close button for modals without title */}
          {!title && showCloseButton && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 rounded-full bg-gray-100 p-2 hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 z-10"
              aria-label="Cerrar modal"
            >
              <X size={20} className="text-gray-600" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResponsiveModal;