import React, { useState } from 'react';
import { useJobContext } from '../../context/JobContext';
import { ServiceType } from '../../types';
import { X, Plus, ChevronDown, ChevronUp } from 'lucide-react';

interface NewJobModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewJobModal: React.FC<NewJobModalProps> = ({ isOpen, onClose }) => {
  const { createNewJob } = useJobContext();

  const [client, setClient] = useState('');
  const [serviceType, setServiceType] = useState<ServiceType>('Agricultural shipment inspection');
  const [sampleRef, setSampleRef] = useState('');
  const [dueDate, setDueDate] = useState('Tomorrow, 17:00');

  // Optional details behind expansion
  const [showOptional, setShowOptional] = useState(false);
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('Terminal Quay Berth 4');
  const [scopeDescription, setScopeDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!client.trim() || !sampleRef.trim()) return;

    createNewJob({
      client,
      serviceType,
      sampleRef,
      dueDate,
      title: title || `${serviceType.split(' ')[0]} Inspection — ${sampleRef}`,
      location,
      scopeDescription
    });

    onClose();
  };

  const servicePresets = [
    { label: 'Agricultural shipment inspection', example: 'Bulk grain, oilseeds, or fertilizer cargo' },
    { label: 'Consumer-product testing', example: 'Polymer toys, textiles, or electronics compliance' },
    { label: 'Industrial equipment inspection', example: 'Pressure vessels, pipeline welds, or lifting gear' },
    { label: 'Food & edible oil testing', example: 'Olive oil, fats, acidity, and sensory profiles' },
    { label: 'Construction materials certification', example: 'Concrete cylinders, structural steel, or aggregates' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0E241A]/35 backdrop-blur-2xs">
      <div 
        className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-[#E6E4DD] overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E6E4DD] bg-[#FAF9F6]">
          <div>
            <h3 className="text-base font-bold text-[#0E241A]">Create New Job</h3>
            <p className="text-xs text-[#73847B]">Initiate a fresh inspection, testing, or certification dossier</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#73847B] hover:text-[#19241E] hover:bg-[#ECEAE4] rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#43544B] uppercase tracking-wider mb-1.5">
              Client Operating Entity
            </label>
            <input
              type="text"
              placeholder="e.g. Meridian Agri-Logistics B.V."
              value={client}
              onChange={(e) => setClient(e.target.value)}
              required
              className="w-full px-3.5 py-2 text-sm bg-white border border-[#E6E4DD] rounded-lg focus:outline-none focus:border-[#183C2C] text-[#19241E]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#43544B] uppercase tracking-wider mb-1.5">
              Service Type
            </label>
            <select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value as ServiceType)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-[#E6E4DD] rounded-lg focus:outline-none focus:border-[#183C2C] text-[#19241E]"
            >
              {servicePresets.map(p => (
                <option key={p.label} value={p.label}>
                  {p.label}
                </option>
              ))}
            </select>
            <span className="text-[11px] text-[#73847B] mt-1 block">
              {servicePresets.find(p => p.label === serviceType)?.example}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#43544B] uppercase tracking-wider mb-1.5">
                Sample / Inspection Ref
              </label>
              <input
                type="text"
                placeholder="e.g. SAMPLE-SOYA-449"
                value={sampleRef}
                onChange={(e) => setSampleRef(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-sm bg-white border border-[#E6E4DD] rounded-lg focus:outline-none focus:border-[#183C2C] text-[#19241E] font-mono-numbers"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#43544B] uppercase tracking-wider mb-1.5">
                Due Date
              </label>
              <input
                type="text"
                placeholder="e.g. Tomorrow, 17:00"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-sm bg-white border border-[#E6E4DD] rounded-lg focus:outline-none focus:border-[#183C2C] text-[#19241E]"
              />
            </div>
          </div>

          {/* Optional Details behind expansion */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowOptional(!showOptional)}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#183C2C] hover:underline"
            >
              <span>{showOptional ? 'Hide Optional Scope & Location' : '+ Add Optional Scope & Location'}</span>
              {showOptional ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showOptional && (
              <div className="mt-3 p-3.5 bg-[#FAF9F6] rounded-lg border border-[#E6E4DD] space-y-3">
                <div>
                  <label className="block text-xs font-medium text-[#43544B] mb-1">
                    Job Title / Description
                  </label>
                  <input
                    type="text"
                    placeholder="Custom descriptive title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-[#E6E4DD] rounded-md focus:outline-none focus:border-[#183C2C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#43544B] mb-1">
                    Inspection Location / Facility
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-[#E6E4DD] rounded-md focus:outline-none focus:border-[#183C2C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#43544B] mb-1">
                    Contract Scope Note
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Specific test standards or contractual customer instructions..."
                    value={scopeDescription}
                    onChange={(e) => setScopeDescription(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-[#E6E4DD] rounded-md focus:outline-none focus:border-[#183C2C]"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E6E4DD]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[#43544B] hover:bg-[#F4F3EE] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold text-white bg-[#183C2C] hover:bg-[#24523D] rounded-lg shadow-xs transition-colors"
            >
              Create Job
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
