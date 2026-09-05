import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatNumber } from '../utils/calculations';
import { UtilityRecord } from '../types';
import { 
  Zap, 
  Flame, 
  Droplet, 
  TrendingUp, 
  Plus, 
  Trash2, 
  BarChart3, 
  Info 
} from 'lucide-react';

export const EnergyAnalyticsView: React.FC = () => {
  const { state, updateState } = useApp();
  const utilityRecords = state.utilityRecords || [];
  const { params } = state;
  const currency = params.PARAM_CURRENCY_SYM || '$';

  const [showAddForm, setShowAddForm] = useState(false);
  const [newRec, setNewRec] = useState<Partial<UtilityRecord>>({
    period: '2026-10',
    daysInCycle: 31,
    electricityKwh: 450,
    electricityCost: 95,
    gasTherms: 18,
    gasCost: 28,
    waterGallons: 3800,
    waterCost: 55,
  });

  // KPI Calculations
  const { totalSpend, totalKwh, totalTherms, totalGallons, avgDailyKwh } = useMemo(() => {
    let spend = 0;
    let kwh = 0;
    let therms = 0;
    let gal = 0;
    let days = 0;

    for (const r of utilityRecords) {
      spend += (r.electricityCost || 0) + (r.gasCost || 0) + (r.waterCost || 0);
      kwh += r.electricityKwh || 0;
      therms += r.gasTherms || 0;
      gal += r.waterGallons || 0;
      days += r.daysInCycle || 30;
    }

    const avgDaily = days > 0 ? kwh / days : 0;
    return {
      totalSpend: spend,
      totalKwh: kwh,
      totalTherms: therms,
      totalGallons: gal,
      avgDailyKwh: avgDaily,
    };
  }, [utilityRecords]);

  const handleUpdateRecord = (id: string, field: keyof UtilityRecord, value: any) => {
    updateState((prev) => ({
      ...prev,
      utilityRecords: (prev.utilityRecords || []).map((r) =>
        r.id === id ? { ...r, [field]: value } : r
      ),
    }));
  };

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const rec: UtilityRecord = {
      id: `util-${Date.now()}`,
      period: newRec.period || '2026-01',
      daysInCycle: Number(newRec.daysInCycle) || 30,
      electricityKwh: Number(newRec.electricityKwh) || 0,
      electricityCost: Number(newRec.electricityCost) || 0,
      gasTherms: Number(newRec.gasTherms) || 0,
      gasCost: Number(newRec.gasCost) || 0,
      waterGallons: Number(newRec.waterGallons) || 0,
      waterCost: Number(newRec.waterCost) || 0,
    };

    updateState((prev) => ({
      ...prev,
      utilityRecords: [...(prev.utilityRecords || []), rec],
    }));

    setNewRec({
      period: '2026-11',
      daysInCycle: 30,
      electricityKwh: 480,
      electricityCost: 105,
      gasTherms: 35,
      gasCost: 48,
      waterGallons: 3600,
      waterCost: 55,
    });
    setShowAddForm(false);
  };

  const handleDeleteRecord = (id: string) => {
    updateState((prev) => ({
      ...prev,
      utilityRecords: (prev.utilityRecords || []).filter((r) => r.id !== id),
    }));
  };

  // Find max monthly spend for proportional bar chart
  const maxSpend = useMemo(() => {
    let max = 1;
    for (const r of utilityRecords) {
      const sum = (r.electricityCost || 0) + (r.gasCost || 0) + (r.waterCost || 0);
      if (sum > max) max = sum;
    }
    return max;
  }, [utilityRecords]);

  return (
    <div className="space-y-8 tab-content-enter">
      {/* Page Header */}
      <div className="border-b border-[var(--color-border)] pb-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-[0.06em] text-[var(--color-muted)] font-semibold">
            Sheet 09 / Resource Consumption & Baseline Efficiency
          </span>
          <h1 className="font-display text-[30px] font-bold text-[var(--color-primary)] mt-1 tracking-[-0.03em]">
            Energy & Utility Consumption Analytics
          </h1>
        </div>
        <p className="text-[13px] text-[var(--color-muted)]">
          Audit multi-commodity meters: electricity (kWh), gas (Therms), and water (Gallons).
        </p>
      </div>

      {/* KPI Row (B3:I4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="apple-card p-5">
          <div className="flex items-center justify-between text-[var(--color-muted)] mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.05em]">Total Utility Outlay</span>
            <TrendingUp className="w-4 h-4 text-[var(--color-muted)]" />
          </div>
          <div className="font-display text-[34px] font-bold text-[var(--color-primary)] tracking-[-0.03em]">
            {formatCurrency(totalSpend, currency)}
          </div>
          <div className="text-[12px] text-[var(--color-muted)] mt-1">
            Across {utilityRecords.length} billing cycles
          </div>
        </div>

        <div className="apple-card p-5">
          <div className="flex items-center justify-between text-[var(--color-muted)] mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.05em]">Electricity Consumed</span>
            <Zap className="w-4 h-4 text-[var(--color-accent)]" />
          </div>
          <div className="font-display text-[34px] font-bold text-[var(--color-accent)] tracking-[-0.03em]">
            {formatNumber(totalKwh)} <span className="text-[14px] font-normal text-[var(--color-muted)]">kWh</span>
          </div>
          <div className="text-[12px] text-[var(--color-muted)] mt-1">
            Daily average: {avgDailyKwh.toFixed(1)} kWh/day
          </div>
        </div>

        <div className="apple-card p-5">
          <div className="flex items-center justify-between text-[var(--color-muted)] mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.05em]">Natural Gas Burned</span>
            <Flame className="w-4 h-4 text-amber-600" />
          </div>
          <div className="font-display text-[34px] font-bold text-amber-700 tracking-[-0.03em]">
            {formatNumber(totalTherms)} <span className="text-[14px] font-normal text-[var(--color-muted)]">Therms</span>
          </div>
          <div className="text-[12px] text-[var(--color-muted)] mt-1">
            Heating & domestic hot water
          </div>
        </div>

        <div className="apple-card p-5">
          <div className="flex items-center justify-between text-[var(--color-muted)] mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.05em]">Water Volume Used</span>
            <Droplet className="w-4 h-4 text-sky-600" />
          </div>
          <div className="font-display text-[34px] font-bold text-sky-700 tracking-[-0.03em]">
            {formatNumber(totalGallons)} <span className="text-[14px] font-normal text-[var(--color-muted)]">Gal</span>
          </div>
          <div className="text-[12px] text-[var(--color-muted)] mt-1">
            Irrigation and indoor domestic
          </div>
        </div>
      </div>

      {/* Utility Trend Visualizer */}
      <div className="apple-card p-6">
        <div className="flex items-center justify-between mb-4 border-b border-[var(--color-border)] pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[var(--color-accent)]" />
            <h2 className="font-heading text-[18px] font-bold text-[var(--color-primary)]">
              Monthly Utility Commodity Breakdown
            </h2>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[var(--color-accent)]" />
              <span>Electricity</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-amber-600" />
              <span>Natural Gas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-sky-500" />
              <span>Water</span>
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          {utilityRecords.map((r) => {
            const periodTotal = (r.electricityCost || 0) + (r.gasCost || 0) + (r.waterCost || 0);
            const totalWidthPct = (periodTotal / maxSpend) * 100;

            const elePct = periodTotal > 0 ? (r.electricityCost / periodTotal) * 100 : 0;
            const gasPct = periodTotal > 0 ? (r.gasCost / periodTotal) * 100 : 0;
            const watPct = periodTotal > 0 ? (r.waterCost / periodTotal) * 100 : 0;

            return (
              <div key={r.id} className="flex items-center gap-3 text-[12px]">
                <span className="w-16 font-mono font-medium text-[var(--color-primary)]">{r.period}</span>
                <div className="flex-1 bg-[rgba(5,28,44,0.04)] h-5 rounded-[var(--radius-sm)] overflow-hidden flex">
                  <div style={{ width: `${totalWidthPct}%` }} className="h-full flex">
                    <div
                      style={{ width: `${elePct}%` }}
                      className="bg-[var(--color-accent)] h-full transition-all duration-300"
                      title={`Electric: ${formatCurrency(r.electricityCost, currency)}`}
                    />
                    <div
                      style={{ width: `${gasPct}%` }}
                      className="bg-amber-600 h-full transition-all duration-300"
                      title={`Gas: ${formatCurrency(r.gasCost, currency)}`}
                    />
                    <div
                      style={{ width: `${watPct}%` }}
                      className="bg-sky-500 h-full transition-all duration-300"
                      title={`Water: ${formatCurrency(r.waterCost, currency)}`}
                    />
                  </div>
                </div>
                <span className="w-20 text-right font-mono font-semibold text-[var(--color-primary)]">
                  {formatCurrency(periodTotal, currency)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Table_Energy */}
      <div className="apple-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-[var(--color-border)] pb-3">
          <div>
            <h2 className="font-heading text-[18px] font-bold text-[var(--color-primary)]">
              Multi-Meter Billing & Efficiency Ledger (Table_Energy B6:O100)
            </h2>
            <p className="text-[12px] text-[var(--color-muted)]">
              Computes blended unit cost ($/kWh, $/Therm) and normalized daily power load.
            </p>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] bg-[var(--color-primary)] text-white text-[12px] font-medium hover:opacity-90 transition-opacity cursor-pointer self-start sm:self-auto shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showAddForm ? 'Cancel' : 'Add Utility Cycle'}</span>
          </button>
        </div>

        {/* Add Cycle Drawer */}
        {showAddForm && (
          <form
            onSubmit={handleAddRecord}
            className="mb-6 p-4 rounded-[var(--radius-sm)] bg-[var(--color-bg)]/80 border border-[var(--color-border)] space-y-4 animate-fadeIn"
          >
            <h3 className="font-bold text-[13px] text-[var(--color-primary)]">Record Utility Statement</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-muted)] mb-1 uppercase">Period (YYYY-MM)</label>
                <input
                  type="text"
                  required
                  placeholder="2026-10"
                  value={newRec.period}
                  onChange={(e) => setNewRec({ ...newRec, period: e.target.value })}
                  className="w-full px-3 py-2 bg-white text-[13px] border border-[var(--color-border)] rounded-[var(--radius-sm)] font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-muted)] mb-1 uppercase">Billing Days</label>
                <input
                  type="number"
                  value={newRec.daysInCycle}
                  onChange={(e) => setNewRec({ ...newRec, daysInCycle: parseInt(e.target.value, 10) || 30 })}
                  className="w-full px-3 py-2 bg-white text-[13px] border border-[var(--color-border)] rounded-[var(--radius-sm)]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-muted)] mb-1 uppercase">Electric Usage (kWh)</label>
                <input
                  type="number"
                  step="1"
                  value={newRec.electricityKwh}
                  onChange={(e) => setNewRec({ ...newRec, electricityKwh: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-white text-[13px] border border-[var(--color-border)] rounded-[var(--radius-sm)]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-muted)] mb-1 uppercase">Electric Cost ({currency})</label>
                <input
                  type="number"
                  step="0.01"
                  value={newRec.electricityCost}
                  onChange={(e) => setNewRec({ ...newRec, electricityCost: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-white text-[13px] border border-[var(--color-border)] rounded-[var(--radius-sm)] font-bold text-[var(--color-accent)]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-muted)] mb-1 uppercase">Gas Usage (Therms)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newRec.gasTherms}
                  onChange={(e) => setNewRec({ ...newRec, gasTherms: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-white text-[13px] border border-[var(--color-border)] rounded-[var(--radius-sm)]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-muted)] mb-1 uppercase">Gas Cost ({currency})</label>
                <input
                  type="number"
                  step="0.01"
                  value={newRec.gasCost}
                  onChange={(e) => setNewRec({ ...newRec, gasCost: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-white text-[13px] border border-[var(--color-border)] rounded-[var(--radius-sm)] font-bold text-amber-700"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-muted)] mb-1 uppercase">Water Usage (Gal)</label>
                <input
                  type="number"
                  step="10"
                  value={newRec.waterGallons}
                  onChange={(e) => setNewRec({ ...newRec, waterGallons: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-white text-[13px] border border-[var(--color-border)] rounded-[var(--radius-sm)]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-muted)] mb-1 uppercase">Water Cost ({currency})</label>
                <input
                  type="number"
                  step="0.01"
                  value={newRec.waterCost}
                  onChange={(e) => setNewRec({ ...newRec, waterCost: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-white text-[13px] border border-[var(--color-border)] rounded-[var(--radius-sm)] font-bold text-sky-700"
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
                Save Utility Cycle
              </button>
            </div>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="bg-[var(--table-header-bg)] border-b-2 border-[var(--table-header-sep)]">
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)]">Period</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)] text-center">Days</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)] text-right">Electric kWh</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)] text-right">Electric Cost</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)] text-right">$/kWh</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)] text-right">Gas Therms</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)] text-right">Gas Cost</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)] text-right">$/Therm</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)] text-right">Water Gal</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)] text-right">Water Cost</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)] text-right font-bold">Total Bill</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)] text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {utilityRecords.map((r, idx) => {
                const totalBill = (r.electricityCost || 0) + (r.gasCost || 0) + (r.waterCost || 0);
                const unitElec = r.electricityKwh > 0 ? r.electricityCost / r.electricityKwh : 0;
                const unitGas = r.gasTherms > 0 ? r.gasCost / r.gasTherms : 0;

                return (
                  <tr
                    key={r.id}
                    className={`border-b border-[var(--color-border)] hover:bg-[rgba(5,28,44,0.02)] transition-colors ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-[var(--color-bg)]/40'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-mono font-bold text-[var(--color-primary)]">
                      {r.period}
                    </td>

                    <td className="py-2.5 px-3 text-center font-mono text-[12px] text-[var(--color-muted)]">
                      {r.daysInCycle}
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <input
                        type="number"
                        step="1"
                        value={r.electricityKwh}
                        onChange={(e) =>
                          handleUpdateRecord(r.id, 'electricityKwh', parseFloat(e.target.value) || 0)
                        }
                        className="w-16 px-2 py-1 input-editable text-right font-mono text-[12px] text-[var(--color-primary)]"
                      />
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <input
                        type="number"
                        step="0.01"
                        value={r.electricityCost}
                        onChange={(e) =>
                          handleUpdateRecord(r.id, 'electricityCost', parseFloat(e.target.value) || 0)
                        }
                        className="w-20 px-2 py-1 input-editable text-right font-mono font-bold text-[12px] text-[var(--color-accent)]"
                      />
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono text-[11px] text-[var(--color-muted)]">
                      ${unitElec.toFixed(3)}
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <input
                        type="number"
                        step="0.1"
                        value={r.gasTherms}
                        onChange={(e) =>
                          handleUpdateRecord(r.id, 'gasTherms', parseFloat(e.target.value) || 0)
                        }
                        className="w-16 px-2 py-1 input-editable text-right font-mono text-[12px] text-[var(--color-primary)]"
                      />
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <input
                        type="number"
                        step="0.01"
                        value={r.gasCost}
                        onChange={(e) =>
                          handleUpdateRecord(r.id, 'gasCost', parseFloat(e.target.value) || 0)
                        }
                        className="w-20 px-2 py-1 input-editable text-right font-mono font-bold text-[12px] text-amber-700"
                      />
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono text-[11px] text-[var(--color-muted)]">
                      ${unitGas.toFixed(3)}
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <input
                        type="number"
                        step="10"
                        value={r.waterGallons}
                        onChange={(e) =>
                          handleUpdateRecord(r.id, 'waterGallons', parseFloat(e.target.value) || 0)
                        }
                        className="w-18 px-2 py-1 input-editable text-right font-mono text-[12px] text-[var(--color-primary)]"
                      />
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <input
                        type="number"
                        step="0.01"
                        value={r.waterCost}
                        onChange={(e) =>
                          handleUpdateRecord(r.id, 'waterCost', parseFloat(e.target.value) || 0)
                        }
                        className="w-20 px-2 py-1 input-editable text-right font-mono font-bold text-[12px] text-sky-700"
                      />
                    </td>

                    {/* Total Period Spend */}
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-[13px] text-[var(--color-primary)]">
                      {formatCurrency(totalBill, currency)}
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => handleDeleteRecord(r.id)}
                        className="text-[var(--color-muted)] hover:text-[var(--color-negative)] p-1 rounded transition-colors"
                        title="Delete cycle"
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
