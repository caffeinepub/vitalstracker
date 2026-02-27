/**
 * Generates physiologically plausible simulated vitals readings.
 * Values stay within normal ranges with small natural variation each cycle.
 */

// Baseline "resting" values — the simulation drifts around these
const BASELINE = {
  heartRate: 72,
  systolicBP: 115,
  diastolicBP: 75,
  spo2: 98.2,
  temperature: 36.7,
  respiratoryRate: 15,
};

// Allowed physiological ranges (must match backend validation)
const RANGES = {
  heartRate:       { min: 60,   max: 100  },
  systolicBP:      { min: 90,   max: 130  },
  diastolicBP:     { min: 60,   max: 85   },
  spo2:            { min: 95,   max: 100  },
  temperature:     { min: 36.1, max: 37.2 },
  respiratoryRate: { min: 12,   max: 20   },
};

// Per-cycle maximum drift (±) for each vital
const DRIFT = {
  heartRate:       4,
  systolicBP:      5,
  diastolicBP:     4,
  spo2:            0.5,
  temperature:     0.15,
  respiratoryRate: 2,
};

// Persistent state so values drift smoothly between cycles
let current = { ...BASELINE };

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function drift(value: number, maxDrift: number, min: number, max: number): number {
  const delta = (Math.random() * 2 - 1) * maxDrift;
  // Gentle mean-reversion: nudge back toward baseline if near edges
  const range = max - min;
  const normalised = (value - min) / range; // 0..1
  const reversion = (0.5 - normalised) * maxDrift * 0.3;
  return clamp(value + delta + reversion, min, max);
}

export interface SimulatedReading {
  heartRate: number;
  systolicBP: number;
  diastolicBP: number;
  spo2: number;
  temperature: number;
  respiratoryRate: number;
  timestamp: bigint;
}

export function generateSimulatedReading(): SimulatedReading {
  current = {
    heartRate:       drift(current.heartRate,       DRIFT.heartRate,       RANGES.heartRate.min,       RANGES.heartRate.max),
    systolicBP:      drift(current.systolicBP,      DRIFT.systolicBP,      RANGES.systolicBP.min,      RANGES.systolicBP.max),
    diastolicBP:     drift(current.diastolicBP,     DRIFT.diastolicBP,     RANGES.diastolicBP.min,     RANGES.diastolicBP.max),
    spo2:            drift(current.spo2,            DRIFT.spo2,            RANGES.spo2.min,            RANGES.spo2.max),
    temperature:     drift(current.temperature,     DRIFT.temperature,     RANGES.temperature.min,     RANGES.temperature.max),
    respiratoryRate: drift(current.respiratoryRate, DRIFT.respiratoryRate, RANGES.respiratoryRate.min, RANGES.respiratoryRate.max),
  };

  return {
    ...current,
    timestamp: BigInt(Date.now()) * BigInt(1_000_000), // nanoseconds
  };
}
