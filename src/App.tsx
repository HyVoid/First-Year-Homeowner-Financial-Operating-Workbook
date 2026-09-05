import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CsvImportModal } from './components/modals/CsvImportModal';
import { JsonBackupModal } from './components/modals/JsonBackupModal';
import { ResetConfirmModal } from './components/modals/ResetConfirmModal';

// Views
import { StartHereView } from './views/StartHereView';
import { HomeProfileView } from './views/HomeProfileView';
import { MonthlyBudgetView } from './views/MonthlyBudgetView';
import { MortgageTrackerView } from './views/MortgageTrackerView';
import { HoaTrackerView } from './views/HoaTrackerView';
import { MaintenanceTrackerView } from './views/MaintenanceTrackerView';
import { WarrantyTrackerView } from './views/WarrantyTrackerView';
import { InventoryView } from './views/InventoryView';
import { HomeImprovementView } from './views/HomeImprovementView';
import { AnnualReviewView } from './views/AnnualReviewView';

const MainContent: React.FC = () => {
  const { activeSheet } = useApp();

  // Modal display states
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const renderActiveView = () => {
    switch (activeSheet) {
      case '01_START_HERE':
        return <StartHereView />;
      case '02_HOME_PROFILE':
        return <HomeProfileView />;
      case '03_MONTHLY_BUDGET':
        return <MonthlyBudgetView />;
      case '04_MORTGAGE_TRACKER':
        return <MortgageTrackerView />;
      case '05_HOA_TRACKER':
        return <HoaTrackerView />;
      case '06_MAINTENANCE_TRACKER':
        return <MaintenanceTrackerView />;
      case '07_WARRANTY_TRACKER':
        return <WarrantyTrackerView />;
      case '08_HOME_INVENTORY':
        return <InventoryView />;
      case '09_HOME_IMPROVEMENT':
        return <HomeImprovementView />;
      case '10_ANNUAL_REVIEW':
        return <AnnualReviewView />;
      default:
        return <StartHereView />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)]">
      {/* 56px sticky top navigation bar */}
      <Header
        onOpenCsvImport={() => setShowCsvModal(true)}
        onOpenJsonImport={() => setShowBackupModal(true)}
        onOpenResetConfirm={() => setShowResetModal(true)}
      />

      {/* Main Content Area: Centered, max-w-[1400px], 40px padding */}
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-6 sm:px-10 py-8">
        {renderActiveView()}
      </main>

      {/* Footer with Professional Polish privacy security notice and quick actions */}
      <Footer 
        onOpenResetConfirm={() => setShowResetModal(true)}
        onOpenJsonImport={() => setShowBackupModal(true)}
      />

      {/* Global SaaS Utility Modals */}
      <CsvImportModal isOpen={showCsvModal} onClose={() => setShowCsvModal(false)} />
      <JsonBackupModal isOpen={showBackupModal} onClose={() => setShowBackupModal(false)} />
      <ResetConfirmModal isOpen={showResetModal} onClose={() => setShowResetModal(false)} />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
