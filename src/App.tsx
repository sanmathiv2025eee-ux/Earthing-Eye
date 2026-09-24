import React, { useState, useEffect, useRef } from 'react';
import { useEarthGuard } from './hooks/useEarthGuard';
import { Header } from './components/layout/Header';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { LiveOverviewView } from './features/monitoring/LiveOverviewView';
import { LiveMonitoringDedicatedView } from './features/monitoring/LiveMonitoringDedicatedView';
import { DeviceFleetView } from './features/devices/DeviceFleetView';
import { HistoricalAnalysisView } from './features/analytics/HistoricalAnalysisView';
import { AlarmsView } from './features/alarms/AlarmsView';
import { StandardsThresholdsView } from './features/standards/StandardsThresholdsView';
import { CommissioningHubView } from './features/commissioning/CommissioningHubView';
import { SiteManagementView } from './features/sites/SiteManagementView';
import { AuditLogView } from './features/audit/AuditLogView';
import { SettingsView } from './features/settings/SettingsView';

export default function App() {
  const {
    sites,
    devices,
    siteDevices,
    activeSite,
    activeDevice,
    alarms,
    activeAlarms,
    criticalAlarmsCount,
    auditLogs,
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
  } = useEarthGuard();

  const [currentTab, setCurrentTab] = useState<NavTab>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Audio Alarm Annunciator Synthesizer
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (isAudioMuted || criticalAlarmsCount === 0) return;

    // Gentle industrial intermittent beep for active critical alarms
    const interval = setInterval(() => {
      try {
        if (!audioCtxRef.current) {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            audioCtxRef.current = new AudioContextClass();
          }
        }

        if (audioCtxRef.current && audioCtxRef.current.state === 'running') {
          const osc = audioCtxRef.current.createOscillator();
          const gain = audioCtxRef.current.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, audioCtxRef.current.currentTime); // A5 tone
          gain.gain.setValueAtTime(0.04, audioCtxRef.current.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, audioCtxRef.current.currentTime + 0.25);
          osc.connect(gain);
          gain.connect(audioCtxRef.current.destination);
          osc.start();
          osc.stop(audioCtxRef.current.currentTime + 0.25);
        }
      } catch (e) {
        // audio context suspended until user interaction
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isAudioMuted, criticalAlarmsCount]);

  const handleResetDemoData = () => {
    // Soft reset to default readings for testing
    devices.forEach(d => {
      ingestReading({
        deviceId: d.id,
        earthResistance: d.id.includes('TR1') ? 0.62 : 0.45,
        soilTemperature_C: 24.5,
        strayVoltage_V: 0.4,
        source: 'FIELD_SIMULATOR'
      });
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 selection:bg-blue-600/10 selection:text-blue-800">
      
      {/* 1. Clean Top Header */}
      <Header
        sites={sites}
        selectedSiteId={selectedSiteId}
        onSelectSite={setSelectedSiteId}
        activeAlarmsCount={activeAlarms.length}
        criticalAlarmsCount={criticalAlarmsCount}
        isAudioMuted={isAudioMuted}
        onToggleAudio={() => setIsAudioMuted(!isAudioMuted)}
        lastTelemetryTimestamp={lastTelemetryTimestamp}
        isIngesting={isIngesting}
        onOpenAlarmView={() => setCurrentTab('alerts')}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      {/* 2. Main Workbench: Sidebar + Content Area */}
      <div className="flex-1 flex w-full">
        
        {/* Navigation Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          activeAlarmsCount={activeAlarms.length}
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Content View Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto overflow-x-hidden">
          {currentTab === 'overview' && (
            <LiveOverviewView
              devices={devices}
              siteDevices={siteDevices}
              activeSite={activeSite}
              activeDevice={activeDevice}
              onSelectDevice={setSelectedDeviceId}
              onNavigateToTab={setCurrentTab}
            />
          )}

          {currentTab === 'live' && (
            <LiveMonitoringDedicatedView
              devices={devices}
              activeSite={activeSite}
              activeDevice={activeDevice}
              onSelectDevice={setSelectedDeviceId}
              onNavigateToTab={setCurrentTab}
            />
          )}

          {currentTab === 'devices' && (
            <DeviceFleetView
              devices={devices}
              sites={sites}
              selectedSiteId={selectedSiteId}
              onSelectSite={setSelectedSiteId}
              onSelectDevice={setSelectedDeviceId}
              onNavigateToTab={setCurrentTab}
            />
          )}

          {currentTab === 'sites' && (
            <SiteManagementView
              sites={sites}
              selectedSiteId={selectedSiteId}
              onSelectSite={setSelectedSiteId}
              onCreateSite={createSite}
            />
          )}

          {currentTab === 'history' && (
            <HistoricalAnalysisView
              devices={devices}
              activeSite={activeSite}
              selectedDeviceId={selectedDeviceId}
              onSelectDevice={setSelectedDeviceId}
            />
          )}

          {currentTab === 'alerts' && (
            <AlarmsView
              alarms={alarms}
              onAcknowledge={acknowledgeAlarm}
              onResolve={resolveAlarm}
            />
          )}

          {currentTab === 'analytics' && (
            <StandardsThresholdsView
              sites={sites}
            />
          )}

          {currentTab === 'commissioning' && (
            <CommissioningHubView
              devices={devices}
              sites={sites}
              activeSite={activeSite}
              onIngestReading={ingestReading}
              onCommissionDevice={commissionDevice}
            />
          )}

          {currentTab === 'audit' && (
            <AuditLogView
              logs={auditLogs}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              isAudioMuted={isAudioMuted}
              onToggleAudio={() => setIsAudioMuted(!isAudioMuted)}
              onResetDemoData={handleResetDemoData}
            />
          )}
        </main>
      </div>

      {/* 3. Quiet Industrial Status Footer */}
      <footer className="bg-white border-t border-slate-200 py-3 text-xs text-slate-500">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-3">
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              EARTHGUARD Industrial Telemetry v2.4.2
            </span>
            <span>·</span>
            <span className="hidden sm:inline">ESP32 128Hz AC Constant Current Ingestion</span>
            <span>·</span>
            <span className="text-slate-500">Cloud Firestore Real-Time</span>
          </div>

          <div className="flex items-center space-x-3 text-[11px]">
            <span>IEEE Std 80 / IS 3043 / IEC 62305</span>
            <span>·</span>
            <button
              onClick={() => setCurrentTab('settings')}
              className="text-blue-700 hover:text-blue-800 font-medium transition-colors"
            >
              System Configuration
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
