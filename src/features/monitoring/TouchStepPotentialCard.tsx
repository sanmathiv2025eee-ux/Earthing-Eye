import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Zap } from 'lucide-react';
import { calculateSafetyPotentials } from '../../services/standards';

interface TouchStepPotentialCardProps {
  currentResistance: number;
  siteStandard: string;
}

export const TouchStepPotentialCard: React.FC<TouchStepPotentialCardProps> = ({
  currentResistance,
  siteStandard
}) => {
  const [faultCurrent_kA, setFaultCurrent_kA] = useState<number>(10.0);
  const [faultDuration_s, setFaultDuration_s] = useState<number>(0.5);
  const [surfaceType, setSurfaceType] = useState<number>(3000); // 3000 ohm-m for crushed granite rock

  const calculations = calculateSafetyPotentials(
    currentResistance,
    faultCurrent_kA,
    faultDuration_s,
    surfaceType
  );

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
        <div className="flex items-center space-x-2">
          <Zap className="w-4 h-4 text-blue-700" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
            IEEE 80 Touch & Step Potential Safety Analysis
          </h3>
        </div>
        <div>
          {calculations.isTouchSafe && calculations.isStepSafe ? (
            <span className="flex items-center space-x-1 text-[11px] px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>SAFETY CRITERIA MET</span>
            </span>
          ) : (
            <span className="flex items-center space-x-1 text-[11px] px-2.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 font-semibold">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>TOUCH HAZARD DETECTED</span>
            </span>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-500 mb-4">
        Evaluates human body shock hazards during a ground fault condition ($I_g$) based on IEEE Std 80-2013 formulas for a 50kg body weight.
      </p>

      {/* Inputs Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200/80 mb-4 text-xs">
        <div>
          <label className="text-[11px] font-medium text-slate-600 block mb-1">Grid Fault $I_f$ (kA)</label>
          <select
            value={faultCurrent_kA}
            onChange={(e) => setFaultCurrent_kA(Number(e.target.value))}
            className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
          >
            <option value="5">5.0 kA (33kV System)</option>
            <option value="10">10.0 kA (66kV System)</option>
            <option value="25">25.0 kA (132kV System)</option>
            <option value="40">40.0 kA (230kV System)</option>
          </select>
        </div>

        <div>
          <label className="text-[11px] font-medium text-slate-600 block mb-1">Clearing Time $t_s$ (s)</label>
          <select
            value={faultDuration_s}
            onChange={(e) => setFaultDuration_s(Number(e.target.value))}
            className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
          >
            <option value="0.2">0.20 s (Fast Breaker)</option>
            <option value="0.5">0.50 s (Standard Breaker)</option>
            <option value="1.0">1.00 s (Backup Relay)</option>
          </select>
        </div>

        <div>
          <label className="text-[11px] font-medium text-slate-600 block mb-1">Switchyard Surface ($\rho_s$)</label>
          <select
            value={surfaceType}
            onChange={(e) => setSurfaceType(Number(e.target.value))}
            className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
          >
            <option value="3000">3000 Ω·m (Crushed Rock)</option>
            <option value="1000">1000 Ω·m (Gravel Subbase)</option>
            <option value="200">200 Ω·m (Natural Soil)</option>
          </select>
        </div>
      </div>

      {/* Safety Calculations Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
          <span className="text-[10px] text-slate-500 font-sans block font-medium">Ground Potential Rise (GPR)</span>
          <span className="text-base font-bold text-slate-900 mt-1 block">
            {calculations.gpr_Volts.toLocaleString()} V
          </span>
          <span className="text-[10px] text-slate-500 font-sans">$I_f \times R_e$ ({currentResistance}Ω)</span>
        </div>

        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
          <span className="text-[10px] text-slate-500 font-sans block font-medium">Tolerable Touch Voltage</span>
          <span className="text-base font-bold text-slate-900 mt-1 block">
            {calculations.touchLimit_V} V
          </span>
          <span className="text-[10px] text-slate-500 font-sans">IEEE 80 50kg body</span>
        </div>

        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
          <span className="text-[10px] text-slate-500 font-sans block font-medium">Mesh Potential ($E_m$)</span>
          <span className={`text-base font-bold mt-1 block ${calculations.isTouchSafe ? 'text-emerald-700' : 'text-red-700'}`}>
            {calculations.estimatedMeshPotential_V} V
          </span>
          <span className="text-[10px] text-slate-500 font-sans">
            {calculations.isTouchSafe ? `Margin: +${calculations.touchSafetyMargin}V` : `Exceeded by: ${Math.abs(calculations.touchSafetyMargin)}V`}
          </span>
        </div>

        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
          <span className="text-[10px] text-slate-500 font-sans block font-medium">Tolerable Step Voltage</span>
          <span className="text-base font-bold text-slate-900 mt-1 block">
            {calculations.stepLimit_V} V
          </span>
          <span className="text-[10px] text-emerald-700 font-sans">
            Margin: +{calculations.stepSafetyMargin}V
          </span>
        </div>
      </div>
    </div>
  );
};
