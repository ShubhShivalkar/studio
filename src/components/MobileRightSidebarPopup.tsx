import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface MobileRightSidebarPopupProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const MobileRightSidebarPopup: React.FC<MobileRightSidebarPopupProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center lg:items-center lg:justify-center">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/80" onClick={onClose} />

      {/* Popup Content */}
      <div className="relative w-full max-h-[80vh] overflow-y-auto rounded-t-lg bg-card p-4 shadow-lg lg:max-w-md lg:rounded-lg">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 text-muted-foreground hover:bg-transparent hover:text-foreground"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </Button>
        <div className="mt-8 lg:mt-0"> {/* Adjust margin for close button */}
          {children}
        </div>
      </div>
    </div>
  );
};

export default MobileRightSidebarPopup;
