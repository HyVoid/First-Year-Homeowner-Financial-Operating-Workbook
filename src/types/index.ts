/**
 * First-Year Homeowner Financial & Operating System (HomeOS)
 * Type Definitions & Schema
 */

export interface GlobalParams {
  PARAM_CURRENCY_SYM: string;       // Default '$'
  PARAM_MAINT_WARN_DAYS: number;    // Default 30 days
  PARAM_WARR_WARN_DAYS: number;     // Default 60 days
  PARAM_HOA_GRACE_DAYS: number;     // Default 15 days
  PARAM_BUDGET_OVER_PCT: number;    // Default 0.10 (10%)
  PARAM_EMERGENCY_MONTHS: number;   // Default 6 months
  PARAM_ANNUAL_REV_YEAR: number;    // Default 2026
}

export interface EmergencyContact {
  id: string;
  vendorName: string;
  tradeRole: string;
  emergencyPhone: string;
  email: string;
  serviceScope: string;
  accountRef: string;
}

export interface HomeProfile {
  propertyAddress: string;
  closingDate: string;        // YYYY-MM-DD
  purchasePrice: number;
  grossLivingArea: number;    // sq ft
  propertyType: 'Single Family' | 'Condo' | 'Townhouse' | 'Multi-Family';
  mortgageLender: string;
  originalPrincipal: number;
  nominalRate: number;        // e.g. 0.065 for 6.5%
  loanTermYears: number;      // e.g. 30
  monthlyEscrow: number;
  annualPropertyTax: number;
  annualHazardIns: number;
  monthlyHoaDues: number;
  emergencyContacts: EmergencyContact[];
}

export interface BudgetBenchmark {
  id: string;
  category: string;
  monthlyBudget: number;
}

export interface ExpenseRecord {
  id: string;                 // TX-YYYYMM-XXXX
  transactionDate: string;    // YYYY-MM-DD
  category: string;
  subcategory: string;
  merchant: string;
  amount: number;
  paymentMethod: 'Credit Card' | 'ACH/Auto-Pay' | 'Checking' | 'Cash' | 'Zelle' | 'Other';
  receiptRef: string;
}

export interface MortgagePayment {
  period: number;             // 1 to 360
  paymentDate: string;        // YYYY-MM-DD
  scheduledPI: number;
  actualEscrowPaid: number;
  extraPrincipal: number;
}

export interface HoaRecord {
  id: string;
  billingPeriod: string;      // YYYY-MM
  feeType: 'Regular Dues' | 'Special Assessment' | 'Violation / Fine' | 'Parking / Storage' | 'Other';
  dueDate: string;            // YYYY-MM-DD
  amountDue: number;
  paymentDate?: string;       // YYYY-MM-DD or empty
  amountPaid: number;
  paymentRef: string;
}

export interface MaintenanceTask {
  id: string;
  taskName: string;
  systemCategory: 'HVAC' | 'Plumbing' | 'Electrical' | 'Roof & Exterior' | 'Interior' | 'Lawn & Safety';
  frequencyValue: number;
  frequencyUnit: 'Months' | 'Years' | 'Days';
  lastCompletedDate: string;  // YYYY-MM-DD
  assignedVendor: string;     // DIY or Vendor name
  actualCost: number;
  notesSpecs: string;
}

export interface WarrantyItem {
  id: string;
  itemCovered: string;
  purchaseDate: string;       // YYYY-MM-DD
  warrantyProvider: string;
  periodValue: number;
  periodUnit: 'Years' | 'Months';
  policyNumber: string;
  claimContactRef: string;
}

export interface InventoryItem {
  id: string;
  itemName?: string;
  itemDescription?: string;
  roomLocation?: string;
  locationRoom?: string;
  category?: string;
  assetCategory?: 'Electronics' | 'Appliances' | 'Furniture' | 'Tools' | 'Jewelry' | 'Other' | string;
  acquisitionDate?: string;    // YYYY-MM-DD
  purchaseDate?: string;       // YYYY-MM-DD
  purchasePrice?: number;
  originalCost?: number;
  estReplacementCost?: number; // Optional; fallback to purchasePrice
  brandModel: string;
  serialNumber: string;
  receiptRef?: string;
  manualReceiptRef?: string;
  warrantyTermValue?: number;
  warrantyTermUnit?: 'Years' | 'Months' | 'Days';
  supportContact?: string;
}

export interface ImprovementProject {
  id: string;
  projectTitle?: string;
  projectName?: string;
  areaScope?: string;
  category?: string;
  classification?: 'Capital Improvement' | 'Major Repair' | string;
  startDate: string;          // YYYY-MM-DD
  completionDate?: string;    // YYYY-MM-DD
  contractor: string;
  budgetedCost?: number;
  budget?: number;
  actualCost: number;
  estValueAdd?: number;
  permitRequired?: boolean;
  permitNumber?: string;
  contractorWarrantyExp?: string; // YYYY-MM-DD
  status?: 'In Progress' | 'Completed' | 'Planned' | string;
}

export interface AnnualReviewSettings {
  reviewYear: number;
  yearEndMarketValue: number;
}

export interface UtilityRecord {
  id: string;
  period: string; // YYYY-MM
  daysInCycle: number;
  electricityKwh: number;
  electricityCost: number;
  gasTherms: number;
  gasCost: number;
  waterGallons: number;
  waterCost: number;
}

export interface AppState {
  params: GlobalParams;
  profile: HomeProfile;
  budgetBenchmarks: BudgetBenchmark[];
  expenses: ExpenseRecord[];
  mortgagePayments: MortgagePayment[];
  hoaRecords: HoaRecord[];
  maintenanceTasks: MaintenanceTask[];
  warrantyItems: WarrantyItem[];
  inventoryItems: InventoryItem[];
  improvementProjects: ImprovementProject[];
  annualReview: AnnualReviewSettings;
  utilityRecords?: UtilityRecord[];
  lastSaved?: string;
}

export type SheetId =
  | '01_START_HERE'
  | '02_HOME_PROFILE'
  | '03_MONTHLY_BUDGET'
  | '04_MORTGAGE_TRACKER'
  | '05_HOA_TRACKER'
  | '06_MAINTENANCE_TRACKER'
  | '07_WARRANTY_TRACKER'
  | '08_HOME_INVENTORY'
  | '09_HOME_IMPROVEMENT'
  | '10_ANNUAL_REVIEW';
