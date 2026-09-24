import React, { useState } from 'react';
import { ESP32Device, IndustrialSite, TelemetryReading } from '../../types';
import { evaluateCompliance } from '../../services/standards';
import { LiveResistanceChart } from './LiveResistanceChart';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Wifi, 
  Cloud, 
  Clock, 
  Cpu, 
  MapPin, 
  Building2, 
  Layers, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity
} from 'lucide-react';

interface LiveOverviewViewProps {
  devices: ESP32Device[];
  siteDevices: ESP32Device[];
  activeSite: IndustrialSite;
  activeDevice: ESP32Device | undefined;
  onSelectDevice: (id: string) => void;
  onNavigateToTab: (tab: any) => void;
}

export const LiveOverviewView: React.FC<LiveOverviewViewProps> = ({
  devices,
  siteDevices,
  activeSite,
  activeDevice,
  onSelectDevice,
  onNavigateToTab
}) => {
  const currentDev = activeDevice || siteDevices[0] || devices[0];

  if (!currentDev) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
        <Cpu className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-slate-900">NO MEASUREMENTS YET</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          The device has not transmitted its first valid measurement. Check device power and Wi-Fi connection.
        </p>
      </div>
    );
  }

  const compliance = evaluateCompliance(
    currentDev.currentResistance,
    activeSite.defaultStandard,
    currentDev.targetMaxResistance,
    currentDev.warningResistance
  );

  const isWarning = compliance.status === 'WARNING';
  const isCritical = compliance.status === 'CRITICAL_HIGH' || compliance.status === 'OPEN_CIRCUIT';
  const isNormal = compliance.status === 'COMPLIANT';

  // Last update time formatted
  const lastUpdateTime = new Date(currentDev.lastReadingAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return (
    <div className="space-y-6">
      
      {/* 1. HERO MEASUREMENT PANEL */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 rounded bg-blue-50 text-blue-700">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Primary Monitoring Point
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-500 font-semibold">
                  DEMO TELEMETRY
                </span>
              </div>
              <h2 className="text-sm font-semibold text-slate-900 mt-0.5">
                {currentDev.pitLabel} · {currentDev.id}
              </h2>
            </div>
          </div>

          {/* Quick Device Switcher dropdown */}
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-500 font-medium">Select Point:</span>
            <select
              value={currentDev.id}
              onChange={(e) => onSelectDevice(e.target.value)}
              className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md px-3 py-1.5 text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
            >
              {siteDevices.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.id} ({d.pitLabel})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Hero Measurement Readout & Instrument Indicator */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 py-2">
          
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
              EARTH RESISTANCE
            </span>
            
            <div className="flex items-baseline space-x-3">
              <span className={`text-6xl sm:text-7xl font-mono font-bold tracking-tight ${
                isCritical 
                  ? 'text-red-600' 
                  : isWarning 
                  ? 'text-amber-600' 
                  : 'text-slate-900'
              }`}>
                {currentDev.currentResistance.toFixed(2)}
              </span>
              <span className="text-3xl sm:text-4xl font-mono font-medium text-slate-500">
                Ω
              </span>
            </div>

            <div className="pt-2 flex items-center space-x-3">
              <span className={`px-3 py-1 rounded text-xs font-semibold uppercase tracking-wide border ${
                isCritical
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : isWarning
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                {isCritical ? 'CRITICAL' : isWarning ? 'WARNING' : 'NORMAL'}
              </span>

              <span className="text-xs text-slate-500 font-mono">
                Statutory Limit: &lt; {currentDev.targetMaxResistance} Ω ({activeSite.defaultStandard})
              </span>
            </div>
          </div>

          {/* Instrument Diagnostic Summary Metadata */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-6 bg-slate-50/70 p-4 rounded-lg border border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Measurement Quality</span>
              <span className="font-semibold text-emerald-700 flex items-center gap-1 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                VALID (4-Wire Wenner)
              </span>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Device Hardware</span>
              <span className="font-semibold text-slate-800 mt-1 block">
                {currentDev.id}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Monitoring Location</span>
              <span className="font-semibold text-slate-800 mt-1 block truncate max-w-[140px]" title={currentDev.pitLabel}>
                {currentDev.pitLabel}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Last Updated</span>
              <span className="font-semibold font-mono text-slate-800 mt-1 block">
                {lastUpdateTime}
              </span>
            </div>
          </div>

        </div>

      </section>

      {/* 2. COMPACT ENGINEERING KPI SECTION (4-6 CLEAN CARDS) */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
        
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 uppercase block">Current Status</span>
          <div className="mt-1.5 flex items-center space-x-1.5">
            <span className={`w-2 h-2 rounded-full ${
              isCritical ? 'bg-red-600' : isWarning ? 'bg-amber-500' : 'bg-emerald-600'
            }`}></span>
            <span className="font-bold text-slate-900 text-sm">
              {isCritical ? 'CRITICAL' : isWarning ? 'WARNING' : 'NORMAL'}
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 uppercase block">Resistance</span>
          <div className="mt-1.5 font-mono font-bold text-slate-900 text-sm">
            {currentDev.currentResistance.toFixed(2)} Ω
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 uppercase block">Last Measurement</span>
          <div className="mt-1.5 font-mono font-semibold text-slate-900 text-sm">
            {lastUpdateTime}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 uppercase block">Device Status</span>
          <div className="mt-1.5 font-semibold text-emerald-700 text-sm flex items-center space-x-1">
            <Wifi className="w-3.5 h-3.5" />
            <span>ONLINE</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 uppercase block">Data Quality</span>
          <div className="mt-1.5 font-semibold text-slate-900 text-sm flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>VALID</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 uppercase block">Active Alerts</span>
          <div className="mt-1.5 font-bold text-sm">
            {isCritical ? (
              <span className="text-red-600 font-mono">1 CRITICAL</span>
            ) : isWarning ? (
              <span className="text-amber-700 font-mono">1 WARNING</span>
            ) : (
              <span className="text-slate-600 font-mono">0 ACTIVE</span>
            )}
          </div>
        </div>

      </section>

      {/* 3. LIVE TREND SECTION */}
      <section>
        <LiveResistanceChart
          readings={[]}
          warningThreshold={currentDev.warningResistance}
          criticalThreshold={currentDev.targetMaxResistance}
          currentValue={currentDev.currentResistance}
          deviceLabel={`${currentDev.id} · ${currentDev.pitLabel}`}
        />
      </section>

      {/* 4. THREE SUPPORTING PANELS: DEVICE HEALTH | ACTIVE ALERTS | SITE / LOCATION CONTEXT */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
        
        {/* PANEL 1: DEVICE HEALTH */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="font-semibold text-slate-900 tracking-tight flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-blue-700" />
                DEVICE HEALTH
              </h3>
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200 text-[11px]">
                ● ONLINE
              </span>
            </div>

            <div className="space-y-2.5 text-slate-600">
              <div className="flex justify-between items-center py-0.5">
                <span>Transducer Node:</span>
                <span className="font-mono font-semibold text-slate-900">{currentDev.id}</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span>Wi-Fi Signal:</span>
                <span className="font-medium text-slate-900">Connected ({currentDev.rssi_dBm} dBm)</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span>Cloud Uplink:</span>
                <span className="font-medium text-emerald-700">Firebase Firestore Real-Time</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span>Soil Temperature:</span>
                <span className="font-mono font-medium text-slate-900">{currentDev.soilTemperature_C}°C (PT100)</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span>Common Mode Stray:</span>
                <span className="font-mono font-medium text-slate-900">{currentDev.strayVoltage_V} V</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span>Battery / DC Bus:</span>
                <span className="font-mono font-medium text-slate-900">{currentDev.batteryVoltage_V} V (Mains)</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span>Firmware:</span>
                <span className="font-mono text-slate-500">{currentDev.firmwareVersion}</span>
              </div>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => onNavigateToTab('devices')}
              className="text-blue-700 hover:text-blue-800 font-semibold flex items-center gap-1 transition-colors"
            >
              <span>Manage Transducer Fleet</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* PANEL 2: ACTIVE ALERTS */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="font-semibold text-slate-900 tracking-tight flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                ACTIVE ALERTS
              </h3>
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded font-semibold ${
                isCritical 
                  ? 'bg-red-50 text-red-700 border border-red-200' 
                  : isWarning 
                  ? 'bg-amber-50 text-amber-800 border border-amber-200' 
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {isCritical || isWarning ? 'ACTION REQUIRED' : 'NORMAL'}
              </span>
            </div>

            {isCritical || isWarning ? (
              <div className={`p-3.5 rounded-lg border space-y-2 ${
                isCritical 
                  ? 'bg-red-50/50 border-red-200 text-red-900' 
                  : 'bg-amber-50/50 border-amber-200 text-amber-900'
              }`}>
                <div className="font-semibold text-xs">
                  {isCritical 
                    ? 'Earth resistance exceeds statutory safety limit' 
                    : 'Earth resistance above warning threshold'}
                </div>
                <div className="space-y-1 text-[11px] font-mono">
                  <div>Measured: <strong className="font-bold">{currentDev.currentResistance.toFixed(2)} Ω</strong></div>
                  <div>Warning Limit: {currentDev.warningResistance} Ω | Trip: {currentDev.targetMaxResistance} Ω</div>
                  <div>Device: {currentDev.id} ({currentDev.pitLabel})</div>
                  <div>Time: {lastUpdateTime}</div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 text-center space-y-2 my-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                <div className="font-semibold text-slate-900">All Systems Compliant</div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Earth resistance is well within statutory safety thresholds under {activeSite.defaultStandard}.
                </p>
              </div>
            )}
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => onNavigateToTab('alerts')}
              className="text-blue-700 hover:text-blue-800 font-semibold flex items-center gap-1 transition-colors"
            >
              <span>View Alarm Incident Log</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* PANEL 3: SITE / LOCATION CONTEXT */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="font-semibold text-slate-900 tracking-tight flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-blue-700" />
                SITE & LOCATION CONTEXT
              </h3>
              <span className="text-[11px] text-slate-500 font-mono">
                {activeSite.code}
              </span>
            </div>

            <div className="space-y-2.5 text-slate-600">
              <div className="flex justify-between items-start py-0.5">
                <span className="font-medium text-slate-500">Site:</span>
                <span className="font-semibold text-slate-900 text-right">{activeSite.name}</span>
              </div>
              <div className="flex justify-between items-start py-0.5">
                <span className="font-medium text-slate-500">Location:</span>
                <span className="font-medium text-slate-800 text-right">{activeSite.location}</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="font-medium text-slate-500">Earth System:</span>
                <span className="font-medium text-slate-800">{currentDev.electrodeType.replace(/_/g, ' ')}</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="font-medium text-slate-500">Monitoring Point:</span>
                <span className="font-semibold text-blue-700">{currentDev.pitLabel}</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="font-medium text-slate-500">Device Hardware:</span>
                <span className="font-mono text-slate-800">{currentDev.id}</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="font-medium text-slate-500">Subsoil Profile:</span>
                <span className="font-medium text-slate-800">{activeSite.soilType.replace(/_/g, ' ')}</span>
              </div>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => onNavigateToTab('sites')}
              className="text-blue-700 hover:text-blue-800 font-semibold flex items-center gap-1 transition-colors"
            >
              <span>Facility Grid Topology</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </section>

    </div>
  );
};
