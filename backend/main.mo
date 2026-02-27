import Time "mo:core/Time";
import Array "mo:core/Array";
import List "mo:core/List";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Int "mo:core/Int";

actor {
  type VitalsReading = {
    timestamp : Time.Time;
    heartRate : Float;
    systolicBP : Float;
    diastolicBP : Float;
    spo2 : Float;
    temperature : Float;
    respiratoryRate : Float;
  };

  let vitalsList = List.empty<VitalsReading>();

  module VitalsReading {
    public func compare(r1 : VitalsReading, r2 : VitalsReading) : Order.Order {
      Int.compare(r1.timestamp, r2.timestamp);
    };
  };

  public shared ({ caller }) func addVitalsReading(heartRate : Float, systolicBP : Float, diastolicBP : Float, spo2 : Float, temperature : Float, respiratoryRate : Float) : async () {
    if (heartRate < 30 or heartRate > 220) { Runtime.trap("Heart rate must be between 30 and 220 bpm") };
    if (systolicBP < 70 or systolicBP > 250) { Runtime.trap("Systolic BP must be between 70 and 250 mmHg") };
    if (diastolicBP < 40 or diastolicBP > 150) { Runtime.trap("Diastolic BP must be between 40 and 150 mmHg") };
    if (spo2 < 70 or spo2 > 100) { Runtime.trap("SpO2 must be between 70 and 100%") };
    if (temperature < 30 or temperature > 45) { Runtime.trap("Temperature must be between 30 and 45°C") };
    if (respiratoryRate < 5 or respiratoryRate > 40) { Runtime.trap("Respiratory rate must be between 5 and 40 breaths/min") };

    let reading : VitalsReading = {
      timestamp = Time.now();
      heartRate;
      systolicBP;
      diastolicBP;
      spo2;
      temperature;
      respiratoryRate;
    };

    vitalsList.add(reading);
  };

  public shared ({ caller }) func addSimulatedReading(reading : VitalsReading) : async () {
    // No validation for simulated readings, just add them
    vitalsList.add(reading);
  };

  public query ({ caller }) func getLatestReading() : async VitalsReading {
    if (vitalsList.isEmpty()) { Runtime.trap("No vitals records found") };
    let sorted = vitalsList.toArray().sort();
    sorted[sorted.size() - 1];
  };

  public query ({ caller }) func getReadingsByDateRange(startTime : Time.Time, endTime : Time.Time) : async [VitalsReading] {
    vitalsList.values().toArray().filter(
      func(r) {
        r.timestamp >= startTime and r.timestamp <= endTime
      }
    );
  };

  public query ({ caller }) func getAllReadings() : async [VitalsReading] {
    vitalsList.values().toArray();
  };
};
