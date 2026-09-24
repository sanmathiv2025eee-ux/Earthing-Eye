import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  IndustrialSite, 
  ESP32Device, 
  SystemAlarm, 
  AuditLogEntry, 
  ComplianceStatus 
} from '../types';
import { 
  dataService, 
  INITIAL_SITES, 
  INITIAL_DEVICES, 
  INITIAL_ALARMS, 
  INITIAL_AUDIT_LOGS 
} from '../services/firestore';
import { evaluateCompliance } from '../services/standards';

export function useEarthGuard() {
  const [sites, setSites] = useState<IndustrialSite[]>(INITIAL_SITES);
  const [devices, setDevices] = useState<ESP32Device[]>(INITIAL_DEVICES);
  const [alarms, setAlarms] = useState<SystemAlarm[]>(INITIAL_ALARMS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  
  const [selectedSiteId, setSelectedSiteId] = useState<string>('site-sub-01');
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('EG-ESP32-SUB01-TR1');
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [lastTelemetryTimestamp, setLastTelemetryTimestamp] = useState<number>(Date.now());
  const [isIngesting, setIsIngesting] = useState<boolean>(false);

  // Initialize and seed database if empty
  useEffect(() => {
    dataService.initAndSeedDatabase();

    const unsubSites = dataService.subscribeSites((newSites) => {
      setSites(newSites);
    });

    const unsubDevices = dataService.subscribeDevices((newDevices) => {
      setDevices(newDevices);
      setLastTelemetryTimestamp(Date.now());
    });

    const unsubAlarms = dataService.subscribeAlarms((newAlarms) => {
      setAlarms(newAlarms);
    });

    const unsubAudit = dataService.subscribeAuditLogs((newLogs) => {
      setAuditLogs(newLogs);
    });

    return () => {
      unsubSites();
      unsubDevices();
      unsubAlarms();
      unsubAudit();
    };
  }, []);

  // Filtered devices for the selected site
  const siteDevices = useMemo(() => {
    if (!selectedSiteId || selectedSiteId === 'ALL') return devices;
    return devices.filter(d => d.siteId === selectedSiteId);
  }, [devices, selectedSiteId]);

  // Active selected device
  const activeDevice = useMemo(() => {
    return devices.find(d => d.id === selectedDeviceId) || siteDevices[0] || devices[0];
  }, [devices, siteDevices, selectedDeviceId]);

  // Active site
  const activeSite = useMemo(() => {
    return sites.find(s => s.id === selectedSiteId) || sites[0];
  }, [sites, selectedSiteId]);

  // Active unacknowledged alarms
  const activeAlarms = useMemo(() => {
    return alarms.filter(a => a.status === 'ACTIVE');
  }, [alarms]);

  const criticalAlarmsCount = useMemo(() => {
    return activeAlarms.filter(a => a.severity === 'CRITICAL').length;
  }, [activeAlarms]);

  // Summary Metrics
  const summaryMetrics = useMemo(() => {
    const totalDevices = devices.length;
    const onlineDevices = devices.filter(d => d.onlineStatus === 'ONLINE').length;
    const compliantPits = devices.filter(d => d.complianceStatus === 'COMPLIANT').length;
    const warningPits = devices.filter(d => d.complianceStatus === 'WARNING').length;
    const criticalPits = devices.filter(d => d.complianceStatus === 'CRITICAL_HIGH' || d.complianceStatus === 'OPEN_CIRCUIT').length;

    // calculate average resistance of compliant pits
    const sumResistance = devices.reduce((acc, d) => acc + (d.currentResistance < 100 ? d.currentResistance : 0), 0);
    const avgResistance = totalDevices > 0 ? (sumResistance / totalDevices).toFixed(2) : '0.00';

    const complianceRate = totalDevices > 0 ? Math.round((compliantPits / totalDevices) * 100) : 100;

    return {
      totalDevices,
      onlineDevices,
      compliantPits,
      warningPits,
      criticalPits,
      avgResistance,
      complianceRate
    };
  }, [devices]);

  // Ingest reading method
  const ingestReading = useCallback(async (reading: {
    deviceId: string;
    earthResistance: number;
    soilTemperature_C?: number;
    strayVoltage_V?: number;
    testCurrent_mA?: number;
    batteryVoltage_V?: number;
    rssi_dBm?: number;
    probeContinuity?: 'OK' | 'FAULT_C1' | 'FAULT_P1' | 'FAULT_P2' | 'HIGH_NOISE';
    source?: 'ESP32_AUTOMATED' | 'MANUAL_VERIFICATION' | 'FIELD_SIMULATOR';
  }) => {
    setIsIngesting(true);
    try {
      // Local optimistic update
      setDevices(prev => prev.map(dev => {
        if (dev.id === reading.deviceId) {
          const evalRes = evaluateCompliance(reading.earthResistance, activeSite?.defaultStandard || 'IEEE_80');
          return {
            ...dev,
            currentResistance: reading.earthResistance,
            previousResistance: dev.currentResistance,
            complianceStatus: evalRes.status,
            soilTemperature_C: reading.soilTemperature_C ?? dev.soilTemperature_C,
            strayVoltage_V: reading.strayVoltage_V ?? dev.strayVoltage_V,
            batteryVoltage_V: reading.batteryVoltage_V ?? dev.batteryVoltage_V,
            rssi_dBm: reading.rssi_dBm ?? dev.rssi_dBm,
            probeContinuity: reading.probeContinuity ?? dev.probeContinuity,
            lastReadingAt: new Date().toISOString()
          };
        }
        return dev;
      }));

      const res = await dataService.ingestESP32Reading(reading);
      setLastTelemetryTimestamp(Date.now());
      return res;
    } finally {
      setIsIngesting(false);
    }
  }, [activeSite]);

  // Acknowledge alarm
  const acknowledgeAlarm = useCallback(async (alarmId: string, actorName: string, notes: string) => {
    setAlarms(prev => prev.map(a => a.id === alarmId ? { ...a, status: 'ACKNOWLEDGED', acknowledgedBy: actorName, acknowledgedAt: new Date().toISOString(), ackNotes: notes } : a));
    await dataService.acknowledgeAlarm(alarmId, actorName, notes);
  }, []);

  // Resolve alarm
  const resolveAlarm = useCallback(async (alarmId: string, actorName: string, actionNote: string) => {
    setAlarms(prev => prev.map(a => a.id === alarmId ? { ...a, status: 'RESOLVED', resolvedBy: actorName, resolvedAt: new Date().toISOString(), resolutionAction: actionNote } : a));
    await dataService.resolveAlarm(alarmId, actorName, actionNote);
  }, []);

  // Commission device
  const commissionDevice = useCallback(async (newDevice: ESP32Device, actorName: string) => {
    setDevices(prev => [newDevice, ...prev]);
    await dataService.commissionDevice(newDevice, actorName);
  }, []);

  // Create site
  const createSite = useCallback(async (newSite: IndustrialSite, actorName: string) => {
    setSites(prev => [newSite, ...prev]);
    await dataService.createSite(newSite, actorName);
  }, []);

  return {
    sites,
    devices,
    siteDevices,
    activeSite,
    activeDevice,
    alarms,
    activeAlarms,
    criticalAlarmsCount,
    auditLogs,
    summaryMetrics,
    selectedSiteId,
    selectedDeviceId,
    isAudioMuted,
    lastTelemetryTimestamp,
    isIngesting,
    setSelectedSiteId,
    setSelectedDeviceId,
    setIsAudioMuted,
    ingestReading,
    acknowledgeAlarm,
    resolveAlarm,
    commissionDevice,
    createSite
  };
}
