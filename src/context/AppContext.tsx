import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { AppState, SheetId } from '../types';
import { initialAppState } from '../data/initialData';

const LOCAL_STORAGE_KEY = 'homeos_state_v1';

interface AppContextType {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
  activeSheet: SheetId;
  setActiveSheet: (sheet: SheetId) => void;
  lastSaved: string;
  exportBackup: () => void;
  importBackup: (jsonString: string) => { success: boolean; error?: string };
  bulkCsvImport: (
    targetTable: 'expenses' | 'inventory' | 'maintenance' | 'hoa' | 'improvement',
    csvString: string,
    mode: 'append' | 'replace'
  ) => { success: boolean; count: number; error?: string };
  resetData: () => void;
  feedbackMessage: { text: string; type: 'success' | 'error' | 'info' } | null;
  clearFeedback: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.profile && parsed.params) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load state from localStorage', e);
    }
    return initialAppState;
  });

  const [activeSheet, setActiveSheet] = useState<SheetId>('01_START_HERE');
  const [lastSaved, setLastSaved] = useState<string>(() => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  });
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Auto-save to localStorage on state change
  useEffect(() => {
    try {
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const stateToSave = { ...state, lastSaved: now };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
      setLastSaved(now);
    } catch (e) {
      console.error('Failed to auto-save to localStorage', e);
    }
  }, [state]);

  const updateState = useCallback((updater: (prev: AppState) => AppState) => {
    setState((prev) => updater(prev));
  }, []);

  const clearFeedback = useCallback(() => {
    setFeedbackMessage(null);
  }, []);

  const showFeedback = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setFeedbackMessage({ text, type });
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 4000);
  };

  const exportBackup = useCallback(() => {
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
      const downloadAnchor = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `HomeOS_Backup_${dateStr}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showFeedback('Backup exported successfully as JSON file.', 'success');
    } catch (err) {
      showFeedback('Export failed: ' + String(err), 'error');
    }
  }, [state]);

  const importBackup = useCallback((jsonString: string): { success: boolean; error?: string } => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.profile || !parsed.params || !Array.isArray(parsed.expenses)) {
        return { success: false, error: 'Invalid HomeOS backup format: Missing required data keys.' };
      }
      setState(parsed);
      showFeedback('HomeOS data restored successfully from backup.', 'success');
      return { success: true };
    } catch (err) {
      return { success: false, error: 'JSON Parse Error: ' + (err instanceof Error ? err.message : String(err)) };
    }
  }, []);

  const resetData = useCallback(() => {
    setState(initialAppState);
    showFeedback('All workbook data has been reset to baseline defaults.', 'info');
  }, []);

  // Bulk CSV parser
  const bulkCsvImport = useCallback(
    (
      targetTable: 'expenses' | 'inventory' | 'maintenance' | 'hoa' | 'improvement',
      csvString: string,
      mode: 'append' | 'replace'
    ): { success: boolean; count: number; error?: string } => {
      try {
        const lines = csvString
          .trim()
          .split(/\r?\n/)
          .filter((line) => line.trim().length > 0);
        if (lines.length < 2) {
          return { success: false, count: 0, error: 'CSV must have at least 1 header row and 1 data row.' };
        }

        // Simple CSV splitter handling quoted values
        const parseCSVLine = (text: string) => {
          const result: string[] = [];
          let current = '';
          let inQuotes = false;
          for (let i = 0; i < text.length; i++) {
            const char = text[i];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              result.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          result.push(current.trim());
          return result;
        };

        const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
        const rows = lines.slice(1).map(parseCSVLine);

        let importedCount = 0;

        if (targetTable === 'expenses') {
          const newExpenses = rows.map((cols, idx) => {
            const date = cols[headers.indexOf('date')] || cols[0] || new Date().toISOString().split('T')[0];
            const category = cols[headers.indexOf('category')] || cols[1] || 'Supplies';
            const subcategory = cols[headers.indexOf('subcategory')] || cols[2] || '';
            const merchant = cols[headers.indexOf('merchant')] || cols[3] || 'Vendor';
            const amount = parseFloat((cols[headers.indexOf('amount')] || cols[4] || '0').replace(/[^0-9.-]+/g, '')) || 0;
            const method = (cols[headers.indexOf('paymentmethod')] || cols[5] || 'Credit Card') as any;
            const ref = cols[headers.indexOf('receiptref')] || cols[6] || `REC-${Date.now()}-${idx}`;

            return {
              id: `TX-${date.replace(/-/g, '').slice(0, 6)}-${String(Date.now() + idx).slice(-4)}`,
              transactionDate: date,
              category,
              subcategory,
              merchant,
              amount,
              paymentMethod: method,
              receiptRef: ref,
            };
          });

          updateState((prev) => ({
            ...prev,
            expenses: mode === 'replace' ? newExpenses : [...prev.expenses, ...newExpenses],
          }));
          importedCount = newExpenses.length;
        } else if (targetTable === 'inventory') {
          const newItems = rows.map((cols, idx) => {
            const desc = cols[0] || 'Asset Item';
            const room = cols[1] || 'Living Room';
            const cat = (cols[2] || 'Electronics') as any;
            const date = cols[3] || new Date().toISOString().split('T')[0];
            const price = parseFloat((cols[4] || '0').replace(/[^0-9.-]+/g, '')) || 0;
            const repCost = parseFloat((cols[5] || '0').replace(/[^0-9.-]+/g, '')) || price;
            const brand = cols[6] || '';
            const sn = cols[7] || '';
            const ref = cols[8] || '';

            return {
              id: `inv-csv-${Date.now()}-${idx}`,
              itemDescription: desc,
              roomLocation: room,
              assetCategory: cat,
              acquisitionDate: date,
              purchasePrice: price,
              estReplacementCost: repCost,
              brandModel: brand,
              serialNumber: sn,
              receiptRef: ref,
            };
          });

          updateState((prev) => ({
            ...prev,
            inventoryItems: mode === 'replace' ? newItems : [...prev.inventoryItems, ...newItems],
          }));
          importedCount = newItems.length;
        } else if (targetTable === 'maintenance') {
          const newTasks = rows.map((cols, idx) => {
            const task = cols[0] || 'Maintenance Task';
            const system = (cols[1] || 'HVAC') as any;
            const freqVal = parseInt(cols[2] || '6', 10) || 6;
            const freqUnit = (cols[3] || 'Months') as any;
            const lastDate = cols[4] || new Date().toISOString().split('T')[0];
            const vendor = cols[5] || 'DIY';
            const cost = parseFloat((cols[6] || '0').replace(/[^0-9.-]+/g, '')) || 0;
            const notes = cols[7] || '';

            return {
              id: `mt-csv-${Date.now()}-${idx}`,
              taskName: task,
              systemCategory: system,
              frequencyValue: freqVal,
              frequencyUnit: freqUnit,
              lastCompletedDate: lastDate,
              assignedVendor: vendor,
              actualCost: cost,
              notesSpecs: notes,
            };
          });

          updateState((prev) => ({
            ...prev,
            maintenanceTasks: mode === 'replace' ? newTasks : [...prev.maintenanceTasks, ...newTasks],
          }));
          importedCount = newTasks.length;
        } else if (targetTable === 'hoa') {
          const newHoa = rows.map((cols, idx) => {
            const period = cols[0] || '2026-01';
            const feeType = (cols[1] || 'Regular Dues') as any;
            const dueDate = cols[2] || `${period}-15`;
            const amtDue = parseFloat((cols[3] || '175').replace(/[^0-9.-]+/g, '')) || 175;
            const payDate = cols[4] || '';
            const amtPaid = parseFloat((cols[5] || '0').replace(/[^0-9.-]+/g, '')) || 0;
            const ref = cols[6] || '';

            return {
              id: `hoa-csv-${Date.now()}-${idx}`,
              billingPeriod: period,
              feeType,
              dueDate,
              amountDue: amtDue,
              paymentDate: payDate,
              amountPaid: amtPaid,
              paymentRef: ref,
            };
          });

          updateState((prev) => ({
            ...prev,
            hoaRecords: mode === 'replace' ? newHoa : [...prev.hoaRecords, ...newHoa],
          }));
          importedCount = newHoa.length;
        } else if (targetTable === 'improvement') {
          const newProj = rows.map((cols, idx) => {
            const title = cols[0] || 'Project Title';
            const area = cols[1] || 'Interior';
            const cls = (cols[2] || 'Capital Improvement') as any;
            const start = cols[3] || new Date().toISOString().split('T')[0];
            const comp = cols[4] || '';
            const contractor = cols[5] || '';
            const budget = parseFloat((cols[6] || '0').replace(/[^0-9.-]+/g, '')) || 0;
            const actual = parseFloat((cols[7] || '0').replace(/[^0-9.-]+/g, '')) || 0;
            const permit = cols[8] || '';
            const warr = cols[9] || '';

            return {
              id: `imp-csv-${Date.now()}-${idx}`,
              projectTitle: title,
              areaScope: area,
              classification: cls,
              startDate: start,
              completionDate: comp,
              contractor,
              budgetedCost: budget,
              actualCost: actual,
              permitNumber: permit,
              contractorWarrantyExp: warr,
            };
          });

          updateState((prev) => ({
            ...prev,
            improvementProjects: mode === 'replace' ? newProj : [...prev.improvementProjects, ...newProj],
          }));
          importedCount = newProj.length;
        }

        showFeedback(`Successfully imported ${importedCount} records into ${targetTable}.`, 'success');
        return { success: true, count: importedCount };
      } catch (err) {
        const errorMsg = 'Failed to parse CSV: ' + (err instanceof Error ? err.message : String(err));
        showFeedback(errorMsg, 'error');
        return { success: false, count: 0, error: errorMsg };
      }
    },
    [updateState]
  );

  return (
    <AppContext.Provider
      value={{
        state,
        updateState,
        activeSheet,
        setActiveSheet,
        lastSaved,
        exportBackup,
        importBackup,
        bulkCsvImport,
        resetData,
        feedbackMessage,
        clearFeedback,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
