import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TableTarget = 'expenses' | 'inventory' | 'maintenance' | 'hoa' | 'improvement';

const CSV_TEMPLATES: Record<TableTarget, { name: string; headers: string; sample: string }> = {
  expenses: {
    name: '03 Monthly Budget Ledger',
    headers: 'Date,Category,Subcategory,Merchant,Amount,PaymentMethod,ReceiptRef',
    sample: `2026-02-15,Electricity,Usage Cycle,Pacific Power,175.40,ACH/Auto-Pay,PPL-0215
2026-02-18,Maintenance,HVAC Filters,FiltersFast,45.00,Credit Card,FF-9912`,
  },
  inventory: {
    name: '08 Home Inventory',
    headers: 'Description,RoomLocation,Category,AcquisitionDate,PurchasePrice,EstReplacementCost,BrandModel,SerialNumber,ReceiptRef',
    sample: `OLED 65in TV,Living Room,Electronics,2026-01-20,1699.00,1750.00,LG C3,SN-88491,BB-REC-1
Dining Set,Dining Room,Furniture,2026-02-01,2200.00,2400.00,Room&Board,RB-994,RB-INV-4`,
  },
  maintenance: {
    name: '06 Maintenance Tracker',
    headers: 'TaskName,SystemCategory,FrequencyValue,FrequencyUnit,LastCompletedDate,AssignedVendor,ActualCost,NotesSpecs',
    sample: `Replace Furnace Filter,HVAC,3,Months,2026-05-15,DIY,35.00,16x25x1 filter
Water Heater Anode Rod,Plumbing,12,Months,2025-11-10,Apex Plumbing,120.00,Magnesium rod`,
  },
  hoa: {
    name: '05 HOA Tracker',
    headers: 'BillingPeriod,FeeType,DueDate,AmountDue,PaymentDate,AmountPaid,PaymentRef',
    sample: `2026-08,Regular Dues,2026-08-15,175.00,2026-08-14,175.00,ACH-884
2026-09,Regular Dues,2026-09-15,175.00,,,`,
  },
  improvement: {
    name: '09 Home Improvement',
    headers: 'ProjectTitle,AreaScope,Classification,StartDate,CompletionDate,Contractor,BudgetedCost,ActualCost,PermitNumber,ContractorWarrantyExp',
    sample: `Attic Insulation,Attic,Capital Improvement,2026-03-01,2026-03-04,EcoShield,3000.00,2950.00,PERMIT-01,2028-03-04`,
  },
};

export const CsvImportModal: React.FC<CsvImportModalProps> = ({ isOpen, onClose }) => {
  const { bulkCsvImport } = useApp();
  const [targetTable, setTargetTable] = useState<TableTarget>('expenses');
  const [csvText, setCsvText] = useState('');
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCsvText(event.target?.result as string || '');
      };
      reader.readAsText(file);
    }
  };

  const handleLoadSample = () => {
    const tpl = CSV_TEMPLATES[targetTable];
    setCsvText(`${tpl.headers}\n${tpl.sample}`);
    setResult(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvText.trim()) {
      setResult({ success: false, message: 'Please enter or upload CSV data first.' });
      return;
    }
    const res = bulkCsvImport(targetTable, csvText, importMode);
    if (res.success) {
      setResult({ success: true, message: `Successfully imported ${res.count} records!` });
      setTimeout(() => {
        onClose();
        setResult(null);
        setCsvText('');
      }, 1200);
    } else {
      setResult({ success: false, message: res.error || 'Import failed.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(5,28,44,0.4)] backdrop-blur-sm">
      <div className="bg-white rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] w-full max-w-2xl overflow-hidden border border-[var(--color-border)]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--table-header-bg)]">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-[var(--color-accent)]" />
            <h2 className="font-heading text-[18px] font-bold text-[var(--color-primary)]">
              Bulk CSV Import
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--color-muted)] hover:text-[var(--color-primary)] p-1 rounded-md cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Target Table Selector */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-1">
                Target Sheet / Table
              </label>
              <select
                value={targetTable}
                onChange={(e) => {
                  setTargetTable(e.target.value as TableTarget);
                  setResult(null);
                }}
                className="w-full px-3 py-2 text-[13px] border border-[var(--color-border)] rounded-[var(--radius-sm)] bg-white text-[var(--color-primary)] focus:outline-none focus:border-[var(--color-accent)]"
              >
                <option value="expenses">03 Monthly Budget Ledger (Expenses)</option>
                <option value="inventory">08 Home Inventory</option>
                <option value="maintenance">06 Maintenance Tracker</option>
                <option value="hoa">05 HOA Tracker</option>
                <option value="improvement">09 Home Improvement</option>
              </select>
            </div>

            {/* Import Mode */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-1">
                Import Strategy
              </label>
              <div className="flex items-center gap-4 py-2">
                <label className="flex items-center gap-2 text-[13px] text-[var(--color-body-text)] cursor-pointer">
                  <input
                    type="radio"
                    name="importMode"
                    value="append"
                    checked={importMode === 'append'}
                    onChange={() => setImportMode('append')}
                    className="text-[var(--color-accent)]"
                  />
                  <span>Append to existing</span>
                </label>
                <label className="flex items-center gap-2 text-[13px] text-[var(--color-body-text)] cursor-pointer">
                  <input
                    type="radio"
                    name="importMode"
                    value="replace"
                    checked={importMode === 'replace'}
                    onChange={() => setImportMode('replace')}
                    className="text-[var(--color-accent)]"
                  />
                  <span className="text-[var(--color-negative)] font-medium">Replace table</span>
                </label>
              </div>
            </div>
          </div>

          {/* Quick load template info */}
          <div className="flex items-center justify-between text-[11px] bg-[rgba(5,28,44,0.03)] px-3 py-2 rounded-[var(--radius-sm)] text-[var(--color-muted)]">
            <span>
              Expected Headers: <code className="font-mono font-semibold text-[var(--color-primary)]">{CSV_TEMPLATES[targetTable].headers}</code>
            </span>
            <button
              type="button"
              onClick={handleLoadSample}
              className="text-[var(--color-accent)] font-semibold hover:underline cursor-pointer ml-2"
            >
              Load Sample CSV
            </button>
          </div>

          {/* CSV Input or File Upload */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-muted)]">
                CSV Data (Paste text or upload file)
              </label>
              <label className="text-[11px] text-[var(--color-accent)] hover:underline cursor-pointer flex items-center gap-1">
                <FileText className="w-3 h-3" />
                <span>Upload .csv file</span>
                <input type="file" accept=".csv,text/csv" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
            <textarea
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="Paste comma-separated values including header row..."
              rows={8}
              className="w-full px-3 py-2 font-mono text-[12px] border border-[var(--color-border)] rounded-[var(--radius-sm)] focus:outline-none focus:border-[var(--color-accent)] bg-white text-[var(--color-primary)] leading-relaxed"
            />
          </div>

          {/* Status feedback */}
          {result && (
            <div
              className={`p-3 rounded-[var(--radius-sm)] flex items-center gap-2 text-[12px] ${
                result.success ? 'bg-[rgba(0,200,83,0.1)] text-[var(--color-positive)]' : 'bg-[var(--anomaly-bg)] text-[var(--color-negative)]'
              }`}
            >
              {result.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{result.message}</span>
            </div>
          )}

          {/* Footer actions */}
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
              className="px-5 py-2 text-[13px] font-semibold text-white bg-[var(--color-accent)] hover:opacity-90 rounded-[var(--radius-sm)] transition-all cursor-pointer shadow-sm"
            >
              Process & Import Data
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
