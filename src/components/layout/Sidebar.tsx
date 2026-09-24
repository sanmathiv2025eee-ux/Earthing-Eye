import React from 'react';
import { 
  LayoutDashboard, 
  Activity, 
  Cpu, 
  Building2, 
  Clock, 
  AlertTriangle, 
  BarChart3, 
  Terminal, 
  FileCheck2, 
  Settings
} from 'lucide-react';

export type NavTab = 
  | 'overview' 
  | 'live'
  | 'devices' 
  | 'sites' 
  | 'history' 
  | 'alerts' 
  | 'analytics' 
  | 'commissioning' 
  | 'audit' 
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  activeAlarmsCount: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  activeAlarmsCount,
  isOpenMobile = false,
  onCloseMobile
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'live', label: 'Live Monitoring', icon: <Activity className="w-4 h-4" /> },
    { id: 'devices', label: 'Devices', icon: <Cpu className="w-4 h-4" /> },
    { id: 'sites', label: 'Sites', icon: <Building2 className="w-4 h-4" /> },
    { id: 'history', label: 'History', icon: <Clock className="w-4 h-4" /> },
    { id: 'alerts', label: 'Alerts', icon: <AlertTriangle className="w-4 h-4" />, badge: activeAlarmsCount },
    { id: 'analytics', label: 'Analytics & Standards', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'commissioning', label: 'Commissioning', icon: <Terminal className="w-4 h-4" /> },
    { id: 'audit', label: 'Audit Log', icon: <FileCheck2 className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const content = (
    <div className="flex flex-col h-full py-4 px-3">
      {/* Navigation Group Header */}
      <div className="px-3 pb-2 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        System Navigation
      </div>

      <nav className="space-y-1 flex-1">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectTab(item.id);
                if (onCloseMobile) onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <span className={isActive ? 'text-blue-700' : 'text-slate-400'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && item.badge > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Hardware Architecture Badge */}
      <div className="mt-auto pt-3 border-t border-slate-200/80 px-2 text-[11px] text-slate-500">
        <div className="font-semibold text-slate-700">ESP32 Telemetry Engine</div>
        <div className="text-[10px] text-slate-400 mt-0.5">IEEE Std 80 Grounding Safety</div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 bg-white border-r border-slate-200 flex-shrink-0 min-h-[calc(100vh-64px)]">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-64 max-w-[80vw] bg-white h-full shadow-xl flex flex-col z-10">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
