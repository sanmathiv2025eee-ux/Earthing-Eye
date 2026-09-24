import React, { useState } from 'react';
import { AuditLogEntry } from '../../types';
import { 
  FileCheck2, 
  Search, 
  Download 
} from 'lucide-react';

interface AuditLogViewProps {
  logs: AuditLogEntry[];
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');

  const filteredLogs = (logs || []).filter(log => {
    const matchesSearch = 
      log.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.deviceId && log.deviceId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.sha256VerificationHash.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;

    return matchesSearch && matchesAction;
  });

  const handleExportAuditCSV = () => {
    const headers = ['Timestamp', 'Action', 'Actor_Name', 'Actor_Role', 'Device_ID', 'Details', 'SHA256_Checksum'];
    const rows = filteredLogs.map(l => [
      l.timestamp,
      l.action,
      `"${l.actorName}"`,
      l.actorRole,
      l.deviceId || '',
      `"${l.details.replace(/"/g, '""')}"`,
      l.sha256VerificationHash
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `EARTHGUARD_Statutory_Audit_Trail_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-blue-700" />
            Statutory Compliance Audit Log & Cryptographic Proof
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Append-only tamper-evident verification ledger compliant with ISO 50001, OSHA 1910.304, and IEEE 80.
          </p>
        </div>

        <button
          onClick={handleExportAuditCSV}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-white hover:bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium transition-colors shadow-2xs self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Export Ledger CSV</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Engineer, Node ID, details, or SHA-256 hash..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-md pl-9 pr-3 py-1.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
        </div>

        {/* Action Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-slate-500 font-medium">Filter Action:</span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
          >
            <option value="ALL">All Recorded Actions</option>
            <option value="DEVICE_COMMISSIONED">Device Commissioned</option>
            <option value="CALIBRATION_PERFORMED">Calibration Performed</option>
            <option value="THRESHOLD_UPDATED">Threshold Updated</option>
            <option value="ALARM_ACKNOWLEDGED">Alarm Acknowledged</option>
            <option value="ALARM_RESOLVED">Alarm Resolved</option>
            <option value="MAINTENANCE_LOGGED">Maintenance Logged</option>
            <option value="COMPLIANCE_AUDIT_EXPORTED">Compliance Audit Exported</option>
          </select>
        </div>

      </div>

      {/* Audit Log Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-semibold">
                <th className="py-2.5 px-4">Timestamp (UTC)</th>
                <th className="py-2.5 px-3">Event Action</th>
                <th className="py-2.5 px-3">Actor & Role</th>
                <th className="py-2.5 px-3">Target Node</th>
                <th className="py-2.5 px-4">Event Details & Notes</th>
                <th className="py-2.5 px-4 text-right">Cryptographic SHA-256</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString()}
                  </td>

                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold font-mono bg-slate-100 text-slate-700 border border-slate-200">
                      {log.action}
                    </span>
                  </td>

                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="font-semibold text-slate-900">{log.actorName}</div>
                    <div className="text-[10px] text-slate-400">{log.actorRole.replace(/_/g, ' ')}</div>
                  </td>

                  <td className="py-3 px-3 font-mono font-semibold text-slate-800 whitespace-nowrap">
                    {log.deviceId || 'GRID-WIDE'}
                  </td>

                  <td className="py-3 px-4 text-slate-700 max-w-md">
                    {log.details}
                  </td>

                  <td className="py-3 px-4 text-right font-mono text-[10px] text-slate-400 whitespace-nowrap">
                    <span className="bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200 text-slate-600" title={log.sha256VerificationHash}>
                      {log.sha256VerificationHash.slice(0, 10)}...{log.sha256VerificationHash.slice(-6)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
