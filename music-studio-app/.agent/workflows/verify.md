---
description: Verify the implementation against the spec and plan.
---

1. **Load Context**:
   - Read `.gsd/PLAN.md` and `.gsd/SPEC.md`.

2. **Run Verifications**:
   - For each completed task in `PLAN.md`, re-run the verification steps if necessary to ensure no regressions.
   - Run project-level tests (e.g., `npm test`, `pytest`).

3. **Capture Evidence**:
   - If UI changes: Take a screenshot or browser recording.
   - If API/logic changes: Capture terminal output of success.

4. **Report**:
   - Summarize findings in `.gsd/JOURNAL.md` or a new `VERIFICATION_REPORT.md`.
