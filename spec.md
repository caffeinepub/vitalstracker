# Specification

## Summary
**Goal:** Add a persistent healthy activity suggestion box to the bottom of the app layout in VitalWatch 24/7.

**Planned changes:**
- Create a `SuggestionBox` component with at least 10 diverse healthy activity suggestions (hydration, movement, breathing, posture, rest, etc.)
- Suggestions rotate automatically every 15–20 seconds and can be manually advanced via a "Next Suggestion" button
- Component is added to the Layout shell so it appears on every page without modifying individual pages
- Style matches the existing dark medical-grade theme: dark navy/charcoal background, teal accent text and border, subtle glow consistent with metric cards

**User-visible outcome:** A suggestion box is visible at the bottom of every page, cycling through healthy activity tips automatically, with a button to skip to the next suggestion manually.
