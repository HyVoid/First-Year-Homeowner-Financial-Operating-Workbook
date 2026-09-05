import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatPercent } from '../utils/calculations';
import { ImprovementProject } from '../types';
import { 
  Hammer, 
  TrendingUp, 
  DollarSign, 
  CheckCircle, 
  Plus, 
  Trash2, 
  FileText, 
  Info 
} from 'lucide-react';

export const HomeImprovementView: React.FC = () => {
  const { state, updateState } = useApp();
  const { improvementProjects, params } = state;
  const currency = params.PARAM_CURRENCY_SYM || '$';

  const [showAddForm, setShowAddForm] = useState(false);
  const [newProj, setNewProj] = useState<Partial<ImprovementProject>>({
    projectName: '',
    category: 'Interior Remodel',
    contractor: '',
    startDate: new Date().toISOString().split('T')[0],
    completionDate: '',
    budget: 0,
    actualCost: 0,
    estValueAdd: 0,
    permitRequired: false,
    permitNumber: '',
    status: 'In Progress',
  });

  // KPI Calculations
  const { totalBudget, totalActual, totalValueAdd, blendedRoi } = useMemo(() => {
    let b = 0;
    let a = 0;
    let v = 0;

    for (const p of improvementProjects) {
      b += p.budget ?? p.budgetedCost ?? 0;
      a += p.actualCost || 0;
      v += p.estValueAdd ?? Math.round(p.actualCost * 1.15);
    }

    const roi = a > 0 ? v / a : 0;
    return { totalBudget: b, totalActual: a, totalValueAdd: v, blendedRoi: roi };
  }, [improvementProjects]);

  const handleUpdateProject = (id: string, field: keyof ImprovementProject, value: any) => {
    updateState((prev) => ({
      ...prev,
      improvementProjects: prev.improvementProjects.map((p) =>
        p.id === id ? { ...p, [field]: value } : p
      ),
    }));
  };

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProj.projectName?.trim()) return;

    const proj: ImprovementProject = {
      id: `imp-${Date.now()}`,
      projectName: newProj.projectName || 'Project',
      category: newProj.category || 'Interior Remodel',
      contractor: newProj.contractor || '',
      startDate: newProj.startDate || new Date().toISOString().split('T')[0],
      completionDate: newProj.completionDate || '',
      budget: Number(newProj.budget) || 0,
      actualCost: Number(newProj.actualCost) || 0,
      estValueAdd: Number(newProj.estValueAdd) || 0,
      permitRequired: Boolean(newProj.permitRequired),
      permitNumber: newProj.permitNumber || '',
      status: (newProj.status as any) || 'In Progress',
    };

    updateState((prev) => ({
      ...prev,
      improvementProjects: [...prev.improvementProjects, proj],
    }));

    setNewProj({
      projectName: '',
      category: 'Interior Remodel',
      contractor: '',
      startDate: new Date().toISOString().split('T')[0],
      completionDate: '',
      budget: 0,
      actualCost: 0,
      estValueAdd: 0,
      permitRequired: false,
      permitNumber: '',
      status: 'In Progress',
    });
    setShowAddForm(false);
  };

  const handleDeleteProject = (id: string) => {
    updateState((prev) => ({
      ...prev,
      improvementProjects: prev.improvementProjects.filter((p) => p.id !== id),
    }));
  };

  return (
    <div className="space-y-8 tab-content-enter">
      {/* Page Header */}
      <div className="border-b border-[var(--color-border)] pb-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-[0.06em] text-[var(--color-muted)] font-semibold">
            Sheet 08 / Capital Investments & Equity Recoupment
          </span>
          <h1 className="font-display text-[30px] font-bold text-[var(--color-primary)] mt-1 tracking-[-0.03em]">
            Home Improvement & ROI Tracker
          </h1>
        </div>
        <p className="text-[13px] text-[var(--color-muted)]">
          Audit project cost variances, municipal permits, and post-renovation equity yield.
        </p>
      </div>

      {/* KPI Row (B3:I4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="apple-card p-5">
          <div className="flex items-center justify-between text-[var(--color-muted)] mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.05em]">Total Capital Budget</span>
            <DollarSign className="w-4 h-4 text-[var(--color-muted)]" />
          </div>
          <div className="font-display text-[34px] font-bold text-[var(--color-primary)] tracking-[-0.03em]">
            {formatCurrency(totalBudget, currency)}
          </div>
          <div className="text-[12px] text-[var(--color-muted)] mt-1">
            Planned project appropriations
          </div>
        </div>

        <div className="apple-card p-5">
          <div className="flex items-center justify-between text-[var(--color-muted)] mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.05em]">Actual Capital Invested</span>
            <Hammer className="w-4 h-4 text-[var(--color-accent)]" />
          </div>
          <div className="font-display text-[34px] font-bold text-[var(--color-accent)] tracking-[-0.03em]">
            {formatCurrency(totalActual, currency)}
          </div>
          <div className="text-[12px] text-[var(--color-muted)] mt-1">
            Disbursed across {improvementProjects.length} projects
          </div>
        </div>

        <div className="apple-card p-5">
          <div className="flex items-center justify-between text-[var(--color-muted)] mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.05em]">Appraised Value Gain</span>
            <TrendingUp className="w-4 h-4 text-[var(--color-accent)]" />
          </div>
          <div className="font-display text-[34px] font-bold text-[var(--color-primary)] tracking-[-0.03em]">
            {formatCurrency(totalValueAdd, currency)}
          </div>
          <div className="text-[12px] text-[var(--color-muted)] mt-1">
            Estimated market equity appreciation
          </div>
        </div>

        <div className="apple-card p-5">
          <div className="flex items-center justify-between text-[var(--color-muted)] mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.05em]">Blended Recoupment Rate</span>
            <span className="text-[11px] font-semibold text-[var(--color-accent)]">{formatPercent(blendedRoi)}</span>
          </div>
          <div className="font-display text-[34px] font-bold text-[var(--color-primary)] tracking-[-0.03em]">
            {formatPercent(blendedRoi, 1)}
          </div>
          <div className="text-[12px] text-[var(--color-muted)] mt-1">
            Appraisal yield per dollar deployed
          </div>
        </div>
      </div>

      {/* Insight Block */}
      <div className="insight-block">
        <div className="flex items-start gap-3">
          <Info className="w-4 h-4 text-[var(--color-accent)] mt-0.5 flex-shrink-0" />
          <div className="text-[12px] text-[var(--color-body-text)] leading-relaxed">
            Permit documentation is critical for future resale disclosures and insurance validation. Track approved
            permit records alongside real contractor disbursements.
          </div>
        </div>
      </div>

      {/* Table_Improvement */}
      <div className="apple-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-[var(--color-border)] pb-3">
          <div>
            <h2 className="font-heading text-[18px] font-bold text-[var(--color-primary)]">
              Capital Projects & Renovation Ledger (Table_Improvement B6:M100)
            </h2>
            <p className="text-[12px] text-[var(--color-muted)]">
              Variance highlights overruns in red. ROI reflects estimated property market appreciation.
            </p>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] bg-[var(--color-primary)] text-white text-[12px] font-medium hover:opacity-90 transition-opacity cursor-pointer self-start sm:self-auto shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showAddForm ? 'Cancel' : 'Add Renovation Project'}</span>
          </button>
        </div>

        {/* Add Project Drawer */}
        {showAddForm && (
          <form
            onSubmit={handleAddProject}
            className="mb-6 p-4 rounded-[var(--radius-sm)] bg-[var(--color-bg)]/80 border border-[var(--color-border)] space-y-4 animate-fadeIn"
          >
            <h3 className="font-bold text-[13px] text-[var(--color-primary)]">Initiate Improvement Project</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-[var(--color-muted)] mb-1 uppercase">Project Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Bathroom Full Remodel"
                  value={newProj.projectName}
                  onChange={(e) => setNewProj({ ...newProj, projectName: e.target.value })}
                  className="w-full px-3 py-2 bg-white text-[13px] border border-[var(--color-border)] rounded-[var(--radius-sm)]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-muted)] mb-1 uppercase">Category</label>
                <select
                  value={newProj.category}
                  onChange={(e) => setNewProj({ ...newProj, category: e.target.value })}
                  className="w-full px-3 py-2 bg-white text-[13px] border border-[var(--color-border)] rounded-[var(--radius-sm)]"
                >
                  <option value="Interior Remodel">Interior Remodel</option>
                  <option value="Exterior">Exterior</option>
                  <option value="Energy & Solar">Energy & Solar</option>
                  <option value="Landscaping">Landscaping</option>
                  <option value="Addition / Structural">Addition / Structural</option>
                  <option value="Smart Home">Smart Home</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-muted)] mb-1 uppercase">Lead Contractor</label>
                <input
                  type="text"
                  placeholder="e.g. Precision Tile LLC"
                  value={newProj.contractor}
                  onChange={(e) => setNewProj({ ...newProj, contractor: e.target.value })}
                  className="w-full px-3 py-2 bg-white text-[13px] border border-[var(--color-border)] rounded-[var(--radius-sm)]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-muted)] mb-1 uppercase">Start Date</label>
                <input
                  type="date"
                  value={newProj.startDate}
                  onChange={(e) => setNewProj({ ...newProj, startDate: e.target.value })}
                  className="w-full px-3 py-2 bg-white text-[13px] border border-[var(--color-border)] rounded-[var(--radius-sm)]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-muted)] mb-1 uppercase">Completion Date</label>
                <input
                  type="date"
                  value={newProj.completionDate}
                  onChange={(e) => setNewProj({ ...newProj, completionDate: e.target.value })}
                  className="w-full px-3 py-2 bg-white text-[13px] border border-[var(--color-border)] rounded-[var(--radius-sm)]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-muted)] mb-1 uppercase">Planned Budget ({currency})</label>
                <input
                  type="number"
                  step="100"
                  value={newProj.budget}
                  onChange={(e) => setNewProj({ ...newProj, budget: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-white text-[13px] border border-[var(--color-border)] rounded-[var(--radius-sm)] font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-muted)] mb-1 uppercase">Actual Cost ({currency})</label>
                <input
                  type="number"
                  step="100"
                  value={newProj.actualCost}
                  onChange={(e) => setNewProj({ ...newProj, actualCost: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-white text-[13px] border border-[var(--color-border)] rounded-[var(--radius-sm)] font-bold text-[var(--color-accent)]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-muted)] mb-1 uppercase">Est. Value Added ({currency})</label>
                <input
                  type="number"
                  step="100"
                  value={newProj.estValueAdd}
                  onChange={(e) => setNewProj({ ...newProj, estValueAdd: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-white text-[13px] border border-[var(--color-border)] rounded-[var(--radius-sm)] font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-muted)] mb-1 uppercase">Status</label>
                <select
                  value={newProj.status}
                  onChange={(e) => setNewProj({ ...newProj, status: e.target.value as any })}
                  className="w-full px-3 py-2 bg-white text-[13px] border border-[var(--color-border)] rounded-[var(--radius-sm)]"
                >
                  <option value="Planning">Planning</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="permitReq"
                  checked={newProj.permitRequired}
                  onChange={(e) => setNewProj({ ...newProj, permitRequired: e.target.checked })}
                  className="w-4 h-4 rounded text-[var(--color-accent)]"
                />
                <label htmlFor="permitReq" className="text-[12px] font-medium text-[var(--color-primary)]">
                  Municipal Permit Required
                </label>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-muted)] mb-1 uppercase">Permit / Sign-off #</label>
                <input
                  type="text"
                  placeholder="e.g. BLD-2026-8841"
                  value={newProj.permitNumber}
                  onChange={(e) => setNewProj({ ...newProj, permitNumber: e.target.value })}
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
                Save Project
              </button>
            </div>
          </form>
        )}

        {/* Projects Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="bg-[var(--table-header-bg)] border-b-2 border-[var(--table-header-sep)]">
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)]">Project Name</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)]">Category</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)]">Contractor</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)] text-right">Budget</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)] text-right">Actual Cost</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)] text-right">Variance</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)] text-right">Value Added</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)] text-right">Recoup ROI</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)]">Permit #</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)] text-center">Status</th>
                <th className="py-2.5 px-3 font-table-head text-[11px] text-[var(--color-primary)] text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {improvementProjects.map((p, idx) => {
                const budget = p.budget ?? p.budgetedCost ?? 0;
                const variance = p.actualCost - budget;
                const isOver = variance > 0 && budget > 0;
                const valAdd = p.estValueAdd ?? Math.round(p.actualCost * 1.15);
                const roi = p.actualCost > 0 ? valAdd / p.actualCost : 0;

                return (
                  <tr
                    key={p.id}
                    className={`border-b border-[var(--color-border)] hover:bg-[rgba(5,28,44,0.02)] transition-colors ${
                      isOver && (variance / budget) > params.PARAM_BUDGET_OVER_PCT
                        ? 'bg-[var(--anomaly-bg)]'
                        : idx % 2 === 0
                        ? 'bg-white'
                        : 'bg-[var(--color-bg)]/40'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-semibold text-[var(--color-primary)]">
                      {p.projectName || p.projectTitle}
                    </td>

                    <td className="py-2.5 px-3">
                      <span className="badge-pill bg-[rgba(5,28,44,0.06)] text-[var(--color-primary)]">
                        {p.category || p.areaScope || p.classification}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-[12px] text-[var(--color-muted)]">
                      {p.contractor || '—'}
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono text-[var(--color-muted)]">
                      {formatCurrency(budget, currency)}
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <input
                        type="number"
                        step="100"
                        value={p.actualCost}
                        onChange={(e) =>
                          handleUpdateProject(p.id, 'actualCost', parseFloat(e.target.value) || 0)
                        }
                        className="w-24 px-2 py-1 input-editable text-right font-mono font-bold text-[12px] text-[var(--color-primary)]"
                      />
                    </td>

                    <td
                      className={`py-2.5 px-3 text-right font-mono text-[12px] ${
                        variance > 0 ? 'text-[var(--color-negative)] font-bold' : 'text-[var(--color-muted)]'
                      }`}
                    >
                      {variance > 0 ? `+${formatCurrency(variance, currency)}` : formatCurrency(variance, currency)}
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <input
                        type="number"
                        step="100"
                        value={p.estValueAdd}
                        onChange={(e) =>
                          handleUpdateProject(p.id, 'estValueAdd', parseFloat(e.target.value) || 0)
                        }
                        className="w-24 px-2 py-1 input-editable text-right font-mono text-[12px] text-[var(--color-accent)]"
                      />
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-[12px] text-[var(--color-primary)]">
                      {formatPercent(roi, 0)}
                    </td>

                    <td className="py-2.5 px-3 font-mono text-[11px] text-[var(--color-muted)]">
                      {p.permitRequired ? (
                        p.permitNumber ? (
                          <span>{p.permitNumber}</span>
                        ) : (
                          <span className="text-amber-800 font-medium">Pending Sign-off</span>
                        )
                      ) : (
                        <span className="text-[var(--color-muted)]">No Permit</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`badge-pill ${
                          p.status === 'Completed'
                            ? 'bg-[rgba(5,28,44,0.06)] text-[var(--color-primary)] font-medium'
                            : p.status === 'In Progress'
                            ? 'bg-[rgba(34,81,255,0.1)] text-[var(--color-accent)] font-semibold'
                            : 'bg-[rgba(5,28,44,0.04)] text-[var(--color-muted)]'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => handleDeleteProject(p.id)}
                        className="text-[var(--color-muted)] hover:text-[var(--color-negative)] p-1 rounded transition-colors"
                        title="Delete project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {improvementProjects.length === 0 && (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-[var(--color-muted)] text-[12px]">
                    No home improvement projects registered yet.
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
