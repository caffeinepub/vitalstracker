import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface VitalsReading {
    respiratoryRate: number;
    temperature: number;
    spo2: number;
    systolicBP: number;
    diastolicBP: number;
    heartRate: number;
    timestamp: Time;
}
export type Time = bigint;
export interface backendInterface {
    addSimulatedReading(reading: VitalsReading): Promise<void>;
    addVitalsReading(heartRate: number, systolicBP: number, diastolicBP: number, spo2: number, temperature: number, respiratoryRate: number): Promise<void>;
    getAllReadings(): Promise<Array<VitalsReading>>;
    getLatestReading(): Promise<VitalsReading>;
    getReadingsByDateRange(startTime: Time, endTime: Time): Promise<Array<VitalsReading>>;
}
