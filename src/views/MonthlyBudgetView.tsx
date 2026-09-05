import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatPercent, parseDate } from '../utils/calculations';
import { ExpenseRecord, BudgetBenchmark } from '../types';
import { 
  Plus, 
  Trash2, 
  Search, 
  Filter, 
  Receipt, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar 
} from 'lucide-react';

export const MonthlyBudgetView: React.FC = () => {
  const { state, updateState } = useApp();
  const { budgetBenchmarks, expenses, params } = state;
  const currency = params.PARAM_CURRENCY_SYM || '$';
  const targetYear = params.PARAM_ANNUAL_REV_YEAR;

  // Filter & search states
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedMonth, setSelectedMonth] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAddExpense, setShowAddExpense] = useState<boolean>(false);

  // New expense form state
  const [newExp, setNewExp] = useState<Partial<ExpenseRecord>>({
    transactionDate: new Date().toISOString().split('T')[0],
    category: 'Electricity',
    subcategory: '',
    merchant: '',
    amount: 0,
    paymentMethod: 'ACH/Auto-Pay',
    receiptRef: '',
  });

  // Calculate YTD actuals per category for targetYear
  const categoryActuals = useMemo(() => {
    const map: Record<string, number> = {};
    for (const b of budgetBenchmarks) {
      map[b.category] = 0;
    }
    for (const exp of expenses) {
      const year = parseDate(exp.transactionDate).getFullYear();
      if (year === targetYear) {
        map[exp.category] = (map[exp.category] || 0) + exp.amount;
      }
    }
    return map;
  }, [expenses, budgetBenchmarks, targetYear]);

  // Total budget and total actual
  const totalAnnualBudget = useMemo(() => {
    return budgetBenchmarks.reduce((acc, b) => acc + b.monthlyBudget * 12, 0);
  }, [budgetBenchmarks]);

  const totalYtdActual = useMemo(() => {
    return (Object.values(categoryActuals) as number[]).reduce((acc, val) => acc + (Number(val) || 0), 0);
  }, [categoryActuals]);

  const overallVariance = totalYtdActual - totalAnnualBudget;
  const overallBurnRate = totalAnnualBudget > 0 ? totalYtdActual / totalAnnualBudget : 0;

  // Handle benchmark edit
  const handleBenchmarkChange = (id: string, newMonthly: number) => {
    updateState((prev) => ({
      ...prev,
      budgetBenchmarks: prev.budgetBenchmarks.map((b) =>
        b.id === id ? { ...b, monthlyBudget: Math.max(0, newMonthly) } : b
      ),
    }));
  };

  // Add new expense
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExp.merchant?.trim() || !newExp.transactionDate) return;

    const dateStr = newExp.transactionDate;
    const yearMonth = dateStr.replace(/-/g, '').slice(0, 6);
    const id = `TX-${yearMonth}-${String(Date.now()).slice(-4)}`;

    const record: ExpenseRecord = {
      id,
      transactionDate: dateStr,
      category: newExp.category || 'Supplies',
      subcategory: newExp.subcategory || '',
      merchant: newExp.merchant || 'Vendor',
      amount: Math.abs(Number(newExp.amount) || 0),
      paymentMethod: (newExp.paymentMethod as any) || 'Credit Card',
      receiptRef: newExp.receiptRef || `REC-${Date.now().toString().slice(-4)}`,
    };

    updateState((prev) => ({
      ...prev,
      expenses: [record, ...prev.expenses],
    }));

    setNewExp({
      transactionDate: new Date().toISOString().split('T')[0],
      category: 'Electricity',
      subcategory: '',
      merchant: '',
      amount: 0,
      paymentMethod: 'ACH/Auto-Pay',
      receiptRef: '',
    });
    setShowAddExpense(false);
  };

  // Delete expense
  const handleDeleteExpense = (id: string) => {
    updateState((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((e) => e.id !== id),
    }));
  };

  // Filtered expense ledger
  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      const matchCat = selectedCategory === 'ALL' || exp.category === selectedCategory;
      const matchMonth = selectedMonth === 'ALL' || exp.transactionDate.startsWith(selectedMonth);
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        exp.merchant.toLowerCase().includes(q) ||
        exp.subcategory.toLowerCase().includes(q) ||
        exp.id.toLowerCase().includes(q) ||
        exp.receiptRef.toLowerCase().includes(q);
      return matchCat && matchMonth && matchSearch;
    });
  }, [expenses, selectedCategory, selectedMonth, searchQuery]);

  // Unique months available for filter
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    expenses.forEach((e) => {
      if (e.transactionDate) {
        set.add(e.transactionDate.slice(0, 7));
      }
    });
    return Array.from(set).sort().reverse();
  }, [expenses]);

  return (
    <div className="space-y-8 tab-content-enter">
      {/* Page Title */}
      <div className="border-b border-[var(--color-border)] pb-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-[0.06em] text-[var(--color-muted)] font-semibold">
            Sheet 03 / Cash Flow & Operating Ledger
          </span>
          <h1 className="font-display text-[30px] font-bold text-[var(--color-primary)] mt-1 tracking-[-0.03em]">
            Monthly Budget & Expense Ledger
          </h1>
        </div>
        <p className="text-[13px] text-[var(--color-muted)]">
          Dual-track architecture: category benchmarks against real transaction ledger.
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="apple-card p-5">
          <div className="flex items-center justify-between text-[var(--color-muted)] mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.05em]">Annual Budget Control</span>
            <span className="text-[11px] font-mono text-[var(--color-muted)]">{targetYear}</span>
          </div>
          <div className="font-display text-[34px] font-bold text-[var(--color-primary)] tracking-[-0.03em]">
            {formatCurrency(totalAnnualBudget, currency)}
          </div>
          <div className="text-[12px] text-[var(--color-muted)] mt-1">
            Monthly Target: {formatCurrency(totalAnnualBudget / 12, currency)}/mo
          </div>
        </div>

        <div className="apple-card p-5">
          <div className="flex items-center justify-between text-[var(--color-muted)] mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.05em]">YTD Actual Incurred</span>
            <Receipt className="w-4 h-4 text-[var(--color-muted)]" />
          </div>
          <div className="font-display text-[34px] font-bold text-[var(--color-primary)] tracking-[-0.03em]">
            {formatCurrency(totalYtdActual, currency)}
          </div>
          <div className="text-[12px] text-[var(--color-muted)] mt-1">
            {expenses.length} transactions recorded
          </div>
        </div>

        <div className="apple-card p-5">
          <div className="flex items-center justify-between text-[var(--color-muted)] mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.05em]">Budget Variance</span>
            {overallVariance > 0 ? (
              <TrendingUp className="w-4 h-4 text-[var(--color-negative)]" />
            ) : (
              <TrendingDown className="w-4 h-4 text-[var(--color-muted)]" />
            )}
          </div>
          <div
            className={`font-display text-[34px] font-bold tracking-[-0.03em] ${
              overallVariance > totalAnnualBudget * params.PARAM_BUDGET_OVER_PCT
                ? 'text-[var(--color-negative)]'
                : 'text-[var(--color-primary)]'
            }`}
          >
            {overallVariance > 0 ? `+${formatCurrency(overallVariance, currency)}` : formatCurrency(overallVariance, currency)}
          </div>
          <div className="text-[12px] text-[var(--color-muted)] mt-1">
            {overallVariance > 0 ? 'Exceeding baseline allocation' : 'Within planned allocation'}
          </div>
        </div>

        <div className="apple-card p-5">
          <div className="flex items-center justify-between text-[var(--color-muted)] mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.05em]">Burn Rate (% Consumed)</span>
            <span className="text-[11px] font-semibold text-[var(--color-accent)]">{formatPercent(overallBurnRate)}</span>
          </div>
          <div className="mt-3">
            <div className="data-bar-track w-full">
              <div
                className="data-bar-fill"
                style={{ width: `${Math.min(100, Math.round(overallBurnRate * 100))}%` }}
              />
            </div>
          </div>
          <div className="text-[12px] text-[var(--color-muted)] mt-2 flex justify-between">
            <span>Threshold: {formatPercent(params.PARAM_BUDGET_OVER_PCT)}</span>
            <span>{totalYtdActual > 0 ? 'Active' : 'No data'}</span>
          </div>
        </div>
      </div>

      {/* Area A: Category Budget Benchmarks & Variance Engine */}
      <div className="apple-card p-6">
        <div className="flex items-center justify-between mb-4 border-b border-[var(--color-border)] pb-3">
          <div>
            <h2 className="font-heading text-[18px] font-bold text-[var(--color-primary)]">
              Category Budget Benchmarks & Variance Engine (B3:H16)
            </h2>
            <p className="text-[12px] text-[var(--color-muted)]">
              Edit yellow cells to adjust monthly targets. All rows auto-aggregate YTD transactions from the ledger.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="bg-[var(--table-header-bg)] border-b-2 border-[var(--table-header-sep)]">
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)]">Budget Category</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)] text-right">
                  Monthly Budget (Input)
                </th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)] text-right">
                  Annual Budget
                </th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)] text-right">
                  YTD Actual ({targetYear})
                </th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)] text-right">
                  Variance (Diff)
                </th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)] w-[160px]">
                  Burn Rate
                </th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)] text-center">
                  Status Indicator
                </th>
              </tr>
            </thead>
            <tbody>
              {budgetBenchmarks.map((bench, idx) => {
                const actual = categoryActuals[bench.category] || 0;
                const annualBudget = bench.monthlyBudget * 12;
                const variance = actual - annualBudget;
                const burnRate = annualBudget > 0 ? actual / annualBudget : 0;
                const overPct = annualBudget > 0 ? (actual - annualBudget) / annualBudget : 0;

                let statusText = 'Within Budget';
                let isAnomaly = false;
                if (annualBudget <= 0) {
                  statusText = actual > 0 ? 'No Budget Set' : 'N/A';
                } else if (overPct > params.PARAM_BUDGET_OVER_PCT) {
                  statusText = 'Over Budget';
                  isAnomaly = true;
                } else if (overPct > 0) {
                  statusText = 'Watch';
                }

                return (
                  <tr
                    key={bench.id}
                    className={`border-b border-[var(--color-border)] ${
                      isAnomaly
                        ? 'bg-[var(--anomaly-bg)]'
                        : idx % 2 === 0
                        ? 'bg-white'
                        : 'bg-[var(--color-bg)]/40'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-semibold text-[var(--color-primary)]">
                      {bench.category}
                    </td>

                    {/* Editable Monthly Budget */}
                    <td className="py-2.5 px-3 text-right">
                      <input
                        type="number"
                        step="10"
                        value={bench.monthlyBudget}
                        onChange={(e) =>
                          handleBenchmarkChange(bench.id, parseFloat(e.target.value) || 0)
                        }
                        className="w-24 px-2 py-1 input-editable text-right font-medium text-[13px] text-[var(--color-primary)]"
                      />
                    </td>

                    {/* Calculated Annual Budget */}
                    <td className="py-2.5 px-3 text-right font-mono text-[var(--color-muted)]">
                      {formatCurrency(annualBudget, currency)}
                    </td>

                    {/* Actual Incurred */}
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-[var(--color-primary)]">
                      {formatCurrency(actual, currency)}
                    </td>

                    {/* Variance */}
                    <td
                      className={`py-2.5 px-3 text-right font-mono font-medium ${
                        isAnomaly ? 'text-[var(--color-negative)] font-bold' : 'text-[var(--color-body-text)]'
                      }`}
                    >
                      {variance > 0
                        ? `+${formatCurrency(variance, currency)}`
                        : formatCurrency(variance, currency)}
                    </td>

                    {/* Data Bar */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="data-bar-track flex-1">
                          <div
                            className="data-bar-fill"
                            style={{
                              width: `${Math.min(100, Math.round(burnRate * 100))}%`,
                              backgroundColor: isAnomaly ? 'var(--color-negative)' : 'var(--color-accent)',
                            }}
                          />
                        </div>
                        <span className="text-[11px] font-mono text-[var(--color-muted)] w-10 text-right">
                          {formatPercent(burnRate, 0)}
                        </span>
                      </div>
                    </td>

                    {/* Status Pill */}
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`badge-pill ${
                          isAnomaly
                            ? 'bg-[var(--anomaly-bg)] text-[var(--color-negative)] border border-[var(--color-negative)]/30'
                            : statusText === 'Watch'
                            ? 'bg-[var(--color-input-bg)] text-amber-900 border border-amber-300'
                            : 'bg-[rgba(5,28,44,0.06)] text-[var(--color-primary)]'
                        }`}
                      >
                        {statusText}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Area B: Expense Transaction Ledger */}
      <div className="apple-card p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 border-b border-[var(--color-border)] pb-4">
          <div>
            <h2 className="font-heading text-[18px] font-bold text-[var(--color-primary)]">
              Daily Expense Transaction Ledger (Table_Expenses B20:L1000)
            </h2>
            <p className="text-[12px] text-[var(--color-muted)]">
              Every row automatically deduces transaction period and year for cross-sheet aggregation.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => setShowAddExpense(!showAddExpense)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[var(--radius-sm)] bg-[var(--color-primary)] text-white text-[12px] font-medium hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddExpense ? 'Cancel' : 'Add Expense'}</span>
            </button>
          </div>
        </div>

        {/* Add Expense Form Drawer */}
        {showAddExpense && (
          <form
            onSubmit={handleAddExpense}
            className="mb-6 p-4 rounded-[var(--radius-sm)] bg-[var(--color-bg)]/80 border border-[var(--color-border)] space-y-4 animate-fadeIn"
          >
            <h3 className="font-bold text-[13px] text-[var(--color-primary)]">Record Outflow Transaction</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-muted)] mb-1 uppercase">Date *</label>
                <input
                  type="date"
                  required
                  value={newExp.transactionDate}
                  onChange={(e) => setNewExp({ ...newExp, transactionDate: e.target.value })}
                  className="w-full px-3 py-2 bg-white text-[13px] border border-[var(--color-border)] rounded-[var(--radius-sm)]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-muted)] mb-1 uppercase">Category *</label>
                <select
                  value={newExp.category}
                  onChange={(e) => setNewExp({ ...newExp, category: e.target.value })}
                  className="w-full px-3 py-2 bg-white text-[13px] border border-[var(--color-border)] rounded-[var(--radius-sm)]"
                >
                  {budgetBenchmarks.map((b) => (
                    <option key={b.id} value={b.category}>
                      {b.category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-muted)] mb-1 uppercase">Subcategory / Line</label>
                <input
                  type="text"
                  placeholder="e.g. Electric usage cycle"
                  value={newExp.subcategory}
                  onChange={(e) => setNewExp({ ...newExp, subcategory: e.target.value })}
                  className="w-full px-3 py-2 bg-white text-[13px] border border-[var(--color-border)] rounded-[var(--radius-sm)]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-muted)] mb-1 uppercase">Merchant / Payee *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pacific Power"
                  value={newExp.merchant}
                  onChange={(e) => setNewExp({ ...newExp, merchant: e.target.value })}
                  className="w-full px-3 py-2 bg-white text-[13px] border border-[var(--color-border)] rounded-[var(--radius-sm)]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-muted)] mb-1 uppercase">Amount ({currency}) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newExp.amount || ''}
                  onChange={(e) => setNewExp({ ...newExp, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-white text-[13px] border border-[var(--color-border)] rounded-[var(--radius-sm)] font-bold text-[var(--color-primary)]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-muted)] mb-1 uppercase">Payment Method</label>
                <select
                  value={newExp.paymentMethod}
                  onChange={(e) => setNewExp({ ...newExp, paymentMethod: e.target.value as any })}
                  className="w-full px-3 py-2 bg-white text-[13px] border border-[var(--color-border)] rounded-[var(--radius-sm)]"
                >
                  <option value="Credit Card">Credit Card</option>
                  <option value="ACH/Auto-Pay">ACH/Auto-Pay</option>
                  <option value="Checking">Checking / Debit</option>
                  <option value="Cash">Cash</option>
                  <option value="Zelle">Zelle / Wire</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-[var(--color-muted)] mb-1 uppercase">Receipt / Invoice Ref</label>
                <input
                  type="text"
                  placeholder="e.g. REC-2026-0814"
                  value={newExp.receiptRef}
                  onChange={(e) => setNewExp({ ...newExp, receiptRef: e.target.value })}
                  className="w-full px-3 py-2 bg-white text-[13px] border border-[var(--color-border)] rounded-[var(--radius-sm)] font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddExpense(false)}
                className="px-3 py-1.5 text-[12px] text-[var(--color-muted)] hover:text-[var(--color-primary)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-[12px] font-semibold text-white bg-[var(--color-accent)] rounded-[var(--radius-sm)] shadow-sm"
              >
                Save Transaction
              </button>
            </div>
          </form>
        )}

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 text-[12px]">
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter */}
            <div className="flex items-center gap-1.5 bg-white border border-[var(--color-border)] px-2.5 py-1.5 rounded-[var(--radius-sm)]">
              <Filter className="w-3.5 h-3.5 text-[var(--color-muted)]" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent text-[var(--color-primary)] font-medium focus:outline-none"
              >
                <option value="ALL">All Categories</option>
                {budgetBenchmarks.map((b) => (
                  <option key={b.id} value={b.category}>
                    {b.category}
                  </option>
                ))}
              </select>
            </div>

            {/* Month Filter */}
            <div className="flex items-center gap-1.5 bg-white border border-[var(--color-border)] px-2.5 py-1.5 rounded-[var(--radius-sm)]">
              <Calendar className="w-3.5 h-3.5 text-[var(--color-muted)]" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent text-[var(--color-primary)] font-medium focus:outline-none"
              >
                <option value="ALL">All Periods</option>
                {availableMonths.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[var(--color-muted)]" />
            <input
              type="text"
              placeholder="Search merchant, subcategory, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 border border-[var(--color-border)] rounded-[var(--radius-sm)] bg-white text-[12px] w-full sm:w-64 focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="bg-[var(--table-header-bg)] border-b-2 border-[var(--table-header-sep)]">
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)]">TX ID</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)]">Date</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)]">Category</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)]">Subcategory</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)]">Merchant / Payee</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)] text-right">Amount</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)]">Method</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)]">Receipt Ref</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)] text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map((exp, idx) => (
                <tr
                  key={exp.id}
                  className={`border-b border-[var(--color-border)] hover:bg-[rgba(5,28,44,0.02)] transition-colors ${
                    idx % 2 === 0 ? 'bg-white' : 'bg-[var(--color-bg)]/40'
                  }`}
                >
                  <td className="py-2.5 px-3 font-mono text-[11px] text-[var(--color-muted)] font-semibold">
                    {exp.id}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[12px] text-[var(--color-primary)]">
                    {exp.transactionDate}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="badge-pill bg-[rgba(5,28,44,0.06)] text-[var(--color-primary)]">
                      {exp.category}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-[12px] text-[var(--color-body-text)]">
                    {exp.subcategory || '—'}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-[var(--color-primary)]">
                    {exp.merchant}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-[var(--color-primary)]">
                    {formatCurrency(exp.amount, currency)}
                  </td>
                  <td className="py-2.5 px-3 text-[12px] text-[var(--color-muted)]">
                    {exp.paymentMethod}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-[var(--color-muted)]">
                    {exp.receiptRef}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => handleDeleteExpense(exp.id)}
                      className="text-[var(--color-muted)] hover:text-[var(--color-negative)] p-1 rounded transition-colors"
                      title="Delete Transaction"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-[var(--color-muted)] text-[12px]">
                    No expense transactions found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
