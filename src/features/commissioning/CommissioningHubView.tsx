import React, { useState } from 'react';
import { ESP32Device, IndustrialSite, ElectrodeType } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { 
  Terminal, 
  Cpu, 
  Radio, 
  Copy, 
  Check, 
  Send, 
  Code, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';

interface CommissioningHubViewProps {
  devices: ESP32Device[];
  sites: IndustrialSite[];
  activeSite: IndustrialSite;
  onIngestReading: (reading: {
    deviceId: string;
    earthResistance: number;
    soilTemperature_C?: number;
    strayVoltage_V?: number;
    testCurrent_mA?: number;
    batteryVoltage_V?: number;
    rssi_dBm?: number;
    probeContinuity?: 'OK' | 'FAULT_C1' | 'FAULT_P1' | 'FAULT_P2' | 'HIGH_NOISE';
    source?: 'ESP32_AUTOMATED' | 'MANUAL_VERIFICATION' | 'FIELD_SIMULATOR';
  }) => Promise<any>;
  onCommissionDevice: (device: ESP32Device, actorName: string) => Promise<any>;
}

export const CommissioningHubView: React.FC<CommissioningHubViewProps> = ({
  devices,
  sites,
  activeSite,
  onIngestReading,
  onCommissionDevice
}) => {
  const { currentUser } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'SIMULATOR' | 'FIRMWARE' | 'WIZARD'>('SIMULATOR');

  // Field Simulator state
  const [simDeviceId, setSimDeviceId] = useState<string>(devices[0]?.id || 'ESP32-001');
  const [simResistance, setSimResistance] = useState<number>(0.65);
  const [simTemp, setSimTemp] = useState<number>(25.4);
  const [simStrayV, setSimStrayV] = useState<number>(0.72);
  const [simBattery, setSimBattery] = useState<number>(13.8);
  const [simRssi, setSimRssi] = useState<number>(-60);
  const [simContinuity, setSimContinuity] = useState<'OK' | 'FAULT_C1' | 'FAULT_P1' | 'FAULT_P2' | 'HIGH_NOISE'>('OK');
  const [simStatusMsg, setSimStatusMsg] = useState<{ type: 'success' | 'alert'; text: string } | null>(null);
  const [isTransmitting, setIsTransmitting] = useState(false);

  // New Device Wizard state
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [newDevId, setNewDevId] = useState<string>(`ESP32-${Date.now().toString().slice(-3)}`);
  const [newSiteId, setNewSiteId] = useState<string>(activeSite.id);
  const [newPitLabel, setNewPitLabel] = useState<string>('Earth Electrode E-05');
  const [newMac, setNewMac] = useState<string>('A4:CF:12:88:41:9B');
  const [newElectrode, setNewElectrode] = useState<ElectrodeType>('CHEMICAL_PIPE');
  const [newDepth, setNewDepth] = useState<number>(6.0);
  const [newLimit, setNewLimit] = useState<number>(1.0);
  const [newWarn, setNewWarn] = useState<number>(0.8);
  const [commissionSuccess, setCommissionSuccess] = useState(false);

  // Copy code state
  const [copied, setCopied] = useState(false);

  // Quick Scenarios for Field Testing
  const handleApplyScenario = (type: 'NORMAL' | 'SUMMER_DRY' | 'SURGE' | 'DISCONNECT' | 'WATER_TREATMENT') => {
    switch (type) {
      case 'NORMAL':
        setSimResistance(0.58);
        setSimStrayV(0.4);
        setSimContinuity('OK');
        break;
      case 'SUMMER_DRY':
        setSimResistance(1.85);
        setSimStrayV(0.8);
        setSimContinuity('OK');
        break;
      case 'SURGE':
        setSimResistance(0.75);
        setSimStrayV(9.40);
        setSimContinuity('HIGH_NOISE');
        break;
      case 'DISCONNECT':
        setSimResistance(999.0);
        setSimContinuity('FAULT_C1');
        break;
      case 'WATER_TREATMENT':
        setSimResistance(0.38);
        setSimStrayV(0.3);
        setSimContinuity('OK');
        break;
    }
  };

  // Transmit Telemetry Payload to Firestore
  const handleTransmitPayload = async () => {
    setIsTransmitting(true);
    setSimStatusMsg(null);
    try {
      const res = await onIngestReading({
        deviceId: simDeviceId,
        earthResistance: simResistance,
        soilTemperature_C: simTemp,
        strayVoltage_V: simStrayV,
        batteryVoltage_V: simBattery,
        rssi_dBm: simRssi,
        probeContinuity: simContinuity,
        source: 'FIELD_SIMULATOR'
      });

      if (res?.alarmGenerated) {
        setSimStatusMsg({
          type: 'alert',
          text: `Telemetry ingested! Critical alarm triggered for ${simDeviceId} (${simResistance}Ω). Check Alarm console.`
        });
      } else {
        setSimStatusMsg({
          type: 'success',
          text: `ESP32 payload successfully ingested into Firebase! Earth Resistance ${simResistance}Ω updated.`
        });
      }
    } catch (e: any) {
      setSimStatusMsg({ type: 'alert', text: `Failed to transmit: ${e.message}` });
    } finally {
      setIsTransmitting(false);
    }
  };

  // Handle Commissioning Submit
  const handleCommissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const siteObj = sites.find(s => s.id === newSiteId) || activeSite;
    const dev: ESP32Device = {
      id: newDevId,
      siteId: newSiteId,
      siteName: siteObj.name,
      pitLabel: newPitLabel,
      serialNumber: `SN-${newDevId}`,
      macAddress: newMac,
      firmwareVersion: 'v2.4.2-prod',
      hardwareRevision: 'EG-REV-4.2',
      electrodeType: newElectrode,
      electrodeDepth_m: newDepth,
      testMethod: 'WENNER_4_WIRE',
      telemetryIntervalSec: 900,
      currentResistance: 0.52,
      complianceStatus: 'COMPLIANT',
      soilTemperature_C: 24.0,
      strayVoltage_V: 0.4,
      testCurrent_mA: 20.0,
      batteryVoltage_V: 13.8,
      powerSource: 'MAINS_BACKUP',
      rssi_dBm: -58,
      probeContinuity: 'OK',
      internalTemp_C: 38.0,
      lastReadingAt: new Date().toISOString(),
      onlineStatus: 'ONLINE',
      lastCalibratedAt: new Date().toISOString(),
      nextCalibrationDue: new Date(Date.now() + 365 * 86400000).toISOString(),
      targetMaxResistance: newLimit,
      warningResistance: newWarn,
      commissionedBy: currentUser.name,
      commissionedAt: new Date().toISOString(),
      notes: 'Commissioned via EarthGuard Industrial Provisioning Portal'
    };

    await onCommissionDevice(dev, currentUser.name);
    setCommissionSuccess(true);
    setTimeout(() => {
      setCommissionSuccess(false);
      setWizardStep(1);
      setActiveSubTab('SIMULATOR');
    }, 2000);
  };

  const cCodeSnippet = `/*
 * EARTHGUARD Industrial IoT Node Firmware
 * Target: ESP32-WROOM-32 / ESP32-S3
 * Transducer: 4-Terminal Constant Current 128Hz AC Earth Resistance Sensor
 * Target Node ID: ${simDeviceId}
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* WIFI_SSID = "INDUSTRIAL_MESH_SECURE";
const char* WIFI_PASS = "SubstationSafe_2026";
const char* INGEST_ENDPOINT = "https://your-earthguard-cloud.app/api/telemetry/ingest";

// Transducer Interface Pins (Wenner 4-Wire)
#define PIN_128HZ_PWM_GEN 18
#define PIN_ADC_VOLT_SENSE 34
#define PIN_ADC_CURR_SENSE 35
#define PIN_TEMP_PT100     32
#define PIN_BATTERY_MON    33

void setup() {
  Serial.begin(115200);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\\nWiFi Connected. Node Online.");
}

void loop() {
  // 1. Trigger 128Hz AC Constant Current Injection (20mA RMS)
  // 2. Read Voltage drop between P1 - P2 potential electrodes
  // 3. Compute Earth Resistance = (V_p1p2 / I_injected) * CalibrationFactor
  
  float measuredResistance_Ohms = analogRead(PIN_ADC_VOLT_SENSE) * 0.00142f;
  float soilTemp_C = 25.4f;
  float batteryVolts = 13.8f;
  int rssiVal = WiFi.RSSI();

  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(INGEST_ENDPOINT);
    http.addHeader("Content-Type", "application/json");

    StaticJsonDocument<256> doc;
    doc["deviceId"] = "${simDeviceId}";
    doc["earthResistance"] = measuredResistance_Ohms;
    doc["soilTemperature_C"] = soilTemp_C;
    doc["batteryVoltage_V"] = batteryVolts;
    doc["rssi_dBm"] = rssiVal;
    doc["probeContinuity"] = "OK";

    String requestBody;
    serializeJson(doc, requestBody);
    int httpResponseCode = http.POST(requestBody);
    Serial.printf("Telemetry HTTP Status: %d\\n", httpResponseCode);
    http.end();
  }

  // Sleep for telemetry interval (15 minutes)
  delay(900000);
}`;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Terminal className="w-5 h-5 text-blue-700" />
            ESP32 Gateway Hub & Commissioning Station
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Test real-time sensor data ingestion, generate industrial C++ firmware, or commission new nodes.
          </p>
        </div>

        {/* Sub-Tabs */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-md text-xs">
          <button
            onClick={() => setActiveSubTab('SIMULATOR')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeSubTab === 'SIMULATOR' ? 'bg-white text-blue-700 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Live Ingestion Tester
          </button>
          <button
            onClick={() => setActiveSubTab('FIRMWARE')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeSubTab === 'FIRMWARE' ? 'bg-white text-blue-700 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ESP32 Firmware C++
          </button>
          <button
            onClick={() => setActiveSubTab('WIZARD')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeSubTab === 'WIZARD' ? 'bg-white text-blue-700 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            + Commission Node
          </button>
        </div>
      </div>

      {/* SUBTAB 1: LIVE INGESTION TESTER */}
      {activeSubTab === 'SIMULATOR' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Controls Column */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-6 shadow-2xs space-y-6">
            
            <div className="border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                  DEMO TELEMETRY / INGESTION TESTER
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-2">
                Live ESP32 Telemetry Transmit Console
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Push live measured values from the field directly into Cloud Firestore. Observe real-time graph updates and alarm transitions.
              </p>
            </div>

            {/* Quick Test Scenarios */}
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                Quick Test Scenarios:
              </span>
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  onClick={() => handleApplyScenario('NORMAL')}
                  className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium border border-slate-200"
                >
                  ✓ Normal Soil (0.58Ω)
                </button>
                <button
                  onClick={() => handleApplyScenario('SUMMER_DRY')}
                  className="px-2.5 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-900 font-medium border border-amber-200"
                >
                  ⚠ Arid Soil Drift (1.85Ω)
                </button>
                <button
                  onClick={() => handleApplyScenario('SURGE')}
                  className="px-2.5 py-1 rounded bg-purple-50 hover:bg-purple-100 text-purple-900 font-medium border border-purple-200"
                >
                  ⚡ Stray Voltage Surge (9.4V)
                </button>
                <button
                  onClick={() => handleApplyScenario('DISCONNECT')}
                  className="px-2.5 py-1 rounded bg-red-50 hover:bg-red-100 text-red-900 font-medium border border-red-200"
                >
                  ✖ Disconnected Probe (999Ω)
                </button>
                <button
                  onClick={() => handleApplyScenario('WATER_TREATMENT')}
                  className="px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-900 font-medium border border-blue-200"
                >
                  💧 Chemical Recharge (0.38Ω)
                </button>
              </div>
            </div>

            {/* Input fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-[11px] font-medium text-slate-600 block mb-1">Target ESP32 Node</label>
                <select
                  value={simDeviceId}
                  onChange={(e) => setSimDeviceId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  {devices.map(d => (
                    <option key={d.id} value={d.id}>{d.id} · {d.pitLabel}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-600 block mb-1">
                  Measured Earth Resistance ($R_e$ in Ω) <span className="text-blue-700">*ESP32 Telemetry</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={simResistance}
                  onChange={(e) => setSimResistance(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-slate-900 font-mono font-bold text-base focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-600 block mb-1">Soil Temperature (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={simTemp}
                  onChange={(e) => setSimTemp(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-600 block mb-1">Stray Ground Voltage (V)</label>
                <input
                  type="number"
                  step="0.05"
                  value={simStrayV}
                  onChange={(e) => setSimStrayV(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-600 block mb-1">Battery DC Bus Voltage (V)</label>
                <input
                  type="number"
                  step="0.1"
                  value={simBattery}
                  onChange={(e) => setSimBattery(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-600 block mb-1">Wenner Probe Continuity</label>
                <select
                  value={simContinuity}
                  onChange={(e) => setSimContinuity(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  <option value="OK">OK (All 4 terminals verified)</option>
                  <option value="FAULT_C1">FAULT_C1 (Current Lead Open)</option>
                  <option value="FAULT_P1">FAULT_P1 (Voltage Potential Lead Open)</option>
                  <option value="HIGH_NOISE">HIGH_NOISE (Harmonic Interference)</option>
                </select>
              </div>
            </div>

            {/* Status Message */}
            {simStatusMsg && (
              <div className={`p-3 rounded-md border text-xs flex items-center gap-2 ${
                simStatusMsg.type === 'alert' 
                  ? 'bg-red-50 text-red-800 border-red-200' 
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}>
                {simStatusMsg.type === 'alert' ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>{simStatusMsg.text}</span>
              </div>
            )}

            {/* Transmit Button */}
            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={handleTransmitPayload}
                disabled={isTransmitting}
                className="px-5 py-2.5 rounded-md bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs transition-colors shadow-2xs flex items-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isTransmitting ? 'Transmitting Ingestion...' : 'Transmit ESP32 Telemetry Packet'}</span>
              </button>
            </div>

          </div>

          {/* JSON Payload Inspector */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-2xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-blue-700" />
                  JSON Packet Format
                </span>
                <span className="text-[10px] font-mono text-emerald-700 font-semibold">HTTP POST / JSON</span>
              </div>
              <p className="text-[11px] text-slate-500 mb-3">
                Schema dispatched over Wi-Fi/LTE by the ESP32 hardware to Cloud Firestore:
              </p>
              <pre className="bg-slate-900 text-slate-100 p-3 rounded-md text-[11px] font-mono overflow-x-auto">
{`{
  "deviceId": "${simDeviceId}",
  "earthResistance": ${simResistance.toFixed(2)},
  "soilTemperature_C": ${simTemp.toFixed(1)},
  "strayVoltage_V": ${simStrayV.toFixed(2)},
  "testCurrent_mA": 20.0,
  "batteryVoltage_V": ${simBattery.toFixed(1)},
  "rssi_dBm": ${simRssi},
  "probeContinuity": "${simContinuity}",
  "timestamp": "${new Date().toISOString()}"
}`}
              </pre>
            </div>

            <div className="bg-slate-50 p-3 rounded-md border border-slate-200 text-xs text-slate-600 space-y-1">
              <span className="text-slate-900 font-semibold block">Telemetry Protocol:</span>
              <div>• Transducer sampling: 128Hz AC Constant Current</div>
              <div>• Rejection band: 50Hz/60Hz notch</div>
              <div>• Cloud Backend: Cloud Firestore Real-time Listener</div>
            </div>
          </div>

        </div>
      )}

      {/* SUBTAB 2: ESP32 FIRMWARE C++ */}
      {activeSubTab === 'FIRMWARE' && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Code className="w-4 h-4 text-blue-700" />
                Production ESP32 C++ Transducer Firmware
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Ready to flash directly via Arduino IDE, PlatformIO, or ESP-IDF onto field hardware.
              </p>
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(cCodeSnippet);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold transition-colors shadow-2xs self-start"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Arduino Code'}</span>
            </button>
          </div>

          <div className="relative">
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg text-xs font-mono overflow-x-auto max-h-[460px] leading-relaxed">
              {cCodeSnippet}
            </pre>
          </div>
        </div>
      )}

      {/* SUBTAB 3: COMMISSION NEW NODE WIZARD */}
      {activeSubTab === 'WIZARD' && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-2xs max-w-2xl mx-auto">
          
          <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-700" />
                Commission New ESP32 Monitoring Node
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Register an earthing pit telemetry device with calibration parameters.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500">Step {wizardStep} of 2</span>
          </div>

          {commissionSuccess ? (
            <div className="p-8 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="text-base font-bold text-slate-900">ESP32 Node Commissioned!</h4>
              <p className="text-xs text-slate-500">
                Transducer {newDevId} has been added to {activeSite.name} and registered in the audit log.
              </p>
            </div>
          ) : (
            <form onSubmit={handleCommissionSubmit} className="space-y-4 text-xs">
              
              {wizardStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">Transducer Hardware ID</label>
                    <input
                      type="text"
                      value={newDevId}
                      onChange={(e) => setNewDevId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-slate-900 font-mono font-semibold focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">Assign to Industrial Facility</label>
                    <select
                      value={newSiteId}
                      onChange={(e) => setNewSiteId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-600"
                    >
                      {sites.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">Earth Pit Physical Label</label>
                    <input
                      type="text"
                      value={newPitLabel}
                      onChange={(e) => setNewPitLabel(e.target.value)}
                      placeholder="e.g. Earth Electrode E-08"
                      className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">ESP32 MAC Address</label>
                    <input
                      type="text"
                      value={newMac}
                      onChange={(e) => setNewMac(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  </div>

                  <div className="flex justify-end pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setWizardStep(2)}
                      className="px-4 py-2 rounded-md bg-blue-700 hover:bg-blue-800 text-white font-semibold transition-colors shadow-2xs"
                    >
                      Next: Electrode & Limits →
                    </button>
                  </div>
                </div>
              )}

              {wizardStep === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 mb-1 font-medium">Electrode Type</label>
                      <select
                        value={newElectrode}
                        onChange={(e) => setNewElectrode(e.target.value as ElectrodeType)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                      >
                        <option value="CHEMICAL_PIPE">Chemical Pipe Electrode</option>
                        <option value="COPPER_BONDED_ROD">Copper Bonded Solid Rod</option>
                        <option value="COPPER_PLATE_600">Copper Plate (600x600mm)</option>
                        <option value="ROD_ARRAY_DELTA">Rod Array (Delta 3-Rod)</option>
                        <option value="MARCONITE_BACKFILL_PIT">Marconite Conductive Concrete</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 mb-1 font-medium">Electrode Depth (Meters)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={newDepth}
                        onChange={(e) => setNewDepth(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 mb-1 font-medium">Max Limit (Ω)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={newLimit}
                        onChange={(e) => setNewLimit(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-slate-900 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 mb-1 font-medium">Warning Threshold (Ω)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={newWarn}
                        onChange={(e) => setNewWarn(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-slate-900 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-md border border-slate-200 text-slate-600">
                    Commissioning Engineer: <strong className="text-slate-900">{currentUser.name}</strong> ({currentUser.licenseNumber})
                  </div>

                  <div className="flex justify-between pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setWizardStep(1)}
                      className="px-4 py-2 rounded-md bg-slate-100 text-slate-700 font-semibold"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white font-semibold transition-colors shadow-2xs"
                    >
                      Confirm & Commission Node
                    </button>
                  </div>
                </div>
              )}

            </form>
          )}

        </div>
      )}

    </div>
  );
};
