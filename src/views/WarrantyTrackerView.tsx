import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  addPeriodToDate, 
  calculateDaysRemaining, 
  getWarrantyStatus 
} from '../utils/calculations';
import { WarrantyItem } from '../types';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  Clock, 
  Plus, 
  Trash2, 
  Search, 
  Filter, 
  Phone, 
  FileText,
  Calendar
} from 'lucide-react';

export const WarrantyTrackerView: React.FC = () => {
  const { state, updateState } = useApp();
  const { warrantyItems, params } = state;
  const warnDays = params.PARAM_WARR_WARN_DAYS || 60;

  // Search & Filter
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState(false);

  // New Item State
  const [newItem, setNewItem] = useState<Partial<WarrantyItem>>({
    itemCovered: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    warrantyProvider: '',
    periodValue: 1,
    periodUnit: 'Years',
    policyNumber: '',
    claimContactRef: '',
  });

  // KPI Calculations
  const { totalCount, activeCount, expiringSoonCount, expiredCount } = useMemo(() => {
    let active = 0;
    let expiring = 0;
    let expired = 0;

    for (const item of warrantyItems) {
      const expiryDate = addPeriodToDate(item.purchaseDate, item.periodValue, item.periodUnit);
      const daysLeft = calculateDaysRemaining(expiryDate);
      const st = getWarrantyStatus(daysLeft, warnDays);

      if (st.status === 'Active') active++;
      else if (st.status === 'Expiring Soon') expiring++;
      else if (st.status === 'Expired') expired++;
    }

    return {
      totalCount: warrantyItems.length,
      activeCount: active,
      expiringSoonCount: expiring,
      expiredCount: expired,
    };
  }, [warrantyItems, warnDays]);

  const handleUpdateItem = (id: string, field: keyof WarrantyItem, value: any) => {
    updateState((prev) => ({
      ...prev,
      warrantyItems: prev.warrantyItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.itemCovered?.trim()) return;

    const item: WarrantyItem = {
      id: `war-${Date.now()}`,
      itemCovered: newItem.itemCovered.trim(),
      purchaseDate: newItem.purchaseDate || new Date().toISOString().split('T')[0],
      warrantyProvider: newItem.warrantyProvider?.trim() || 'Manufacturer',
      periodValue: Number(newItem.periodValue) || 1,
      periodUnit: newItem.periodUnit || 'Years',
      policyNumber: newItem.policyNumber?.trim() || '',
      claimContactRef: newItem.claimContactRef?.trim() || '',
    };

    updateState((prev) => ({
      ...prev,
      warrantyItems: [...prev.warrantyItems, item],
    }));

    setNewItem({
      itemCovered: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      warrantyProvider: '',
      periodValue: 1,
      periodUnit: 'Years',
      policyNumber: '',
      claimContactRef: '',
    });
    setShowAddForm(false);
  };

  const handleDeleteItem = (id: string) => {
    updateState((prev) => ({
      ...prev,
      warrantyItems: prev.warrantyItems.filter((i) => i.id !== id),
    }));
  };

  // Filtered List
  const filteredList = useMemo(() => {
    return warrantyItems.filter((item) => {
      const expiryDate = addPeriodToDate(item.purchaseDate, item.periodValue, item.periodUnit);
      const daysLeft = calculateDaysRemaining(expiryDate);
      const st = getWarrantyStatus(daysLeft, warnDays);

      const matchStatus = filterStatus === 'ALL' || st.status === filterStatus;
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        item.itemCovered.toLowerCase().includes(q) ||
        item.warrantyProvider.toLowerCase().includes(q) ||
        item.policyNumber.toLowerCase().includes(q) ||
        item.claimContactRef.toLowerCase().includes(q);

      return matchStatus && matchSearch;
    });
  }, [warrantyItems, filterStatus, searchQuery, warnDays]);

  return (
    <div className="space-y-8 tab-content-enter">
      {/* Page Header */}
      <div className="border-b border-[var(--color-border)] pb-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-[0.06em] text-[var(--color-muted)] font-semibold">
            Sheet 07 / Equipment Guarantees & Expiration Ledger
          </span>
          <h1 className="font-display text-[30px] font-bold text-[var(--color-primary)] mt-1 tracking-[-0.03em]">
            Warranty & Service Contract Tracker
          </h1>
        </div>
        <p className="text-[13px] text-[var(--color-muted)]">
          Calculated dynamically via <code className="font-mono text-[11px] bg-white px-1.5 py-0.5 rounded border border-[var(--color-border)]">=EDATE(PurchaseDate, TermMonths)</code>
        </p>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="apple-card p-5">
          <div className="flex items-center justify-between text-[var(--color-muted)] mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.05em]">Total Policies</span>
            <FileText className="w-4 h-4 text-[var(--color-primary)]" />
          </div>
          <div className="font-display text-[32px] font-bold text-[var(--color-primary)] tracking-[-0.03em]">
            {totalCount}
          </div>
          <div className="text-[12px] text-[var(--color-muted)] mt-1">
            Tracked structural & appliances
          </div>
        </div>

        <div className="apple-card p-5">
          <div className="flex items-center justify-between text-[var(--color-muted)] mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.05em]">Active Protection</span>
            <ShieldCheck className="w-4 h-4 text-[var(--color-accent)]" />
          </div>
          <div className="font-display text-[32px] font-bold text-[var(--color-accent)] tracking-[-0.03em]">
            {activeCount}
          </div>
          <div className="text-[12px] text-[var(--color-muted)] mt-1">
            In good standing &gt; {warnDays}d
          </div>
        </div>

        <div className={`apple-card p-5 ${expiringSoonCount > 0 ? 'border-l-4 border-l-amber-500 bg-amber-50/20' : ''}`}>
          <div className="flex items-center justify-between text-[var(--color-muted)] mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.05em]">Expiring Soon</span>
            <AlertTriangle className={`w-4 h-4 ${expiringSoonCount > 0 ? 'text-amber-600' : 'text-[var(--color-muted)]'}`} />
          </div>
          <div className={`font-display text-[32px] font-bold tracking-[-0.03em] ${expiringSoonCount > 0 ? 'text-amber-700' : 'text-[var(--color-primary)]'}`}>
            {expiringSoonCount}
          </div>
          <div className="text-[12px] text-[var(--color-muted)] mt-1">
            Within threshold (≤ {warnDays} days)
          </div>
        </div>

        <div className={`apple-card p-5 ${expiredCount > 0 ? 'border-l-4 border-l-[var(--color-negative)] bg-red-50/20' : ''}`}>
          <div className="flex items-center justify-between text-[var(--color-muted)] mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.05em]">Expired Coverage</span>
            <ShieldAlert className={`w-4 h-4 ${expiredCount > 0 ? 'text-[var(--color-negative)]' : 'text-[var(--color-muted)]'}`} />
          </div>
          <div className={`font-display text-[32px] font-bold tracking-[-0.03em] ${expiredCount > 0 ? 'text-[var(--color-negative)]' : 'text-[var(--color-primary)]'}`}>
            {expiredCount}
          </div>
          <div className="text-[12px] text-[var(--color-muted)] mt-1">
            Self-insurance or service needed
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="apple-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--color-border)] mb-4">
          <div>
            <h2 className="font-heading text-[18px] font-bold text-[var(--color-primary)]">
              Equipment Guarantees &amp; Policy Registry
            </h2>
            <p className="text-[12px] text-[var(--color-muted)]">
              Real-time expiration countdown and claim contact registry.
            </p>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[var(--color-primary)] text-white text-[12px] font-semibold rounded-[var(--radius-sm)] shadow-sm hover:opacity-90 transition-opacity"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Warranty Policy</span>
          </button>
        </div>

        {/* Add Form Drawer */}
        {showAddForm && (
          <form onSubmit={handleAddItem} className="mb-6 p-4 bg-[var(--color-bg)] rounded-[var(--radius-sm)] border border-[var(--color-border)] space-y-4">
            <h3 className="font-semibold text-[13px] text-[var(--color-primary)]">
              Record New Equipment Guarantee
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[12px]">
              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-muted)] mb-1 uppercase">Item Covered *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Trane HVAC Compressor"
                  value={newItem.itemCovered}
                  onChange={(e) => setNewItem({ ...newItem, itemCovered: e.target.value })}
                  className="w-full px-3 py-2 bg-white text-[13px] border border-[var(--color-border)] rounded-[var(--radius-sm)]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-muted)] mb-1 uppercase">Warranty Provider *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Trane Inc."
                  value={newItem.warrantyProvider}
                  onChange={(e) => setNewItem({ ...newItem, warrantyProvider: e.target.value })}
                  className="w-full px-3 py-2 bg-white text-[13px] border border-[var(--color-border)] rounded-[var(--radius-sm)]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-muted)] mb-1 uppercase">Purchase / Install Date *</label>
                <input
                  type="date"
                  required
                  value={newItem.purchaseDate}
                  onChange={(e) => setNewItem({ ...newItem, purchaseDate: e.target.value })}
                  className="w-full px-3 py-2 bg-white text-[13px] border border-[var(--color-border)] rounded-[var(--radius-sm)]"
                />
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-[11px] font-semibold text-[var(--color-muted)] mb-1 uppercase">Term</label>
                  <input
                    type="number"
                    min="1"
                    value={newItem.periodValue}
                    onChange={(e) => setNewItem({ ...newItem, periodValue: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3 py-2 bg-white text-[13px] border border-[var(--color-border)] rounded-[var(--radius-sm)]"
                  />
                </div>
                <div className="w-24">
                  <label className="block text-[11px] font-semibold text-[var(--color-muted)] mb-1 uppercase">Unit</label>
                  <select
                    value={newItem.periodUnit}
                    onChange={(e) => setNewItem({ ...newItem, periodUnit: e.target.value as any })}
                    className="w-full px-3 py-2 bg-white text-[13px] border border-[var(--color-border)] rounded-[var(--radius-sm)]"
                  >
                    <option value="Years">Years</option>
                    <option value="Months">Months</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-muted)] mb-1 uppercase">Policy / Contract #</label>
                <input
                  type="text"
                  placeholder="e.g. POL-99201"
                  value={newItem.policyNumber}
                  onChange={(e) => setNewItem({ ...newItem, policyNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-white text-[13px] border border-[var(--color-border)] rounded-[var(--radius-sm)] font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-muted)] mb-1 uppercase">Claim Contact &amp; Link</label>
                <input
                  type="text"
                  placeholder="e.g. 1-800-555-0199 / claims@provider.com"
                  value={newItem.claimContactRef}
                  onChange={(e) => setNewItem({ ...newItem, claimContactRef: e.target.value })}
                  className="w-full px-3 py-2 bg-white text-[13px] border border-[var(--color-border)] rounded-[var(--radius-sm)]"
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
                Save Warranty Policy
              </button>
            </div>
          </form>
        )}

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 text-[12px]">
          <div className="flex items-center gap-1.5 bg-white border border-[var(--color-border)] px-2.5 py-1.5 rounded-[var(--radius-sm)]">
            <Filter className="w-3.5 h-3.5 text-[var(--color-muted)]" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent text-[var(--color-primary)] font-medium focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active Coverage</option>
              <option value="Expiring Soon">Expiring Soon (≤ {warnDays}d)</option>
              <option value="Expired">Expired</option>
            </select>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[var(--color-muted)]" />
            <input
              type="text"
              placeholder="Search policy, provider, item..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 border border-[var(--color-border)] rounded-[var(--radius-sm)] bg-white text-[12px] w-full sm:w-64 focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>
        </div>

        {/* Interactive Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="bg-[var(--table-header-bg)] border-b-2 border-[var(--table-header-sep)]">
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)]">Item Covered</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)]">Provider / Issuer</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)]">Purchase Date</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)]">Coverage Term</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)]">Calculated Expiry</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)] text-right">Days Left</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)] text-center">Status</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)]">Policy #</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)]">Claim Support</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)] text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.map((item, idx) => {
                const expiryDate = addPeriodToDate(item.purchaseDate, item.periodValue, item.periodUnit);
                const daysLeft = calculateDaysRemaining(expiryDate);
                const statusObj = getWarrantyStatus(daysLeft, warnDays);

                return (
                  <tr
                    key={item.id}
                    className={`border-b border-[var(--color-border)] hover:bg-[rgba(5,28,44,0.02)] transition-colors ${
                      statusObj.status === 'Expiring Soon'
                        ? 'bg-amber-50/30'
                        : statusObj.status === 'Expired'
                        ? 'bg-red-50/20'
                        : idx % 2 === 0
                        ? 'bg-white'
                        : 'bg-[var(--color-bg)]/40'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-semibold text-[var(--color-primary)]">
                      <input
                        type="text"
                        value={item.itemCovered}
                        onChange={(e) => handleUpdateItem(item.id, 'itemCovered', e.target.value)}
                        className="w-full bg-transparent focus:bg-white focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] px-1 rounded font-semibold text-[13px] text-[var(--color-primary)]"
                      />
                    </td>

                    <td className="py-2.5 px-3 text-[12px] text-[var(--color-body-text)]">
                      <input
                        type="text"
                        value={item.warrantyProvider}
                        onChange={(e) => handleUpdateItem(item.id, 'warrantyProvider', e.target.value)}
                        className="w-full bg-transparent focus:bg-white focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] px-1 rounded text-[12px]"
                      />
                    </td>

                    <td className="py-2.5 px-3 font-mono text-[12px] text-[var(--color-muted)]">
                      <input
                        type="date"
                        value={item.purchaseDate}
                        onChange={(e) => handleUpdateItem(item.id, 'purchaseDate', e.target.value)}
                        className="bg-transparent focus:bg-white focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] px-1 rounded text-[12px] font-mono"
                      />
                    </td>

                    <td className="py-2.5 px-3 text-[12px]">
                      <span className="font-mono font-medium">{item.periodValue}</span> {item.periodUnit}
                    </td>

                    <td className="py-2.5 px-3 font-mono font-semibold text-[12px] text-[var(--color-primary)]">
                      {expiryDate}
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono text-[12px]">
                      {daysLeft < 0 ? (
                        <span className="text-[var(--color-negative)] font-bold">{daysLeft} d</span>
                      ) : daysLeft <= warnDays ? (
                        <span className="text-amber-800 font-bold">{daysLeft} d</span>
                      ) : (
                        <span className="text-[var(--color-accent)] font-medium">{daysLeft} d</span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`badge-pill ${
                          statusObj.status === 'Active'
                            ? 'bg-[rgba(34,81,255,0.08)] text-[var(--color-accent)] font-semibold'
                            : statusObj.status === 'Expiring Soon'
                            ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300'
                            : 'bg-red-100 text-[var(--color-negative)] font-bold border border-red-300'
                        }`}
                      >
                        {statusObj.status}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 font-mono text-[11px] text-[var(--color-muted)]">
                      <input
                        type="text"
                        value={item.policyNumber}
                        onChange={(e) => handleUpdateItem(item.id, 'policyNumber', e.target.value)}
                        className="w-full bg-transparent focus:bg-white focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] px-1 rounded font-mono text-[11px]"
                      />
                    </td>

                    <td className="py-2.5 px-3 text-[12px] text-[var(--color-muted)]">
                      <input
                        type="text"
                        value={item.claimContactRef}
                        onChange={(e) => handleUpdateItem(item.id, 'claimContactRef', e.target.value)}
                        className="w-full bg-transparent focus:bg-white focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] px-1 rounded text-[12px]"
                      />
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-[var(--color-muted)] hover:text-[var(--color-negative)] p-1 rounded transition-colors"
                        title="Delete policy"
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
