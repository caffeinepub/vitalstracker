import { Heart, Activity, Droplets, Thermometer, Wind, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { VitalStatus } from '../utils/vitalsThresholds';
import { getReferenceRange } from '../utils/vitalsThresholds';
import type { VitalsStatusMap } from '../utils/vitalsThresholds';

interface VitalCardProps {
  vitalKey: keyof VitalsStatusMap;
  label: string;
  value: string | null;
  unit: string;
  status: VitalStatus;
  isLoading?: boolean;
}

const iconMap = {
  heartRate: Heart,
  systolicBP: Activity,
  diastolicBP: Activity,
  spo2: Droplets,
  temperature: Thermometer,
  respiratoryRate: Wind,
};

const statusConfig = {
  normal: {
    badge: 'bg-status-normal-bg text-status-normal border border-status-normal/30',
    glow: 'shadow-card',
    dot: 'bg-status-normal',
    label: 'Normal',
  },
  warning: {
    badge: 'bg-status-warning-bg text-status-warning border border-status-warning/30',
    glow: 'shadow-card-warning',
    dot: 'bg-status-warning',
    label: 'Warning',
  },
  critical: {
    badge: 'bg-status-critical-bg text-status-critical border border-status-critical/30',
    glow: 'shadow-card-critical',
    dot: 'bg-status-critical',
    label: 'Critical',
  },
};

export function VitalCard({ vitalKey, label, value, unit, status, isLoading }: VitalCardProps) {
  const Icon = iconMap[vitalKey];
  const config = statusConfig[status];
  const refRange = getReferenceRange(vitalKey);

  return (
    <Card className={`bg-card border-border transition-all duration-300 ${config.glow} hover:scale-[1.01]`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-teal/10 border border-teal/20 flex items-center justify-center">
              <Icon className="w-4.5 h-4.5 text-teal" strokeWidth={2} />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
            </div>
          </div>
          {!isLoading && value !== null && (
            <span className={`flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${config.badge}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${config.dot} ${status !== 'normal' ? 'pulse-dot' : ''}`} />
              {config.label}
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-2">
            <div className="h-9 w-24 bg-muted/50 rounded animate-pulse" />
            <div className="h-3 w-16 bg-muted/30 rounded animate-pulse" />
          </div>
        ) : value === null ? (
          <div className="space-y-1">
            <p className="text-3xl font-bold font-mono text-muted-foreground">—</p>
            <p className="text-xs text-muted-foreground">No data</p>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold font-mono text-foreground">{value}</span>
              <span className="text-sm text-muted-foreground font-medium">{unit}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3" />
              <span>Ref: {refRange}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
