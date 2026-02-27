# Specification

## Summary
**Goal:** Make VitalWatch fully autonomous by continuously simulating and auto-recording vitals every 30 seconds without any user interaction.

**Planned changes:**
- Add backend support (reuse or extend `addVitalsReading`) to accept programmatically generated vitals records with all required fields
- Implement a `useAutonomousMonitor` custom hook that runs a background loop every 30 seconds, generating physiologically plausible vitals readings and submitting them to the backend automatically
- Mount the autonomous monitoring loop at the root layout level so it persists across all page navigations
- Add a teal pulsing "● MONITORING" status pill to the sticky header visible on all pages; pill turns grey if the loop errors
- Update the Dashboard to show a "Last recorded" timestamp and a live countdown to the next recording, and remove or replace the manual log CTA with messaging that monitoring is automatic

**User-visible outcome:** The app automatically measures and records vitals every 30 seconds from the moment it loads. Users see a live pulsing monitoring indicator in the header and a countdown timer on the dashboard — no manual logging required.
