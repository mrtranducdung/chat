import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Filter, Plus, Trash2, Save, CheckCircle2, AlertCircle, Calendar, Globe, Package, Users, Briefcase, Tag, Activity, Edit2, X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface FilterOption {
  id: string;
  name: string;
  icon: any;
  enabled: boolean;
  type: 'standard' | 'custom';
  options?: string[];
}

const STANDARD_FILTERS: FilterOption[] = [
  { id: 'month', name: 'Month', icon: Calendar, enabled: true, type: 'standard', options: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] },
  { id: 'quarter', name: 'Quarter', icon: Calendar, enabled: true, type: 'standard', options: ['Q1', 'Q2', 'Q3', 'Q4'] },
  { id: 'location', name: 'Location', icon: Globe, enabled: true, type: 'standard', options: ['Hanoi', 'Ho Chi Minh City', 'Da Nang'] },
  { id: 'product', name: 'Product', icon: Package, enabled: true, type: 'standard', options: ['Product A', 'Product B', 'Product C'] },
  { id: 'sales_channel', name: 'Sales Channel', icon: Tag, enabled: false, type: 'standard', options: ['Direct', 'Partner', 'Online'] },
  { id: 'status', name: 'Status', icon: Activity, enabled: false, type: 'standard', options: ['Active', 'Pending', 'Closed'] },
  { id: 'marketing_campaign', name: 'Marketing Campaign', icon: Briefcase, enabled: false, type: 'standard', options: ['Spring Promo', 'Summer Sale'] },
  { id: 'distribution_channel', name: 'Distribution Channel', icon: Users, enabled: false, type: 'standard', options: ['Retail', 'Wholesale'] },
];

export const FilterMaker = () => {
  const { t } = useLanguage();
  const [filters, setFilters] = useState<FilterOption[]>(() => {
    const saved = localStorage.getItem('dashboard_filters');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const merged = [...STANDARD_FILTERS];
        parsed.forEach((p: FilterOption) => {
          const existingIndex = merged.findIndex(m => m.id === p.id);
          if (existingIndex >= 0) {
            merged[existingIndex] = { ...merged[existingIndex], enabled: p.enabled, options: p.options };
          } else if (p.type === 'custom') {
            merged.push(p);
          }
        });
        return merged;
      } catch (e) {
        return STANDARD_FILTERS;
      }
    }
    return STANDARD_FILTERS;
  });

  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [newFilterName, setNewFilterName] = useState('');
  const [newFilterOptions, setNewFilterOptions] = useState('');

  const [editingFilterId, setEditingFilterId] = useState<string | null>(null);
  const [editFilterName, setEditFilterName] = useState('');
  const [editFilterOptions, setEditFilterOptions] = useState('');

  const handleToggleFilter = (id: string) => {
    setFilters(filters.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f));
  };

  const handleDeleteFilter = (id: string) => {
    if (confirm('Are you sure you want to delete this custom filter?')) {
      setFilters(filters.filter(f => f.id !== id));
    }
  };

  const handleSave = () => {
    localStorage.setItem('dashboard_filters', JSON.stringify(filters));
    alert('Filters configuration saved successfully! The dashboard will now use these filters.');
  };

  const handleAddCustomFilter = () => {
    if (!newFilterName.trim()) return;

    const optionsList = newFilterOptions.split(',').map(s => s.trim()).filter(Boolean);

    const newFilter: FilterOption = {
      id: `custom_${Date.now()}`,
      name: newFilterName,
      icon: Filter,
      enabled: true,
      type: 'custom',
      options: optionsList.length > 0 ? optionsList : ['Option 1', 'Option 2']
    };

    setFilters([...filters, newFilter]);
    setIsAddingCustom(false);
    setNewFilterName('');
    setNewFilterOptions('');
  };

  const handleEditFilter = (filter: FilterOption, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingFilterId(filter.id);
    setEditFilterName(filter.name);
    setEditFilterOptions(filter.options?.join(', ') || '');
  };

  const handleSaveEdit = () => {
    const optionsList = editFilterOptions.split(',').map(s => s.trim()).filter(Boolean);
    setFilters(filters.map(f => f.id === editingFilterId ? {
      ...f,
      name: f.type === 'custom' ? editFilterName : f.name,
      options: optionsList.length > 0 ? optionsList : ['Option 1', 'Option 2']
    } : f));
    setEditingFilterId(null);
  };

  const renderFilterCard = (filter: FilterOption) => {
    const Icon = filter.icon;
    const isEditing = editingFilterId === filter.id;

    if (isEditing) {
      return (
        <div key={filter.id} className="p-4 rounded-xl border-2 border-indigo-400 bg-white shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-800">Edit Filter</h4>
            <button onClick={() => setEditingFilterId(null)} className="text-slate-400 hover:text-slate-600">
              <X size={16} />
            </button>
          </div>
          {filter.type === 'custom' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Name</label>
              <input
                type="text"
                value={editFilterName}
                onChange={(e) => setEditFilterName(e.target.value)}
                className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Options (comma separated)</label>
            <input
              type="text"
              value={editFilterOptions}
              onChange={(e) => setEditFilterOptions(e.target.value)}
              className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div className="flex justify-end mt-2">
            <button
              onClick={handleSaveEdit}
              className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      );
    }

    return (
      <div
        key={filter.id}
        className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-4 ${filter.enabled ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}
        onClick={() => handleToggleFilter(filter.id)}
      >
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${filter.enabled ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-500'}`}>
          <Icon size={20} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className={`font-bold ${filter.enabled ? 'text-indigo-900' : 'text-slate-700'}`}>{filter.name}</h4>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => handleEditFilter(filter, e)}
                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                title="Edit Options"
              >
                <Edit2 size={14} />
              </button>
              {filter.type === 'custom' && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteFilter(filter.id); }}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete Filter"
                >
                  <Trash2 size={14} />
                </button>
              )}
              {filter.enabled && <CheckCircle2 size={18} className="text-indigo-600 ml-1" />}
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1 line-clamp-1">
            Options: {filter.options?.join(', ')}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col space-y-4">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm shrink-0">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Filter size={20} />
          </div>
          <div>
            <h2 className="font-bold text-slate-800">Filter Maker</h2>
            <p className="text-xs text-slate-500">Customize the filters available on the executive dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button onClick={handleSave} className="flex-1 sm:flex-none px-6 py-2 flex items-center justify-center gap-2 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200">
            <Save size={16} /> Save Filters
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="max-w-4xl mx-auto space-y-8">

          {/* Standard Filters */}
          <section>
            <div className="mb-4">
              <h3 className="text-lg font-bold text-slate-800">Standard Filters (Recommended)</h3>
              <p className="text-sm text-slate-500">Enable or disable standard filters that are most commonly used by executives to slice and dice data. You can edit their options.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filters.filter(f => f.type === 'standard').map(renderFilterCard)}
            </div>
          </section>

          {/* Custom Filters */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Custom Filters</h3>
                <p className="text-sm text-slate-500">Create your own specific filters tailored to your business needs.</p>
              </div>
              <button
                onClick={() => setIsAddingCustom(true)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors flex items-center gap-2"
              >
                <Plus size={16} /> Add Custom Filter
              </button>
            </div>

            {isAddingCustom && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-50 p-5 rounded-xl border border-slate-200 mb-4 space-y-4"
              >
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Filter Name</label>
                  <input
                    type="text"
                    value={newFilterName}
                    onChange={(e) => setNewFilterName(e.target.value)}
                    placeholder="e.g., Project Phase"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Options (comma separated)</label>
                  <input
                    type="text"
                    value={newFilterOptions}
                    onChange={(e) => setNewFilterOptions(e.target.value)}
                    placeholder="e.g., Planning, Execution, Review"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setIsAddingCustom(false)}
                    className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddCustomFilter}
                    disabled={!newFilterName.trim()}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Filter
                  </button>
                </div>
              </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filters.filter(f => f.type === 'custom').length === 0 && !isAddingCustom && (
                <div className="col-span-full p-8 text-center border-2 border-dashed border-slate-200 rounded-xl">
                  <p className="text-slate-500 text-sm">No custom filters added yet.</p>
                </div>
              )}

              {filters.filter(f => f.type === 'custom').map(renderFilterCard)}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};
