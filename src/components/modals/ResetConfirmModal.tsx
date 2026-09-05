import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, AlertTriangle } from 'lucide-react';

interface ResetConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({ isOpen, onClose }) => {
  const { resetData } = useApp();

  if (!isOpen) return null;

  const handleConfirm = () => {
    resetData();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(5,28,44,0.4)] backdrop-blur-sm">
      <div className="bg-white rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] w-full max-w-md overflow-hidden border border-[var(--color-border)]">
        <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--anomaly-bg)]">
          <div className="flex items-center gap-2 text-[var(--color-negative)]">
            <AlertTriangle className="w-5 h-5" />
            <h2 className="font-heading text-[18px] font-bold">
              Reset Workbook Data
            </h2>
          </div>
          <button onClick={onClose} className="text-[var(--color-muted)] hover:text-[var(--color-primary)] p-1 rounded-md cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-[13px] text-[var(--color-body-text)] leading-relaxed">
            Are you sure you want to reset all workbook tables and settings? Any unexported changes made to your profile, budget ledger, HOA records, or maintenance logs will be replaced with the default baseline dataset.
          </p>

          <div className="insight-block text-[12px] text-[var(--color-muted)]">
            Tip: You can use <strong>Export Backup</strong> first to download your current data as a JSON file before resetting.
          </div>

          <div className="pt-2 border-t border-[var(--color-border)] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[13px] font-medium text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-5 py-2 text-[13px] font-semibold text-white bg-[var(--color-negative)] hover:opacity-90 rounded-[var(--radius-sm)] transition-all cursor-pointer shadow-sm"
            >
              Confirm & Reset Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
