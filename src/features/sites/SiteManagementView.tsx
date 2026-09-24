import React, { useState } from 'react';
import { IndustrialSite, SoilType } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { 
  Building2, 
  MapPin, 
  Layers, 
  Plus, 
  User, 
  ChevronRight, 
  X, 
  Compass 
} from 'lucide-react';

interface SiteManagementViewProps {
  sites: IndustrialSite[];
  selectedSiteId: string;
  onSelectSite: (id: string) => void;
  onCreateSite: (site: IndustrialSite, actorName: string) => Promise<any>;
}

export const SiteManagementView: React.FC<SiteManagementViewProps> = ({
  sites,
  selectedSiteId,
  onSelectSite,
  onCreateSite
}) => {
  const { currentUser } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New site form
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState<IndustrialSite['category']>('SUBSTATION');
  const [location, setLocation] = useState('');
  const [soilType, setSoilType] = useState<SoilType>('CLAY_RICH');
  const [maxLimit, setMaxLimit] = useState(1.0);
  const [warningLimit, setWarningLimit] = useState(0.8);
  const [totalPits, setTotalPits] = useState(8);
  const [engineer, setEngineer] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newSite: IndustrialSite = {
      id: `site-${Date.now().toString().slice(-4)}`,
      name,
      code,
      category,
      location,
      coordinates: { lat: 28.5, lng: 77.2 },
      soilType,
      defaultStandard: 'IEEE_80',
      maxResistanceLimit: maxLimit,
      warningThreshold: warningLimit,
      totalPits,
      engineerInCharge: engineer,
      contactEmail: email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await onCreateSite(newSite, currentUser.name);
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-700" />
            Industrial Sites & Earthing Grid Infrastructure
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Geographical facilities, soil resistivity stratification, and primary grounding grid topology.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-md bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold transition-colors shadow-2xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Facility</span>
        </button>
      </div>

      {/* Sites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {sites.map((site) => {
          const isSelected = site.id === selectedSiteId;

          return (
            <div
              key={site.id}
              className={`bg-white border rounded-lg p-5 shadow-2xs transition-all ${
                isSelected 
                  ? 'border-blue-600 ring-1 ring-blue-600' 
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Site Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-3 mb-4">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-700">
                    {site.category.replace(/_/g, ' ')}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">
                    {site.name}
                  </h3>
                  <div className="flex items-center space-x-1 text-xs text-slate-500 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{site.location}</span>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-800 font-mono text-xs font-bold border border-slate-200">
                  {site.code}
                </span>
              </div>

              {/* Facility Vital Metrics */}
              <div className="grid grid-cols-3 gap-2.5 text-xs mb-4">
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200/80">
                  <span className="text-[10px] text-slate-500 block font-medium">Earth Pits</span>
                  <span className="text-sm font-bold text-slate-900 mt-0.5 block">{site.totalPits} Electrodes</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200/80">
                  <span className="text-[10px] text-slate-500 block font-medium">Standard</span>
                  <span className="text-sm font-bold text-blue-700 mt-0.5 block font-mono">{site.defaultStandard}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200/80">
                  <span className="text-[10px] text-slate-500 block font-medium">Safety Limit</span>
                  <span className="text-sm font-bold text-emerald-700 mt-0.5 block font-mono">&lt; {site.maxResistanceLimit} Ω</span>
                </div>
              </div>

              {/* Soil & Engineering Info */}
              <div className="space-y-1.5 text-xs border-t border-slate-100 pt-3 text-slate-600 mb-4">
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-500">Soil Profile:</span>
                  <span className="font-medium text-slate-900">{site.soilType.replace(/_/g, ' ')}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-500">Site Lead Engineer:</span>
                  <span className="font-medium text-slate-900">{site.engineerInCharge}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-500">GPS Coordinates:</span>
                  <span className="font-mono text-slate-600 text-[11px]">{site.coordinates.lat.toFixed(4)}°N, {site.coordinates.lng.toFixed(4)}°E</span>
                </div>
              </div>

              {/* Action */}
              <div className="flex justify-end pt-2 border-t border-slate-100">
                <button
                  onClick={() => onSelectSite(site.id)}
                  className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1 shadow-2xs ${
                    isSelected
                      ? 'bg-blue-700 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>{isSelected ? 'Active Facility ✓' : 'Switch to this Facility'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Register Site Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-6 shadow-xl text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-700" />
                Register New Industrial Facility
              </h3>
              <button type="button" onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Facility Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. SECE Engineering Laboratory"
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Facility Code</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. SECE-LAB-01"
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Facility Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  >
                    <option value="SUBSTATION">Electrical Substation</option>
                    <option value="DATA_CENTER">Tier-IV Data Center</option>
                    <option value="SOLAR_PARK">Solar PV Power Plant</option>
                    <option value="REFINERY">Oil & Gas Refinery</option>
                    <option value="TELECOM_TOWER">Telecom Tower BTS</option>
                    <option value="HOSPITAL">Hospital OT Complex</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">Geographical Location</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Electrical Panel – Block A"
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Subsoil Type</label>
                  <select
                    value={soilType}
                    onChange={(e) => setSoilType(e.target.value as SoilType)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  >
                    <option value="CLAY_RICH">Clay Rich (30-80 Ω·m)</option>
                    <option value="MOIST_LOAM">Moist Loam (50-100 Ω·m)</option>
                    <option value="SANDY_LOAM">Sandy Loam (100-300 Ω·m)</option>
                    <option value="ROCKY_GRANITE">Rocky Granite (500-2000 Ω·m)</option>
                    <option value="MARSHY_SALINE">Marshy Saline (10-30 Ω·m)</option>
                    <option value="DRY_SAND">Dry Sand (1000-5000 Ω·m)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Total Earth Electrodes</label>
                  <input
                    type="number"
                    value={totalPits}
                    onChange={(e) => setTotalPits(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Max Limit (Ω)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={maxLimit}
                    onChange={(e) => setMaxLimit(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-slate-900 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Warning Threshold (Ω)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={warningLimit}
                    onChange={(e) => setWarningLimit(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-slate-900 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-3 py-1.5 rounded-md bg-slate-100 text-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-md bg-blue-700 hover:bg-blue-800 text-white font-semibold shadow-2xs"
              >
                Register Facility
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
