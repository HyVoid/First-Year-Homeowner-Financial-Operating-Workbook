import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Upload, FileJson, AlertCircle } from 'lucide-react';

interface JsonBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JsonBackupModal: React.FC<JsonBackupModalProps> = ({ isOpen, onClose }) => {
  const { importBackup } = useApp();
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setJsonText((event.target?.result as string) || '');
        setError(null);
      };
      reader.readAsText(file);
    }
  };

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jsonText.trim()) {
      setError('Please paste or upload JSON backup content first.');
      return;
    }
    const res = importBackup(jsonText);
    if (res.success) {
      onClose();
      setJsonText('');
      setError(null);
    } else {
      setError(res.error || 'Failed to restore backup.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(5,28,44,0.4)] backdrop-blur-sm">
      <div className="bg-white rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] w-full max-w-lg overflow-hidden border border-[var(--color-border)]">
        <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--table-header-bg)]">
          <div className="flex items-center gap-2">
            <FileJson className="w-5 h-5 text-[var(--color-accent)]" />
            <h2 className="font-heading text-[18px] font-bold text-[var(--color-primary)]">
              Import System Backup (JSON)
            </h2>
          </div>
          <button onClick={onClose} className="text-[var(--color-muted)] hover:text-[var(--color-primary)] p-1 rounded-md cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleImport} className="p-6 space-y-4">
          <p className="text-[13px] text-[var(--color-muted)]">
            Restoring from a JSON file will completely replace the current state of all 10 sheets with the backup.
          </p>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-muted)]">
                JSON Content
              </label>
              <label className="text-[11px] text-[var(--color-accent)] hover:underline cursor-pointer flex items-center gap-1">
                <Upload className="w-3 h-3" />
                <span>Upload JSON file</span>
                <input type="file" accept=".json,application/json" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder="Paste raw JSON backup here..."
              rows={8}
              className="w-full px-3 py-2 font-mono text-[12px] border border-[var(--color-border)] rounded-[var(--radius-sm)] focus:outline-none focus:border-[var(--color-accent)] bg-white text-[var(--color-primary)]"
            />
          </div>

          {error && (
            <div className="p-3 bg-[var(--anomaly-bg)] rounded-[var(--radius-sm)] text-[var(--color-negative)] text-[12px] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2 border-t border-[var(--color-border)] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[13px] font-medium text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-[13px] font-semibold text-white bg-[var(--color-primary)] hover:opacity-90 rounded-[var(--radius-sm)] transition-all cursor-pointer shadow-sm"
            >
              Restore Backup
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
