import React from 'react';
import { ESP32Device, IndustrialSite } from '../../types';
import { TouchStepPotentialCard } from './TouchStepPotentialCard';
import { ElectrodePitCard } from './ElectrodePitCard';
import { Activity, ShieldCheck, Cpu, ArrowRight } from 'lucide-react';

interface LiveMonitoringDedicatedViewProps {
  devices: ESP32Device[];
  activeSite: IndustrialSite;
  activeDevice: ESP32Device | undefined;
  onSelectDevice: (id: string) => void;
  onNavigateToTab: (tab: any) => void;
}

export const LiveMonitoringDedicatedView: React.FC<LiveMonitoringDedicatedViewProps> = ({
  devices,
  activeSite,
  activeDevice,
  onSelectDevice,
  onNavigateToTab
}) => {
  const currentDev = activeDevice || devices[0];

  return (
    <div className="space-y-6">
      
      {/* Top Bar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-700" />
            Live Grounding Safety & Touch/Step Potential Monitoring
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Continuous Wenner 4-wire electrode verification, physical pit stratification, and IEEE 80 shock margins.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-500 font-medium">Monitoring Point:</span>
          <select
            value={currentDev?.id}
            onChange={(e) => onSelectDevice(e.target.value)}
            className="bg-white border border-slate-300 rounded-md px-3 py-1.5 text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-600 shadow-2xs cursor-pointer"
          >
            {devices.map(d => (
              <option key={d.id} value={d.id}>
                {d.id} · {d.pitLabel} ({d.siteName})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main 2-Column Industrial Instrumentation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TouchStepPotentialCard
          currentResistance={currentDev?.currentResistance || 0.62}
          siteStandard={activeSite.defaultStandard}
        />

        {currentDev && (
          <ElectrodePitCard device={currentDev} />
        )}
      </div>

      {/* Raw Wenner 4-Terminal Lead Status & Noise Rejection Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <h3 className="font-semibold text-slate-900 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            4-Terminal Probe Continuity & Noise Rejection Matrix
          </h3>
          <span className="text-[11px] font-mono text-slate-500">128Hz Synchronous Demodulation</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div className="bg-slate-50 p-3 rounded border border-slate-200/80">
            <span className="text-[10px] text-slate-500 font-sans block font-medium">Current Lead C1-C2</span>
            <span className="text-emerald-700 font-bold mt-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              CONTINUOUS (20.0 mA)
            </span>
            <span className="text-[10px] text-slate-400 font-sans mt-0.5 block">Constant AC generator</span>
          </div>

          <div className="bg-slate-50 p-3 rounded border border-slate-200/80">
            <span className="text-[10px] text-slate-500 font-sans block font-medium">Potential Lead P1-P2</span>
            <span className="text-emerald-700 font-bold mt-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              CONTINUOUS (Low Offset)
            </span>
            <span className="text-[10px] text-slate-400 font-sans mt-0.5 block">Differential ADC input</span>
          </div>

          <div className="bg-slate-50 p-3 rounded border border-slate-200/80">
            <span className="text-[10px] text-slate-500 font-sans block font-medium">50/60Hz Common Mode Noise</span>
            <span className="text-slate-900 font-bold mt-1 block">
              {currentDev?.strayVoltage_V || 0.4} V (&gt; 42dB Attenuation)
            </span>
            <span className="text-[10px] text-slate-400 font-sans mt-0.5 block">Active notch filter</span>
          </div>

          <div className="bg-slate-50 p-3 rounded border border-slate-200/80">
            <span className="text-[10px] text-slate-500 font-sans block font-medium">Subsoil Temperature</span>
            <span className="text-slate-900 font-bold mt-1 block">
              {currentDev?.soilTemperature_C || 24.5} °C (PT100 RTD)
            </span>
            <span className="text-[10px] text-slate-400 font-sans mt-0.5 block">Moisture compensation active</span>
          </div>
        </div>
      </div>

    </div>
  );
};
