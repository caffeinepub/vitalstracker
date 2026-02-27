import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { VitalsReading } from '../backend';

export function useLatestReading() {
  const { actor, isFetching } = useActor();

  return useQuery<VitalsReading | null>({
    queryKey: ['latestReading'],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getLatestReading();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30_000,
    staleTime: 25_000,
  });
}

export function useAllReadings() {
  const { actor, isFetching } = useActor();

  return useQuery<VitalsReading[]>({
    queryKey: ['allReadings'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllReadings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useReadingsByDateRange(startTime: bigint | null, endTime: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<VitalsReading[]>({
    queryKey: ['readingsByDateRange', startTime?.toString(), endTime?.toString()],
    queryFn: async () => {
      if (!actor || !startTime || !endTime) return [];
      return actor.getReadingsByDateRange(startTime, endTime);
    },
    enabled: !!actor && !isFetching && !!startTime && !!endTime,
  });
}

export interface AddVitalsParams {
  heartRate: number;
  systolicBP: number;
  diastolicBP: number;
  spo2: number;
  temperature: number;
  respiratoryRate: number;
}

export function useAddVitalsReading() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: AddVitalsParams) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.addVitalsReading(
        params.heartRate,
        params.systolicBP,
        params.diastolicBP,
        params.spo2,
        params.temperature,
        params.respiratoryRate
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['latestReading'] });
      queryClient.invalidateQueries({ queryKey: ['allReadings'] });
      queryClient.invalidateQueries({ queryKey: ['readingsByDateRange'] });
    },
  });
}
