import { AlertTriangle, XCircle, X } from 'lucide-react';
import type { VitalStatus } from '../utils/vitalsThresholds';

interface VitalsAlertBannerProps {
  vitalLabel: string;
  value: string;
  unit: string;
  severity: 'warning' | 'critical';
  onDismiss: () => void;
}

export function VitalsAlertBanner({ vitalLabel, value, unit, severity, onDismiss }: VitalsAlertBannerProps) {
  const isWarning = severity === 'warning';

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-medium animate-fade-in ${
        isWarning
          ? 'bg-status-warning-bg border-status-warning/40 text-status-warning'
          : 'bg-status-critical-bg border-status-critical/40 text-status-critical'
      }`}
    >
      <div className="flex-shrink-0">
        {isWarning ? (
          <AlertTriangle className="w-4 h-4" />
        ) : (
          <XCircle className="w-4 h-4" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <span className="font-semibold">{severity === 'critical' ? 'CRITICAL' : 'WARNING'}</span>
        {' — '}
        <span>{vitalLabel}</span>
        {': '}
        <span className="font-mono font-bold">{value} {unit}</span>
        <span className="ml-2 font-normal opacity-80">
          {isWarning ? 'is outside normal range' : 'requires immediate attention'}
        </span>
      </div>
      <button
        onClick={onDismiss}
        className="flex-shrink-0 p-0.5 rounded hover:opacity-70 transition-opacity"
        aria-label="Dismiss alert"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

interface AlertsContainerProps {
  alerts: Array<{
    id: string;
    vitalLabel: string;
    value: string;
    unit: string;
    severity: 'warning' | 'critical';
  }>;
  onDismiss: (id: string) => void;
}

export function AlertsContainer({ alerts, onDismiss }: AlertsContainerProps) {
  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2 mb-6">
      {alerts.map((alert) => (
        <VitalsAlertBanner
          key={alert.id}
          vitalLabel={alert.vitalLabel}
          value={alert.value}
          unit={alert.unit}
          severity={alert.severity}
          onDismiss={() => onDismiss(alert.id)}
        />
      ))}
    </div>
  );
}
