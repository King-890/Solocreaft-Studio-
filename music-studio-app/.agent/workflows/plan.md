---
description: Create a detailed technical plan for a specific phase.
---

1. **Context Loading**:
   - Read `.gsd/SPEC.md`, `.gsd/ROADMAP.md`, `.gsd/ARCHITECTURE.md`, `.gsd/PROJECT_RULES.md`.
   - Read `.gsd/STATE.md` to check current status.

2. **Identify Phase**:
   - Determine which phase to plan (usually the next unstarted phase in ROADMAP).

3. **Draft Plan**:
   - Create (or overwrite) `.gsd/PLAN.md`.
   - **Format**: content must use the XML task structure defined in `PROJECT_RULES.md`.
   - Breaking down the phase into atomic tasks (small, verifiable steps).
   - Use `<task type="auto">` for tasks the AI can execute.
   - Use `<task type="manual">` for user actions.

4. **Review**:
   - Ask the user to review `PLAN.md`.
   - Iterate until approved.

5. **Update State**:
   - Update `.gsd/STATE.md` to "Planning Phase X Complete - Ready to Execute".
