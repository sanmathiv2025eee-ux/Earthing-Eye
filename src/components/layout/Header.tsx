import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  UserCheck, 
  Clock, 
  ChevronDown, 
  Bell, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon,
  Menu,
  X
} from 'lucide-react';
import { IndustrialSite, UserRole } from '../../types';
import { useAuth } from '../../hooks/useAuth';

interface HeaderProps {
  sites: IndustrialSite[];
  selectedSiteId: string;
  onSelectSite: (id: string) => void;
  activeAlarmsCount: number;
  criticalAlarmsCount: number;
  isAudioMuted: boolean;
  onToggleAudio: () => void;
  lastTelemetryTimestamp: number;
  isIngesting: boolean;
  onOpenAlarmView: () => void;
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  sites,
  selectedSiteId,
  onSelectSite,
  activeAlarmsCount,
  criticalAlarmsCount,
  isAudioMuted,
  onToggleAudio,
  onOpenAlarmView,
  onToggleMobileMenu,
  isMobileMenuOpen
}) => {
  const { currentUser, switchRole, rolesList } = useAuth();
  const [timeStr, setTimeStr] = useState<string>('');
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toTimeString().split(' ')[0]);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const currentSite = sites.find(s => s.id === selectedSiteId) || sites[0];

  return (
    <header className="bg-white border-b border-slate-200 text-slate-800 sticky top-0 z-40 shadow-xs">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          
          {/* LEFT: Logo & Branding */}
          <div className="flex items-center space-x-3">
            {onToggleMobileMenu && (
              <button
                onClick={onToggleMobileMenu}
                className="lg:hidden p-1.5 rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                aria-label="Toggle Navigation Menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}

            <div className="flex items-center space-x-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded bg-blue-700 text-white font-semibold shadow-xs">
                <span className="text-lg leading-none select-none">⏚</span>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-base tracking-tight text-slate-900 leading-tight">
                    EARTHGUARD
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium leading-none mt-0.5">
                  Earth Resistance Monitoring
                </p>
              </div>
            </div>
          </div>

          {/* CENTER: Current Site / Facility Selector */}
          <div className="hidden md:flex items-center">
            <div className="flex items-center space-x-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-md text-xs transition-colors">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-slate-500 font-medium">Facility:</span>
              <select
                value={selectedSiteId}
                onChange={(e) => onSelectSite(e.target.value)}
                className="bg-transparent text-slate-900 font-semibold focus:outline-none cursor-pointer border-none pr-1"
              >
                <option value="ALL">All Monitored Facilities (Fleet)</option>
                {sites.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* RIGHT: System Status, Time, Notifications, User Profile */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            
            {/* System Status Pill */}
            {criticalAlarmsCount > 0 ? (
              <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                <span>CRITICAL ALERTS</span>
              </div>
            ) : activeAlarmsCount > 0 ? (
              <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>SYSTEM WARNING</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                <span>SYSTEM NORMAL</span>
              </div>
            )}

            {/* Current Time */}
            <div className="hidden xl:flex items-center space-x-1.5 text-xs font-mono text-slate-600 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{timeStr || '10:24:18'}</span>
            </div>

            {/* Notifications / Alerts Button */}
            <button
              onClick={onOpenAlarmView}
              className="relative p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
              title="View Alerts"
            >
              <Bell className="w-4 h-4" />
              {activeAlarmsCount > 0 && (
                <span className={`absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold text-white ${
                  criticalAlarmsCount > 0 ? 'bg-red-600' : 'bg-amber-600'
                }`}>
                  {activeAlarmsCount}
                </span>
              )}
            </button>

            {/* Audio Alert Toggle */}
            <button
              onClick={onToggleAudio}
              className={`p-1.5 rounded-md border text-xs transition-colors ${
                isAudioMuted 
                  ? 'bg-slate-50 text-slate-400 border-slate-200' 
                  : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
              }`}
              title={isAudioMuted ? 'Sound alert muted' : 'Sound alert enabled'}
            >
              {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* User Profile */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center space-x-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md text-xs transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="font-semibold text-slate-900 truncate max-w-[120px] leading-tight">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate max-w-[120px] leading-none">
                    {currentUser.role.replace(/_/g, ' ')}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Role Dropdown */}
              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-lg shadow-lg py-2 z-50">
                  <div className="px-3 py-1.5 border-b border-slate-100">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Engineer Role Profile</p>
                    <p className="text-[10px] text-slate-400">Select active credential identity</p>
                  </div>
                  {rolesList.map((item) => (
                    <button
                      key={item.role}
                      onClick={() => {
                        switchRole(item.role);
                        setShowRoleMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-50 transition-colors flex flex-col ${
                        currentUser.role === item.role ? 'bg-blue-50/70 border-l-2 border-blue-600' : ''
                      }`}
                    >
                      <span className="font-semibold text-slate-900">{item.title}</span>
                      <span className="text-[11px] text-slate-500 mt-0.5">{item.description}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
