import { useEffect, useRef, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { generateSimulatedReading } from '../utils/vitalsSimulator';

const INTERVAL_SECONDS = 30;

export interface MonitorState {
  isActive: boolean;
  lastRecordedAt: Date | null;
  nextRecordingIn: number; // seconds
  error: string | null;
}

export function useAutonomousMonitor(): MonitorState {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const actorRef = useRef(actor);

  const [isActive, setIsActive] = useState(false);
  const [lastRecordedAt, setLastRecordedAt] = useState<Date | null>(null);
  const [nextRecordingIn, setNextRecordingIn] = useState(INTERVAL_SECONDS);
  const [error, setError] = useState<string | null>(null);

  // Keep actorRef in sync so the interval closure always has the latest actor
  useEffect(() => {
    actorRef.current = actor;
  }, [actor]);

  const submitReading = useCallback(async () => {
    const currentActor = actorRef.current;
    if (!currentActor) return;

    try {
      const reading = generateSimulatedReading();
      await currentActor.addVitalsReading(
        reading.heartRate,
        reading.systolicBP,
        reading.diastolicBP,
        reading.spo2,
        reading.temperature,
        reading.respiratoryRate,
      );
      setLastRecordedAt(new Date());
      setError(null);
      setNextRecordingIn(INTERVAL_SECONDS);
      // Invalidate queries so Dashboard and History refresh
      queryClient.invalidateQueries({ queryKey: ['latestReading'] });
      queryClient.invalidateQueries({ queryKey: ['allReadings'] });
      queryClient.invalidateQueries({ queryKey: ['readingsByDateRange'] });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record reading');
    }
  }, [queryClient]);

  useEffect(() => {
    if (!actor || isFetching) return;

    // Submit the first reading immediately on mount
    submitReading();
    setIsActive(true);

    // Main recording interval
    intervalRef.current = setInterval(() => {
      submitReading();
    }, INTERVAL_SECONDS * 1000);

    // Countdown ticker (every second)
    setNextRecordingIn(INTERVAL_SECONDS);
    countdownRef.current = setInterval(() => {
      setNextRecordingIn((prev) => {
        if (prev <= 1) return INTERVAL_SECONDS;
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
      setIsActive(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!actor, isFetching]);

  return { isActive, lastRecordedAt, nextRecordingIn, error };
}
