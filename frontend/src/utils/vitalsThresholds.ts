import type { VitalsReading } from '../backend';

export type VitalStatus = 'normal' | 'warning' | 'critical';

export interface VitalInfo {
  key: keyof Omit<VitalsReading, 'timestamp'>;
  label: string;
  unit: string;
  icon: string;
  format: (val: number) => string;
}

export const VITAL_INFOS: VitalInfo[] = [
  { key: 'heartRate', label: 'Heart Rate', unit: 'bpm', icon: 'heart', format: (v) => v.toFixed(0) },
  { key: 'systolicBP', label: 'Systolic BP', unit: 'mmHg', icon: 'activity', format: (v) => v.toFixed(0) },
  { key: 'diastolicBP', label: 'Diastolic BP', unit: 'mmHg', icon: 'activity', format: (v) => v.toFixed(0) },
  { key: 'spo2', label: 'SpO₂', unit: '%', icon: 'droplets', format: (v) => v.toFixed(1) },
  { key: 'temperature', label: 'Temperature', unit: '°C', icon: 'thermometer', format: (v) => v.toFixed(1) },
  { key: 'respiratoryRate', label: 'Resp. Rate', unit: 'br/min', icon: 'wind', format: (v) => v.toFixed(0) },
];

export function getHeartRateStatus(value: number): VitalStatus {
  if (value >= 60 && value <= 100) return 'normal';
  if ((value >= 50 && value < 60) || (value > 100 && value <= 120)) return 'warning';
  return 'critical';
}

export function getSystolicBPStatus(value: number): VitalStatus {
  if (value >= 90 && value <= 120) return 'normal';
  if ((value >= 80 && value < 90) || (value > 120 && value <= 140)) return 'warning';
  return 'critical';
}

export function getDiastolicBPStatus(value: number): VitalStatus {
  if (value >= 60 && value <= 80) return 'normal';
  if ((value >= 50 && value < 60) || (value > 80 && value <= 90)) return 'warning';
  return 'critical';
}

export function getSpO2Status(value: number): VitalStatus {
  if (value >= 95) return 'normal';
  if (value >= 90) return 'warning';
  return 'critical';
}

export function getTemperatureStatus(value: number): VitalStatus {
  // Celsius: normal 36.1–37.2°C
  if (value >= 36.1 && value <= 37.2) return 'normal';
  if ((value >= 35.5 && value < 36.1) || (value > 37.2 && value <= 38.3)) return 'warning';
  return 'critical';
}

export function getRespiratoryRateStatus(value: number): VitalStatus {
  if (value >= 12 && value <= 20) return 'normal';
  if ((value >= 10 && value < 12) || (value > 20 && value <= 25)) return 'warning';
  return 'critical';
}

export type VitalsStatusMap = {
  heartRate: VitalStatus;
  systolicBP: VitalStatus;
  diastolicBP: VitalStatus;
  spo2: VitalStatus;
  temperature: VitalStatus;
  respiratoryRate: VitalStatus;
};

export function evaluateVitals(reading: VitalsReading): VitalsStatusMap {
  return {
    heartRate: getHeartRateStatus(reading.heartRate),
    systolicBP: getSystolicBPStatus(reading.systolicBP),
    diastolicBP: getDiastolicBPStatus(reading.diastolicBP),
    spo2: getSpO2Status(reading.spo2),
    temperature: getTemperatureStatus(reading.temperature),
    respiratoryRate: getRespiratoryRateStatus(reading.respiratoryRate),
  };
}

export function getVitalStatus(key: keyof VitalsStatusMap, value: number): VitalStatus {
  switch (key) {
    case 'heartRate': return getHeartRateStatus(value);
    case 'systolicBP': return getSystolicBPStatus(value);
    case 'diastolicBP': return getDiastolicBPStatus(value);
    case 'spo2': return getSpO2Status(value);
    case 'temperature': return getTemperatureStatus(value);
    case 'respiratoryRate': return getRespiratoryRateStatus(value);
  }
}

export function getReferenceRange(key: keyof VitalsStatusMap): string {
  switch (key) {
    case 'heartRate': return '60–100 bpm';
    case 'systolicBP': return '90–120 mmHg';
    case 'diastolicBP': return '60–80 mmHg';
    case 'spo2': return '≥95%';
    case 'temperature': return '36.1–37.2°C';
    case 'respiratoryRate': return '12–20 br/min';
  }
}
