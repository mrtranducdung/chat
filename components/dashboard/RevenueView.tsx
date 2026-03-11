import React from 'react';
import { ChevronRight, Bot } from 'lucide-react';

export const RevenueView = ({ onClose }: { onClose: () => void }) => {
  const handleAskAgent = () => {
    window.dispatchEvent(new CustomEvent('open-ai-chatbot'));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">Back to Dashboard</button>
          <ChevronRight size={16} className="text-slate-400" />
          <h2 className="text-xl font-semibold text-slate-800">Revenue Analysis</h2>
        </div>
        <div className="flex gap-2">
          <select className="bg-white border border-slate-200 text-sm rounded-lg px-3 py-1.5">
            <option>Month</option>
            <option>Quarter</option>
            <option>YTD</option>
          </select>
          <select className="bg-white border border-slate-200 text-sm rounded-lg px-3 py-1.5">
            <option>By Team</option>
            <option>By Product</option>
            <option>By Account</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 font-semibold text-slate-800">Plan vs Actual</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Segment</th>
                  <th className="px-4 py-3 font-medium">Plan</th>
                  <th className="px-4 py-3 font-medium">Actual</th>
                  <th className="px-4 py-3 font-medium">Gap</th>
                  <th className="px-4 py-3 font-medium">% Attainment</th>
                  <th className="px-4 py-3 font-medium">Forecast EOM</th>
                  <th className="px-4 py-3 font-medium">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50 cursor-pointer">
                  <td className="px-4 py-3 font-medium text-slate-800">Enterprise Team</td>
                  <td className="px-4 py-3">¥120M</td>
                  <td className="px-4 py-3">¥95M</td>
                  <td className="px-4 py-3 text-red-600">-¥25M</td>
                  <td className="px-4 py-3">79%</td>
                  <td className="px-4 py-3">¥110M</td>
                  <td className="px-4 py-3"><span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-semibold">Med</span></td>
                </tr>
                <tr className="hover:bg-slate-50 cursor-pointer">
                  <td className="px-4 py-3 font-medium text-slate-800">SMB Team</td>
                  <td className="px-4 py-3">¥80M</td>
                  <td className="px-4 py-3">¥85M</td>
                  <td className="px-4 py-3 text-emerald-600">+¥5M</td>
                  <td className="px-4 py-3">106%</td>
                  <td className="px-4 py-3">¥90M</td>
                  <td className="px-4 py-3"><span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-semibold">High</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-4 border-b border-slate-100 font-semibold text-slate-800">Gap Explorer</div>
          <div className="p-4 space-y-4">
            <div className="p-3 bg-red-50 rounded-lg border border-red-100">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-red-800 text-sm">Slipped Deals</h4>
                <span className="text-red-600 font-bold text-sm">¥15M</span>
              </div>
              <p className="text-xs text-red-600 mb-3">Reason: Budget frozen until Q4</p>
              <div className="flex gap-2">
                <button onClick={handleAskAgent} className="text-xs bg-white text-slate-700 border border-slate-200 px-2 py-1 rounded flex items-center gap-1 hover:bg-slate-50">
                  <Bot size={12} /> Ask Agent
                </button>
                <button className="text-xs bg-white text-slate-700 border border-slate-200 px-2 py-1 rounded hover:bg-slate-50">
                  Create Task
                </button>
              </div>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-amber-800 text-sm">Low Pipeline Coverage</h4>
                <span className="text-amber-600 font-bold text-sm">1.2x</span>
              </div>
              <p className="text-xs text-amber-600 mb-3">Target: 3.0x remaining plan</p>
              <div className="flex gap-2">
                <button onClick={handleAskAgent} className="text-xs bg-white text-slate-700 border border-slate-200 px-2 py-1 rounded flex items-center gap-1 hover:bg-slate-50">
                  <Bot size={12} /> Ask Agent
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
