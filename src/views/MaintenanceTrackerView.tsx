import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  formatCurrency, 
  addPeriodToDate, 
  calculateDaysRemaining, 
  getMaintenanceStatus 
} from '../utils/calculations';
import { MaintenanceTask } from '../types';
import { 
  Wrench, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  RotateCw, 
  Info 
} from 'lucide-react';

export const MaintenanceTrackerView: React.FC = () => {
  const { state, updateState } = useApp();
  const { maintenanceTasks, params } = state;
  const currency = params.PARAM_CURRENCY_SYM || '$';
  const warnDays = params.PARAM_MAINT_WARN_DAYS || 30;

  const [showAddForm, setShowAddForm] = useState(false);
  const [newTask, setNewTask] = useState<Partial<MaintenanceTask>>({
    taskName: '',
    systemCategory: 'HVAC',
    frequencyValue: 3,
    frequencyUnit: 'Months',
    lastCompletedDate: new Date().toISOString().split('T')[0],
    assignedVendor: 'DIY',
    actualCost: 0,
    notesSpecs: '',
  });

  // Calculate KPIs
  const { ytdSpend, pendingAlertCount } = useMemo(() => {
    let spend = 0;
    let alerts = 0;

    for (const t of maintenanceTasks) {
      spend += t.actualCost || 0;
      const nextDue = addPeriodToDate(t.lastCompletedDate, t.frequencyValue, t.frequencyUnit);
      const daysLeft = calculateDaysRemaining(nextDue);
      const st = getMaintenanceStatus(daysLeft, warnDays);
      if (st.isAnomaly) {
        alerts += 1;
      }
    }

    return { ytdSpend: spend, pendingAlertCount: alerts };
  }, [maintenanceTasks, warnDays]);

  const handleUpdateTask = (id: string, field: keyof MaintenanceTask, value: any) => {
    updateState((prev) => ({
      ...prev,
      maintenanceTasks: prev.maintenanceTasks.map((t) =>
        t.id === id ? { ...t, [field]: value } : t
      ),
    }));
  };

  const handleMarkDoneToday = (id: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    handleUpdateTask(id, 'lastCompletedDate', todayStr);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.taskName?.trim()) return;

    const task: MaintenanceTask = {
      id: `mt-${Date.now()}`,
      taskName: newTask.taskName || 'Maintenance Task',
      systemCategory: newTask.systemCategory || 'HVAC',
      frequencyValue: Number(newTask.frequencyValue) || 3,
      frequencyUnit: newTask.frequencyUnit || 'Months',
      lastCompletedDate: newTask.lastCompletedDate || new Date().toISOString().split('T')[0],
      assignedVendor: newTask.assignedVendor || 'DIY',
      actualCost: Number(newTask.actualCost) || 0,
      notesSpecs: newTask.notesSpecs || '',
    };

    updateState((prev) => ({
      ...prev,
      maintenanceTasks: [...prev.maintenanceTasks, task],
    }));

    setNewTask({
      taskName: '',
      systemCategory: 'HVAC',
      frequencyValue: 3,
      frequencyUnit: 'Months',
      lastCompletedDate: new Date().toISOString().split('T')[0],
      assignedVendor: 'DIY',
      actualCost: 0,
      notesSpecs: '',
    });
    setShowAddForm(false);
  };

  const handleDeleteTask = (id: string) => {
    updateState((prev) => ({
      ...prev,
      maintenanceTasks: prev.maintenanceTasks.filter((t) => t.id !== id),
    }));
  };

  return (
    <div className="space-y-8 tab-content-enter">
      {/* Page Header */}
      <div className="border-b border-[var(--color-border)] pb-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-[0.06em] text-[var(--color-muted)] font-semibold">
            Sheet 06 / Preventative Care & Recurring Schedules
          </span>
          <h1 className="font-display text-[30px] font-bold text-[var(--color-primary)] mt-1 tracking-[-0.03em]">
            Periodic Maintenance Tracker
          </h1>
        </div>
        <p className="text-[13px] text-[var(--color-muted)]">
          Prevent high-cost repairs through structured recurring schedules and proactive threshold alerts.
        </p>
      </div>

      {/* KPI Cards (B3:E4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="apple-card p-5">
          <div className="flex items-center justify-between text-[var(--color-muted)] mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.05em]">Cumulative Maintenance Spend</span>
            <Wrench className="w-4 h-4 text-[var(--color-muted)]" />
          </div>
          <div className="font-display text-[34px] font-bold text-[var(--color-primary)] tracking-[-0.03em]">
            {formatCurrency(ytdSpend, currency)}
          </div>
          <div className="text-[12px] text-[var(--color-muted)] mt-1">
            Supplies, servicing, and technician fees
          </div>
        </div>

        <div className="apple-card p-5">
          <div className="flex items-center justify-between text-[var(--color-muted)] mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.05em]">Action-Required Tasks</span>
            {pendingAlertCount > 0 ? (
              <AlertTriangle className="w-4 h-4 text-[var(--color-negative)]" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-[var(--color-positive)]" />
            )}
          </div>
          <div
            className={`font-display text-[34px] font-bold tracking-[-0.03em] ${
              pendingAlertCount > 0 ? 'text-[var(--color-negative)]' : 'text-[var(--color-primary)]'
            }`}
          >
            {pendingAlertCount} <span className="text-[14px] font-normal text-[var(--color-muted)]">Tasks</span>
          </div>
          <div className="text-[12px] text-[var(--color-muted)] mt-1">
            {pendingAlertCount > 0 ? 'Overdue or due within threshold window' : 'All systems operating within cycle'}
          </div>
        </div>
      </div>

      {/* Insight Block */}
      <div className="insight-block">
        <div className="flex items-start gap-3">
          <Info className="w-4 h-4 text-[var(--color-accent)] mt-0.5 flex-shrink-0" />
          <div className="text-[12px] text-[var(--color-body-text)] leading-relaxed">
            Next Due Dates are computed dynamically via interval projections. Tasks within{' '}
            <strong>{warnDays} days</strong> trigger a <em>Due Soon</em> warning. Clicking <strong>Mark Done</strong> logs
            today's date and rolls over the cycle automatically.
          </div>
        </div>
      </div>

      {/* Table_Maintenance */}
      <div className="apple-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-[var(--color-border)] pb-3">
          <div>
            <h2 className="font-heading text-[18px] font-bold text-[var(--color-primary)]">
              Routine Home Maintenance Register (Table_Maintenance B6:L100)
            </h2>
            <p className="text-[12px] text-[var(--color-muted)]">
              Schedule intervals in Months, Years, or Days. Automated overdue detection.
            </p>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] bg-[var(--color-primary)] text-white text-[12px] font-medium hover:opacity-90 transition-opacity cursor-pointer self-start sm:self-auto shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showAddForm ? 'Cancel' : 'Add Maintenance Item'}</span>
          </button>
        </div>

        {/* Add Maintenance Drawer */}
        {showAddForm && (
          <form
            onSubmit={handleAddTask}
            className="mb-6 p-4 rounded-[var(--radius-sm)] bg-[var(--color-bg)]/80 border border-[var(--color-border)] space-y-4 animate-fadeIn"
          >
            <h3 className="font-bold text-[13px] text-[var(--color-primary)]">Register Maintenance Task</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-[var(--color-muted)] mb-1 uppercase">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Inspect sump pump and check valve"
                  value={newTask.taskName}
                  onChange={(e) => setNewTask({ ...newTask, taskName: e.target.value })}
                  className="w-full px-3 py-2 bg-white text-[13px] border border-[var(--color-border)] rounded-[var(--radius-sm)]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-muted)] mb-1 uppercase">System Category</label>
                <select
                  value={newTask.systemCategory}
                  onChange={(e) => setNewTask({ ...newTask, systemCategory: e.target.value as any })}
                  className="w-full px-3 py-2 bg-white text-[13px] border border-[var(--color-border)] rounded-[var(--radius-sm)]"
                >
                  <option value="HVAC">HVAC</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Roof & Exterior">Roof & Exterior</option>
                  <option value="Interior">Interior</option>
                  <option value="Lawn & Safety">Lawn & Safety</option>
                </select>
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-[11px] font-semibold text-[var(--color-muted)] mb-1 uppercase">Freq. Value</label>
                  <input
                    type="number"
                    min="1"
                    value={newTask.frequencyValue}
                    onChange={(e) => setNewTask({ ...newTask, frequencyValue: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3 py-2 bg-white text-[13px] border border-[var(--color-border)] rounded-[var(--radius-sm)]"
                  />
                </div>
                <div className="w-24">
                  <label className="block text-[11px] font-semibold text-[var(--color-muted)] mb-1 uppercase">Unit</label>
                  <select
                    value={newTask.frequencyUnit}
                    onChange={(e) => setNewTask({ ...newTask, frequencyUnit: e.target.value as any })}
                    className="w-full px-3 py-2 bg-white text-[13px] border border-[var(--color-border)] rounded-[var(--radius-sm)]"
                  >
                    <option value="Months">Mo.</option>
                    <option value="Years">Yrs.</option>
                    <option value="Days">Days</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-muted)] mb-1 uppercase">Last Completed Date *</label>
                <input
                  type="date"
                  required
                  value={newTask.lastCompletedDate}
                  onChange={(e) => setNewTask({ ...newTask, lastCompletedDate: e.target.value })}
                  className="w-full px-3 py-2 bg-white text-[13px] border border-[var(--color-border)] rounded-[var(--radius-sm)]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-muted)] mb-1 uppercase">Assigned Vendor / DIY</label>
                <input
                  type="text"
                  placeholder="e.g. DIY or Apex Plumbing"
                  value={newTask.assignedVendor}
                  onChange={(e) => setNewTask({ ...newTask, assignedVendor: e.target.value })}
                  className="w-full px-3 py-2 bg-white text-[13px] border border-[var(--color-border)] rounded-[var(--radius-sm)]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-muted)] mb-1 uppercase">Actual Cost ({currency})</label>
                <input
                  type="number"
                  step="0.01"
                  value={newTask.actualCost}
                  onChange={(e) => setNewTask({ ...newTask, actualCost: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-white text-[13px] border border-[var(--color-border)] rounded-[var(--radius-sm)] font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-muted)] mb-1 uppercase">Notes / Specs</label>
                <input
                  type="text"
                  placeholder="e.g. 16x25x1 MERV 11 filter"
                  value={newTask.notesSpecs}
                  onChange={(e) => setNewTask({ ...newTask, notesSpecs: e.target.value })}
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
                Register Task
              </button>
            </div>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="bg-[var(--table-header-bg)] border-b-2 border-[var(--table-header-sep)]">
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)]">Task Name</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)]">System</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)] text-center">Frequency</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)]">Last Done</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)]">Next Due</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)] text-right">Days Left</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)] text-center">Status</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)]">Assigned</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)] text-right">Cost</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)]">Specs / Notes</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)] text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {maintenanceTasks.map((t, idx) => {
                const nextDueDate = addPeriodToDate(t.lastCompletedDate, t.frequencyValue, t.frequencyUnit);
                const daysLeft = calculateDaysRemaining(nextDueDate);
                const statusObj = getMaintenanceStatus(daysLeft, warnDays);

                return (
                  <tr
                    key={t.id}
                    className={`border-b border-[var(--color-border)] hover:bg-[rgba(5,28,44,0.02)] transition-colors ${
                      statusObj.status === 'Overdue'
                        ? 'bg-[var(--anomaly-bg)]'
                        : idx % 2 === 0
                        ? 'bg-white'
                        : 'bg-[var(--color-bg)]/40'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-semibold text-[var(--color-primary)]">
                      {t.taskName}
                    </td>

                    <td className="py-2.5 px-3">
                      <span className="badge-pill bg-[rgba(5,28,44,0.06)] text-[var(--color-primary)]">
                        {t.systemCategory}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-center font-mono text-[12px] text-[var(--color-muted)]">
                      {t.frequencyValue} {t.frequencyUnit}
                    </td>

                    <td className="py-2.5 px-3">
                      <input
                        type="date"
                        value={t.lastCompletedDate}
                        onChange={(e) => handleUpdateTask(t.id, 'lastCompletedDate', e.target.value)}
                        className="px-2 py-1 input-editable font-mono text-[12px] text-[var(--color-primary)]"
                      />
                    </td>

                    <td className="py-2.5 px-3 font-mono font-semibold text-[12px] text-[var(--color-primary)]">
                      {nextDueDate}
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono text-[12px]">
                      {daysLeft < 0 ? (
                        <span className="text-[var(--color-negative)] font-bold">{daysLeft} d</span>
                      ) : daysLeft <= warnDays ? (
                        <span className="text-amber-700 font-bold">{daysLeft} d</span>
                      ) : (
                        <span className="text-[var(--color-muted)]">{daysLeft} d</span>
                      )}
                    </td>

                    {/* Status Pill */}
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`badge-pill ${
                          statusObj.status === 'Overdue'
                            ? 'bg-[var(--anomaly-bg)] text-[var(--color-negative)] border border-[var(--color-negative)]/30 font-bold'
                            : statusObj.status === 'Due Soon'
                            ? 'bg-[var(--color-input-bg)] text-amber-900 border border-amber-300 font-semibold'
                            : 'bg-[rgba(5,28,44,0.06)] text-[var(--color-primary)]'
                        }`}
                      >
                        {statusObj.label}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-[12px] text-[var(--color-muted)]">
                      {t.assignedVendor}
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono font-medium text-[var(--color-primary)]">
                      {formatCurrency(t.actualCost, currency)}
                    </td>

                    <td className="py-2.5 px-3 text-[11px] text-[var(--color-muted)] max-w-[150px] truncate" title={t.notesSpecs}>
                      {t.notesSpecs || '—'}
                    </td>

                    <td className="py-2.5 px-3 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => handleMarkDoneToday(t.id)}
                        className="px-2 py-1 text-[11px] rounded bg-[rgba(5,28,44,0.06)] hover:bg-[var(--color-primary)] hover:text-white transition-colors text-[var(--color-primary)] font-medium cursor-pointer"
                        title="Mark Completed Today"
                      >
                        <RotateCw className="w-3 h-3 inline mr-1" />
                        Done
                      </button>
                      <button
                        onClick={() => handleDeleteTask(t.id)}
                        className="text-[var(--color-muted)] hover:text-[var(--color-negative)] p-1 rounded transition-colors inline-block"
                        title="Delete task"
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
