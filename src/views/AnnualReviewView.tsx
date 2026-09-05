import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  formatCurrency, 
  formatPercent, 
  computeAnnualReview 
} from '../utils/calculations';
import { 
  BarChart2, 
  TrendingUp, 
  DollarSign, 
  PieChart, 
  ShieldCheck, 
  Building2, 
  Sparkles, 
  ArrowUpRight, 
  Info 
} from 'lucide-react';

export const AnnualReviewView: React.FC = () => {
  const { state, updateState } = useApp();
  const { profile, params } = state;
  const currency = params.PARAM_CURRENCY_SYM || '$';

  // Review Year state
  const [selectedYear, setSelectedYear] = useState<number>(params.PARAM_ANNUAL_REV_YEAR || 2026);
  // Estimated market value for equity calculation (defaults to purchase price * 1.05)
  const [estMarketValue, setEstMarketValue] = useState<number>(
    Math.round(profile.purchasePrice * 1.04) || 685000
  );

  const review = computeAnnualReview(state, selectedYear);

  // Calculations for Net Equity & LTV
  const netEquity = Math.max(0, estMarketValue - review.endingLoanBalance);
  const ltvRatio = estMarketValue > 0 ? (review.endingLoanBalance / estMarketValue) * 100 : 0;
  const equitySharePct = estMarketValue > 0 ? (netEquity / estMarketValue) * 100 : 0;

  // Breakdown Pillars
  const pillars = [
    {
      title: 'Mortgage Principal (Equity Built)',
      amount: review.principalPaid,
      nature: 'Capital Accumulation (Asset)',
      natureColor: 'text-[var(--color-accent)]',
      barColor: 'var(--color-accent)',
    },
    {
      title: 'Mortgage Interest (Financing Fee)',
      amount: review.interestPaid,
      nature: 'Sunk Financing Cost',
      natureColor: 'text-[var(--color-muted)]',
      barColor: '#888888',
    },
    {
      title: 'Property Taxes & Hazard Insurance (Escrow)',
      amount: review.escrowPaid,
      nature: 'Municipal & Risk Overhead',
      natureColor: 'text-[var(--color-muted)]',
      barColor: '#718096',
    },
    {
      title: 'HOA Regular Dues & Assessments',
      amount: review.hoaPaid,
      nature: 'Community Operations',
      natureColor: 'text-[var(--color-muted)]',
      barColor: '#4A5568',
    },
    {
      title: 'Utility Services (Electric, Gas, Water)',
      amount: review.utilitiesPaid,
      nature: 'Resource Consumption',
      natureColor: 'text-[var(--color-muted)]',
      barColor: '#051C2C',
    },
    {
      title: 'Maintenance, Servicing & Repairs',
      amount: review.maintenancePaid,
      nature: 'Asset Preservation',
      natureColor: 'text-[var(--color-muted)]',
      barColor: '#2D3748',
    },
    {
      title: 'Capital Improvement Projects (CapEx)',
      amount: review.capexPaid,
      nature: 'Discretionary Upgrades',
      natureColor: 'text-[var(--color-primary)]',
      barColor: '#1A365D',
    },
  ];

  return (
    <div className="space-y-8 tab-content-enter">
      {/* Page Header */}
      <div className="border-b border-[var(--color-border)] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-[0.06em] text-[var(--color-muted)] font-semibold">
            Sheet 10 / True Cost of Ownership & Equity Synthesis
          </span>
          <h1 className="font-display text-[30px] font-bold text-[var(--color-primary)] mt-1 tracking-[-0.03em]">
            Annual Review & True Cost of Ownership (TCO)
          </h1>
        </div>

        {/* Year Selector */}
        <div className="flex items-center gap-2 bg-white border border-[var(--color-border)] px-3 py-1.5 rounded-[var(--radius-sm)] shadow-sm self-start sm:self-auto">
          <span className="text-[12px] font-semibold text-[var(--color-muted)]">Audit Year:</span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
            className="font-bold text-[14px] text-[var(--color-primary)] bg-transparent focus:outline-none cursor-pointer"
          >
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
            <option value={2027}>2027</option>
            <option value={2028}>2028</option>
          </select>
        </div>
      </div>

      {/* KPI Cards: True Cost of Ownership Synthesis */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="apple-card p-5">
          <div className="flex items-center justify-between text-[var(--color-muted)] mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.05em]">Total Cash Outflow ({selectedYear})</span>
            <DollarSign className="w-4 h-4 text-[var(--color-muted)]" />
          </div>
          <div className="font-display text-[34px] font-bold text-[var(--color-primary)] tracking-[-0.03em]">
            {formatCurrency(review.totalOutflow, currency)}
          </div>
          <div className="text-[12px] text-[var(--color-muted)] mt-1">
            Blended monthly: {formatCurrency(review.totalOutflow / 12, currency)}/mo
          </div>
        </div>

        {/* KPI 2 */}
        <div className="apple-card p-5">
          <div className="flex items-center justify-between text-[var(--color-muted)] mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.05em]">Non-Recoverable Sunk Cost</span>
            <PieChart className="w-4 h-4 text-[var(--color-muted)]" />
          </div>
          <div className="font-display text-[34px] font-bold text-[var(--color-primary)] tracking-[-0.03em]">
            {formatCurrency(review.sunkCost, currency)}
          </div>
          <div className="text-[12px] text-[var(--color-muted)] mt-1">
            True Living Cost: {formatCurrency(review.sunkCost / 12, currency)}/mo
          </div>
        </div>

        {/* KPI 3 */}
        <div className="apple-card p-5">
          <div className="flex items-center justify-between text-[var(--color-muted)] mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.05em]">Permanent Equity Built</span>
            <TrendingUp className="w-4 h-4 text-[var(--color-accent)]" />
          </div>
          <div className="font-display text-[34px] font-bold text-[var(--color-accent)] tracking-[-0.03em]">
            {formatCurrency(review.principalPaid, currency)}
          </div>
          <div className="text-[12px] text-[var(--color-muted)] mt-1">
            Wealth accumulation: {formatCurrency(review.principalPaid / 12, currency)}/mo
          </div>
        </div>

        {/* KPI 4 */}
        <div className="apple-card p-5">
          <div className="flex items-center justify-between text-[var(--color-muted)] mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.05em]">Discretionary CapEx</span>
            <Building2 className="w-4 h-4 text-[var(--color-primary)]" />
          </div>
          <div className="font-display text-[34px] font-bold text-[var(--color-primary)] tracking-[-0.03em]">
            {formatCurrency(review.capexPaid, currency)}
          </div>
          <div className="text-[12px] text-[var(--color-muted)] mt-1">
            Property improvements and upgrades
          </div>
        </div>
      </div>

      {/* Property Valuation & Net Equity Module */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Equity Card */}
        <div className="apple-card p-6 lg:col-span-1 space-y-4">
          <div className="border-b border-[var(--color-border)] pb-3">
            <h2 className="font-heading text-[18px] font-bold text-[var(--color-primary)]">
              Asset Equity & Leverage Health
            </h2>
            <p className="text-[12px] text-[var(--color-muted)]">
              Real-time balance vs current estimated appraisal.
            </p>
          </div>

          <div className="space-y-3 text-[13px]">
            <div>
              <label className="block text-[11px] font-semibold text-[var(--color-muted)] mb-1 uppercase">
                Est. Current Market Value ({currency})
              </label>
              <input
                type="number"
                step="1000"
                value={estMarketValue}
                onChange={(e) => setEstMarketValue(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 input-editable font-mono font-bold text-[14px] text-[var(--color-primary)]"
              />
            </div>

            <div className="flex justify-between py-2 border-b border-[var(--color-border)]">
              <span className="text-[var(--color-muted)]">Remaining Loan Balance</span>
              <span className="font-mono font-semibold text-[var(--color-primary)]">
                {formatCurrency(review.endingLoanBalance, currency)}
              </span>
            </div>

            <div className="flex justify-between py-2 border-b border-[var(--color-border)]">
              <span className="font-semibold text-[var(--color-accent)]">Net Homeowner Equity</span>
              <span className="font-mono font-bold text-[16px] text-[var(--color-accent)]">
                {formatCurrency(netEquity, currency)}
              </span>
            </div>

            <div className="flex justify-between py-2 border-b border-[var(--color-border)]">
              <span className="text-[var(--color-muted)]">Loan-to-Value (LTV) Ratio</span>
              <span className="font-mono font-semibold text-[var(--color-primary)]">
                {ltvRatio.toFixed(1)}%
              </span>
            </div>

            <div className="flex justify-between py-2">
              <span className="text-[var(--color-muted)]">Home Equity Share</span>
              <span className="font-mono font-semibold text-[var(--color-accent)]">
                {equitySharePct.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Equity Visual Meter */}
          <div className="pt-2">
            <div className="h-3 rounded-full bg-[rgba(5,28,44,0.1)] overflow-hidden flex">
              <div
                className="bg-[var(--color-accent)] h-full transition-all duration-300"
                style={{ width: `${equitySharePct}%` }}
                title={`Homeowner Equity: ${equitySharePct.toFixed(1)}%`}
              />
              <div
                className="bg-[rgba(5,28,44,0.35)] h-full transition-all duration-300"
                style={{ width: `${ltvRatio}%` }}
                title={`Mortgage Debt: ${ltvRatio.toFixed(1)}%`}
              />
            </div>
            <div className="flex justify-between text-[11px] font-mono text-[var(--color-muted)] mt-1.5">
              <span>Equity: {equitySharePct.toFixed(0)}%</span>
              <span>Debt: {ltvRatio.toFixed(0)}%</span>
            </div>
          </div>
        </div>

        {/* Area A: Outflow Matrix */}
        <div className="apple-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4 border-b border-[var(--color-border)] pb-3">
            <div>
              <h2 className="font-heading text-[18px] font-bold text-[var(--color-primary)]">
                Annual Outflow Architecture & Capital Allocation
              </h2>
              <p className="text-[12px] text-[var(--color-muted)]">
                Decoupling every dollar disbursed into wealth accumulation vs operational sunk cost.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="bg-[var(--table-header-bg)] border-b-2 border-[var(--table-header-sep)]">
                  <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)]">Disbursement Pillar</th>
                  <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)]">Financial Nature</th>
                  <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)] text-right">Annual Outflow</th>
                  <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)] text-right">Share (%)</th>
                  <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)] w-[140px]">Distribution</th>
                </tr>
              </thead>
              <tbody>
                {pillars.map((pillar, idx) => {
                  const share = review.totalOutflow > 0 ? (pillar.amount / review.totalOutflow) * 100 : 0;

                  return (
                    <tr
                      key={pillar.title}
                      className={`border-b border-[var(--color-border)] ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-[var(--color-bg)]/40'
                      }`}
                    >
                      <td className="py-3 px-3 font-semibold text-[var(--color-primary)]">
                        {pillar.title}
                      </td>

                      <td className="py-3 px-3 text-[12px]">
                        <span className={`font-medium ${pillar.natureColor}`}>
                          {pillar.nature}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-bold text-[var(--color-primary)]">
                        {formatCurrency(pillar.amount, currency)}
                      </td>

                      <td className="py-3 px-3 text-right font-mono text-[12px] text-[var(--color-muted)]">
                        {share.toFixed(1)}%
                      </td>

                      <td className="py-3 px-3">
                        <div className="data-bar-track w-full">
                          <div
                            className="data-bar-fill"
                            style={{
                              width: `${Math.min(100, Math.round(share))}%`,
                              backgroundColor: pillar.barColor,
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Financial Synthesis / Executive Takeaway Block */}
      <div className="insight-block">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-[var(--color-accent)] mt-0.5 flex-shrink-0" />
          <div className="space-y-1.5 text-[13px] text-[var(--color-body-text)]">
            <h3 className="font-bold text-[14px] text-[var(--color-primary)]">
              HomeOS Executive Synthesis ({selectedYear})
            </h3>
            <p className="leading-relaxed">
              In {selectedYear}, your total gross home expenditure was{' '}
              <strong className="text-[var(--color-primary)]">{formatCurrency(review.totalOutflow, currency)}</strong> (
              {formatCurrency(review.totalOutflow / 12, currency)}/mo). Crucially,{' '}
              <strong className="text-[var(--color-accent)]">
                {formatCurrency(review.principalPaid, currency)} (
                {review.totalOutflow > 0 ? ((review.principalPaid / review.totalOutflow) * 100).toFixed(1) : 0}%)
              </strong>{' '}
              went toward paying down your loan balance, directly increasing your permanent balance sheet equity.
            </p>
            <p className="leading-relaxed text-[var(--color-muted)]">
              Your non-recoverable operational cost of shelter (mortgage interest, escrow taxes/insurance, HOA dues, utilities, and routine maintenance) was{' '}
              <strong className="text-[var(--color-primary)]">{formatCurrency(review.sunkCost, currency)}</strong>, representing a
              true underlying living expense of{' '}
              <strong className="text-[var(--color-primary)]">{formatCurrency(review.sunkCost / 12, currency)}/month</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
