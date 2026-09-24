import React from 'react';
import { ESP32Device } from '../../types';
import { Layers, Shield } from 'lucide-react';

interface ElectrodePitCardProps {
  device: ESP32Device;
}

export const ElectrodePitCard: React.FC<ElectrodePitCardProps> = ({ device }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-blue-700" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
              Electrode & Ground Pit Cross-Section
            </h3>
          </div>
          <span className="text-[11px] px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
            {device.electrodeType.replace(/_/g, ' ')}
          </span>
        </div>

        {/* Cross Section Schematic Diagram */}
        <div className="relative h-44 w-full bg-slate-50 rounded-lg border border-slate-200 p-3 overflow-hidden flex flex-col justify-between">
          
          {/* Surface & Inspection Pit Chamber */}
          <div className="relative z-10">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
              <div className="flex items-center space-x-1.5 text-[11px] text-slate-600 font-medium">
                <span className="w-2 h-2 bg-amber-600 rounded-xs"></span>
                <span>Surface Inspection Chamber (GL 0.0m)</span>
              </div>
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                DISCONNECT LINK CLOSED
              </span>
            </div>
          </div>

          {/* Graphical Subsoil Strata */}
          <div className="relative flex-1 my-2 flex items-center justify-center">
            {/* Strata layers background */}
            <div className="absolute inset-0 flex flex-col opacity-40">
              <div className="h-1/3 bg-amber-100/40 border-b border-dashed border-amber-300"></div>
              <div className="h-1/3 bg-yellow-100/30 border-b border-dashed border-amber-300"></div>
              <div className="h-1/3 bg-slate-100"></div>
            </div>

            {/* Earth Rod / Chemical Pipe Electrode Graphic */}
            <div className="relative flex flex-col items-center z-10">
              {/* Test Lead Sensor Connections */}
              <div className="flex space-x-2 mb-1.5 text-[10px] font-mono">
                <span className="px-1.5 py-0.2 bg-red-100 text-red-800 border border-red-200 rounded font-medium">C1 Current</span>
                <span className="px-1.5 py-0.2 bg-blue-100 text-blue-800 border border-blue-200 rounded font-medium">P1 Voltage</span>
                <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded font-medium">P2/C2 Ref</span>
              </div>

              {/* Chemical Backfill Compound Jacket */}
              <div className="w-12 h-20 bg-blue-50/80 border-x-2 border-dashed border-blue-400 flex items-center justify-center relative shadow-xs">
                {/* Copper Electrode core */}
                <div className="w-2.5 h-full bg-amber-500 rounded-xs shadow-xs"></div>
                <div className="absolute right-[-76px] top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200 whitespace-nowrap shadow-2xs font-medium">
                  Depth: {device.electrodeDepth_m}m
                </div>
              </div>
            </div>
          </div>

          {/* Subsoil Water Table / Resistivity Base */}
          <div className="relative z-10 pt-1.5 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-600 font-medium">
            <span>Bentonite / Marconite Backfill</span>
            <span className="text-blue-700 font-semibold">Moisture Retention: Optimal</span>
          </div>

        </div>
      </div>

      {/* Pit Details Grid */}
      <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-100 text-xs">
        <div className="bg-slate-50 p-2.5 rounded border border-slate-200/70">
          <span className="text-[10px] text-slate-500 block font-medium">Measurement Method</span>
          <span className="text-slate-900 font-semibold mt-0.5 block">{device.testMethod.replace(/_/g, ' ')}</span>
        </div>
        <div className="bg-slate-50 p-2.5 rounded border border-slate-200/70">
          <span className="text-[10px] text-slate-500 block font-medium">Next Calibration Due</span>
          <span className="text-amber-800 font-semibold font-mono mt-0.5 block">{device.nextCalibrationDue.split('T')[0]}</span>
        </div>
      </div>
    </div>
  );
};
