import React, { useState } from 'react';
import { SystemAlarm, AlarmStatus } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Check, 
  Wrench, 
  Clock, 
  Cpu, 
  Building2,
  X
} from 'lucide-react';

interface AlarmsViewProps {
  alarms: SystemAlarm[];
  onAcknowledge: (alarmId: string, actorName: string, notes: string) => void;
  onResolve: (alarmId: string, actorName: string, actionNote: string) => void;
}

export const AlarmsView: React.FC<AlarmsViewProps> = ({
  alarms,
  onAcknowledge,
  onResolve
}) => {
  const { currentUser } = useAuth();
  const [statusFilter, setStatusFilter] = useState<'ALL' | AlarmStatus>('ALL');
  const [selectedAlarmForAck, setSelectedAlarmForAck] = useState<SystemAlarm | null>(null);
  const [selectedAlarmForResolve, setSelectedAlarmForResolve] = useState<SystemAlarm | null>(null);
  const [ackNotes, setAckNotes] = useState('');
  const [resolveNotes, setResolveNotes] = useState('');

  const filteredAlarms = alarms.filter(a => {
    if (statusFilter === 'ALL') return true;
    return a.status === statusFilter;
  });

  const handleAckSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlarmForAck) return;
    onAcknowledge(selectedAlarmForAck.id, currentUser.name, ackNotes || 'Acknowledged by duty engineer. Dispatching inspection crew.');
    setSelectedAlarmForAck(null);
    setAckNotes('');
  };

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlarmForResolve) return;
    onResolve(selectedAlarmForResolve.id, currentUser.name, resolveNotes || 'Earth pit rehydrated and earth resistance verified below standard threshold.');
    setSelectedAlarmForResolve(null);
    setResolveNotes('');
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            Alerts & Field Incident Console
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Active earth resistance excursions, open circuit disconnects, and statutory incident logs.
          </p>
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center space-x-1 text-xs">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              statusFilter === 'ALL'
                ? 'bg-slate-900 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({alarms.length})
          </button>
          <button
            onClick={() => setStatusFilter('ACTIVE')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              statusFilter === 'ACTIVE'
                ? 'bg-red-100 text-red-900 font-semibold'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            Active ({alarms.filter(a => a.status === 'ACTIVE').length})
          </button>
          <button
            onClick={() => setStatusFilter('ACKNOWLEDGED')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              statusFilter === 'ACKNOWLEDGED'
                ? 'bg-amber-100 text-amber-900 font-semibold'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            Acknowledged ({alarms.filter(a => a.status === 'ACKNOWLEDGED').length})
          </button>
          <button
            onClick={() => setStatusFilter('RESOLVED')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              statusFilter === 'RESOLVED'
                ? 'bg-emerald-100 text-emerald-900 font-semibold'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            Resolved ({alarms.filter(a => a.status === 'RESOLVED').length})
          </button>
        </div>
      </div>

      {/* Alarms List */}
      <div className="space-y-4">
        {filteredAlarms.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-lg p-10 text-center shadow-2xs">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
            <span className="text-slate-900 font-semibold block text-sm">No Active Alerts</span>
            <span className="text-slate-500 text-xs">All monitored earth electrodes are within safe operating limits.</span>
          </div>
        ) : (
          filteredAlarms.map((alarm) => {
            const isCrit = alarm.severity === 'CRITICAL';
            const isActive = alarm.status === 'ACTIVE';
            const isAck = alarm.status === 'ACKNOWLEDGED';

            return (
              <div
                key={alarm.id}
                className={`bg-white border rounded-lg p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${
                  isActive && isCrit 
                    ? 'border-red-300' 
                    : isActive 
                    ? 'border-amber-300' 
                    : 'border-slate-200'
                }`}
              >
                <div className="space-y-1.5 max-w-2xl text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                      isCrit 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-amber-100 text-amber-900'
                    }`}>
                      {alarm.severity}
                    </span>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase border ${
                      isActive 
                        ? 'bg-red-50 text-red-700 border-red-200' 
                        : isAck 
                        ? 'bg-amber-50 text-amber-800 border-amber-200' 
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {alarm.status}
                    </span>

                    <span className="font-bold text-slate-900">
                      {alarm.deviceId} · {alarm.deviceLabel}
                    </span>
                  </div>

                  <h4 className="font-semibold text-sm text-slate-900 pt-0.5">
                    {alarm.message}
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px] text-slate-600">
                    <div>
                      <span className="text-slate-400 font-sans block text-[10px]">Measured:</span>
                      <strong className="text-red-700 font-bold">{alarm.measuredValue.toFixed(2)} Ω</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-sans block text-[10px]">Warning Limit:</span>
                      <span className="text-slate-800">{alarm.thresholdValue} Ω</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-sans block text-[10px]">Facility:</span>
                      <span className="text-slate-800 font-sans truncate block">{alarm.siteName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-sans block text-[10px]">Triggered:</span>
                      <span className="text-slate-800">{new Date(alarm.triggeredAt).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  {/* Notes / Resolution history */}
                  {alarm.ackNotes && (
                    <div className="text-[11px] text-amber-900 bg-amber-50 p-2.5 rounded border border-amber-200 mt-2 font-sans">
                      <strong>Acknowledged by {alarm.acknowledgedBy}:</strong> {alarm.ackNotes}
                    </div>
                  )}

                  {alarm.resolutionAction && (
                    <div className="text-[11px] text-emerald-900 bg-emerald-50 p-2.5 rounded border border-emerald-200 mt-2 font-sans">
                      <strong>Resolved by {alarm.resolvedBy}:</strong> {alarm.resolutionAction}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 self-end md:self-center">
                  {isActive && (
                    <button
                      onClick={() => setSelectedAlarmForAck(alarm)}
                      className="px-3 py-1.5 rounded-md bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-colors flex items-center gap-1 shadow-2xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Acknowledge</span>
                    </button>
                  )}

                  {(isActive || isAck) && (
                    <button
                      onClick={() => setSelectedAlarmForResolve(alarm)}
                      className="px-3 py-1.5 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors flex items-center gap-1 shadow-2xs"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Resolve & Close</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Acknowledge Modal */}
      {selectedAlarmForAck && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleAckSubmit} className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 shadow-xl text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-600" />
                Acknowledge Alert
              </h3>
              <button type="button" onClick={() => setSelectedAlarmForAck(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-slate-600 text-xs">
              Confirming receipt of alert for <strong>{selectedAlarmForAck.deviceId}</strong> ({selectedAlarmForAck.measuredValue}Ω).
            </p>
            <div>
              <label className="block text-slate-700 mb-1 font-medium">Engineer Notes / Dispatch Reference:</label>
              <textarea
                value={ackNotes}
                onChange={(e) => setAckNotes(e.target.value)}
                placeholder="e.g. Dispatched Electrical Maintenance Tech Marcus Brody to inspect earth pit bonding clamp..."
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedAlarmForAck(null)}
                className="px-3 py-1.5 rounded-md bg-slate-100 text-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-md bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-2xs"
              >
                Confirm Acknowledge
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Resolve Modal */}
      {selectedAlarmForResolve && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleResolveSubmit} className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 shadow-xl text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-emerald-700" />
                Log Corrective Action & Close Alert
              </h3>
              <button type="button" onClick={() => setSelectedAlarmForResolve(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-slate-600 text-xs">
              Record physical corrective action taken at <strong>{selectedAlarmForResolve.deviceLabel}</strong>.
            </p>
            <div>
              <label className="block text-slate-700 mb-1 font-medium">Corrective Action Taken:</label>
              <textarea
                value={resolveNotes}
                onChange={(e) => setResolveNotes(e.target.value)}
                placeholder="e.g. Injected 20L electrolyte solution into backfill chamber, tightened copper bonding lug to 35Nm, verified contact resistance dropped to 0.58Ω..."
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedAlarmForResolve(null)}
                className="px-3 py-1.5 rounded-md bg-slate-100 text-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white font-semibold shadow-2xs"
              >
                Resolve & Close Incident
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
