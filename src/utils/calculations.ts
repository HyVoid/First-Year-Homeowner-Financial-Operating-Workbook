import { AppState, MortgagePayment } from '../types';

/**
 * Format currency with symbol and 2 decimals
 */
export function formatCurrency(amount: number | undefined | null, symbol = '$'): string {
  if (amount === undefined || amount === null || isNaN(amount)) return `${symbol}0.00`;
  return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Format compact currency (e.g. $485K)
 */
export function formatCompactCurrency(amount: number | undefined | null, symbol = '$'): string {
  if (amount === undefined || amount === null || isNaN(amount)) return `${symbol}0`;
  if (Math.abs(amount) >= 1000000) {
    return `${symbol}${(amount / 1000000).toFixed(2)}M`;
  }
  if (Math.abs(amount) >= 1000) {
    return `${symbol}${(amount / 1000).toFixed(1)}k`;
  }
  return formatCurrency(amount, symbol);
}

/**
 * Format general number with commas
 */
export function formatNumber(val: number | undefined | null, decimals = 0): string {
  if (val === undefined || val === null || isNaN(val)) return '0';
  return val.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

/**
 * Format percentage
 */
export function formatPercent(val: number | undefined | null, decimals = 1): string {
  if (val === undefined || val === null || isNaN(val)) return '0.0%';
  return `${(val * 100).toFixed(decimals)}%`;
}

/**
 * Safe date parsing to YYYY-MM-DD
 */
export function parseDate(dateStr: string): Date {
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  }
  return new Date(dateStr);
}

/**
 * Format date to YYYY-MM-DD
 */
export function formatDateISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Standard PMT formula: calculate monthly scheduled payment
 */
export function calculatePMT(rate: number, nperYears: number, principal: number): number {
  if (rate <= 0 || nperYears <= 0 || principal <= 0) return 0;
  const monthlyRate = rate / 12;
  const n = nperYears * 12;
  const pmt = (principal * (monthlyRate * Math.pow(1 + monthlyRate, n))) / (Math.pow(1 + monthlyRate, n) - 1);
  return Math.round(pmt * 100) / 100;
}

/**
 * Days elapsed since closing date
 */
export function calculateDaysElapsed(closingDateStr: string): number {
  if (!closingDateStr) return 0;
  const closingDate = parseDate(closingDateStr);
  const now = new Date();
  const diffTime = now.getTime() - closingDate.getTime();
  return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
}

/**
 * Amortization record computed for a payment
 */
export interface ComputedAmortizationRow {
  period: number;
  paymentDate: string;
  scheduledPI: number;
  actualEscrowPaid: number;
  extraPrincipal: number;
  totalCashPaid: number;
  interestPaid: number;
  principalPaid: number;
  cumulativePrincipal: number;
  endingBalance: number;
}

/**
 * Calculate full amortization schedule for existing payments
 */
export function calculateAmortizationSchedule(
  originalPrincipal: number,
  nominalRate: number,
  payments: MortgagePayment[]
): {
  schedule: ComputedAmortizationRow[];
  totalEquityBuilt: number;
  totalInterestLost: number;
  totalExtraPaid: number;
  currentLoanBalance: number;
  estInterestSaved: number;
} {
  const schedule: ComputedAmortizationRow[] = [];
  let currentBalance = originalPrincipal;
  let cumulativePrincipal = 0;
  let totalInterest = 0;
  let totalExtra = 0;

  const monthlyRate = nominalRate / 12;

  for (const pay of payments) {
    if (currentBalance <= 0) break;
    const interest = Math.round(currentBalance * monthlyRate * 100) / 100;
    const basePrincipal = Math.max(0, pay.scheduledPI - interest);
    const extra = pay.extraPrincipal || 0;
    const principalPaid = Math.min(currentBalance, Math.round((basePrincipal + extra) * 100) / 100);
    const endingBalance = Math.max(0, Math.round((currentBalance - principalPaid) * 100) / 100);
    cumulativePrincipal = Math.round((cumulativePrincipal + principalPaid) * 100) / 100;
    totalInterest = Math.round((totalInterest + interest) * 100) / 100;
    totalExtra = Math.round((totalExtra + extra) * 100) / 100;

    const totalCashPaid = Math.round((pay.scheduledPI + (pay.actualEscrowPaid || 0) + extra) * 100) / 100;

    schedule.push({
      period: pay.period,
      paymentDate: pay.paymentDate,
      scheduledPI: pay.scheduledPI,
      actualEscrowPaid: pay.actualEscrowPaid || 0,
      extraPrincipal: extra,
      totalCashPaid,
      interestPaid: interest,
      principalPaid,
      cumulativePrincipal,
      endingBalance,
    });

    currentBalance = endingBalance;
  }

  // Interest saved estimate formula from workbook spec:
  // ROUND(total_extra * (annual_rate * (loan_years / 2)), 2)
  const estInterestSaved = Math.round(totalExtra * (nominalRate * 15) * 100) / 100;

  return {
    schedule,
    totalEquityBuilt: cumulativePrincipal,
    totalInterestLost: totalInterest,
    totalExtraPaid: totalExtra,
    currentLoanBalance: schedule.length > 0 ? schedule[schedule.length - 1].endingBalance : originalPrincipal,
    estInterestSaved,
  };
}

/**
 * Add period to date (months, years, days)
 */
export function addPeriodToDate(dateStr: string, value: number, unit: 'Months' | 'Years' | 'Days'): string {
  if (!dateStr) return '';
  const d = parseDate(dateStr);
  if (unit === 'Days') {
    d.setDate(d.getDate() + value);
  } else if (unit === 'Years') {
    d.setFullYear(d.getFullYear() + value);
  } else {
    // Months
    d.setMonth(d.getMonth() + value);
  }
  return formatDateISO(d);
}

/**
 * Days remaining from now until target date
 */
export function calculateDaysRemaining(targetDateStr: string): number {
  if (!targetDateStr) return 0;
  const target = parseDate(targetDateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Determine maintenance status
 */
export function getMaintenanceStatus(
  daysRemaining: number,
  warnDays: number
): { status: 'Overdue' | 'Due Soon' | 'Good'; label: string; isAnomaly: boolean } {
  if (daysRemaining < 0) {
    return { status: 'Overdue', label: 'Overdue', isAnomaly: true };
  }
  if (daysRemaining <= warnDays) {
    return { status: 'Due Soon', label: 'Due Soon', isAnomaly: true };
  }
  return { status: 'Good', label: 'Good', isAnomaly: false };
}

/**
 * Determine warranty status
 */
export function getWarrantyStatus(
  daysRemaining: number,
  warnDays: number
): { status: 'Expired' | 'Expiring Soon' | 'Active'; label: string; isAnomaly: boolean } {
  if (daysRemaining < 0) {
    return { status: 'Expired', label: 'Expired', isAnomaly: true };
  }
  if (daysRemaining <= warnDays) {
    return { status: 'Expiring Soon', label: 'Expiring Soon', isAnomaly: true };
  }
  return { status: 'Active', label: 'Active', isAnomaly: false };
}

/**
 * Determine HOA payment status
 */
export function getHoaStatus(
  amountDue: number,
  amountPaid: number,
  dueDateStr: string,
  graceDays: number
): { status: 'Paid' | 'Pending' | 'Grace Period' | 'Late'; daysOverdue: number; isAnomaly: boolean } {
  if (amountPaid >= amountDue && amountDue > 0) {
    return { status: 'Paid', daysOverdue: 0, isAnomaly: false };
  }
  const dueDate = parseDate(dueDateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);

  const diffDays = Math.round((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return { status: 'Pending', daysOverdue: 0, isAnomaly: false };
  }
  if (diffDays <= graceDays) {
    return { status: 'Grace Period', daysOverdue: diffDays, isAnomaly: true };
  }
  return { status: 'Late', daysOverdue: diffDays, isAnomaly: true };
}

/**
 * Full Annual Review TCO breakdown item
 */
export interface AnnualCostItem {
  id: string;
  category: string;
  nature: 'Opex (Sunk)' | 'Equity (Asset)' | 'Capex (Value-Add)';
  annualSpend: number;
  monthlyAverage: number;
  shareOfTotal: number;
  sourceTracker: string;
}

/**
 * Compute the comprehensive Annual Review TCO metrics
 */
export function computeAnnualReview(state: AppState, overrideYear?: number) {
  const targetYear = overrideYear || state.annualReview.reviewYear || state.params.PARAM_ANNUAL_REV_YEAR;

  // 1. Mortgage components from mortgage payments in targetYear
  let mortgageInterest = 0;
  let mortgagePrincipal = 0;
  let mortgageEscrow = 0;

  const monthlyRate = state.profile.nominalRate / 12;
  let tempBalance = state.profile.originalPrincipal;

  for (const pay of state.mortgagePayments) {
    const pDate = parseDate(pay.paymentDate);
    const isTargetYear = pDate.getFullYear() === targetYear;

    const interest = Math.round(tempBalance * monthlyRate * 100) / 100;
    const basePrincipal = Math.max(0, pay.scheduledPI - interest);
    const extra = pay.extraPrincipal || 0;
    const principalPaid = Math.min(tempBalance, Math.round((basePrincipal + extra) * 100) / 100);
    tempBalance = Math.max(0, tempBalance - principalPaid);

    if (isTargetYear) {
      mortgageInterest += interest;
      mortgagePrincipal += principalPaid;
      mortgageEscrow += pay.actualEscrowPaid || 0;
    }
  }

  // 2. HOA components
  let hoaPaid = 0;
  for (const hoa of state.hoaRecords) {
    const yearMatch = hoa.billingPeriod?.startsWith(String(targetYear));
    if (yearMatch) {
      hoaPaid += hoa.amountPaid || 0;
    }
  }

  // 3. Operating utilities & expenses from budget ledger
  let electricityAndGas = 0;
  let waterAndSewer = 0;
  let trashAndInternet = 0;
  let routineMaintenance = 0;
  let unplannedRepairs = 0;
  let otherOperating = 0;

  for (const exp of state.expenses) {
    const expDate = parseDate(exp.transactionDate);
    if (expDate.getFullYear() === targetYear) {
      const cat = exp.category;
      if (cat === 'Electricity' || cat === 'Natural Gas') {
        electricityAndGas += exp.amount;
      } else if (cat === 'Water & Sewer') {
        waterAndSewer += exp.amount;
      } else if (cat === 'Trash & Recycling' || cat === 'Internet') {
        trashAndInternet += exp.amount;
      } else if (cat === 'Maintenance') {
        routineMaintenance += exp.amount;
      } else if (cat === 'Repairs') {
        unplannedRepairs += exp.amount;
      } else if (cat === 'Supplies' || cat === 'Other Operating') {
        otherOperating += exp.amount;
      }
    }
  }

  // 4. Capex & improvements
  let capexSpend = 0;
  let taxBasisAddition = 0;
  for (const imp of state.improvementProjects) {
    const dateStr = imp.completionDate || imp.startDate;
    const impYear = parseDate(dateStr).getFullYear();
    if (impYear === targetYear) {
      capexSpend += imp.actualCost;
      if (imp.classification === 'Capital Improvement') {
        taxBasisAddition += imp.actualCost;
      }
    }
  }

  // Compile the 11 standardized cost lines
  const rawItems: Array<{
    id: string;
    category: string;
    nature: 'Opex (Sunk)' | 'Equity (Asset)' | 'Capex (Value-Add)';
    annualSpend: number;
    sourceTracker: string;
  }> = [
    {
      id: 'c-1',
      category: 'Mortgage Interest',
      nature: 'Opex (Sunk)',
      annualSpend: mortgageInterest,
      sourceTracker: 'Mortgage Tracker (04)',
    },
    {
      id: 'c-2',
      category: 'Mortgage Principal',
      nature: 'Equity (Asset)',
      annualSpend: mortgagePrincipal,
      sourceTracker: 'Mortgage Tracker (04)',
    },
    {
      id: 'c-3',
      category: 'Property Taxes & Hazard Insurance (Escrow)',
      nature: 'Opex (Sunk)',
      annualSpend: mortgageEscrow,
      sourceTracker: 'Mortgage Tracker (04)',
    },
    {
      id: 'c-4',
      category: 'HOA Dues & Assessments',
      nature: 'Opex (Sunk)',
      annualSpend: hoaPaid,
      sourceTracker: 'HOA Tracker (05)',
    },
    {
      id: 'c-5',
      category: 'Electricity & Natural Gas',
      nature: 'Opex (Sunk)',
      annualSpend: electricityAndGas,
      sourceTracker: 'Monthly Budget Ledger (03)',
    },
    {
      id: 'c-6',
      category: 'Water & Municipal Sewer',
      nature: 'Opex (Sunk)',
      annualSpend: waterAndSewer,
      sourceTracker: 'Monthly Budget Ledger (03)',
    },
    {
      id: 'c-7',
      category: 'Trash Collection & Fiber Internet',
      nature: 'Opex (Sunk)',
      annualSpend: trashAndInternet,
      sourceTracker: 'Monthly Budget Ledger (03)',
    },
    {
      id: 'c-8',
      category: 'Routine Preventative Maintenance',
      nature: 'Opex (Sunk)',
      annualSpend: routineMaintenance,
      sourceTracker: 'Budget Ledger / Maint Tracker',
    },
    {
      id: 'c-9',
      category: 'Unplanned Repairs & Fixes',
      nature: 'Opex (Sunk)',
      annualSpend: unplannedRepairs,
      sourceTracker: 'Monthly Budget Ledger (03)',
    },
    {
      id: 'c-10',
      category: 'Capital Improvements & Major Projects',
      nature: 'Capex (Value-Add)',
      annualSpend: capexSpend,
      sourceTracker: 'Home Improvement (09)',
    },
    {
      id: 'c-11',
      category: 'Household Supplies & Other Operating',
      nature: 'Opex (Sunk)',
      annualSpend: otherOperating,
      sourceTracker: 'Monthly Budget Ledger (03)',
    },
  ];

  const totalCashOutflow = rawItems.reduce((acc, item) => acc + item.annualSpend, 0);

  const costItems: AnnualCostItem[] = rawItems.map((item) => ({
    ...item,
    monthlyAverage: Math.round((item.annualSpend / 12) * 100) / 100,
    shareOfTotal: totalCashOutflow > 0 ? item.annualSpend / totalCashOutflow : 0,
  }));

  const trueOperatingSunkCost = costItems
    .filter((i) => i.nature === 'Opex (Sunk)')
    .reduce((acc, i) => acc + i.annualSpend, 0);

  const homeEquityBuilt = mortgagePrincipal;
  const capexInvestment = capexSpend;
  const monthlyAverageTCO = totalCashOutflow > 0 ? Math.round((totalCashOutflow / 12) * 100) / 100 : 0;

  return {
    targetYear,
    totalCashOutflow,
    totalOutflow: totalCashOutflow,
    trueOperatingSunkCost,
    sunkCost: trueOperatingSunkCost,
    homeEquityBuilt,
    principalPaid: homeEquityBuilt,
    interestPaid: mortgageInterest,
    escrowPaid: mortgageEscrow,
    hoaPaid,
    utilitiesPaid: electricityAndGas + waterAndSewer + trashAndInternet,
    maintenancePaid: routineMaintenance + unplannedRepairs,
    capexInvestment,
    capexPaid: capexInvestment,
    endingLoanBalance: tempBalance,
    monthlyAverageTCO,
    taxBasisAddition,
    costItems,
  };
}
