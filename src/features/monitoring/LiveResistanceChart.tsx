import React, { useState, useMemo } from 'react';
import { TelemetryReading } from '../../types';

interface LiveResistanceChartProps {
  readings: TelemetryReading[];
  warningThreshold: number;
  criticalThreshold: number;
  currentValue: number;
  deviceLabel: string;
}

export type TimeRange = '1H' | '6H' | '24H' | '7D' | '30D';

export const LiveResistanceChart: React.FC<LiveResistanceChartProps> = ({
  readings,
  warningThreshold,
  criticalThreshold,
  currentValue,
  deviceLabel
}) => {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('24H');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Filter or scale readings according to time range
  const chartPoints = useMemo(() => {
    if (!readings || readings.length === 0) {
      // Fallback points around current value
      return Array.from({ length: 24 }).map((_, i) => ({
        timestamp: new Date(Date.now() - (23 - i) * 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        value: Number((currentValue + (Math.sin(i / 2) * 0.08)).toFixed(3)),
        status: 'COMPLIANT'
      }));
    }

    const count = selectedRange === '1H' ? 12 : selectedRange === '6H' ? 18 : selectedRange === '24H' ? 24 : 30;
    const sampled = readings.slice(-count);

    return sampled.map((r, i) => ({
      timestamp: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      value: r.earthResistance,
      status: r.complianceStatus
    }));
  }, [readings, selectedRange, currentValue]);

  // Chart dimensions & calculations
  const width = 800;
  const height = 260;
  const padding = { top: 25, right: 60, bottom: 35, left: 55 };

  const values = chartPoints.map(p => p.value);
  const minVal = 0;
  const maxVal = Math.max(criticalThreshold * 1.25, Math.max(...values, 1.2));

  const getX = (index: number) => {
    const availableWidth = width - padding.left - padding.right;
    return padding.left + (index / Math.max(1, chartPoints.length - 1)) * availableWidth;
  };

  const getY = (val: number) => {
    const availableHeight = height - padding.top - padding.bottom;
    const clamped = Math.max(minVal, Math.min(maxVal, val));
    return height - padding.bottom - ((clamped - minVal) / (maxVal - minVal)) * availableHeight;
  };

  // SVG Path Data
  const pathD = useMemo(() => {
    if (chartPoints.length === 0) return '';
    return chartPoints.reduce((acc, pt, i) => {
      const x = getX(i);
      const y = getY(pt.value);
      return i === 0 ? `M ${x},${y}` : `${acc} L ${x},${y}`;
    }, '');
  }, [chartPoints, maxVal]);

  const areaD = useMemo(() => {
    if (chartPoints.length === 0) return '';
    const firstX = getX(0);
    const lastX = getX(chartPoints.length - 1);
    const baseY = height - padding.bottom;
    return `${pathD} L ${lastX},${baseY} L ${firstX},${baseY} Z`;
  }, [pathD, chartPoints, maxVal]);

  const warningY = getY(warningThreshold);
  const criticalY = getY(criticalThreshold);

  // Y-axis grid ticks (e.g. 4 ticks)
  const yTicks = [0, maxVal * 0.33, maxVal * 0.66, maxVal].map(v => Number(v.toFixed(2)));

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
      
      {/* Header & Range Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
              EARTH RESISTANCE TREND
            </h3>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
              {deviceLabel}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time measurement history & threshold boundaries
          </p>
        </div>

        {/* Range selectors */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-md text-xs self-start sm:self-auto">
          {(['1H', '6H', '24H', '7D', '30D'] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setSelectedRange(range)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                selectedRange === range
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="relative pt-4 overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id="instrumentAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Background Grid Lines & Ticks */}
          {yTicks.map((tickVal) => {
            const y = getY(tickVal);
            return (
              <g key={tickVal}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[10px] font-mono fill-slate-400 font-medium"
                >
                  {tickVal.toFixed(2)} Ω
                </text>
              </g>
            );
          })}

          {/* Warning Threshold Line */}
          {warningThreshold > 0 && warningY >= padding.top && warningY <= height - padding.bottom && (
            <g>
              <line
                x1={padding.left}
                y1={warningY}
                x2={width - padding.right}
                y2={warningY}
                stroke="#d97706"
                strokeWidth="1.2"
                strokeDasharray="4 3"
              />
              <text
                x={width - padding.right + 6}
                y={warningY + 3}
                className="text-[10px] font-mono fill-amber-700 font-semibold"
              >
                Warn: {warningThreshold}Ω
              </text>
            </g>
          )}

          {/* Critical Threshold Line */}
          {criticalThreshold > 0 && criticalY >= padding.top && criticalY <= height - padding.bottom && (
            <g>
              <line
                x1={padding.left}
                y1={criticalY}
                x2={width - padding.right}
                y2={criticalY}
                stroke="#dc2626"
                strokeWidth="1.2"
                strokeDasharray="4 3"
              />
              <text
                x={width - padding.right + 6}
                y={criticalY + 3}
                className="text-[10px] font-mono fill-red-700 font-semibold"
              >
                Limit: {criticalThreshold}Ω
              </text>
            </g>
          )}

          {/* Area Fill */}
          <path d={areaD} fill="url(#instrumentAreaGrad)" />

          {/* Main Trend Line */}
          <path
            d={pathD}
            fill="none"
            stroke="#2563eb"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive Points & Tooltips */}
          {chartPoints.map((pt, i) => {
            const cx = getX(i);
            const cy = getY(pt.value);
            const isHovered = hoverIndex === i;
            const isLast = i === chartPoints.length - 1;

            return (
              <g key={i}>
                {/* Transparent hit target */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={12}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoverIndex(i)}
                />

                {/* Point dot for last or hovered */}
                {(isHovered || isLast) && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isHovered ? 5 : 3.5}
                    className="fill-blue-600 stroke-white stroke-2 shadow-xs transition-all"
                  />
                )}

                {/* X-axis Ticks */}
                {(i === 0 || i === Math.floor(chartPoints.length / 2) || i === chartPoints.length - 1) && (
                  <text
                    x={cx}
                    y={height - 10}
                    textAnchor="middle"
                    className="text-[10px] font-mono fill-slate-400 font-medium"
                  >
                    {pt.timestamp}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoverIndex !== null && chartPoints[hoverIndex] && (
          <div
            className="absolute z-20 pointer-events-none bg-slate-900 text-white text-xs rounded shadow-lg p-2 font-mono"
            style={{
              left: `${Math.min(85, Math.max(10, (getX(hoverIndex) / width) * 100))}%`,
              top: '15px',
              transform: 'translateX(-50%)'
            }}
          >
            <div className="text-slate-300 text-[10px]">{chartPoints[hoverIndex].timestamp}</div>
            <div className="text-white font-bold text-sm">
              {chartPoints[hoverIndex].value.toFixed(3)} Ω
            </div>
            <div className="text-[10px] text-blue-300 uppercase mt-0.5">
              Status: {chartPoints[hoverIndex].status}
            </div>
          </div>
        )}
      </div>

      {/* Axis Information Footer */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-3 border-t border-slate-100 font-sans">
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-0.5 bg-blue-600 inline-block"></span>
            <span>Measured Resistance (Ω)</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-0.5 bg-amber-500 inline-block"></span>
            <span>Warning Boundary</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-0.5 bg-red-600 inline-block"></span>
            <span>Statutory Safety Limit</span>
          </span>
        </div>
        <span className="text-slate-400 font-mono text-[10px]">
          X: Continuous Ingestion · Y: Ohms (Ω)
        </span>
      </div>

    </div>
  );
};
