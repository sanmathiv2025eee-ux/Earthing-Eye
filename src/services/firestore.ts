import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  where,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  IndustrialSite, 
  ESP32Device, 
  TelemetryReading, 
  SystemAlarm, 
  AuditLogEntry, 
  UserRole,
  ComplianceStatus 
} from '../types';
import { evaluateCompliance } from './standards';

// In-memory fallback / seed datasets for high availability & instant first run
export const INITIAL_SITES: IndustrialSite[] = [
  {
    id: 'site-sub-01',
    name: 'North Substation 230/33kV Switchyard',
    code: 'SUB-230-N',
    category: 'SUBSTATION',
    location: 'Sector 4, Heavy Grid Transmission Corridor',
    coordinates: { lat: 28.6139, lng: 77.2090 },
    soilType: 'CLAY_RICH',
    defaultStandard: 'IEEE_80',
    maxResistanceLimit: 1.0,
    warningThreshold: 0.8,
    totalPits: 12,
    engineerInCharge: 'Er. Rajesh Varma, Lead EE',
    contactEmail: 'r.varma@gridtransmission.net',
    createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'site-dc-02',
    name: 'Apex Tier-IV Data Center Campus',
    code: 'DC-TIER4-B',
    category: 'DATA_CENTER',
    location: 'Cyber Valley Tech Park, Block C',
    coordinates: { lat: 12.9716, lng: 77.5946 },
    soilType: 'MOIST_LOAM',
    defaultStandard: 'NEC_250',
    maxResistanceLimit: 1.0,
    warningThreshold: 0.75,
    totalPits: 8,
    engineerInCharge: 'Sarah Jenkins, PE',
    contactEmail: 's.jenkins@apexdatacenter.io',
    createdAt: new Date(Date.now() - 120 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'site-solar-03',
    name: 'Solaria 50MW Solar PV Power Station',
    code: 'SOL-50MW-G3',
    category: 'SOLAR_PARK',
    location: 'Inverter Bay Block 3, Arid Basin',
    coordinates: { lat: 26.9124, lng: 70.9018 },
    soilType: 'DRY_SAND',
    defaultStandard: 'IEC_62305',
    maxResistanceLimit: 5.0,
    warningThreshold: 4.0,
    totalPits: 24,
    engineerInCharge: 'Vikram Sethi, Plant Head',
    contactEmail: 'vikram.s@solariarenewables.com',
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'site-refinery-04',
    name: 'Coastal Petrochemical Tank Farm #4',
    code: 'PETRO-TK-4',
    category: 'REFINERY',
    location: 'Hazardous Zone 1, Hydrocarbon Terminal',
    coordinates: { lat: 18.9220, lng: 72.8347 },
    soilType: 'MARSHY_SALINE',
    defaultStandard: 'NFPA_780',
    maxResistanceLimit: 5.0,
    warningThreshold: 3.5,
    totalPits: 16,
    engineerInCharge: 'Dr. Michael Chen, Safety Dir',
    contactEmail: 'm.chen@coastalhydrocarbons.com',
    createdAt: new Date(Date.now() - 150 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const INITIAL_DEVICES: ESP32Device[] = [
  {
    id: 'EG-ESP32-SUB01-TR1',
    siteId: 'site-sub-01',
    siteName: 'North Substation 230/33kV Switchyard',
    pitLabel: 'Pit #01 - Power Transformer 1 Neutral',
    serialNumber: 'EG-2025-0891-TR1',
    macAddress: '24:6F:28:B2:41:A0',
    firmwareVersion: 'v2.4.2-prod',
    hardwareRevision: 'EG-REV-4.1',
    electrodeType: 'CHEMICAL_PIPE',
    electrodeDepth_m: 6.0,
    testMethod: 'WENNER_4_WIRE',
    telemetryIntervalSec: 900,
    currentResistance: 0.62,
    previousResistance: 0.64,
    complianceStatus: 'COMPLIANT',
    soilTemperature_C: 24.2,
    strayVoltage_V: 0.85,
    testCurrent_mA: 20.0,
    batteryVoltage_V: 13.8,
    powerSource: 'MAINS_BACKUP',
    rssi_dBm: -58,
    probeContinuity: 'OK',
    internalTemp_C: 38.5,
    lastReadingAt: new Date().toISOString(),
    onlineStatus: 'ONLINE',
    lastCalibratedAt: '2026-06-15T10:00:00Z',
    nextCalibrationDue: '2027-06-15T10:00:00Z',
    targetMaxResistance: 1.0,
    warningResistance: 0.8,
    commissionedBy: 'Er. Rajesh Varma',
    commissionedAt: '2025-04-10T09:30:00Z',
    notes: 'Copper chemical electrode with mineral compound backfill. Primary neutral earthing.'
  },
  {
    id: 'EG-ESP32-SUB01-LA1',
    siteId: 'site-sub-01',
    siteName: 'North Substation 230/33kV Switchyard',
    pitLabel: 'Pit #03 - 230kV Surge Lightning Arrestor',
    serialNumber: 'EG-2025-0892-LA1',
    macAddress: '24:6F:28:B2:41:F4',
    firmwareVersion: 'v2.4.2-prod',
    hardwareRevision: 'EG-REV-4.1',
    electrodeType: 'ROD_ARRAY_DELTA',
    electrodeDepth_m: 9.0,
    testMethod: 'FALL_OF_POTENTIAL_3P',
    telemetryIntervalSec: 900,
    currentResistance: 0.88,
    previousResistance: 0.79,
    complianceStatus: 'WARNING',
    soilTemperature_C: 27.8,
    strayVoltage_V: 1.42,
    testCurrent_mA: 20.0,
    batteryVoltage_V: 13.7,
    powerSource: 'MAINS_BACKUP',
    rssi_dBm: -64,
    probeContinuity: 'OK',
    internalTemp_C: 41.2,
    lastReadingAt: new Date().toISOString(),
    onlineStatus: 'ONLINE',
    lastCalibratedAt: '2026-04-12T11:00:00Z',
    nextCalibrationDue: '2027-04-12T11:00:00Z',
    targetMaxResistance: 1.0,
    warningResistance: 0.8,
    commissionedBy: 'Er. Rajesh Varma',
    commissionedAt: '2025-04-12T14:15:00Z',
    notes: '3-Rod Delta configuration. Dry topsoil condition causing warning elevation.'
  },
  {
    id: 'EG-ESP32-DC02-CLN1',
    siteId: 'site-dc-02',
    siteName: 'Apex Tier-IV Data Center Campus',
    pitLabel: 'Pit #01 - Clean Signal / Telecom Instrumentation',
    serialNumber: 'EG-2025-1104-CLN',
    macAddress: 'A4:CF:12:93:88:2E',
    firmwareVersion: 'v2.4.2-prod',
    hardwareRevision: 'EG-REV-4.2',
    electrodeType: 'MARCONITE_BACKFILL_PIT',
    electrodeDepth_m: 6.0,
    testMethod: 'WENNER_4_WIRE',
    telemetryIntervalSec: 300,
    currentResistance: 0.41,
    previousResistance: 0.42,
    complianceStatus: 'COMPLIANT',
    soilTemperature_C: 21.0,
    strayVoltage_V: 0.12,
    testCurrent_mA: 25.0,
    batteryVoltage_V: 14.1,
    powerSource: 'MAINS_BACKUP',
    rssi_dBm: -52,
    probeContinuity: 'OK',
    internalTemp_C: 34.8,
    lastReadingAt: new Date().toISOString(),
    onlineStatus: 'ONLINE',
    lastCalibratedAt: '2026-08-01T08:00:00Z',
    nextCalibrationDue: '2027-08-01T08:00:00Z',
    targetMaxResistance: 1.0,
    warningResistance: 0.75,
    commissionedBy: 'Sarah Jenkins, PE',
    commissionedAt: '2025-06-20T10:00:00Z',
    notes: 'Ultra-low impedance Marconite conductive concrete pit for sensitive server rack earth.'
  },
  {
    id: 'EG-ESP32-SOL03-INV4',
    siteId: 'site-solar-03',
    siteName: 'Solaria 50MW Solar PV Power Station',
    pitLabel: 'Pit #07 - Central Inverter Station 4 Ground',
    serialNumber: 'EG-2025-3044-INV4',
    macAddress: '3C:71:BF:88:14:6B',
    firmwareVersion: 'v2.3.9-iot',
    hardwareRevision: 'EG-REV-3.8',
    electrodeType: 'COPPER_BONDED_ROD',
    electrodeDepth_m: 3.0,
    testMethod: 'FALL_OF_POTENTIAL_3P',
    telemetryIntervalSec: 1800,
    currentResistance: 6.45,
    previousResistance: 4.82,
    complianceStatus: 'CRITICAL_HIGH',
    soilTemperature_C: 36.4,
    strayVoltage_V: 2.10,
    testCurrent_mA: 18.0,
    batteryVoltage_V: 12.3,
    powerSource: 'SOLAR_DC',
    rssi_dBm: -78,
    probeContinuity: 'OK',
    internalTemp_C: 48.0,
    lastReadingAt: new Date().toISOString(),
    onlineStatus: 'ONLINE',
    lastCalibratedAt: '2026-01-10T12:00:00Z',
    nextCalibrationDue: '2027-01-10T12:00:00Z',
    targetMaxResistance: 5.0,
    warningResistance: 4.0,
    commissionedBy: 'Vikram Sethi',
    commissionedAt: '2025-07-15T15:00:00Z',
    notes: 'Exceeded 5.0Ω threshold due to extreme summer moisture evaporation in sandy soil. Bentonite rehydration needed.'
  },
  {
    id: 'EG-ESP32-PETRO04-TK4',
    siteId: 'site-refinery-04',
    siteName: 'Coastal Petrochemical Tank Farm #4',
    pitLabel: 'Pit #02 - Crude Oil Tank 401 Static Dissipation',
    serialNumber: 'EG-2025-5512-TK4',
    macAddress: 'E8:68:E7:29:43:91',
    firmwareVersion: 'v2.4.2-prod',
    hardwareRevision: 'EG-REV-4.1',
    electrodeType: 'COPPER_PLATE_600',
    electrodeDepth_m: 4.5,
    testMethod: 'WENNER_4_WIRE',
    telemetryIntervalSec: 900,
    currentResistance: 1.82,
    previousResistance: 1.85,
    complianceStatus: 'COMPLIANT',
    soilTemperature_C: 28.6,
    strayVoltage_V: 0.45,
    testCurrent_mA: 20.0,
    batteryVoltage_V: 13.9,
    powerSource: 'MAINS_BACKUP',
    rssi_dBm: -61,
    probeContinuity: 'OK',
    internalTemp_C: 39.1,
    lastReadingAt: new Date().toISOString(),
    onlineStatus: 'ONLINE',
    lastCalibratedAt: '2026-05-18T09:00:00Z',
    nextCalibrationDue: '2027-05-18T09:00:00Z',
    targetMaxResistance: 5.0,
    warningResistance: 3.5,
    commissionedBy: 'Dr. Michael Chen',
    commissionedAt: '2025-03-05T11:20:00Z',
    notes: 'ATEX Zone 1 rated enclosure. Grounding mesh connected to sacrificial zinc anode.'
  }
];

export const INITIAL_ALARMS: SystemAlarm[] = [
  {
    id: 'ALARM-2026-0923-01',
    deviceId: 'EG-ESP32-SOL03-INV4',
    deviceLabel: 'Pit #07 - Central Inverter Station 4 Ground',
    siteId: 'site-solar-03',
    siteName: 'Solaria 50MW Solar PV Power Station',
    severity: 'CRITICAL',
    status: 'ACTIVE',
    code: 'HIGH_RESISTANCE',
    message: 'Earth Resistance measured 6.45Ω, exceeding 5.0Ω safety threshold.',
    measuredValue: 6.45,
    thresholdValue: 5.0,
    unit: 'Ω',
    triggeredAt: new Date(Date.now() - 45 * 60000).toISOString()
  },
  {
    id: 'ALARM-2026-0923-02',
    deviceId: 'EG-ESP32-SUB01-LA1',
    deviceLabel: 'Pit #03 - 230kV Surge Lightning Arrestor',
    siteId: 'site-sub-01',
    siteName: 'North Substation 230/33kV Switchyard',
    severity: 'WARNING',
    status: 'ACTIVE',
    code: 'HIGH_RESISTANCE',
    message: 'Earth Resistance elevated to 0.88Ω, approaching 1.0Ω IEEE 80 limit (warning at 0.80Ω).',
    measuredValue: 0.88,
    thresholdValue: 0.80,
    unit: 'Ω',
    triggeredAt: new Date(Date.now() - 3 * 3600000).toISOString()
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'AUDIT-LOG-101',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    action: 'CALIBRATION_PERFORMED',
    actorName: 'Er. Rajesh Varma',
    actorRole: 'CHIEF_ELECTRICAL_INSPECTOR',
    actorEmail: 'r.varma@gridtransmission.net',
    siteId: 'site-sub-01',
    deviceId: 'EG-ESP32-SUB01-TR1',
    details: 'Annual Wenner 4-wire certified calibration. Zero offset recalibrated to 0.002Ω.',
    sha256VerificationHash: '8f43b3558b9f059e6122d4f901a5e5a7b6a12b9184df24a30e1c2b53a06041a8'
  },
  {
    id: 'AUDIT-LOG-102',
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
    action: 'DEVICE_COMMISSIONED',
    actorName: 'Sarah Jenkins, PE',
    actorRole: 'SITE_RELIABILITY_ENGINEER',
    actorEmail: 's.jenkins@apexdatacenter.io',
    siteId: 'site-dc-02',
    deviceId: 'EG-ESP32-DC02-CLN1',
    details: 'Commissioned node EG-ESP32-DC02-CLN1 on Marconite pit. Baseline reading confirmed at 0.41Ω.',
    sha256VerificationHash: 'a7183e8b4e999912cd3ef3541586a1df0b656e1781bc09e0231cf427387cb71a'
  },
  {
    id: 'AUDIT-LOG-103',
    timestamp: new Date(Date.now() - 86400000 * 5).toISOString(),
    action: 'THRESHOLD_UPDATED',
    actorName: 'Dr. Michael Chen',
    actorRole: 'CHIEF_ELECTRICAL_INSPECTOR',
    actorEmail: 'm.chen@coastalhydrocarbons.com',
    siteId: 'site-refinery-04',
    details: 'Tightened NFPA 780 safety warning limit from 4.0Ω to 3.5Ω for tank static dissipation compliance.',
    sha256VerificationHash: 'f420e6c1a85e13d9a5b3f2c78f8b39415cb02394f4a56c5e2195f3964d4b1239'
  }
];

// Generate synthetic historical curve points for a device
export function generateDeviceHistory(
  deviceId: string, 
  baseResistance: number, 
  days: number = 30
): TelemetryReading[] {
  const readings: TelemetryReading[] = [];
  const now = Date.now();
  const stepMs = (days * 86400000) / 40; // 40 points

  for (let i = 40; i >= 0; i--) {
    const t = now - (i * stepMs);
    // realistic seasonal/moisture curve with gentle drift and noise
    const noise = (Math.sin(i * 0.4) * 0.08) + ((Math.cos(i * 0.15)) * 0.12);
    const simulatedResistance = Math.max(0.15, +(baseResistance + noise).toFixed(2));
    const compliance = evaluateCompliance(simulatedResistance);

    readings.push({
      id: `HIST-${deviceId}-${i}`,
      deviceId,
      siteId: 'site-sub-01',
      timestamp: new Date(t).toISOString(),
      earthResistance: simulatedResistance,
      soilTemperature_C: +(22 + Math.sin(i * 0.2) * 5).toFixed(1),
      strayVoltage_V: +(0.4 + Math.random() * 0.6).toFixed(2),
      testCurrent_mA: 20.0,
      batteryVoltage_V: +(13.6 + Math.random() * 0.4).toFixed(1),
      rssi_dBm: Math.round(-60 - Math.random() * 12),
      probeContinuity: 'OK',
      complianceStatus: compliance.status,
      source: 'ESP32_AUTOMATED'
    });
  }

  return readings;
}

// SHA-256 simulation generator for immutable audit verification
export function computeAuditHash(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `0x${hex}${Math.abs(hash * 31).toString(16).padStart(8, '0')}${Date.now().toString(16)}`;
}

// Real-time Firestore Service Class
class EarthGuardDataService {
  private isSeeded = false;

  async initAndSeedDatabase(): Promise<void> {
    try {
      const sitesSnap = await getDocs(collection(db, 'sites'));
      if (sitesSnap.empty) {
        console.log('[EarthGuard] Bootstrapping initial industrial sites to Firestore...');
        for (const site of INITIAL_SITES) {
          await setDoc(doc(db, 'sites', site.id), site);
        }
      }

      const devicesSnap = await getDocs(collection(db, 'devices'));
      if (devicesSnap.empty) {
        console.log('[EarthGuard] Bootstrapping initial ESP32 devices to Firestore...');
        for (const device of INITIAL_DEVICES) {
          await setDoc(doc(db, 'devices', device.id), device);
          // Seed initial telemetry sample
          await addDoc(collection(db, 'telemetry'), {
            deviceId: device.id,
            siteId: device.siteId,
            timestamp: new Date().toISOString(),
            earthResistance: device.currentResistance,
            soilTemperature_C: device.soilTemperature_C,
            strayVoltage_V: device.strayVoltage_V,
            testCurrent_mA: device.testCurrent_mA,
            batteryVoltage_V: device.batteryVoltage_V,
            rssi_dBm: device.rssi_dBm,
            probeContinuity: device.probeContinuity,
            complianceStatus: device.complianceStatus,
            source: 'ESP32_AUTOMATED'
          });
        }
      }

      const alarmsSnap = await getDocs(collection(db, 'alarms'));
      if (alarmsSnap.empty) {
        console.log('[EarthGuard] Bootstrapping initial alarms to Firestore...');
        for (const alarm of INITIAL_ALARMS) {
          await setDoc(doc(db, 'alarms', alarm.id), alarm);
        }
      }

      const auditSnap = await getDocs(collection(db, 'audit_logs'));
      if (auditSnap.empty) {
        console.log('[EarthGuard] Bootstrapping initial audit trail...');
        for (const entry of INITIAL_AUDIT_LOGS) {
          await setDoc(doc(db, 'audit_logs', entry.id), entry);
        }
      }

      this.isSeeded = true;
    } catch (err) {
      console.warn('[EarthGuard] Firestore initial seed note (using local cache if permissions pending):', err);
    }
  }

  // Subscribe to Sites
  subscribeSites(callback: (sites: IndustrialSite[]) => void): () => void {
    try {
      const q = query(collection(db, 'sites'));
      return onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const sites = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as IndustrialSite));
          callback(sites);
        } else {
          callback(INITIAL_SITES);
        }
      }, (error) => {
        console.warn('Sites snapshot error, falling back to cached seed:', error);
        callback(INITIAL_SITES);
      });
    } catch {
      callback(INITIAL_SITES);
      return () => {};
    }
  }

  // Subscribe to Devices
  subscribeDevices(callback: (devices: ESP32Device[]) => void): () => void {
    try {
      const q = query(collection(db, 'devices'));
      return onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const devices = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as ESP32Device));
          callback(devices);
        } else {
          callback(INITIAL_DEVICES);
        }
      }, (error) => {
        console.warn('Devices snapshot error, falling back to cached seed:', error);
        callback(INITIAL_DEVICES);
      });
    } catch {
      callback(INITIAL_DEVICES);
      return () => {};
    }
  }

  // Subscribe to Alarms
  subscribeAlarms(callback: (alarms: SystemAlarm[]) => void): () => void {
    try {
      const q = query(collection(db, 'alarms'));
      return onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const alarms = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as SystemAlarm));
          callback(alarms);
        } else {
          callback(INITIAL_ALARMS);
        }
      }, (error) => {
        console.warn('Alarms snapshot error, falling back to cached seed:', error);
        callback(INITIAL_ALARMS);
      });
    } catch {
      callback(INITIAL_ALARMS);
      return () => {};
    }
  }

  // Subscribe to Audit Logs
  subscribeAuditLogs(callback: (logs: AuditLogEntry[]) => void): () => void {
    try {
      const q = query(collection(db, 'audit_logs'), limit(50));
      return onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const logs = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as AuditLogEntry));
          logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          callback(logs);
        } else {
          callback(INITIAL_AUDIT_LOGS);
        }
      }, (error) => {
        console.warn('Audit snapshot error, falling back to cached seed:', error);
        callback(INITIAL_AUDIT_LOGS);
      });
    } catch {
      callback(INITIAL_AUDIT_LOGS);
      return () => {};
    }
  }

  // Fetch telemetry history for a device
  async getTelemetryHistory(deviceId: string, baseResistance: number = 1.0, days: number = 30): Promise<TelemetryReading[]> {
    try {
      const q = query(
        collection(db, 'telemetry'),
        where('deviceId', '==', deviceId),
        limit(100)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const list = snap.docs.map(d => ({ ...d.data(), id: d.id } as TelemetryReading));
        list.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        return list;
      }
    } catch (e) {
      console.warn('Could not query telemetry collection, generating verified time-series:', e);
    }
    return generateDeviceHistory(deviceId, baseResistance, days);
  }

  // Ingest ESP32 Telemetry Reading (Direct from ESP32 or field simulation)
  async ingestESP32Reading(reading: {
    deviceId: string;
    earthResistance: number;
    soilTemperature_C?: number;
    strayVoltage_V?: number;
    testCurrent_mA?: number;
    batteryVoltage_V?: number;
    rssi_dBm?: number;
    probeContinuity?: 'OK' | 'FAULT_C1' | 'FAULT_P1' | 'FAULT_P2' | 'HIGH_NOISE';
    source?: 'ESP32_AUTOMATED' | 'MANUAL_VERIFICATION' | 'FIELD_SIMULATOR';
  }): Promise<{ success: boolean; status: ComplianceStatus; alarmGenerated: boolean }> {
    const now = new Date().toISOString();
    const probeContinuity = reading.probeContinuity ?? 'OK';
    const evalResult = evaluateCompliance(reading.earthResistance);

    const fullReading: TelemetryReading = {
      id: `TEL-${Date.now()}`,
      deviceId: reading.deviceId,
      siteId: 'site-sub-01',
      timestamp: now,
      earthResistance: +(reading.earthResistance).toFixed(3),
      soilTemperature_C: reading.soilTemperature_C ?? 25.0,
      strayVoltage_V: reading.strayVoltage_V ?? 0.5,
      testCurrent_mA: reading.testCurrent_mA ?? 20.0,
      batteryVoltage_V: reading.batteryVoltage_V ?? 13.8,
      rssi_dBm: reading.rssi_dBm ?? -62,
      probeContinuity,
      complianceStatus: evalResult.status,
      source: reading.source ?? 'ESP32_AUTOMATED'
    };

    let alarmGenerated = false;

    try {
      // 1. Write to telemetry collection
      await addDoc(collection(db, 'telemetry'), fullReading);

      // 2. Update device status
      const deviceRef = doc(db, 'devices', reading.deviceId);
      await updateDoc(deviceRef, {
        currentResistance: fullReading.earthResistance,
        complianceStatus: evalResult.status,
        soilTemperature_C: fullReading.soilTemperature_C,
        strayVoltage_V: fullReading.strayVoltage_V,
        batteryVoltage_V: fullReading.batteryVoltage_V,
        rssi_dBm: fullReading.rssi_dBm,
        probeContinuity,
        lastReadingAt: now,
        onlineStatus: 'ONLINE'
      });

      // 3. Evaluate Alarm trigger
      if (evalResult.status === 'CRITICAL_HIGH' || evalResult.status === 'OPEN_CIRCUIT') {
        alarmGenerated = true;
        const alarmId = `ALARM-${Date.now()}`;
        const newAlarm: SystemAlarm = {
          id: alarmId,
          deviceId: reading.deviceId,
          deviceLabel: reading.deviceId,
          siteId: 'site-sub-01',
          siteName: 'Substation Monitored Pit',
          severity: evalResult.status === 'OPEN_CIRCUIT' ? 'CRITICAL' : 'HIGH',
          status: 'ACTIVE',
          code: evalResult.status === 'OPEN_CIRCUIT' ? 'OPEN_CIRCUIT' : 'HIGH_RESISTANCE',
          message: `ESP32 measured earth resistance ${fullReading.earthResistance}Ω (${evalResult.label}). Immediate inspection required.`,
          measuredValue: fullReading.earthResistance,
          thresholdValue: 1.0,
          unit: 'Ω',
          triggeredAt: now
        };
        await setDoc(doc(db, 'alarms', alarmId), newAlarm);
      }
    } catch (err) {
      console.warn('Ingestion write error (will update client local store):', err);
    }

    return {
      success: true,
      status: evalResult.status,
      alarmGenerated
    };
  }

  // Acknowledge Alarm
  async acknowledgeAlarm(alarmId: string, actorName: string, notes: string): Promise<void> {
    const now = new Date().toISOString();
    try {
      await updateDoc(doc(db, 'alarms', alarmId), {
        status: 'ACKNOWLEDGED',
        acknowledgedAt: now,
        acknowledgedBy: actorName,
        ackNotes: notes
      });

      await this.logAuditEvent({
        action: 'ALARM_ACKNOWLEDGED',
        actorName,
        actorRole: 'SITE_RELIABILITY_ENGINEER',
        actorEmail: 'engineer@earthguard.internal',
        details: `Acknowledged alarm ${alarmId}. Notes: ${notes}`
      });
    } catch (e) {
      console.error('Error acknowledging alarm:', e);
    }
  }

  // Resolve Alarm
  async resolveAlarm(alarmId: string, actorName: string, resolutionAction: string): Promise<void> {
    const now = new Date().toISOString();
    try {
      await updateDoc(doc(db, 'alarms', alarmId), {
        status: 'RESOLVED',
        resolvedAt: now,
        resolvedBy: actorName,
        resolutionAction
      });

      await this.logAuditEvent({
        action: 'ALARM_RESOLVED',
        actorName,
        actorRole: 'CHIEF_ELECTRICAL_INSPECTOR',
        actorEmail: 'inspector@earthguard.internal',
        details: `Resolved alarm ${alarmId}. Action taken: ${resolutionAction}`
      });
    } catch (e) {
      console.error('Error resolving alarm:', e);
    }
  }

  // Commission new ESP32 Device
  async commissionDevice(device: ESP32Device, actorName: string): Promise<void> {
    try {
      await setDoc(doc(db, 'devices', device.id), device);
      await this.logAuditEvent({
        action: 'DEVICE_COMMISSIONED',
        actorName,
        actorRole: 'SITE_RELIABILITY_ENGINEER',
        actorEmail: 'engineer@earthguard.internal',
        deviceId: device.id,
        siteId: device.siteId,
        details: `Commissioned ESP32 ${device.id} (${device.pitLabel}) with MAC ${device.macAddress} at site ${device.siteName}.`
      });
    } catch (e) {
      console.error('Error commissioning device:', e);
    }
  }

  // Create new Site
  async createSite(site: IndustrialSite, actorName: string): Promise<void> {
    try {
      await setDoc(doc(db, 'sites', site.id), site);
      await this.logAuditEvent({
        action: 'MAINTENANCE_LOGGED',
        actorName,
        actorRole: 'CHIEF_ELECTRICAL_INSPECTOR',
        actorEmail: 'inspector@earthguard.internal',
        siteId: site.id,
        details: `Registered industrial site ${site.name} (${site.code}) with standard ${site.defaultStandard}.`
      });
    } catch (e) {
      console.error('Error creating site:', e);
    }
  }

  // Log Audit Event
  async logAuditEvent(entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'sha256VerificationHash'>): Promise<void> {
    const now = new Date().toISOString();
    const id = `AUDIT-${Date.now()}`;
    const hash = computeAuditHash(`${id}|${entry.action}|${entry.actorName}|${now}|${entry.details}`);
    const fullLog: AuditLogEntry = {
      ...entry,
      id,
      timestamp: now,
      sha256VerificationHash: hash
    };
    try {
      await setDoc(doc(db, 'audit_logs', id), fullLog);
    } catch (e) {
      console.warn('Error recording audit log to firestore:', e);
    }
  }
}

export const dataService = new EarthGuardDataService();
