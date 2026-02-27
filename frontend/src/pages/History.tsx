import { useState } from 'react';
import { Calendar, Filter, TrendingUp, Table2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { VitalsTable } from '../components/VitalsTable';
import { VitalsTrendChart } from '../components/VitalsTrendChart';
import { useAllReadings, useReadingsByDateRange } from '../hooks/useQueries';
import type { VitalsStatusMap } from '../utils/vitalsThresholds';

const CHART_CONFIGS: Array<{
  key: keyof VitalsStatusMap;
  label: string;
  unit: string;
  color: string;
  refMin?: number;
  refMax?: number;
}> = [
  { key: 'heartRate', label: 'Heart Rate', unit: 'bpm', color: '#f87171', refMin: 60, refMax: 100 },
  { key: 'systolicBP', label: 'Systolic BP', unit: 'mmHg', color: '#60a5fa', refMin: 90, refMax: 120 },
  { key: 'diastolicBP', label: 'Diastolic BP', unit: 'mmHg', color: '#818cf8', refMin: 60, refMax: 80 },
  { key: 'spo2', label: 'SpO₂', unit: '%', color: '#2dd4bf', refMin: 95, refMax: 100 },
  { key: 'temperature', label: 'Temperature', unit: '°C', color: '#fb923c', refMin: 36.1, refMax: 37.2 },
  { key: 'respiratoryRate', label: 'Respiratory Rate', unit: 'br/min', color: '#a78bfa', refMin: 12, refMax: 20 },
];

function dateToNano(dateStr: string, endOfDay = false): bigint {
  const d = new Date(dateStr);
  if (endOfDay) {
    d.setHours(23, 59, 59, 999);
  } else {
    d.setHours(0, 0, 0, 0);
  }
  return BigInt(d.getTime()) * BigInt(1_000_000);
}

export function History() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterActive, setFilterActive] = useState(false);

  const allReadingsQuery = useAllReadings();
  const filteredQuery = useReadingsByDateRange(
    filterActive && startDate ? dateToNano(startDate) : null,
    filterActive && endDate ? dateToNano(endDate, true) : null
  );

  const readings = filterActive ? (filteredQuery.data ?? []) : (allReadingsQuery.data ?? []);
  const isLoading = filterActive ? filteredQuery.isLoading : allReadingsQuery.isLoading;

  const handleApplyFilter = () => {
    if (startDate && endDate) {
      setFilterActive(true);
    }
  };

  const handleClearFilter = () => {
    setStartDate('');
    setEndDate('');
    setFilterActive(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Vitals History</h1>
        <p className="text-sm text-muted-foreground mt-1">
          View and analyze your complete vitals history with trend charts.
        </p>
      </div>

      {/* Date range filter */}
      <Card className="bg-card border-border shadow-card mb-6">
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mr-2">
              <Filter className="w-4 h-4" />
              Date Range
            </div>
            <div className="space-y-1">
              <Label htmlFor="startDate" className="text-xs text-muted-foreground">From</Label>
              <div className="relative">
                <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="pl-8 h-9 text-sm bg-input border-border w-40"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="endDate" className="text-xs text-muted-foreground">To</Label>
              <div className="relative">
                <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="pl-8 h-9 text-sm bg-input border-border w-40"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleApplyFilter}
                disabled={!startDate || !endDate}
                className="bg-teal text-navy hover:bg-teal-bright h-9"
              >
                Apply Filter
              </Button>
              {filterActive && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleClearFilter}
                  className="h-9 border-border hover:bg-secondary"
                >
                  Clear
                </Button>
              )}
            </div>
            {filterActive && (
              <span className="text-xs text-teal font-medium">
                Showing {readings.length} reading{readings.length !== 1 ? 's' : ''} in range
              </span>
            )}
            {!filterActive && !isLoading && (
              <span className="text-xs text-muted-foreground">
                {readings.length} total reading{readings.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs: Table / Charts */}
      <Tabs defaultValue="table">
        <TabsList className="bg-secondary border border-border mb-6">
          <TabsTrigger value="table" className="gap-2 data-[state=active]:bg-teal data-[state=active]:text-navy">
            <Table2 className="w-3.5 h-3.5" />
            Table View
          </TabsTrigger>
          <TabsTrigger value="charts" className="gap-2 data-[state=active]:bg-teal data-[state=active]:text-navy">
            <TrendingUp className="w-3.5 h-3.5" />
            Trend Charts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="table">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg bg-muted/30" />
              ))}
            </div>
          ) : (
            <VitalsTable readings={readings} />
          )}
        </TabsContent>

        <TabsContent value="charts">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-48 w-full rounded-xl bg-muted/30" />
              ))}
            </div>
          ) : readings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <TrendingUp className="w-10 h-10 text-muted-foreground mb-3" />
              <p className="text-muted-foreground text-sm">No data to display charts.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CHART_CONFIGS.map((cfg) => (
                <Card key={cfg.key} className="bg-card border-border shadow-card">
                  <CardHeader className="pb-2 pt-4 px-5">
                    <CardTitle className="text-sm font-semibold text-foreground">{cfg.label}</CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 pb-4">
                    <VitalsTrendChart
                      vitalKey={cfg.key}
                      label={cfg.label}
                      unit={cfg.unit}
                      readings={readings}
                      color={cfg.color}
                      refMin={cfg.refMin}
                      refMax={cfg.refMax}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
