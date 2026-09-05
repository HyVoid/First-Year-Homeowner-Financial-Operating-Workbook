import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ArrowRight, 
  Sparkles, 
  Sliders, 
  DollarSign, 
  PieChart 
} from 'lucide-react';
import { formatCurrency, calculateDaysRemaining, addPeriodToDate, getWarrantyStatus } from '../utils/calculations';

export const StartHereView: React.FC = () => {
  const { state, setActiveSheet } = useApp();
  const { profile, params, warrantyItems, maintenanceTasks, inventoryItems, budgetBenchmarks, expenses } = state;
  const currency = params.PARAM_CURRENCY_SYM || '$';

  // Real-time calculations for Professional Polish Executive Overview
  const totalAssetValuation = useMemo(() => {
    const invTotal = inventoryItems.reduce((acc, i) => acc + (i.purchasePrice || i.originalCost || i.estReplacementCost || 0), 0);
    return (profile.purchasePrice || 650000) + invTotal;
  }, [profile.purchasePrice, inventoryItems]);

  const criticalIssuesCount = useMemo(() => {
    let count = 0;
    const warnDays = params.PARAM_WARR_WARN_DAYS || 60;
    warrantyItems.forEach((w) => {
      const exp = addPeriodToDate(w.purchaseDate, w.periodValue, w.periodUnit);
      const days = calculateDaysRemaining(exp);
      const st = getWarrantyStatus(days, warnDays);
      if (st.status === 'Expiring Soon' || st.status === 'Expired') count++;
    });
    maintenanceTasks.forEach((m) => {
      if (m.lastCompletedDate) {
        const nextDue = addPeriodToDate(m.lastCompletedDate, m.frequencyValue, m.frequencyUnit);
        const days = calculateDaysRemaining(nextDue);
        if (days < 0) count++;
      }
    });
    return count;
  }, [warrantyItems, maintenanceTasks, params.PARAM_WARR_WARN_DAYS]);

  const budgetMetrics = useMemo(() => {
    const totalAlloc = (budgetBenchmarks || []).reduce((acc, c) => acc + (c.monthlyBudget * 12 || 0), 0);
    const totalSpent = (expenses || []).reduce((acc, e) => acc + (e.amount || 0), 0);
    const bufferPct = totalAlloc > 0 ? Math.max(0, Math.min(100, Math.round(((totalAlloc - totalSpent) / totalAlloc) * 100))) : 82;
    return { totalAlloc, totalSpent, bufferPct };
  }, [budgetBenchmarks, expenses]);

  return (
    <div className="space-y-8 tab-content-enter">
      {/* Page Header */}
      <div className="border-b border-[#E5E5E5] pb-5">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-[0.06em] text-[#888888] font-semibold">
              Sheet 01 / Operating Executive Summary
            </span>
            <h1 className="font-display text-[32px] font-bold text-[#051C2C] mt-1 tracking-[-0.03em]">
              Welcome to HomeOS <span className="font-light text-[#888888]">PRO</span>
            </h1>
          </div>
          <p className="text-[13px] text-[#888888] max-w-md text-left sm:text-right">
            First-Year Homeowner Financial & Operating System. Commercial Turnkey Architecture.
          </p>
        </div>
      </div>

      {/* Professional Polish: KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        <div className="card p-5">
          <div className="header-caps mb-1">Total Asset Exposure</div>
          <div className="serif text-[32px] font-bold text-[#051C2C]">
            {formatCurrency(totalAssetValuation, currency)}
          </div>
          <div className="text-[#00C853] text-[11px] mt-1 font-medium">
            Acquisition + Personal Property
          </div>
        </div>

        <div className="card p-5">
          <div className="header-caps mb-1">Financing Efficiency</div>
          <div className="serif text-[32px] font-bold text-[#051C2C]">
            {(100 - ((profile.nominalRate || 0.065) * 100)).toFixed(1)}%
          </div>
          <div className="text-[#888888] text-[11px] mt-1">
            Interest index benchmark
          </div>
        </div>

        <div className="card p-5">
          <div className="header-caps mb-1">Liquidity Buffer</div>
          <div className="serif text-[32px] font-bold text-[#2251FF]">
            {budgetMetrics.bufferPct}%
          </div>
          <div className="w-full data-bar-track mt-2">
            <div className="data-bar-fill" style={{ width: `${budgetMetrics.bufferPct}%` }} />
          </div>
        </div>

        <div className={`card p-5 ${criticalIssuesCount > 0 ? 'border-l-4 border-l-[#D32F2F]' : ''}`}>
          <div className="header-caps mb-1">Critical Thresholds</div>
          <div className={`serif text-[32px] font-bold ${criticalIssuesCount > 0 ? 'text-[#D32F2F]' : 'text-[#051C2C]'}`}>
            {criticalIssuesCount < 10 ? `0${criticalIssuesCount}` : criticalIssuesCount}
          </div>
          <div className={`text-[11px] mt-1 ${criticalIssuesCount > 0 ? 'text-[#D32F2F]' : 'text-[#888888]'}`}>
            {criticalIssuesCount > 0 ? 'Requires proactive audit' : 'All systems normal'}
          </div>
        </div>
      </div>

      {/* Main Data & Operating Matrix Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Module Health Matrix */}
        <div className="card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="serif text-[18px] font-bold text-[#051C2C]">System Health Matrix</h2>
              <span className="text-[11px] font-mono text-[#888888] uppercase">10 Modules Live</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              <div 
                onClick={() => setActiveSheet('01_START_HERE')}
                title="Sheet 01: System Status" 
                className="matrix-cell h-12 bg-[#2251FF] rounded flex items-center justify-center text-white font-bold text-xs cursor-pointer"
              >
                01
              </div>
              <div 
                onClick={() => setActiveSheet('02_HOME_PROFILE')}
                title="Sheet 02: Baseline Profile" 
                className="matrix-cell h-12 bg-[#051C2C] opacity-80 hover:opacity-100 rounded flex items-center justify-center text-white font-bold text-xs cursor-pointer"
              >
                02
              </div>
              <div 
                onClick={() => setActiveSheet('03_MONTHLY_BUDGET')}
                title="Sheet 03: Cash Flow" 
                className="matrix-cell h-12 bg-[#2251FF] opacity-70 hover:opacity-100 rounded flex items-center justify-center text-white font-bold text-xs cursor-pointer"
              >
                03
              </div>
              <div 
                onClick={() => setActiveSheet('04_MORTGAGE_TRACKER')}
                title="Sheet 04: Loan Amortization" 
                className="matrix-cell h-12 bg-[#051C2C] opacity-90 hover:opacity-100 rounded flex items-center justify-center text-white font-bold text-xs cursor-pointer"
              >
                04
              </div>
              <div 
                onClick={() => setActiveSheet('05_HOA_TRACKER')}
                title="Sheet 05: HOA Compliance" 
                className="matrix-cell h-12 bg-[#051C2C] opacity-60 hover:opacity-100 rounded flex items-center justify-center text-white font-bold text-xs cursor-pointer"
              >
                05
              </div>
              <div 
                onClick={() => setActiveSheet('06_MAINTENANCE_TRACKER')}
                title="Sheet 06: Preventative Maintenance" 
                className="matrix-cell h-12 bg-[#2251FF] opacity-80 hover:opacity-100 rounded flex items-center justify-center text-white font-bold text-xs cursor-pointer"
              >
                06
              </div>
              <div 
                onClick={() => setActiveSheet('07_WARRANTY_TRACKER')}
                title="Sheet 07: Warranty Registry" 
                className={`matrix-cell h-12 ${criticalIssuesCount > 0 ? 'bg-[#D32F2F]' : 'bg-[#051C2C] opacity-70'} hover:opacity-100 rounded flex items-center justify-center text-white font-bold text-xs cursor-pointer`}
              >
                07
              </div>
              <div 
                onClick={() => setActiveSheet('08_HOME_INVENTORY')}
                title="Sheet 08: Fixed Assets" 
                className="matrix-cell h-12 bg-[#051C2C] opacity-50 hover:opacity-100 rounded flex items-center justify-center text-white font-bold text-xs cursor-pointer"
              >
                08
              </div>
              <div 
                onClick={() => setActiveSheet('09_HOME_IMPROVEMENT')}
                title="Sheet 09: CapEx Upgrades" 
                className="matrix-cell h-12 bg-[#2251FF] opacity-60 hover:opacity-100 rounded flex items-center justify-center text-white font-bold text-xs cursor-pointer"
              >
                09
              </div>
              <div 
                onClick={() => setActiveSheet('10_ANNUAL_REVIEW')}
                title="Sheet 10: TCO & Equity Synthesis" 
                className="matrix-cell h-12 bg-[#2251FF] rounded flex items-center justify-center text-white font-bold text-xs cursor-pointer"
              >
                10
              </div>
            </div>
          </div>
          <div className="insight-block mt-4 p-3 text-[11px] leading-relaxed">
            Matrix calculations are live. Client-side state cascading across <span className="text-[#2251FF] font-bold">10 worksheets</span> with real-time audit verification.
          </div>
        </div>

        {/* Operating Principles */}
        <div className="card p-5 lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-[#E5E5E5] pb-2">
              <h2 className="serif text-[18px] font-bold text-[#051C2C]">
                Core Operating Philosophy
              </h2>
              <span className="text-[11px] text-[#888888] font-mono">Single Source of Truth</span>
            </div>
            <p className="text-[13px] text-[#051C2C] leading-relaxed mb-4">
              Every formula in HomeOS executes strictly on the client side with deterministic precision. User-editable cells are flagged in soft yellow (<code className="px-1.5 py-0.5 rounded bg-[#FFFDE7] border border-amber-200 font-mono text-[11px]">#FFFDE7</code>). Adjusting any baseline parameter updates loan amortizations, warranty alert countdowns, and true cost calculations across all modules.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12px]">
              <div className="p-3 bg-[rgba(5,28,44,0.02)] border border-[#E5E5E5] rounded-[8px]">
                <strong className="text-[#051C2C] block mb-1">True Cost of Ownership (TCO)</strong>
                <span className="text-[#888888]">
                  Distinguishes pure sunk living costs (interest, taxes, maintenance) from permanent balance sheet equity.
                </span>
              </div>
              <div className="p-3 bg-[rgba(5,28,44,0.02)] border border-[#E5E5E5] rounded-[8px]">
                <strong className="text-[#051C2C] block mb-1">Local Browser Persistence</strong>
                <span className="text-[#888888]">
                  All state changes persist automatically in localStorage with instant backup export and bulk CSV import.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5-Step SOP Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-[20px] font-bold text-[var(--color-primary)]">
            5-Step Homeowner Operating SOP
          </h2>
          <span className="text-[12px] text-[var(--color-muted)]">Sequential Implementation Workflow</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Step 1 */}
          <div 
            onClick={() => setActiveSheet('02_HOME_PROFILE')}
            className="apple-card p-5 flex flex-col justify-between cursor-pointer group"
          >
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-full bg-[rgba(5,28,44,0.06)] text-[var(--color-primary)] flex items-center justify-center font-bold text-[13px]">
                01
              </div>
              <h3 className="font-heading text-[16px] font-bold text-[var(--color-primary)] group-hover:text-[var(--color-accent)] transition-colors">
                Initialize Profile
              </h3>
              <p className="text-[12px] text-[var(--color-muted)] leading-normal">
                Enter purchase price, loan terms, closing date, and mandatory escrow baseline.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[var(--color-border)] flex items-center justify-between text-[11px] font-semibold text-[var(--color-accent)]">
              <span>Go to Sheet 02</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Step 2 */}
          <div 
            onClick={() => setActiveSheet('02_HOME_PROFILE')}
            className="apple-card p-5 flex flex-col justify-between cursor-pointer group"
          >
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-full bg-[rgba(5,28,44,0.06)] text-[var(--color-primary)] flex items-center justify-center font-bold text-[13px]">
                02
              </div>
              <h3 className="font-heading text-[16px] font-bold text-[var(--color-primary)] group-hover:text-[var(--color-accent)] transition-colors">
                Verify Parameters
              </h3>
              <p className="text-[12px] text-[var(--color-muted)] leading-normal">
                Fine-tune warning thresholds (30d maintenance, 60d warranty, 15d HOA grace).
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[var(--color-border)] flex items-center justify-between text-[11px] font-semibold text-[var(--color-accent)]">
              <span>View Global Params</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Step 3 */}
          <div 
            onClick={() => setActiveSheet('06_MAINTENANCE_TRACKER')}
            className="apple-card p-5 flex flex-col justify-between cursor-pointer group"
          >
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-full bg-[rgba(5,28,44,0.06)] text-[var(--color-primary)] flex items-center justify-center font-bold text-[13px]">
                03
              </div>
              <h3 className="font-heading text-[16px] font-bold text-[var(--color-primary)] group-hover:text-[var(--color-accent)] transition-colors">
                Setup Trackers
              </h3>
              <p className="text-[12px] text-[var(--color-muted)] leading-normal">
                Input routine maintenance schedules, equipment warranties, and emergency contacts.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[var(--color-border)] flex items-center justify-between text-[11px] font-semibold text-[var(--color-accent)]">
              <span>Inspect Maintenance</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Step 4 */}
          <div 
            onClick={() => setActiveSheet('03_MONTHLY_BUDGET')}
            className="apple-card p-5 flex flex-col justify-between cursor-pointer group"
          >
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-full bg-[rgba(5,28,44,0.06)] text-[var(--color-primary)] flex items-center justify-center font-bold text-[13px]">
                04
              </div>
              <h3 className="font-heading text-[16px] font-bold text-[var(--color-primary)] group-hover:text-[var(--color-accent)] transition-colors">
                Log Operations
              </h3>
              <p className="text-[12px] text-[var(--color-muted)] leading-normal">
                Record monthly utilities, mortgage escrow deductions, and HOA assessments.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[var(--color-border)] flex items-center justify-between text-[11px] font-semibold text-[var(--color-accent)]">
              <span>Open Budget Ledger</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Step 5 */}
          <div 
            onClick={() => setActiveSheet('10_ANNUAL_REVIEW')}
            className="apple-card p-5 flex flex-col justify-between cursor-pointer group"
          >
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-full bg-[rgba(5,28,44,0.06)] text-[var(--color-primary)] flex items-center justify-center font-bold text-[13px]">
                05
              </div>
              <h3 className="font-heading text-[16px] font-bold text-[var(--color-primary)] group-hover:text-[var(--color-accent)] transition-colors">
                Year-End TCO Review
              </h3>
              <p className="text-[12px] text-[var(--color-muted)] leading-normal">
                Analyze total sunk cost, equity accumulated, and tax basis additions.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[var(--color-border)] flex items-center justify-between text-[11px] font-semibold text-[var(--color-accent)]">
              <span>Open TCO Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* Visual System Architecture & Legend */}
      <div className="apple-card p-6">
        <h2 className="font-heading text-[18px] font-bold text-[var(--color-primary)] mb-4">
          Cell Classification & Visual Separation Standard
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-[12px]">
          {/* Legend 1 */}
          <div className="p-4 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)]/50 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-[var(--color-input-bg)] border border-amber-300" />
              <strong className="text-[var(--color-primary)] font-semibold">User Editable Cells</strong>
            </div>
            <p className="text-[var(--color-muted)] leading-relaxed">
              Highlighted in soft pale yellow (<code className="font-mono">#FFFDE7</code>). Unlocked for user input, assumptions, and adjustments.
            </p>
          </div>

          {/* Legend 2 */}
          <div className="p-4 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)]/50 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-white border border-[var(--color-border)]" />
              <strong className="text-[var(--color-primary)] font-semibold">Calculated Read-Only</strong>
            </div>
            <p className="text-[var(--color-muted)] leading-relaxed">
              White or light neutral tint. Driven by deterministic equations (PMT, EDATE, variance, TCO aggregation).
            </p>
          </div>

          {/* Legend 3 */}
          <div className="p-4 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)]/50 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-[var(--color-accent)]" />
              <strong className="text-[var(--color-primary)] font-semibold">Structural Accents</strong>
            </div>
            <p className="text-[var(--color-muted)] leading-relaxed">
              Royal blue (<code className="font-mono">#2251FF</code>). Applied to inline data bars, active tabs, and insight blocks.
            </p>
          </div>

          {/* Legend 4 */}
          <div className="p-4 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)]/50 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-[var(--color-negative)]" />
              <strong className="text-[var(--color-primary)] font-semibold">Action-Required Anomalies</strong>
            </div>
            <p className="text-[var(--color-muted)] leading-relaxed">
              Restricted semantic color (<code className="font-mono">#D32F2F</code>). Used strictly for overdue tasks, late dues, and budget breaches.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Launch Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div 
          onClick={() => setActiveSheet('02_HOME_PROFILE')}
          className="apple-card p-5 cursor-pointer flex items-center gap-4 hover:border-l-4 hover:border-l-[var(--color-accent)] transition-all"
        >
          <div className="w-10 h-10 rounded-[8px] bg-[rgba(34,81,255,0.08)] flex items-center justify-center text-[var(--color-accent)]">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-[14px] text-[var(--color-primary)]">Single Source of Truth</h4>
            <p className="text-[12px] text-[var(--color-muted)]">Configure address, mortgage, and parameters</p>
          </div>
        </div>

        <div 
          onClick={() => setActiveSheet('04_MORTGAGE_TRACKER')}
          className="apple-card p-5 cursor-pointer flex items-center gap-4 hover:border-l-4 hover:border-l-[var(--color-accent)] transition-all"
        >
          <div className="w-10 h-10 rounded-[8px] bg-[rgba(34,81,255,0.08)] flex items-center justify-center text-[var(--color-accent)]">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-[14px] text-[var(--color-primary)]">Mortgage Amortization</h4>
            <p className="text-[12px] text-[var(--color-muted)]">Track principal paid vs interest lost</p>
          </div>
        </div>

        <div 
          onClick={() => setActiveSheet('10_ANNUAL_REVIEW')}
          className="apple-card p-5 cursor-pointer flex items-center gap-4 hover:border-l-4 hover:border-l-[var(--color-accent)] transition-all"
        >
          <div className="w-10 h-10 rounded-[8px] bg-[rgba(34,81,255,0.08)] flex items-center justify-center text-[var(--color-accent)]">
            <PieChart className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-[14px] text-[var(--color-primary)]">Total Cost of Homeownership</h4>
            <p className="text-[12px] text-[var(--color-muted)]">Review year-end sunk cost vs equity</p>
          </div>
        </div>
      </div>
    </div>
  );
};
