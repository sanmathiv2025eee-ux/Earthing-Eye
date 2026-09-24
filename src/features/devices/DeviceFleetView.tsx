import React, { useState, useMemo } from 'react';
import { ESP32Device, IndustrialSite } from '../../types';
import { evaluateCompliance } from '../../services/standards';
import { DeviceDiagnosticModal } from './DeviceDiagnosticModal';
import { 
  Cpu, 
  Search, 
  Plus, 
  Wrench, 
  ArrowUpRight,
  Wifi,
  Clock,
  Layers,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface DeviceFleetViewProps {
  devices: ESP32Device[];
  sites: IndustrialSite[];
  selectedSiteId: string;
  onSelectSite: (id: string) => void;
  onSelectDevice: (id: string) => void;
  onNavigateToTab: (tab: any) => void;
}

export const DeviceFleetView: React.FC<DeviceFleetViewProps> = ({
  devices,
  sites,
  selectedSiteId,
  onSelectSite,
  onSelectDevice,
  onNavigateToTab
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedDeviceForDiagnostics, setSelectedDeviceForDiagnostics] = useState<ESP32Device | null>(null);

  const filteredDevices = useMemo(() => {
    return devices.filter(device => {
      const matchesSite = selectedSiteId === 'ALL' || device.siteId === selectedSiteId;
      const matchesSearch = 
        device.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.pitLabel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.macAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.siteName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const comp = evaluateCompliance(device.currentResistance);
      const matchesStatus = statusFilter === 'ALL' || comp.status === statusFilter;

      return matchesSite && matchesSearch && matchesStatus;
    });
  }, [devices, selectedSiteId, searchTerm, statusFilter]);

  const handleCalibrate = (deviceId: string, zeroOffset: number) => {
    console.log(`Calibrated device ${deviceId} with offset ${zeroOffset}`);
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Cpu className="w-5 h-5 text-blue-700" />
            ESP32 Transducer Fleet & Health Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time telemetry status, battery reserves, signal quality, and IEEE compliance bounds.
          </p>
        </div>

        <button
          onClick={() => onNavigateToTab('commissioning')}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-md bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold transition-colors shadow-2xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Commission New Node</span>
        </button>
      </div>

      {/* Toolbar & Filters */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Node ID, Pit label, MAC, or facility..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1 rounded-md transition-colors ${
              statusFilter === 'ALL'
                ? 'bg-slate-900 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            All Nodes ({devices.length})
          </button>
          <button
            onClick={() => setStatusFilter('COMPLIANT')}
            className={`px-3 py-1 rounded-md transition-colors ${
              statusFilter === 'COMPLIANT'
                ? 'bg-emerald-100 text-emerald-800 font-semibold'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            Normal
          </button>
          <button
            onClick={() => setStatusFilter('WARNING')}
            className={`px-3 py-1 rounded-md transition-colors ${
              statusFilter === 'WARNING'
                ? 'bg-amber-100 text-amber-900 font-semibold'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            Warning
          </button>
          <button
            onClick={() => setStatusFilter('CRITICAL_HIGH')}
            className={`px-3 py-1 rounded-md transition-colors ${
              statusFilter === 'CRITICAL_HIGH'
                ? 'bg-red-100 text-red-900 font-semibold'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            Critical
          </button>
        </div>

      </div>

      {/* Device Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDevices.map((device) => {
          const comp = evaluateCompliance(device.currentResistance);
          const isCrit = comp.status === 'CRITICAL_HIGH' || comp.status === 'OPEN_CIRCUIT';
          const isWarn = comp.status === 'WARNING';

          return (
            <div
              key={device.id}
              className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-all"
            >
              <div>
                {/* Device Header */}
                <div className="flex items-start justify-between border-b border-slate-100 pb-3 mb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      {device.id}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Earth Resistance Monitor
                    </p>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {device.siteName} · {device.pitLabel}
                    </div>
                  </div>

                  <span className="flex items-center space-x-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                    <span>ONLINE</span>
                  </span>
                </div>

                {/* Section: CURRENT MEASUREMENT */}
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200/80 mb-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-500 block">
                      CURRENT MEASUREMENT
                    </span>
                    <div className="flex items-baseline space-x-1.5 mt-0.5">
                      <span className={`text-2xl font-mono font-bold ${
                        isCrit ? 'text-red-600' : isWarn ? 'text-amber-700' : 'text-slate-900'
                      }`}>
                        {device.currentResistance.toFixed(2)}
                      </span>
                      <span className="text-sm font-mono font-semibold text-slate-500">Ω</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${comp.badgeClass}`}>
                      {comp.label}
                    </span>
                    <div className="text-[10px] text-slate-400 font-mono mt-1">
                      Limit: &lt; {device.targetMaxResistance}Ω
                    </div>
                  </div>
                </div>

                {/* Section: DEVICE HEALTH & COMMUNICATION */}
                <div className="space-y-1.5 text-xs text-slate-600 mb-3">
                  <div className="flex justify-between py-0.5">
                    <span className="text-slate-500">Wi-Fi / RSSI:</span>
                    <span className="font-medium text-slate-800">Connected ({device.rssi_dBm} dBm)</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-slate-500">DC Bus / Battery:</span>
                    <span className="font-mono text-slate-800">{device.batteryVoltage_V} V (Mains)</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-slate-500">Soil Temperature:</span>
                    <span className="font-mono text-slate-800">{device.soilTemperature_C}°C</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-slate-500">Electrode:</span>
                    <span className="text-slate-800 font-medium truncate max-w-[150px]">{device.electrodeType.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-slate-500">MAC Address:</span>
                    <span className="font-mono text-slate-600 text-[11px]">{device.macAddress}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setSelectedDeviceForDiagnostics(device)}
                  className="flex-1 px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Wrench className="w-3.5 h-3.5 text-slate-500" />
                  <span>Diagnostics</span>
                </button>

                <button
                  onClick={() => {
                    onSelectDevice(device.id);
                    onNavigateToTab('overview');
                  }}
                  className="px-3 py-1.5 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold transition-colors flex items-center gap-1"
                >
                  <span>Live</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Diagnostics Modal */}
      {selectedDeviceForDiagnostics && (
        <DeviceDiagnosticModal
          device={selectedDeviceForDiagnostics}
          onClose={() => setSelectedDeviceForDiagnostics(null)}
          onCalibrate={handleCalibrate}
        />
      )}

    </div>
  );
};
