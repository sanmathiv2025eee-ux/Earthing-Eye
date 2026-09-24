import { ComplianceStandard, StandardThresholdProfile, ComplianceStatus } from '../types';

export const COMPLIANCE_PROFILES: Record<ComplianceStandard, StandardThresholdProfile> = {
  IEEE_80: {
    id: 'profile-ieee-80',
    standard: 'IEEE_80',
    title: 'IEEE Std 80-2013 / Substation Grounding',
    description: 'Guide for Safety in AC Substation Grounding. Designed to limit step and touch potentials under worst-case grid fault currents.',
    industryScope: 'Electrical Grid Substations (33kV to 765kV), Switchyards & Generating Stations',
    recommendedLimit_Ohms: 1.0,
    warningLimit_Ohms: 0.8,
    touchPotentialLimit_V: 68.0,
    stepPotentialLimit_V: 240.0,
    mandatoryTestFrequencyMonths: 3,
    codeReference: 'IEEE Std 80 Clause 14 & 16 (Soil Resistivity & Tolerable Potentials)'
  },
  IS_3043: {
    id: 'profile-is-3043',
    standard: 'IS_3043',
    title: 'IS 3043:2018 (Bureau of Indian Standards)',
    description: 'Code of Practice for Earthing. Outlines system earthing and equipment bonding requirements for low, medium, and high voltage installations.',
    industryScope: 'Heavy Industrial Facilities, Manufacturing Plants, Chemical Refineries',
    recommendedLimit_Ohms: 2.0,
    warningLimit_Ohms: 1.5,
    touchPotentialLimit_V: 50.0,
    stepPotentialLimit_V: 150.0,
    mandatoryTestFrequencyMonths: 6,
    codeReference: 'IS 3043:2018 Section 3 - Design Considerations'
  },
  IEC_62305: {
    id: 'profile-iec-62305',
    standard: 'IEC_62305',
    title: 'IEC 62305-3:2010 / Lightning Protection',
    description: 'Protection against lightning - Physical damage to structures and life hazard. Requires low impedance ground termination to disperse high frequency transients.',
    industryScope: 'Lightning Rod Downconductors, Telecommunication Towers, Rooftop Solar Arrays',
    recommendedLimit_Ohms: 10.0,
    warningLimit_Ohms: 8.0,
    touchPotentialLimit_V: 100.0,
    stepPotentialLimit_V: 300.0,
    mandatoryTestFrequencyMonths: 12,
    codeReference: 'IEC 62305-3 Section E.5 - Earth Termination System'
  },
  NFPA_780: {
    id: 'profile-nfpa-780',
    standard: 'NFPA_780',
    title: 'NFPA 780 & NFPA 70E (Electrical Safety)',
    description: 'Standard for the Installation of Lightning Protection Systems and Workplace Electrical Safety.',
    industryScope: 'Flammable Storage Facilities, Explosive Hazards, Commercial High-rises',
    recommendedLimit_Ohms: 5.0,
    warningLimit_Ohms: 4.0,
    touchPotentialLimit_V: 50.0,
    stepPotentialLimit_V: 200.0,
    mandatoryTestFrequencyMonths: 6,
    codeReference: 'NFPA 780 Section 4.13 - Grounding Electrodes'
  },
  NEC_250: {
    id: 'profile-nec-250',
    standard: 'NEC_250',
    title: 'NEC Article 250 (NFPA 70)',
    description: 'National Electrical Code - Grounding and Bonding for general electrical distribution and equipment safety.',
    industryScope: 'Data Centers (Clean Isolated Ground), Commercial Buildings, Healthcare Facilities',
    recommendedLimit_Ohms: 1.0,
    warningLimit_Ohms: 0.8,
    touchPotentialLimit_V: 50.0,
    stepPotentialLimit_V: 100.0,
    mandatoryTestFrequencyMonths: 12,
    codeReference: 'NEC Article 250.56 - Resistance of Rod, Pipe, and Plate Electrodes'
  }
};

/**
 * Evaluates compliance status of an earth resistance value measured by ESP32
 */
export function evaluateCompliance(
  earthResistance: number,
  standard: ComplianceStandard = 'IEEE_80',
  customLimit?: number,
  customWarning?: number
): {
  status: ComplianceStatus;
  percentageOfLimit: number;
  label: string;
  badgeClass: string;
  isCompliant: boolean;
} {
  // If open circuit or wire snapped
  if (earthResistance >= 999 || earthResistance < 0) {
    return {
      status: 'OPEN_CIRCUIT',
      percentageOfLimit: 999,
      label: 'Open Circuit / Disconnected',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 font-medium',
      isCompliant: false
    };
  }

  const profile = COMPLIANCE_PROFILES[standard] || COMPLIANCE_PROFILES.IEEE_80;
  const maxLimit = customLimit ?? profile.recommendedLimit_Ohms;
  const warningLimit = customWarning ?? profile.warningLimit_Ohms;

  const percentage = Math.round((earthResistance / maxLimit) * 100);

  if (earthResistance > maxLimit) {
    return {
      status: 'CRITICAL_HIGH',
      percentageOfLimit: percentage,
      label: `CRITICAL (> ${maxLimit}Ω)`,
      badgeClass: 'bg-red-50 text-red-700 border-red-200 font-semibold',
      isCompliant: false
    };
  }

  if (earthResistance >= warningLimit) {
    return {
      status: 'WARNING',
      percentageOfLimit: percentage,
      label: `WARNING (${earthResistance}Ω)`,
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200 font-semibold',
      isCompliant: true
    };
  }

  return {
    status: 'COMPLIANT',
    percentageOfLimit: percentage,
    label: 'NORMAL',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold',
    isCompliant: true
  };
}

/**
 * Calculates theoretical Ground Potential Rise (GPR) and estimated Touch & Step potentials
 * based on IEEE 80 formulations for a given fault current scenario.
 */
export function calculateSafetyPotentials(
  earthResistance: number,
  faultCurrent_kA: number = 5.0, // typical substation fault current
  faultDuration_s: number = 0.5,
  surfaceResistivity_ohm_m: number = 3000 // crushed rock surface layer
) {
  const faultCurrent_A = faultCurrent_kA * 1000;
  const gpr_Volts = faultCurrent_A * earthResistance;

  // IEEE 80 simplified 50kg person threshold
  const cs = 1 - (0.09 * (1 - 100 / surfaceResistivity_ohm_m)) / (2 * 0.1 + 0.09);
  const touchLimit_V = (1000 + 1.5 * cs * surfaceResistivity_ohm_m) * (0.116 / Math.sqrt(faultDuration_s));
  const stepLimit_V = (1000 + 6.0 * cs * surfaceResistivity_ohm_m) * (0.116 / Math.sqrt(faultDuration_s));

  // Risk factor: higher resistance elevates mesh potential
  const estimatedMeshPotential_V = gpr_Volts * 0.18; // approx 18% mesh potential coefficient
  const estimatedStepPotential_V = gpr_Volts * 0.09; // approx 9% step potential coefficient

  const touchSafetyMargin = touchLimit_V - estimatedMeshPotential_V;
  const stepSafetyMargin = stepLimit_V - estimatedStepPotential_V;

  return {
    gpr_Volts: Math.round(gpr_Volts),
    touchLimit_V: Math.round(touchLimit_V),
    stepLimit_V: Math.round(stepLimit_V),
    estimatedMeshPotential_V: Math.round(estimatedMeshPotential_V),
    estimatedStepPotential_V: Math.round(estimatedStepPotential_V),
    touchSafetyMargin: Math.round(touchSafetyMargin),
    stepSafetyMargin: Math.round(stepSafetyMargin),
    isTouchSafe: touchSafetyMargin > 0,
    isStepSafe: stepSafetyMargin > 0,
    riskRating: earthResistance < 1.0 ? 'LOW_RISK' : earthResistance < 3.0 ? 'MODERATE_RISK' : 'HIGH_HAZARD'
  };
}
