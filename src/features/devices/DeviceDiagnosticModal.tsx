import React, { useState } from 'react';
import { ESP32Device } from '../../types';
import { 
  Wrench, 
  X, 
  CheckCircle2, 
  Sliders, 
  Wifi, 
  Battery, 
  Thermometer, 
  Activity, 
  Save, 
  RefreshCw 
} from 'lucide-react';

interface DeviceDiagnosticModalProps {
  device: ESP32Device;
  onClose: () => void;
  onCalibrate: (deviceId: string, zeroOffset: number) => void;
}

export const DeviceDiagnosticModal: React.FC<DeviceDiagnosticModalProps> = ({
  device,
  onClose,
  onCalibrate
}) => {
  const [leadOffset, setLeadOffset] = useState<number>(0.025);
  const [adcFilterWeight, setAdcFilterWeight] = useState<number>(8);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibratedSuccess, setCalibratedSuccess] = useState(false);

  const handleRunZeroCalibration = () => {
    setIsCalibrating(true);
    setTimeout(() => {
      setIsCalibrating(false);
      setCalibratedSuccess(true);
      onCalibrate(device.id, leadOffset);
      setTimeout(() => setCalibratedSuccess(false), 2500);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-xl max-w-xl w-full p-6 shadow-xl text-xs">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center space-x-2">
            <Wrench className="w-5 h-5 text-blue-700" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Transducer Diagnostics & Lead Calibration
              </h3>
              <p className="text-[11px] text-slate-500">
                {device.id} · MAC {device.macAddress}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hardware Status Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5 font-mono">
          <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
            <span className="text-[10px] text-slate-500 font-sans block">ADC Sampling</span>
            <span className="text-slate-900 font-bold block mt-0.5">128 Hz AC</span>
            <span className="text-[9px] text-slate-400 font-sans">Wenner method</span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
            <span className="text-[10px] text-slate-500 font-sans block">Test Current</span>
            <span className="text-slate-900 font-bold block mt-0.5">20.0 mA</span>
            <span className="text-[9px] text-slate-400 font-sans">Constant generator</span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
            <span className="text-[10px] text-slate-500 font-sans block">Battery Voltage</span>
            <span className="text-slate-900 font-bold block mt-0.5">{device.batteryVoltage_V} V</span>
            <span className="text-[9px] text-slate-400 font-sans">Mains float</span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
            <span className="text-[10px] text-slate-500 font-sans block">Internal Temp</span>
            <span className="text-slate-900 font-bold block mt-0.5">{device.internalTemp_C}°C</span>
            <span className="text-[9px] text-emerald-700 font-sans font-semibold">Nominal</span>
          </div>
        </div>

        {/* Lead Wire Zero Offset Calibration Form */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3 mb-5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-900 text-xs flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-blue-700" />
              Lead Wire Zero Offset ($\Omega_{null}$)
            </span>
            <span className="font-mono text-blue-700 font-bold">{leadOffset.toFixed(3)} Ω</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Eliminates test lead contact resistance when short-circuiting C1-P1 and C2-P2 before installation.
          </p>
          <input
            type="range"
            min="0.000"
            max="0.100"
            step="0.005"
            value={leadOffset}
            onChange={(e) => setLeadOffset(Number(e.target.value))}
            className="w-full accent-blue-700 cursor-pointer"
          />
        </div>

        {/* Success Alert */}
        {calibratedSuccess && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 mb-4 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Zero-offset calibration stored into ESP32 non-volatile memory (NVS) successfully.</span>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
          >
            Close
          </button>

          <button
            type="button"
            onClick={handleRunZeroCalibration}
            disabled={isCalibrating}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-md bg-blue-700 hover:bg-blue-800 text-white font-semibold shadow-2xs transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isCalibrating ? 'animate-spin' : ''}`} />
            <span>{isCalibrating ? 'Nulling Leads...' : 'Store Zero Offset in Transducer'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
