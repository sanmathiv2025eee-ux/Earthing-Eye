import React from 'react';
import { 
  Activity, 
  Cpu, 
  LineChart, 
  AlertTriangle, 
  Sliders, 
  Terminal, 
  Building, 
  FileCheck2,
  Radio
} from 'lucide-react';

export type NavTab = 
  | 'overview' 
  | 'devices' 
  | 'analytics' 
  | 'alarms' 
  | 'standards' 
  | 'commissioning' 
  | 'sites' 
  | 'audit';

interface NavigationProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  activeAlarmsCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  activeAlarmsCount
}) => {
  const tabs = [
    { id: 'overview', label: 'Live Monitoring', icon: Activity, badge: null },
    { id: 'devices', label: 'Device Fleet', icon: Cpu, badge: null },
    { id: 'analytics', label: 'Historical Trends', icon: LineChart, badge: null },
    { 
      id: 'alarms', 
      label: 'Alarms & Alerts', 
      icon: AlertTriangle, 
      badge: activeAlarmsCount > 0 ? activeAlarmsCount : null,
      badgeColor: 'bg-rose-500 text-white'
    },
    { id: 'standards', label: 'Thresholds & Standards', icon: Sliders, badge: null },
    { id: 'commissioning', label: 'ESP32 Gateway Hub', icon: Terminal, badge: 'DEV' },
    { id: 'sites', label: 'Sites & Grids', icon: Building, badge: null },
    { id: 'audit', label: 'Audit Trail', icon: FileCheck2, badge: null },
  ];

  return (
    <nav className="bg-[#090d16] border-b border-slate-800/80 sticky top-16 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2.5 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id as NavTab)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/40 shadow-sm shadow-amber-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${tab.badgeColor || 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
