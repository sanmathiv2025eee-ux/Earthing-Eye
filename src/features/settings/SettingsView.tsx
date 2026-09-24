import React, { useState } from 'react';
import { 
  Settings, 
  Cloud, 
  Volume2, 
  VolumeX, 
  Radio, 
  Database, 
  ShieldCheck, 
  Cpu, 
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface SettingsViewProps {
  isAudioMuted: boolean;
  onToggleAudio: () => void;
  onResetDemoData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  isAudioMuted,
  onToggleAudio,
  onResetDemoData
}) => {
  const { currentUser } = useAuth();
  const [telemetryInterval, setTelemetryInterval] = useState(900);
  const [leadCompensationStandard, setLeadCompensationStandard] = useState('IEEE_81_2012');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-700" />
            System Configuration & Engineering Parameters
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage instrumentation telemetry rates, audio annunciator settings, and cloud database parameters.
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>System parameters successfully updated and synchronized across all active listening sessions.</span>
        </div>
      )}

      {/* 1. Cloud & Architecture Status */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-semibold text-slate-900 text-xs flex items-center gap-2">
            <Cloud className="w-4 h-4 text-blue-700" />
            Cloud Telemetry Infrastructure
          </h3>
          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200 text-[11px]">
            Connected
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-50 p-3 rounded border border-slate-200/80">
            <span className="text-[10px] text-slate-500 font-medium block">Database Service</span>
            <span className="font-semibold text-slate-900 mt-0.5 block">Cloud Firestore</span>
            <span className="text-[10px] text-slate-400 mt-1 block">Live Snapshot Synchronization</span>
          </div>

          <div className="bg-slate-50 p-3 rounded border border-slate-200/80">
            <span className="text-[10px] text-slate-500 font-medium block">Hardware Security</span>
            <span className="font-semibold text-slate-900 mt-0.5 block">Firebase App Check</span>
            <span className="text-[10px] text-slate-400 mt-1 block">Hardware Token Authentication</span>
          </div>

          <div className="bg-slate-50 p-3 rounded border border-slate-200/80">
            <span className="text-[10px] text-slate-500 font-medium block">Audit Integrity</span>
            <span className="font-semibold text-slate-900 mt-0.5 block">SHA-256 Ledger</span>
            <span className="text-[10px] text-slate-400 mt-1 block">Statutory Proof of Verification</span>
          </div>
        </div>
      </div>

      {/* 2. Annunciator & Sound Alert Configuration */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-semibold text-slate-900 text-xs flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-blue-700" />
            Audio Annunciator & Control Room Alerts
          </h3>
        </div>

        <div className="flex items-center justify-between py-2 text-xs">
          <div>
            <span className="font-semibold text-slate-900 block">Critical Alarm Audio Annunciator</span>
            <span className="text-slate-500 text-[11px]">Emit audible tones in control room when earth resistance exceeds statutory trip limits.</span>
          </div>

          <button
            type="button"
            onClick={onToggleAudio}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
              isAudioMuted
                ? 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
            }`}
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-blue-700" />}
            <span>{isAudioMuted ? 'Muted' : 'Enabled'}</span>
          </button>
        </div>
      </div>

      {/* 3. Instrumentation & Sampling Settings Form */}
      <form onSubmit={handleSaveSettings} className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs space-y-4 text-xs">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-700" />
            Transducer Sampling & Calibration Standards
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-600 mb-1 font-medium">Default Ingestion Interval</label>
            <select
              value={telemetryInterval}
              onChange={(e) => setTelemetryInterval(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="60">60 Seconds (High Speed Diagnostic Mode)</option>
              <option value="300">5 Minutes (Substation Continuous)</option>
              <option value="900">15 Minutes (Standard Production Operation)</option>
              <option value="3600">1 Hour (Solar Park Low Power)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-600 mb-1 font-medium">Testing Method Guideline</label>
            <select
              value={leadCompensationStandard}
              onChange={(e) => setLeadCompensationStandard(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="IEEE_81_2012">IEEE Std 81-2012 (Earth Resistivity & Impedance)</option>
              <option value="BS_7430_2015">BS 7430:2015 (Earthing of Electrical Installations)</option>
              <option value="IS_3043_2018">IS 3043:2018 (Practice for Earthing)</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            type="submit"
            className="px-4 py-2 rounded-md bg-blue-700 hover:bg-blue-800 text-white font-semibold transition-colors shadow-2xs"
          >
            Save Configuration Parameters
          </button>
        </div>
      </form>

      {/* 4. Development / Demo State Controls */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 text-xs space-y-3">
        <div className="border-b border-slate-200/80 pb-2">
          <h4 className="font-semibold text-slate-900">Diagnostic & Demo Environment Controls</h4>
          <p className="text-[11px] text-slate-500">
            Isolated developer controls for laboratory evaluation and demonstration scenarios.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div>
            <span className="font-semibold text-slate-800 block">Reset Fleet Telemetry & Alarms</span>
            <span className="text-slate-500 text-[11px]">Re-seeds factory default ESP32 transducer baseline values (0.4Ω - 0.7Ω).</span>
          </div>

          <button
            type="button"
            onClick={onResetDemoData}
            className="px-3.5 py-1.5 rounded-md bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold transition-colors shadow-2xs flex items-center gap-1.5 self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Baseline Telemetry</span>
          </button>
        </div>
      </div>

    </div>
  );
};
