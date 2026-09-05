import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency, getHoaStatus } from '../utils/calculations';
import { HoaRecord } from '../types';
import { 
  Building, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Trash2, 
  Info 
} from 'lucide-react';

export const HoaTrackerView: React.FC = () => {
  const { state, updateState } = useApp();
  const { hoaRecords, params, profile } = state;
  const currency = params.PARAM_CURRENCY_SYM || '$';
  const targetYear = params.PARAM_ANNUAL_REV_YEAR;
  const graceDays = params.PARAM_HOA_GRACE_DAYS || 15;

  const [showAddForm, setShowAddForm] = useState(false);
  const [newRecord, setNewRecord] = useState<Partial<HoaRecord>>({
    billingPeriod: `${targetYear}-10`,
    feeType: 'Regular Dues',
    dueDate: `${targetYear}-10-15`,
    amountDue: profile.monthlyHoaDues || 175,
    paymentDate: '',
    amountPaid: 0,
    paymentRef: '',
  });

  // KPI Calculations
  const { ytdPaid, ytdSpecialAssessments, pendingLateBalance } = useMemo(() => {
    let paid = 0;
    let special = 0;
    let pending = 0;

    for (const r of hoaRecords) {
      const isTargetYear = r.billingPeriod?.startsWith(String(targetYear));
      if (isTargetYear) {
        paid += r.amountPaid || 0;
        if (r.feeType === 'Special Assessment') {
          special += r.amountPaid || 0;
        }
      }
      // Check current open liabilities
      const statusObj = getHoaStatus(r.amountDue, r.amountPaid, r.dueDate, graceDays);
      if (statusObj.status !== 'Paid') {
        pending += Math.max(0, r.amountDue - (r.amountPaid || 0));
      }
    }

    return { ytdPaid: paid, ytdSpecialAssessments: special, pendingLateBalance: pending };
  }, [hoaRecords, targetYear, graceDays]);

  const handleUpdateRecord = (id: string, field: keyof HoaRecord, value: any) => {
    updateState((prev) => ({
      ...prev,
      hoaRecords: prev.hoaRecords.map((r) =>
        r.id === id ? { ...r, [field]: value } : r
      ),
    }));
  };

  const handleMarkPaid = (record: HoaRecord) => {
    const todayStr = new Date().toISOString().split('T')[0];
    handleUpdateRecord(record.id, 'paymentDate', todayStr);
    handleUpdateRecord(record.id, 'amountPaid', record.amountDue);
    handleUpdateRecord(record.id, 'paymentRef', `ACH-${Date.now().toString().slice(-4)}`);
  };

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `hoa-${Date.now()}`;
    const record: HoaRecord = {
      id,
      billingPeriod: newRecord.billingPeriod || `${targetYear}-01`,
      feeType: newRecord.feeType || 'Regular Dues',
      dueDate: newRecord.dueDate || `${targetYear}-01-15`,
      amountDue: Number(newRecord.amountDue) || 175,
      paymentDate: newRecord.paymentDate || '',
      amountPaid: Number(newRecord.amountPaid) || 0,
      paymentRef: newRecord.paymentRef || '',
    };

    updateState((prev) => ({
      ...prev,
      hoaRecords: [...prev.hoaRecords, record],
    }));

    setNewRecord({
      billingPeriod: `${targetYear}-11`,
      feeType: 'Regular Dues',
      dueDate: `${targetYear}-11-15`,
      amountDue: profile.monthlyHoaDues || 175,
      paymentDate: '',
      amountPaid: 0,
      paymentRef: '',
    });
    setShowAddForm(false);
  };

  const handleDeleteRecord = (id: string) => {
    updateState((prev) => ({
      ...prev,
      hoaRecords: prev.hoaRecords.filter((r) => r.id !== id),
    }));
  };

  return (
    <div className="space-y-8 tab-content-enter">
      {/* Page Header */}
      <div className="border-b border-[var(--color-border)] pb-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-[0.06em] text-[var(--color-muted)] font-semibold">
            Sheet 05 / HOA Compliance & Assessments
          </span>
          <h1 className="font-display text-[30px] font-bold text-[var(--color-primary)] mt-1 tracking-[-0.03em]">
            HOA Dues & Special Assessment Tracker
          </h1>
        </div>
        <p className="text-[13px] text-[var(--color-muted)]">
          Audit regular community dues against sudden non-recurring capital assessments.
        </p>
      </div>

      {/* KPI Cards (B3:G4) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="apple-card p-5">
          <div className="flex items-center justify-between text-[var(--color-muted)] mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.05em]">YTD HOA Paid ({targetYear})</span>
            <Building className="w-4 h-4 text-[var(--color-muted)]" />
          </div>
          <div className="font-display text-[34px] font-bold text-[var(--color-primary)] tracking-[-0.03em]">
            {formatCurrency(ytdPaid, currency)}
          </div>
          <div className="text-[12px] text-[var(--color-muted)] mt-1">
            Regular dues + special assessments
          </div>
        </div>

        <div className="apple-card p-5">
          <div className="flex items-center justify-between text-[var(--color-muted)] mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.05em]">Special Assessments</span>
            <Info className="w-4 h-4 text-[var(--color-accent)]" />
          </div>
          <div className="font-display text-[34px] font-bold text-[var(--color-accent)] tracking-[-0.03em]">
            {formatCurrency(ytdSpecialAssessments, currency)}
          </div>
          <div className="text-[12px] text-[var(--color-muted)] mt-1">
            Community capital improvement charges
          </div>
        </div>

        <div className="apple-card p-5">
          <div className="flex items-center justify-between text-[var(--color-muted)] mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.05em]">Pending / Late Balance</span>
            {pendingLateBalance > 0 ? (
              <AlertCircle className="w-4 h-4 text-[var(--color-negative)]" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-[var(--color-positive)]" />
            )}
          </div>
          <div
            className={`font-display text-[34px] font-bold tracking-[-0.03em] ${
              pendingLateBalance > 0 ? 'text-[var(--color-negative)]' : 'text-[var(--color-primary)]'
            }`}
          >
            {formatCurrency(pendingLateBalance, currency)}
          </div>
          <div className="text-[12px] text-[var(--color-muted)] mt-1">
            {pendingLateBalance > 0 ? 'Requires prompt payment action' : 'All accounts currently settled'}
          </div>
        </div>
      </div>

      {/* Insight Block */}
      <div className="insight-block">
        <div className="flex items-start gap-3">
          <Info className="w-4 h-4 text-[var(--color-accent)] mt-0.5 flex-shrink-0" />
          <div className="text-[12px] text-[var(--color-body-text)] leading-relaxed">
            Grace period is set to <strong>{graceDays} days</strong> (PARAM_HOA_GRACE_DAYS). Status switches from{' '}
            <span className="px-1.5 py-0.5 rounded bg-[rgba(5,28,44,0.06)] font-mono">Pending</span> to{' '}
            <span className="px-1.5 py-0.5 rounded bg-[var(--color-input-bg)] text-amber-900 border border-amber-300 font-mono">Grace Period</span>, then flags a critical{' '}
            <span className="px-1.5 py-0.5 rounded bg-[var(--anomaly-bg)] text-[var(--color-negative)] font-mono font-bold">Late</span> alert to avoid HOA delinquency fees.
          </div>
        </div>
      </div>

      {/* Table_HOA */}
      <div className="apple-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-[var(--color-border)] pb-3">
          <div>
            <h2 className="font-heading text-[18px] font-bold text-[var(--color-primary)]">
              HOA Ledger & Compliance Matrix (B6:J100)
            </h2>
            <p className="text-[12px] text-[var(--color-muted)]">
              Status and overdue days compute dynamically based on current date and grace parameters.
            </p>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] bg-[var(--color-primary)] text-white text-[12px] font-medium hover:opacity-90 transition-opacity cursor-pointer self-start sm:self-auto shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showAddForm ? 'Cancel' : 'Add HOA Assessment'}</span>
          </button>
        </div>

        {/* Add HOA Drawer */}
        {showAddForm && (
          <form
            onSubmit={handleAddRecord}
            className="mb-6 p-4 rounded-[var(--radius-sm)] bg-[var(--color-bg)]/80 border border-[var(--color-border)] space-y-4 animate-fadeIn"
          >
            <h3 className="font-bold text-[13px] text-[var(--color-primary)]">Schedule HOA Assessment</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-muted)] mb-1 uppercase">Period (YYYY-MM)</label>
                <input
                  type="text"
                  placeholder="2026-09"
                  required
                  value={newRecord.billingPeriod}
                  onChange={(e) => setNewRecord({ ...newRecord, billingPeriod: e.target.value })}
                  className="w-full px-3 py-2 bg-white text-[13px] border border-[var(--color-border)] rounded-[var(--radius-sm)] font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-muted)] mb-1 uppercase">Fee Classification</label>
                <select
                  value={newRecord.feeType}
                  onChange={(e) => setNewRecord({ ...newRecord, feeType: e.target.value as any })}
                  className="w-full px-3 py-2 bg-white text-[13px] border border-[var(--color-border)] rounded-[var(--radius-sm)]"
                >
                  <option value="Regular Dues">Regular Dues</option>
                  <option value="Special Assessment">Special Assessment</option>
                  <option value="Violation / Fine">Violation / Fine</option>
                  <option value="Parking / Storage">Parking / Storage</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-muted)] mb-1 uppercase">Due Date *</label>
                <input
                  type="date"
                  required
                  value={newRecord.dueDate}
                  onChange={(e) => setNewRecord({ ...newRecord, dueDate: e.target.value })}
                  className="w-full px-3 py-2 bg-white text-[13px] border border-[var(--color-border)] rounded-[var(--radius-sm)]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-muted)] mb-1 uppercase">Amount Due ({currency})</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newRecord.amountDue}
                  onChange={(e) => setNewRecord({ ...newRecord, amountDue: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-white text-[13px] border border-[var(--color-border)] rounded-[var(--radius-sm)] font-bold"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 text-[12px] text-[var(--color-muted)] hover:text-[var(--color-primary)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-[12px] font-semibold text-white bg-[var(--color-accent)] rounded-[var(--radius-sm)] shadow-sm"
              >
                Schedule Assessment
              </button>
            </div>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="bg-[var(--table-header-bg)] border-b-2 border-[var(--table-header-sep)]">
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)]">Period</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)]">Fee Type</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)]">Due Date</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)] text-right">Amount Due</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)]">Payment Date</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)] text-right">Amount Paid</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)]">Ref / Check #</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)] text-center">Status</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)] text-right">Overdue</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)] text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {hoaRecords.map((r, idx) => {
                const statusObj = getHoaStatus(r.amountDue, r.amountPaid, r.dueDate, graceDays);

                return (
                  <tr
                    key={r.id}
                    className={`border-b border-[var(--color-border)] hover:bg-[rgba(5,28,44,0.02)] transition-colors ${
                      statusObj.status === 'Late'
                        ? 'bg-[var(--anomaly-bg)]'
                        : idx % 2 === 0
                        ? 'bg-white'
                        : 'bg-[var(--color-bg)]/40'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-mono font-semibold text-[var(--color-primary)]">
                      {r.billingPeriod}
                    </td>

                    <td className="py-2.5 px-3">
                      <span
                        className={`badge-pill ${
                          r.feeType === 'Special Assessment'
                            ? 'bg-[rgba(34,81,255,0.1)] text-[var(--color-accent)]'
                            : 'bg-[rgba(5,28,44,0.06)] text-[var(--color-primary)]'
                        }`}
                      >
                        {r.feeType}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 font-mono text-[12px] text-[var(--color-muted)]">
                      {r.dueDate}
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <input
                        type="number"
                        step="0.01"
                        value={r.amountDue}
                        onChange={(e) =>
                          handleUpdateRecord(r.id, 'amountDue', parseFloat(e.target.value) || 0)
                        }
                        className="w-20 px-2 py-1 input-editable text-right font-mono text-[12px] text-[var(--color-primary)]"
                      />
                    </td>

                    <td className="py-2.5 px-3">
                      <input
                        type="date"
                        value={r.paymentDate || ''}
                        onChange={(e) => handleUpdateRecord(r.id, 'paymentDate', e.target.value)}
                        className="px-2 py-1 input-editable font-mono text-[12px] text-[var(--color-primary)]"
                      />
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <input
                        type="number"
                        step="0.01"
                        value={r.amountPaid}
                        onChange={(e) =>
                          handleUpdateRecord(r.id, 'amountPaid', parseFloat(e.target.value) || 0)
                        }
                        className="w-20 px-2 py-1 input-editable text-right font-mono font-bold text-[12px] text-[var(--color-primary)]"
                      />
                    </td>

                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        placeholder="e.g. ACH-01"
                        value={r.paymentRef}
                        onChange={(e) => handleUpdateRecord(r.id, 'paymentRef', e.target.value)}
                        className="w-28 px-2 py-1 input-editable font-mono text-[11px] text-[var(--color-muted)]"
                      />
                    </td>

                    {/* Status Pill */}
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`badge-pill ${
                          statusObj.status === 'Paid'
                            ? 'bg-[rgba(5,28,44,0.06)] text-[var(--color-primary)]'
                            : statusObj.status === 'Late'
                            ? 'bg-[var(--anomaly-bg)] text-[var(--color-negative)] border border-[var(--color-negative)]/30'
                            : statusObj.status === 'Grace Period'
                            ? 'bg-[var(--color-input-bg)] text-amber-900 border border-amber-300'
                            : 'bg-[rgba(5,28,44,0.06)] text-[var(--color-muted)]'
                        }`}
                      >
                        {statusObj.status}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono text-[12px]">
                      {statusObj.daysOverdue > 0 ? (
                        <span className="text-[var(--color-negative)] font-bold">
                          {statusObj.daysOverdue} d
                        </span>
                      ) : (
                        <span className="text-[var(--color-muted)]">0 d</span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-right space-x-1">
                      {statusObj.status !== 'Paid' && (
                        <button
                          onClick={() => handleMarkPaid(r)}
                          className="px-2 py-1 text-[11px] rounded bg-[var(--color-accent)] text-white hover:opacity-90 font-medium cursor-pointer"
                          title="Auto mark fully paid today"
                        >
                          Pay
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteRecord(r.id)}
                        className="text-[var(--color-muted)] hover:text-[var(--color-negative)] p-1 rounded transition-colors inline-block"
                        title="Delete record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
