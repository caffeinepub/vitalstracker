import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import type { VitalsReading } from '../backend';
import type { VitalsStatusMap } from '../utils/vitalsThresholds';

interface VitalsTrendChartProps {
  vitalKey: keyof VitalsStatusMap;
  label: string;
  unit: string;
  readings: VitalsReading[];
  color?: string;
  refMin?: number;
  refMax?: number;
}

function formatTimestamp(ts: bigint): string {
  const ms = Number(ts / BigInt(1_000_000));
  return new Date(ms).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

const CustomTooltip = ({ active, payload, label, unit }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-lg text-xs">
        <p className="text-muted-foreground mb-1">{label}</p>
        <p className="font-mono font-bold text-foreground">
          {payload[0].value?.toFixed(1)} <span className="font-normal text-muted-foreground">{unit}</span>
        </p>
      </div>
    );
  }
  return null;
};

export function VitalsTrendChart({
  vitalKey, label, unit, readings, color = '#2dd4bf', refMin, refMax
}: VitalsTrendChartProps) {
  const data = [...readings]
    .sort((a, b) => Number(a.timestamp - b.timestamp))
    .map((r) => ({
      time: formatTimestamp(r.timestamp),
      value: r[vitalKey] as number,
    }));

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
        No data available
      </div>
    );
  }

  return (
    <div className="w-full">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">{label}</p>
      <ResponsiveContainer width="100%" height={140}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.02 240)" vertical={false} />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 10, fill: 'oklch(0.58 0.02 230)' }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 10, fill: 'oklch(0.58 0.02 230)', fontFamily: 'JetBrains Mono' }}
            tickLine={false}
            axisLine={false}
            width={40}
          />
          {refMin !== undefined && (
            <ReferenceLine y={refMin} stroke="oklch(0.72 0.18 145 / 0.4)" strokeDasharray="4 4" />
          )}
          {refMax !== undefined && (
            <ReferenceLine y={refMax} stroke="oklch(0.72 0.18 145 / 0.4)" strokeDasharray="4 4" />
          )}
          <Tooltip content={<CustomTooltip unit={unit} />} />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={data.length <= 20 ? { fill: color, r: 3, strokeWidth: 0 } : false}
            activeDot={{ r: 5, fill: color, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
