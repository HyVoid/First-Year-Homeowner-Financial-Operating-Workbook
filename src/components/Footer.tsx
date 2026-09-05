import React from 'react';

interface FooterProps {
  onOpenResetConfirm?: () => void;
  onOpenJsonImport?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenResetConfirm, onOpenJsonImport }) => {
  return (
    <footer className="w-full max-w-[1400px] mx-auto px-6 sm:px-10 py-6 border-t border-[#E5E5E5] shrink-0 mt-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          {onOpenResetConfirm && (
            <button
              onClick={onOpenResetConfirm}
              className="text-[#D32F2F] hover:bg-red-50 px-2 py-1 rounded transition-colors uppercase tracking-widest text-[10px] font-bold cursor-pointer"
            >
              Reset Local Data
            </button>
          )}
          {onOpenJsonImport && (
            <button
              onClick={onOpenJsonImport}
              className="text-[#888888] hover:text-[#051C2C] text-[10px] uppercase font-bold tracking-widest cursor-pointer"
            >
              Import Backup (JSON)
            </button>
          )}
        </div>
        <div className="text-[#888888] text-[10px] italic max-w-[500px] text-center sm:text-right">
          Privacy Note: This tool stores all calculation data in your browser's local storage. No user data is transmitted to or retained by our servers.
        </div>
      </div>
    </footer>
  );
};

