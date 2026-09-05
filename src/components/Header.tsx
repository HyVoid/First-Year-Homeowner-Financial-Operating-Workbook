import React from 'react';
import { useApp } from '../context/AppContext';
import { SheetId } from '../types';
import { 
  Home, 
  Download, 
  Upload, 
  FileSpreadsheet, 
  RotateCcw, 
  Clock, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

interface HeaderProps {
  onOpenCsvImport: () => void;
  onOpenJsonImport: () => void;
  onOpenResetConfirm: () => void;
}

const TABS: Array<{ id: SheetId; label: string; code: string }> = [
  { id: '01_START_HERE', code: '01', label: 'Start Here' },
  { id: '02_HOME_PROFILE', code: '02', label: 'Home Profile' },
  { id: '03_MONTHLY_BUDGET', code: '03', label: 'Monthly Budget' },
  { id: '04_MORTGAGE_TRACKER', code: '04', label: 'Mortgage Tracker' },
  { id: '05_HOA_TRACKER', code: '05', label: 'HOA Tracker' },
  { id: '06_MAINTENANCE_TRACKER', code: '06', label: 'Maintenance' },
  { id: '07_WARRANTY_TRACKER', code: '07', label: 'Warranty' },
  { id: '08_HOME_INVENTORY', code: '08', label: 'Home Inventory' },
  { id: '09_HOME_IMPROVEMENT', code: '09', label: 'Improvements' },
  { id: '10_ANNUAL_REVIEW', code: '10', label: 'Annual Review' },
];

export const Header: React.FC<HeaderProps> = ({
  onOpenCsvImport,
  onOpenJsonImport,
  onOpenResetConfirm,
}) => {
  const { activeSheet, setActiveSheet, lastSaved, exportBackup, feedbackMessage, clearFeedback } = useApp();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E5E5E5] shrink-0">
      {/* Top 56px Bar */}
      <div className="h-[56px] px-6 sm:px-10 flex items-center justify-between max-w-[1400px] mx-auto">
        {/* Left: Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#051C2C] rounded-[6px] flex items-center justify-center text-white font-bold text-[15px] shadow-sm">
            H
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-[18px] tracking-tight text-[#051C2C]">
              HOMEOS <span className="font-light text-[#888888]">PRO</span>
            </span>
            <span className="hidden lg:inline-block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#888888] ml-2 pl-2 border-l border-[#E5E5E5]">
              First-Year Homeowner Operating System
            </span>
          </div>
        </div>

        {/* Right: Actions and Last Saved */}
        <div className="flex items-center gap-3">
          {/* Last Saved Badge */}
          <div className="text-[11px] text-[#888888] italic hidden sm:flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00C853]" />
            <span>Last saved: {lastSaved} (Local)</span>
          </div>

          <div className="h-4 w-[1px] bg-[#E5E5E5] hidden sm:block mx-1" />

          {/* Action Buttons */}
          <button
            onClick={exportBackup}
            title="Export JSON Backup"
            className="bg-white border border-[#E5E5E5] px-3 py-1.5 rounded-md hover:bg-gray-50 flex items-center gap-1.5 text-[12px] font-medium text-[#051C2C] transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#2251FF]" />
            <span className="hidden md:inline">Export</span>
          </button>

          <button
            onClick={onOpenCsvImport}
            title="Bulk CSV Import"
            className="bg-[#051C2C] text-white px-3.5 py-1.5 rounded-md font-medium text-[12px] hover:opacity-90 flex items-center gap-1.5 transition-opacity cursor-pointer shadow-sm"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-white" />
            <span>Bulk CSV</span>
          </button>

          <button
            onClick={onOpenJsonImport}
            title="Import JSON Backup"
            className="bg-white border border-[#E5E5E5] px-2.5 py-1.5 rounded-md hover:bg-gray-50 flex items-center gap-1 text-[12px] font-medium text-[#888888] hover:text-[#051C2C] transition-colors cursor-pointer hidden lg:flex"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import</span>
          </button>

          <button
            onClick={onOpenResetConfirm}
            title="Reset to Initial Data"
            className="text-[#D32F2F] hover:bg-red-50 px-2 py-1 rounded transition-colors uppercase tracking-widest text-[10px] font-bold cursor-pointer hidden xl:inline-block"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Sheet Tabs Navigation Bar */}
      <div className="bg-white border-t border-[#E5E5E5] px-6 sm:px-10 overflow-x-auto no-scrollbar max-w-[1400px] mx-auto">
        <nav className="flex space-x-1 min-w-max" aria-label="Sheets Navigation">
          {TABS.map((tab) => {
            const isActive = activeSheet === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSheet(tab.id)}
                className={`h-[42px] px-3.5 text-[12px] transition-all relative flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'text-[#2251FF] font-semibold border-b-2 border-[#2251FF]'
                    : 'text-[#888888] hover:text-[#051C2C]'
                }`}
              >
                <span className={`text-[10px] font-mono ${isActive ? 'text-[#2251FF]/70' : 'text-[#888888]'}`}>
                  {tab.code}
                </span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Global Feedback Toast */}
      {feedbackMessage && (
        <div className="px-6 py-2 bg-[var(--insight-bg)] border-b border-[var(--color-accent)]/20 text-[12px] text-[var(--color-primary)] flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2 max-w-[1400px] mx-auto w-full">
            {feedbackMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-[var(--color-negative)]" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-[var(--color-accent)]" />
            )}
            <span>{feedbackMessage.text}</span>
            <button
              onClick={clearFeedback}
              className="ml-auto text-[var(--color-muted)] hover:text-[var(--color-primary)] text-[11px] underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
