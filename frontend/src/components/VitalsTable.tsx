import { useState } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import type { VitalsReading } from '../backend';
import { evaluateVitals } from '../utils/vitalsThresholds';

interface VitalsTableProps {
  readings: VitalsReading[];
}

function formatTimestamp(ts: bigint): string {
  const ms = Number(ts / BigInt(1_000_000));
  return new Date(ms).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

const statusDot: Record<string, string> = {
  normal: 'bg-status-normal',
  warning: 'bg-status-warning',
  critical: 'bg-status-critical',
};

export function VitalsTable({ readings }: VitalsTableProps) {
  const [sortAsc, setSortAsc] = useState(false);

  const sorted = [...readings].sort((a, b) => {
    const diff = Number(a.timestamp - b.timestamp);
    return sortAsc ? diff : -diff;
  });

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground font-medium">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 font-medium text-muted-foreground hover:text-foreground gap-1.5"
                  onClick={() => setSortAsc(!sortAsc)}
                >
                  Timestamp
                  {sortAsc ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />}
                </Button>
              </TableHead>
              <TableHead className="text-muted-foreground font-medium text-right">HR (bpm)</TableHead>
              <TableHead className="text-muted-foreground font-medium text-right">Sys BP</TableHead>
              <TableHead className="text-muted-foreground font-medium text-right">Dia BP</TableHead>
              <TableHead className="text-muted-foreground font-medium text-right">SpO₂ (%)</TableHead>
              <TableHead className="text-muted-foreground font-medium text-right">Temp (°C)</TableHead>
              <TableHead className="text-muted-foreground font-medium text-right">RR (br/min)</TableHead>
              <TableHead className="text-muted-foreground font-medium text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-12">
                  No readings found for the selected range.
                </TableCell>
              </TableRow>
            ) : (
              sorted.map((reading, idx) => {
                const statuses = evaluateVitals(reading);
                const overallStatus = Object.values(statuses).includes('critical')
                  ? 'critical'
                  : Object.values(statuses).includes('warning')
                  ? 'warning'
                  : 'normal';

                return (
                  <TableRow key={idx} className="border-border hover:bg-secondary/30 transition-colors">
                    <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                      {formatTimestamp(reading.timestamp)}
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium">
                      <span className={statuses.heartRate !== 'normal' ? `text-status-${statuses.heartRate}` : ''}>
                        {reading.heartRate.toFixed(0)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium">
                      <span className={statuses.systolicBP !== 'normal' ? `text-status-${statuses.systolicBP}` : ''}>
                        {reading.systolicBP.toFixed(0)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium">
                      <span className={statuses.diastolicBP !== 'normal' ? `text-status-${statuses.diastolicBP}` : ''}>
                        {reading.diastolicBP.toFixed(0)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium">
                      <span className={statuses.spo2 !== 'normal' ? `text-status-${statuses.spo2}` : ''}>
                        {reading.spo2.toFixed(1)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium">
                      <span className={statuses.temperature !== 'normal' ? `text-status-${statuses.temperature}` : ''}>
                        {reading.temperature.toFixed(1)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium">
                      <span className={statuses.respiratoryRate !== 'normal' ? `text-status-${statuses.respiratoryRate}` : ''}>
                        {reading.respiratoryRate.toFixed(0)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full font-medium
                        ${overallStatus === 'normal' ? 'bg-status-normal-bg text-status-normal' :
                          overallStatus === 'warning' ? 'bg-status-warning-bg text-status-warning' :
                          'bg-status-critical-bg text-status-critical'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusDot[overallStatus]}`} />
                        {overallStatus.charAt(0).toUpperCase() + overallStatus.slice(1)}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
