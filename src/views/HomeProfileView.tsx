import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  formatCurrency, 
  calculatePMT, 
  calculateDaysElapsed, 
  calculateAmortizationSchedule 
} from '../utils/calculations';
import { EmergencyContact } from '../types';
import { 
  Sliders, 
  Home, 
  PhoneCall, 
  Plus, 
  Trash2, 
  Calendar, 
  DollarSign, 
  Shield, 
  Building2 
} from 'lucide-react';

export const HomeProfileView: React.FC = () => {
  const { state, updateState } = useApp();
  const { profile, params } = state;
  const currency = params.PARAM_CURRENCY_SYM || '$';

  // State for adding a new emergency vendor contact
  const [showAddVendor, setShowAddVendor] = useState(false);
  const [newVendor, setNewVendor] = useState<Partial<EmergencyContact>>({
    vendorName: '',
    tradeRole: 'Plumber',
    emergencyPhone: '',
    email: '',
    serviceScope: '',
    accountRef: '',
  });

  // Real-time calculations
  const daysElapsed = calculateDaysElapsed(profile.closingDate);
  const calculatedMonthlyPI = calculatePMT(profile.nominalRate, profile.loanTermYears, profile.originalPrincipal);
  const amort = calculateAmortizationSchedule(profile.originalPrincipal, profile.nominalRate, state.mortgagePayments);
  const currentBalance = amort.currentLoanBalance;
  const monthlyBaseline = calculatedMonthlyPI + (profile.monthlyEscrow || 0) + (profile.monthlyHoaDues || 0);
  const emergencyReserveTarget = monthlyBaseline * params.PARAM_EMERGENCY_MONTHS;

  const handleProfileChange = (field: keyof typeof profile, value: any) => {
    updateState((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        [field]: value,
      },
    }));
  };

  const handleParamChange = (paramKey: keyof typeof params, value: any) => {
    updateState((prev) => ({
      ...prev,
      params: {
        ...prev.params,
        [paramKey]: value,
      },
    }));
  };

  const handleAddVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendor.vendorName?.trim()) return;

    const contact: EmergencyContact = {
      id: `ec-${Date.now()}`,
      vendorName: newVendor.vendorName || '',
      tradeRole: newVendor.tradeRole || 'General Contractor',
      emergencyPhone: newVendor.emergencyPhone || '',
      email: newVendor.email || '',
      serviceScope: newVendor.serviceScope || '',
      accountRef: newVendor.accountRef || '',
    };

    updateState((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        emergencyContacts: [...prev.profile.emergencyContacts, contact],
      },
    }));

    setNewVendor({
      vendorName: '',
      tradeRole: 'Plumber',
      emergencyPhone: '',
      email: '',
      serviceScope: '',
      accountRef: '',
    });
    setShowAddVendor(false);
  };

  const handleDeleteVendor = (id: string) => {
    updateState((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        emergencyContacts: prev.profile.emergencyContacts.filter((c) => c.id !== id),
      },
    }));
  };

  return (
    <div className="space-y-8 tab-content-enter">
      {/* Page Title */}
      <div className="border-b border-[var(--color-border)] pb-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-[0.06em] text-[var(--color-muted)] font-semibold">
            Sheet 02 / Master Profile & Global Configuration
          </span>
          <h1 className="font-display text-[30px] font-bold text-[var(--color-primary)] mt-1 tracking-[-0.03em]">
            Home Profile & Parameters
          </h1>
        </div>
        <p className="text-[13px] text-[var(--color-muted)]">
          Single Source of Truth (SSOT) driving calculations across all trackers.
        </p>
      </div>

      {/* KPI Cards: Home at a Glance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="apple-card p-5">
          <div className="flex items-center justify-between text-[var(--color-muted)] mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.05em]">Days Elapsed</span>
            <Calendar className="w-4 h-4 text-[var(--color-muted)]" />
          </div>
          <div className="font-display text-[34px] font-bold text-[var(--color-primary)] tracking-[-0.03em]">
            {daysElapsed} <span className="text-[14px] font-normal text-[var(--color-muted)]">Days</span>
          </div>
          <div className="text-[12px] text-[var(--color-muted)] mt-1">
            Since Closing ({profile.closingDate})
          </div>
        </div>

        {/* KPI 2 */}
        <div className="apple-card p-5">
          <div className="flex items-center justify-between text-[var(--color-muted)] mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.05em]">Current Loan Balance</span>
            <DollarSign className="w-4 h-4 text-[var(--color-muted)]" />
          </div>
          <div className="font-display text-[34px] font-bold text-[var(--color-primary)] tracking-[-0.03em]">
            {formatCurrency(currentBalance, currency)}
          </div>
          <div className="text-[12px] text-[var(--color-muted)] mt-1">
            Initial: {formatCurrency(profile.originalPrincipal, currency)}
          </div>
        </div>

        {/* KPI 3 */}
        <div className="apple-card p-5">
          <div className="flex items-center justify-between text-[var(--color-muted)] mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.05em]">Monthly Mandatory Base</span>
            <Building2 className="w-4 h-4 text-[var(--color-muted)]" />
          </div>
          <div className="font-display text-[34px] font-bold text-[var(--color-primary)] tracking-[-0.03em]">
            {formatCurrency(monthlyBaseline, currency)}
          </div>
          <div className="text-[12px] text-[var(--color-muted)] mt-1">
            P&I ({formatCurrency(calculatedMonthlyPI, currency)}) + Escrow + HOA
          </div>
        </div>

        {/* KPI 4 */}
        <div className="apple-card p-5">
          <div className="flex items-center justify-between text-[var(--color-muted)] mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.05em]">Emergency Reserve ({params.PARAM_EMERGENCY_MONTHS} Mo.)</span>
            <Shield className="w-4 h-4 text-[var(--color-muted)]" />
          </div>
          <div className="font-display text-[34px] font-bold text-[var(--color-accent)] tracking-[-0.03em]">
            {formatCurrency(emergencyReserveTarget, currency)}
          </div>
          <div className="text-[12px] text-[var(--color-muted)] mt-1">
            Recommended defensive liquidity pool
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout: Section A (Property & Mortgage) and Section B (Global Parameters) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section A: Property & Financing Inputs (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="apple-card p-6">
            <div className="flex items-center gap-2 mb-4 border-b border-[var(--color-border)] pb-3">
              <Home className="w-5 h-5 text-[var(--color-accent)]" />
              <h2 className="font-heading text-[18px] font-bold text-[var(--color-primary)]">
                Property Profile & Baseline Specifications
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px]">
              {/* Address */}
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-1">
                  Property Legal Address (D3)
                </label>
                <input
                  type="text"
                  value={profile.propertyAddress}
                  onChange={(e) => handleProfileChange('propertyAddress', e.target.value)}
                  className="w-full px-3 py-2 input-editable text-[13px] text-[var(--color-primary)] font-medium"
                />
              </div>

              {/* Closing Date */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-1">
                  Closing Date (D4)
                </label>
                <input
                  type="date"
                  value={profile.closingDate}
                  onChange={(e) => handleProfileChange('closingDate', e.target.value)}
                  className="w-full px-3 py-2 input-editable text-[13px] text-[var(--color-primary)] font-medium"
                />
              </div>

              {/* Purchase Price */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-1">
                  Purchase Price (D5)
                </label>
                <input
                  type="number"
                  step="500"
                  value={profile.purchasePrice}
                  onChange={(e) => handleProfileChange('purchasePrice', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 input-editable text-[13px] text-[var(--color-primary)] font-medium"
                />
              </div>

              {/* Living Area */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-1">
                  Gross Living Area (D6)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={profile.grossLivingArea}
                    onChange={(e) => handleProfileChange('grossLivingArea', parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 input-editable text-[13px] text-[var(--color-primary)] font-medium pr-14"
                  />
                  <span className="absolute right-3 top-2.5 text-[11px] text-[var(--color-muted)]">sq ft</span>
                </div>
              </div>

              {/* Property Type */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-1">
                  Property Type (D7)
                </label>
                <select
                  value={profile.propertyType}
                  onChange={(e) => handleProfileChange('propertyType', e.target.value)}
                  className="w-full px-3 py-2 input-editable text-[13px] text-[var(--color-primary)] font-medium"
                >
                  <option value="Single Family">Single Family Home</option>
                  <option value="Condo">Condominium</option>
                  <option value="Townhouse">Townhouse</option>
                  <option value="Multi-Family">Multi-Family</option>
                </select>
              </div>

              {/* Mortgage Lender */}
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-1">
                  Mortgage Lender & Account (D8)
                </label>
                <input
                  type="text"
                  value={profile.mortgageLender}
                  onChange={(e) => handleProfileChange('mortgageLender', e.target.value)}
                  className="w-full px-3 py-2 input-editable text-[13px] text-[var(--color-primary)] font-medium"
                />
              </div>

              {/* Original Principal */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-1">
                  Original Loan Principal (D9)
                </label>
                <input
                  type="number"
                  step="500"
                  value={profile.originalPrincipal}
                  onChange={(e) => handleProfileChange('originalPrincipal', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 input-editable text-[13px] text-[var(--color-primary)] font-medium"
                />
              </div>

              {/* Interest Rate */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-1">
                  Nominal Annual Rate (D10)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.0001"
                    value={profile.nominalRate}
                    onChange={(e) => handleProfileChange('nominalRate', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 input-editable text-[13px] text-[var(--color-primary)] font-medium pr-12"
                  />
                  <span className="absolute right-3 top-2.5 text-[11px] text-[var(--color-muted)]">
                    {(profile.nominalRate * 100).toFixed(3)}%
                  </span>
                </div>
              </div>

              {/* Loan Term */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-1">
                  Loan Term Years (D11)
                </label>
                <input
                  type="number"
                  value={profile.loanTermYears}
                  onChange={(e) => handleProfileChange('loanTermYears', parseInt(e.target.value, 10) || 30)}
                  className="w-full px-3 py-2 input-editable text-[13px] text-[var(--color-primary)] font-medium"
                />
              </div>

              {/* Scheduled Monthly P&I (Calculated read-only) */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-1">
                  Scheduled Monthly P&I (D12 - Computed PMT)
                </label>
                <div className="w-full px-3 py-2 bg-[var(--table-header-bg)] border border-[var(--color-border)] rounded-[var(--radius-sm)] text-[14px] font-bold text-[var(--color-primary)]">
                  {formatCurrency(calculatedMonthlyPI, currency)}
                </div>
              </div>

              {/* Monthly Escrow */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-1">
                  Monthly Escrow Reserve (D13)
                </label>
                <input
                  type="number"
                  step="10"
                  value={profile.monthlyEscrow}
                  onChange={(e) => handleProfileChange('monthlyEscrow', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 input-editable text-[13px] text-[var(--color-primary)] font-medium"
                />
              </div>

              {/* Monthly HOA Dues */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-1">
                  Monthly HOA Base Dues (D16)
                </label>
                <input
                  type="number"
                  step="5"
                  value={profile.monthlyHoaDues}
                  onChange={(e) => handleProfileChange('monthlyHoaDues', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 input-editable text-[13px] text-[var(--color-primary)] font-medium"
                />
              </div>

              {/* Property Tax & Hazard Insurance */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-1">
                  Annual Property Tax (D14)
                </label>
                <input
                  type="number"
                  step="50"
                  value={profile.annualPropertyTax}
                  onChange={(e) => handleProfileChange('annualPropertyTax', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 input-editable text-[13px] text-[var(--color-primary)] font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-1">
                  Annual Hazard Insurance (D15)
                </label>
                <input
                  type="number"
                  step="50"
                  value={profile.annualHazardIns}
                  onChange={(e) => handleProfileChange('annualHazardIns', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 input-editable text-[13px] text-[var(--color-primary)] font-medium"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section B: Global Parameter Master Table (F3:H11) */}
        <div className="space-y-6">
          <div className="apple-card p-6">
            <div className="flex items-center gap-2 mb-4 border-b border-[var(--color-border)] pb-3">
              <Sliders className="w-5 h-5 text-[var(--color-accent)]" />
              <h2 className="font-heading text-[18px] font-bold text-[var(--color-primary)]">
                Global Parameters Table
              </h2>
            </div>
            <p className="text-[12px] text-[var(--color-muted)] mb-4 leading-relaxed">
              Global control thresholds referenced across all trackers. Single-point change triggers instant cascade.
            </p>

            <div className="space-y-3 text-[13px]">
              {/* Currency Symbol */}
              <div className="flex items-center justify-between p-2 rounded-[var(--radius-sm)] bg-[rgba(5,28,44,0.02)]">
                <div>
                  <div className="font-semibold text-[var(--color-primary)]">Currency Symbol</div>
                  <div className="text-[11px] font-mono text-[var(--color-muted)]">PARAM_CURRENCY_SYM ($G$3)</div>
                </div>
                <input
                  type="text"
                  maxLength={3}
                  value={params.PARAM_CURRENCY_SYM}
                  onChange={(e) => handleParamChange('PARAM_CURRENCY_SYM', e.target.value)}
                  className="w-16 px-2 py-1 input-editable text-center font-bold text-[14px]"
                />
              </div>

              {/* Maint Warning Days */}
              <div className="flex items-center justify-between p-2 rounded-[var(--radius-sm)] bg-[rgba(5,28,44,0.02)]">
                <div>
                  <div className="font-semibold text-[var(--color-primary)]">Maint. Warn Window</div>
                  <div className="text-[11px] font-mono text-[var(--color-muted)]">PARAM_MAINT_WARN_DAYS ($G$4)</div>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={params.PARAM_MAINT_WARN_DAYS}
                    onChange={(e) => handleParamChange('PARAM_MAINT_WARN_DAYS', parseInt(e.target.value, 10) || 30)}
                    className="w-16 px-2 py-1 input-editable text-center font-bold text-[13px]"
                  />
                  <span className="text-[11px] text-[var(--color-muted)]">Days</span>
                </div>
              </div>

              {/* Warranty Warning Days */}
              <div className="flex items-center justify-between p-2 rounded-[var(--radius-sm)] bg-[rgba(5,28,44,0.02)]">
                <div>
                  <div className="font-semibold text-[var(--color-primary)]">Warranty Expiry Alert</div>
                  <div className="text-[11px] font-mono text-[var(--color-muted)]">PARAM_WARR_WARN_DAYS ($G$5)</div>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={params.PARAM_WARR_WARN_DAYS}
                    onChange={(e) => handleParamChange('PARAM_WARR_WARN_DAYS', parseInt(e.target.value, 10) || 60)}
                    className="w-16 px-2 py-1 input-editable text-center font-bold text-[13px]"
                  />
                  <span className="text-[11px] text-[var(--color-muted)]">Days</span>
                </div>
              </div>

              {/* HOA Grace Days */}
              <div className="flex items-center justify-between p-2 rounded-[var(--radius-sm)] bg-[rgba(5,28,44,0.02)]">
                <div>
                  <div className="font-semibold text-[var(--color-primary)]">HOA Grace Period</div>
                  <div className="text-[11px] font-mono text-[var(--color-muted)]">PARAM_HOA_GRACE_DAYS ($G$6)</div>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={params.PARAM_HOA_GRACE_DAYS}
                    onChange={(e) => handleParamChange('PARAM_HOA_GRACE_DAYS', parseInt(e.target.value, 10) || 15)}
                    className="w-16 px-2 py-1 input-editable text-center font-bold text-[13px]"
                  />
                  <span className="text-[11px] text-[var(--color-muted)]">Days</span>
                </div>
              </div>

              {/* Budget Over % */}
              <div className="flex items-center justify-between p-2 rounded-[var(--radius-sm)] bg-[rgba(5,28,44,0.02)]">
                <div>
                  <div className="font-semibold text-[var(--color-primary)]">Budget Redline Overrun</div>
                  <div className="text-[11px] font-mono text-[var(--color-muted)]">PARAM_BUDGET_OVER_PCT ($G$7)</div>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.01"
                    value={params.PARAM_BUDGET_OVER_PCT}
                    onChange={(e) => handleParamChange('PARAM_BUDGET_OVER_PCT', parseFloat(e.target.value) || 0.1)}
                    className="w-16 px-2 py-1 input-editable text-center font-bold text-[13px]"
                  />
                  <span className="text-[11px] text-[var(--color-muted)]">
                    {(params.PARAM_BUDGET_OVER_PCT * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Emergency Reserve Target Months */}
              <div className="flex items-center justify-between p-2 rounded-[var(--radius-sm)] bg-[rgba(5,28,44,0.02)]">
                <div>
                  <div className="font-semibold text-[var(--color-primary)]">Emergency Runway</div>
                  <div className="text-[11px] font-mono text-[var(--color-muted)]">PARAM_EMERGENCY_MONTHS ($G$8)</div>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={params.PARAM_EMERGENCY_MONTHS}
                    onChange={(e) => handleParamChange('PARAM_EMERGENCY_MONTHS', parseInt(e.target.value, 10) || 6)}
                    className="w-16 px-2 py-1 input-editable text-center font-bold text-[13px]"
                  />
                  <span className="text-[11px] text-[var(--color-muted)]">Mo.</span>
                </div>
              </div>

              {/* Annual Review Target Year */}
              <div className="flex items-center justify-between p-2 rounded-[var(--radius-sm)] bg-[rgba(5,28,44,0.02)]">
                <div>
                  <div className="font-semibold text-[var(--color-primary)]">Review Baseline Year</div>
                  <div className="text-[11px] font-mono text-[var(--color-muted)]">PARAM_ANNUAL_REV_YEAR ($G$9)</div>
                </div>
                <input
                  type="number"
                  value={params.PARAM_ANNUAL_REV_YEAR}
                  onChange={(e) => handleParamChange('PARAM_ANNUAL_REV_YEAR', parseInt(e.target.value, 10) || 2026)}
                  className="w-20 px-2 py-1 input-editable text-center font-bold text-[13px]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section D: Emergency Service Network & Core Contractors Table */}
      <div className="apple-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-[var(--color-border)] pb-3">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-[var(--color-accent)]" />
            <h2 className="font-heading text-[18px] font-bold text-[var(--color-primary)]">
              Emergency Contact & Certified Contractor Network
            </h2>
          </div>
          <button
            onClick={() => setShowAddVendor(!showAddVendor)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] bg-[var(--color-primary)] text-white text-[12px] font-medium hover:opacity-90 transition-opacity cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showAddVendor ? 'Cancel' : 'Add Vendor Contact'}</span>
          </button>
        </div>

        {/* Add Vendor Form */}
        {showAddVendor && (
          <form onSubmit={handleAddVendor} className="mb-6 p-4 rounded-[var(--radius-sm)] bg-[var(--color-bg)]/80 border border-[var(--color-border)] space-y-4">
            <h3 className="font-bold text-[13px] text-[var(--color-primary)]">Register New Service Provider</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Vendor Name *"
                required
                value={newVendor.vendorName}
                onChange={(e) => setNewVendor({ ...newVendor, vendorName: e.target.value })}
                className="px-3 py-2 bg-white text-[13px] border border-[var(--color-border)] rounded-[var(--radius-sm)]"
              />
              <select
                value={newVendor.tradeRole}
                onChange={(e) => setNewVendor({ ...newVendor, tradeRole: e.target.value })}
                className="px-3 py-2 bg-white text-[13px] border border-[var(--color-border)] rounded-[var(--radius-sm)]"
              >
                <option value="Plumber">Plumber</option>
                <option value="HVAC Specialist">HVAC Specialist</option>
                <option value="Master Electrician">Master Electrician</option>
                <option value="Roofer">Roofer</option>
                <option value="General Handyman">General Handyman</option>
                <option value="Locksmith">Locksmith</option>
                <option value="Pest Control">Pest Control</option>
                <option value="Appliance Tech">Appliance Tech</option>
                <option value="Other">Other</option>
              </select>
              <input
                type="text"
                placeholder="Emergency Phone *"
                value={newVendor.emergencyPhone}
                onChange={(e) => setNewVendor({ ...newVendor, emergencyPhone: e.target.value })}
                className="px-3 py-2 bg-white text-[13px] border border-[var(--color-border)] rounded-[var(--radius-sm)]"
              />
              <input
                type="email"
                placeholder="Email Address"
                value={newVendor.email}
                onChange={(e) => setNewVendor({ ...newVendor, email: e.target.value })}
                className="px-3 py-2 bg-white text-[13px] border border-[var(--color-border)] rounded-[var(--radius-sm)]"
              />
              <input
                type="text"
                placeholder="Service Scope (e.g. Tankless heater, main sewer)"
                value={newVendor.serviceScope}
                onChange={(e) => setNewVendor({ ...newVendor, serviceScope: e.target.value })}
                className="px-3 py-2 bg-white text-[13px] border border-[var(--color-border)] rounded-[var(--radius-sm)]"
              />
              <input
                type="text"
                placeholder="Account / Contract #"
                value={newVendor.accountRef}
                onChange={(e) => setNewVendor({ ...newVendor, accountRef: e.target.value })}
                className="px-3 py-2 bg-white text-[13px] border border-[var(--color-border)] rounded-[var(--radius-sm)]"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddVendor(false)}
                className="px-3 py-1.5 text-[12px] text-[var(--color-muted)] hover:text-[var(--color-primary)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-[12px] font-semibold text-white bg-[var(--color-accent)] rounded-[var(--radius-sm)]"
              >
                Save Contact
              </button>
            </div>
          </form>
        )}

        {/* Vendors Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="bg-[var(--table-header-bg)] border-b-2 border-[var(--table-header-sep)]">
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)]">Vendor / Company</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)]">Trade / Role</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)]">Emergency Phone</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)]">Email</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)]">Service Scope</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)]">Account #</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)] text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {profile.emergencyContacts.map((contact, idx) => (
                <tr
                  key={contact.id}
                  className={`border-b border-[var(--color-border)] ${
                    idx % 2 === 0 ? 'bg-white' : 'bg-[var(--color-bg)]/40'
                  }`}
                >
                  <td className="py-3 px-3 font-semibold text-[var(--color-primary)]">
                    {contact.vendorName}
                  </td>
                  <td className="py-3 px-3">
                    <span className="badge-pill bg-[rgba(5,28,44,0.08)] text-[var(--color-primary)]">
                      {contact.tradeRole}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-[12px] font-medium text-[var(--color-accent)]">
                    {contact.emergencyPhone}
                  </td>
                  <td className="py-3 px-3 text-[12px] text-[var(--color-muted)]">
                    {contact.email}
                  </td>
                  <td className="py-3 px-3 text-[12px] text-[var(--color-body-text)]">
                    {contact.serviceScope}
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-[var(--color-muted)]">
                    {contact.accountRef}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => handleDeleteVendor(contact.id)}
                      className="text-[var(--color-muted)] hover:text-[var(--color-negative)] p-1 rounded transition-colors"
                      title="Delete Contact"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {profile.emergencyContacts.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[var(--color-muted)] text-[12px]">
                    No emergency service vendors registered yet. Click "Add Vendor Contact" above.
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
