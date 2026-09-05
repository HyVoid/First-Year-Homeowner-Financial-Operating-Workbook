import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  formatCurrency, 
  addPeriodToDate, 
  calculateDaysRemaining, 
  getWarrantyStatus 
} from '../utils/calculations';
import { InventoryItem } from '../types';
import { 
  Boxes, 
  ShieldCheck, 
  AlertTriangle, 
  ShieldAlert, 
  Plus, 
  Trash2, 
  Search, 
  Filter, 
  Info 
} from 'lucide-react';

export const InventoryView: React.FC = () => {
  const { state, updateState } = useApp();
  const { inventoryItems, params } = state;
  const currency = params.PARAM_CURRENCY_SYM || '$';
  const warnDays = params.PARAM_WARR_WARN_DAYS || 60;

  // Filter & Search
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState(false);

  // New Item State
  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
    itemName: '',
    category: 'Major Appliances',
    locationRoom: 'Kitchen',
    brandModel: '',
    serialNumber: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    originalCost: 0,
    warrantyTermValue: 1,
    warrantyTermUnit: 'Years',
    supportContact: '',
    manualReceiptRef: '',
  });

  // KPI Calculations
  const { totalAssetValue, activeCount, expiringSoonCount, expiredCount } = useMemo(() => {
    let totalVal = 0;
    let active = 0;
    let expiring = 0;
    let expired = 0;

    for (const item of inventoryItems) {
      totalVal += item.originalCost ?? item.purchasePrice ?? 0;
      const pDate = item.purchaseDate || item.acquisitionDate || '2026-01-01';
      const termVal = item.warrantyTermValue || 1;
      const termUnit = item.warrantyTermUnit || 'Years';
      const expiryDate = addPeriodToDate(pDate, termVal, termUnit);
      const daysLeft = calculateDaysRemaining(expiryDate);
      const st = getWarrantyStatus(daysLeft, warnDays);

      if (st.status === 'Active') active++;
      else if (st.status === 'Expiring Soon') expiring++;
      else if (st.status === 'Expired') expired++;
    }

    return {
      totalAssetValue: totalVal,
      activeCount: active,
      expiringSoonCount: expiring,
      expiredCount: expired,
    };
  }, [inventoryItems, warnDays]);

  const handleUpdateItem = (id: string, field: keyof InventoryItem, value: any) => {
    updateState((prev) => ({
      ...prev,
      inventoryItems: prev.inventoryItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.itemName?.trim()) return;

    const item: InventoryItem = {
      id: `inv-${Date.now()}`,
      itemName: newItem.itemName || 'Asset',
      category: newItem.category || 'Major Appliances',
      locationRoom: newItem.locationRoom || 'Living Room',
      brandModel: newItem.brandModel || '',
      serialNumber: newItem.serialNumber || '',
      purchaseDate: newItem.purchaseDate || new Date().toISOString().split('T')[0],
      originalCost: Number(newItem.originalCost) || 0,
      warrantyTermValue: Number(newItem.warrantyTermValue) || 1,
      warrantyTermUnit: newItem.warrantyTermUnit || 'Years',
      supportContact: newItem.supportContact || '',
      manualReceiptRef: newItem.manualReceiptRef || '',
    };

    updateState((prev) => ({
      ...prev,
      inventoryItems: [...prev.inventoryItems, item],
    }));

    setNewItem({
      itemName: '',
      category: 'Major Appliances',
      locationRoom: 'Kitchen',
      brandModel: '',
      serialNumber: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      originalCost: 0,
      warrantyTermValue: 1,
      warrantyTermUnit: 'Years',
      supportContact: '',
      manualReceiptRef: '',
    });
    setShowAddForm(false);
  };

  const handleDeleteItem = (id: string) => {
    updateState((prev) => ({
      ...prev,
      inventoryItems: prev.inventoryItems.filter((i) => i.id !== id),
    }));
  };

  // Filter items
  const filteredItems = useMemo(() => {
    return inventoryItems.filter((item) => {
      const itemCat = item.category || item.assetCategory || 'Other';
      const matchCat = selectedCategory === 'ALL' || itemCat === selectedCategory;
      const q = searchQuery.toLowerCase();
      const itemName = item.itemName || item.itemDescription || '';
      const room = item.locationRoom || item.roomLocation || '';
      const matchSearch =
        !q ||
        itemName.toLowerCase().includes(q) ||
        item.brandModel.toLowerCase().includes(q) ||
        item.serialNumber.toLowerCase().includes(q) ||
        room.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [inventoryItems, selectedCategory, searchQuery]);

  return (
    <div className="space-y-8 tab-content-enter">
      {/* Page Header */}
      <div className="border-b border-[var(--color-border)] pb-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-[0.06em] text-[var(--color-muted)] font-semibold">
            Sheet 08 / Capital Equipment &amp; Asset Valuation
          </span>
          <h1 className="font-display text-[30px] font-bold text-[var(--color-primary)] mt-1 tracking-[-0.03em]">
            Home Inventory &amp; Fixed Asset Ledger
          </h1>
        </div>
        <p className="text-[13px] text-[var(--color-muted)]">
          Audit personal property, replacement valuations, serial numbers, and insurance receipts.
        </p>
      </div>

      {/* KPI Row (B3:I4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="apple-card p-5">
          <div className="flex items-center justify-between text-[var(--color-muted)] mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.05em]">Total Capital Asset Value</span>
            <Boxes className="w-4 h-4 text-[var(--color-muted)]" />
          </div>
          <div className="font-display text-[34px] font-bold text-[var(--color-primary)] tracking-[-0.03em]">
            {formatCurrency(totalAssetValue, currency)}
          </div>
          <div className="text-[12px] text-[var(--color-muted)] mt-1">
            Original acquisition baseline
          </div>
        </div>

        <div className="apple-card p-5">
          <div className="flex items-center justify-between text-[var(--color-muted)] mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.05em]">Active Under Warranty</span>
            <ShieldCheck className="w-4 h-4 text-[var(--color-accent)]" />
          </div>
          <div className="font-display text-[34px] font-bold text-[var(--color-accent)] tracking-[-0.03em]">
            {activeCount} <span className="text-[14px] font-normal text-[var(--color-muted)]">Items</span>
          </div>
          <div className="text-[12px] text-[var(--color-muted)] mt-1">
            Protected by manufacturer coverage
          </div>
        </div>

        <div className="apple-card p-5">
          <div className="flex items-center justify-between text-[var(--color-muted)] mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.05em]">Expiring Soon ({warnDays} Days)</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="font-display text-[34px] font-bold text-amber-700 tracking-[-0.03em]">
            {expiringSoonCount} <span className="text-[14px] font-normal text-[var(--color-muted)]">Items</span>
          </div>
          <div className="text-[12px] text-[var(--color-muted)] mt-1">
            Inspection window before expiration
          </div>
        </div>

        <div className="apple-card p-5">
          <div className="flex items-center justify-between text-[var(--color-muted)] mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.05em]">Out of Warranty Assets</span>
            <ShieldAlert className="w-4 h-4 text-[var(--color-muted)]" />
          </div>
          <div className="font-display text-[34px] font-bold text-[var(--color-muted)] tracking-[-0.03em]">
            {expiredCount} <span className="text-[14px] font-normal text-[var(--color-muted)]">Items</span>
          </div>
          <div className="text-[12px] text-[var(--color-muted)] mt-1">
            Homeowner self-insures repair costs
          </div>
        </div>
      </div>

      {/* Insight Block */}
      <div className="insight-block">
        <div className="flex items-start gap-3">
          <Info className="w-4 h-4 text-[var(--color-accent)] mt-0.5 flex-shrink-0" />
          <div className="text-[12px] text-[var(--color-body-text)] leading-relaxed">
            Warranty Expiry is projected from acquisition date + warranty term. Items expiring in{' '}
            <strong>≤ {warnDays} days</strong> flag a warning to schedule preventative dealer servicing while still covered.
          </div>
        </div>
      </div>

      {/* Table_Inventory */}
      <div className="apple-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-[var(--color-border)] pb-3">
          <div>
            <h2 className="font-heading text-[18px] font-bold text-[var(--color-primary)]">
              Capital Inventory & Warranty Registry (Table_Inventory B6:O200)
            </h2>
            <p className="text-[12px] text-[var(--color-muted)]">
              Detailed tracking of serial numbers, purchase invoices, and calculated warranty statuses.
            </p>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] bg-[var(--color-primary)] text-white text-[12px] font-medium hover:opacity-90 transition-opacity cursor-pointer self-start sm:self-auto shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showAddForm ? 'Cancel' : 'Add Inventory Asset'}</span>
          </button>
        </div>

        {/* Add Asset Drawer */}
        {showAddForm && (
          <form
            onSubmit={handleAddItem}
            className="mb-6 p-4 rounded-[var(--radius-sm)] bg-[var(--color-bg)]/80 border border-[var(--color-border)] space-y-4 animate-fadeIn"
          >
            <h3 className="font-bold text-[13px] text-[var(--color-primary)]">Register Fixed Asset</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-[var(--color-muted)] mb-1 uppercase">Item Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bosch 800 Series Dishwasher"
                  value={newItem.itemName}
                  onChange={(e) => setNewItem({ ...newItem, itemName: e.target.value })}
                  className="w-full px-3 py-2 bg-white text-[13px] border border-[var(--color-border)] rounded-[var(--radius-sm)]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-muted)] mb-1 uppercase">Category</label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  className="w-full px-3 py-2 bg-white text-[13px] border border-[var(--color-border)] rounded-[var(--radius-sm)]"
                >
                  <option value="HVAC">HVAC</option>
                  <option value="Major Appliances">Major Appliances</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Security">Security</option>
                  <option value="Smart Home">Smart Home</option>
                  <option value="Exterior">Exterior</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-muted)] mb-1 uppercase">Room / Location</label>
                <input
                  type="text"
                  placeholder="e.g. Kitchen"
                  value={newItem.locationRoom}
                  onChange={(e) => setNewItem({ ...newItem, locationRoom: e.target.value })}
                  className="w-full px-3 py-2 bg-white text-[13px] border border-[var(--color-border)] rounded-[var(--radius-sm)]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-muted)] mb-1 uppercase">Brand & Model</label>
                <input
                  type="text"
                  placeholder="e.g. Bosch SHPM78Z55N"
                  value={newItem.brandModel}
                  onChange={(e) => setNewItem({ ...newItem, brandModel: e.target.value })}
                  className="w-full px-3 py-2 bg-white text-[13px] border border-[var(--color-border)] rounded-[var(--radius-sm)]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-muted)] mb-1 uppercase">Serial Number</label>
                <input
                  type="text"
                  placeholder="e.g. FD991200142"
                  value={newItem.serialNumber}
                  onChange={(e) => setNewItem({ ...newItem, serialNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-white text-[13px] border border-[var(--color-border)] rounded-[var(--radius-sm)] font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-muted)] mb-1 uppercase">Purchase Date *</label>
                <input
                  type="date"
                  required
                  value={newItem.purchaseDate}
                  onChange={(e) => setNewItem({ ...newItem, purchaseDate: e.target.value })}
                  className="w-full px-3 py-2 bg-white text-[13px] border border-[var(--color-border)] rounded-[var(--radius-sm)]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-muted)] mb-1 uppercase">Original Cost ({currency})</label>
                <input
                  type="number"
                  step="10"
                  value={newItem.originalCost}
                  onChange={(e) => setNewItem({ ...newItem, originalCost: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-white text-[13px] border border-[var(--color-border)] rounded-[var(--radius-sm)] font-bold"
                />
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-[11px] font-semibold text-[var(--color-muted)] mb-1 uppercase">Term</label>
                  <input
                    type="number"
                    min="1"
                    value={newItem.warrantyTermValue}
                    onChange={(e) => setNewItem({ ...newItem, warrantyTermValue: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3 py-2 bg-white text-[13px] border border-[var(--color-border)] rounded-[var(--radius-sm)]"
                  />
                </div>
                <div className="w-24">
                  <label className="block text-[11px] font-semibold text-[var(--color-muted)] mb-1 uppercase">Unit</label>
                  <select
                    value={newItem.warrantyTermUnit}
                    onChange={(e) => setNewItem({ ...newItem, warrantyTermUnit: e.target.value as any })}
                    className="w-full px-3 py-2 bg-white text-[13px] border border-[var(--color-border)] rounded-[var(--radius-sm)]"
                  >
                    <option value="Years">Yrs.</option>
                    <option value="Months">Mo.</option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-[var(--color-muted)] mb-1 uppercase">Support Phone / Contact</label>
                <input
                  type="text"
                  placeholder="e.g. 1-800-944-2904"
                  value={newItem.supportContact}
                  onChange={(e) => setNewItem({ ...newItem, supportContact: e.target.value })}
                  className="w-full px-3 py-2 bg-white text-[13px] border border-[var(--color-border)] rounded-[var(--radius-sm)]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-muted)] mb-1 uppercase">Manual / Receipt Ref</label>
                <input
                  type="text"
                  placeholder="e.g. REC-APP-01"
                  value={newItem.manualReceiptRef}
                  onChange={(e) => setNewItem({ ...newItem, manualReceiptRef: e.target.value })}
                  className="w-full px-3 py-2 bg-white text-[13px] border border-[var(--color-border)] rounded-[var(--radius-sm)] font-mono"
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
                Save Asset
              </button>
            </div>
          </form>
        )}

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 text-[12px]">
          <div className="flex items-center gap-1.5 bg-white border border-[var(--color-border)] px-2.5 py-1.5 rounded-[var(--radius-sm)]">
            <Filter className="w-3.5 h-3.5 text-[var(--color-muted)]" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-[var(--color-primary)] font-medium focus:outline-none"
            >
              <option value="ALL">All Asset Categories</option>
              <option value="HVAC">HVAC</option>
              <option value="Major Appliances">Major Appliances</option>
              <option value="Electronics">Electronics</option>
              <option value="Furniture">Furniture</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Security">Security</option>
              <option value="Smart Home">Smart Home</option>
              <option value="Exterior">Exterior</option>
            </select>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[var(--color-muted)]" />
            <input
              type="text"
              placeholder="Search item, serial, brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 border border-[var(--color-border)] rounded-[var(--radius-sm)] bg-white text-[12px] w-full sm:w-64 focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>
        </div>

        {/* Inventory Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="bg-[var(--table-header-bg)] border-b-2 border-[var(--table-header-sep)]">
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)]">Item / Equipment</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)]">Category</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)]">Location</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)]">Brand & Model</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)]">Serial #</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)] text-right">Cost</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)]">Warranty Expiry</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)] text-right">Days Left</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)] text-center">Status</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)]">Support Phone</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)] text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item, idx) => {
                const pDate = item.purchaseDate || item.acquisitionDate || '2026-01-01';
                const termVal = item.warrantyTermValue || 1;
                const termUnit = item.warrantyTermUnit || 'Years';
                const expiryDate = addPeriodToDate(pDate, termVal, termUnit);
                const daysLeft = calculateDaysRemaining(expiryDate);
                const statusObj = getWarrantyStatus(daysLeft, warnDays);

                return (
                  <tr
                    key={item.id}
                    className={`border-b border-[var(--color-border)] hover:bg-[rgba(5,28,44,0.02)] transition-colors ${
                      statusObj.status === 'Expiring Soon'
                        ? 'bg-[var(--color-input-bg)]/40'
                        : idx % 2 === 0
                        ? 'bg-white'
                        : 'bg-[var(--color-bg)]/40'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-semibold text-[var(--color-primary)]">
                      {item.itemName || item.itemDescription}
                    </td>

                    <td className="py-2.5 px-3">
                      <span className="badge-pill bg-[rgba(5,28,44,0.06)] text-[var(--color-primary)]">
                        {item.category || item.assetCategory}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-[12px] text-[var(--color-body-text)]">
                      {item.locationRoom || item.roomLocation}
                    </td>

                    <td className="py-2.5 px-3 text-[12px] text-[var(--color-primary)]">
                      {item.brandModel || '—'}
                    </td>

                    <td className="py-2.5 px-3 font-mono text-[11px] text-[var(--color-muted)]">
                      {item.serialNumber || '—'}
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono font-medium text-[var(--color-primary)]">
                      {formatCurrency(item.originalCost ?? item.purchasePrice, currency)}
                    </td>

                    <td className="py-2.5 px-3 font-mono font-semibold text-[12px] text-[var(--color-primary)]">
                      {expiryDate}
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono text-[12px]">
                      {daysLeft < 0 ? (
                        <span className="text-[var(--color-muted)]">{daysLeft} d</span>
                      ) : daysLeft <= warnDays ? (
                        <span className="text-amber-800 font-bold">{daysLeft} d</span>
                      ) : (
                        <span className="text-[var(--color-accent)] font-medium">{daysLeft} d</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`badge-pill ${
                          statusObj.status === 'Active'
                            ? 'bg-[rgba(34,81,255,0.1)] text-[var(--color-accent)]'
                            : statusObj.status === 'Expiring Soon'
                            ? 'bg-[var(--color-input-bg)] text-amber-900 border border-amber-300 font-bold'
                            : 'bg-[rgba(5,28,44,0.06)] text-[var(--color-muted)]'
                        }`}
                      >
                        {statusObj.label}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 font-mono text-[11px] text-[var(--color-muted)]">
                      {item.supportContact || '—'}
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-[var(--color-muted)] hover:text-[var(--color-negative)] p-1 rounded transition-colors"
                        title="Delete asset"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-[var(--color-muted)] text-[12px]">
                    No inventory assets found matching your query.
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
