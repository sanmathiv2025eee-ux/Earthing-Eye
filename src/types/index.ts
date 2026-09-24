export type ComplianceStandard = 'IEEE_80' | 'IS_3043' | 'IEC_62305' | 'NFPA_780' | 'NEC_250';

export type ComplianceStatus = 'COMPLIANT' | 'WARNING' | 'CRITICAL_HIGH' | 'OPEN_CIRCUIT' | 'PROBE_FAULT';

export type UserRole = 
  | 'CHIEF_ELECTRICAL_INSPECTOR'
  | 'SITE_RELIABILITY_ENGINEER'
  | 'FIELD_MAINTENANCE_TECH'
  | 'COMPLIANCE_AUDITOR';

export type ElectrodeType = 
  | 'CHEMICAL_PIPE'
  | 'COPPER_BONDED_ROD'
  | 'COPPER_PLATE_600'
  | 'ROD_ARRAY_DELTA'
  | 'GALVANIZED_STRIP'
  | 'MARCONITE_BACKFILL_PIT';

export type SoilType = 
  | 'MOIST_LOAM'
  | 'CLAY_RICH'
  | 'SANDY_LOAM'
  | 'ROCKY_GRANITE'
  | 'MARSHY_SALINE'
  | 'DRY_SAND';

export type AlarmSeverity = 'CRITICAL' | 'HIGH' | 'WARNING' | 'INFO';

export type AlarmStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';

export interface IndustrialSite {
  id: string;
  name: string;
  code: string;
  category: 'SUBSTATION' | 'DATA_CENTER' | 'SOLAR_PARK' | 'REFINERY' | 'TELECOM_TOWER' | 'HOSPITAL';
  location: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  soilType: SoilType;
  defaultStandard: ComplianceStandard;
  maxResistanceLimit: number; // Ω
  warningThreshold: number; // Ω
  totalPits: number;
  engineerInCharge: string;
  contactEmail: string;
  createdAt: string;
  updatedAt: string;
}

export interface ESP32Device {
  id: string; // e.g. "EG-ESP32-SUB01-P1"
  siteId: string;
  siteName: string;
  pitLabel: string; // e.g. "Pit #04 - Transformer Neutral"
  serialNumber: string;
  macAddress: string;
  firmwareVersion: string;
  hardwareRevision: string;
  electrodeType: ElectrodeType;
  electrodeDepth_m: number;
  testMethod: 'WENNER_4_WIRE' | 'FALL_OF_POTENTIAL_3P' | 'STAKELESS_CLAMP';
  telemetryIntervalSec: number;
  
  // Current Live State (supplied by ESP32)
  currentResistance: number; // in Ohms (Ω)
  previousResistance?: number;
  complianceStatus: ComplianceStatus;
  
  // Diagnostic Telemetry
  soilTemperature_C: number;
  strayVoltage_V: number;
  testCurrent_mA: number;
  batteryVoltage_V: number;
  powerSource: 'MAINS_BACKUP' | 'SOLAR_DC' | 'INTERNAL_LIFEPO4';
  rssi_dBm: number;
  probeContinuity: 'OK' | 'FAULT_C1' | 'FAULT_P1' | 'FAULT_P2' | 'HIGH_NOISE';
  internalTemp_C: number;
  lastReadingAt: string;
  onlineStatus: 'ONLINE' | 'OFFLINE' | 'DEGRADED';
  
  // Calibration & Safety
  lastCalibratedAt: string;
  nextCalibrationDue: string;
  targetMaxResistance: number; // custom limit for this specific pit
  warningResistance: number;
  commissionedBy: string;
  commissionedAt: string;
  notes?: string;
}

export interface TelemetryReading {
  id: string;
  deviceId: string;
  siteId: string;
  timestamp: string;
  earthResistance: number; // in Ohms (Ω) - Primary measured value from ESP32
  soilTemperature_C: number;
  strayVoltage_V: number;
  testCurrent_mA: number;
  batteryVoltage_V: number;
  rssi_dBm: number;
  probeContinuity: 'OK' | 'FAULT_C1' | 'FAULT_P1' | 'FAULT_P2' | 'HIGH_NOISE';
  complianceStatus: ComplianceStatus;
  source: 'ESP32_AUTOMATED' | 'MANUAL_VERIFICATION' | 'FIELD_SIMULATOR';
}

export interface SystemAlarm {
  id: string;
  deviceId: string;
  deviceLabel: string;
  siteId: string;
  siteName: string;
  severity: AlarmSeverity;
  status: AlarmStatus;
  code: 'HIGH_RESISTANCE' | 'CRITICAL_TRIP' | 'RAPID_DEGRADATION' | 'OPEN_CIRCUIT' | 'STRAY_VOLTAGE_SURGE' | 'LOW_BATTERY' | 'PROBE_FAILURE' | 'DEVICE_OFFLINE';
  message: string;
  measuredValue: number;
  thresholdValue: number;
  unit: string;
  triggeredAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  ackNotes?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionAction?: string;
}

export interface StandardThresholdProfile {
  id: string;
  standard: ComplianceStandard;
  title: string;
  description: string;
  industryScope: string;
  recommendedLimit_Ohms: number;
  warningLimit_Ohms: number;
  touchPotentialLimit_V: number;
  stepPotentialLimit_V: number;
  mandatoryTestFrequencyMonths: number;
  codeReference: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: 'DEVICE_COMMISSIONED' | 'CALIBRATION_PERFORMED' | 'THRESHOLD_UPDATED' | 'ALARM_ACKNOWLEDGED' | 'ALARM_RESOLVED' | 'MAINTENANCE_LOGGED' | 'COMPLIANCE_AUDIT_EXPORTED';
  actorName: string;
  actorRole: UserRole;
  actorEmail: string;
  siteId?: string;
  deviceId?: string;
  details: string;
  sha256VerificationHash: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  licenseNumber: string;
  organization: string;
  certifiedStandards: ComplianceStandard[];
}
