'use client';

import React, { useState } from 'react';

interface InspectionData {
  obd2Codes: string[];
  paintThickness: {
    hood: number;
    roof: number;
    doors: number;
  };
  checklist: {
    leaks: boolean;
    brakesWear: string;
    fluidsStatus: string;
  };
}

export function InspectionForm({ dealId, onSubmit }: { dealId: string, onSubmit?: (data: any, hash: string) => void }) {
  const [obdCodeInput, setObdCodeInput] = useState('');
  const [data, setData] = useState<InspectionData>({
    obd2Codes: [],
    paintThickness: { hood: 0, roof: 0, doors: 0 },
    checklist: { leaks: false, brakesWear: 'Good', fluidsStatus: 'Good' }
  });

  const generateSignatureHash = async (payload: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(payload);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payloadStr = JSON.stringify(data);
    const hash = await generateSignatureHash(payloadStr);

    if (onSubmit) {
      onSubmit(data, hash);
    }
  };

  const handleAddCode = () => {
    if (obdCodeInput) {
      setData(prev => ({ ...prev, obd2Codes: [...prev.obd2Codes, obdCodeInput] }));
      setObdCodeInput('');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-[#09090B] text-white rounded-xl border border-[#27272A]">
      <h2 className="text-2xl font-bold mb-6 text-[#10B981]">Módulo D: Inspección Mecánica</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium">OBD-II Codes</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={obdCodeInput}
              onChange={e => setObdCodeInput(e.target.value)}
              className="flex-1 bg-transparent border border-[#27272A] rounded p-2"
              placeholder="e.g. P0300"
            />
            <button type="button" onClick={handleAddCode} className="px-4 py-2 bg-[#27272A] rounded hover:bg-gray-700">Add</button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {data.obd2Codes.map((code, idx) => (
              <span key={idx} className="px-2 py-1 bg-red-900/50 text-red-400 rounded text-sm">{code}</span>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b border-[#27272A] pb-2">Paint Thickness (Microns)</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm mb-1">Hood</label>
              <input
                type="number"
                value={data.paintThickness.hood}
                onChange={e => setData(prev => ({ ...prev, paintThickness: { ...prev.paintThickness, hood: Number(e.target.value) } }))}
                className="w-full bg-transparent border border-[#27272A] rounded p-2"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Roof</label>
              <input
                type="number"
                value={data.paintThickness.roof}
                onChange={e => setData(prev => ({ ...prev, paintThickness: { ...prev.paintThickness, roof: Number(e.target.value) } }))}
                className="w-full bg-transparent border border-[#27272A] rounded p-2"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Doors</label>
              <input
                type="number"
                value={data.paintThickness.doors}
                onChange={e => setData(prev => ({ ...prev, paintThickness: { ...prev.paintThickness, doors: Number(e.target.value) } }))}
                className="w-full bg-transparent border border-[#27272A] rounded p-2"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b border-[#27272A] pb-2">Checklist</h3>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={data.checklist.leaks}
              onChange={e => setData(prev => ({ ...prev, checklist: { ...prev.checklist, leaks: e.target.checked } }))}
              className="rounded bg-[#27272A] border-transparent focus:ring-offset-0 focus:ring-0"
            />
            <span className="text-sm">Visible leaks (Oil, transmission, etc.)</span>
          </label>

          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <label className="block text-sm mb-1">Brakes Wear</label>
              <select
                value={data.checklist.brakesWear}
                onChange={e => setData(prev => ({ ...prev, checklist: { ...prev.checklist, brakesWear: e.target.value } }))}
                className="w-full bg-[#09090B] border border-[#27272A] rounded p-2"
              >
                <option>Good</option>
                <option>Fair</option>
                <option>Needs Replacement</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">Fluids Status</label>
              <select
                value={data.checklist.fluidsStatus}
                onChange={e => setData(prev => ({ ...prev, checklist: { ...prev.checklist, fluidsStatus: e.target.value } }))}
                className="w-full bg-[#09090B] border border-[#27272A] rounded p-2"
              >
                <option>Good</option>
                <option>Needs Service</option>
              </select>
            </div>
          </div>
        </div>

        <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold transition-colors mt-6">
          Sign & Submit Inspection
        </button>
      </form>
    </div>
  );
}
