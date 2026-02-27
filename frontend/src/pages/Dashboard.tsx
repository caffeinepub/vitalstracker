import { useState, useEffect } from 'react';
import { RefreshCw, Clock, Activity, Radio, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VitalCard } from '../components/VitalCard';
import { AlertsContainer } from '../components/VitalsAlertBanner';
import { useLatestReading } from '../hooks/useQueries';
import { useAutonomousMonitor } from '../hooks/useAutonomousMonitor';
import { evaluateVitals, VITAL_INFOS } from '../utils/vitalsThresholds';
import type { VitalsStatusMap } from '../utils/vitalsThresholds';

interface AlertItem {
  id: string;
  vitalLabel: string;
  value: string;
  unit: string;
  severity: 'warning' | 'critical';
}

function formatTimestamp(ts: bigint): string {
  const ms = Number(ts / BigInt(1_000_000));
  return new Date(ms).toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.floor(minutes / 60)}h ago`;
}

export function Dashboard() {
  const { data: reading, isLoading, refetch } = useLatestReading();
  const { isActive, lastRecordedAt, nextRecordingIn, error: monitorError } = useAutonomousMonitor();
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const [lastReadingTs, setLastReadingTs] = useState<bigint | null>(null);
  const [, forceUpdate] = useState(0);

  // Tick every second to keep "time ago" fresh
  useEffect(() => {
    const t = setInterval(() => forceUpdate((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Reset dismissed alerts when a new reading arrives
  useEffect(() => {
    if (reading && reading.timestamp !== lastReadingTs) {
      setLastReadingTs(reading.timestamp);
      setDismissedAlerts(new Set());
    }
  }, [reading, lastReadingTs]);

  const statuses = reading ? evaluateVitals(reading) : null;

  const activeAlerts: AlertItem[] = [];
  if (reading && statuses) {
    VITAL_INFOS.forEach((info) => {
      const key = info.key as keyof VitalsStatusMap;
      const status = statuses[key];
      if (status !== 'normal') {
        const alertId = `${key}-${reading.timestamp}`;
        if (!dismissedAlerts.has(alertId)) {
          activeAlerts.push({
            id: alertId,
            vitalLabel: info.label,
            value: info.format(reading[info.key] as number),
            unit: info.unit,
            severity: status,
          });
        }
      }
    });
  }

  const handleDismiss = (id: string) => {
    setDismissedAlerts((prev) => new Set([...prev, id]));
  };

  const monitoringActive = isActive && !monitorError;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Live Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Vitals are measured and recorded automatically — no manual input required.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isLoading}
          className="gap-2 border-border hover:bg-secondary self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Autonomous Monitoring Status Card */}
      <div
        className={`mb-6 p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center gap-4 transition-colors ${
          monitoringActive
            ? 'bg-teal/5 border-teal/25 card-glow-teal'
            : monitorError
            ? 'bg-destructive/5 border-destructive/25'
            : 'bg-card border-border'
        }`}
      >
        {/* Status indicator */}
        <div className="flex items-center gap-3 flex-1">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
              monitoringActive ? 'bg-teal/15' : 'bg-muted'
            }`}
          >
            <Radio
              className={`w-5 h-5 ${monitoringActive ? 'text-teal' : 'text-muted-foreground'}`}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-sm font-semibold ${
                  monitoringActive ? 'text-teal' : 'text-muted-foreground'
                }`}
              >
                {monitoringActive ? 'Autonomous Monitoring Active' : monitorError ? 'Monitoring Error' : 'Initialising…'}
              </span>
              {monitoringActive && (
                <span className="w-2 h-2 rounded-full bg-teal pulse-dot" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {monitorError
                ? monitorError
                : 'Readings are captured automatically every 30 seconds'}
            </p>
          </div>
        </div>

        {/* Timing stats */}
        <div className="flex items-center gap-6 text-xs font-mono">
          <div className="flex flex-col items-start sm:items-end gap-0.5">
            <span className="text-muted-foreground uppercase tracking-wider text-[10px]">Last recorded</span>
            <span className="text-foreground font-medium">
              {lastRecordedAt ? timeAgo(lastRecordedAt) : '—'}
            </span>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-0.5">
            <span className="text-muted-foreground uppercase tracking-wider text-[10px] flex items-center gap-1">
              <Timer className="w-3 h-3" />
              Next reading
            </span>
            <span
              className={`font-semibold tabular-nums ${
                monitoringActive ? 'text-teal' : 'text-muted-foreground'
              }`}
            >
              {monitoringActive ? `${nextRecordingIn}s` : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Alerts */}
      <AlertsContainer alerts={activeAlerts} onDismiss={handleDismiss} />

      {/* Loading / no data state */}
      {!isLoading && !reading && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-teal/10 border border-teal/20 flex items-center justify-center mb-4">
            <Activity className="w-8 h-8 text-teal" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">Waiting for first reading…</h2>
          <p className="text-sm text-muted-foreground max-w-sm">
            The monitoring system is active. Your first reading will appear here automatically within a few seconds.
          </p>
        </div>
      )}

      {/* Vital cards grid */}
      {(isLoading || reading) && (
        <>
          {reading && (
            <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground font-mono">
              <Clock className="w-3.5 h-3.5" />
              Latest reading: {formatTimestamp(reading.timestamp)}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {VITAL_INFOS.map((info) => {
              const key = info.key as keyof VitalsStatusMap;
              const value = reading ? info.format(reading[info.key] as number) : null;
              const status = statuses ? statuses[key] : 'normal';

              return (
                <VitalCard
                  key={info.key}
                  vitalKey={key}
                  label={info.label}
                  value={value}
                  unit={info.unit}
                  status={status}
                  isLoading={isLoading}
                />
              );
            })}
          </div>

          {/* Summary bar */}
          {reading && statuses && (
            <div className="mt-6 p-4 rounded-xl border border-border bg-card flex flex-wrap gap-4 items-center">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Overall Status:</span>
              {Object.values(statuses).every((s) => s === 'normal') ? (
                <span className="flex items-center gap-1.5 text-sm font-semibold text-status-normal">
                  <span className="w-2 h-2 rounded-full bg-status-normal" />
                  All vitals within normal range
                </span>
              ) : Object.values(statuses).includes('critical') ? (
                <span className="flex items-center gap-1.5 text-sm font-semibold text-status-critical">
                  <span className="w-2 h-2 rounded-full bg-status-critical pulse-dot" />
                  Critical values detected — seek medical attention
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-sm font-semibold text-status-warning">
                  <span className="w-2 h-2 rounded-full bg-status-warning pulse-dot" />
                  Some values outside normal range — monitor closely
                </span>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
