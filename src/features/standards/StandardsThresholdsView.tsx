import React, { useState } from 'react';
import { COMPLIANCE_PROFILES } from '../../services/standards';
import { ComplianceStandard, IndustrialSite } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { 
  Sliders, 
  BookOpen, 
  Building, 
  Lock, 
  Check, 
  ExternalLink 
} from 'lucide-react';

interface StandardsThresholdsViewProps {
  sites: IndustrialSite[];
}

export const StandardsThresholdsView: React.FC<StandardsThresholdsViewProps> = ({
  sites
}) => {
  const { currentUser } = useAuth();
  const [selectedStandard, setSelectedStandard] = useState<ComplianceStandard>('IEEE_80');
  const [customLimits, setCustomLimits] = useState<Record<string, { max: number; warn: number }>>({
    'site-sub-01': { max: 1.0, warn: 0.8 },
    'site-dc-02': { max: 1.0, warn: 0.75 },
    'site-solar-03': { max: 5.0, warn: 4.0 },
    'site-refinery-04': { max: 5.0, warn: 3.5 }
  });
  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);

  const canEdit = currentUser.role === 'CHIEF_ELECTRICAL_INSPECTOR';

  const handleUpdateSiteLimit = (siteId: string) => {
    setSavedSuccess(siteId);
    setTimeout(() => setSavedSuccess(null), 2500);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-700" />
            Compliance Standards & Safety Threshold Profiles
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Statutory electrical engineering safety specifications (IEEE 80, IS 3043, IEC 62305, NEC 250).
          </p>
        </div>

        {!canEdit && (
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-slate-100 border border-slate-200 text-slate-600 text-xs font-medium">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Threshold edits restricted to Chief Electrical Inspector</span>
          </div>
        )}
      </div>

      {/* Standards Selection Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {(Object.keys(COMPLIANCE_PROFILES) as ComplianceStandard[]).map((key) => {
          const profile = COMPLIANCE_PROFILES[key];
          const isSelected = selectedStandard === key;

          return (
            <button
              key={key}
              onClick={() => setSelectedStandard(key)}
              className={`p-4 rounded-lg border text-left transition-all ${
                isSelected
                  ? 'bg-blue-50/70 border-blue-600 shadow-2xs'
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
              }`}
            >
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Standard</span>
              <span className={`text-sm font-bold block mt-0.5 ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>
                {key.replace('_', ' ')}
              </span>
              <span className="text-xs font-medium text-slate-500 mt-1 block">
                Limit: &lt; {profile.recommendedLimit_Ohms} Ω
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Standard In-Depth Specification Panel */}
      {selectedStandard && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-2xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-blue-700" />
                <h3 className="text-base font-bold text-slate-900">
                  {COMPLIANCE_PROFILES[selectedStandard].title}
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
                {COMPLIANCE_PROFILES[selectedStandard].description}
              </p>
            </div>
            <div className="text-right text-xs">
              <span className="block text-slate-400 font-medium">Statutory Citation</span>
              <span className="text-blue-700 font-mono font-bold">{COMPLIANCE_PROFILES[selectedStandard].codeReference}</span>
            </div>
          </div>

          {/* Specification Parameters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200/80">
              <span className="text-[10px] text-slate-500 font-sans block font-medium uppercase">Mandatory Max $R_e$</span>
              <span className="text-xl font-bold text-slate-900 mt-1 block">
                &lt; {COMPLIANCE_PROFILES[selectedStandard].recommendedLimit_Ohms} Ω
              </span>
              <span className="text-[10px] text-slate-400 font-sans">Upper compliance threshold</span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200/80">
              <span className="text-[10px] text-slate-500 font-sans block font-medium uppercase">Early Warning Margin</span>
              <span className="text-xl font-bold text-amber-800 mt-1 block">
                {COMPLIANCE_PROFILES[selectedStandard].warningLimit_Ohms} Ω
              </span>
              <span className="text-[10px] text-slate-400 font-sans">Maintenance dispatch level</span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200/80">
              <span className="text-[10px] text-slate-500 font-sans block font-medium uppercase">Tolerable Touch Voltage</span>
              <span className="text-xl font-bold text-slate-900 mt-1 block">
                {COMPLIANCE_PROFILES[selectedStandard].touchPotentialLimit_V} V
              </span>
              <span className="text-[10px] text-slate-400 font-sans">Personnel protection ceiling</span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200/80">
              <span className="text-[10px] text-slate-500 font-sans block font-medium uppercase">Audit Recertification</span>
              <span className="text-xl font-bold text-blue-700 mt-1 block">
                Every {COMPLIANCE_PROFILES[selectedStandard].mandatoryTestFrequencyMonths} Mo
              </span>
              <span className="text-[10px] text-slate-400 font-sans">Statutory inspection cycle</span>
            </div>
          </div>
        </div>
      )}

      {/* Facility Site Threshold Assignment Table */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-1 flex items-center gap-2">
          <Building className="w-4 h-4 text-blue-700" />
          Active Facility Grounding Safety Threshold Configurations
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Configure site-specific earth resistance warning and trip limits based on local soil resistivity surveys and grid short-circuit ratings.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] font-semibold">
                <th className="py-2.5 px-3">Facility Name</th>
                <th className="py-2.5 px-3">Standard</th>
                <th className="py-2.5 px-3">Soil Profile</th>
                <th className="py-2.5 px-3">Warning Limit (Ω)</th>
                <th className="py-2.5 px-3">Critical Limit (Ω)</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sites.map((site) => {
                const limits = customLimits[site.id] || { max: site.maxResistanceLimit, warn: site.warningThreshold };

                return (
                  <tr key={site.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{site.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{site.code} · {site.totalPits} Pits</div>
                    </td>
                    <td className="py-3 px-3 text-blue-700 font-semibold font-mono">
                      {site.defaultStandard}
                    </td>
                    <td className="py-3 px-3 text-slate-700">
                      {site.soilType.replace(/_/g, ' ')}
                    </td>
                    <td className="py-3 px-3">
                      {canEdit ? (
                        <input
                          type="number"
                          step="0.05"
                          value={limits.warn}
                          onChange={(e) => setCustomLimits(prev => ({
                            ...prev,
                            [site.id]: { ...limits, warn: Number(e.target.value) }
                          }))}
                          className="w-20 bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-blue-600"
                        />
                      ) : (
                        <span className="text-slate-800 font-mono font-semibold">{limits.warn} Ω</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {canEdit ? (
                        <input
                          type="number"
                          step="0.05"
                          value={limits.max}
                          onChange={(e) => setCustomLimits(prev => ({
                            ...prev,
                            [site.id]: { ...limits, max: Number(e.target.value) }
                          }))}
                          className="w-20 bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-blue-600"
                        />
                      ) : (
                        <span className="text-slate-800 font-mono font-semibold">{limits.max} Ω</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {canEdit ? (
                        <button
                          onClick={() => handleUpdateSiteLimit(site.id)}
                          className="px-3 py-1 rounded-md bg-blue-700 hover:bg-blue-800 text-white font-semibold transition-colors shadow-2xs"
                        >
                          {savedSuccess === site.id ? 'Saved ✓' : 'Save Limit'}
                        </button>
                      ) : (
                        <span className="text-slate-400">Locked</span>
                      )}
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
