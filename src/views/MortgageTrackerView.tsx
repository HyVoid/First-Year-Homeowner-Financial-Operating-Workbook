import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  formatCurrency, 
  calculateAmortizationSchedule 
} from '../utils/calculations';
import { MortgagePayment } from '../types';
import { 
  DollarSign, 
  TrendingUp, 
  Percent, 
  PiggyBank, 
  Plus, 
  Trash2, 
  Info 
} from 'lucide-react';

export const MortgageTrackerView: React.FC = () => {
  const { state, updateState } = useApp();
  const { profile, mortgagePayments, params } = state;
  const currency = params.PARAM_CURRENCY_SYM || '$';

  const amort = calculateAmortizationSchedule(
    profile.originalPrincipal,
    profile.nominalRate,
    mortgagePayments
  );

  const [showAddRow, setShowAddRow] = useState(false);
  const nextPeriod = (mortgagePayments[mortgagePayments.length - 1]?.period || 0) + 1;
  const [newPay, setNewPay] = useState<MortgagePayment>({
    period: nextPeriod,
    paymentDate: new Date().toISOString().split('T')[0],
    scheduledPI: amort.schedule[0]?.scheduledPI || 2390.41,
    actualEscrowPaid: profile.monthlyEscrow || 580,
    extraPrincipal: 0,
  });

  const handleUpdatePayment = (period: number, field: keyof MortgagePayment, value: any) => {
    updateState((prev) => ({
      ...prev,
      mortgagePayments: prev.mortgagePayments.map((p) =>
        p.period === period ? { ...p, [field]: value } : p
      ),
    }));
  };

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    updateState((prev) => ({
      ...prev,
      mortgagePayments: [...prev.mortgagePayments, newPay],
    }));
    setNewPay({
      period: nextPeriod + 1,
      paymentDate: new Date().toISOString().split('T')[0],
      scheduledPI: amort.schedule[0]?.scheduledPI || 2390.41,
      actualEscrowPaid: profile.monthlyEscrow || 580,
      extraPrincipal: 0,
    });
    setShowAddRow(false);
  };

  const handleDeletePayment = (period: number) => {
    updateState((prev) => ({
      ...prev,
      mortgagePayments: prev.mortgagePayments.filter((p) => p.period !== period),
    }));
  };

  // Equity vs Interest total ratio
  const totalPaidToMortgage = amort.totalEquityBuilt + amort.totalInterestLost;
  const equityShare = totalPaidToMortgage > 0 ? amort.totalEquityBuilt / totalPaidToMortgage : 0;
  const interestShare = totalPaidToMortgage > 0 ? amort.totalInterestLost / totalPaidToMortgage : 0;

  return (
    <div className="space-y-8 tab-content-enter">
      {/* Page Header */}
      <div className="border-b border-[var(--color-border)] pb-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-[0.06em] text-[var(--color-muted)] font-semibold">
            Sheet 04 / Debt Amortization & Capital Accumulation
          </span>
          <h1 className="font-display text-[30px] font-bold text-[var(--color-primary)] mt-1 tracking-[-0.03em]">
            Mortgage Repayment & Amortization Tracker
          </h1>
        </div>
        <p className="text-[13px] text-[var(--color-muted)]">
          Decouple monthly cash outlays into permanent equity accumulation vs interest sunk cost.
        </p>
      </div>

      {/* KPI Cards (B3:I4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="apple-card p-5">
          <div className="flex items-center justify-between text-[var(--color-muted)] mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.05em]">Total Equity Built</span>
            <PiggyBank className="w-4 h-4 text-[var(--color-accent)]" />
          </div>
          <div className="font-display text-[34px] font-bold text-[var(--color-primary)] tracking-[-0.03em]">
            {formatCurrency(amort.totalEquityBuilt, currency)}
          </div>
          <div className="text-[12px] text-[var(--color-muted)] mt-1">
            Principal balance reduced on asset
          </div>
        </div>

        {/* KPI 2 */}
        <div className="apple-card p-5">
          <div className="flex items-center justify-between text-[var(--color-muted)] mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.05em]">Total Interest Lost</span>
            <DollarSign className="w-4 h-4 text-[var(--color-muted)]" />
          </div>
          <div className="font-display text-[34px] font-bold text-[var(--color-muted)] tracking-[-0.03em]">
            {formatCurrency(amort.totalInterestLost, currency)}
          </div>
          <div className="text-[12px] text-[var(--color-muted)] mt-1">
            Financing cost paid to lender
          </div>
        </div>

        {/* KPI 3 */}
        <div className="apple-card p-5">
          <div className="flex items-center justify-between text-[var(--color-muted)] mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.05em]">Extra Principal Paid</span>
            <TrendingUp className="w-4 h-4 text-[var(--color-accent)]" />
          </div>
          <div className="font-display text-[34px] font-bold text-[var(--color-accent)] tracking-[-0.03em]">
            {formatCurrency(amort.totalExtraPaid, currency)}
          </div>
          <div className="text-[12px] text-[var(--color-muted)] mt-1">
            Voluntary prepayment accelerations
          </div>
        </div>

        {/* KPI 4 */}
        <div className="apple-card p-5">
          <div className="flex items-center justify-between text-[var(--color-muted)] mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.05em]">Est. Interest Saved</span>
            <Percent className="w-4 h-4 text-[var(--color-accent)]" />
          </div>
          <div className="font-display text-[34px] font-bold text-[var(--color-primary)] tracking-[-0.03em]">
            {formatCurrency(amort.estInterestSaved, currency)}
          </div>
          <div className="text-[12px] text-[var(--color-muted)] mt-1">
            Compounding lifetime savings
          </div>
        </div>
      </div>

      {/* Insight & Ratio Visualizer */}
      <div className="insight-block">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-[var(--color-accent)]" />
              <h3 className="font-bold text-[14px] text-[var(--color-primary)]">
                First-Year Amortization Reality Check
              </h3>
            </div>
            <p className="text-[12px] text-[var(--color-body-text)] leading-relaxed">
              Early in a 30-year fixed schedule at {(profile.nominalRate * 100).toFixed(2)}%, approx{' '}
              <strong className="text-[var(--color-primary)]">{(interestShare * 100).toFixed(1)}%</strong> of
              scheduled payments goes to unrecoverable interest, while only{' '}
              <strong className="text-[var(--color-accent)]">{(equityShare * 100).toFixed(1)}%</strong> builds home equity.
            </p>
          </div>

          {/* Inline ratio indicator */}
          <div className="w-full sm:w-64 space-y-1">
            <div className="flex justify-between text-[11px] font-semibold">
              <span className="text-[var(--color-accent)]">Equity ({(equityShare * 100).toFixed(0)}%)</span>
              <span className="text-[var(--color-muted)]">Interest ({(interestShare * 100).toFixed(0)}%)</span>
            </div>
            <div className="h-3 rounded-full bg-[rgba(5,28,44,0.1)] overflow-hidden flex">
              <div
                className="bg-[var(--color-accent)] h-full transition-all duration-300"
                style={{ width: `${equityShare * 100}%` }}
              />
              <div
                className="bg-[rgba(5,28,44,0.35)] h-full transition-all duration-300"
                style={{ width: `${interestShare * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Amortization Schedule Table */}
      <div className="apple-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-[var(--color-border)] pb-3">
          <div>
            <h2 className="font-heading text-[18px] font-bold text-[var(--color-primary)]">
              Amortization Tracking Schedule (B6:L365)
            </h2>
            <p className="text-[12px] text-[var(--color-muted)]">
              Original Principal: {formatCurrency(profile.originalPrincipal, currency)} | Nominal Rate: {(profile.nominalRate * 100).toFixed(3)}% | Term: {profile.loanTermYears} Yrs
            </p>
          </div>

          <button
            onClick={() => setShowAddRow(!showAddRow)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] bg-[var(--color-primary)] text-white text-[12px] font-medium hover:opacity-90 transition-opacity cursor-pointer self-start sm:self-auto shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showAddRow ? 'Cancel' : 'Add Payment Period'}</span>
          </button>
        </div>

        {/* Add Period Drawer */}
        {showAddRow && (
          <form
            onSubmit={handleAddPayment}
            className="mb-6 p-4 rounded-[var(--radius-sm)] bg-[var(--color-bg)]/80 border border-[var(--color-border)] space-y-4 animate-fadeIn"
          >
            <h3 className="font-bold text-[13px] text-[var(--color-primary)]">Record New Loan Payment Period</h3>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-muted)] mb-1 uppercase">Period #</label>
                <input
                  type="number"
                  value={newPay.period}
                  onChange={(e) => setNewPay({ ...newPay, period: parseInt(e.target.value, 10) || nextPeriod })}
                  className="w-full px-3 py-2 bg-white text-[13px] border border-[var(--color-border)] rounded-[var(--radius-sm)]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-muted)] mb-1 uppercase">Payment Date</label>
                <input
                  type="date"
                  value={newPay.paymentDate}
                  onChange={(e) => setNewPay({ ...newPay, paymentDate: e.target.value })}
                  className="w-full px-3 py-2 bg-white text-[13px] border border-[var(--color-border)] rounded-[var(--radius-sm)]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-muted)] mb-1 uppercase">Scheduled P&I ({currency})</label>
                <input
                  type="number"
                  step="0.01"
                  value={newPay.scheduledPI}
                  onChange={(e) => setNewPay({ ...newPay, scheduledPI: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-white text-[13px] border border-[var(--color-border)] rounded-[var(--radius-sm)] font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-muted)] mb-1 uppercase">Escrow Paid ({currency})</label>
                <input
                  type="number"
                  step="0.01"
                  value={newPay.actualEscrowPaid}
                  onChange={(e) => setNewPay({ ...newPay, actualEscrowPaid: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-white text-[13px] border border-[var(--color-border)] rounded-[var(--radius-sm)]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-muted)] mb-1 uppercase">Extra Principal ({currency})</label>
                <input
                  type="number"
                  step="0.01"
                  value={newPay.extraPrincipal}
                  onChange={(e) => setNewPay({ ...newPay, extraPrincipal: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-white text-[13px] border border-[var(--color-border)] rounded-[var(--radius-sm)] font-bold text-[var(--color-accent)]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddRow(false)}
                className="px-3 py-1.5 text-[12px] text-[var(--color-muted)] hover:text-[var(--color-primary)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-[12px] font-semibold text-white bg-[var(--color-accent)] rounded-[var(--radius-sm)] shadow-sm"
              >
                Confirm Payment Period
              </button>
            </div>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="bg-[var(--table-header-bg)] border-b-2 border-[var(--table-header-sep)]">
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)]">Period</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)]">Date (Input)</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)] text-right">Scheduled P&I</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)] text-right">Escrow Paid</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)] text-right">Extra Principal</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)] text-right font-bold">Total Cash Paid</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)] text-right">Interest (Sunk)</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)] text-right">Principal (Asset)</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)] text-right">Cumul. Equity</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)] text-right">Ending Balance</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)] text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {amort.schedule.map((row, idx) => (
                <tr
                  key={row.period}
                  className={`border-b border-[var(--color-border)] hover:bg-[rgba(5,28,44,0.02)] transition-colors ${
                    idx % 2 === 0 ? 'bg-white' : 'bg-[var(--color-bg)]/40'
                  }`}
                >
                  {/* Period # */}
                  <td className="py-2.5 px-3 font-mono font-bold text-[12px] text-[var(--color-primary)]">
                    #{row.period}
                  </td>

                  {/* Payment Date Input */}
                  <td className="py-2.5 px-3">
                    <input
                      type="date"
                      value={row.paymentDate}
                      onChange={(e) => handleUpdatePayment(row.period, 'paymentDate', e.target.value)}
                      className="px-2 py-1 input-editable font-mono text-[12px] text-[var(--color-primary)]"
                    />
                  </td>

                  {/* Scheduled P&I Input */}
                  <td className="py-2.5 px-3 text-right">
                    <input
                      type="number"
                      step="0.01"
                      value={row.scheduledPI}
                      onChange={(e) =>
                        handleUpdatePayment(row.period, 'scheduledPI', parseFloat(e.target.value) || 0)
                      }
                      className="w-24 px-2 py-1 input-editable text-right font-mono text-[12px] text-[var(--color-primary)]"
                    />
                  </td>

                  {/* Actual Escrow Paid Input */}
                  <td className="py-2.5 px-3 text-right">
                    <input
                      type="number"
                      step="0.01"
                      value={row.actualEscrowPaid}
                      onChange={(e) =>
                        handleUpdatePayment(row.period, 'actualEscrowPaid', parseFloat(e.target.value) || 0)
                      }
                      className="w-20 px-2 py-1 input-editable text-right font-mono text-[12px] text-[var(--color-primary)]"
                    />
                  </td>

                  {/* Extra Principal Input */}
                  <td className="py-2.5 px-3 text-right">
                    <input
                      type="number"
                      step="50"
                      value={row.extraPrincipal}
                      onChange={(e) =>
                        handleUpdatePayment(row.period, 'extraPrincipal', parseFloat(e.target.value) || 0)
                      }
                      className="w-20 px-2 py-1 input-editable text-right font-mono font-bold text-[12px] text-[var(--color-accent)]"
                    />
                  </td>

                  {/* Total Cash Paid (Calculated) */}
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-[var(--color-primary)]">
                    {formatCurrency(row.totalCashPaid, currency)}
                  </td>

                  {/* Interest Paid (Calculated) */}
                  <td className="py-2.5 px-3 text-right font-mono text-[var(--color-muted)]">
                    {formatCurrency(row.interestPaid, currency)}
                  </td>

                  {/* Principal Paid (Calculated) */}
                  <td className="py-2.5 px-3 text-right font-mono font-semibold text-[var(--color-accent)]">
                    {formatCurrency(row.principalPaid, currency)}
                  </td>

                  {/* Cumulative Principal (Calculated) */}
                  <td className="py-2.5 px-3 text-right font-mono text-[var(--color-body-text)]">
                    {formatCurrency(row.cumulativePrincipal, currency)}
                  </td>

                  {/* Ending Balance (Calculated) */}
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-[var(--color-primary)]">
                    {formatCurrency(row.endingBalance, currency)}
                  </td>

                  {/* Delete Row Action */}
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => handleDeletePayment(row.period)}
                      className="text-[var(--color-muted)] hover:text-[var(--color-negative)] p-1 rounded transition-colors"
                      title="Delete Period"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
